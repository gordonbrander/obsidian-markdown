// Obsidian's CodeMirror class names, so theme snippets written for Obsidian's editor apply.
import { syntaxHighlighting, syntaxTree } from '@codemirror/language';
import type { EditorState, Extension } from '@codemirror/state';
import { Decoration, ViewPlugin } from '@codemirror/view';
import type { DecorationSet, EditorView, ViewUpdate } from '@codemirror/view';
import { Tag, styleTags, tagHighlighter, tags as t } from '@lezer/highlight';
import type { MarkdownConfig } from '@lezer/markdown';

/** Token classes by node selector (see @lezer/highlight's styleTags). `/...` passes a class to children. */
const CLASSES: Record<string, string> = {
  'ATXHeading1/... SetextHeading1/...': 'cm-header cm-header-1',
  'ATXHeading2/... SetextHeading2/...': 'cm-header cm-header-2',
  'ATXHeading3/...': 'cm-header cm-header-3',
  'ATXHeading4/...': 'cm-header cm-header-4',
  'ATXHeading5/...': 'cm-header cm-header-5',
  'ATXHeading6/...': 'cm-header cm-header-6',
  'HeaderMark': 'cm-formatting cm-formatting-header',
  'Emphasis/...': 'cm-em',
  'StrongEmphasis/...': 'cm-strong',
  'Emphasis/EmphasisMark': 'cm-formatting cm-formatting-em',
  'StrongEmphasis/EmphasisMark': 'cm-formatting cm-formatting-strong',
  'Strikethrough/...': 'cm-strikethrough',
  'StrikethroughMark': 'cm-formatting cm-formatting-strikethrough',
  'Highlight/...': 'cm-highlight',
  'HighlightMark': 'cm-formatting cm-formatting-highlight',
  'InlineCode': 'cm-inline-code',
  'InlineCode/CodeMark': 'cm-formatting cm-formatting-code cm-inline-code',
  'FencedCode/CodeMark FencedCode/CodeInfo': 'cm-formatting cm-formatting-code-block cm-hmd-codeblock',
  'FencedCode/CodeText': 'cm-hmd-codeblock',
  'CodeBlock/...': 'cm-hmd-indented-code',
  'Link Image': 'cm-link',
  'Link/LinkMark Image/LinkMark': 'cm-formatting cm-formatting-link cm-link',
  'URL Autolink': 'cm-string cm-url',
  'LinkLabel': 'cm-link',
  'LinkTitle': 'cm-string',
  'Blockquote/...': 'cm-quote',
  'QuoteMark': 'cm-formatting cm-formatting-quote',
  'BulletList/ListItem/ListMark': 'cm-formatting cm-formatting-list cm-formatting-list-ul',
  'OrderedList/ListItem/ListMark': 'cm-formatting cm-formatting-list cm-formatting-list-ol',
  'TaskMarker': 'cm-formatting cm-formatting-task',
  'HorizontalRule': 'cm-hr',
  'Escape': 'cm-hmd-escape-backslash',
  'TableDelimiter': 'cm-hmd-table-sep',
  'WikilinkOpen': 'cm-formatting cm-formatting-link cm-formatting-link-start',
  'EmbedOpen': 'cm-formatting cm-formatting-link cm-formatting-link-start cm-formatting-embed',
  'WikilinkClose': 'cm-formatting cm-formatting-link cm-formatting-link-end',
  'WikilinkTarget': 'cm-hmd-internal-link',
  'Embed/WikilinkTarget': 'cm-hmd-internal-link cm-hmd-embed',
  'WikilinkPipe': 'cm-hmd-internal-link cm-link-alias-pipe',
  'WikilinkAlias': 'cm-hmd-internal-link cm-link-alias',
  'Hashtag': 'cm-hashtag cm-hashtag-end cm-meta',
  'HashtagMark': 'cm-formatting cm-formatting-hashtag cm-hashtag cm-hashtag-begin cm-meta',
  'OfmComment/... OfmCommentBlock/...': 'cm-comment',
  'InlineMath/... BlockMath/...': 'cm-math',
  'MathMark': 'cm-formatting cm-formatting-math',
  'TexCommand': 'cm-tag',
  'TexAtom': 'cm-atom',
  'TexVariable': 'cm-variable-2',
  'TexNumber': 'cm-number',
  'TexBracket': 'cm-bracket',
  'FootnoteRef/...': 'cm-footref',
  'FootnoteRef/FootnoteMark': 'cm-formatting cm-formatting-link',
  'InlineFootnote/...': 'cm-inline-footnote',
  'InlineFootnote/FootnoteMark': 'cm-formatting cm-formatting-inline-footnote',
  'FootnoteDefinition/FootnoteMark FootnoteDefinition/FootnoteLabel': 'cm-footref cm-hmd-footnote',
  'BlockId': 'cm-blockid',
  'Frontmatter/...': 'cm-hmd-frontmatter',
  'FrontmatterMark': 'cm-formatting',
  'CalloutMark': 'cm-formatting cm-callout-mark',
};

const tagFor = new Map(Object.values(CLASSES).map((name) => [name, Tag.define()]));

/** Adds the token classes to the grammar. Pass it to ofmMarkdown's `extensions`. */
export const obsidianStyleTags: MarkdownConfig = {
  props: [styleTags(Object.fromEntries(Object.entries(CLASSES).map(([selector, name]) => [selector, tagFor.get(name)!])))],
};

/** Maps the tags above, and code languages' standard tags, to class names. */
export const obsidianHighlighter = tagHighlighter([
  ...[...tagFor].map(([name, tag]) => ({ tag, class: name })),
  { tag: t.keyword, class: 'cm-keyword' },
  { tag: [t.atom, t.bool, t.null], class: 'cm-atom' },
  { tag: [t.number, t.integer, t.float], class: 'cm-number' },
  { tag: t.definition(t.variableName), class: 'cm-def' },
  { tag: t.function(t.variableName), class: 'cm-variable cm-function' },
  { tag: t.variableName, class: 'cm-variable' },
  { tag: [t.typeName, t.className, t.namespace], class: 'cm-type' },
  { tag: t.propertyName, class: 'cm-property' },
  { tag: t.operator, class: 'cm-operator' },
  { tag: t.comment, class: 'cm-comment' },
  { tag: t.string, class: 'cm-string' },
  { tag: t.regexp, class: 'cm-string-2' },
  { tag: t.meta, class: 'cm-meta' },
  { tag: t.tagName, class: 'cm-tag' },
  { tag: t.attributeName, class: 'cm-attribute' },
  { tag: t.punctuation, class: 'cm-punctuation' },
  { tag: t.standard(t.variableName), class: 'cm-builtin' },
]);

const HEADING = /^(?:ATX|Setext)Heading(\d)$/;

type Lines = Map<number, { classes: Set<string>; task?: string }>;

/** Drop the classes matching `pattern`, so an inner block's class replaces an outer one's. */
const drop = (entry: { classes: Set<string> }, pattern: RegExp) => {
  for (const name of entry.classes) if (pattern.test(name)) entry.classes.delete(name);
};

const add = (lines: Lines, line: number, ...classes: string[]) => {
  const entry = lines.get(line) ?? { classes: new Set() };
  for (const name of classes) entry.classes.add(name);
  lines.set(line, entry);
  return entry;
};

/** Obsidian's line classes (HyperMD-*, cm-active) for the lines in `ranges`. Pure, so Node can test it. */
export const lineClasses = (state: EditorState, ranges: readonly { from: number; to: number }[]): DecorationSet => {
  const { doc } = state;
  const lines: Lines = new Map();
  const each = (from: number, to: number, fn: (line: number, index: number, last: boolean) => void) => {
    const first = doc.lineAt(from).number;
    const end = doc.lineAt(to).number;
    for (let line = first; line <= end; line++) fn(line, line - first, line === end);
  };
  const tree = syntaxTree(state);
  for (const { from, to } of ranges) {
    tree.iterate({
      from,
      to,
      enter(node) {
        const name = node.name;
        const heading = HEADING.exec(name);
        if (heading) {
          each(node.from, node.to, (line) => add(lines, line, 'HyperMD-header', `HyperMD-header-${heading[1]}`));
        } else if (name === 'Blockquote') {
          let depth = 0;
          for (let n: typeof node.node | null = node.node; n; n = n.parent) if (n.name === 'Blockquote') depth++;
          const callout = node.node.getChild('Paragraph')?.firstChild?.name === 'CalloutMark';
          each(node.from, node.to, (line) => {
            drop(add(lines, line, 'HyperMD-quote', ...(callout ? ['HyperMD-callout'] : [])), /^HyperMD-quote-\d/);
            add(lines, line, `HyperMD-quote-${depth}`);
          });
        } else if (name === 'ListItem') {
          let depth = 0;
          for (let n = node.node.parent; n; n = n.parent) if (n.name === 'BulletList' || n.name === 'OrderedList') depth++;
          each(node.from, node.to, (line, index) => {
            // Children come after parents, so a nested item's first line replaces its parent's nobullet.
            if (index === 0) drop(add(lines, line, 'HyperMD-list-line'), /^HyperMD-list-line-/);
            add(lines, line, 'HyperMD-list-line', index === 0 ? `HyperMD-list-line-${depth}` : 'HyperMD-list-line-nobullet');
          });
          const marker = node.node.getChild('Task')?.getChild('TaskMarker');
          if (marker) {
            const entry = add(lines, doc.lineAt(marker.from).number, 'HyperMD-task-line');
            entry.task = doc.sliceString(marker.from + 1, marker.to - 1);
          }
        } else if (name === 'FencedCode') {
          each(node.from, node.to, (line, index, last) => {
            add(lines, line, 'HyperMD-codeblock', 'HyperMD-codeblock-bg');
            if (index === 0) add(lines, line, 'HyperMD-codeblock-begin', 'HyperMD-codeblock-begin-bg');
            if (last) add(lines, line, 'HyperMD-codeblock-end', 'HyperMD-codeblock-end-bg');
          });
        } else if (name === 'HorizontalRule') {
          add(lines, doc.lineAt(node.from).number, 'HyperMD-hr');
        } else if (name === 'FootnoteDefinition') {
          each(node.from, node.to, (line) => add(lines, line, 'HyperMD-footnote'));
        } else if (name === 'Table') {
          each(node.from, node.to, (line, index) => add(lines, line, 'HyperMD-table-row', `HyperMD-table-row-${index}`));
        } else if (name === 'Frontmatter') {
          each(node.from, node.to, (line) => add(lines, line, 'HyperMD-frontmatter'));
        }
      },
    });
  }
  for (const range of state.selection.ranges) add(lines, doc.lineAt(range.head).number, 'cm-active');

  return Decoration.set([...lines].sort(([a], [b]) => a - b).map(([line, { classes, task }]) =>
    Decoration.line({
      class: [...classes].join(' '),
      attributes: task === undefined ? undefined : { 'data-task': task },
    }).range(doc.line(line).from)));
};

const linePlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) {
    this.decorations = lineClasses(view.state, view.visibleRanges);
  }
  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.selectionSet
      || syntaxTree(update.state) !== syntaxTree(update.startState)) {
      this.decorations = lineClasses(update.state, update.view.visibleRanges);
    }
  }
}, { decorations: (plugin) => plugin.decorations });

/** Token and line classes. Together they make Source mode. */
export const obsidianClasses: Extension = [syntaxHighlighting(obsidianHighlighter), linePlugin];
