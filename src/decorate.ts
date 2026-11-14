// What Obsidian's reading view adds to rendered Markdown with post-processors.
// render() gives the canonical HTML of SPEC.md; these make it the DOM that Obsidian's CSS, and snippets written for it, expect.
import { setCalloutIcon, setIcon } from './icons.ts';

const span = (className: string) => {
  const el = document.createElement('span');
  el.className = className;
  return el;
};

/** Mirror a foldable callout's state as Obsidian's is-collapsed class, on it and on its fold arrow. */
export const syncCollapsed = (callout: Element) => {
  const collapsed = !callout.hasAttribute('open');
  callout.classList.toggle('is-collapsed', collapsed);
  callout.querySelector(':scope > .callout-title > .callout-fold')?.classList.toggle('is-collapsed', collapsed);
};

/** Add Obsidian's list bullets and image embed wrappers, and mark collapsed callouts. Needs no layout, so it can run off-screen. */
export const decorate = (root: ParentNode) => {
  for (const item of root.querySelectorAll('ul > li')) {
    item.parentElement?.classList.add('has-list-bullet');
    item.prepend(span('list-bullet'));
  }
  for (const image of root.querySelectorAll('img.internal-embed')) {
    const embed = span('internal-embed image-embed is-loaded');
    for (const name of ['src', 'alt']) {
      const value = image.getAttribute(name);
      if (value !== null) embed.setAttribute(name, value);
    }
    image.removeAttribute('class');
    image.replaceWith(embed);
    embed.append(image);
  }
  for (const callout of root.querySelectorAll('details.callout')) syncCollapsed(callout);
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
  for (const fold of root.querySelectorAll('.callout-fold:empty')) jobs.push(setIcon(fold, 'lucide-chevron-down'));
  for (const link of root.querySelectorAll('.markdown-embed-link:empty')) jobs.push(setIcon(link, 'lucide-maximize-2'));
  await Promise.all(jobs.map((job) => job.catch(warn)));
};
