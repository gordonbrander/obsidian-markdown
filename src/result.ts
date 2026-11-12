/** The outcome of an operation that can fail: its value, or why it failed. */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
