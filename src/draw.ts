let nextDiagramId = 0;

// Skipping import() once loaded lets later renders finish in microtasks, before paint.
let tex: typeof import('./tex.ts') | undefined;
let pele: typeof import('pele') | undefined;
let refractor: typeof import('refractor').refractor | undefined;

type Tokens = ReturnType<NonNullable<typeof refractor>['highlight']>['children'];

const warn = (what: string, error: unknown) => console.warn(`ofm-markdown: could not draw ${what}`, error);

const drawMath = async (elements: HTMLElement[]) => {
  tex ??= await import('./tex.ts');
  const { renderTex } = tex;
  const macros = {}; // One per note, so \gdef carries from one formula to the next.
  for (const element of elements) {
    try {
      renderTex(element.textContent ?? '', !element.classList.contains('math-inline'), element, macros);
    } catch (error) {
      warn('math', error);
    }
  }
};

const drawDiagrams = async (codes: HTMLElement[]) => {
  pele ??= await import('pele');
  for (const code of codes) {
    try {
      // The prefix keeps SVG ids unique when a page shows several notes.
      const { svg } = pele.render(code.textContent ?? '', { idPrefix: `ofm-markdown-${++nextDiagramId}-` });
      const diagram = document.createElement('div');
      diagram.className = 'mermaid';
      // Pele escapes diagram text. We pass no icon or math resolver, the only unescaped inputs.
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

const loadRefractor = async () => {
  const [{ refractor }, { default: jsx }, { default: tsx }] = await Promise.all([
    import('refractor'),
    import('refractor/jsx'),
    import('refractor/tsx'),
  ]);
  refractor.register(jsx);
  refractor.register(tsx);
  // Prism has no Svelte or Vue grammar; markup highlights their <script> and <style> as JS and CSS.
  refractor.alias({ markup: ['svelte', 'vue'] });
  return refractor;
};

const drawCode = async (codes: HTMLElement[]) => {
  refractor ??= await loadRefractor();
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
