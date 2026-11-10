import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import './property-row.ts';
import type { PropertyChangeDetail } from './property-row.ts';
import type { DeclaredKind, Json } from './sniff.ts';

export type { WikilinkDetail } from './property-row.ts';

export type Properties = Record<string, Json>;
export type PropertyTypes = Record<string, DeclaredKind>;
export type ChangeDetail = { key: string; value: Json; properties: Properties };

// The attribute can hold any JSON, so the declared type isn't guaranteed.
const isRecord = (value: unknown): value is Properties =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

@customElement('front-matter')
export class FrontMatter extends LitElement {
  static styles = css`
    :host {
      display: block;
      color-scheme: light dark;
      font: 14px/1.4 var(--font-interface, system-ui, sans-serif);
    }
  `;

  @property({ type: Object }) accessor properties: Properties | null = null;
  @property({ type: Object }) accessor types: PropertyTypes | null = null;
  @property({ type: Boolean }) accessor readonly = false;

  #onRowChange({ detail: { key, value } }: CustomEvent<PropertyChangeDetail>) {
    this.properties = { ...this.properties, [key]: value };
    this.dispatchEvent(new CustomEvent<ChangeDetail>('change', {
      bubbles: true,
      composed: true,
      detail: { key, value, properties: this.properties },
    }));
  }

  render() {
    const entries = isRecord(this.properties) ? Object.entries(this.properties) : [];
    return repeat(entries, ([key]) => key, ([key, value]) => html`
      <property-row
        .key=${key}
        .value=${value}
        .type=${isRecord(this.types) ? this.types[key] : undefined}
        .readonly=${this.readonly}
        @property-change=${this.#onRowChange}
      ></property-row>
    `);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'front-matter': FrontMatter;
  }
}
