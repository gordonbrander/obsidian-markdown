import { LitElement, css, html } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { draw } from './draw.ts';
import { renderMarkdown } from './markdown.ts';

export type MarkdownWikilinkDetail = { target: string };

const FOLDABLE_TITLE = '[data-callout-fold] > .callout-title';

const toggleFold = (title: Element) => {
  const callout = title.parentElement;
  if (!callout) return;
  const expanded = callout.getAttribute('data-callout-fold') === '-';
  callout.setAttribute('data-callout-fold', expanded ? '+' : '-');
  title.setAttribute('aria-expanded', String(expanded));
};

@customElement('obsidian-markdown')
export class ObsidianMarkdown extends LitElement {
  static styles = css`
    :host {
      display: block;
      color-scheme: light dark;
      font: 16px/1.6 var(--font-text, system-ui, sans-serif);
      --muted: light-dark(#6b6b6b, #a0a0a0);
      --accent: light-dark(#6d3fd1, #a88bfa);
      --border: light-dark(#0000001f, #ffffff29);
      --code: light-dark(#0000000d, #ffffff14);
    }
    a { color: var(--accent); }
    img, svg { max-width: 100%; }
    code, pre { font-family: var(--font-monospace, ui-monospace, monospace); font-size: 0.9em; }
    code { padding: 0.1em 0.3em; border-radius: 4px; background: var(--code); }
    pre { padding: 12px; overflow-x: auto; border-radius: 6px; background: var(--code); }
    pre code { padding: 0; background: none; }
    blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid var(--border); color: var(--muted); }
    hr { border: 0; border-top: 1px solid var(--border); }
    table { border-collapse: collapse; }
    th, td { padding: 4px 10px; border: 1px solid var(--border); }
    li[data-task] { list-style: none; margin-left: -1.2em; }
    li[data-task]:not([data-task='']) { color: var(--muted); }

    mark { padding: 0 2px; border-radius: 2px; background: light-dark(#fff3a3, #7a6a00); color: inherit; }
    mark[data-highlight-color='red'] { background: light-dark(#ffc9c9, #7f2a2a); }
    mark[data-highlight-color='orange'] { background: light-dark(#ffd8a8, #80501c); }
    mark[data-highlight-color='yellow'] { background: light-dark(#fff3a3, #7a6a00); }
    mark[data-highlight-color='green'] { background: light-dark(#b2f2bb, #2b6a3a); }
    mark[data-highlight-color='blue'] { background: light-dark(#a5d8ff, #1f5a8a); }
    mark[data-highlight-color='purple'] { background: light-dark(#d8c8ff, #55388f); }

    .tag { padding: 0 8px; border-radius: 10px; background: var(--code); font-size: 0.9em; text-decoration: none; }
    span.internal-embed:empty::before {
      content: '↪ ' attr(src);
      padding: 2px 8px;
      border: 1px dashed var(--border);
      border-radius: 4px;
      color: var(--muted);
      font-size: 0.9em;
    }

    .math-block, .math-display { display: block; text-align: center; overflow-x: auto; }
    .math svg { overflow: visible; }
    .diagram { text-align: center; }
    .diagram .internal-link { cursor: pointer; }

    .footnotes { margin-top: 2em; padding-top: 1em; border-top: 1px solid var(--border); font-size: 0.9em; }
    .footnote-backref { text-decoration: none; }

    .callout {
      --callout-color: light-dark(#086ddd, #4a9cf5);
      margin: 1em 0;
      padding: 10px 14px;
      border-left: 3px solid var(--callout-color);
      border-radius: 4px;
      background: color-mix(in srgb, var(--callout-color) 10%, transparent);
    }
    .callout-title { color: var(--callout-color); font-weight: 600; }
    .callout-content > :first-child { margin-top: 0.4em; }
    .callout-content > :last-child { margin-bottom: 0; }
    [data-callout-fold] > .callout-title { cursor: pointer; }
    [data-callout-fold] > .callout-title::after { content: ' ▾'; }
    [data-callout-fold='-'] > .callout-title::after { content: ' ▸'; }
    [data-callout-fold='-'] > .callout-content { display: none; }

    :is([data-callout='abstract'], [data-callout='summary'], [data-callout='tldr'],
      [data-callout='tip'], [data-callout='hint'], [data-callout='important']) {
      --callout-color: light-dark(#00a3a3, #2ec4c4);
    }
    :is([data-callout='success'], [data-callout='check'], [data-callout='done']) {
      --callout-color: light-dark(#08a03a, #44cf6e);
    }
    :is([data-callout='question'], [data-callout='help'], [data-callout='faq'],
      [data-callout='warning'], [data-callout='caution'], [data-callout='attention']) {
      --callout-color: light-dark(#d97706, #e9973f);
    }
    :is([data-callout='failure'], [data-callout='fail'], [data-callout='missing'],
      [data-callout='danger'], [data-callout='error'], [data-callout='bug']) {
      --callout-color: light-dark(#d92d2d, #fb464c);
    }
    [data-callout='example'] { --callout-color: light-dark(#7a3fd1, #a882ff); }
    :is([data-callout='quote'], [data-callout='cite']) { --callout-color: light-dark(#6b6b6b, #9e9e9e); }
  `;

  /** The note's Markdown source. */
  @property() accessor value = '';
  @property({ type: Boolean, attribute: 'strict-line-breaks' }) accessor strictLineBreaks = false;

  #html = '';
  #generation = 0;

  #inputsChanged(changed: PropertyValues<this>) {
    return changed.has('value') || changed.has('strictLineBreaks');
  }

  willUpdate(changed: PropertyValues<this>) {
    if (!this.#inputsChanged(changed)) return;
    this.#html = renderMarkdown(this.value ?? '', { strictLineBreaks: this.strictLineBreaks });
  }

  updated(changed: PropertyValues<this>) {
    if (!this.#inputsChanged(changed)) return;
    for (const title of this.renderRoot.querySelectorAll(FOLDABLE_TITLE)) {
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-expanded', String(title.parentElement?.getAttribute('data-callout-fold') === '+'));
    }
    const generation = ++this.#generation;
    void draw(this.renderRoot, () => generation === this.#generation);
  }

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

    // Hash navigation doesn't reach into a shadow root.
    const footnote = clicked.closest<HTMLAnchorElement>('a[href^="#fn"]');
    if (footnote) {
      event.preventDefault();
      const id = footnote.getAttribute('href')?.slice(1) ?? '';
      (this.renderRoot as ShadowRoot).getElementById(id)?.scrollIntoView({ block: 'center' });
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
      <div @click=${this.#onClick} @keydown=${this.#onKeydown}>${unsafeHTML(this.#html)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'obsidian-markdown': ObsidianMarkdown;
  }
}
