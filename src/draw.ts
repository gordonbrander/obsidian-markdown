let nextDiagramId = 0;

// Skipping import() once loaded lets later renders finish in microtasks, before paint.
let tex: typeof import('./tex.ts') | undefined;
let mermaid: typeof import('mermaid').default | undefined;

const warn = (what: string, error: unknown) => console.warn(`obsidian-markdown: could not draw ${what}`, error);

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
      const { svg } = await mermaid.render(`obsidian-markdown-${++nextDiagramId}`, code.textContent ?? '');
      const diagram = document.createElement('div');
      diagram.className = 'diagram';
      diagram.innerHTML = svg;
      code.parentElement?.replaceWith(diagram);
    } catch (error) {
      warn('diagram', error);
    }
  }
};

/** Replace math and Mermaid markup with drawings. Never rejects. On failure the source stays in place. */
export const draw = async (root: ParentNode) => {
  const math = [...root.querySelectorAll<HTMLElement>('.math')];
  const diagrams = [...root.querySelectorAll<HTMLElement>('code.language-mermaid')];
  await Promise.all([
    math.length > 0 ? drawMath(math).catch((error) => warn('math', error)) : null,
    diagrams.length > 0 ? drawDiagrams(diagrams).catch((error) => warn('diagrams', error)) : null,
  ]);
};
