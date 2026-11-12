import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseFrontmatter, render, splitFrontmatter } from './render.ts';

const FENCE = '`'.repeat(32);
const EXAMPLE = new RegExp(`^${FENCE} example\\n([\\s\\S]*?)^${FENCE}$`, 'gm');

// ponytail: html is false in render.ts, so raw HTML examples can't pass. Drop this once a sanitizer lets it be true.
const RAW_HTML_EXAMPLES = new Set([17, 70]);

/** Compare as SPEC 1.5 allows: attribute order and whitespace between tags don't matter. */
const normalize = (html: string) =>
  html
    .replace(/<([a-z0-9]+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/g, (_, tag: string, attrs: string) => {
      const sorted = (attrs.match(/[\w-]+(?:="[^"]*")?/g) ?? []).sort();
      return `<${[tag, ...sorted].join(' ')}>`;
    })
    .replace(/>\s*\n\s*</g, '><')
    .replaceAll('&quot;', '"')
    .trim();

const spec = readFileSync(new URL('../SPEC.md', import.meta.url), 'utf8');

[...spec.matchAll(EXAMPLE)].forEach(([, body], index) => {
  const number = index + 1;
  const [source, expected = ''] = body.split(/^\.$\n?/m);
  test(`SPEC Example ${number}`, { skip: RAW_HTML_EXAMPLES.has(number) }, () => {
    const actual = render(source.replaceAll('→', '\t'));
    assert.equal(normalize(actual), normalize(expected), source);
  });
});

test('bare file names are not autolinked', () => {
  assert.equal(render('See README.md').trim(), '<p>See README.md</p>');
});

test('www. and email addresses are autolinked', () => {
  assert.match(render('www.example.com'), /<a href="http:\/\/www\.example\.com" class="external-link">www\.example\.com<\/a>/);
  assert.match(render('me@example.com'), /<a href="mailto:me@example\.com" class="external-link">/);
});

test('only links with a scheme are external', () => {
  assert.match(render('[x](Note.md)'), /<a href="Note\.md">/);
  assert.match(render('[x](obsidian://open)'), /<a href="obsidian:\/\/open" class="external-link">/);
});

test('a + callout is an open details', () => {
  assert.match(render('> [!tip]+\n> a'), /^<details class="callout is-collapsible" data-callout="tip" data-callout-fold="\+" open="">/);
});

test('strictLineBreaks keeps soft breaks soft', () => {
  assert.equal(render('a\nb', { strictLineBreaks: true }).trim(), '<p>a\nb</p>');
  assert.equal(render('a\nb').trim(), '<p>a<br />\nb</p>');
});

test('footnote labels match case-insensitively', () => {
  assert.match(render('x[^Note]\n\n[^note]: y'), /footnote-ref/);
});

test('raw HTML is escaped', () => {
  assert.equal(render('<img src=x onerror=y>').trim(), '<p>&lt;img src=x onerror=y&gt;</p>');
  assert.equal(render('<script>x</script>').trim(), '<p>&lt;script&gt;x&lt;/script&gt;</p>');
  assert.equal(render('a <b onclick=x>c</b>').trim(), '<p>a &lt;b onclick=x&gt;c&lt;/b&gt;</p>');
});

test('targets with a scheme get no URL', () => {
  for (const source of ['[[javascript:alert(1)]]', '[[java\tscript:alert(1)]]', '[[\u0001javascript:alert(1)]]']) {
    const html = render(source);
    assert.doesNotMatch(html, /\shref=/, source);
    assert.match(html, /data-href=/, source);
  }
  assert.doesNotMatch(render('![[javascript:x.png]]'), /\ssrc=/);
});

test('content cannot break out of an attribute', () => {
  const sources = [
    '[[x" onclick="y]]',
    '[[a|"><img src=x onerror=y>]]',
    '![[x" onerror="y.png]]',
    '![[x" onerror="y]]',
    '> [!a"onclick="y] title',
    '> [!note|"onclick="y] title',
    '- ["] task',
    '#tag"onclick',
    '$"><img src=x onerror=y>$',
    '$$\n"><img src=x onerror=y>\n$$',
    '```"><img\nx\n```',
  ];
  for (const source of sources) {
    const html = render(source);
    assert.doesNotMatch(html, /<img(?! class="internal-embed")/, source);
    assert.doesNotMatch(html, /\sonclick="y"|\sonerror="y/, source);
  }
});

test('front matter is split off and parsed', () => {
  const note = '---\ntitle: Note\nreleased: 2024-01-01\n---\nBody\n';
  assert.deepEqual(splitFrontmatter(note), { frontmatter: 'title: Note\nreleased: 2024-01-01', content: 'Body\n' });
  assert.deepEqual(parseFrontmatter(note), { data: { title: 'Note', released: '2024-01-01' }, content: 'Body\n' });
  assert.deepEqual(splitFrontmatter('Body'), { frontmatter: '', content: 'Body' });
  assert.deepEqual(splitFrontmatter('---\n---\nBody'), { frontmatter: '', content: 'Body' });
  assert.deepEqual(parseFrontmatter('Body'), { data: {}, content: 'Body' });
  assert.throws(() => parseFrontmatter('---\na: [\n---\n'));
});
