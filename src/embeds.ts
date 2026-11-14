// Note embeds (![[Note]], ![[Note#Heading]], ![[Note#^block]]).
// The note service loads notes; this module decides what part of a note to show, and builds the DOM.
import { drawIcons } from './decorate.ts';
import { draw, highlight } from './draw.ts';
import type { NoteService } from './services/note.ts';
import { isImagePath } from './ofm-inline.ts';
import { render, renderer, splitFrontmatter } from './render.ts';
import type { RenderOptions } from './render.ts';

/** Embeds nest at most this deep, as in Obsidian. Depth alone stops cycles: a note that embeds itself repeats until the cap. */
export const MAX_DEPTH = 5;

const md = renderer();

/** An embed target's note name and subpath: `Note#Heading` → `{ name: 'Note', sub: 'Heading' }`. */
export const parseTarget = (target: string): { name: string; sub: string } => {
  const i = target.indexOf('#');
  return i === -1 ? { name: target, sub: '' } : { name: target.slice(0, i), sub: target.slice(i + 1) };
};

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


/** The note-embed placeholders render() left under `root`. */
export const embedPlaceholders = (root: ParentNode): Element[] =>
  [...root.querySelectorAll('span.internal-embed[src]:not(.image-embed)')]
    .filter((span) => !isImagePath(span.getAttribute('src') ?? ''));

/** Whether anything under `root` embeds note `name`, filled or not. */
export const embedsNote = (root: ParentNode, name: string): boolean =>
  [...root.querySelectorAll('.internal-embed[src]')].some((el) => parseTarget(el.getAttribute('src') ?? '').name === name);

const element = (tag: string, className: string) => {
  const el = document.createElement(tag);
  el.className = className;
  return el;
};

/**
 * An embed's frame, as Obsidian builds it: the note's name as a title (a whole note only), a link to open the note,
 * and an empty reading view for its content.
 */
export const embedFrame = (target: string): { frame: HTMLElement; content: HTMLElement } => {
  const { name, sub } = parseTarget(target);
  const frame = element('div', 'internal-embed markdown-embed inline-embed is-loaded');
  frame.setAttribute('src', target);
  const title = element('div', 'embed-title markdown-embed-title');
  if (sub === '') title.textContent = name;
  // A link where Obsidian has a div, so the keyboard reaches it.
  const link = element('a', 'markdown-embed-link');
  link.setAttribute('data-href', target);
  link.setAttribute('aria-label', 'Open link');
  link.tabIndex = 0;
  const content = element('div', 'markdown-preview-view markdown-rendered');
  const box = element('div', 'markdown-embed-content');
  box.append(content);
  frame.append(title, link, box);
  return { frame, content };
};

/** What stands in for an embed whose note or section isn't there, as Obsidian shows a file that doesn't exist. */
export const missingEmbed = (target: string): HTMLElement => {
  const frame = element('div', 'internal-embed file-embed mod-empty is-loaded');
  frame.setAttribute('src', target);
  frame.textContent = `“${target}” could not be found.`;
  return frame;
};

/**
 * Replace the placeholders under `root` with embedded notes as they load, then fill their embeds one level deeper.
 * With no loader set, the placeholders stay as render() made them.
 * Resolves once every embed, at every depth, is in place, drawn and highlighted. Never rejects.
 */
export const fillEmbeds = async (root: ParentNode, service: NoteService, options: RenderOptions = {}, depth = 0): Promise<void> => {
  if (depth >= MAX_DEPTH) return;
  await Promise.all(embedPlaceholders(root).map((span) => {
    const target = span.getAttribute('src') ?? '';
    const { name, sub } = parseTarget(target);
    return service.load(name).then(async (result) => {
      if (!result.ok && result.error.type === 'no-loader') return;
      if (!result.ok && result.error.type === 'failed') console.warn(`ofm-markdown: could not load ${name}`, result.error.cause);
      const source = result.ok ? section(result.value, sub) : undefined;
      if (source === undefined) {
        span.replaceWith(missingEmbed(target));
        return;
      }
      const { frame, content } = embedFrame(target);
      span.replaceWith(frame);
      // Draw off-screen, so the embed appears with its math and diagrams. Highlighting follows, as for the note.
      const note = renderNoteEmbeds(source, service, options, depth + 1);
      await draw(note.content);
      content.append(note.content);
      // Callout icons come from computed styles, so an embed still off-screen waits for the note that holds it.
      await Promise.all([highlight(content), note.loaded, frame.isConnected ? drawIcons(frame) : undefined]);
    });
  }));
};

/**
 * A note's source as DOM, with its embeds filling in as they load, `depth` levels down. Not yet drawn: call draw().
 * `loaded` resolves once the embeds are filled (see fillEmbeds).
 * A template's content is inert until it's inserted, so drawing it off-screen is safe.
 */
export const renderNoteEmbeds = (source: string, service: NoteService, options: RenderOptions = {}, depth = 0) => {
  const template = document.createElement('template');
  template.innerHTML = render(source, options);
  return { content: template.content, loaded: fillEmbeds(template.content, service, options, depth) };
};
