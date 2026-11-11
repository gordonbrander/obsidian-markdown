import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './ofm-frontmatter.ts';
import type { Properties, PropertyTypes } from './ofm-frontmatter.ts';
import './ofm-markdown.ts';
import { parseFrontmatter, splitFrontmatter } from './render.ts';

const parse = (value: string): { data: Properties; content: string } => {
  try {
    const { data, content } = parseFrontmatter(value);
    // yaml's default schema yields only JSON-compatible values.
    return { data: data as Properties, content };
  } catch (error) {
    console.warn('ofm-note: could not parse properties', error);
    return { data: {}, content: splitFrontmatter(value).content };
  }
};

/**
 * A whole note: its properties, collapsible as in Obsidian, followed by its rendered Markdown.
 * @fires change - A property was edited. `detail` is `{ key, value, properties }`.
 * @fires wikilink - A link was clicked, in a property or the note. `detail.target` is the link target.
 */
@customElement('ofm-note')
export class OfmNote extends LitElement {
  /** No shadow root, so the page's theme reaches the note. */
  protected createRenderRoot() {
    return this;
  }

  /** The note's source, front matter included. */
  @property() accessor value = '';
  @property({ type: Boolean, attribute: 'strict-line-breaks' }) accessor strictLineBreaks = false;
  @property({ type: Boolean }) accessor readonly = false;
  @property({ type: Object }) accessor types: PropertyTypes | null = null;

  render() {
    // ponytail: ofm-markdown strips front matter again, so content that itself opens with a --- block loses it.
    const { data, content } = parse(this.value ?? '');
    return html`
      ${Object.keys(data).length > 0 ? html`
        <details class="ofm-properties" open>
          <summary class="ofm-properties-heading">Properties</summary>
          <ofm-frontmatter .properties=${data} .types=${this.types} ?readonly=${this.readonly}></ofm-frontmatter>
        </details>
      ` : nothing}
      <ofm-markdown .value=${content} ?strict-line-breaks=${this.strictLineBreaks}></ofm-markdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-note': OfmNote;
  }
}
