import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './ofm-proprow.ts';
import type { ProprowChangeDetail } from './ofm-proprow.ts';
import type { Json, Type } from './sniff.ts';

export type { ProprowChangeDetail, WikilinkDetail } from './ofm-proprow.ts';

export type Properties = Record<string, Json>;
export type PropertyTypes = Record<string, Type>;

// The attribute can hold any JSON, so the declared type isn't guaranteed.
const isRecord = (value: unknown): value is Properties =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * An editable property list, like Obsidian's properties view.
 * @fires proprow-change - A property was edited. Bubbles from its row. `detail` is `{ key, value, type, effectiveType }`, and `properties` already holds the edit.
 * @fires wikilink - A link in a property value was clicked. `detail` is `{ key, target }`.
 */
@customElement('ofm-frontmatter')
export class OfmFrontmatter extends LitElement {
  /** No shadow root, so the page styles the properties. */
  protected createRenderRoot() {
    return this;
  }

  @property({ type: Object }) accessor properties: Properties | null = null;
  @property({ type: Object }) accessor types: PropertyTypes | null = null;
  @property({ type: Boolean }) accessor readonly = false;

  #onRowChange({ detail: { key, value } }: CustomEvent<ProprowChangeDetail>) {
    this.properties = { ...this.properties, [key]: value };
  }

  render() {
    const entries = isRecord(this.properties) ? Object.entries(this.properties) : [];
    return repeat(entries, ([key]) => key, ([key, value]) => html`
      <ofm-proprow
        .key=${key}
        .value=${value}
        .type=${isRecord(this.types) ? this.types[key] : undefined}
        .readonly=${this.readonly}
        @proprow-change=${this.#onRowChange}
      ></ofm-proprow>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-frontmatter': OfmFrontmatter;
  }
}
