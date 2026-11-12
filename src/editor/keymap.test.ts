import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureSyntaxTree, indentUnit } from '@codemirror/language';
import { EditorSelection, EditorState } from '@codemirror/state';
import type { StateCommand } from '@codemirror/state';
import { ofmMarkdown } from '../ofm-lezer.ts';
import { SearchQuery, search, setSearchQuery } from '@codemirror/search';
import { deleteMarkupBackward } from './markup.ts';
import { continueMarkup, indentList, insertLink, matchCount, toggleCheckbox, toggleMark } from './keymap.ts';

/** Run a command on `doc`, where `|` is the cursor or a pair of `|` the selection. Returns the result the same way. */
const run = (command: StateCommand, doc: string) => {
  const [anchor, head = anchor] = [...doc.matchAll(/\|/g)].map((match, i) => match.index - i);
  let state = EditorState.create({
    doc: doc.replaceAll('|', ''),
    selection: EditorSelection.single(anchor, head),
    extensions: [ofmMarkdown(), indentUnit.of('\t')],
  });
  ensureSyntaxTree(state, state.doc.length, 5000);
  assert.ok(command({ state, dispatch: (tr) => { state = tr.state; } }));
  const { from, to } = state.selection.main;
  const text = state.doc.toString();
  return from === to ? `${text.slice(0, from)}|${text.slice(from)}` : `${text.slice(0, from)}|${text.slice(from, to)}|${text.slice(to)}`;
};

test('Mod-B wraps the selection, the word at the cursor, or toggles off', () => {
  assert.equal(run(toggleMark('**'), 'a |bc| d'), 'a **|bc|** d');
  assert.equal(run(toggleMark('**'), 'a b|c d'), 'a **b|c** d');
  assert.equal(run(toggleMark('**'), 'a **|bc|** d'), 'a |bc| d');
  assert.equal(run(toggleMark('**'), 'a |**bc**| d'), 'a |bc| d');
  assert.equal(run(toggleMark('**'), 'a | d'), 'a **|** d');
});

test('Mod-I uses a single asterisk', () => {
  assert.equal(run(toggleMark('*'), '|x|'), '*|x|*');
});

test('Mod-/ comments the line when nothing is selected', () => {
  assert.equal(run(toggleMark('%%', true), '  some te|xt'), '  %%some te|xt%%');
});

test('Mod-K makes a link with the cursor where the URL goes', () => {
  assert.equal(run(insertLink, 'see |this|'), 'see [this](|)');
  assert.equal(run(insertLink, 'see |'), 'see [|]()');
});

test('Mod-L turns a line into a task and toggles it', () => {
  assert.equal(run(toggleCheckbox, 'buy |milk'), '- [ ] buy |milk');
  assert.equal(run(toggleCheckbox, '- buy |milk'), '- [ ] buy |milk');
  assert.equal(run(toggleCheckbox, '- [ ] buy |milk'), '- [x] buy |milk');
  assert.equal(run(toggleCheckbox, '\t1. [x] |a'), '\t1. [ ] |a');
});

test('Backspace after a list marker turns it into indentation, then removes it', () => {
  assert.equal(run(deleteMarkupBackward, '- a\n- |'), '- a\n  |');
  assert.equal(run(deleteMarkupBackward, '> |'), '|');
});

test('Tab indents a list item with its children; elsewhere it inserts a tab', () => {
  assert.equal(run(indentList(1), '- a\n- b|\n  - c\n- d'), '- a\n\t- b|\n\t  - c\n- d');
  assert.equal(run(indentList(-1), '- a\n\t- b|\n\t  - c'), '- a\n- b|\n  - c');
  assert.equal(run(indentList(1), 'a|b'), 'a\t|b');
});

test('Enter continues lists and tasks, and ends them on an empty item', () => {
  assert.equal(run(continueMarkup, '- [ ] a|'), '- [ ] a\n- [ ] |');
  assert.equal(run(continueMarkup, '> [!note]\n> a|'), '> [!note]\n> a\n> |');
  assert.equal(run(continueMarkup, '- a\n- |'), '- a\n|');
  assert.equal(run(continueMarkup, '- [?] a|'), '- [?] a\n- [ ] |');
  assert.equal(run(continueMarkup, '1. a|\n2. b'), '1. a\n2. |\n3. b');
});

test('the find bar counts matches and the selected one, as Obsidian does', () => {
  let state = EditorState.create({ doc: 'a b a c a', selection: EditorSelection.single(4, 5), extensions: [search()] });
  state = state.update({ effects: setSearchQuery.of(new SearchQuery({ search: 'a' })) }).state;
  assert.equal(matchCount(state), '2 / 3');
  state = state.update({ effects: setSearchQuery.of(new SearchQuery({ search: 'z' })) }).state;
  assert.equal(matchCount(state), 'No results');
});
