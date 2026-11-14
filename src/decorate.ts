// The parts of Obsidian's Read view that need a live page. render() emits the rest.
import { setCalloutIcon, setIcon } from './icons.ts';

/** Mirror a foldable callout's state as Obsidian's is-collapsed class, on it and on its fold arrow. */
export const syncCollapsed = (callout: Element) => {
  const collapsed = !callout.hasAttribute('open');
  callout.classList.toggle('is-collapsed', collapsed);
  callout.querySelector(':scope > .callout-title > .callout-fold')?.classList.toggle('is-collapsed', collapsed);
};

const warn = (error: unknown) => console.warn('ofm-markdown: could not draw icons', error);

/**
 * Draw the icons still missing under `root`. Never rejects.
 * A callout's icon comes from its computed `--callout-icon`, so `root` must be in the document.
 */
export const drawIcons = async (root: ParentNode): Promise<void> => {
  const jobs: Promise<void>[] = [];
  for (const icon of root.querySelectorAll('.callout > .callout-title > .callout-icon:empty')) {
    const callout = icon.closest('.callout')!;
    const value = callout.getAttribute('data-callout-icon') || getComputedStyle(callout).getPropertyValue('--callout-icon');
    if (value.trim()) jobs.push(setCalloutIcon(icon, value));
  }
  for (const link of root.querySelectorAll('.markdown-embed-link:empty')) jobs.push(setIcon(link, 'lucide-maximize-2'));
  await Promise.all(jobs.map((job) => job.catch(warn)));
};
