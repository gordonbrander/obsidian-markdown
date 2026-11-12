// Obsidian Flavored Markdown for Lezer, the parser CodeMirror reads. markdown-it stays the reference:
// ofm-lezer.test.ts checks that both find the same constructs in every SPEC example.
import {
  Language, LanguageDescription, LanguageSupport, ParseContext, defineLanguageFacet, foldNodeProp, foldService,
  indentNodeProp, languageDataProp, syntaxTree,
} from '@codemirror/language';
import type { Input, NodeType, SyntaxNode } from '@lezer/common';
import { Autolink, Strikethrough, Table, parseCode, parser as commonmark } from '@lezer/markdown';
import type { BlockContext, Element, InlineContext, LeafBlock, Line, MarkdownConfig } from '@lezer/markdown';
import { CALLOUT } from './ofm-core.ts';
import { ALL_DIGITS, TAG } from './ofm-inline.ts';
import { splitFrontmatter } from './render.ts';
import { parseWikilink } from './sniff.ts';

const SPACE = /\s|^$/;
const PUNCTUATION = /[\p{P}\p{S}]/u;

const lineEnd = (cx: InlineContext, pos: number) => {
  const index = cx.text.indexOf('\n', pos - cx.offset);
  return index === -1 ? cx.end : index + cx.offset;
};

/** Index of `needle` between `from` and the end of its line, or -1. */
const indexInLine = (cx: InlineContext, needle: string, from: number) => {
  const index = cx.slice(from, lineEnd(cx, from)).indexOf(needle);
  return index === -1 ? -1 : from + index;
};

const isSpaceBefore = (cx: InlineContext, pos: number) => pos === cx.offset || SPACE.test(cx.slice(pos - 1, pos));

const TEX = /\\(?:[a-zA-Z@]+|[^a-zA-Z])|[{}[\]()]|\d+(?:\.\d+)?|[a-zA-Z]+|&/g;

/**
 * TeX tokens inside math, for highlighting as Obsidian's stex mode does: commands, `&` and `\\` are TexCommand,
 * an environment name after \begin or \end is TexAtom, letters TexVariable, numbers TexNumber, brackets TexBracket.
 */
const texTokens = (cx: InlineContext | BlockContext, text: string, offset: number): Element[] => {
  const tokens: Element[] = [];
  let environment = false;
  for (const { 0: token, index } of text.matchAll(TEX)) {
    const from = offset + index;
    const to = from + token.length;
    if (token[0] === '\\' || token === '&') {
      tokens.push(cx.elt('TexCommand', from, to));
      environment = token === '\\begin' || token === '\\end';
      continue;
    }
    const type = /^\d/.test(token) ? 'TexNumber' : /^[a-zA-Z]/.test(token) ? (environment ? 'TexAtom' : 'TexVariable') : 'TexBracket';
    tokens.push(cx.elt(type, from, to));
    if (token === '}') environment = false;
  }
  return tokens;
};

/** `[[target|alias]]` or, with a leading `!`, an embed. `from` is the first character, `open` the length of `[[` or `![[`. */
const link = (cx: InlineContext, type: 'Wikilink' | 'Embed', from: number, open: number) => {
  const bodyFrom = from + open;
  const close = indexInLine(cx, ']]', bodyFrom);
  if (close === -1 || !parseWikilink(cx.slice(bodyFrom - 2, close + 2))) return -1;
  const pipe = cx.slice(bodyFrom, close).search(/\\?\|/);
  const children = [cx.elt(type === 'Embed' ? 'EmbedOpen' : 'WikilinkOpen', from, bodyFrom)];
  if (pipe === -1) {
    children.push(cx.elt('WikilinkTarget', bodyFrom, close));
  } else {
    const pipeFrom = bodyFrom + pipe;
    const aliasFrom = pipeFrom + (cx.char(pipeFrom) === 92 ? 2 : 1);
    children.push(cx.elt('WikilinkTarget', bodyFrom, pipeFrom), cx.elt('WikilinkPipe', pipeFrom, aliasFrom));
    if (aliasFrom < close) children.push(cx.elt('WikilinkAlias', aliasFrom, close));
  }
  children.push(cx.elt('WikilinkClose', close, close + 2));
  return cx.addElement(cx.elt(type, from, close + 2, children));
};

const HighlightDelimiter = { resolve: 'Highlight', mark: 'HighlightMark' };

/** Index of the `]` that closes the `[` at `open`, or -1. */
const closingBracket = (cx: InlineContext, open: number) => {
  for (let pos = open + 1, depth = 1; pos < cx.end; pos++) {
    const ch = cx.char(pos);
    if (ch === 92) pos++;
    else if (ch === 91) depth++;
    else if (ch === 93 && --depth === 0) return pos;
  }
  return -1;
};

const inline: MarkdownConfig = {
  defineNodes: [
    'Wikilink', 'Embed', 'WikilinkOpen', 'EmbedOpen', 'WikilinkTarget', 'WikilinkPipe', 'WikilinkAlias', 'WikilinkClose',
    'Hashtag', 'HashtagMark', 'Highlight', 'HighlightMark', 'OfmComment', 'CommentMark', 'InlineMath', 'MathMark',
    'FootnoteRef', 'FootnoteMark', 'FootnoteLabel', 'InlineFootnote', 'BlockId', 'CalloutMark',
    'TexCommand', 'TexAtom', 'TexVariable', 'TexNumber', 'TexBracket',
  ],
  parseInline: [
    {
      // [!type] opening a paragraph. A callout is a blockquote whose first paragraph opens with one (SPEC 6.4).
      name: 'CalloutMark',
      parse(cx, next, pos) {
        if (next !== 91 || pos !== cx.offset || cx.char(pos + 1) !== 33) return -1;
        const first = cx.slice(pos, lineEnd(cx, pos));
        if (!CALLOUT.test(first)) return -1;
        // The mark takes the fold sign too: [!tip]+.
        const end = first.indexOf(']') + 1;
        return cx.addElement(cx.elt('CalloutMark', pos, pos + end + (/[+-]/.test(first[end] ?? '') ? 1 : 0)));
      },
      before: 'Link',
    },
    {
      name: 'Wikilink',
      parse: (cx, next, pos) => (next === 91 && cx.char(pos + 1) === 91 ? link(cx, 'Wikilink', pos, 2) : -1),
      before: 'Link',
    },
    {
      name: 'Embed',
      parse: (cx, next, pos) =>
        next === 33 && cx.char(pos + 1) === 91 && cx.char(pos + 2) === 91 ? link(cx, 'Embed', pos, 3) : -1,
      before: 'Image',
    },
    {
      name: 'FootnoteRef',
      parse(cx, next, pos) {
        if (next !== 91 || cx.char(pos + 1) !== 94) return -1;
        let end = pos + 2;
        while (end < cx.end && cx.char(end) !== 93) {
          if (SPACE.test(cx.slice(end, end + 1))) return -1;
          end++;
        }
        if (end === pos + 2 || end >= cx.end) return -1;
        return cx.addElement(cx.elt('FootnoteRef', pos, end + 1, [
          cx.elt('FootnoteMark', pos, pos + 2),
          cx.elt('FootnoteLabel', pos + 2, end),
          cx.elt('FootnoteMark', end, end + 1),
        ]));
      },
      before: 'Link',
    },
    {
      // ^[inline footnote] and a ^block-id at the end of a paragraph.
      name: 'Caret',
      parse(cx, next, pos) {
        if (next !== 94) return -1;
        if (cx.char(pos + 1) === 91) {
          const close = closingBracket(cx, pos + 1);
          if (close === -1) return -1;
          return cx.addElement(cx.elt('InlineFootnote', pos, close + 1, [
            cx.elt('FootnoteMark', pos, pos + 2),
            ...cx.parser.parseInline(cx.slice(pos + 2, close), pos + 2),
            cx.elt('FootnoteMark', close, close + 1),
          ]));
        }
        if (!isSpaceBefore(cx, pos)) return -1;
        const id = /^\^[A-Za-z0-9-]+(?=[ \t]*$)/.exec(cx.slice(pos, cx.end));
        return id ? cx.addElement(cx.elt('BlockId', pos, pos + id[0].length)) : -1;
      },
      before: 'Link',
    },
    {
      // Runs of tags like #a#b are one parse, since a tag may follow a tag with no space.
      name: 'Hashtag',
      parse(cx, next, pos) {
        if (next !== 35 || !isSpaceBefore(cx, pos)) return -1;
        let end = pos;
        for (;;) {
          TAG.lastIndex = end - cx.offset;
          const match = TAG.exec(cx.text);
          if (!match || ALL_DIGITS.test(match[1])) break;
          cx.addElement(cx.elt('Hashtag', end, end + match[0].length, [cx.elt('HashtagMark', end, end + 1)]));
          end += match[0].length;
        }
        return end === pos ? -1 : end;
      },
    },
    {
      name: 'OfmComment',
      parse(cx, next, pos) {
        if (next !== 37 || cx.char(pos + 1) !== 37) return -1;
        const close = indexInLine(cx, '%%', pos + 2);
        if (close === -1) return -1;
        return cx.addElement(cx.elt('OfmComment', pos, close + 2, [
          cx.elt('CommentMark', pos, pos + 2),
          cx.elt('CommentMark', close, close + 2),
        ]));
      },
      before: 'Emphasis',
    },
    {
      name: 'InlineMath',
      parse(cx, next, pos) {
        if (next !== 36) return -1;
        let size = 1;
        let close: number;
        if (cx.char(pos + 1) === 36) {
          size = 2;
          close = indexInLine(cx, '$$', pos + 2);
          if (close <= pos + 2) return -1;
        } else {
          if (SPACE.test(cx.slice(pos + 1, pos + 2))) return -1;
          close = indexInLine(cx, '$', pos + 1);
          while (close !== -1 && /[\s\\]/.test(cx.slice(close - 1, close))) close = indexInLine(cx, '$', close + 1);
          if (close === -1) return -1;
        }
        return cx.addElement(cx.elt('InlineMath', pos, close + size, [
          cx.elt('MathMark', pos, pos + size),
          ...texTokens(cx, cx.slice(pos + size, close), pos + size),
          cx.elt('MathMark', close, close + size),
        ]));
      },
      before: 'Emphasis',
    },
    {
      name: 'Highlight',
      parse(cx, next, pos) {
        if (next !== 61) return -1;
        let end = pos;
        while (cx.char(end) === 61) end++;
        // Whole runs are consumed, so === can't be read as == followed by =.
        if (end - pos !== 2) return end;
        const before = cx.slice(pos - 1, pos);
        const after = cx.slice(end, end + 1);
        const spaceBefore = SPACE.test(before);
        const spaceAfter = SPACE.test(after);
        const punctBefore = PUNCTUATION.test(before);
        const punctAfter = PUNCTUATION.test(after);
        return cx.addDelimiter(HighlightDelimiter, pos, end,
          !spaceAfter && (!punctAfter || spaceBefore || punctBefore),
          !spaceBefore && (!punctBefore || spaceAfter || punctAfter));
      },
      after: 'Emphasis',
    },
  ],
};

// ponytail: Line.depth is internal, but Lezer's own FencedCode reads it the same way. False once the line leaves the container.
const inContainer = (cx: BlockContext, line: Line) => (line as unknown as { depth: number }).depth >= cx.depth;

const startsWithMarker = (line: Line, marker: string) =>
  line.indent - line.baseIndent < 4 && line.text.startsWith(marker, line.pos)
  && line.text.indexOf(marker, line.pos + marker.length) === -1;

/**
 * A `$$` or `%%` block: a marker at the start of a line that runs past blank lines to the next marker (SPEC 5.2, 5.3).
 * A closer on the opening line means it isn't a block, and inline parsing handles the line.
 */
const fenced = (name: string, marker: string) => ({
  name,
  parse(cx: BlockContext, line: Line) {
    if (!startsWithMarker(line, marker)) return false;
    const from = cx.lineStart + line.pos;
    const math = name === 'BlockMath';
    const marks: Element[] = [cx.elt(math ? 'MathMark' : 'CommentMark', from, from + 2)];
    if (math) marks.push(...texTokens(cx, line.text.slice(line.pos + 2), from + 2));
    while (cx.nextLine() && inContainer(cx, line)) {
      marks.push(...line.markers);
      const close = line.text.indexOf(marker, line.pos);
      if (math) {
        const end = close === -1 ? line.text.length : close;
        marks.push(...texTokens(cx, line.text.slice(line.pos, end), cx.lineStart + line.pos));
      }
      if (close !== -1) {
        marks.push(cx.elt(name === 'BlockMath' ? 'MathMark' : 'CommentMark', cx.lineStart + close, cx.lineStart + close + 2));
        cx.nextLine();
        break;
      }
    }
    cx.addElement(cx.elt(name, from, cx.prevLineEnd(), marks));
    return true;
  },
  endLeaf: (_cx: BlockContext, line: Line) => startsWithMarker(line, marker),
});

// Lines that end a paragraph, and so a footnote definition's lazy continuation.
const INTERRUPT = /^(?:#{1,6}(?:\s|$)|>|```|~~~|[-*+][ \t]|1[.)][ \t]|(?:[-*_][ \t]*){3,}$|\$\$|%%|\[\^[^\]\s]+\]:)/;
const FOOTNOTE_DEFINITION = /^\[\^([^\]\s]+)\]:/;

// A leaf block: continuation lines are indented 2 spaces, or follow on directly (SPEC 6.3).
const footnoteDefinition = {
  name: 'FootnoteDefinition',
  parse(cx: BlockContext, line: Line) {
    if (line.indent - line.baseIndent >= 4) return false;
    const match = FOOTNOTE_DEFINITION.exec(line.text.slice(line.pos));
    if (!match) return false;
    const from = cx.lineStart + line.pos;
    const labelEnd = from + 2 + match[1].length;
    const children: Element[] = [
      cx.elt('FootnoteMark', from, from + 2),
      cx.elt('FootnoteLabel', from + 2, labelEnd),
      cx.elt('FootnoteMark', labelEnd, labelEnd + 2),
      ...cx.parser.parseInline(line.text.slice(line.pos + match[0].length), labelEnd + 2),
    ];
    let to = cx.lineStart + line.text.length;
    let afterBlank = false;
    while (cx.nextLine() && inContainer(cx, line)) {
      const blank = line.pos === line.text.length;
      const indented = line.indent - line.baseIndent >= 2;
      if (blank) {
        afterBlank = true;
        continue;
      }
      if (!indented && (afterBlank || INTERRUPT.test(line.text.slice(line.pos)))) break;
      afterBlank = false;
      children.push(...line.markers, ...cx.parser.parseInline(line.text.slice(line.pos), cx.lineStart + line.pos));
      to = cx.lineStart + line.text.length;
    }
    cx.addElement(cx.elt('FootnoteDefinition', from, to, children));
    return true;
  },
  before: 'LinkReference',
};

// Only at the very start of the note, with a closing ---, as render.ts's splitFrontmatter reads it (SPEC 4).
const frontmatter = {
  name: 'Frontmatter',
  parse(cx: BlockContext, line: Line) {
    if (cx.lineStart !== 0 || !/^﻿?---[ \t]*$/.test(line.text)) return false;
    // ponytail: BlockContext.input is internal. A closer can be any distance away, and nextLine can't go back.
    const { input } = cx as unknown as { input: Input };
    const head = input.read(0, input.length);
    const length = head.length - splitFrontmatter(head).content.length;
    if (length === 0) return false;
    const marks = [cx.elt('FrontmatterMark', 0, line.text.length)];
    while (cx.nextLine()) {
      if (cx.lineStart + line.text.length + 1 >= length) {
        marks.push(cx.elt('FrontmatterMark', cx.lineStart, cx.lineStart + line.text.length));
        cx.nextLine();
        break;
      }
    }
    cx.addElement(cx.elt('Frontmatter', 0, cx.prevLineEnd(), marks));
    return true;
  },
  before: 'HorizontalRule',
};

const TASK = /^\[[^\n]\](?=[ \t]|$)/u;

// GFM's TaskList only takes [ ] and [x]. Obsidian takes any character (SPEC 6.2).
const taskList: MarkdownConfig = {
  defineNodes: [{ name: 'Task', block: true }, 'TaskMarker'],
  parseBlock: [{
    name: 'TaskList',
    leaf(cx: BlockContext, leaf: LeafBlock) {
      const match = TASK.exec(leaf.content);
      if (!match || cx.parentType().name !== 'ListItem') return null;
      return {
        nextLine: () => false,
        finish(cx: BlockContext, leaf: LeafBlock) {
          const size = match[0].length;
          cx.addLeafElement(leaf, cx.elt('Task', leaf.start, leaf.start + leaf.content.length, [
            cx.elt('TaskMarker', leaf.start, leaf.start + size),
            ...cx.parser.parseInline(leaf.content.slice(size), leaf.start + size),
          ]));
          return true;
        },
      };
    },
    after: 'SetextHeading',
  }],
};

const blocks: MarkdownConfig = {
  defineNodes: [
    { name: 'Frontmatter', block: true }, 'FrontmatterMark',
    { name: 'BlockMath', block: true }, { name: 'OfmCommentBlock', block: true }, { name: 'FootnoteDefinition', block: true },
  ],
  parseBlock: [frontmatter, fenced('BlockMath', '$$'), fenced('OfmCommentBlock', '%%'), footnoteDefinition],
  // render.ts escapes raw HTML, so it's plain text here too.
  remove: ['HTMLBlock', 'HTMLTag'],
};

/** Every Markdown extension the editor parses with: GFM, except its task list, plus OFM. */
export const ofmExtensions: MarkdownConfig[] = [Table, Strikethrough, Autolink, taskList, inline, blocks];

const HEADING = /^(?:ATX|Setext)Heading(\d)$/;
const headingLevel = (type: NodeType) => Number(HEADING.exec(type.name)?.[1] ?? 0);

/** A heading folds to the next heading of its level or higher, as in Obsidian. */
const headingFold = foldService.of((state, start, end) => {
  for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(end, -1); node && node.from >= start; node = node.parent) {
    const level = headingLevel(node.type);
    if (!level) continue;
    let last = node;
    for (let next = last.nextSibling; next && !(headingLevel(next.type) && headingLevel(next.type) <= level); next = next.nextSibling) {
      last = next;
    }
    return last.to > end ? { from: end, to: last.to } : null;
  }
  return null;
});

/** A fenced block's info string names its language. Unloaded languages load, and the block reparses when they arrive. */
const codeParser = (languages: readonly LanguageDescription[]) => (info: string) => {
  const found = LanguageDescription.matchLanguageName(languages, /\S*/.exec(info)![0], true);
  if (!found) return null;
  return found.support ? found.support.language.parser : ParseContext.getSkippingParser(found.load());
};

const data = defineLanguageFacet({ commentTokens: { block: { open: '%%', close: '%%' } } });
const isList = (type: NodeType) => type.name === 'OrderedList' || type.name === 'BulletList';

// Block folding and indentation, as lang-markdown sets them up. Headings fold through headingFold.
const languageProps: MarkdownConfig = {
  props: [
    foldNodeProp.add((type) => (!type.is('Block') || type.is('Document') || headingLevel(type) || isList(type)
      ? undefined
      : (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to }))),
    indentNodeProp.add({ Document: () => null }),
    languageDataProp.add({ Document: data }),
  ],
};

/**
 * The Markdown language for OFM. `extensions` add to the grammar, e.g. styleTags.
 * Built on @lezer/markdown directly, not @codemirror/lang-markdown, which imports lang-html and so would load
 * the HTML, CSS and JavaScript grammars up front for HTML tags we escape anyway.
 */
export const ofmMarkdown = ({ codeLanguages = [], extensions = [] }: {
  codeLanguages?: readonly LanguageDescription[];
  extensions?: MarkdownConfig[];
} = {}): LanguageSupport => {
  const parser = commonmark.configure([
    languageProps,
    ...ofmExtensions,
    ...extensions,
    parseCode({ codeParser: codeParser(codeLanguages) }),
  ]);
  return new LanguageSupport(new Language(data, parser, [], 'markdown'), headingFold);
};
