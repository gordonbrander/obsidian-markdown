import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './ofm-proprow.ts';
import type { ProprowChangeDetail } from './ofm-proprow.ts';
import { resolveIcon } from '../icons.ts';
import type { IconResolver } from '../icons.ts';
import type { Json, Type } from '../sniff.ts';

export type { ProprowChangeDetail, ClickWikilinkDetail } from './ofm-proprow.ts';

export type Properties = Record<string, Json>;
export type PropertyTypes = Record<string, Type>;

// The attribute can hold any JSON, so the declared type isn't guaranteed.
const isRecord = (value: unknown): value is Properties =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * An editable property list, like Obsidian's properties view.
 * The element is the list itself: it has the class `metadata-properties`, and each row is a `.metadata-property`.
 * @fires proprow-change - A property was edited. Bubbles from its row. `detail` is `{ key, value, type, effectiveType }`, and `properties` already holds the edit.
 * @fires wikilink-click - A wikilink in a property value was clicked. `detail` is `{ key, target }`. Cancel it to stop the link's navigation.
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
  /** Turns an icon id into its SVG. Defaults to the shared `resolveIcon`; assign another to configure this element on its own. */
  @property({ attribute: false }) accessor resolveIcon: IconResolver = resolveIcon;

  #onRowChange({ detail: { key, value } }: CustomEvent<ProprowChangeDetail>) {
    this.properties = { ...this.properties, [key]: value };
  }

  override connectedCallback() {
    super.connectedCallback();
    this.classList.add('metadata-properties');
  }

  render() {
    const entries = isRecord(this.properties) ? Object.entries(this.properties) : [];
    return repeat(entries, ([key]) => key, ([key, value]) => html`
      <ofm-proprow
        .key=${key}
        .value=${value}
        .type=${isRecord(this.types) ? this.types[key] : undefined}
        .readonly=${this.readonly}
        .resolveIcon=${this.resolveIcon}
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
