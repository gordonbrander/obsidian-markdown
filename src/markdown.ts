import MarkdownIt from 'markdown-it';
import type { RendererRule } from 'markdown-it';
import { ofmBlock } from './ofm-block.ts';
import { ofmCore } from './ofm-core.ts';
import { ofmFootnote } from './ofm-footnote.ts';
import { ofmInline } from './ofm-inline.ts';

// ponytail: raw HTML is escaped (SPEC 5.5 and 7.13 unmet). Turning this on requires a sanitizer before unsafeHTML.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true, xhtmlOut: true });

// linkify-it only finds schemes, so GFM's bare www. links need their own (SPEC 7.12).
md.linkify.add('www.', {
  validate(text, pos, self) {
    const re = new RegExp(self.re.get_url_host_port().source + self.re.get_path().source, 'iy');
    re.lastIndex = pos;
    return re.exec(text)?.[0].length ?? 0;
  },
  normalize(match) {
    match.url = `http://${match.url}`;
  },
});

md.use(ofmBlock).use(ofmInline).use(ofmCore).use(ofmFootnote);

// The canonical output uses align, where markdown-it writes a style (SPEC Example 14).
const cellOpen: RendererRule = (tokens, idx, options, _env, self) => {
  const token = tokens[idx];
  const style = token.attrGet('style');
  if (typeof style === 'string') token.attrs = [['align', style.replace('text-align:', '')]];
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.th_open = cellOpen;
md.renderer.rules.td_open = cellOpen;

// The canonical output uses del, where markdown-it writes s (SPEC Example 41).
md.renderer.rules.s_open = () => '<del>';
md.renderer.rules.s_close = () => '</del>';

const IMAGE_SIZE = /^(?:(.*)\|)?(\d+)(?:x(\d+))?$/;

// A description may end with a size, or be only a size (SPEC 7.9).
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const description = self.renderInlineAsText(token.children ?? [], options, env);
  const size = description.match(IMAGE_SIZE);
  token.attrSet('alt', size ? size[1] ?? '' : description);
  if (size) token.attrSet('width', size[2]);
  if (size?.[3]) token.attrSet('height', size[3]);
  return self.renderToken(tokens, idx, options);
};

const BOM = /^﻿/;
const FRONT_MATTER = /^---[ \t]*\r?\n(?:[\s\S]*?\r?\n)?---[ \t]*(?:\r?\n|$)/;

export type RenderOptions = { strictLineBreaks?: boolean };

/** Render Obsidian Flavored Markdown to the canonical HTML of SPEC.md. */
export const renderMarkdown = (src: string, { strictLineBreaks = false }: RenderOptions = {}): string => {
  const env = {};
  const body = src.replace(BOM, '').replace(FRONT_MATTER, '');
  return md.renderer.render(md.parse(body, env), { ...md.options, breaks: !strictLineBreaks }, env);
};
