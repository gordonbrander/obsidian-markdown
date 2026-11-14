import type { Result } from '../result.ts';

/** The host's loader: a note's source, or undefined if the note doesn't exist. */
export type NoteLoader = (name: string) => Promise<string | undefined>;

export type NoteError =
  /** The loader returned undefined. */
  | { type: 'not-found' }
  /** The loader threw or rejected. */
  | { type: 'failed'; cause: unknown };

export type NoteResult = Result<string, NoteError>;

/** What the components need from a note service. Any object of this shape will do. */
export type TNoteService = {
  /** A note's source, by name. */
  load: (name: string) => Promise<NoteResult>;
  /** Forget one note, so the next load asks again. */
  clear: (name: string) => void;
  /** Forget every note. */
  clearAll: () => void;
};

/**
 * Loads notes through the host's loader, and caches them.
 * Clearing doesn't redraw notes on screen: they reload on their next render. To reload them now, give `<ofm-context>` a new service.
 */
export class NoteService implements TNoteService {
  #loader: NoteLoader;
  #cache = new Map<string, Promise<NoteResult>>();

  constructor(loader: NoteLoader) {
    this.#loader = loader;
  }

  /** A note's source. Found and not-found results are cached; a failed load is tried again next time. */
  load(name: string): Promise<NoteResult> {
    const cached = this.#cache.get(name);
    if (cached) return cached;
    const result: Promise<NoteResult> = this.#loader(name).then(
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

  clear(name: string) {
    this.#cache.delete(name);
  }

  clearAll() {
    this.#cache.clear();
  }
}
