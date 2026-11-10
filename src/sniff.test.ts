import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCompact, parseWikilink, sniff } from './sniff.ts';
import type { Json, Kind } from './sniff.ts';

test('sniff picks the widget kind', () => {
  const cases: [Json, Kind][] = [
    [null, 'text'],
    ['', 'text'],
    ['A New Hope', 'text'],
    [true, 'checkbox'],
    [false, 'checkbox'],
    [0, 'number'],
    [1.5, 'number'],
    ['[[Episode IV]]', 'link'],
    ['[[a]] and [[b]]', 'text'],
    ['2020-08-21', 'date'],
    ['2023-02-31', 'text'],
    ['2023-13-01', 'text'],
    ['2020-08-21T10:30', 'datetime'],
    ['2020-08-21T10:30:00', 'datetime'],
    ['2020-08-21T99:30:00', 'text'],
    ['2020-08-21T10:30:00Z', 'text'],
    ['2020-08-21T10:30:00.123', 'text'],
    [[], 'list'],
    [['a', 1], 'list'],
    [['a', null], 'object'],
    [[['nested']], 'object'],
    [{ a: 1 }, 'object'],
  ];
  for (const [value, kind] of cases) {
    assert.equal(sniff(value).kind, kind, JSON.stringify(value));
  }
});

test('formatCompact stays on one line', () => {
  assert.equal(formatCompact({ compact: 'single line', mode: true }), '{ compact: "single line", mode: true }');
  assert.equal(formatCompact({ a: [1, { b: null }], 'c-d': {}, e: [] }), '{ a: [1, { b: null }], "c-d": {}, e: [] }');
  assert.equal(formatCompact(['x', null]), '["x", null]');
  assert.equal(formatCompact({ text: 'two\nlines' }), '{ text: "two\\nlines" }');
});

test('parseWikilink follows SPEC 7.7', () => {
  assert.deepEqual(parseWikilink('[[Note]]'), { target: 'Note', label: 'Note' });
  assert.deepEqual(parseWikilink('[[Note#Heading|Name]]'), { target: 'Note#Heading', label: 'Name' });
  assert.deepEqual(parseWikilink('[[Note\\|Name]]'), { target: 'Note', label: 'Name' });
  assert.deepEqual(parseWikilink('[[ Note |a|b]]'), { target: 'Note', label: 'a|b' });
  assert.deepEqual(parseWikilink('[[#Heading]]'), { target: '#Heading', label: '#Heading' });
  assert.equal(parseWikilink('[[]]'), null);
  assert.equal(parseWikilink('[[  |x]]'), null);
  assert.equal(parseWikilink('[[a]] and [[b]]'), null);
  assert.equal(parseWikilink('[[a\nb]]'), null);
  assert.equal(parseWikilink('plain'), null);
});
