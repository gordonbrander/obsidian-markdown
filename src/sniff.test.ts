import assert from 'node:assert/strict';
import test from 'node:test';
import { fieldFor, formatCompact, parseCommitted, parseLink, parseWikilink, sniff } from './sniff.ts';
import type { Field, Json, Type } from './sniff.ts';

test('sniff picks the widget type', () => {
  const cases: [Json, Type][] = [
    [null, 'text'],
    ['', 'text'],
    ['A New Hope', 'text'],
    [true, 'checkbox'],
    [false, 'checkbox'],
    [0, 'number'],
    [1.5, 'number'],
    ['[[Episode IV]]', 'link'],
    ['[[a]] and [[b]]', 'text'],
    ['https://example.com/a?b=c', 'link'],
    ['HTTP://example.com', 'link'],
    ['see https://example.com', 'text'],
    ['https://example.com and more', 'text'],
    ['ftp://example.com', 'text'],
    ['javascript:alert(1)', 'text'],
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
  for (const [value, type] of cases) {
    assert.equal(sniff(value).type, type, JSON.stringify(value));
  }
});

test('fieldFor applies declared types without coercing values', () => {
  const cases: [Json, string | undefined, Field][] = [
    [null, undefined, { type: 'text', value: null }],
    [null, 'checkbox', { type: 'checkbox', value: false }],
    [null, 'list', { type: 'list', value: [] }],
    [null, 'text', { type: 'text', value: null }],
    [null, 'number', { type: 'number', value: null }],
    [null, 'date', { type: 'date', value: null }],
    [null, 'datetime', { type: 'datetime', value: null }],
    [null, 'link', { type: 'link', value: '' }],
    [null, 'object', { type: 'object', value: {} }],
    ['2020-08-21', 'text', { type: 'text', value: '2020-08-21' }],
    ['2020-08-21T10:30:00', 'text', { type: 'text', value: '2020-08-21T10:30:00' }],
    ['[[Note]]', 'text', { type: 'link', value: '[[Note]]' }],
    ['soon', 'date', { type: 'text', value: 'soon' }],
    ['42', 'number', { type: 'text', value: '42' }],
    [42, 'text', { type: 'number', value: 42 }],
    [null, 'bogus', { type: 'text', value: null }],
  ];
  for (const [value, declared, field] of cases) {
    assert.deepEqual(fieldFor(value, declared as Type), field, `${JSON.stringify(value)} as ${declared}`);
  }
  // A `types` lookup on a key like "constructor" yields an inherited function.
  assert.deepEqual(fieldFor(null, ({} as Record<string, Type>)['constructor']), { type: 'text', value: null });
});

test('parseCommitted only reads lossless numbers', () => {
  assert.equal(parseCommitted('1977'), 1977);
  assert.equal(parseCommitted('-1.5'), -1.5);
  assert.equal(parseCommitted('0'), 0);
  for (const text of ['', ' ', '007', '1.50', '1e3', '0x10', 'Infinity', 'NaN', '12345678901234567890', '2020-08-21', 'hello']) {
    assert.equal(parseCommitted(text), text);
  }
});

test('formatCompact stays on one line', () => {
  assert.equal(formatCompact({ compact: 'single line', mode: true }), '{ compact: "single line", mode: true }');
  assert.equal(formatCompact({ a: [1, { b: null }], 'c-d': {}, e: [] }), '{ a: [1, { b: null }], "c-d": {}, e: [] }');
  assert.equal(formatCompact(['x', null]), '["x", null]');
  assert.equal(formatCompact({ text: 'two\nlines' }), '{ text: "two\\nlines" }');
});

test('parseLink gives wikilinks and web URLs an href, but never a scheme wikilink', () => {
  assert.deepEqual(parseLink('[[Note|Name]]'), { target: 'Note', label: 'Name', href: 'Note', wiki: true });
  assert.deepEqual(parseLink('[[javascript:alert(1)]]'), { target: 'javascript:alert(1)', label: 'javascript:alert(1)', href: undefined, wiki: true });
  assert.deepEqual(parseLink('https://example.com'), { target: 'https://example.com', label: 'https://example.com', href: 'https://example.com', wiki: false });
  assert.equal(parseLink('javascript:alert(1)'), undefined);
  assert.equal(parseLink('plain text'), undefined);
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
