import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { lucideIcons } from './icons.ts';

test('lucideIcons answers Obsidian\'s ids', async () => {
  assert.match(await lucideIcons('lucide-flame') ?? '', /^<svg [^>]*class="lucide-flame"/);
  assert.match(await lucideIcons('quote-glyph') ?? '', /class="lucide-quote"/);
  assert.match(await lucideIcons('help-circle') ?? '', /class="lucide-help-circle"/);
  assert.match(await lucideIcons('right-triangle') ?? '', /class="right-triangle"/);
});

test('every icon the theme and the components name has an icon, and others have none', async () => {
  const theme = readFileSync(new URL('../ofm-theme.ts', import.meta.url), 'utf8');
  const rows = readFileSync(new URL('../components/ofm-proprow.ts', import.meta.url), 'utf8');
  const ids = [
    ...[...theme.matchAll(/--callout-icon: ([\w-]+);/g)].map((match) => match[1]),
    ...[...rows.matchAll(/'(lucide-[\w-]+)'/g)].map((match) => match[1]),
    'lucide-maximize-2',
    'lucide-chevron-down',
    'right-triangle',
  ];
  assert.ok(ids.length > 20);
  for (const id of ids) assert.match(await lucideIcons(id) ?? '', /^<svg /, id);
  assert.equal(await lucideIcons('lucide-rocket'), undefined);
});
