import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { draw } from './draw.ts';
import { render } from './render.ts';

export type MarkdownWikilinkDetail = { target: string };

const FOLDABLE_TITLE = '[data-callout-fold] > .callout-title';

const setFolded = (title: Element, folded: boolean) => {
  title.parentElement?.setAttribute('data-callout-fold', folded ? '-' : '+');
  title.setAttribute('aria-expanded', String(!folded));
  title.nextElementSibling?.toggleAttribute('hidden', folded);
};

const toggleFold = (title: Element) => {
  setFolded(title, title.parentElement?.getAttribute('data-callout-fold') === '+');
};

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
    for (const title of template.content.querySelectorAll(FOLDABLE_TITLE)) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      setFolded(title, title.parentElement?.getAttribute('data-callout-fold') === '-');
    }
    // A superseded build is dropped by until, so it shouldn't announce anything.
    if (value === (this.value ?? '') && strictLineBreaks === this.strictLineBreaks) {
      this.dispatchEvent(new CustomEvent('rendered', { bubbles: true, composed: true }));
    }
    return template.content;
  };

  #openWikilink(target: string) {
    this.dispatchEvent(new CustomEvent<MarkdownWikilinkDetail>('wikilink', {
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
      event.preventDefault();
      // Mermaid nodes have no data-href. Their text is the target (SPEC 5.1).
      this.#openWikilink(internal.getAttribute('data-href') ?? internal.textContent?.trim() ?? '');
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

    if (clicked.closest('.tag')) {
      event.preventDefault();
      return;
    }

    if (clicked.closest('a')) return;
    const title = clicked.closest(FOLDABLE_TITLE);
    if (title) toggleFold(title);
  }

  #onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target as Element;
    if (!target.matches(FOLDABLE_TITLE)) return;
    event.preventDefault();
    toggleFold(target);
  }

  render() {
    return html`
      <div class="obs-content" @click=${this.#onClick} @keydown=${this.#onKeydown}>
        ${until(this.#build(this.value ?? '', this.strictLineBreaks))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-markdown': OfmMarkdown;
  }
}
