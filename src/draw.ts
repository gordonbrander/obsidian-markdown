let nextDiagramId = 0;

// Skipping import() once loaded lets later renders finish in microtasks, before paint.
let tex: typeof import('./tex.ts') | undefined;
let mermaid: typeof import('mermaid').default | undefined;
let refractor: typeof import('refractor').refractor | undefined;

type Tokens = ReturnType<NonNullable<typeof refractor>['highlight']>['children'];

const warn = (what: string, error: unknown) => console.warn(`ofm-markdown: could not draw ${what}`, error);

const drawMath = async (elements: HTMLElement[]) => {
  tex ??= await import('./tex.ts');
  const { renderTex } = tex;
  for (const element of elements) {
    const latex = element.textContent ?? '';
    try {
      const drawing = await renderTex(latex, !element.classList.contains('math-inline'));
      element.replaceChildren(drawing);
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', latex);
    } catch (error) {
      warn('math', error);
    }
  }
};

const drawDiagrams = async (codes: HTMLElement[]) => {
  mermaid ??= (await import('mermaid')).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
  });
  for (const code of codes) {
    try {
      const { svg } = await mermaid.render(`ofm-markdown-${++nextDiagramId}`, code.textContent ?? '');
      const diagram = document.createElement('div');
      diagram.className = 'mermaid';
      diagram.innerHTML = svg;
      code.parentElement?.replaceWith(diagram);
    } catch (error) {
      warn('diagram', error);
    }
  }
};

// DOM nodes, not innerHTML, so code text is never parsed as markup.
const toNodes = (tokens: Tokens): Node[] => tokens.flatMap<Node>((token) => {
  if (token.type === 'text') return [document.createTextNode(token.value)];
  if (token.type !== 'element') return [];
  const span = document.createElement('span');
  span.className = [token.properties.className ?? []].flat().join(' ');
  span.append(...toNodes(token.children));
  return [span];
});

const drawCode = async (codes: HTMLElement[]) => {
  refractor ??= (await import('refractor')).refractor;
  for (const code of codes) {
    const lang = code.className.match(/language-(\S+)/)?.[1];
    // Unknown languages stay plain, as in Obsidian.
    if (!lang || !refractor.registered(lang)) continue;
    try {
      code.replaceChildren(...toNodes(refractor.highlight(code.textContent ?? '', lang).children));
      code.parentElement?.classList.add(`language-${lang}`); // As Prism does, for pre[class*="language-"] snippets.
    } catch (error) {
      warn('code', error);
    }
  }
};

/** Replace math and Mermaid markup with drawings, and highlight code. Never rejects. On failure the source stays in place. */
export const draw = async (root: ParentNode) => {
  const math = [...root.querySelectorAll<HTMLElement>('.math')];
  const diagrams = [...root.querySelectorAll<HTMLElement>('code.language-mermaid')];
  const codes = [...root.querySelectorAll<HTMLElement>('pre > code[class*="language-"]:not(.language-mermaid)')];
  await Promise.all([
    math.length > 0 ? drawMath(math).catch((error) => warn('math', error)) : null,
    diagrams.length > 0 ? drawDiagrams(diagrams).catch((error) => warn('diagrams', error)) : null,
    codes.length > 0 ? drawCode(codes).catch((error) => warn('code', error)) : null,
  ]);
};
