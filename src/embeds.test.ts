import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTarget, section } from './embeds.ts';

test('parseTarget splits the note name from the subpath at the first #', () => {
  assert.deepEqual(parseTarget('Note'), { name: 'Note', sub: '' });
  assert.deepEqual(parseTarget('Note#Heading'), { name: 'Note', sub: 'Heading' });
  assert.deepEqual(parseTarget('Note#^id'), { name: 'Note', sub: '^id' });
  assert.deepEqual(parseTarget('Note#A#B'), { name: 'Note', sub: 'A#B' });
});

test('section slices the body, a heading to the next heading of its level, or a block by id', () => {
  const note = '---\na: 1\n---\n# A\nx\n## B\ny ^id\n# C\nz';
  assert.equal(section(note), '# A\nx\n## B\ny ^id\n# C\nz');
  assert.equal(section(note, 'A'), '# A\nx\n## B\ny ^id');
  assert.equal(section(note, 'B'), '## B\ny ^id');
  assert.equal(section(note, '^id'), 'y ^id');
  assert.equal(section(note, 'Missing'), undefined);
  assert.equal(section(note, '^missing'), undefined);
});
