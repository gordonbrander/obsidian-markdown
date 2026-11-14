export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type Field =
  | { type: 'text'; value: string | null }
  | { type: 'number'; value: number | null }
  | { type: 'checkbox'; value: boolean }
  | { type: 'date'; value: string | null }
  | { type: 'datetime'; value: string | null }
  | { type: 'multitext'; value: (string | number)[] }
  | { type: 'tags'; value: (string | number)[] }
  | { type: 'aliases'; value: (string | number)[] }
  | { type: 'unknown'; value: Json };

export type Type = Field['type'];

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

/** True when a URL names a scheme, like `javascript:`. Control characters and spaces are ignored, as browsers do. */
export const hasScheme = (url: string) => /^[a-z][a-z0-9+.-]*:/i.test(url.replace(/[\x00-\x20]/g, ''));

const WEB_URL = /^https?:\/\/\S+$/i;

export type Link = { target: string; label: string; href: string | undefined; wiki: boolean };

/**
 * Parse a string that is exactly one wikilink or one http(s) URL, else undefined.
 * A wikilink target with a scheme gets no href, so `[[javascript:...]]` can't run.
 */
export const parseLink = (s: string): Link | undefined => {
  const wikilink = parseWikilink(s);
  if (wikilink) return { ...wikilink, href: hasScheme(wikilink.target) ? undefined : wikilink.target, wiki: true };
  if (WEB_URL.test(s)) return { target: s, label: s, href: s, wiki: false };
  return undefined;
};

/** Pair a JSON value with the widget type that renders it, as Obsidian infers one. */
export const sniff = (value: Json): Field => {
  if (value === null || value === undefined) return { type: 'text', value: null };
  if (typeof value === 'boolean') return { type: 'checkbox', value };
  if (typeof value === 'number') return { type: 'number', value };
  if (typeof value === 'string') {
    if (DATE.test(value) && isRealDate(value)) return { type: 'date', value };
    if (DATETIME.test(value) && isRealDate(value)) return { type: 'datetime', value };
    return { type: 'text', value };
  }
  if (isScalarList(value)) return { type: 'multitext', value };
  return { type: 'unknown', value };
};

/** Read committed text as a number when that loses nothing, so "007" and "1.50" stay text. */
export const parseCommitted = (text: string): string | number => {
  const number = Number(text);
  return Number.isFinite(number) && String(number) === text ? number : text;
};

// Null for no declared type, or an unknown name from the `types` attribute.
const emptyField = (declared: Type | undefined): Field | null => {
  switch (declared) {
    case 'checkbox': return { type: 'checkbox', value: false };
    case 'multitext':
    case 'tags':
    case 'aliases': return { type: declared, value: [] };
    case 'text':
    case 'number':
    case 'date':
    case 'datetime': return { type: declared, value: null };
    default: return null;
  }
};

/** The field for a value, given the type the host declared for its property, if any. */
export const fieldFor = (value: Json, declared?: Type): Field => {
  const field = sniff(value);
  if (value === null || value === undefined) return emptyField(declared) ?? field;
  if (declared === 'text' && (field.type === 'date' || field.type === 'datetime')) {
    return { type: 'text', value: field.value };
  }
  // ponytail: Obsidian also shows a single string as a one-item list for these types. Here it stays text.
  if (field.type === 'multitext' && (declared === 'tags' || declared === 'aliases')) {
    return { type: declared, value: field.value };
  }
  // Anything else the declared widget couldn't show losslessly keeps its sniffed widget.
  return field;
};

/** The type Obsidian gives a property for its name alone: `tags` and `aliases`. */
export const reservedType = (key: string): Type | undefined => {
  const name = key.toLowerCase();
  return name === 'tags' || name === 'aliases' ? name : undefined;
};
