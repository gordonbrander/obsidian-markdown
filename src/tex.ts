// Loaded on demand by draw.ts, so plain notes never download Temml or its fonts.
import temml from 'temml';

// Fonts go on the document, so they reach math inside shadow roots too. The theme's `math` rule uses them.
// Temml.woff2 holds the script capitals for \mathscr. Latin Modern Math is GUST-licensed (fonts/GUST-FONT-LICENSE.txt).
for (const [family, file] of [['Latin Modern Math', 'latinmodernmath.woff2'], ['Temml', 'Temml.woff2']]) {
  document.fonts.add(new FontFace(family, `url(${new URL(`./fonts/${file}`, import.meta.url)})`));
}

/**
 * Replace an element's LaTeX with MathML. Throws on invalid or unsupported input, leaving the element as it was.
 * Notes are untrusted, so `trust` stays off and \href, \url, \class and friends are rejected.
 * `\gdef` writes to `macros`, so pass the same object to share definitions across a note.
 */
export const renderTex = (latex: string, display: boolean, element: HTMLElement, macros: Record<string, unknown>) => {
  // temml.render empties its target before parsing, so draw off to the side and swap in only on success.
  const scratch = document.createElement('span');
  temml.render(latex, scratch, { displayMode: display, throwOnError: true, annotate: true, macros });
  element.replaceChildren(...scratch.childNodes);
};
