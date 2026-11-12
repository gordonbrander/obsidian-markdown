import { css } from 'lit';

/**
 * An optional look for `<ofm-note>`, `<ofm-markdown>` and `<ofm-frontmatter>`, using Obsidian's CSS variable names.
 * Callout colors are full colors, not Obsidian's `r, g, b` triples, which can't go through `light-dark()`.
 */
export const obsidianTheme = css`
  /* Zero specificity, so a host's own ofm-markdown { --x: y } wins over this adopted sheet. */
  :where(ofm-note, ofm-markdown, ofm-frontmatter) {
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
    --highlight-opacity: 30%;
    --highlight-background-red: color-mix(in srgb, var(--color-red) var(--highlight-opacity), transparent);
    --highlight-background-orange: color-mix(in srgb, var(--color-orange) var(--highlight-opacity), transparent);
    --highlight-background-yellow: color-mix(in srgb, var(--color-yellow) var(--highlight-opacity), transparent);
    --highlight-background-green: color-mix(in srgb, var(--color-green) var(--highlight-opacity), transparent);
    --highlight-background-blue: color-mix(in srgb, var(--color-blue) var(--highlight-opacity), transparent);
    --highlight-background-purple: color-mix(in srgb, var(--color-purple) var(--highlight-opacity), transparent);
    /* As in Obsidian, --text-highlight-bg is an optional override with no default. */
    --highlight-background: var(--text-highlight-bg, var(--highlight-background-yellow));
    --background-modifier-border: light-dark(#0000001f, #ffffff29);
    --background-modifier-hover: light-dark(#0000000d, #ffffff14);

    --font-text-theme: system-ui, sans-serif;
    --font-monospace-theme: ui-monospace, monospace;
    --font-interface: system-ui, sans-serif;
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
    --code-normal: var(--text-normal);
    --code-comment: var(--text-muted);
    --code-function: var(--color-yellow);
    --code-important: var(--color-orange);
    --code-keyword: var(--color-pink);
    --code-operator: var(--color-red);
    --code-property: var(--color-cyan);
    --code-punctuation: var(--text-muted);
    --code-string: var(--color-green);
    --code-tag: var(--color-red);
    --code-value: var(--color-purple);

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

  ofm-note, ofm-markdown {
    display: block;
    color-scheme: light dark;
    color: var(--text-normal);
    font-family: var(--font-text-theme);
    font-size: var(--font-text-size);
    line-height: var(--line-height-normal);
  }

  /* Obsidian's collapsible Properties section. */
  ofm-note {
    .ofm-properties {
      margin-block-end: 1em;
      padding-block-end: 0.5em;
      border-bottom: 1px solid var(--background-modifier-border);
    }
    .ofm-properties-heading {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-block: 4px;
      color: var(--text-muted);
      font-size: 0.875em;
      font-weight: 600;
      list-style: none;
      cursor: pointer;
      user-select: none;
      &::-webkit-details-marker {
        display: none;
      }
      &::before {
        content: '';
        width: 0.4em;
        height: 0.4em;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        transform: rotate(-45deg);
        transition: transform 100ms ease-in-out;
      }
    }
    .ofm-properties[open] > .ofm-properties-heading::before {
      transform: rotate(45deg);
    }
  }

  /* Obsidian's properties view. */
  ofm-frontmatter {
    display: block;
    color-scheme: light dark;
    color: var(--text-normal);
    font: 14px/1.4 var(--font-interface);
  }

  ofm-proprow {
    display: grid;
    grid-template-columns: 9em 1fr;
    align-items: start;
    gap: 4px;
    padding: 2px 0;

    .ofm-key {
      overflow: hidden;
      color: var(--text-muted);
      line-height: 28px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .ofm-value {
      display: flex;
      align-items: center;
      min-width: 0;
      min-height: 28px;
    }
    input {
      flex: 1;
      min-width: 0;
      height: 28px;
      box-sizing: border-box;
      padding: 0 6px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    input:not([readonly]):hover, input:not([readonly]):focus {
      background: var(--background-modifier-hover);
    }
    input:focus {
      outline: 1px solid var(--text-accent);
    }
    input[readonly]:focus {
      outline: none;
    }
    input[type='checkbox'] {
      flex: none;
      width: 16px;
      height: 16px;
      margin: 0 6px;
    }
    .ofm-tokens {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      min-width: 0;
      padding: 3px 6px;
    }
    .ofm-tokens input {
      flex: 1 1 4em;
      height: 22px;
      padding: 0;
    }
    .ofm-tokens input:hover, .ofm-tokens input:focus {
      background: transparent;
      outline: none;
    }
    .ofm-token {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--code-background);
      line-height: 22px;
      overflow-wrap: anywhere;
    }
    button {
      padding: 0;
      border: 0;
      background: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    .ofm-link {
      color: var(--text-accent);
      text-decoration: underline;
      overflow-wrap: anywhere;
    }
    .ofm-value > .ofm-link {
      margin-left: 6px;
    }
    .ofm-icon {
      padding: 0 4px;
      color: var(--text-muted);
    }
    pre {
      flex: 1;
      min-width: 0;
      margin: 0;
      padding: 4px 6px;
      overflow-x: auto;
      color: var(--text-muted);
      font: 12px/1.4 var(--font-monospace-theme);
    }
  }

  /* Variables with no default above fall back to inherit here, because --x: inherit wouldn't mean the same thing. */
  ofm-markdown {
    p {
      margin-block: var(--p-spacing);
    }
    strong {
      color: var(--bold-color, inherit);
      font-weight: var(--bold-weight);
    }
    em {
      color: var(--italic-color, inherit);
    }
    img, svg {
      max-width: 100%;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-block: 0.8em 0.4em;
    }
    h1 {
      color: var(--h1-color, inherit);
      font-family: var(--h1-font, inherit);
      font-size: var(--h1-size);
      font-style: var(--h1-style, normal);
      font-variant: var(--h1-variant, normal);
      font-weight: var(--h1-weight);
      line-height: var(--h1-line-height);
    }
    h2 {
      color: var(--h2-color, inherit);
      font-family: var(--h2-font, inherit);
      font-size: var(--h2-size);
      font-style: var(--h2-style, normal);
      font-variant: var(--h2-variant, normal);
      font-weight: var(--h2-weight);
      line-height: var(--h2-line-height);
    }
    h3 {
      color: var(--h3-color, inherit);
      font-family: var(--h3-font, inherit);
      font-size: var(--h3-size);
      font-style: var(--h3-style, normal);
      font-variant: var(--h3-variant, normal);
      font-weight: var(--h3-weight);
      line-height: var(--h3-line-height);
    }
    h4 {
      color: var(--h4-color, inherit);
      font-family: var(--h4-font, inherit);
      font-size: var(--h4-size);
      font-style: var(--h4-style, normal);
      font-variant: var(--h4-variant, normal);
      font-weight: var(--h4-weight);
      line-height: var(--h4-line-height);
    }
    h5 {
      color: var(--h5-color, inherit);
      font-family: var(--h5-font, inherit);
      font-size: var(--h5-size);
      font-style: var(--h5-style, normal);
      font-variant: var(--h5-variant, normal);
      font-weight: var(--h5-weight);
      line-height: var(--h5-line-height);
    }
    h6 {
      color: var(--h6-color, inherit);
      font-family: var(--h6-font, inherit);
      font-size: var(--h6-size);
      font-style: var(--h6-style, normal);
      font-variant: var(--h6-variant, normal);
      font-weight: var(--h6-weight);
      line-height: var(--h6-line-height);
    }

    a {
      color: var(--link-external-color);
      font-weight: var(--link-weight, inherit);
      text-decoration: var(--link-external-decoration);
      &:hover {
        color: var(--link-external-color-hover);
        text-decoration: var(--link-external-decoration-hover);
      }
    }
    a.internal-link {
      color: var(--link-color);
      text-decoration: var(--link-decoration);
      &:hover {
        color: var(--link-color-hover);
        text-decoration: var(--link-decoration-hover);
      }
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

    code, pre {
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
    }
    code {
      padding: 0.1em 0.3em;
      border-radius: 4px;
      background: var(--code-background);
      color: var(--code-normal);
    }
    pre {
      padding: 12px;
      overflow-x: auto;
      border-radius: 6px;
      background: var(--code-background);
      white-space: var(--code-white-space);
    }
    pre code {
      padding: 0;
      background: none;
      font-size: inherit;
    }

    /* Prism token colors, as in Obsidian's app.css. */
    .token.comment, .token.prolog, .token.doctype, .token.cdata { color: var(--code-comment); }
    .token.tag, .token.constant, .token.symbol, .token.deleted { color: var(--code-tag); }
    .token.punctuation { color: var(--code-punctuation); }
    .token.boolean, .token.number { color: var(--code-value); }
    .token.selector, .token.attr-name, .token.string, .token.char, .token.inserted { color: var(--code-string); }
    .token.operator { color: var(--code-operator); }
    .token.entity, .token.parameter, .token.property, .token.url, .token.variable,
    .language-css .token.string { color: var(--code-property); }
    .token.atrule, .token.attr-value, .token.builtin, .token.function, .token.class-name, .token.property-access {
      color: var(--code-function);
    }
    .token.keyword { color: var(--code-keyword); }
    .token.regex, .token.important { color: var(--code-important); }
    .token.important, .token.bold { font-weight: bold; }
    .token.italic { font-style: italic; }

    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: var(--blockquote-border-thickness) solid var(--blockquote-border-color);
      background: var(--blockquote-background-color);
      color: var(--blockquote-color);
      font-style: var(--blockquote-font-style);
    }

    hr {
      border: 0;
      border-top: var(--hr-thickness) solid var(--hr-color);
    }

    table {
      border-collapse: collapse;
      background: var(--table-background);
    }
    th, td {
      padding: 4px 10px;
      border: var(--table-border-width) solid var(--table-border-color);
      line-height: var(--table-line-height, inherit);
      vertical-align: var(--table-cell-vertical-alignment);
      white-space: var(--table-white-space);
    }
    td {
      color: var(--table-text-color, inherit);
      font-size: var(--table-text-size, inherit);
    }
    th {
      background: var(--table-header-background);
      color: var(--table-header-color, inherit);
      font-family: var(--table-header-font, inherit);
      font-size: var(--table-header-size, inherit);
      font-weight: var(--table-header-weight);
    }

    ul, ol {
      padding-inline-start: var(--list-indent);
    }
    li {
      margin-block: var(--list-spacing);
    }
    li::marker {
      color: var(--list-marker-color);
    }
    .task-list-item {
      list-style: none;
      margin-left: -1.2em;
    }
    .task-list-item.is-checked {
      color: var(--checklist-done-color);
      text-decoration: var(--checklist-done-decoration);
    }
    .task-list-item-checkbox {
      width: var(--checkbox-size);
      height: var(--checkbox-size);
    }

    mark {
      padding: 0 2px;
      border-radius: 2px;
      background: var(--highlight-background);
      color: inherit;
    }
    mark[data-highlight='red'] {
      --highlight-background: var(--highlight-background-red);
    }
    mark[data-highlight='orange'] {
      --highlight-background: var(--highlight-background-orange);
    }
    mark[data-highlight='yellow'] {
      --highlight-background: var(--highlight-background-yellow);
    }
    mark[data-highlight='green'] {
      --highlight-background: var(--highlight-background-green);
    }
    mark[data-highlight='blue'] {
      --highlight-background: var(--highlight-background-blue);
    }
    mark[data-highlight='purple'] {
      --highlight-background: var(--highlight-background-purple);
    }

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

    .math-block, .math-display {
      display: block;
      text-align: center;
      overflow-x: auto;
    }
    .mermaid {
      text-align: center;
    }
    .mermaid .internal-link {
      cursor: pointer;
    }

    .footnotes {
      margin-top: 2em;
      padding-top: 1em;
      border-top: 1px solid var(--background-modifier-border);
      font-size: var(--footnote-size);
    }
    .footnote-backref {
      text-decoration: none;
    }

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
    .callout-content {
      padding: var(--callout-content-padding);
      background: var(--callout-content-background);
    }
    .callout-content > :first-child {
      margin-top: 0.4em;
    }
    .callout-content > :last-child {
      margin-bottom: 0;
    }
    summary.callout-title {
      list-style: none;
      cursor: pointer;
      &::-webkit-details-marker {
        display: none;
      }
    }
    /* Browsers without ::details-content or interpolate-size toggle instantly. */
    .callout.is-collapsible {
      interpolate-size: allow-keywords;
      &::details-content {
        height: 0;
        overflow: clip;
        transition: height 150ms ease-out, content-visibility 150ms allow-discrete;
      }
      &[open]::details-content {
        height: auto;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .callout.is-collapsible::details-content {
        transition: none;
      }
    }
    .callout-fold::after {
      content: ' ▾';
    }
    .callout:not([open]) > .callout-title .callout-fold::after {
      content: ' ▸';
    }

    [data-callout='info'] {
      --callout-color: var(--callout-info);
    }
    [data-callout='todo'] {
      --callout-color: var(--callout-todo);
    }
    :is([data-callout='abstract'], [data-callout='summary'], [data-callout='tldr']) {
      --callout-color: var(--callout-summary);
    }
    [data-callout='important'] {
      --callout-color: var(--callout-important);
    }
    :is([data-callout='tip'], [data-callout='hint']) {
      --callout-color: var(--callout-tip);
    }
    :is([data-callout='success'], [data-callout='check'], [data-callout='done']) {
      --callout-color: var(--callout-success);
    }
    :is([data-callout='question'], [data-callout='help'], [data-callout='faq']) {
      --callout-color: var(--callout-question);
    }
    :is([data-callout='warning'], [data-callout='caution'], [data-callout='attention']) {
      --callout-color: var(--callout-warning);
    }
    :is([data-callout='failure'], [data-callout='fail'], [data-callout='missing']) {
      --callout-color: var(--callout-fail);
    }
    :is([data-callout='danger'], [data-callout='error']) {
      --callout-color: var(--callout-error);
    }
    [data-callout='bug'] {
      --callout-color: var(--callout-bug);
    }
    [data-callout='example'] {
      --callout-color: var(--callout-example);
    }
    :is([data-callout='quote'], [data-callout='cite']) {
      --callout-color: var(--callout-quote);
    }
  }
`;
