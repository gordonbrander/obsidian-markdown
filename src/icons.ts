// Icons by Obsidian's ids: a Lucide name with a lucide- prefix, or one of the names Obsidian had before it used Lucide.

/** Obsidian's own ids, as the Lucide icons it draws for them. */
const ALIASES: Record<string, string> = {
  'quote-glyph': 'quote',
  help: 'help-circle',
};

// Skipping import() once loaded lets later renders finish in microtasks, before paint.
let lucide: typeof import('lucide') | undefined;

const pascal = (name: string) => name.replace(/(?:^|-)([a-z0-9])/g, (_, char: string) => char.toUpperCase());

/** Fill `host` with the icon Obsidian calls `id`, as `svg.svg-icon`. An id Lucide doesn't have leaves it as it is. */
export const setIcon = async (host: Element, id: string): Promise<void> => {
  lucide ??= await import('lucide');
  const name = ALIASES[id] ?? id.replace(/^lucide-/, '');
  const node = (lucide.icons as Record<string, import('lucide').IconNode | undefined>)[pascal(name)];
  if (!node) return;
  const svg = lucide.createElement(node);
  svg.setAttribute('class', `svg-icon lucide-${name}`);
  host.replaceChildren(svg);
};

/** Parse an `<svg>` string from a stylesheet, without anything that could run. */
const parseSvg = (source: string): Element | undefined => {
  const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') return undefined;
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    if (el.localName === 'script' || el.localName === 'foreignObject') el.remove();
    for (const { name, value } of [...el.attributes]) {
      if (name.startsWith('on') || /^\s*javascript:/i.test(value)) el.removeAttribute(name);
    }
  }
  return svg;
};

/** Fill a callout's icon from the value of `--callout-icon`: an icon id, or a quoted `<svg>`, as in Obsidian. */
export const setCalloutIcon = async (host: Element, value: string): Promise<void> => {
  const icon = value.trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim();
  if (!icon.startsWith('<svg')) return setIcon(host, icon);
  const svg = parseSvg(icon);
  if (!svg) return;
  for (const [name, attr] of [['width', '16'], ['height', '16'], ['fill', 'currentColor'], ['stroke', 'currentColor']]) {
    svg.setAttribute(name, attr);
  }
  host.replaceChildren(document.importNode(svg, true));
};
