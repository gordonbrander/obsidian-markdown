// Live Preview's block layer. Each block renders its own source with the reading view's <ofm-markdown>,
// so Live Preview and reading view can't drift apart. The editor element registers the components.
import { syntaxTree } from '@codemirror/language';
import { Facet, StateField } from '@codemirror/state';
import type { EditorState, Extension, Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { parse, parseDocument } from 'yaml';
import { embed } from '../embeds.ts';
import type { EmbedHost } from '../embeds.ts';
import { noteService } from '../note-service.ts';
import type { NoteService } from '../note-service.ts';
import { IMAGE_EXTENSIONS } from '../ofm-inline.ts';
import type { Json } from '../sniff.ts';
import { touches, unwatchSize, watchSize } from './live-preview.ts';

/** The note service block widgets load embeds through: the editor's, or the shared `noteService`. */
export const noteServiceFacet = Facet.define<NoteService, NoteService>({
  combine: (services) => services[0] ?? noteService,
});

/** Rewrite one key of a YAML front matter body, keeping comments and key order. */
export const setProperty = (yaml: string, key: string, value: Json): string => {
  const document = parseDocument(yaml);
  document.set(key, value);
  return document.toString();
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
  readonly service: NoteService;
  constructor(source: string, className: string, service: NoteService) {
    super();
    this.source = source;
    this.className = className;
    this.service = service;
  }
  eq(other: MarkdownWidget) {
    return other.source === this.source && other.className === this.className && other.service === this.service;
  }
  toDOM(view: EditorView) {
    const element = document.createElement('div');
    element.className = `cm-embed-block ${this.className}`;
    const markdown = document.createElement('ofm-markdown') as EmbedHost;
    // Embeds inside a callout or table use the editor's service too.
    markdown.noteService = this.service;
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
  readonly service: NoteService;
  constructor(target: string, service: NoteService) {
    super();
    this.target = target;
    this.service = service;
  }
  eq(other: NoteEmbedWidget) {
    return other.target === this.target && other.service === this.service;
  }
  toDOM(view: EditorView) {
    const element = embed(this.target, this.service, []);
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
  // A widget keeps its service, so a different one assigned to the editor class re-renders the block.
  const service = state.facet(noteServiceFacet);
  const block = (node: SyntaxNode, widget: WidgetType) =>
    decorations.push(Decoration.replace({ widget, block: true }).range(doc.lineAt(node.from).from, doc.lineAt(node.to).to));
  const rendered = (node: SyntaxNode, className: string) =>
    block(node, new MarkdownWidget(blockSource(state, node.from, node.to, definitions ??= definitionsOf(state)), className, service));

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
        if (!isImage(target)) block(node, new NoteEmbedWidget(target, service));
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
