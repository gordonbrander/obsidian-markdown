export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Field =
  | { kind: 'text'; value: string | null }
  | { kind: 'number'; value: number | null }
  | { kind: 'checkbox'; value: boolean }
  | { kind: 'link'; value: string }
  | { kind: 'date'; value: string | null }
  | { kind: 'datetime'; value: string | null }
  | { kind: 'list'; value: (string | number)[] }
  | { kind: 'object'; value: Json };

export type Kind = Field['kind'];

export type Wikilink = { target: string; label: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
// No zone or fractional seconds: datetime-local would silently drop them.
const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

// Rejects shapes that match the regexes but aren't real, like 2023-02-31.
const isRealDate = (s: string): boolean => {
  const date = new Date(s.length === 10 ? `${s}T00:00:00Z` : `${s}Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(s.slice(0, 10));
};

const isScalarList = (value: Json): value is (string | number)[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' || typeof item === 'number');

/** Parse a string that is exactly one wikilink (SPEC 7.7), else null. */
export const parseWikilink = (s: string): Wikilink | null => {
  if (!s.startsWith('[[') || !s.endsWith(']]')) return null;
  const inner = s.slice(2, -2);
  if (inner.includes(']]') || inner.includes('\n')) return null;
  const parts = inner.match(/^(.*?)\\?\|(.*)$/);
  const target = (parts ? parts[1] : inner).trim();
  if (!target) return null;
  return { target, label: parts?.[2] || target };
};

/** Format JSON on one line, like `{ compact: "single line", mode: true }`. */
export const formatCompact = (value: Json): string => {
  if (Array.isArray(value)) return `[${value.map(formatCompact).join(', ')}]`;
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value).map(([key, item]) =>
      `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${formatCompact(item)}`);
    return entries.length > 0 ? `{ ${entries.join(', ')} }` : '{}';
  }
  return JSON.stringify(value);
};

/** Pair a JSON value with the widget kind that renders it. */
export const sniff = (value: Json): Field => {
  if (value === null || value === undefined) return { kind: 'text', value: null };
  if (typeof value === 'boolean') return { kind: 'checkbox', value };
  if (typeof value === 'number') return { kind: 'number', value };
  if (typeof value === 'string') {
    if (parseWikilink(value)) return { kind: 'link', value };
    if (DATE.test(value) && isRealDate(value)) return { kind: 'date', value };
    if (DATETIME.test(value) && isRealDate(value)) return { kind: 'datetime', value };
    return { kind: 'text', value };
  }
  if (isScalarList(value)) return { kind: 'list', value };
  return { kind: 'object', value };
};
