// Icons, by Obsidian's ids: a Lucide name with a lucide- prefix, or one of the names Obsidian had before it used Lucide.
// Which icon goes where is the theme's and the components' business. This module only turns an id into an SVG.
import {
  AlertTriangle, Binary, Bug, Calendar, Check, CheckCircle2, CheckSquare, ChevronDown, ClipboardList, Clock,
  FileQuestion, Flame, Forward, HelpCircle, Info, List, Maximize2, Pencil, Quote, Tags, Text, X, Zap,
} from 'lucide';
import type { IconNode } from 'lucide';

/** An icon's `<svg>` markup by Obsidian's id (`lucide-flame`, `quote-glyph`), or undefined for no icon. */
export type IconResolver = (id: string) => Promise<string | undefined>;

/** The Lucide icons Obsidian's Read view and properties use, by Obsidian's names. Imported by name, so bundles keep only these. */
const LUCIDE: Record<string, IconNode> = {
  'alert-triangle': AlertTriangle,
  'binary': Binary,
  'bug': Bug,
  'calendar': Calendar,
  'check': Check,
  'check-circle-2': CheckCircle2,
  'check-square': CheckSquare,
  'chevron-down': ChevronDown,
  'clipboard-list': ClipboardList,
  'clock': Clock,
  'file-question': FileQuestion,
  'flame': Flame,
  'forward': Forward,
  'help-circle': HelpCircle,
  'info': Info,
  'list': List,
  'maximize-2': Maximize2,
  'pencil': Pencil,
  'quote-glyph': Quote,
  'tags': Tags,
  'text': Text,
  'x': X,
  'zap': Zap,
};

/** Obsidian's own collapse arrow, which isn't a Lucide icon. */
const RIGHT_TRIANGLE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="right-triangle"><path d="M3 8L12 17L21 8"/></svg>';

const escapeAttr = (value: string | number) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** A Lucide icon as markup, with Lucide's default attributes. */
const toSvg = (name: string, node: IconNode) => {
  const children = node.map(([tag, attrs]) =>
    `<${tag}${Object.entries(attrs).map(([key, value]) => ` ${key}="${escapeAttr(value ?? '')}"`).join('')}/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-${name}">${children.join('')}</svg>`;
};

/** The default resolver: the icons Obsidian draws by default. Any other id has no icon. */
export const lucideIcons: IconResolver = async (id) => {
  if (id === 'right-triangle') return RIGHT_TRIANGLE;
  const name = id.replace(/^lucide-/, '');
  const node = Object.hasOwn(LUCIDE, name) ? LUCIDE[name] : undefined;
  return node && toSvg(name === 'quote-glyph' ? 'quote' : name, node);
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
