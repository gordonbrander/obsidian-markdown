import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { fieldFor, formatCompact, parseCommitted, parseLink } from '../sniff.ts';
import type { Field, Json, Link, Type } from '../sniff.ts';

export type ProprowChangeDetail = { key: string; value: Json; type: Type | undefined; effectiveType: Type };
export type ClickWikilinkDetail = { key: string; target: string };

type Editable = { key: string; readonly: boolean; commit(value: Json): void };
type Linkable = { clickWikilink(event: Event, target: string): void };
type Extras<K extends Type> =
  K extends 'object' ? unknown :
  K extends 'list' ? Editable & Linkable :
  K extends 'link' ? Editable & Linkable & { editing: boolean; edit(): void; endEdit(): void } :
  Editable;
type RowOf<K extends Type> = Extract<Field, { type: K }> & Extras<K>;
type RowData = { [K in Type]: RowOf<K> }[Type];

const inputOf = (e: Event) => e.target as HTMLInputElement;

const linkAnchor = ({ target, label, href, wiki }: Link, clickWikilink: Linkable['clickWikilink']) => html`
  <a
    class="ofm-link"
    href=${href ?? nothing}
    title=${target}
    @click=${wiki ? (e: Event) => clickWikilink(e, target) : nothing}
  >${label}</a>
`;

const textRow = (data: RowOf<'text'>) => html`
  <input
    type="text"
    aria-label=${data.key}
    .value=${data.value ?? ''}
    ?readonly=${data.readonly}
    @change=${(e: Event) => data.commit(inputOf(e).value)}
  />
`;

const numberRow = (data: RowOf<'number'>) => html`
  <input
    type="number"
    step="any"
    aria-label=${data.key}
    .value=${data.value ?? ''}
    ?readonly=${data.readonly}
    @change=${(e: Event) => {
      const input = inputOf(e);
      // Half-typed input like "1e" reads as empty. Don't let it erase the value.
      if (input.validity.badInput) {
        input.value = String(data.value ?? '');
        return;
      }
      data.commit(input.value === '' ? null : Number(input.value));
    }}
  />
`;

const checkboxRow = (data: RowOf<'checkbox'>) => html`
  <input
    type="checkbox"
    aria-label=${data.key}
    .checked=${data.value}
    ?disabled=${data.readonly}
    @change=${(e: Event) => data.commit(inputOf(e).checked)}
  />
`;

const linkRow = (data: RowOf<'link'>) => {
  const link = parseLink(data.value);
  if (data.editing || !link) {
    return html`
      <input
        data-editing
        type="text"
        aria-label=${data.key}
        .value=${data.value}
        @change=${(e: Event) => data.commit(inputOf(e).value)}
        @blur=${data.endEdit}
        @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && inputOf(e).blur()}
      />
    `;
  }
  return html`
    ${linkAnchor(link, data.clickWikilink)}
    ${data.readonly ? nothing : html`
      <button class="ofm-icon" type="button" aria-label="Edit ${data.key}" @click=${data.edit}>✎</button>
    `}
  `;
};

const dateRow = (data: RowOf<'date'>) => html`
  <input
    type="date"
    aria-label=${data.key}
    .value=${data.value ?? ''}
    ?readonly=${data.readonly}
    @change=${(e: Event) => data.commit(inputOf(e).value || null)}
  />
`;

const datetimeRow = (data: RowOf<'datetime'>) => html`
  <input
    type="datetime-local"
    step="1"
    aria-label=${data.key}
    .value=${data.value ?? ''}
    ?readonly=${data.readonly}
    @change=${(e: Event) => {
      const { value } = inputOf(e);
      // Browsers trim :00 seconds. Stored values keep them (SPEC 4.1).
      data.commit(value.length === 16 ? `${value}:00` : value || null);
    }}
  />
`;

const token = (item: string | number, index: number, data: RowOf<'list'>) => {
  const link = typeof item === 'string' ? parseLink(item) : undefined;
  return html`
    <span class="ofm-token">
      ${link ? linkAnchor(link, data.clickWikilink) : item}
      ${data.readonly ? nothing : html`
        <button
          class="ofm-icon"
          type="button"
          aria-label="Remove ${item}"
          @click=${() => data.commit(data.value.toSpliced(index, 1))}
        >×</button>
      `}
    </span>
  `;
};

const listRow = (data: RowOf<'list'>) => {
  const { key, value, readonly, commit } = data;

  const add = (input: HTMLInputElement) => {
    const text = input.value.trim();
    input.value = '';
    if (!text) return;
    const stayNumeric = value.length > 0
      && value.every((item) => typeof item === 'number')
      && Number.isFinite(Number(text));
    commit([...value, stayNumeric ? Number(text) : text]);
  };

  const onKeydown = (e: KeyboardEvent) => {
    const input = inputOf(e);
    // A comma inside a [[link]] being typed is part of the link.
    if (e.key === 'Enter' || (e.key === ',' && !input.value.startsWith('[['))) {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && input.value === '' && value.length > 0) {
      commit(value.slice(0, -1));
    }
  };

  return html`
    <div class="ofm-tokens">
      ${value.map((item, index) => token(item, index, data))}
      ${readonly ? nothing : html`
        <input
          type="text"
          aria-label="Add to ${key}"
          @keydown=${onKeydown}
          @blur=${(e: Event) => add(inputOf(e))}
        />
      `}
    </div>
  `;
};

const objectRow = (data: RowOf<'object'>) => html`
  <pre>${formatCompact(data.value)}</pre>
`;

export const row = (data: RowData): TemplateResult => {
  switch (data.type) {
    case 'text': return textRow(data);
    case 'number': return numberRow(data);
    case 'checkbox': return checkboxRow(data);
    case 'link': return linkRow(data);
    case 'date': return dateRow(data);
    case 'datetime': return datetimeRow(data);
    case 'list': return listRow(data);
    case 'object': return objectRow(data);
    default: {
      const unhandled: never = data;
      throw new Error(`Unknown property type: ${JSON.stringify(unhandled)}`);
    }
  }
};

/**
 * One property row: its key and an editor for its value.
 * The `effective-type` attribute holds the type the row draws, which can differ from the declared `type`.
 * @attr effective-type - The drawn type: text, number, checkbox, link, date, datetime, list or object.
 * @fires ofm-proprow-change - A property was edited. `detail` is `{ key, value, type, effectiveType }`.
 * @fires ofm-wikilink-click - A wikilink in the value was clicked. `detail` is `{ key, target }`. Cancel it to stop the link's navigation.
 */
@customElement('ofm-proprow')
export class OfmProprow extends LitElement {
  /** No shadow root, so the page styles the row. */
  protected createRenderRoot() {
    return this;
  }

  @property({ attribute: false }) accessor key = '';
  @property({ attribute: false }) accessor value: Json = null;
  /** The declared type. Unset, the type is sniffed from the value. */
  @property({ reflect: true }) accessor type: Type | undefined = undefined;
  @property({ type: Boolean }) accessor readonly = false;
  @state() private accessor editing = false;
  #field: Field = fieldFor(null);

  willUpdate() {
    this.#field = fieldFor(this.value, this.type);
    this.setAttribute('effective-type', this.#field.type);
  }

  async #startEdit() {
    this.editing = true;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLInputElement>('[data-editing]')?.focus();
  }

  #commit(committed: Json) {
    const value = typeof committed === 'string' && this.type !== 'text'
      ? parseCommitted(committed)
      : committed;
    this.dispatchEvent(new CustomEvent<ProprowChangeDetail>('ofm-proprow-change', {
      bubbles: true,
      composed: true,
      detail: { key: this.key, value, type: this.type, effectiveType: this.#field.type },
    }));
  }

  #clickWikilink(event: Event, target: string) {
    const proceed = this.dispatchEvent(new CustomEvent<ClickWikilinkDetail>('ofm-wikilink-click', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { key: this.key, target },
    }));
    if (!proceed) event.preventDefault();
  }

  render() {
    const data = {
      ...this.#field,
      key: this.key,
      readonly: this.readonly,
      editing: this.editing,
      commit: (value: Json) => this.#commit(value),
      edit: () => this.#startEdit(),
      endEdit: () => { this.editing = false; },
      clickWikilink: (event: Event, target: string) => this.#clickWikilink(event, target),
    };
    return html`
      <span class="ofm-key" title=${this.key}>${this.key}</span>
      <div class="ofm-value">${row(data)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-proprow': OfmProprow;
  }
}
