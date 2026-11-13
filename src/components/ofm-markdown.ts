import { LitElement, html } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { draw, highlight } from '../draw.ts';
import { embedsNote, renderNoteEmbeds } from '../embeds.ts';
import { NoteService, noteService } from '../services/note.ts';
import type { NoteChangeDetail } from '../services/note.ts';

export type MarkdownClickWikilinkDetail = { target: string };

/**
 * Renders a note's Obsidian Flavored Markdown, drawing math and Mermaid diagrams and highlighting code.
 * Note embeds load through its `noteService` property: the shared `noteService` unless you assign another.
 * @attr rendered - Set by the element once its first content is in the DOM, with math and diagrams drawn. It stays set. Style the first render with `ofm-markdown:not([rendered])`.
 * @attr loaded - Set while the current content is fully loaded: code highlighted and note embeds filled. Removed when new content starts rendering.
 * @fires markdown-rendered - The new content is in the DOM, with math and diagrams drawn. Code highlighting and embeds may still be loading.
 * @fires markdown-loaded - The new content is fully loaded: code highlighted and note embeds filled. Fires after `markdown-rendered`, unless newer content replaced it first.
 * @fires wikilink-click - A wikilink was clicked. `detail.target` is the link target. Cancel it to stop the link's navigation.
 */
@customElement('ofm-markdown')
export class OfmMarkdown extends LitElement {
  /** No shadow root, so the page styles the note. Consumers who want isolation can wrap it in their own. */
  protected createRenderRoot() {
    return this;
  }

  /** The note's Markdown source. */
  @property() accessor value = '';
  @property({ type: Boolean, attribute: 'strict-line-breaks' }) accessor strictLineBreaks = false;

  /** Loads note embeds. Defaults to the shared `noteService`; assign another to configure this element on its own. */
  @property({ attribute: false }) accessor noteService: NoteService = noteService;
  /** The service we listen to for changed notes. */
  #subscribed?: NoteService;

  /** A note we show changed: rebuild. The service still caches every other note, so only that one reloads. */
  #onChange = (event: Event) => {
    const { name } = (event as CustomEvent<NoteChangeDetail>).detail;
    if (name === undefined || embedsNote(this, name)) this.requestUpdate();
  };

  #subscribe(service?: NoteService) {
    this.#subscribed?.removeEventListener('change', this.#onChange);
    this.#subscribed = service;
    service?.addEventListener('change', this.#onChange);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.#subscribe(this.noteService);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#subscribe(undefined);
  }

  /** A new service: listen to it instead. Every update rebuilds the content, so the embeds already use it. */
  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('noteService') && this.isConnected) this.#subscribe(this.noteService);
  }

  /** Render and draw off-screen, so an update shows finished content. */
  #build = async (value: string, strictLineBreaks: boolean) => {
    const note = renderNoteEmbeds(value, this.noteService, { strictLineBreaks });
    await draw(note.content);
    return note;
  };

  #content?: DocumentFragment;
  /** Resolves when the embeds in `#content` are filled. */
  #embedsLoaded?: Promise<void>;
  /** The latest render's loading, so an older one finishing late doesn't mark the element loaded. */
  #loading?: Promise<unknown>;

  /** Build before every update, so the update renders content with math and diagrams drawn, and `updateComplete` waits for it. Code highlighting follows in `updated`. */
  protected override async scheduleUpdate() {
    // New content is on its way, so the old content's loading no longer counts.
    this.#loading = undefined;
    this.removeAttribute('loaded');
    try {
      // Props can change while drawing. Those changes merge into this pending update, so rebuild until the content matches.
      let value: string, strictLineBreaks: boolean;
      do {
        ({ value, strictLineBreaks } = this);
        ({ content: this.#content, loaded: this.#embedsLoaded } = await this.#build(value ?? '', strictLineBreaks));
      } while (value !== this.value || strictLineBreaks !== this.strictLineBreaks);
    } finally {
      // Never skip it, or the update stays pending and the element stops updating.
      await super.scheduleUpdate();
    }
  }

  updated() {
    this.setAttribute('rendered', '');
    this.dispatchEvent(new CustomEvent('markdown-rendered', { bubbles: true, composed: true }));
    // Highlighting only adds spans, so the note shows without waiting for the highlighter to load.
    const loading = Promise.all([highlight(this), this.#embedsLoaded]);
    this.#loading = loading;
    void loading.then(() => {
      if (this.#loading !== loading) return;
      this.setAttribute('loaded', '');
      this.dispatchEvent(new CustomEvent('markdown-loaded', { bubbles: true, composed: true }));
    });
  }

  /** Returns false when a listener cancelled the event. */
  #clickWikilink(target: string) {
    return this.dispatchEvent(new CustomEvent<MarkdownClickWikilinkDetail>('wikilink-click', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { target },
    }));
  }

  #onClick(event: Event) {
    const clicked = event.target as Element;

    const internal = clicked.closest('.internal-link');
    if (internal) {
      const target = internal.getAttribute('data-href') ?? internal.textContent?.trim() ?? '';
      if (!this.#clickWikilink(target)) event.preventDefault();
      return;
    }

    // Footnote IDs repeat when a page has several notes, so hash navigation could land in the wrong one.
    const footnote = clicked.closest<HTMLAnchorElement>('a[href^="#fn"]');
    if (footnote) {
      event.preventDefault();
      const id = footnote.getAttribute('href')?.slice(1) ?? '';
      this.querySelector(`#${CSS.escape(id)}`)?.scrollIntoView({ block: 'center' });
      return;
    }

    if (clicked.closest('.tag')) event.preventDefault();
  }

  render() {
    return html`
      <div class="markdown-rendered" @click=${this.#onClick}>
        ${this.#content}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-markdown': OfmMarkdown;
  }
}
