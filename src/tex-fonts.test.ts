import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';
import { fontFiles } from './tex-fonts.ts';

test('every MathJax dynamic font file has a loader', () => {
  const dir = new URL('../node_modules/@mathjax/mathjax-newcm-font/mjs/svg/dynamic/', import.meta.url);
  const names = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => `@mathjax/mathjax-newcm-font/js/svg/dynamic/${f}`);
  assert.deepEqual(Object.keys(fontFiles).sort(), names.sort());
});
