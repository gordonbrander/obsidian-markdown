import { foldGutter, syntaxTree } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Annotation, Compartment, EditorSelection, EditorState } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';
import type { SyntaxNode } from '@lezer/common';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import './ofm-frontmatter.ts';
import type { ProprowChangeDetail } from './ofm-frontmatter.ts';
import './ofm-markdown.ts';
import { frontmatterBody, invalidateNote, livePreviewBlocks, setNoteLoader, setProperty } from '../editor/blocks.ts';
import type { NoteLoader } from '../editor/blocks.ts';
import { obsidianClasses, obsidianStyleTags } from '../editor/classes.ts';
import { editing } from '../editor/keymap.ts';
import type { Completions } from '../editor/keymap.ts';
import { livePreviewInline, touches } from '../editor/live-preview.ts';
import { ofmMarkdown } from '../ofm-lezer.ts';
import { parseWikilink } from '../sniff.ts';

export type { Completions, NoteLoader };
export type EditorInputDetail = { value: string };
export type EditorClickWikilinkDetail = { target: string };
export type EditorToggleReadingDetail = { value: string };
export type EditorMode = 'live' | 'source';

/** Changes made by setting `value`, which don't fire `input`. */
const external = Annotation.define<boolean>();

/** An attribute that defaults to on, so `readable-line-width="false"` turns it off. */
const defaultOn = { fromAttribute: (value: string | null) => value !== 'false', toAttribute: (value: boolean) => String(value) };
/** An enumerated attribute like the global spellcheck: present means on, unless it's "false". */
const presentOn = { fromAttribute: (value: string | null) => value !== null && value !== 'false' };

const livePreview: Extension = [livePreviewInline, livePreviewBlocks];

/**
 * A Markdown editor that looks and works like Obsidian's: Live Preview by default, Source mode as an option.
 * Register its note embeds with `OfmMarkdownEditor.setNoteLoader(loader)`.
 * @fires input - The document changed. `detail.value` is the whole note.
 * @fires change - On blur, when the text changed since focus. `detail.value` is the whole note.
 * @fires click-wikilink - A wikilink was clicked: in Live Preview a plain click, in Source mode Cmd/Ctrl-click. `detail.target` is the link target. Cancelable.
 * @fires proprow-change - A property was edited. Bubbles from its row. The editor has already rewritten the front matter.
 * @fires toggle-reading - Mod-E asked for Reading view, as it does in Obsidian. Show the note in `<ofm-note>`. `detail.value` is the whole note.
 */
@customElement('ofm-markdown-editor')
export class OfmMarkdownEditor extends LitElement {
  /** Set the loader every editor on the page uses for note embeds like `![[Note]]`, and forget loaded notes. */
  static setNoteLoader(loader: NoteLoader | null) {
    setNoteLoader(loader);
  }

  /** Forget a loaded note when the host knows it changed, so embeds load it again. */
  static invalidateNote(target: string) {
    invalidateNote(target);
  }

  /** No shadow root, so the page's theme and Obsidian snippets reach the editor. */
  protected createRenderRoot() {
    return this;
  }

  /** The whole note, front matter included. Setting it doesn't fire `input`. */
  @property() accessor value = '';
  @property({ reflect: true }) accessor mode: EditorMode = 'live';
  @property({ type: Boolean }) accessor readonly = false;
  @property({ attribute: 'readable-line-width', converter: defaultOn }) accessor readableLineWidth = true;
  @property({ converter: presentOn }) override accessor spellcheck = false;
  @property() accessor placeholder = '';
  /** Powers `[[` and `#` autocomplete. With none, there's no popup. */
  @property({ attribute: false }) accessor completions: Completions | null = null;

  #view?: EditorView;
  #mode = new Compartment();
  #options = new Compartment();
  #focusValue: string | null = null;

  /** The CodeMirror view, for hosts that need more. */
  get view(): EditorView | undefined {
    return this.#view;
  }

  #modeExtension() {
    return this.mode === 'source' ? [] : livePreview;
  }

  #optionsExtension() {
    return [
      EditorState.readOnly.of(this.readonly),
      EditorView.editable.of(!this.readonly),
      EditorView.contentAttributes.of({ spellcheck: String(this.spellcheck) }),
      this.placeholder ? placeholder(this.placeholder) : [],
    ];
  }

  #toggleReading = () => {
    this.dispatchEvent(new CustomEvent<EditorToggleReadingDetail>('toggle-reading', {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
    return true;
  };

  #clickWikilink(target: string) {
    return this.dispatchEvent(new CustomEvent<EditorClickWikilinkDetail>('click-wikilink', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { target },
    }));
  }

  /** Follow a link under the pointer: in Live Preview when it isn't being edited, in Source mode with Cmd/Ctrl. */
  #onMousedown = (event: MouseEvent, view: EditorView) => {
    if (event.button !== 0) return false;
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos === null) return false;
    const { state } = view;
    for (let node: SyntaxNode | null = syntaxTree(state).resolveInner(pos, 1); node; node = node.parent) {
      if (!['Wikilink', 'Link', 'URL'].includes(node.name)) continue;
      const follow = event.metaKey || event.ctrlKey || (this.mode !== 'source' && !touches(state, node.from, node.to));
      if (!follow) return false;
      const text = state.sliceDoc(node.from, node.to);
      if (node.name === 'Wikilink') {
        const link = parseWikilink(text);
        if (link) this.#clickWikilink(link.target);
      } else {
        const url = node.name === 'URL' ? text : state.sliceDoc(node.getChild('URL')?.from ?? 0, node.getChild('URL')?.to ?? 0);
        if (/^(https?:|mailto:)/i.test(url)) window.open(url, '_blank', 'noopener');
        else if (url.startsWith('www.')) window.open(`https://${url}`, '_blank', 'noopener');
      }
      event.preventDefault();
      return true;
    }
    return false;
  };

  /** Apply a Properties edit by rewriting that key of the front matter. */
  #onProprowChange = ({ detail: { key, value } }: CustomEvent<ProprowChangeDetail>) => {
    const view = this.#view;
    const node = view && syntaxTree(view.state).topNode.firstChild;
    if (!view || node?.name !== 'Frontmatter') return;
    const { from, to, yaml } = frontmatterBody(view.state, node);
    view.dispatch({ changes: { from, to, insert: setProperty(yaml, key, value) }, userEvent: 'input' });
  };

  #onUpdate = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const value = update.state.doc.toString();
      this.value = value;
      if (!update.transactions.some((tr) => tr.annotation(external))) {
        this.dispatchEvent(new CustomEvent<EditorInputDetail>('input', { bubbles: true, composed: true, detail: { value } }));
      }
    }
    if (update.focusChanged) {
      const value = update.state.doc.toString();
      if (update.view.hasFocus) {
        this.#focusValue = value;
      } else if (this.#focusValue !== null && this.#focusValue !== value) {
        this.#focusValue = null;
        this.dispatchEvent(new CustomEvent<EditorInputDetail>('change', { bubbles: true, composed: true, detail: { value } }));
      }
    }
  });

  constructor() {
    super();
    // The editor's own input and change events, and those of the Properties inputs, would look like ours.
    for (const type of ['input', 'change']) {
      this.addEventListener(type, (event) => {
        if (event.target !== this) event.stopPropagation();
      });
    }
    this.addEventListener('proprow-change', this.#onProprowChange as EventListener);
  }

  #createView() {
    const parent = this.querySelector<HTMLElement>('.markdown-source-view')!;
    parent.replaceChildren();
    this.#view = new EditorView({
      parent,
      state: EditorState.create({
        doc: this.value ?? '',
        extensions: [
          ofmMarkdown({ codeLanguages: languages, extensions: [obsidianStyleTags] }),
          obsidianClasses,
          editing({ toggleReading: this.#toggleReading, completions: () => this.completions }),
          foldGutter({
            markerDOM: (open) => {
              const marker = document.createElement('div');
              marker.className = `cm-fold-indicator${open ? '' : ' is-collapsed'}`;
              marker.innerHTML = '<div class="collapse-indicator collapse-icon"></div>';
              return marker;
            },
          }),
          EditorView.domEventHandlers({ mousedown: this.#onMousedown }),
          this.#onUpdate,
          this.#mode.of(this.#modeExtension()),
          this.#options.of(this.#optionsExtension()),
        ],
      }),
    });
  }

  protected firstUpdated() {
    this.#createView();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    const view = this.#view;
    if (!view) return;
    const effects = [];
    if (changed.has('mode')) effects.push(this.#mode.reconfigure(this.#modeExtension()));
    if (changed.has('readonly') || changed.has('spellcheck') || changed.has('placeholder')) {
      effects.push(this.#options.reconfigure(this.#optionsExtension()));
    }
    const value = this.value ?? '';
    const current = view.state.doc.toString();
    if (value !== current) {
      // Keep the selection where it was, clamped to the new length.
      const clamp = (pos: number) => Math.min(pos, value.length);
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        selection: EditorSelection.create(view.state.selection.ranges.map((r) => EditorSelection.range(clamp(r.anchor), clamp(r.head)))),
        annotations: external.of(true),
        effects,
      });
    } else if (effects.length > 0) {
      view.dispatch({ effects });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#view?.destroy();
    this.#view = undefined;
  }

  connectedCallback() {
    super.connectedCallback();
    // Removing the element destroyed its view, so a reinserted one needs a new view.
    if (this.hasUpdated && !this.#view) this.#createView();
  }

  render() {
    return html`<div class=${classMap({
      'markdown-source-view': true,
      'cm-s-obsidian': true,
      'mod-cm6': true,
      'is-live-preview': this.mode !== 'source',
      'is-readable-line-width': this.readableLineWidth,
    })}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-markdown-editor': OfmMarkdownEditor;
  }
}
