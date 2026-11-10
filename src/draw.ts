type IsCurrent = () => boolean;

let nextDiagramId = 0;

const warn = (what: string, error: unknown) => console.warn(`obsidian-markdown: could not draw ${what}`, error);

const drawMath = async (elements: HTMLElement[], isCurrent: IsCurrent) => {
  const { renderTex } = await import('./tex.ts');
  for (const element of elements) {
    if (!isCurrent()) return;
    const latex = element.textContent ?? '';
    try {
      const drawing = await renderTex(latex, !element.classList.contains('math-inline'));
      if (!isCurrent()) return;
      element.replaceChildren(drawing);
      element.setAttribute('role', 'img');
      element.setAttribute('aria-label', latex);
    } catch (error) {
      warn('math', error);
    }
  }
};

const drawDiagrams = async (codes: HTMLElement[], isCurrent: IsCurrent) => {
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    suppressErrorRendering: true,
    theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
  });
  for (const code of codes) {
    if (!isCurrent()) return;
    try {
      const { svg } = await mermaid.render(`obsidian-markdown-${++nextDiagramId}`, code.textContent ?? '');
      if (!isCurrent()) return;
      const diagram = document.createElement('div');
      diagram.className = 'diagram';
      diagram.innerHTML = svg;
      code.parentElement?.replaceWith(diagram);
    } catch (error) {
      warn('diagram', error);
    }
  }
};

/** Replace math and Mermaid markup with drawings. On failure the source stays visible. */
export const draw = async (root: ParentNode, isCurrent: IsCurrent) => {
  const math = [...root.querySelectorAll<HTMLElement>('.math')];
  const diagrams = [...root.querySelectorAll<HTMLElement>('code.language-mermaid')];
  await Promise.all([
    math.length > 0 ? drawMath(math, isCurrent).catch((error) => warn('math', error)) : null,
    diagrams.length > 0 ? drawDiagrams(diagrams, isCurrent).catch((error) => warn('diagrams', error)) : null,
  ]);
};
