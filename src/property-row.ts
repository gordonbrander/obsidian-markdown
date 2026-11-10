import { LitElement, css, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { formatCompact, parseWikilink, sniff } from './sniff.ts';
import type { Field, Json, Kind, Wikilink } from './sniff.ts';

export type PropertyChangeDetail = { key: string; value: Json };
export type WikilinkDetail = { key: string; target: string };

type Editable = { key: string; readonly: boolean; commit(value: Json): void };
type Linkable = { openLink(target: string): void };
type Extras<K extends Kind> =
  K extends 'object' ? unknown :
  K extends 'list' ? Editable & Linkable :
  K extends 'link' ? Editable & Linkable & { editing: boolean; edit(): void; endEdit(): void } :
  Editable;
type RowOf<K extends Kind> = Extract<Field, { kind: K }> & Extras<K>;
type RowData = { [K in Kind]: RowOf<K> }[Kind];

const GLYPHS: Record<Kind, string> = {
  text: 'T',
  number: '#',
  checkbox: '☑',
  link: '↗',
  date: '▦',
  datetime: '◷',
  list: '≣',
  object: '{}',
};

const inputOf = (e: Event) => e.target as HTMLInputElement;

const linkButton = ({ target, label }: Wikilink, openLink: Linkable['openLink']) => html`
  <button class="link" type="button" title=${target} @click=${() => openLink(target)}>${label}</button>
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
  const link = parseWikilink(data.value);
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
    ${linkButton(link, data.openLink)}
    ${data.readonly ? nothing : html`
      <button class="icon" type="button" aria-label="Edit ${data.key}" @click=${data.edit}>✎</button>
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
  const link = typeof item === 'string' ? parseWikilink(item) : null;
  return html`
    <span class="token">
      ${link ? linkButton(link, data.openLink) : item}
      ${data.readonly ? nothing : html`
        <button
          class="icon"
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
    <div class="tokens">
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
  switch (data.kind) {
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
      throw new Error(`Unknown property kind: ${JSON.stringify(unhandled)}`);
    }
  }
};

// Kinds that emit null when cleared, and must keep their widget while empty.
const isClearable = (kind: Kind | null): kind is 'number' | 'date' | 'datetime' =>
  kind === 'number' || kind === 'date' || kind === 'datetime';

@customElement('property-row')
export class PropertyRow extends LitElement {
  static styles = css`
    :host {
      display: grid;
      grid-template-columns: 20px 9em 1fr;
      align-items: start;
      gap: 4px;
      padding: 2px 0;
      --muted: light-dark(#6b6b6b, #a0a0a0);
      --hover: light-dark(#0000000d, #ffffff14);
      --token: light-dark(#0000000f, #ffffff1a);
      --accent: light-dark(#6d3fd1, #a88bfa);
    }
    .glyph, .key {
      color: var(--muted);
      line-height: 28px;
    }
    .glyph { text-align: center; }
    .key {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .value {
      display: flex;
      align-items: center;
      min-width: 0;
      min-height: 28px;
    }
    input {
      flex: 1;
      min-width: 0;
      height: 28px;
      box-sizing: border-box;
      padding: 0 6px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    input:not([readonly]):hover, input:not([readonly]):focus { background: var(--hover); }
    input:focus { outline: 1px solid var(--accent); }
    input[readonly]:focus { outline: none; }
    input[type='checkbox'] {
      flex: none;
      width: 16px;
      height: 16px;
      margin: 0 6px;
    }
    .tokens {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      min-width: 0;
      padding: 3px 6px;
    }
    .tokens input {
      flex: 1 1 4em;
      height: 22px;
      padding: 0;
    }
    .tokens input:hover, .tokens input:focus {
      background: transparent;
      outline: none;
    }
    .token {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--token);
      line-height: 22px;
      overflow-wrap: anywhere;
    }
    button {
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .link {
      color: var(--accent);
      text-align: left;
      text-decoration: underline;
      overflow-wrap: anywhere;
    }
    .value > .link { margin-left: 6px; }
    .icon {
      color: var(--muted);
      padding: 0 4px;
    }
    pre {
      flex: 1;
      min-width: 0;
      margin: 0;
      padding: 4px 6px;
      overflow-x: auto;
      color: var(--muted);
      font: 12px/1.4 var(--font-monospace, ui-monospace, monospace);
    }
  `;

  @property({ attribute: false }) accessor key = '';
  @property({ attribute: false }) accessor value: Json = null;
  @property({ type: Boolean }) accessor readonly = false;
  @state() private accessor editing = false;

  #lastKind: Kind | null = null;
  #field: Field = { kind: 'text', value: null };

  willUpdate() {
    const field = sniff(this.value);
    if (this.value !== null && this.value !== undefined) this.#lastKind = field.kind;
    this.#field = field.value === null && isClearable(this.#lastKind)
      ? { kind: this.#lastKind, value: null }
      : field;
  }

  async #startEdit() {
    this.editing = true;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLInputElement>('[data-editing]')?.focus();
  }

  #commit(value: Json) {
    this.dispatchEvent(new CustomEvent<PropertyChangeDetail>('property-change', {
      detail: { key: this.key, value },
    }));
  }

  #openLink(target: string) {
    this.dispatchEvent(new CustomEvent<WikilinkDetail>('wikilink', {
      bubbles: true,
      composed: true,
      detail: { key: this.key, target },
    }));
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
      openLink: (target: string) => this.#openLink(target),
    };
    return html`
      <span class="glyph" aria-hidden="true">${GLYPHS[data.kind]}</span>
      <span class="key" title=${this.key}>${this.key}</span>
      <div class="value">${row(data)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'property-row': PropertyRow;
  }
}
