/** The host's autocomplete: names matching `query`, for `[[` links or `#` tags. */
export type Completions = (query: string, kind: 'link' | 'tag') => Promise<string[]>;

/** Autocomplete suggestions for the editor, from the host's function. */
export class CompletionService {
  #complete: Completions | undefined;

  constructor(complete?: Completions) {
    this.#complete = complete;
  }

  /** Set the host's function, or remove it with no argument. */
  setCompletions(complete?: Completions) {
    this.#complete = complete;
  }

  /** The host's suggestions. [] when no function is set, or when it fails, so a broken callback can't break typing. */
  async complete(query: string, kind: 'link' | 'tag'): Promise<string[]> {
    if (!this.#complete) return [];
    try {
      return await this.#complete(query, kind);
    } catch (error) {
      console.warn('ofm-markdown-editor: completions failed', error);
      return [];
    }
  }
}

/** The service every editor uses unless its class is given another. */
export const completionService = new CompletionService();
