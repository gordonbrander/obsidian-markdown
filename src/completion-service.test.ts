import assert from 'node:assert/strict';
import test from 'node:test';
import { CompletionService } from './completion-service.ts';

test('complete asks the host function, and answers [] without one', async () => {
  const service = new CompletionService();
  assert.deepEqual(await service.complete('a', 'link'), []);
  service.setCompletions(async (query, kind) => [`${kind}:${query}`]);
  assert.deepEqual(await service.complete('No', 'link'), ['link:No']);
  assert.deepEqual(await service.complete('ta', 'tag'), ['tag:ta']);
  service.setCompletions();
  assert.deepEqual(await service.complete('a', 'link'), []);
});

test('a failing host function answers [] rather than breaking typing', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const service = new CompletionService(async () => { throw new Error('offline'); });
  assert.deepEqual(await service.complete('a', 'link'), []);
});
