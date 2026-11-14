// Icons, by Obsidian's ids: a Lucide name with a lucide- prefix, or one of the names Obsidian had before it used Lucide.
// Which icon goes where is the theme's and the components' business. This module only turns an id into an SVG.

/** An icon's `<svg>` markup by Obsidian's id (`lucide-flame`, `quote-glyph`), or undefined for no icon. */
export type IconResolver = (id: string) => Promise<string | undefined>;

/** Obsidian's own ids, as the Lucide icons it draws for them. */
const ALIASES: Record<string, string> = {
  'quote-glyph': 'quote',
};

// The icons the components and the theme use, from Lucide (ISC License, https://lucide.dev), so showing them loads nothing.
const BUILT_IN: Record<string, string> = {
  'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
  'flame': '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5"/><path d="M12 17h.01"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'zap': '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  'bug': '<path d="M12 20v-9"/><path d="M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z"/><path d="M14.12 3.88 16 2"/><path d="M21 21a4 4 0 0 0-3.81-4"/><path d="M21 5a4 4 0 0 1-3.55 3.97"/><path d="M22 13h-4"/><path d="M3 21a4 4 0 0 1 3.81-4"/><path d="M3 5a4 4 0 0 0 3.55 3.97"/><path d="M6 13H2"/><path d="m8 2 1.88 1.88"/><path d="M9 7.13V6a3 3 0 1 1 6 0v1.13"/>',
  'list': '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  'quote': '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  'text': '<path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/>',
  'binary': '<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>',
  'check-square': '<path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/>',
  'calendar': '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'forward': '<path d="m15 17 5-5-5-5"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  'tags': '<path d="M13.172 2a2 2 0 0 1 1.414.586l6.71 6.71a2.4 2.4 0 0 1 0 3.408l-4.592 4.592a2.4 2.4 0 0 1-3.408 0l-6.71-6.71A2 2 0 0 1 6 9.172V3a1 1 0 0 1 1-1z"/><path d="M2 7v6.172a2 2 0 0 0 .586 1.414l6.71 6.71a2.4 2.4 0 0 0 3.191.193"/><circle cx="10.5" cy="6.5" r=".5" fill="currentColor"/>',
  'file-question': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5"/><path d="M12 17h.01"/>',
  'maximize-2': '<path d="M15 3h6v6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/><path d="M9 21H3v-6"/>',
};

const svg = (name: string, paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-${name}">${paths}</svg>`;

const escapeAttr = (value: string | number) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const pascal = (name: string) => name.replace(/(?:^|-)([a-z0-9])/g, (_, char: string) => char.toUpperCase());

/** The Lucide icon Obsidian calls `id`. Icons outside the built-in set load the whole `lucide` package, once. */
export const lucideIcons: IconResolver = async (id) => {
  const bare = id.replace(/^lucide-/, '');
  const name = ALIASES[bare] ?? bare;
  if (Object.hasOwn(BUILT_IN, name)) return svg(name, BUILT_IN[name]);
  const { icons } = await import('lucide');
  const node = (icons as Record<string, import('lucide').IconNode | undefined>)[pascal(name)];
  if (!node) return undefined;
  const paths = node.map(([tag, attrs]) =>
    `<${tag}${Object.entries(attrs).map(([key, value]) => ` ${key}="${escapeAttr(value ?? '')}"`).join('')}/>`);
  return svg(name, paths.join(''));
};

/** Parse `<svg>` markup, without anything that could run. */
const parseSvg = (source: string): Element | undefined => {
  const root = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  if (root.localName !== 'svg') return undefined;
  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (el.localName === 'script' || el.localName === 'foreignObject') el.remove();
    for (const { name, value } of [...el.attributes]) {
      if (name.startsWith('on') || /^\s*javascript:/i.test(value)) el.removeAttribute(name);
    }
  }
  return document.importNode(root, true);
};

/** Each holder's newest request, so a slow answer can't overwrite a newer one. */
const latest = new WeakMap<Element, object>();
/** The markup each holder shows, so a redraw with the same answer leaves the icon in place. */
const shown = new WeakMap<Element, string | undefined>();

/** Fill `holder` with the icon `id`, as `svg.svg-icon`. No icon for that id empties it. */
export const drawIcon = async (holder: Element, id: string, resolve: IconResolver): Promise<void> => {
  const request = {};
  latest.set(holder, request);
  const source = await resolve(id);
  if (latest.get(holder) !== request) return;
  if (shown.has(holder) && shown.get(holder) === source) return;
  shown.set(holder, source);
  const icon = source === undefined ? undefined : parseSvg(source);
  icon?.classList.add('svg-icon');
  holder.replaceChildren(...(icon ? [icon] : []));
};

/** Fill a callout's icon from the value of `--callout-icon`: an icon id, or a quoted `<svg>`, as in Obsidian. */
export const drawCalloutIcon = async (holder: Element, value: string, resolve: IconResolver): Promise<void> => {
  const icon = value.trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
  if (!icon.startsWith('<svg')) return drawIcon(holder, icon, resolve);
  const parsed = parseSvg(icon);
  if (!parsed) return;
  for (const [name, attr] of [['width', '16'], ['height', '16'], ['fill', 'currentColor'], ['stroke', 'currentColor']]) {
    parsed.setAttribute(name, attr);
  }
  holder.replaceChildren(parsed);
};
