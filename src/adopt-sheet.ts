import type { CSSResultOrNative } from 'lit';

/** Add a stylesheet to a document or shadow root, keeping the sheets it already has. */
export const adoptSheet = (sheet: CSSResultOrNative, host: DocumentOrShadowRoot = document) => {
  const native = sheet instanceof CSSStyleSheet ? sheet : sheet.styleSheet;
  if (native && !host.adoptedStyleSheets.includes(native)) host.adoptedStyleSheets.push(native);
};
