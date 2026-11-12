import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { draw } from '../draw.ts';
import { render } from '../render.ts';

export type MarkdownClickWikilinkDetail = { target: string };

/**
 * Renders a note's Obsidian Flavored Markdown, drawing math and Mermaid diagrams and highlighting code.
 * @attr rendered - Set by the element once its first content is in the DOM and drawn. Style the first render with `ofm-markdown:not([rendered])`.
 * @fires rendered - The new content is in the DOM and drawn.
 * @fires click-wikilink - A wikilink was clicked. `detail.target` is the link target. Cancel it to stop the link's navigation.
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

  /** Render and draw off-screen. A template's content is inert until it's inserted. */
  #build = async (value: string, strictLineBreaks: boolean) => {
    const template = document.createElement('template');
    template.innerHTML = render(value, { strictLineBreaks });
    await draw(template.content);
    return template.content;
  };

  #content?: DocumentFragment;

  /** Build before every update, so the update renders finished content and `updateComplete` waits for it. */
  protected override async scheduleUpdate() {
    try {
      // Props can change while drawing. Those changes merge into this pending update, so rebuild until the content matches.
      let value: string, strictLineBreaks: boolean;
      do {
        ({ value, strictLineBreaks } = this);
        this.#content = await this.#build(value ?? '', strictLineBreaks);
      } while (value !== this.value || strictLineBreaks !== this.strictLineBreaks);
    } finally {
      // Never skip it, or the update stays pending and the element stops updating.
      await super.scheduleUpdate();
    }
  }

  updated() {
    this.setAttribute('rendered', '');
    this.dispatchEvent(new CustomEvent('rendered', { bubbles: true, composed: true }));
  }

  /** Returns false when a listener cancelled the event. */
  #clickWikilink(target: string) {
    return this.dispatchEvent(new CustomEvent<MarkdownClickWikilinkDetail>('click-wikilink', {
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
      // Mermaid nodes have no data-href. Their text is the target (SPEC 5.1).
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
