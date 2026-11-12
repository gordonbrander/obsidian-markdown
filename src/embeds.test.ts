import assert from 'node:assert/strict';
import test from 'node:test';
import { section } from './embeds.ts';

test('section slices the body, a heading to the next heading of its level, or a block by id', () => {
  const note = '---\na: 1\n---\n# A\nx\n## B\ny ^id\n# C\nz';
  assert.equal(section(note), '# A\nx\n## B\ny ^id\n# C\nz');
  assert.equal(section(note, 'A'), '# A\nx\n## B\ny ^id');
  assert.equal(section(note, 'B'), '## B\ny ^id');
  assert.equal(section(note, '^id'), 'y ^id');
  assert.equal(section(note, 'Missing'), undefined);
  assert.equal(section(note, '^missing'), undefined);
});
