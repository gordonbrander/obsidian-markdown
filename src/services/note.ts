import type { Result } from '../result.ts';

/** The host's loader: a note's source, or undefined if the note doesn't exist. */
export type NoteLoader = (name: string) => Promise<string | undefined>;

export type NoteError =
  /** No loader is set, so embeds keep their placeholder. */
  | { type: 'no-loader' }
  /** The loader returned undefined. */
  | { type: 'not-found' }
  /** The loader threw or rejected. */
  | { type: 'failed'; cause: unknown };

export type NoteResult = Result<string, NoteError>;

/** Detail of the `change` event. No `name` means every note may have changed. */
export type NoteChangeDetail = { name?: string };

/**
 * Loads notes for embeds through the host's loader, and caches them.
 * Fires `change` (a `CustomEvent<NoteChangeDetail>`) from `setLoader` and `clear`, so embeds on screen redraw.
 */
export class NoteService extends EventTarget {
  #loader: NoteLoader | undefined;
  #cache = new Map<string, Promise<NoteResult>>();

  constructor(loader?: NoteLoader) {
    super();
    this.#loader = loader;
  }

  /** Set the loader, or remove it with no argument. Forgets every loaded note. */
  setLoader(loader?: NoteLoader) {
    this.#loader = loader;
    this.#cache.clear();
    this.#changed({});
  }

  /** A note's source. Found and not-found results are cached; a failed load is tried again next time. */
  load(name: string): Promise<NoteResult> {
    const loader = this.#loader;
    if (!loader) return Promise.resolve({ ok: false, error: { type: 'no-loader' } });
    const cached = this.#cache.get(name);
    if (cached) return cached;
    const result: Promise<NoteResult> = loader(name).then(
      (source) => (source === undefined ? { ok: false, error: { type: 'not-found' } } : { ok: true, value: source }),
      (cause) => {
        // Only drop our own entry: a clear() and a newer load may have replaced it.
        if (this.#cache.get(name) === result) this.#cache.delete(name);
        return { ok: false, error: { type: 'failed', cause } };
      },
    );
    this.#cache.set(name, result);
    return result;
  }

  /** Forget one note, e.g. after it changed, so the next load asks the loader again. */
  clear(name: string) {
    this.#cache.delete(name);
    this.#changed({ name });
  }

  #changed(detail: NoteChangeDetail) {
    this.dispatchEvent(new CustomEvent<NoteChangeDetail>('change', { detail }));
  }
}

/** The service every component uses unless its class is given another, so they share one cache. */
export const noteService = new NoteService();
