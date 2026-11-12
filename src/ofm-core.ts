import type { MarkdownIt, StateCore, Token } from 'markdown-it';

export const CALLOUT = /^\[!([^\]|\s]+)(?:\|([^\]]*))?\]([+-]?)(?:[ \t]+(.*))?$/;
export const BLOCK_ID = /(?:^|[ \t\n])\^([A-Za-z0-9-]+)[ \t]*$/;
const TASK = /^\[(.)\](?=[ \t\n]|$)/u;

const isQuote = (token: Token | null) => token?.type === 'blockquote_open' || token?.type === 'callout_open';

/** Index of the token that closes the one at `open`. */
const closeOf = (tokens: Token[], open: number) => {
  let depth = 0;
  for (let i = open; i < tokens.length; i++) {
    depth += tokens[i].nesting;
    if (depth === 0) return i;
  }
  return tokens.length - 1;
};

const wrapper = (state: StateCore, type: string, className: string, body: Token[], tag = 'div') => {
  const open = new state.Token(`${type}_open`, tag, 1);
  open.attrSet('class', className);
  const close = new state.Token(`${type}_close`, tag, -1);
  open.block = close.block = tag !== 'span';
  return [open, ...body, close];
};

const callouts = (state: StateCore) => {
  const { tokens } = state;
  // Back to front, so nested quotes are already balanced when their parent is rewritten.
  for (let open = tokens.length - 1; open >= 0; open--) {
    if (tokens[open].type !== 'blockquote_open' || tokens[open + 1]?.type !== 'paragraph_open') continue;
    const paragraph = tokens[open + 2];
    const [firstLine, ...rest] = paragraph.content.split('\n');
    const match = firstLine.match(CALLOUT);
    if (!match) continue;

    const [, rawType, metadata, fold, title] = match;
    const type = rawType.toLowerCase();
    const close = closeOf(tokens, open);

    // Foldable callouts are <details>, so the browser folds them with no script.
    const tag = fold ? 'details' : 'div';
    const opening = tokens[open];
    Object.assign(opening, { type: 'callout_open', tag });
    opening.attrSet('class', fold ? 'callout is-collapsible' : 'callout');
    opening.attrSet('data-callout', type);
    if (fold) opening.attrSet('data-callout-fold', fold);
    if (fold === '+') opening.attrSet('open', '');
    if (metadata !== undefined) opening.attrSet('data-callout-metadata', metadata);
    Object.assign(tokens[close], { type: 'callout_close', tag });

    const titleInline = new state.Token('inline', '', 0);
    titleInline.content = title?.trim() || type.charAt(0).toUpperCase() + type.slice(1);
    titleInline.children = [];

    paragraph.content = rest.join('\n');
    const body = tokens.slice(rest.length > 0 ? open + 1 : open + 4, close);
    tokens.splice(
      open + 1,
      close - open - 1,
      ...wrapper(state, 'callout_title', 'callout-title', [
        ...wrapper(state, 'callout_title_inner', 'callout-title-inner', [titleInline], 'span'),
        ...(fold ? wrapper(state, 'callout_fold', 'callout-fold', [], 'span') : []),
      ], fold ? 'summary' : 'div'),
      ...(body.length > 0 ? wrapper(state, 'callout_content', 'callout-content', body) : []),
    );
  }
};

type Frame = { open: Token | null; last: Token | null };

const blockIds = (state: StateCore) => {
  const output: Token[] = [];
  const stack: Frame[] = [{ open: null, last: null }];

  for (let i = 0; i < state.tokens.length; i++) {
    const token = state.tokens[i];
    const frame = stack[stack.length - 1];
    const marker = token.type === 'paragraph_open' ? state.tokens[i + 1].content.match(BLOCK_ID) : null;

    if (marker) {
      const inline = state.tokens[i + 1];
      const text = inline.content.slice(0, marker.index).trimEnd();
      const parent = frame.open;
      // Parts of a quote can't be linked, so the outermost quote takes the id.
      const target = stack.find((entry) => isQuote(entry.open))?.open
        ?? (text === '' ? frame.last : parent?.type === 'list_item_open' ? parent : token);
      if (target) {
        target.attrSet('data-block-id', marker[1]);
        inline.content = text;
        if (text === '') {
          i += 2;
          continue;
        }
      }
    }

    output.push(token);
    if (token.nesting === 1) {
      stack.push({ open: token, last: null });
    } else if (token.nesting === -1) {
      const closed = stack.pop();
      stack[stack.length - 1].last = closed?.open ?? null;
    } else {
      frame.last = token;
    }
  }
  state.tokens = output;
};

const tasks = (state: StateCore) => {
  const { tokens } = state;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (tokens[i].type !== 'list_item_open' || tokens[i + 1]?.type !== 'paragraph_open') continue;
    const inline = tokens[i + 2];
    const match = inline.content.match(TASK);
    if (!match) continue;
    inline.content = inline.content.slice(match[0].length).trimStart();
    const checked = match[1] !== ' ';
    tokens[i].attrSet('class', checked ? 'task-list-item is-checked' : 'task-list-item');
    tokens[i].attrSet('data-task', checked ? match[1] : '');
    const checkbox = new state.Token('task_checkbox', 'input', 0);
    checkbox.meta = { checked, hasText: inline.content !== '' };
    tokens.splice(i + 2, 0, checkbox);
  }
};

const isBlank = (token: Token) =>
  token.type === 'softbreak' || token.type === 'hardbreak' || (token.type === 'text' && token.content.trim() === '');

// Only comments can leave a paragraph with nothing in it (SPEC 7.4).
const dropEmptyParagraphs = (state: StateCore) => {
  const { tokens } = state;
  for (let i = tokens.length - 3; i >= 0; i--) {
    if (tokens[i].type === 'paragraph_open' && tokens[i + 1].children?.every(isBlank)) tokens.splice(i, 3);
  }
};

export const ofmCore = (md: MarkdownIt) => {
  md.core.ruler.after('block', 'ofm_callouts', callouts);
  md.core.ruler.after('ofm_callouts', 'ofm_block_ids', blockIds);
  md.core.ruler.after('ofm_block_ids', 'ofm_tasks', tasks);
  md.core.ruler.after('inline', 'ofm_empty_paragraphs', dropEmptyParagraphs);

  md.renderer.rules.task_checkbox = (tokens, idx) => {
    const { checked, hasText } = tokens[idx].meta as { checked: boolean; hasText: boolean };
    return `<input class="task-list-item-checkbox" type="checkbox" disabled=""${checked ? ' checked=""' : ''} />${hasText ? ' ' : ''}`;
  };
};
