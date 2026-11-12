// Note embeds (![[Note]], ![[Note#Heading]], ![[Note#^block]]) for <ofm-markdown> and the editor.
// The note service loads notes; this module decides what part of a note to show, and builds the DOM.
// It creates <ofm-markdown> by tag name, so the caller registers the element.
import type { NoteService } from './note-service.ts';
import { IMAGE_EXTENSIONS } from './ofm-inline.ts';
import { renderer, splitFrontmatter } from './render.ts';

/** Embeds nest at most this deep. */
export const MAX_DEPTH = 4;

const md = renderer();

/** The part of a note an embed names: all of it, a heading's section (`Heading`) or a block (`^id`). Undefined if it isn't there. */
export const section = (note: string, sub = ''): string | undefined => {
  const { content } = splitFrontmatter(note);
  if (sub === '') return content;
  const lines = content.split('\n');
  const tokens = md.parse(content, {});
  if (sub.startsWith('^')) {
    const token = tokens.find((t) => t.map && t.attrGet('data-block-id') === sub.slice(1));
    return token?.map ? lines.slice(...token.map).join('\n') : undefined;
  }
  const heading = tokens.findIndex((t, i) => t.type === 'heading_open' && tokens[i + 1].content.trim() === sub.trim());
  if (heading === -1) return undefined;
  const { tag, map } = tokens[heading];
  // h1 < h2 as strings, so this finds the next heading of the same or a higher level.
  const next = tokens.slice(heading + 1).find((t) => t.type === 'heading_open' && t.level === 0 && t.tag <= tag);
  return lines.slice(map![0], next?.map?.[0] ?? lines.length).join('\n');
};

/** Properties an owner sets on the <ofm-markdown> it creates, so it uses the owner's service. */
export type EmbedHost = HTMLElement & { value: string; noteService?: NoteService; embedStack?: readonly string[] };

const isImage = (target: string) => IMAGE_EXTENSIONS.has(target.split('#')[0].split('.').pop()?.toLowerCase() ?? '');

const placeholder = (target: string) => {
  const span = document.createElement('span');
  span.className = 'internal-embed';
  span.setAttribute('src', target);
  return span;
};

/** Load the note into `content`. Its own embeds fill in from the nested <ofm-markdown>, one level deeper. */
const fill = async (element: HTMLElement, content: HTMLElement, target: string, service: NoteService, stack: readonly string[]) => {
  const [name, ...rest] = target.split('#');
  // Past the cap, or a note already being shown above this one: keep the placeholder, which breaks cycles.
  if (stack.length >= MAX_DEPTH || stack.includes(name)) return;
  const result = await service.load(name);
  if (!result.ok) {
    if (result.error.type === 'failed') console.warn(`ofm-markdown: could not load ${name}`, result.error.cause);
    if (result.error.type !== 'no-loader') element.classList.add('is-unresolved');
    return;
  }
  const source = section(result.value, rest.join('#'));
  if (source === undefined) {
    element.classList.add('is-unresolved');
    return;
  }
  const markdown = document.createElement('ofm-markdown') as EmbedHost;
  markdown.noteService = service;
  markdown.embedStack = [...stack, name];
  markdown.value = source;
  content.replaceChildren(markdown);
};

/** An embed of another note, as Obsidian draws it. Shows a placeholder until the note loads. */
export const embed = (target: string, service: NoteService, stack: readonly string[]) => {
  const element = document.createElement('div');
  element.className = 'internal-embed markdown-embed';
  element.setAttribute('src', target);
  const link = document.createElement('a');
  link.className = 'markdown-embed-link internal-link';
  link.setAttribute('data-href', target);
  link.setAttribute('aria-label', `Open ${target}`);
  // Inside <ofm-markdown>, its click handler fires click-wikilink for this link. Elsewhere, such as an editor widget, fire it here.
  link.addEventListener('click', (event) => {
    if (link.parentElement?.closest('ofm-markdown')) return;
    event.preventDefault();
    link.dispatchEvent(new CustomEvent('click-wikilink', { bubbles: true, composed: true, cancelable: true, detail: { target } }));
  });
  const content = document.createElement('div');
  content.className = 'markdown-embed-content';
  element.append(link, content);
  refill(element, service, stack);
  return element;
};

/** Show the placeholder, then load the note again. Keeps the element, which may be an editor widget's root. */
const refill = (element: Element, service: NoteService, stack: readonly string[]) => {
  const target = element.getAttribute('src') ?? '';
  const content = element.querySelector(':scope > .markdown-embed-content') as HTMLElement;
  element.classList.remove('is-unresolved');
  content.replaceChildren(placeholder(target));
  void fill(element as HTMLElement, content, target, service, stack);
};

/** Elements under `root` from its own render: not inside a nested <ofm-markdown>, which handles its own. */
const own = (root: Element | DocumentFragment, selector: string) => {
  const owner = root instanceof Element ? root.closest('ofm-markdown') : null;
  return [...root.querySelectorAll(selector)].filter((el) => el.parentElement?.closest('ofm-markdown') === owner);
};

/**
 * Replace the note-embed placeholders render() leaves under `root` with embeds, once the service answers.
 * With no loader set, the placeholders stay as render() made them. Image embeds are already <img>.
 */
export const fillEmbeds = (root: Element | DocumentFragment, service: NoteService, stack: readonly string[]) => {
  for (const span of own(root, 'span.internal-embed[src]')) {
    const target = span.getAttribute('src') ?? '';
    if (isImage(target)) continue;
    // fill() loads the same note again, from the cache.
    void service.load(target.split('#')[0]).then((result) => {
      if (result.ok || result.error.type !== 'no-loader') span.replaceWith(embed(target, service, stack));
    });
  }
};

/**
 * Rebuild the embeds under `root` that show note `name`, after it changed. With no name, rebuild them all and fill
 * placeholders left from when there was no loader. Nested <ofm-markdown>s refresh their own embeds.
 */
export const refreshEmbeds = (root: Element | DocumentFragment, service: NoteService, stack: readonly string[], name?: string) => {
  for (const element of own(root, 'div.internal-embed.markdown-embed[src]')) {
    const target = element.getAttribute('src') ?? '';
    if (name === undefined || target.split('#')[0] === name) refill(element, service, stack);
  }
  if (name === undefined) fillEmbeds(root, service, stack);
};
