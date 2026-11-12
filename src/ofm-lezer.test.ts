import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { Token } from 'markdown-it';
import { ofmMarkdown } from './ofm-lezer.ts';
import { renderer, splitFrontmatter } from './render.ts';
import { parseWikilink } from './sniff.ts';

const FENCE = '`'.repeat(32);
const EXAMPLE = new RegExp(`^${FENCE} example\\n([\\s\\S]*?)^${FENCE}$`, 'gm');

const md = renderer();
const { parser } = ofmMarkdown().language;

const lineOf = (src: string, pos: number) => src.slice(0, pos).split('\n').length - 1;

/** What markdown-it finds: inline constructs by content, blocks by line range. */
const markdownItFacts = (src: string) => {
  const { content } = splitFrontmatter(src);
  const offset = lineOf(src, src.length - content.length);
  const lines = content.split('\n');
  const env: { footnotes?: { refs: Map<string, number> } } = {};
  const facts: string[] = [];
  const range = (name: string, [start, end]: [number, number]) => facts.push(`${name} ${start + offset}-${end + offset}`);
  const walk = (tokens: Token[]) => {
    for (const token of tokens) {
      const meta = token.meta as { target: string; label: string } | null;
      if (token.type === 'wikilink') facts.push(`wikilink ${meta?.target}|${meta?.label}`);
      if (token.type === 'embed') facts.push(`embed ${meta?.target}`);
      if (token.type === 'tag') facts.push(`tag ${token.content}`);
      if (token.type === 'math_inline' || token.type === 'math_display') facts.push(`math ${token.content}`);
      if (token.type === 'mark_open') facts.push('highlight');
      if (token.type === 'footnote_ref') facts.push('footnote-ref');
      if (token.map && token.type === 'fence') range('fence', token.map);
      if (token.map && token.type === 'table_open') range('table', token.map);
      if (token.map && token.type === 'callout_open') range('callout', token.map);
      if (token.map && token.type === 'math_block') {
        const [start, end] = token.map;
        // markdown-it maps $$ blocks to the closer's line, not the line after it.
        range('math-block', [start, end > start && lines[end]?.includes('$$') ? end + 1 : end]);
      }
      if (token.children) walk(token.children);
    }
  };
  walk(md.parse(content, env));
  for (const label of env.footnotes?.refs.keys() ?? []) facts.push(`footnote-def ${label}`);
  return facts.sort();
};

/** The same facts, read from the Lezer tree. */
const lezerFacts = (src: string) => {
  const facts: string[] = [];
  const tree = parser.parse(src);
  const text = (node: { from: number; to: number }) => src.slice(node.from, node.to);
  const defined = new Set<string>();
  tree.iterate({
    enter(node) {
      if (node.name === 'FootnoteDefinition') defined.add(text(node.node.getChild('FootnoteLabel')!).toLowerCase());
    },
  });
  const range = (name: string, node: { from: number; to: number }) =>
    facts.push(`${name} ${lineOf(src, node.from)}-${lineOf(src, node.to) + 1}`);
  tree.iterate({
    enter(node) {
      switch (node.name) {
        case 'Wikilink': {
          const link = parseWikilink(text(node));
          facts.push(`wikilink ${link?.target}|${link?.label}`);
          break;
        }
        case 'Embed':
          facts.push(`embed ${parseWikilink(text(node).slice(1))?.target}`);
          break;
        case 'Hashtag':
          facts.push(`tag ${text(node).slice(1)}`);
          break;
        case 'InlineMath': {
          const [open, close] = node.node.getChildren('MathMark');
          facts.push(`math ${src.slice(open.to, close.from)}`);
          break;
        }
        case 'Highlight':
          facts.push('highlight');
          break;
        case 'FootnoteRef':
          if (defined.has(text(node.node.getChild('FootnoteLabel')!).toLowerCase())) facts.push('footnote-ref');
          break;
        case 'InlineFootnote':
          facts.push('footnote-ref');
          break;
        case 'FootnoteDefinition':
          facts.push(`footnote-def ${text(node.node.getChild('FootnoteLabel')!).toLowerCase()}`);
          break;
        case 'FencedCode':
          range('fence', node);
          break;
        case 'Table':
          range('table', node);
          break;
        case 'BlockMath':
          range('math-block', node);
          break;
        case 'Blockquote':
          if (node.node.getChild('Paragraph')?.firstChild?.name === 'CalloutMark') range('callout', node);
          break;
      }
    },
  });
  return facts.sort();
};

const spec = readFileSync(new URL('../SPEC.md', import.meta.url), 'utf8');

// ponytail: known divergences, each a reason the Lezer grammar is simpler than markdown-it. Fix and drop from here.
const KNOWN: Record<number, string> = {};

[...spec.matchAll(EXAMPLE)].forEach(([, body], index) => {
  const number = index + 1;
  const source = body.split(/^\.$\n?/m)[0].replaceAll('→', '\t');
  test(`Lezer matches markdown-it on SPEC Example ${number}`, { skip: KNOWN[number] }, () => {
    assert.deepEqual(lezerFacts(source), markdownItFacts(source), source);
  });
});

test('callouts, tables, $$ and fences end on the same line in both parsers', () => {
  const source = '> [!note] Title\n> body\n\n| a | b |\n| - | - |\n| 1 | 2 |\n\n$$\nx\n$$\n\n```js\nx\n```\n\n[^1]: def\n  more\n';
  assert.deepEqual(lezerFacts(source), markdownItFacts(source));
});

test('math is tokenized as TeX, as Obsidian highlights it', () => {
  const src = '$$\n\\begin{vmatrix}a & 2\\\\\n$$\n';
  const tokens: string[] = [];
  parser.parse(src).iterate({
    enter(node) {
      if (node.name.startsWith('Tex')) tokens.push(`${node.name.slice(3)} ${src.slice(node.from, node.to)}`);
    },
  });
  assert.deepEqual(tokens, [
    'Command \\begin', 'Bracket {', 'Atom vmatrix', 'Bracket }', 'Variable a', 'Command &', 'Number 2', 'Command \\\\',
  ]);
});

test('a heading folds to the next heading of its level or higher', async () => {
  const { EditorState } = await import('@codemirror/state');
  const { ensureSyntaxTree, foldable } = await import('@codemirror/language');
  const doc = '# A\nx\n## B\ny\n# C\nz';
  const state = EditorState.create({ doc, extensions: [ofmMarkdown()] });
  ensureSyntaxTree(state, doc.length, 5000);
  const fold = (line: number) => {
    const { from, to } = state.doc.line(line);
    const range = foldable(state, from, to);
    return range && state.sliceDoc(range.from, range.to);
  };
  assert.equal(fold(1), '\nx\n## B\ny');
  assert.equal(fold(3), '\ny');
});
