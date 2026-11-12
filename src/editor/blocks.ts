// Live Preview's block layer. Each block renders its own source with the reading view's <ofm-markdown>,
// so Live Preview and reading view can't drift apart. The editor element registers the components.
import { syntaxTree } from '@codemirror/language';
import { StateField } from '@codemirror/state';
import type { EditorState, Extension, Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { parse, parseDocument } from 'yaml';
import { IMAGE_EXTENSIONS } from '../ofm-inline.ts';
import { renderer, splitFrontmatter } from '../render.ts';
import type { Json } from '../sniff.ts';
import { touches, unwatchSize, watchSize } from './live-preview.ts';

/** Resolves a note's name to its source, or null if it doesn't exist. */
export type NoteLoader = (target: string) => Promise<string | null>;

const MAX_DEPTH = 4;

let loader: NoteLoader | null = null;
const cache = new Map<string, Promise<string | null>>();

/** Set the loader every editor on the page uses for note embeds, and forget loaded notes. */
export const setNoteLoader = (next: NoteLoader | null) => {
  loader = next;
  cache.clear();
};

/** Forget a loaded note, so its embeds load it again. */
export const invalidateNote = (target: string) => {
  cache.delete(target);
};

const md = renderer();

/** The part of a note an embed names: all of it, a heading's section (`Heading`) or a block (`^id`). Null if it isn't there. */
export const section = (note: string, sub = ''): string | null => {
  const { content } = splitFrontmatter(note);
  if (sub === '') return content;
  const lines = content.split('\n');
  const tokens = md.parse(content, {});
  if (sub.startsWith('^')) {
    const token = tokens.find((t) => t.map && t.attrGet('data-block-id') === sub.slice(1));
    return token?.map ? lines.slice(...token.map).join('\n') : null;
  }
  const heading = tokens.findIndex((t, i) => t.type === 'heading_open' && tokens[i + 1].content.trim() === sub.trim());
  if (heading === -1) return null;
  const { tag, map } = tokens[heading];
  // h1 < h2 as strings, so this finds the next heading of the same or a higher level.
  const next = tokens.slice(heading + 1).find((t) => t.type === 'heading_open' && t.level === 0 && t.tag <= tag);
  return lines.slice(map![0], next?.map?.[0] ?? lines.length).join('\n');
};

/**
 * The source an embed shows: a string, null when the loader says the note doesn't exist,
 * or undefined with no loader, past the depth cap, or for a note already on `stack` (a cycle).
 */
export const resolveEmbed = async (target: string, stack: readonly string[] = []): Promise<string | null | undefined> => {
  const [name, ...rest] = target.split('#');
  if (!loader || stack.length >= MAX_DEPTH || stack.includes(name)) return undefined;
  let note = cache.get(name);
  if (!note) {
    note = loader(name).catch(() => null);
    cache.set(name, note);
  }
  const source = await note;
  return source === null ? null : section(source, rest.join('#'));
};

/** Rewrite one key of a YAML front matter body, keeping comments and key order. */
export const setProperty = (yaml: string, key: string, value: Json): string => {
  const document = parseDocument(yaml);
  document.set(key, value);
  return document.toString();
};

type Markdown = HTMLElement & { value: string };

const embed = (target: string, stack: readonly string[]) => {
  const element = document.createElement('div');
  element.className = 'internal-embed markdown-embed';
  element.setAttribute('src', target);
  const link = document.createElement('a');
  link.className = 'markdown-embed-link internal-link';
  link.setAttribute('data-href', target);
  link.setAttribute('aria-label', `Open ${target}`);
  link.addEventListener('click', (event) => {
    event.preventDefault();
    link.dispatchEvent(new CustomEvent('click-wikilink', { bubbles: true, composed: true, cancelable: true, detail: { target } }));
  });
  const content = document.createElement('div');
  content.className = 'markdown-embed-content';
  element.append(link, content);
  void fill(element, content, target, stack);
  return element;
};

const placeholder = (target: string) => {
  const span = document.createElement('span');
  span.className = 'internal-embed';
  span.setAttribute('src', target);
  return span;
};

/** Load an embed's note into `content`, then its own embeds, one level deeper. */
const fill = async (element: HTMLElement, content: HTMLElement, target: string, stack: readonly string[]) => {
  content.append(placeholder(target));
  const source = await resolveEmbed(target, stack);
  if (typeof source !== 'string') {
    if (source === null) element.classList.add('is-unresolved');
    return;
  }
  const markdown = document.createElement('ofm-markdown') as Markdown;
  const inner = [...stack, target.split('#')[0]];
  markdown.addEventListener('rendered', (event) => {
    if (event.target !== markdown) return;
    for (const span of markdown.querySelectorAll('span.internal-embed[src]')) {
      span.replaceWith(embed(span.getAttribute('src') ?? '', inner));
    }
  }, { once: true });
  markdown.value = source;
  content.replaceChildren(markdown);
};

/** Put the cursor at the block's start, which reveals its source. Links and fold toggles keep working. */
const revealOnClick = (view: EditorView, element: HTMLElement) => {
  element.addEventListener('mousedown', (event) => {
    if ((event.target as Element).closest('a, summary, input, button')) return;
    event.preventDefault();
    view.dispatch({ selection: { anchor: view.posAtDOM(element) } });
    view.focus();
  });
};

class MarkdownWidget extends WidgetType {
  readonly source: string;
  readonly className: string;
  constructor(source: string, className: string) {
    super();
    this.source = source;
    this.className = className;
  }
  eq(other: MarkdownWidget) {
    return other.source === this.source && other.className === this.className;
  }
  toDOM(view: EditorView) {
    const element = document.createElement('div');
    element.className = `cm-embed-block ${this.className}`;
    const markdown = document.createElement('ofm-markdown') as Markdown;
    markdown.value = this.source;
    element.append(markdown);
    revealOnClick(view, element);
    return watchSize(view, element);
  }
  destroy(dom: HTMLElement) {
    unwatchSize(dom);
  }
}

class NoteEmbedWidget extends WidgetType {
  readonly target: string;
  constructor(target: string) {
    super();
    this.target = target;
  }
  eq(other: NoteEmbedWidget) {
    return other.target === this.target;
  }
  toDOM(view: EditorView) {
    const element = embed(this.target, []);
    element.classList.add('cm-embed-block');
    revealOnClick(view, element);
    return watchSize(view, element);
  }
  destroy(dom: HTMLElement) {
    unwatchSize(dom);
  }
}

type Frontmatter = HTMLElement & { properties: Record<string, Json>; readonly: boolean };

class PropertiesWidget extends WidgetType {
  readonly data: Record<string, Json>;
  readonly yaml: string;
  readonly readonly: boolean;
  constructor(yaml: string, data: Record<string, Json>, readonly: boolean) {
    super();
    this.yaml = yaml;
    this.data = data;
    this.readonly = readonly;
  }
  eq(other: PropertiesWidget) {
    return other.yaml === this.yaml && other.readonly === this.readonly;
  }
  toDOM(view: EditorView) {
    const container = watchSize(view, document.createElement('div'));
    container.className = 'metadata-container';
    container.innerHTML = '<details class="ofm-properties" open><summary class="ofm-properties-heading">Properties</summary><ofm-frontmatter></ofm-frontmatter></details>';
    this.updateDOM(container);
    return container;
  }
  /** Edits come back as new YAML. Updating in place keeps the row the user is in. */
  updateDOM(dom: HTMLElement) {
    const frontmatter = dom.querySelector('ofm-frontmatter') as Frontmatter | null;
    if (!frontmatter) return false;
    frontmatter.properties = this.data;
    frontmatter.readonly = this.readonly;
    return true;
  }
  ignoreEvent() {
    return true;
  }
  destroy(dom: HTMLElement) {
    unwatchSize(dom);
  }
}

/** The YAML between the front matter's --- lines, with the range it spans. */
export const frontmatterBody = (state: EditorState, node: { from: number; to: number }) => {
  const from = Math.min(state.doc.lineAt(node.from).to + 1, node.to);
  const to = Math.max(state.doc.lineAt(node.to).from, from);
  return { from, to, yaml: state.doc.sliceString(from, to) };
};

const isImage = (target: string) => IMAGE_EXTENSIONS.has(target.split('#')[0].split('.').pop()?.toLowerCase() ?? '');

type Definitions = { refs: string[]; footnotes: Map<string, string> };

const definitionsOf = (state: EditorState): Definitions => {
  const refs: string[] = [];
  const footnotes = new Map<string, string>();
  syntaxTree(state).iterate({
    enter(node) {
      if (node.name === 'LinkReference') refs.push(state.doc.sliceString(node.from, node.to));
      if (node.name === 'FootnoteDefinition') {
        const label = node.node.getChild('FootnoteLabel');
        if (label) footnotes.set(state.doc.sliceString(label.from, label.to).toLowerCase(), state.doc.sliceString(node.from, node.to));
      }
      return node.name === 'Document' || node.name.endsWith('List') || node.name === 'ListItem' || node.name === 'Blockquote';
    },
  });
  return { refs, footnotes };
};

/**
 * A block's source as a widget renders it. A slice is out of context, so the note's link reference definitions
 * and the definitions of footnotes it refers to are appended. The widget hides the footnote list they make.
 */
export const blockSource = (state: EditorState, from: number, to: number, definitions = definitionsOf(state)): string => {
  const parts = [state.doc.sliceString(from, to)];
  const used = new Set<string>();
  syntaxTree(state).iterate({
    from,
    to,
    enter(node) {
      if (node.name !== 'FootnoteRef') return;
      const label = node.node.getChild('FootnoteLabel');
      if (label) used.add(state.doc.sliceString(label.from, label.to).toLowerCase());
    },
  });
  for (const label of used) {
    const definition = definitions.footnotes.get(label);
    if (definition) parts.push(definition);
  }
  parts.push(...definitions.refs);
  return parts.join('\n\n');
};

const isCallout = (node: SyntaxNode) => node.getChild('Paragraph')?.firstChild?.name === 'CalloutMark';

/** Every block widget for the document, given its selection. Pure, so Node can test it. */
export const blockDecorations = (state: EditorState): DecorationSet => {
  const { doc } = state;
  const decorations: Range<Decoration>[] = [];
  let definitions: Definitions | undefined;
  const block = (node: SyntaxNode, widget: WidgetType) =>
    decorations.push(Decoration.replace({ widget, block: true }).range(doc.lineAt(node.from).from, doc.lineAt(node.to).to));
  const rendered = (node: SyntaxNode, className: string) =>
    block(node, new MarkdownWidget(blockSource(state, node.from, node.to, definitions ??= definitionsOf(state)), className));

  for (let node = syntaxTree(state).topNode.firstChild; node; node = node.nextSibling) {
    // Obsidian never shows front matter as source in Live Preview.
    if (node.name === 'Frontmatter') {
      const { yaml } = frontmatterBody(state, node);
      try {
        const data: unknown = parse(yaml);
        const record = typeof data === 'object' && data !== null && !Array.isArray(data) ? data as Record<string, Json> : {};
        block(node, new PropertiesWidget(yaml, record, state.readOnly));
      } catch {
        // Invalid YAML stays as source, where it can be fixed.
      }
      continue;
    }
    if (touches(state, node.from, node.to)) continue;
    switch (node.name) {
      case 'Blockquote':
        if (isCallout(node)) rendered(node, 'cm-callout');
        break;
      case 'Table':
        rendered(node, 'cm-table-widget');
        break;
      case 'BlockMath':
        rendered(node, 'math');
        break;
      case 'FencedCode':
        if (doc.sliceString(node.getChild('CodeInfo')?.from ?? 0, node.getChild('CodeInfo')?.to ?? 0) === 'mermaid') {
          rendered(node, 'cm-mermaid');
        }
        break;
      case 'Paragraph': {
        // An embed alone on its line is a block. Images stay inline widgets.
        const only = node.firstChild;
        if (only?.name !== 'Embed' || only.nextSibling || only.from !== node.from || only.to !== node.to) break;
        const target = doc.sliceString(only.from + 3, only.to - 2).split('|')[0].trim();
        if (!isImage(target)) block(node, new NoteEmbedWidget(target));
        break;
      }
    }
  }
  return Decoration.set(decorations);
};

const blockField = StateField.define<DecorationSet>({
  create: blockDecorations,
  update(decorations, tr) {
    if (tr.docChanged || tr.selection || tr.reconfigured || syntaxTree(tr.state) !== syntaxTree(tr.startState)) {
      return blockDecorations(tr.state);
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

/** Live Preview's block layer. CodeMirror only takes block decorations from state, hence a StateField. */
export const livePreviewBlocks: Extension = blockField;
