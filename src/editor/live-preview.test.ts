import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureSyntaxTree } from '@codemirror/language';
import { EditorSelection, EditorState } from '@codemirror/state';
import { ofmMarkdown } from '../ofm-lezer.ts';
import { render } from '../render.ts';
import { blockDecorations, blockSource, invalidateNote, resolveEmbed, section, setNoteLoader, setProperty } from './blocks.ts';
import { inlineDecorations } from './live-preview.ts';

/** A parsed state with one selection range per `[anchor, head]`. */
const stateOf = (doc: string, ...ranges: [number, number?][]) => {
  const state = EditorState.create({
    doc,
    selection: EditorSelection.create(ranges.map(([anchor, head = anchor]) => EditorSelection.range(anchor, head))),
    extensions: [EditorState.allowMultipleSelections.of(true), ofmMarkdown()],
  });
  ensureSyntaxTree(state, doc.length, 5000);
  return state;
};

/** The text of each hidden or replaced span, in order. */
const hidden = (state: EditorState) => {
  const spans: string[] = [];
  inlineDecorations(state, [{ from: 0, to: state.doc.length }]).between(0, state.doc.length, (from, to, deco) => {
    if (deco.spec.class === undefined) spans.push(state.doc.sliceString(from, to));
  });
  return spans;
};

const doc = 'a **b** c';

test('marks hide when the cursor is outside', () => {
  assert.deepEqual(hidden(stateOf(doc, [0])), ['**', '**']);
});

test('marks show when the cursor is inside or at either edge', () => {
  for (const pos of [2, 3, 5, 7]) assert.deepEqual(hidden(stateOf(doc, [pos])), [], `cursor at ${pos}`);
});

test('a selection spanning two constructs reveals both', () => {
  const state = stateOf('**a** x *b* y ==c==', [3, 9]);
  assert.deepEqual(hidden(state), ['==', '==']);
});

test('heading marks hide on inactive lines only', () => {
  assert.deepEqual(hidden(stateOf('# Title\nx', [9])), ['# ']);
  assert.deepEqual(hidden(stateOf('# Title\nx', [3])), []);
});

test('wikilinks hide their brackets, and their target when aliased', () => {
  assert.deepEqual(hidden(stateOf('x [[Note]] y', [0])), ['[[', ']]']);
  assert.deepEqual(hidden(stateOf('x [[Note|Alias]] y', [0])), ['[[Note|', ']]']);
  assert.deepEqual(hidden(stateOf('x [[Note|Alias]] y', [5])), []);
});

test('emphasis nested in a highlight reveals independently', () => {
  const source = 'x ==a *b* c== y';
  assert.deepEqual(hidden(stateOf(source, [0])), ['==', '*', '*', '==']);
  // Inside the highlight but outside the emphasis.
  assert.deepEqual(hidden(stateOf(source, [5])), ['*', '*']);
});

test('markdown links hide all but their text', () => {
  assert.deepEqual(hidden(stateOf('[text](http://x.y) z', [20])), ['[', '](http://x.y)']);
});

test('list bullets become widgets, and task markers checkboxes', () => {
  assert.deepEqual(hidden(stateOf('- a\n- [ ] b\n\nz', [13])), ['-', '- ', '[ ]']);
});

test('quote marks and rules hide off the cursor line', () => {
  assert.deepEqual(hidden(stateOf('> a\n\n---\n\nz', [10])), ['> ', '---']);
  assert.deepEqual(hidden(stateOf('> a\n\n---\n\nz', [6])), ['> ']);
});

test('a code block hides its fences until the selection enters it', () => {
  const source = '```js\nx\n```\n\nz';
  assert.deepEqual(hidden(stateOf(source, [source.length])), ['```js', '```']);
  assert.deepEqual(hidden(stateOf(source, [6])), []);
});

// Phase 4: blocks.

const widgets = (state: EditorState) => {
  const found: string[] = [];
  blockDecorations(state).between(0, state.doc.length, (from, to, deco) => {
    found.push(`${deco.spec.widget.constructor.name} ${state.doc.sliceString(from, to).split('\n')[0]}`);
  });
  return found;
};

const blocks = '> [!note] N\n> body\n\n| a |\n| - |\n| 1 |\n\n$$\nx\n$$\n\n```mermaid\ngraph TD\n```\n\n![[Other note]]\n\nend';

test('each block is a widget while the selection is outside it', () => {
  assert.deepEqual(widgets(stateOf(blocks, [blocks.length])), [
    'MarkdownWidget > [!note] N',
    'MarkdownWidget | a |',
    'MarkdownWidget $$',
    'MarkdownWidget ```mermaid',
    'NoteEmbedWidget ![[Other note]]',
  ]);
});

test('a block shows its source while the selection is inside it', () => {
  for (const [needle, gone] of [['body', '> [!note]'], ['| 1', '| a'], ['x\n$$', '$$'], ['graph', '```'], ['Other', '![[']]) {
    const found = widgets(stateOf(blocks, [blocks.indexOf(needle)]));
    assert.equal(found.length, 4, needle);
    assert.ok(!found.some((w) => w.includes(gone)), needle);
  }
});

test('front matter is always the Properties widget', () => {
  const note = '---\na: 1\n---\nbody';
  assert.deepEqual(widgets(stateOf(note, [5])), ['PropertiesWidget ---']);
});

test('setting a property keeps YAML comments and key order', () => {
  assert.equal(setProperty('# top\na: 1 # one\nb: 2\n', 'a', 5), '# top\na: 5 # one\nb: 2\n');
  assert.equal(setProperty('a: 1\n', 'c', [1, 'x']), 'a: 1\nc:\n  - 1\n  - x\n');
});

test('a table slice resolves link references defined elsewhere in the note', () => {
  const note = '| a |\n| - |\n| [x][ref] |\n\nend\n\n[ref]: http://example.com\n';
  const state = stateOf(note, [note.indexOf('end')]);
  const table = note.indexOf('| [x]') + 11;
  assert.match(render(blockSource(state, 0, table)), /<a href="http:\/\/example\.com" class="external-link">x<\/a>/);
});

test('a callout slice renders its footnote refs, and only its own definitions', () => {
  const note = '> [!note]\n> See[^1].\n\n[^1]: One.\n[^2]: Two.\n';
  const state = stateOf(note, [note.length]);
  const source = blockSource(state, 0, note.indexOf('\n\n'));
  assert.match(render(source), /<sup class="footnote-ref"/);
  assert.ok(source.includes('[^1]: One.') && !source.includes('Two'));
});

test('section slices a heading to the next heading of its level, or a block by id', () => {
  const note = '---\na: 1\n---\n# A\nx\n## B\ny ^id\n# C\nz';
  assert.equal(section(note), '# A\nx\n## B\ny ^id\n# C\nz');
  assert.equal(section(note, 'A'), '# A\nx\n## B\ny ^id');
  assert.equal(section(note, 'B'), '## B\ny ^id');
  assert.equal(section(note, '^id'), 'y ^id');
  assert.equal(section(note, 'Missing'), null);
});

test('the note loader resolves embeds, stops at cycles and the depth cap, and reports missing notes', async () => {
  const notes: Record<string, string> = { A: '![[B]]', B: '# H\nb' };
  setNoteLoader(async (name) => notes[name] ?? null);
  assert.equal(await resolveEmbed('B#H'), '# H\nb');
  assert.equal(await resolveEmbed('Missing'), null);
  assert.equal(await resolveEmbed('A', ['A', 'B']), undefined);
  assert.equal(await resolveEmbed('B', ['1', '2', '3', '4']), undefined);
  notes.B = 'changed';
  assert.equal(await resolveEmbed('B'), '# H\nb', 'cached');
  invalidateNote('B');
  assert.equal(await resolveEmbed('B'), 'changed');
  setNoteLoader(null);
  assert.equal(await resolveEmbed('B'), undefined);
});
