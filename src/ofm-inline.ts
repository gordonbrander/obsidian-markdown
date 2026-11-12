import type { MarkdownIt, Delimiter, StateInline } from 'markdown-it';
import { hasScheme, parseWikilink } from './sniff.ts';

export const IMAGE_EXTENSIONS = new Set(['avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp']);
export const EMBED_SIZE = /^(\d+)(?:x(\d+))?$/;
export const HIGHLIGHT_COLORS: [string, string][] = [
  ['🔴', 'red'],
  ['🟠', 'orange'],
  ['🟡', 'yellow'],
  ['🟢', 'green'],
  ['🔵', 'blue'],
  ['🟣', 'purple'],
];

/** SPEC 7.6: letters, marks, numbers, _ - / and non-ASCII symbols, including joined emoji. */
export const TAG = /#((?:[\p{L}\p{M}\p{N}_\-/‍]|\p{Extended_Pictographic}|(?![\x00-\x7f])\p{S})+)/uy;
export const ALL_DIGITS = /^\p{Nd}+$/u;
const WHITESPACE = /\s/;

/** Index of `needle` between `from` and the end of the line, or -1. */
const indexInLine = (state: StateInline, needle: string, from: number) => {
  let end = state.src.indexOf('\n', from);
  if (end === -1 || end > state.posMax) end = state.posMax;
  const index = state.src.slice(from, end).indexOf(needle);
  return index === -1 ? -1 : from + index;
};

const comment = (state: StateInline, silent: boolean): boolean => {
  if (!state.src.startsWith('%%', state.pos)) return false;
  const close = indexInLine(state, '%%', state.pos + 2);
  if (close === -1) return false;
  let next = close + 2;
  if (!silent) {
    if (state.pending === '' && state.tokens.length === 0) {
      while (next < state.posMax && state.md.utils.isSpace(state.src.charCodeAt(next))) next++;
    }
    if (state.src.slice(next, state.posMax).trim() === '') state.pending = state.pending.trimEnd();
  }
  state.pos = next;
  return true;
};

const math = (state: StateInline, silent: boolean): boolean => {
  const { src, pos } = state;
  if (src[pos] !== '$') return false;

  const emit = (type: string, content: string) => {
    if (!silent) state.push(type, 'span', 0).content = content;
  };

  if (src.startsWith('$$', pos)) {
    const close = indexInLine(state, '$$', pos + 2);
    if (close <= pos + 2) return false;
    emit('math_display', src.slice(pos + 2, close));
    state.pos = close + 2;
    return true;
  }

  if (pos + 1 >= state.posMax || WHITESPACE.test(src[pos + 1])) return false;
  let close = indexInLine(state, '$', pos + 1);
  while (close !== -1 && (WHITESPACE.test(src[close - 1]) || src[close - 1] === '\\')) {
    close = indexInLine(state, '$', close + 1);
  }
  if (close === -1) return false;
  emit('math_inline', src.slice(pos + 1, close));
  state.pos = close + 1;
  return true;
};

const tag = (state: StateInline, silent: boolean): boolean => {
  const { src, pos } = state;
  if (src[pos] !== '#' || state.linkLevel > 0) return false;
  const afterTag = state.pending === '' && state.tokens.at(-1)?.type === 'tag';
  if (pos !== 0 && !WHITESPACE.test(src[pos - 1]) && !afterTag) return false;

  TAG.lastIndex = pos;
  const match = TAG.exec(src);
  if (!match || pos + match[0].length > state.posMax || ALL_DIGITS.test(match[1])) return false;
  if (!silent) state.push('tag', 'a', 0).content = match[1];
  state.pos += match[0].length;
  return true;
};

const parseLinkAt = (state: StateInline, open: number) => {
  if (!state.src.startsWith('[[', open)) return null;
  const close = indexInLine(state, ']]', open + 2);
  if (close === -1) return null;
  const link = parseWikilink(state.src.slice(open, close + 2));
  return link && { ...link, end: close + 2 };
};

const wikilink = (state: StateInline, silent: boolean): boolean => {
  const link = parseLinkAt(state, state.pos);
  if (!link) return false;
  if (!silent) state.push('wikilink', 'a', 0).meta = { target: link.target, label: link.label };
  state.pos = link.end;
  return true;
};

const embed = (state: StateInline, silent: boolean): boolean => {
  if (state.src[state.pos] !== '!') return false;
  const link = parseLinkAt(state, state.pos + 1);
  if (!link) return false;
  if (!silent) state.push('embed', 'span', 0).meta = { target: link.target, label: link.label };
  state.pos = link.end;
  return true;
};

const highlightTokenize = (state: StateInline, silent: boolean): boolean => {
  if (silent || state.src[state.pos] !== '=') return false;
  const scanned = state.scanDelims(state.pos, true);
  // Whole runs are consumed, so === can't be read as == followed by =.
  if (scanned.length !== 2) {
    state.pending += state.src.slice(state.pos, state.pos + scanned.length);
    state.pos += scanned.length;
    return true;
  }
  state.push('text', '', 0).content = '==';
  state.delimiters.push({
    marker: 0x3d,
    length: 0,
    token: state.tokens.length - 1,
    end: -1,
    open: scanned.can_open,
    close: scanned.can_close,
  });
  state.pos += 2;
  return true;
};

const applyHighlights = (state: StateInline, delimiters: Delimiter[]) => {
  for (const delimiter of delimiters) {
    if (delimiter.marker !== 0x3d || delimiter.end === -1) continue;
    const open = state.tokens[delimiter.token];
    const close = state.tokens[delimiters[delimiter.end].token];
    Object.assign(open, { type: 'mark_open', tag: 'mark', nesting: 1, markup: '==', content: '' });
    Object.assign(close, { type: 'mark_close', tag: 'mark', nesting: -1, markup: '==', content: '' });

    const first = state.tokens[delimiter.token + 1];
    const color = first?.type === 'text' && HIGHLIGHT_COLORS.find(([emoji]) => first.content.startsWith(emoji));
    if (color) {
      first.content = first.content.slice(color[0].length);
      open.attrSet('data-highlight', color[1]);
    }
  }
};

const highlightPostProcess = (state: StateInline) => {
  applyHighlights(state, state.delimiters);
  for (const meta of state.tokens_meta) {
    if (meta?.delimiters) applyHighlights(state, meta.delimiters);
  }
};

/** Browsers skip control characters and spaces in URLs, so `java\tscript:` still runs. */
export const ofmInline = (md: MarkdownIt) => {
  const { escapeHtml } = md.utils;
  // Targets are vault paths and skip validateLink, so anything with a scheme gets no URL.
  const urlAttr = (name: string, url: string) => (hasScheme(url) ? '' : ` ${name}="${escapeHtml(url)}"`);

  md.inline.ruler.before('emphasis', 'ofm_comment', comment);
  md.inline.ruler.before('emphasis', 'ofm_math', math);
  md.inline.ruler.before('emphasis', 'ofm_tag', tag);
  md.inline.ruler.before('emphasis', 'ofm_highlight', highlightTokenize);
  md.inline.ruler2.before('emphasis', 'ofm_highlight', highlightPostProcess);
  md.inline.ruler.before('link', 'ofm_wikilink', wikilink);
  md.inline.ruler.before('image', 'ofm_embed', embed);

  const { rules } = md.renderer;

  rules.math_inline = (tokens, idx) =>
    `<span class="math math-inline">${escapeHtml(tokens[idx].content)}</span>`;
  rules.math_display = (tokens, idx) =>
    `<span class="math math-display">${escapeHtml(tokens[idx].content)}</span>`;

  rules.tag = (tokens, idx) => {
    const name = escapeHtml(tokens[idx].content);
    return `<a class="tag" href="#${name}">#${name}</a>`;
  };

  rules.wikilink = (tokens, idx) => {
    const { target, label } = tokens[idx].meta as { target: string; label: string };
    const attrs = `class="internal-link" data-href="${escapeHtml(target)}"${urlAttr('href', target)}`;
    return `<a ${attrs}>${escapeHtml(label)}</a>`;
  };

  rules.embed = (tokens, idx) => {
    const { target, label } = tokens[idx].meta as { target: string; label: string };
    const extension = target.split('#')[0].split('.').pop()?.toLowerCase() ?? '';
    if (!IMAGE_EXTENSIONS.has(extension)) {
      return `<span class="internal-embed" src="${escapeHtml(target)}"></span>`;
    }
    const size = label.match(EMBED_SIZE);
    const alt = size || label === target ? target : label;
    const width = size ? ` width="${size[1]}"` : '';
    const height = size?.[2] ? ` height="${size[2]}"` : '';
    return `<img class="internal-embed"${urlAttr('src', target)} alt="${escapeHtml(alt)}"${width}${height} />`;
  };
};
