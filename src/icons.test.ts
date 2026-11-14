import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { lucideIcons, resolveIcon, setIconResolver } from './icons.ts';

test('lucideIcons answers Obsidian\'s ids', async () => {
  assert.match(await lucideIcons('lucide-flame') ?? '', /^<svg [^>]*class="lucide-flame"/);
  assert.match(await lucideIcons('quote-glyph') ?? '', /class="lucide-quote"/);
  assert.match(await lucideIcons('help-circle') ?? '', /class="lucide-help-circle"/);
});

test('every icon the theme and the property rows name is built in', async () => {
  const builtIn = readFileSync(new URL('./icons.ts', import.meta.url), 'utf8').split('const BUILT_IN')[1].split('};')[0];
  const theme = readFileSync(new URL('./ofm-theme.ts', import.meta.url), 'utf8');
  const rows = readFileSync(new URL('./components/ofm-proprow.ts', import.meta.url), 'utf8');
  const ids = [
    ...[...theme.matchAll(/--callout-icon: ([\w-]+);/g)].map((match) => match[1]),
    ...[...rows.matchAll(/'(lucide-[\w-]+)'/g)].map((match) => match[1]),
    'lucide-maximize-2',
  ];
  assert.ok(ids.length > 20);
  for (const id of ids) {
    const name = id.replace(/^lucide-/, '').replace('quote-glyph', 'quote');
    assert.ok(builtIn.includes(`'${name}':`), id);
  }
});

test('setIconResolver replaces the shared resolver, and removes it', async () => {
  try {
    setIconResolver(async (id) => `<svg data-id="${id}"/>`);
    assert.equal(await resolveIcon('star'), '<svg data-id="star"/>');
    setIconResolver();
    assert.equal(await resolveIcon('lucide-flame'), undefined);
  } finally {
    setIconResolver(lucideIcons);
  }
  assert.match(await resolveIcon('lucide-flame') ?? '', /^<svg/);
});
