// Obsidian's editing commands and default hotkeys.
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentLess, insertTab } from '@codemirror/commands';
import { foldKeymap, indentUnit, syntaxTree } from '@codemirror/language';
import {
  SearchQuery, closeSearchPanel, findNext, findPrevious, getSearchQuery, highlightSelectionMatches, openSearchPanel,
  replaceAll, replaceNext, search, searchKeymap, selectMatches, setSearchQuery,
} from '@codemirror/search';
import { EditorSelection, EditorState, Prec } from '@codemirror/state';
import type { Extension, StateCommand } from '@codemirror/state';
import { EditorView, drawSelection, dropCursor, keymap, rectangularSelection, runScopeHandlers } from '@codemirror/view';
import type { Command, KeyBinding, Panel, ViewUpdate } from '@codemirror/view';
import { continueMarkup, deleteMarkupBackward } from './markup.ts';

export { continueMarkup };

/** Pasting a URL over selected text makes it a Markdown link, as Obsidian does. */
const pasteUrlAsLink = EditorView.domEventHandlers({
  paste(event, view) {
    const { main } = view.state.selection;
    const url = event.clipboardData?.getData('text/plain').trim() ?? '';
    if (main.empty || !/^(?:https?:\/\/|mailto:)\S+$/.test(url) || view.state.doc.lineAt(main.from).number !== view.state.doc.lineAt(main.to).number) {
      return false;
    }
    view.dispatch({ changes: [{ from: main.from, insert: '[' }, { from: main.to, insert: `](${url})` }], userEvent: 'input.paste' });
    return true;
  },
});

/** A line's text without its leading and trailing space, or null for a blank line. */
const lineText = (state: EditorState, pos: number) => {
  const line = state.doc.lineAt(pos);
  const start = line.text.search(/\S/);
  return start === -1 ? null : { from: line.from + start, to: line.from + line.text.trimEnd().length };
};

/**
 * Wrap each selection, or the word at the cursor, in `mark`, or unwrap it if it's already wrapped.
 * With nothing to wrap, inserts the pair and puts the cursor between.
 */
export const toggleMark = (mark: string, wholeLine = false): StateCommand => ({ state, dispatch }) => {
  const size = mark.length;
  dispatch(state.update(state.changeByRange((range) => {
    let { from, to } = range;
    if (range.empty) {
      const word = wholeLine ? lineText(state, range.head) : state.wordAt(range.head);
      if (!word) {
        return { changes: { from, insert: mark + mark }, range: EditorSelection.cursor(from + size) };
      }
      ({ from, to } = word);
    }
    const text = state.sliceDoc(from, to);
    // Already wrapped, outside the selection or inside it.
    if (state.sliceDoc(from - size, from) === mark && state.sliceDoc(to, to + size) === mark) {
      return {
        changes: [{ from: from - size, to: from }, { from: to, to: to + size }],
        range: range.empty ? EditorSelection.cursor(range.head - size) : EditorSelection.range(from - size, to - size),
      };
    }
    if (text.length >= 2 * size && text.startsWith(mark) && text.endsWith(mark)) {
      return {
        changes: [{ from, to: from + size }, { from: to - size, to }],
        range: EditorSelection.range(from, to - 2 * size),
      };
    }
    return {
      changes: [{ from, insert: mark }, { from: to, insert: mark }],
      range: range.empty ? EditorSelection.cursor(range.head + size) : EditorSelection.range(from + size, to + size),
    };
  }), { userEvent: 'input', scrollIntoView: true }));
  return true;
};

/** Mod-K: wrap the selection as a link's text, leaving the cursor where the URL goes. With no selection, inserts `[]()`. */
export const insertLink: StateCommand = ({ state, dispatch }) => {
  dispatch(state.update(state.changeByRange((range) => {
    const text = state.sliceDoc(range.from, range.to);
    const insert = `[${text}]()`;
    const cursor = range.empty ? range.from + 1 : range.from + insert.length - 1;
    return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(cursor) };
  }), { userEvent: 'input', scrollIntoView: true }));
  return true;
};

const LIST = /^(\s*)(?:([-*+]|\d+[.)])[ \t]+)?(?:\[(.)\][ \t]+)?/u;

/** Mod-L: a plain line or list item becomes a task; a task toggles between done and not. */
export const toggleCheckbox: StateCommand = ({ state, dispatch }) => {
  const changes: { from: number; to: number; insert: string }[] = [];
  const seen = new Set<number>();
  for (const range of state.selection.ranges) {
    for (let pos = range.from; pos <= range.to; ) {
      const line = state.doc.lineAt(pos);
      pos = line.to + 1;
      if (seen.has(line.number)) continue;
      seen.add(line.number);
      const [prefix, indent, marker, task] = LIST.exec(line.text)!;
      const from = line.from + prefix.length;
      if (task !== undefined) {
        const box = line.from + prefix.lastIndexOf('[') + 1;
        changes.push({ from: box, to: box + task.length, insert: task === ' ' ? 'x' : ' ' });
      } else {
        changes.push({ from: line.from + indent.length, to: from, insert: `${marker ?? '-'} [ ] ` });
      }
    }
  }
  dispatch(state.update({ changes, userEvent: 'input' }));
  return true;
};

/** The lines a list command acts on: the selected lines, plus the children of a selected list item. */
const listLines = (state: EditorState) => {
  const lines = new Set<number>();
  for (const range of state.selection.ranges) {
    let end = range.to;
    for (let node = syntaxTree(state).resolveInner(state.doc.lineAt(range.from).to, -1); node.parent; node = node.parent) {
      if (node.name === 'ListItem') {
        end = Math.max(end, node.to);
        break;
      }
    }
    for (let pos = range.from; pos <= end; ) {
      const line = state.doc.lineAt(pos);
      lines.add(line.number);
      pos = line.to + 1;
    }
  }
  return lines;
};

const isListLine = (state: EditorState) => {
  for (let node = syntaxTree(state).resolveInner(state.doc.lineAt(state.selection.main.from).to, -1); node.parent; node = node.parent) {
    if (node.name === 'ListItem') return true;
  }
  return false;
};

/** Tab and Shift-Tab on a list item indent or outdent it with its children. Elsewhere, Tab inserts a tab. */
export const indentList = (direction: 1 | -1): StateCommand => ({ state, dispatch }) => {
  if (!isListLine(state)) return direction === 1 ? insertTab({ state, dispatch }) : indentLess({ state, dispatch });
  const unit = state.facet(indentUnit);
  const changes: { from: number; to?: number; insert?: string }[] = [];
  for (const number of listLines(state)) {
    const line = state.doc.line(number);
    if (direction === 1) {
      changes.push({ from: line.from, insert: unit });
    } else {
      const indent = /^(\t| {1,4})/.exec(line.text)?.[0];
      if (indent) changes.push({ from: line.from, to: line.from + indent.length });
    }
  }
  dispatch(state.update({ changes, userEvent: direction === 1 ? 'input.indent' : 'delete.dedent' }));
  return true;
};

const WRAPS = new Set(['*', '_', '=', '$', '~', '`', '%']);

/** Typing `*`, `_`, `=`, `$`, `~`, `` ` `` or `%` with text selected wraps it, as Obsidian's auto-pair Markdown syntax does. */
const wrapSelection = EditorView.inputHandler.of((view, _from, _to, text) => {
  const { state } = view;
  if (!WRAPS.has(text) || state.selection.ranges.some((range) => range.empty)) return false;
  view.dispatch(state.update(state.changeByRange((range) => ({
    changes: [{ from: range.from, insert: text }, { from: range.to, insert: text }],
    range: EditorSelection.range(range.from + 1, range.to + 1),
  })), { userEvent: 'input' }));
  return true;
});

/** "2 / 5": the selected match's place among all matches, as Obsidian's find field shows it. */
export const matchCount = (state: EditorState): string => {
  const query = getSearchQuery(state);
  if (!query.valid) return '';
  const { from, to } = state.selection.main;
  let total = 0;
  let current = 0;
  const cursor = query.getCursor(state) as Iterator<{ from: number; to: number }>;
  for (let match = cursor.next(); !match.done && total < 1000; match = cursor.next()) {
    total++;
    if (match.value.from === from && match.value.to === to) current = total;
  }
  return total === 0 ? 'No results' : `${current} / ${total}`;
};

// Lucide icons (ISC license), which Obsidian also uses: arrow-up, arrow-down, text-select and x. One path each,
// so every subpath starts with an absolute M.
const ICONS: Record<string, string> = {
  previous: 'M5 12l7-7 7 7 M12 19V5',
  next: 'M12 5v14 M19 12l-7 7-7-7',
  all: 'M5 3a2 2 0 0 0-2 2 M19 3a2 2 0 0 1 2 2 M21 19a2 2 0 0 1-2 2 M5 21a2 2 0 0 1-2-2 M9 3h1 M9 21h1 M14 3h1 M14 21h1 M3 9v1 M21 9v1 M3 14v1 M21 14v1 M7 8h10 M7 12h10 M7 16h6',
  close: 'M18 6 6 18 M6 6l12 12',
};

const icon = (name: string) => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'svg-icon');
  svg.innerHTML = `<path d="${ICONS[name]}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg;
};

const button = (className: string, label: string, content: string, run: () => void) => {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.setAttribute('aria-label', label);
  if (content in ICONS) element.append(icon(content));
  else element.textContent = content;
  element.addEventListener('mousedown', (event) => event.preventDefault());
  element.addEventListener('click', run);
  return element;
};

/** Obsidian's find bar: a rounded field with a match count and icon buttons, and a replace row for Mod-Alt-F. */
const searchPanel = (view: EditorView): Panel => {
  const dom = document.createElement('div');
  dom.className = 'document-search-container';
  const field = document.createElement('div');
  field.className = 'search-input-container document-search-input';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Find...';
  input.setAttribute('main-field', 'true');
  input.spellcheck = false;
  const count = document.createElement('div');
  count.className = 'document-search-count';
  field.append(input, count);
  const replaceInput = document.createElement('input');
  replaceInput.className = 'document-replace-input';
  replaceInput.placeholder = 'Replace...';
  replaceInput.spellcheck = false;

  const commit = () => {
    const query = new SearchQuery({ search: input.value, replace: replaceInput.value });
    if (query.eq(getSearchQuery(view.state))) return;
    // Search as you type: select the first match from where the current one starts, wrapping to the top.
    // Not findNext, which selects the field's text and so would eat the next keystroke.
    const { state } = view;
    const from = state.selection.main.from;
    const next = (start: number) => (query.getCursor(state, start) as Iterator<{ from: number; to: number }>).next();
    const match = query.valid ? [next(from), next(0)].find((m) => !m.done)?.value : undefined;
    view.dispatch({
      effects: setSearchQuery.of(query),
      ...(match ? { selection: { anchor: match.from, head: match.to }, scrollIntoView: true } : {}),
    });
  };
  input.addEventListener('input', commit);
  replaceInput.addEventListener('input', commit);

  const search = document.createElement('div');
  search.className = 'document-search';
  const buttons = document.createElement('div');
  buttons.className = 'document-search-buttons';
  buttons.append(
    button('document-search-button', 'Previous', 'previous', () => findPrevious(view)),
    button('document-search-button', 'Next', 'next', () => findNext(view)),
    button('document-search-button', 'Select all matches', 'all', () => selectMatches(view)),
    button('document-search-close-button', 'Close', 'close', () => closeSearchPanel(view)),
  );
  search.append(field, buttons);

  const replace = document.createElement('div');
  replace.className = 'document-replace';
  const replaceButtons = document.createElement('div');
  replaceButtons.className = 'document-search-buttons';
  replaceButtons.append(
    button('document-search-button mod-replace', 'Replace', 'Replace', () => replaceNext(view)),
    button('document-search-button mod-replace', 'Replace all', 'Replace all', () => replaceAll(view)),
  );
  replace.append(replaceInput, replaceButtons);
  replace.hidden = !showReplace;
  dom.append(search, replace);

  dom.addEventListener('keydown', (event) => {
    if (runScopeHandlers(view, event, 'search-panel')) {
      event.preventDefault();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (event.target === replaceInput) replaceNext(view);
      else if (event.shiftKey) findPrevious(view);
      else findNext(view);
    }
  });

  const sync = (state: EditorState) => {
    const query = getSearchQuery(state);
    if (input.value !== query.search) input.value = query.search;
    if (replaceInput.value !== query.replace) replaceInput.value = query.replace;
    count.textContent = matchCount(state);
  };
  sync(view.state);
  return {
    dom,
    top: true,
    mount: () => input.select(),
    update: (update: ViewUpdate) => sync(update.state),
  };
};

// Set just before opening, so the panel knows whether Mod-Alt-F (replace) or Mod-F opened it.
let showReplace = false;

const openFind: Command = (view) => {
  showReplace = false;
  return openSearchPanel(view);
};

/** Mod-Alt-F on macOS, Mod-H elsewhere: the find bar with its replace row. */
const openReplace: Command = (view) => {
  showReplace = true;
  closeSearchPanel(view);
  return openSearchPanel(view);
};

export type Completions = (query: string, kind: 'link' | 'tag') => Promise<string[]>;

/** `[[` completes notes and `#` completes tags, from the host's callback. With no callback there's no popup. */
const completionSource = (completions: () => Completions | null) => async (context: CompletionContext): Promise<CompletionResult | null> => {
  const complete = completions();
  if (!complete) return null;
  const link = context.matchBefore(/\[\[[^[\]|#\n]*/);
  if (link) {
    const query = link.text.slice(2);
    const closed = context.state.sliceDoc(context.pos, context.pos + 2) === ']]';
    const names = await complete(query, 'link');
    return {
      from: link.from + 2,
      options: names.map((label) => ({ label, apply: closed ? label : `${label}]]` })),
      filter: false,
    };
  }
  const tag = context.matchBefore(/(?:^|\s)#[\p{L}\p{N}_\-/]*/u);
  if (tag) {
    const hash = tag.from + tag.text.indexOf('#');
    const names = await complete(context.state.sliceDoc(hash + 1, context.pos), 'tag');
    return { from: hash + 1, options: names.map((label) => ({ label })), filter: false };
  }
  return null;
};

/**
 * Obsidian 1.15's default hotkeys, as its app.js registers them. Move line (Alt-Up/Down) and Mod-D come from
 * CodeMirror's keymaps, which Obsidian also uses. Obsidian has no default hotkey for Live Preview ↔ Source mode.
 */
export const obsidianKeymap = (toggleReading: Command): KeyBinding[] => [
  { key: 'Enter', run: continueMarkup },
  { key: 'Backspace', run: deleteMarkupBackward },
  { key: 'Tab', run: indentList(1) },
  { key: 'Shift-Tab', run: indentList(-1) },
  { key: 'Mod-b', run: toggleMark('**') },
  { key: 'Mod-i', run: toggleMark('*') },
  { key: 'Mod-k', run: insertLink },
  { key: 'Mod-l', run: toggleCheckbox },
  { key: 'Mod-/', run: toggleMark('%%', true) },
  // Obsidian's Mod-E switches between editing and Reading view, which is <ofm-note>, so the host does it.
  { key: 'Mod-e', run: toggleReading },
  // Search and replace: Mod-Alt-F on macOS, Mod-H elsewhere.
  { key: 'Mod-f', run: openFind },
  { key: 'Mod-h', mac: 'Mod-Alt-f', run: openReplace },
];

/** Everything about editing: history, selection drawing, search, auto-pairs, completion and the keymaps. */
export const editing = ({ toggleReading, completions }: { toggleReading: Command; completions: () => Completions | null }): Extension => [
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  EditorView.lineWrapping,
  indentUnit.of('\t'),
  // As in Obsidian: Alt-Shift-drag or a middle-button drag selects a rectangle, and Alt-click adds a cursor.
  rectangularSelection({ eventFilter: (event) => (event.button === 0 && event.altKey && event.shiftKey) || event.button === 1 }),
  EditorView.clickAddsSelectionRange.of((event) => event.altKey && !event.ctrlKey && !event.metaKey),
  highlightSelectionMatches(),
  search({ top: true, createPanel: searchPanel }),
  closeBrackets(),
  EditorState.languageData.of(() => [{ closeBrackets: { brackets: ['(', '[', '{', '`'] } }]),
  wrapSelection,
  pasteUrlAsLink,
  autocompletion({ override: [completionSource(completions)], icons: false }),
  Prec.high(keymap.of(obsidianKeymap(toggleReading))),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap]),
];
