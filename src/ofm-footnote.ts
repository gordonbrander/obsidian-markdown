// Adapted from markdown-it-footnote (MIT, Vitaly Puzrin and Alex Kocharin).
// Differs for SPEC 6.3: a 2-space continuation indent and case-insensitive labels.
import type { MarkdownIt, StateBlock, StateCore, StateInline, Token } from 'markdown-it';

type Footnote = { label?: string; count: number; content?: string; tokens?: Token[] };
type Footnotes = { refs: Map<string, number>; list: Footnote[] };
type FootnoteEnv = { footnotes?: Footnotes };
type RefMeta = { id: number; subId: number };

const CONTINUATION_INDENT = 2;
const UNNUMBERED = -1;

const footnotesOf = (env: FootnoteEnv): Footnotes => (env.footnotes ??= { refs: new Map(), list: [] });
const normalize = (label: string) => label.toLowerCase();
const refId = ({ id, subId }: RefMeta) => (subId > 0 ? `${id + 1}-${subId + 1}` : `${id + 1}`);

const definition = (state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean => {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false;
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  if (start + 4 > max || !state.src.startsWith('[^', start)) return false;

  let pos = start + 2;
  while (pos < max && state.src[pos] !== ']') {
    if (state.md.utils.isSpace(state.src.charCodeAt(pos))) return false;
    pos++;
  }
  if (pos === start + 2 || pos + 1 >= max || state.src[pos + 1] !== ':') return false;
  if (silent) return true;

  const label = normalize(state.src.slice(start + 2, pos));
  footnotesOf(state.env as FootnoteEnv).refs.set(label, UNNUMBERED);
  pos += 2;

  const open = state.push('footnote_reference_open', '', 1);
  open.meta = { label };

  const saved = {
    bMark: state.bMarks[startLine],
    tShift: state.tShift[startLine],
    sCount: state.sCount[startLine],
    parentType: state.parentType,
  };

  const afterColon = pos;
  const initial = state.sCount[startLine] + pos - start;
  let offset = initial;
  while (pos < max && state.md.utils.isSpace(state.src.charCodeAt(pos))) {
    offset += state.src[pos] === '\t' ? 4 - (offset % 4) : 1;
    pos++;
  }

  state.tShift[startLine] = pos - afterColon;
  state.sCount[startLine] = offset - initial;
  state.bMarks[startLine] = afterColon;
  state.blkIndent += CONTINUATION_INDENT;
  state.parentType = 'footnote' as typeof state.parentType;
  if (state.sCount[startLine] < state.blkIndent) state.sCount[startLine] += state.blkIndent;

  state.md.block.tokenize(state, startLine, endLine);

  state.parentType = saved.parentType;
  state.blkIndent -= CONTINUATION_INDENT;
  state.tShift[startLine] = saved.tShift;
  state.sCount[startLine] = saved.sCount;
  state.bMarks[startLine] = saved.bMark;

  state.push('footnote_reference_close', '', -1);
  return true;
};

const reference = (state: StateInline, silent: boolean): boolean => {
  const { src, posMax } = state;
  const start = state.pos;
  if (start + 3 > posMax || !src.startsWith('[^', start)) return false;
  const footnotes = (state.env as FootnoteEnv).footnotes;
  if (!footnotes) return false;

  let pos = start + 2;
  while (pos < posMax && src[pos] !== ']') {
    if (state.md.utils.isSpace(src.charCodeAt(pos)) || src[pos] === '\n') return false;
    pos++;
  }
  if (pos === start + 2 || pos >= posMax) return false;
  const label = normalize(src.slice(start + 2, pos));
  const known = footnotes.refs.get(label);
  if (known === undefined) return false;

  if (!silent) {
    const id = known === UNNUMBERED ? footnotes.list.length : known;
    if (known === UNNUMBERED) {
      footnotes.list.push({ label, count: 0 });
      footnotes.refs.set(label, id);
    }
    const subId = footnotes.list[id].count++;
    state.push('footnote_ref', '', 0).meta = { id, subId };
  }
  state.pos = pos + 1;
  return true;
};

const inlineFootnote = (state: StateInline, silent: boolean): boolean => {
  const start = state.pos;
  if (start + 2 >= state.posMax || !state.src.startsWith('^[', start)) return false;
  const labelEnd = state.md.helpers.parseLinkLabel(state, start + 1);
  if (labelEnd < 0) return false;

  if (!silent) {
    const footnotes = footnotesOf(state.env as FootnoteEnv);
    const id = footnotes.list.length;
    const content = state.src.slice(start + 2, labelEnd);
    const tokens: Token[] = [];
    state.md.inline.parse(content, state.md, state.env, tokens);
    footnotes.list.push({ content, tokens, count: 1 });
    state.push('footnote_ref', '', 0).meta = { id, subId: 0 };
  }
  state.pos = labelEnd + 1;
  return true;
};

const tail = (state: StateCore) => {
  const footnotes = (state.env as FootnoteEnv).footnotes;
  if (!footnotes) return;

  const definitions = new Map<string, Token[]>();
  let current: Token[] | null = null;
  state.tokens = state.tokens.filter((token) => {
    if (token.type === 'footnote_reference_open') {
      current = [];
      definitions.set((token.meta as { label: string }).label, current);
      return false;
    }
    if (token.type === 'footnote_reference_close') {
      current = null;
      return false;
    }
    current?.push(token);
    return current === null;
  });
  if (footnotes.list.length === 0) return;

  state.tokens.push(new state.Token('footnote_block_open', '', 1));
  footnotes.list.forEach((footnote, id) => {
    const open = new state.Token('footnote_open', '', 1);
    open.meta = { id, subId: 0 };
    state.tokens.push(open);

    let body: Token[];
    if (footnote.tokens) {
      const inline = new state.Token('inline', '', 0);
      inline.content = footnote.content ?? '';
      inline.children = footnote.tokens;
      const paragraphOpen = new state.Token('paragraph_open', 'p', 1);
      const paragraphClose = new state.Token('paragraph_close', 'p', -1);
      paragraphOpen.block = paragraphClose.block = true;
      body = [paragraphOpen, inline, paragraphClose];
    } else {
      body = definitions.get(footnote.label ?? '') ?? [];
    }

    // The back-reference goes inside the last paragraph.
    const lastParagraph = body.at(-1)?.type === 'paragraph_close' ? body.at(-1) : undefined;
    state.tokens.push(...(lastParagraph ? body.slice(0, -1) : body));
    for (let subId = 0; subId < Math.max(footnote.count, 1); subId++) {
      const anchor = new state.Token('footnote_anchor', '', 0);
      anchor.meta = { id, subId };
      state.tokens.push(anchor);
    }
    if (lastParagraph) state.tokens.push(lastParagraph);
    state.tokens.push(new state.Token('footnote_close', '', -1));
  });
  state.tokens.push(new state.Token('footnote_block_close', '', -1));
};

export const ofmFootnote = (md: MarkdownIt) => {
  md.block.ruler.before('reference', 'ofm_footnote_def', definition, { alt: ['paragraph', 'reference'] });
  md.inline.ruler.before('link', 'ofm_footnote_ref', reference);
  md.inline.ruler.before('image', 'ofm_footnote_inline', inlineFootnote);
  md.core.ruler.after('ofm_empty_paragraphs', 'ofm_footnote_tail', tail);

  const { rules } = md.renderer;
  rules.footnote_ref = (tokens, idx) => {
    const meta = tokens[idx].meta as RefMeta;
    const number = meta.id + 1;
    return `<sup class="footnote-ref"><a href="#fn-${number}" id="fnref-${refId(meta)}">${number}</a></sup>`;
  };
  rules.footnote_block_open = () => '<section class="footnotes">\n<ol>\n';
  rules.footnote_block_close = () => '</ol>\n</section>\n';
  rules.footnote_open = (tokens, idx) => `<li id="fn-${(tokens[idx].meta as RefMeta).id + 1}">\n`;
  rules.footnote_close = () => '</li>\n';
  rules.footnote_anchor = (tokens, idx) =>
    ` <a href="#fnref-${refId(tokens[idx].meta as RefMeta)}" class="footnote-backref">↩</a>`;
};
