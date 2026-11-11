import { css } from 'lit';

/**
 * An optional look for `<ofm-markdown>`, using Obsidian's CSS variable names.
 * Callout colors are full colors, not Obsidian's `r, g, b` triples, which can't go through `light-dark()`.
 */
export const obsidianTheme = css`
  /* Zero specificity, so a host's own ofm-markdown { --x: y } wins over this adopted sheet. */
  :where(ofm-markdown) {
    --color-red: light-dark(#e93147, #fb464c);
    --color-orange: light-dark(#ec7500, #e9973f);
    --color-yellow: light-dark(#e0ac00, #e0de71);
    --color-green: light-dark(#08b94e, #44cf6e);
    --color-cyan: light-dark(#00bfbc, #53dfdd);
    --color-blue: light-dark(#086ddd, #027aff);
    --color-purple: light-dark(#7852ee, #a882ff);
    --color-pink: light-dark(#d53984, #fa99cd);

    --text-normal: light-dark(#222222, #dadada);
    --text-muted: light-dark(#6b6b6b, #a0a0a0);
    --text-accent: light-dark(#6d3fd1, #a88bfa);
    --text-accent-hover: light-dark(#8a5cf5, #bda6fc);
    --text-highlight-bg: light-dark(#fff3a3, #7a6a00);
    --background-modifier-border: light-dark(#0000001f, #ffffff29);

    --font-text-theme: system-ui, sans-serif;
    --font-monospace-theme: ui-monospace, monospace;
    --font-text-size: 16px;
    --line-height-normal: 1.6;
    --p-spacing: 1em;
    --bold-weight: 700;

    --h1-size: 1.802em;
    --h2-size: 1.602em;
    --h3-size: 1.424em;
    --h4-size: 1.266em;
    --h5-size: 1.125em;
    --h6-size: 1em;
    --h1-weight: 700;
    --h2-weight: 600;
    --h3-weight: 600;
    --h4-weight: 600;
    --h5-weight: 600;
    --h6-weight: 600;
    --h1-line-height: 1.3;
    --h2-line-height: 1.3;
    --h3-line-height: 1.3;
    --h4-line-height: 1.3;
    --h5-line-height: 1.3;
    --h6-line-height: 1.3;

    --link-color: var(--text-accent);
    --link-color-hover: var(--text-accent-hover);
    --link-decoration: underline;
    --link-decoration-hover: underline;
    --link-external-color: var(--text-accent);
    --link-external-color-hover: var(--text-accent-hover);
    --link-external-decoration: underline;
    --link-external-decoration-hover: underline;

    --tag-size: 0.9em;
    --tag-color: var(--text-accent);
    --tag-color-hover: var(--text-accent-hover);
    --tag-decoration: none;
    --tag-decoration-hover: none;
    --tag-background: var(--code-background);
    --tag-background-hover: var(--code-background);
    --tag-border-color: transparent;
    --tag-border-color-hover: transparent;
    --tag-border-width: 0;
    --tag-padding-x: 8px;
    --tag-padding-y: 0;
    --tag-radius: 10px;

    --callout-border-width: 3px;
    --callout-border-opacity: 1;
    --callout-padding: 10px 14px;
    --callout-radius: 4px;
    --callout-blend-mode: normal;
    --callout-title-padding: 0;
    --callout-title-weight: 600;
    --callout-content-padding: 0;
    --callout-content-background: transparent;
    --callout-default: var(--color-blue);
    --callout-info: var(--color-blue);
    --callout-todo: var(--color-blue);
    --callout-summary: var(--color-cyan);
    --callout-important: var(--color-cyan);
    --callout-tip: var(--color-cyan);
    --callout-success: var(--color-green);
    --callout-question: var(--color-orange);
    --callout-warning: var(--color-orange);
    --callout-fail: var(--color-red);
    --callout-error: var(--color-red);
    --callout-bug: var(--color-red);
    --callout-example: var(--color-purple);
    --callout-quote: light-dark(#6b6b6b, #9e9e9e);

    --blockquote-background-color: transparent;
    --blockquote-border-thickness: 3px;
    --blockquote-border-color: var(--background-modifier-border);
    --blockquote-font-style: normal;
    --blockquote-color: var(--text-muted);

    --code-background: light-dark(#0000000d, #ffffff14);
    --code-size: 0.9em;
    --code-white-space: pre;

    --hr-color: var(--background-modifier-border);
    --hr-thickness: 1px;

    --table-background: transparent;
    --table-border-width: 1px;
    --table-border-color: var(--background-modifier-border);
    --table-header-background: transparent;
    --table-header-weight: 600;
    --table-cell-vertical-alignment: middle;
    --table-white-space: normal;

    --list-indent: 2.25em;
    --list-spacing: 0;
    --list-marker-color: var(--text-muted);
    --checkbox-size: 1em;
    --checklist-done-color: var(--text-muted);
    --checklist-done-decoration: none;

    --footnote-size: 0.9em;

    --embed-background: transparent;
    --embed-padding: 2px 8px;
    --embed-font-style: normal;
  }

  /* Variables with no default above fall back to inherit here, because --x: inherit wouldn't mean the same thing. */
  ofm-markdown {
    display: block;
    color-scheme: light dark;
    color: var(--text-normal);
    font-family: var(--font-text-theme);
    font-size: var(--font-text-size);
    line-height: var(--line-height-normal);

    p { margin-block: var(--p-spacing); }
    strong { color: var(--bold-color, inherit); font-weight: var(--bold-weight); }
    em { color: var(--italic-color, inherit); }
    img, svg { max-width: 100%; }

    h1, h2, h3, h4, h5, h6 { margin-block: 0.8em 0.4em; }
    h1 { color: var(--h1-color, inherit); font-family: var(--h1-font, inherit); font-size: var(--h1-size); font-style: var(--h1-style, normal); font-variant: var(--h1-variant, normal); font-weight: var(--h1-weight); line-height: var(--h1-line-height); }
    h2 { color: var(--h2-color, inherit); font-family: var(--h2-font, inherit); font-size: var(--h2-size); font-style: var(--h2-style, normal); font-variant: var(--h2-variant, normal); font-weight: var(--h2-weight); line-height: var(--h2-line-height); }
    h3 { color: var(--h3-color, inherit); font-family: var(--h3-font, inherit); font-size: var(--h3-size); font-style: var(--h3-style, normal); font-variant: var(--h3-variant, normal); font-weight: var(--h3-weight); line-height: var(--h3-line-height); }
    h4 { color: var(--h4-color, inherit); font-family: var(--h4-font, inherit); font-size: var(--h4-size); font-style: var(--h4-style, normal); font-variant: var(--h4-variant, normal); font-weight: var(--h4-weight); line-height: var(--h4-line-height); }
    h5 { color: var(--h5-color, inherit); font-family: var(--h5-font, inherit); font-size: var(--h5-size); font-style: var(--h5-style, normal); font-variant: var(--h5-variant, normal); font-weight: var(--h5-weight); line-height: var(--h5-line-height); }
    h6 { color: var(--h6-color, inherit); font-family: var(--h6-font, inherit); font-size: var(--h6-size); font-style: var(--h6-style, normal); font-variant: var(--h6-variant, normal); font-weight: var(--h6-weight); line-height: var(--h6-line-height); }

    a {
      color: var(--link-external-color);
      font-weight: var(--link-weight, inherit);
      text-decoration: var(--link-external-decoration);
      &:hover { color: var(--link-external-color-hover); text-decoration: var(--link-external-decoration-hover); }
    }
    a.internal-link {
      color: var(--link-color);
      text-decoration: var(--link-decoration);
      &:hover { color: var(--link-color-hover); text-decoration: var(--link-decoration-hover); }
    }
    a.tag {
      padding: var(--tag-padding-y) var(--tag-padding-x);
      border: var(--tag-border-width) solid var(--tag-border-color);
      border-radius: var(--tag-radius);
      background: var(--tag-background);
      color: var(--tag-color);
      font-size: var(--tag-size);
      font-weight: var(--tag-weight, inherit);
      text-decoration: var(--tag-decoration);
      &:hover {
        border-color: var(--tag-border-color-hover);
        background: var(--tag-background-hover);
        color: var(--tag-color-hover);
        text-decoration: var(--tag-decoration-hover);
      }
    }

    code, pre { font-family: var(--font-monospace-theme); font-size: var(--code-size); }
    code { padding: 0.1em 0.3em; border-radius: 4px; background: var(--code-background); color: var(--code-normal, inherit); }
    pre { padding: 12px; overflow-x: auto; border-radius: 6px; background: var(--code-background); white-space: var(--code-white-space); }
    pre code { padding: 0; background: none; font-size: inherit; }

    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: var(--blockquote-border-thickness) solid var(--blockquote-border-color);
      background: var(--blockquote-background-color);
      color: var(--blockquote-color);
      font-style: var(--blockquote-font-style);
    }

    hr { border: 0; border-top: var(--hr-thickness) solid var(--hr-color); }

    table { border-collapse: collapse; background: var(--table-background); }
    th, td {
      padding: 4px 10px;
      border: var(--table-border-width) solid var(--table-border-color);
      line-height: var(--table-line-height, inherit);
      vertical-align: var(--table-cell-vertical-alignment);
      white-space: var(--table-white-space);
    }
    td { color: var(--table-text-color, inherit); font-size: var(--table-text-size, inherit); }
    th {
      background: var(--table-header-background);
      color: var(--table-header-color, inherit);
      font-family: var(--table-header-font, inherit);
      font-size: var(--table-header-size, inherit);
      font-weight: var(--table-header-weight);
    }

    ul, ol { padding-inline-start: var(--list-indent); }
    li { margin-block: var(--list-spacing); }
    li::marker { color: var(--list-marker-color); }
    li[data-task] { list-style: none; margin-left: -1.2em; }
    li[data-task]:not([data-task='']) { color: var(--checklist-done-color); text-decoration: var(--checklist-done-decoration); }
    input[type='checkbox'] { width: var(--checkbox-size); height: var(--checkbox-size); }

    mark { padding: 0 2px; border-radius: 2px; background: var(--text-highlight-bg); color: inherit; }
    mark[data-highlight-color='red'] { background: color-mix(in srgb, var(--color-red) 35%, transparent); }
    mark[data-highlight-color='orange'] { background: color-mix(in srgb, var(--color-orange) 35%, transparent); }
    mark[data-highlight-color='yellow'] { background: color-mix(in srgb, var(--color-yellow) 35%, transparent); }
    mark[data-highlight-color='green'] { background: color-mix(in srgb, var(--color-green) 35%, transparent); }
    mark[data-highlight-color='blue'] { background: color-mix(in srgb, var(--color-blue) 35%, transparent); }
    mark[data-highlight-color='purple'] { background: color-mix(in srgb, var(--color-purple) 35%, transparent); }

    span.internal-embed:empty::before {
      content: '↪ ' attr(src);
      padding: var(--embed-padding);
      border: 1px dashed var(--background-modifier-border);
      border-radius: 4px;
      background: var(--embed-background);
      color: var(--text-muted);
      font-size: 0.9em;
      font-style: var(--embed-font-style);
    }

    .math-block, .math-display { display: block; text-align: center; overflow-x: auto; }
    .diagram { text-align: center; }
    .diagram .internal-link { cursor: pointer; }

    .footnotes {
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid var(--background-modifier-border);
      font-size: var(--footnote-size);
    }
    .footnote-backref { text-decoration: none; }

    .callout {
      --callout-color: var(--callout-default);
      margin: 1em 0;
      padding: var(--callout-padding);
      border-left: var(--callout-border-width) solid
        color-mix(in srgb, var(--callout-color) calc(var(--callout-border-opacity) * 100%), transparent);
      border-radius: var(--callout-radius);
      background: color-mix(in srgb, var(--callout-color) 10%, transparent);
      mix-blend-mode: var(--callout-blend-mode);
    }
    .callout-title {
      padding: var(--callout-title-padding);
      color: var(--callout-title-color, var(--callout-color));
      font-size: var(--callout-title-size, inherit);
      font-weight: var(--callout-title-weight);
    }
    .callout-content { padding: var(--callout-content-padding); background: var(--callout-content-background); }
    .callout-content > :first-child { margin-top: 0.4em; }
    .callout-content > :last-child { margin-bottom: 0; }
    [data-callout-fold] > .callout-title { cursor: pointer; }
    [data-callout-fold] > .callout-title::after { content: ' ▾'; }
    [data-callout-fold='-'] > .callout-title::after { content: ' ▸'; }

    [data-callout='info'] { --callout-color: var(--callout-info); }
    [data-callout='todo'] { --callout-color: var(--callout-todo); }
    :is([data-callout='abstract'], [data-callout='summary'], [data-callout='tldr']) { --callout-color: var(--callout-summary); }
    [data-callout='important'] { --callout-color: var(--callout-important); }
    :is([data-callout='tip'], [data-callout='hint']) { --callout-color: var(--callout-tip); }
    :is([data-callout='success'], [data-callout='check'], [data-callout='done']) { --callout-color: var(--callout-success); }
    :is([data-callout='question'], [data-callout='help'], [data-callout='faq']) { --callout-color: var(--callout-question); }
    :is([data-callout='warning'], [data-callout='caution'], [data-callout='attention']) { --callout-color: var(--callout-warning); }
    :is([data-callout='failure'], [data-callout='fail'], [data-callout='missing']) { --callout-color: var(--callout-fail); }
    :is([data-callout='danger'], [data-callout='error']) { --callout-color: var(--callout-error); }
    [data-callout='bug'] { --callout-color: var(--callout-bug); }
    [data-callout='example'] { --callout-color: var(--callout-example); }
    :is([data-callout='quote'], [data-callout='cite']) { --callout-color: var(--callout-quote); }
  }
`;
