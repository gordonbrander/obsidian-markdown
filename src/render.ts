import markdownit from 'markdown-it';
import type { MarkdownIt, RendererRule } from 'markdown-it';
import { parse } from 'yaml';
import { ofmBlock } from './ofm-block.ts';
import { ofmCore } from './ofm-core.ts';
import { ofmFootnote } from './ofm-footnote.ts';
import { ofmInline } from './ofm-inline.ts';

// The canonical output uses align, where markdown-it writes a style (SPEC Example 14).
const cellOpen: RendererRule = (tokens, idx, options, _env, self) => {
  const token = tokens[idx];
  const style = token.attrGet('style');
  if (typeof style === 'string') token.attrs = [['align', style.replace('text-align:', '')]];
  return self.renderToken(tokens, idx, options);
};

const IMAGE_SIZE = /^(?:(.*)\|)?(\d+)(?:x(\d+))?$/;

// A description may end with a size, or be only a size (SPEC 7.9).
const image: RendererRule = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const description = self.renderInlineAsText(token.children ?? [], options, env);
  const size = description.match(IMAGE_SIZE);
  token.attrSet('alt', size ? size[1] ?? '' : description);
  if (size) token.attrSet('width', size[2]);
  if (size?.[3]) token.attrSet('height', size[3]);
  return self.renderToken(tokens, idx, options);
};

/** Configure a MarkdownIt instance to render Obsidian Flavored Markdown as SPEC.md describes. Mutates and returns it. */
export const config = (md: MarkdownIt): MarkdownIt => {
  // ponytail: raw HTML is escaped (SPEC 5.5 and 7.13 unmet). Turning this on requires a sanitizer before unsafeHTML.
  md.set({ html: false, linkify: true, breaks: true, xhtmlOut: true });

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

  md.renderer.rules.th_open = cellOpen;
  md.renderer.rules.td_open = cellOpen;
  // The canonical output uses del, where markdown-it writes s (SPEC Example 41).
  md.renderer.rules.s_open = () => '<del>';
  md.renderer.rules.s_close = () => '</del>';
  md.renderer.rules.image = image;
  return md;
};

/** A new MarkdownIt instance, configured for Obsidian Flavored Markdown. */
export const renderer = (): MarkdownIt => config(markdownit());

const BOM = /^﻿/;
const FRONT_MATTER = /^---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*(?:\r?\n|$)/;

/** Split a note into its raw front matter (SPEC 4) and the content after it. */
export const splitFrontmatter = (text: string): { frontmatter?: string; content: string } => {
  const src = text.replace(BOM, '');
  const match = src.match(FRONT_MATTER);
  if (!match) return { content: src };
  return { frontmatter: match[1] ?? '', content: src.slice(match[0].length) };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Split a note and parse its front matter as YAML. Invalid YAML throws. */
export const parseFrontmatter = (text: string): { data: Record<string, unknown>; content: string } => {
  const { frontmatter, content } = splitFrontmatter(text);
  const data: unknown = frontmatter === undefined ? {} : parse(frontmatter);
  return { data: isRecord(data) ? data : {}, content };
};

const md = renderer();

export type RenderOptions = { strictLineBreaks?: boolean };

/** Render Obsidian Flavored Markdown to the canonical HTML of SPEC.md. */
export const render = (src: string, { strictLineBreaks = false }: RenderOptions = {}): string => {
  const env = {};
  const { content } = splitFrontmatter(src);
  return md.renderer.render(md.parse(content, env), { ...md.options, breaks: !strictLineBreaks }, env);
};
