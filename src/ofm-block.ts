import type { MarkdownIt, StateBlock } from 'markdown-it';

const INTERRUPTS = { alt: ['paragraph', 'reference', 'blockquote', 'list'] };

const textStart = (state: StateBlock, line: number) => state.bMarks[line] + state.tShift[line];

const indexInLine = (state: StateBlock, line: number, marker: string, from: number) => {
  const index = state.src.slice(from, state.eMarks[line]).indexOf(marker);
  return index === -1 ? -1 : from + index;
};

type Fenced = {
  startLine: number;
  bodyStart: number;
  /** The line the closer is on, or where the container ended. */
  line: number;
  /** Offset of the closer, or -1 if there is none. */
  close: number;
};

/**
 * A block rule for constructs that open with a marker at the start of a line
 * and run past blank lines to the next marker (SPEC 5.2, 5.3). A closer on the
 * opening line means it isn't a block, and inline parsing handles the line.
 */
const fenced = (marker: string, finish: (state: StateBlock, block: Fenced) => void) =>
  (state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const start = textStart(state, startLine);
    if (!state.src.startsWith(marker, start)) return false;
    const bodyStart = start + marker.length;
    if (indexInLine(state, startLine, marker, bodyStart) !== -1) return false;
    if (silent) return true;

    let line = startLine;
    let close = -1;
    while (++line < endLine) {
      const lineStart = textStart(state, line);
      // Same test as markdown-it's fence: less indent ends the container.
      if (lineStart < state.eMarks[line] && state.sCount[line] < state.blkIndent) break;
      close = indexInLine(state, line, marker, lineStart);
      if (close !== -1) break;
    }
    finish(state, { startLine, bodyStart, line, close });
    return true;
  };

const finishComment = (state: StateBlock, { line, close }: Fenced) => {
  if (close === -1) {
    state.line = line;
    return;
  }
  let rest = close + 2;
  while (rest < state.eMarks[line] && state.md.utils.isSpace(state.src.charCodeAt(rest))) rest++;
  if (rest >= state.eMarks[line]) {
    state.line = line + 1;
    return;
  }
  // Text after the closer starts a new line in the same container.
  state.bMarks[line] = rest;
  state.tShift[line] = 0;
  state.sCount[line] = state.blkIndent;
  state.line = line;
};

const finishMath = (state: StateBlock, { startLine, bodyStart, line, close }: Fenced) => {
  const parts = [
    state.src.slice(bodyStart, state.eMarks[startLine]),
    state.getLines(startLine + 1, line, state.blkIndent, false),
    close === -1 ? '' : state.src.slice(textStart(state, line), close),
  ];
  const token = state.push('math_block', 'div', 0);
  token.content = parts.join('\n').trim();
  token.map = [startLine, line];
  state.line = close === -1 ? line : line + 1;
};

export const ofmBlock = (md: MarkdownIt) => {
  md.block.ruler.before('table', 'ofm_comment', fenced('%%', finishComment), INTERRUPTS);
  md.block.ruler.before('table', 'ofm_math', fenced('$$', finishMath), INTERRUPTS);

  md.renderer.rules.math_block = (tokens, idx) =>
    `<div class="math math-block">${md.utils.escapeHtml(tokens[idx].content)}</div>\n`;
};
