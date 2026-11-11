// Loaded on demand by draw.ts, so plain notes never download MathJax.
import { MathJaxNewcmFont } from '@mathjax/mathjax-newcm-font/js/svg.js';
import { browserAdaptor } from '@mathjax/src/js/adaptors/browserAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import '@mathjax/src/js/input/tex/ams/AmsConfiguration.js';
import '@mathjax/src/js/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js';
import '@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js';
import { TeX } from '@mathjax/src/js/input/tex.js';
import { mathjax } from '@mathjax/src/js/mathjax.js';
import { SVG } from '@mathjax/src/js/output/svg.js';
import { fontFiles } from './tex-fonts.ts';

// Rarely used glyph ranges load on demand from our own bundle, never a CDN.
mathjax.asyncLoad = (name: string) => {
  const load = fontFiles[name.split('/').pop()?.replace(/\.js$/, '') ?? ''];
  return load ? load() : Promise.reject(new Error(`Unknown MathJax file: ${name}`));
};

RegisterHTMLHandler(browserAdaptor());

// Notes are untrusted. The html package defines \href, \style, \class and \cssId,
// and require and autoload fetch code, so all three stay out.
const texDocument = mathjax.document(document, {
  InputJax: new TeX({ packages: ['base', 'ams', 'newcommand', 'noundefined'] }),
  OutputJax: new SVG({ fontData: MathJaxNewcmFont, fontCache: 'none' }),
});

/** Convert LaTeX to a self-contained element holding an SVG. */
export const renderTex = async (latex: string, display: boolean): Promise<Element> => {
  const drawing = await texDocument.convertPromise(latex, { display }) as Element;
  // Browsers clip inner SVGs by default, which cuts off tall glyphs.
  drawing.querySelector('svg')?.setAttribute('overflow', 'visible');
  return drawing;
};
