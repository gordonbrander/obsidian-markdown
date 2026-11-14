// The parts of Obsidian's Read view that need a live page. render() emits the rest.
import { drawCalloutIcon, drawIcon } from './services/icons.ts';
import type { IconResolver } from './services/icons.ts';

/** Mirror a foldable callout's state as Obsidian's is-collapsed class, on it and on its fold arrow. */
export const syncCollapsed = (callout: Element) => {
  const collapsed = !callout.hasAttribute('open');
  callout.classList.toggle('is-collapsed', collapsed);
  callout.querySelector(':scope > .callout-title > .callout-fold')?.classList.toggle('is-collapsed', collapsed);
};

const warn = (error: unknown) => console.warn('ofm-markdown: could not draw icons', error);

/**
 * Draw the icons still missing under `root`, through `resolve`. Never rejects.
 * A callout's icon comes from its computed `--callout-icon`, so `root` must be in the document.
 */
export const drawIcons = async (root: ParentNode, resolve: IconResolver): Promise<void> => {
  const jobs: Promise<void>[] = [];
  for (const icon of root.querySelectorAll('.callout > .callout-title > .callout-icon:empty')) {
    const callout = icon.closest('.callout')!;
    const value = callout.getAttribute('data-callout-icon') || getComputedStyle(callout).getPropertyValue('--callout-icon');
    if (value.trim()) jobs.push(drawCalloutIcon(icon, value, resolve));
  }
  for (const link of root.querySelectorAll('.markdown-embed-link:empty')) jobs.push(drawIcon(link, 'lucide-maximize-2', resolve));
  await Promise.all(jobs.map((job) => job.catch(warn)));
};
