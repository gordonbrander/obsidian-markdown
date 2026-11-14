import { createContext, provide } from '@lit/context';
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { lucideIcons } from '../services/icons.ts';
import type { IconResolver } from '../services/icons.ts';
import type { TNoteService } from '../services/note.ts';

/** The note service the components inside load embeds through. Provide it yourself to replace just this. */
export const noteContext = createContext<TNoteService | undefined>(Symbol('ofm-note-service'));
/** The icon resolver the components inside draw icons through. Provide it yourself to replace just this. */
export const iconContext = createContext<IconResolver>(Symbol('ofm-icon-resolver'));

/**
 * Provides note loading and icons to the components inside it: one context, one vault.
 * Assigning either property re-renders everything inside.
 * Components outside any context draw Lucide icons and leave note embeds as placeholders.
 */
@customElement('ofm-context')
export class OfmContext extends LitElement {
  static styles = css`:host { display: contents; }`;

  /** Loads note embeds. With none, embeds stay placeholders. Assign a new service to reload every note. */
  @provide({ context: noteContext })
  @property({ attribute: false }) accessor noteService: TNoteService | undefined;

  /** Turns an icon id into its SVG. Assign `async () => undefined` for no icons. */
  @provide({ context: iconContext })
  @property({ attribute: false }) accessor resolveIcon: IconResolver = lucideIcons;

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ofm-context': OfmContext;
  }
}
