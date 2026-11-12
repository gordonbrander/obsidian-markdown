// Live Preview's inline layer: formatting hides unless the selection touches its construct, as in Obsidian.
import { syntaxTree } from '@codemirror/language';
import type { EditorState, Extension } from '@codemirror/state';
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { draw } from '../draw.ts';
import { IMAGE_EXTENSIONS } from '../ofm-inline.ts';
import { render } from '../render.ts';

type Range = { from: number; to: number };

/** True when any selection range overlaps `from`–`to`, ends included. */
export const touches = (state: EditorState, from: number, to: number) =>
  state.selection.ranges.some((range) => range.from <= to && range.to >= from);

/** True when a selection range touches any line from `from` to `to`. */
export const onLine = (state: EditorState, from: number, to = from) =>
  touches(state, state.doc.lineAt(from).from, state.doc.lineAt(to).to);

const observers = new WeakMap<Element, ResizeObserver>();

/**
 * Widgets that render asynchronously (Lit, MathJax, Mermaid, loaded notes) change height after CodeMirror measured them.
 * Remeasure when they resize, or clicks land on the wrong line. Pair with `unwatchSize` in the widget's destroy.
 */
export const watchSize = <T extends HTMLElement>(view: EditorView, element: T): T => {
  const observer = new ResizeObserver(() => view.requestMeasure());
  observer.observe(element);
  observers.set(element, observer);
  return element;
};

export const unwatchSize = (element: Element) => observers.get(element)?.disconnect();

/** A widget that renders a fragment of OFM with the reading view's renderer. */
const fragment = (source: string, tag: string, className: string) => {
  const element = document.createElement(tag);
  element.className = className;
  const template = document.createElement('template');
  template.innerHTML = render(source).replace(/^<p>([\s\S]*)<\/p>\n$/, '$1');
  element.append(template.content);
  void draw(element);
  return element;
};

class RenderedWidget extends WidgetType {
  readonly source: string;
  readonly className: string;
  constructor(source: string, className: string) {
    super();
    this.source = source;
    this.className = className;
  }
  eq(other: RenderedWidget) {
    return other.source === this.source && other.className === this.className;
  }
  toDOM(view: EditorView) {
    return watchSize(view, fragment(this.source, 'span', this.className));
  }
  destroy(dom: HTMLElement) {
    unwatchSize(dom);
  }
}

class BulletWidget extends WidgetType {
  eq() {
    return true;
  }
  toDOM() {
    const bullet = document.createElement('span');
    bullet.className = 'list-bullet';
    bullet.textContent = '•';
    return bullet;
  }
}

class HrWidget extends WidgetType {
  eq() {
    return true;
  }
  toDOM() {
    return document.createElement('hr');
  }
}

class CheckboxWidget extends WidgetType {
  readonly task: string;
  constructor(task: string) {
    super();
    this.task = task;
  }
  eq(other: CheckboxWidget) {
    return other.task === this.task;
  }
  toDOM(view: EditorView) {
    const label = document.createElement('label');
    label.className = 'task-list-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'task-list-item-checkbox';
    input.checked = this.task !== ' ';
    input.setAttribute('data-task', this.task);
    input.addEventListener('mousedown', (event) => event.preventDefault());
    input.addEventListener('click', (event) => {
      event.preventDefault();
      if (view.state.readOnly) return;
      const pos = view.posAtDOM(label) + 1;
      view.dispatch({ changes: { from: pos, to: pos + 1, insert: this.task === ' ' ? 'x' : ' ' }, userEvent: 'input' });
    });
    label.append(input);
    return label;
  }
}

/** The language label and copy button Obsidian shows on a code block's first line. */
class FlairWidget extends WidgetType {
  readonly lang: string;
  readonly code: string;
  constructor(lang: string, code: string) {
    super();
    this.lang = lang;
    this.code = code;
  }
  eq(other: FlairWidget) {
    return other.lang === this.lang && other.code === this.code;
  }
  toDOM() {
    const flair = document.createElement('span');
    flair.className = 'code-block-flair';
    flair.textContent = this.lang;
    const copy = document.createElement('button');
    copy.className = 'copy-code-button';
    copy.type = 'button';
    copy.textContent = 'Copy';
    copy.addEventListener('mousedown', (event) => event.preventDefault());
    copy.addEventListener('click', () => void navigator.clipboard?.writeText(this.code));
    const wrapper = document.createElement('span');
    wrapper.className = 'cm-code-flair';
    wrapper.append(flair, copy);
    return wrapper;
  }
}

const hide = Decoration.replace({});
const bullet = Decoration.replace({ widget: new BulletWidget() });
const hr = Decoration.replace({ widget: new HrWidget() });
const external = Decoration.mark({ class: 'external-link' });

const isImage = (target: string) => IMAGE_EXTENSIONS.has(target.split('#')[0].split('.').pop()?.toLowerCase() ?? '');

/** Every inline Live Preview decoration for `ranges` of the document. Pure, so Node can test it. */
export const inlineDecorations = (state: EditorState, ranges: readonly Range[]): DecorationSet => {
  const decorations: ReturnType<typeof hide.range>[] = [];
  const { doc } = state;
  const replace = (from: number, to: number, decoration = hide) => {
    if (to > from) decorations.push(decoration.range(from, to));
  };
  const children = (node: SyntaxNode, name: string) => node.getChildren(name);
  /** Hide the node's marks unless the selection touches the node. */
  const marks = (node: SyntaxNode, name: string) => {
    if (!touches(state, node.from, node.to)) for (const mark of children(node, name)) replace(mark.from, mark.to);
  };
  /** The mark plus one space after it, for line-start marks like # and >. */
  const withSpace = (mark: SyntaxNode) => (doc.sliceString(mark.to, mark.to + 1) === ' ' ? mark.to + 1 : mark.to);

  const tree = syntaxTree(state);
  for (const { from, to } of ranges) {
    tree.iterate({
      from,
      to,
      enter({ node }) {
        switch (node.name) {
          case 'Emphasis':
          case 'StrongEmphasis':
            marks(node, 'EmphasisMark');
            break;
          case 'Strikethrough':
            marks(node, 'StrikethroughMark');
            break;
          case 'Highlight':
            marks(node, 'HighlightMark');
            break;
          case 'InlineCode':
            marks(node, 'CodeMark');
            break;
          case 'Escape':
            if (!touches(state, node.from, node.to)) replace(node.from, node.from + 1);
            break;
          case 'Wikilink': {
            if (touches(state, node.from, node.to)) break;
            const alias = node.getChild('WikilinkAlias');
            replace(node.from, alias ? alias.from : node.from + 2);
            replace(node.to - 2, node.to);
            break;
          }
          case 'Embed': {
            const target = doc.sliceString(node.from + 3, node.to - 2).split('|')[0];
            if (isImage(target) && !touches(state, node.from, node.to)) {
              replace(node.from, node.to, Decoration.replace({
                widget: new RenderedWidget(doc.sliceString(node.from, node.to), 'cm-image-embed'),
              }));
            }
            break;
          }
          case 'Image':
            if (node.getChild('URL') && !touches(state, node.from, node.to)) {
              replace(node.from, node.to, Decoration.replace({
                widget: new RenderedWidget(doc.sliceString(node.from, node.to), 'cm-image-embed'),
              }));
            }
            return false;
          case 'Link': {
            const linkMarks = children(node, 'LinkMark');
            // [text] alone is only a link if a definition exists, which Obsidian shows as typed.
            if (linkMarks.length < 3 && !node.getChild('LinkLabel')) break;
            if (touches(state, node.from, node.to)) break;
            replace(linkMarks[0].from, linkMarks[0].to);
            replace(linkMarks[1].from, node.to);
            const url = node.getChild('URL');
            if (url && /^[a-z][a-z0-9+.-]*:/i.test(doc.sliceString(url.from, url.to)) && linkMarks[1].from > linkMarks[0].to) {
              decorations.push(external.range(linkMarks[0].to, linkMarks[1].from));
            }
            break;
          }
          case 'InlineMath':
            if (!touches(state, node.from, node.to)) {
              replace(node.from, node.to, Decoration.replace({
                widget: new RenderedWidget(doc.sliceString(node.from, node.to), 'cm-math'),
              }));
            }
            return false;
          case 'HeaderMark':
            if (node.parent?.name.startsWith('ATXHeading') && !onLine(state, node.from)) replace(node.from, withSpace(node));
            break;
          case 'QuoteMark':
            if (!onLine(state, node.from)) replace(node.from, withSpace(node));
            break;
          case 'ListMark': {
            const task = node.nextSibling?.name === 'Task' ? node.nextSibling.getChild('TaskMarker') : null;
            if (task && !touches(state, task.from, task.to)) replace(node.from, task.from);
            else if (node.parent?.parent?.name === 'BulletList') replace(node.from, node.to, bullet);
            break;
          }
          case 'TaskMarker':
            if (!touches(state, node.from, node.to)) {
              replace(node.from, node.to, Decoration.replace({
                widget: new CheckboxWidget(doc.sliceString(node.from + 1, node.to - 1)),
              }));
            }
            break;
          case 'FencedCode': {
            const info = node.getChild('CodeInfo');
            const lang = info ? doc.sliceString(info.from, info.to) : '';
            if (lang === 'mermaid' || touches(state, node.from, node.to)) return false;
            const first = doc.lineAt(node.from);
            const last = doc.lineAt(node.to);
            const text = node.getChild('CodeText');
            const code = text ? doc.sliceString(text.from, text.to) : '';
            replace(first.from, first.to, Decoration.replace({ widget: new FlairWidget(lang, code) }));
            if (last.number > first.number && node.getChildren('CodeMark').length > 1) replace(last.from, last.to);
            return false;
          }
          case 'HorizontalRule':
            if (!onLine(state, node.from)) replace(node.from, node.to, hr);
            break;
        }
      },
    });
  }
  return Decoration.set(decorations, true);
};

const inlinePlugin = ViewPlugin.fromClass(class {
  decorations: DecorationSet;
  constructor(view: EditorView) {
    this.decorations = inlineDecorations(view.state, view.visibleRanges);
  }
  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.selectionSet
      || syntaxTree(update.state) !== syntaxTree(update.startState)) {
      this.decorations = inlineDecorations(update.state, update.view.visibleRanges);
    }
  }
}, { decorations: (plugin) => plugin.decorations });

/** Live Preview's inline layer. Hidden spans are atomic, so arrow keys step over them. */
export const livePreviewInline: Extension = [
  inlinePlugin,
  EditorView.atomicRanges.of((view) => view.plugin(inlinePlugin)?.decorations ?? Decoration.none),
];
