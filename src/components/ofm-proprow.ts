import { LitElement, html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { drawIcon, resolveIcon } from '../icons.ts';
import type { IconResolver } from '../icons.ts';
import { fieldFor, parseCommitted, parseLink, reservedType } from '../sniff.ts';
import type { Field, Json, Link, Type } from '../sniff.ts';

export type ProprowChangeDetail = { key: string; value: Json; type: Type | undefined; effectiveType: Type };
export type ClickWikilinkDetail = { key: string; target: string };

type Editable = { key: string; readonly: boolean; commit(value: Json): void };
type Linkable = { clickWikilink(event: Event, target: string): void };
type Extras<K extends Type> =
  K extends 'unknown' ? unknown :
  K extends 'multitext' | 'tags' | 'aliases' ? Editable & Linkable :
  K extends 'text' ? Editable & Linkable & { editing: boolean; edit(): void; endEdit(): void } :
  Editable;
type RowOf<K extends Type> = Extract<Field, { type: K }> & Extras<K>;
type RowData = { [K in Type]: RowOf<K> }[Type];

/** The icon Obsidian shows for each property type. */
const ICONS: Record<Type, string> = {
  text: 'lucide-text',
  multitext: 'lucide-list',
  number: 'lucide-binary',
  checkbox: 'lucide-check-square',
  date: 'lucide-calendar',
  datetime: 'lucide-clock',
  aliases: 'lucide-forward',
  tags: 'lucide-tags',
  unknown: 'lucide-file-question',
};

const inputOf = (e: Event) => e.target as HTMLInputElement;
const textOf = (e: Event) => (e.target as HTMLElement).textContent ?? '';

/** A link is an anchor where Obsidian has a div, so it opens, focuses and reads as a link without script. */
const linkAnchor = (className: string, { target, label, href, wiki }: Link, clickWikilink: Linkable['clickWikilink']) => html`
  <a
    class="${className} ${wiki ? 'internal-link' : 'external-link'}"
    data-href=${target}
    href=${href ?? nothing}
    @click=${wiki ? (e: Event) => clickWikilink(e, target) : nothing}
  >${label}</a>
`;

const textRow = (data: RowOf<'text'>) => {
  const link = data.value === null ? undefined : parseLink(data.value);
  if (link && !data.editing) {
    return html`
      <div class="metadata-link" @click=${(e: Event) => !data.readonly && !e.defaultPrevented && !(e.target as Element).closest('a') && data.edit()}>
        ${linkAnchor('metadata-link-inner', link, data.clickWikilink)}
        ${data.readonly ? nothing : html`
          <div
            class="metadata-link-flair"
            role="button"
            tabindex="0"
            aria-label="Edit ${data.key}"
            data-icon="lucide-pencil"
            @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && data.edit()}
          ></div>
        `}
      </div>
    `;
  }
  // Obsidian's text field is an editable div, so it can wrap.
  return html`
    <div
      class="metadata-input-longtext"
      role="textbox"
      tabindex="0"
      placeholder="Empty"
      aria-label=${data.key}
      contenteditable=${data.readonly ? 'false' : 'plaintext-only'}
      .textContent=${data.value ?? ''}
      @keydown=${(e: KeyboardEvent) => {
        const field = e.target as HTMLElement;
        if (e.isComposing) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          field.blur();
        } else if (e.key === 'Escape') {
          field.textContent = data.value ?? '';
          field.blur();
        }
      }}
      @blur=${(e: Event) => {
        const text = textOf(e).trimEnd();
        if (text !== (data.value ?? '')) data.commit(text);
        data.endEdit();
      }}
    ></div>
  `;
};

const numberRow = (data: RowOf<'number'>) => html`
  <input
    class="metadata-input metadata-input-number"
    type="number"
    step="any"
    inputmode="decimal"
    placeholder="Empty"
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
    class="metadata-input-checkbox"
    type="checkbox"
    aria-label=${data.key}
    .checked=${data.value}
    ?disabled=${data.readonly}
    @change=${(e: Event) => data.commit(inputOf(e).checked)}
  />
`;

const dateRow = (data: RowOf<'date'>) => html`
  <input
    class="metadata-input metadata-input-text mod-date"
    type="date"
    max="9999-12-31"
    placeholder="Empty"
    aria-label=${data.key}
    .value=${data.value ?? ''}
    ?readonly=${data.readonly}
    @change=${(e: Event) => data.commit(inputOf(e).value || null)}
  />
`;

const datetimeRow = (data: RowOf<'datetime'>) => html`
  <input
    class="metadata-input metadata-input-text mod-datetime"
    type="datetime-local"
    step="1"
    max="9999-12-31T23:59"
    placeholder="Empty"
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

type Multi = RowOf<'multitext'> | RowOf<'tags'> | RowOf<'aliases'>;

const pill = (item: string | number, index: number, data: Multi) => {
  const remove = () => data.commit(data.value.toSpliced(index, 1));
  const link = typeof item === 'string' && data.type !== 'tags' ? parseLink(item) : undefined;
  // Obsidian shows a tag without its #.
  const text = data.type === 'tags' ? String(item).replace(/^#/, '') : item;
  return html`
    <div
      class="multi-select-pill"
      tabindex="0"
      @keydown=${(e: KeyboardEvent) => {
        if (data.readonly || e.target !== e.currentTarget || (e.key !== 'Backspace' && e.key !== 'Delete')) return;
        e.preventDefault();
        remove();
      }}
    >
      ${link
        ? linkAnchor('multi-select-pill-content', link, data.clickWikilink)
        : html`<div class="multi-select-pill-content"><span>${text}</span></div>`}
      ${data.readonly ? nothing : html`
        <div
          class="multi-select-pill-remove-button"
          role="button"
          aria-label="Remove ${item}"
          data-icon="lucide-x"
          @click=${remove}
        ></div>
      `}
    </div>
  `;
};

const multiRow = (data: Multi) => {
  const { key, value, readonly, commit } = data;

  const add = (input: HTMLElement) => {
    const text = (input.textContent ?? '').trim();
    input.textContent = '';
    if (!text) return;
    const stayNumeric = value.length > 0
      && value.every((item) => typeof item === 'number')
      && Number.isFinite(Number(text));
    commit([...value, stayNumeric ? Number(text) : text]);
  };

  const onKeydown = (e: KeyboardEvent) => {
    const input = e.target as HTMLElement;
    const text = input.textContent ?? '';
    if (e.isComposing) return;
    // A comma inside a [[link]] being typed is part of the link.
    if (e.key === 'Enter' || (e.key === ',' && !text.startsWith('[['))) {
      e.preventDefault();
      add(input);
    } else if (e.key === 'Backspace' && text === '' && value.length > 0) {
      commit(value.slice(0, -1));
    }
  };

  return html`
    <div class="multi-select-container">
      ${value.map((item, index) => pill(item, index, data))}
      ${readonly ? nothing : html`
        <div
          class="multi-select-input"
          role="textbox"
          tabindex="0"
          contenteditable="plaintext-only"
          aria-label="Add to ${key}"
          @keydown=${onKeydown}
          @blur=${(e: Event) => add(e.target as HTMLElement)}
        ></div>
      `}
    </div>
  `;
};

const unknownRow = (data: RowOf<'unknown'>) => html`
  <span class="metadata-property-value-item mod-unknown" tabindex="0">${JSON.stringify(data.value)}</span>
`;

export const row = (data: RowData): TemplateResult => {
  switch (data.type) {
    case 'text': return textRow(data);
    case 'number': return numberRow(data);
    case 'checkbox': return checkboxRow(data);
    case 'date': return dateRow(data);
    case 'datetime': return datetimeRow(data);
    case 'multitext':
    case 'tags':
    case 'aliases': return multiRow(data);
    case 'unknown': return unknownRow(data);
    default: {
      const unhandled: never = data;
      throw new Error(`Unknown property type: ${JSON.stringify(unhandled)}`);
    }
  }
};

/**
 * One property row: its key and an editor for its value, with the DOM and classes of a row in Obsidian's properties view.
 * The element is the row itself: it has the class `metadata-property`, and `data-property-key` holds its key in lowercase.
 * The `effective-type` attribute holds the type the row draws, which can differ from the declared `type`.
 * @attr effective-type - The drawn type: text, multitext, number, checkbox, date, datetime, tags, aliases or unknown.
 * @fires proprow-change - A property was edited. `detail` is `{ key, value, type, effectiveType }`.
 * @fires wikilink-click - A wikilink in the value was clicked. `detail` is `{ key, target }`. Cancel it to stop the link's navigation.
 */
@customElement('ofm-proprow')
export class OfmProprow extends LitElement {
  /** No shadow root, so the page styles the row. */
  protected createRenderRoot() {
    return this;
  }

  @property({ attribute: false }) accessor key = '';
  @property({ attribute: false }) accessor value: Json = null;
  /** The declared type. Unset, `tags` and `aliases` take their type from their name, and the rest from their value. */
  @property({ reflect: true }) accessor type: Type | undefined = undefined;
  @property({ type: Boolean }) accessor readonly = false;
  /** Turns an icon id into its SVG. Defaults to the shared `resolveIcon`; assign another to configure this element on its own. */
  @property({ attribute: false }) accessor resolveIcon: IconResolver = resolveIcon;
  @state() private accessor editing = false;
  #field: Field = fieldFor(null);

  willUpdate() {
    this.#field = fieldFor(this.value, this.type ?? reservedType(this.key));
    this.classList.add('metadata-property');
    this.setAttribute('data-property-key', this.key.toLowerCase());
    this.setAttribute('effective-type', this.#field.type);
  }

  updated() {
    for (const icon of this.querySelectorAll<HTMLElement>('[data-icon]')) {
      void drawIcon(icon, icon.dataset.icon!, this.resolveIcon).catch((error) => console.warn('ofm-proprow: could not draw icon', error));
    }
  }

  async #startEdit() {
    this.editing = true;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLElement>('.metadata-input-longtext')?.focus();
  }

  #commit(committed: Json) {
    const value = typeof committed === 'string' && this.type !== 'text'
      ? parseCommitted(committed)
      : committed;
    this.dispatchEvent(new CustomEvent<ProprowChangeDetail>('proprow-change', {
      bubbles: true,
      composed: true,
      detail: { key: this.key, value, type: this.type, effectiveType: this.#field.type },
    }));
  }

  #clickWikilink(event: Event, target: string) {
    const proceed = this.dispatchEvent(new CustomEvent<ClickWikilinkDetail>('wikilink-click', {
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
    // Obsidian's key is an input, for renaming. Here it only shows the name.
    return html`
      <div class="metadata-property-key">
        <span class="metadata-property-icon" data-icon=${ICONS[this.#field.type]}></span>
        <input
          class="metadata-property-key-input"
          type="text"
          autocapitalize="none"
          readonly
          aria-label="Property name"
          title=${this.key}
          .value=${this.key}
        />
      </div>
      <div class="metadata-property-value" data-property-type=${this.#field.type}>${row(data)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-proprow': OfmProprow;
  }
}
