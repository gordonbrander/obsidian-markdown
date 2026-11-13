import assert from 'node:assert/strict';
import test from 'node:test';
import { NoteService } from './note.ts';

/** A loader over an object of notes, counting calls per name. */
const vault = (notes: Record<string, string>) => {
  const calls: Record<string, number> = {};
  const loader = async (name: string) => {
    calls[name] = (calls[name] ?? 0) + 1;
    return notes[name];
  };
  return { notes, calls, loader };
};

test('load reports each outcome as a Result', async () => {
  assert.deepEqual(await new NoteService().load('A'), { ok: false, error: { type: 'no-loader' } });
  const service = new NoteService(vault({ A: 'a' }).loader);
  assert.deepEqual(await service.load('A'), { ok: true, value: 'a' });
  assert.deepEqual(await service.load('Missing'), { ok: false, error: { type: 'not-found' } });
  const cause = new Error('offline');
  const failing = new NoteService(async () => { throw cause; });
  assert.deepEqual(await failing.load('A'), { ok: false, error: { type: 'failed', cause } });
});

test('found and not-found results are cached; failures are retried', async () => {
  const { loader, calls } = vault({ A: 'a' });
  const service = new NoteService(loader);
  await service.load('A');
  await service.load('A');
  await service.load('Missing');
  await service.load('Missing');
  assert.deepEqual(calls, { A: 1, Missing: 1 });

  let attempts = 0;
  const flaky = new NoteService(async () => {
    if (++attempts === 1) throw new Error('offline');
    return 'back';
  });
  assert.equal((await flaky.load('A')).ok, false);
  assert.deepEqual(await flaky.load('A'), { ok: true, value: 'back' });
});

test('clear forgets one note, and setLoader forgets them all', async () => {
  const { loader, notes, calls } = vault({ A: 'a', B: 'b' });
  const service = new NoteService(loader);
  await service.load('A');
  await service.load('B');
  notes.A = 'changed';
  service.clear('A');
  assert.deepEqual(await service.load('A'), { ok: true, value: 'changed' });
  assert.equal(calls.B, 1);
  service.setLoader(loader);
  await service.load('B');
  assert.equal(calls.B, 2);
  service.setLoader();
  assert.deepEqual(await service.load('A'), { ok: false, error: { type: 'no-loader' } });
});

test('two services keep separate caches', async () => {
  const { loader, calls } = vault({ A: 'a' });
  const first = new NoteService(loader);
  const second = new NoteService(loader);
  await first.load('A');
  await second.load('A');
  assert.equal(calls.A, 2);
});

test('setLoader and clear fire change, naming the note clear forgot', async () => {
  const service = new NoteService(async () => { throw new Error('offline'); });
  const names: (string | undefined)[] = [];
  service.addEventListener('change', (event) => names.push((event as CustomEvent<{ name?: string }>).detail.name));
  await service.load('A'); // a failed load drops its cache entry, but that's not a change
  service.clear('A');
  service.setLoader(async () => 'a');
  assert.deepEqual(names, ['A', undefined]);
});
