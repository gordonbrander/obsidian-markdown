// Note embeds (![[Note]], ![[Note#Heading]], ![[Note#^block]]).
// The note service loads notes; this module decides what part of a note to show, and builds the DOM.
import { draw } from './draw.ts';
import type { NoteService } from './services/note.ts';
import { IMAGE_EXTENSIONS } from './ofm-inline.ts';
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

const isImage = (name: string) => IMAGE_EXTENSIONS.has(name.split('.').pop()?.toLowerCase() ?? '');

/** The note-embed placeholders render() left under `root`. */
export const embedPlaceholders = (root: ParentNode): Element[] =>
  [...root.querySelectorAll('span.internal-embed[src]')].filter((span) => !isImage(parseTarget(span.getAttribute('src') ?? '').name));

/** Whether anything under `root` embeds note `name`, filled or not. */
export const embedsNote = (root: ParentNode, name: string): boolean =>
  [...root.querySelectorAll('.internal-embed[src]')].some((el) => parseTarget(el.getAttribute('src') ?? '').name === name);

/** An embed's frame, as Obsidian draws it: a link to open the note, and an empty box for its content. */
export const embedFrame = (target: string): { frame: HTMLElement; content: HTMLElement } => {
  const frame = document.createElement('div');
  frame.className = 'internal-embed markdown-embed';
  frame.setAttribute('src', target);
  const link = document.createElement('a');
  link.className = 'markdown-embed-link internal-link';
  link.setAttribute('data-href', target);
  link.setAttribute('aria-label', `Open ${target}`);
  const content = document.createElement('div');
  content.className = 'markdown-embed-content';
  frame.append(link, content);
  return { frame, content };
};

/**
 * Replace the placeholders under `root` with embedded notes as they load, then fill their embeds one level deeper.
 * With no loader set, the placeholders stay as render() made them.
 */
export const fillEmbeds = (root: ParentNode, service: NoteService, options: RenderOptions = {}, depth = 0) => {
  if (depth >= MAX_DEPTH) return;
  for (const span of embedPlaceholders(root)) {
    const target = span.getAttribute('src') ?? '';
    const { name, sub } = parseTarget(target);
    void service.load(name).then((result) => {
      if (!result.ok && result.error.type === 'no-loader') return;
      if (!result.ok && result.error.type === 'failed') console.warn(`ofm-markdown: could not load ${name}`, result.error.cause);
      const { frame, content } = embedFrame(target);
      span.replaceWith(frame);
      const source = result.ok ? section(result.value, sub) : undefined;
      if (source === undefined) {
        frame.classList.add('is-unresolved');
        return;
      }
      void renderNote(source, service, options, depth + 1).then((note) => content.append(note));
    });
  }
};

/**
 * A note's source as drawn DOM, ready to insert. Its embeds fill in as they load, `depth` levels down.
 * Draws off-screen: a template's content is inert until it's inserted.
 */
export const renderNote = async (source: string, service: NoteService, options: RenderOptions = {}, depth = 0) => {
  const template = document.createElement('template');
  template.innerHTML = render(source, options);
  fillEmbeds(template.content, service, options, depth);
  await draw(template.content);
  return template.content;
};
