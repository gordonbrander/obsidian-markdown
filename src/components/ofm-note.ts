import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './ofm-frontmatter.ts';
import type { Properties, PropertyTypes } from './ofm-frontmatter.ts';
import './ofm-markdown.ts';
import { parseFrontmatter, splitFrontmatter } from '../render.ts';

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
 * Note embeds and icons come from the nearest `<ofm-context>`.
 * @fires proprow-change - A property was edited. Bubbles from its row. `detail` is `{ key, value, type, effectiveType }`.
 * @fires wikilink-click - A wikilink was clicked, in a property or the note. `detail.target` is the link target. Cancel it to stop the link's navigation.
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
  /** Mirrors the <details>, for Obsidian's is-collapsed class. */
  @state() private accessor collapsed = false;

  render() {
    // ponytail: ofm-markdown strips front matter again, so content that itself opens with a --- block loses it.
    const { data, content } = parse(this.value ?? '');
    const count = Object.keys(data).length;
    const collapsed = this.collapsed ? 'is-collapsed' : '';
    // Obsidian's properties view, as a <details> where Obsidian folds a div with script. The arrow is its right-triangle icon.
    return html`
      ${count > 0 ? html`
        <details
          class="metadata-container ${collapsed}"
          data-property-count=${count}
          ?open=${!this.collapsed}
          @toggle=${(e: Event) => { this.collapsed = !(e.currentTarget as HTMLDetailsElement).open; }}
        >
          <summary class="metadata-properties-heading">
            <div class="collapse-indicator collapse-icon ${collapsed}">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"/></svg>
            </div>
            <div class="metadata-properties-title">Properties</div>
          </summary>
          <div class="metadata-content">
            <ofm-frontmatter .properties=${data} .types=${this.types} ?readonly=${this.readonly}></ofm-frontmatter>
          </div>
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
