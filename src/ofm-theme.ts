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

    /* Obsidian 1.15's base and accent colors, with its hsl() accent math resolved to hex. */
    --text-normal: light-dark(#222222, #dadada);
    --text-muted: light-dark(#5c5c5c, #b3b3b3);
    --text-faint: light-dark(#ababab, #666666);
    --text-accent: light-dark(#8a5cf5, #a68af9);
    --text-accent-hover: light-dark(#a68af9, #c5b6fc);
    --interactive-accent: light-dark(#9873f7, #8a5cf5);
    --interactive-accent-hover: light-dark(#a68af9, #a68af9);
    --background-primary: light-dark(#ffffff, #1c1c1c);
    --background-primary-alt: light-dark(#fafafa, #232323);
    --background-modifier-border: light-dark(#e4e4e4, #333333);
    --background-modifier-border-focus: light-dark(#bdbdbd, #555555);
    --background-modifier-hover: light-dark(#00000011, #ffffff11);
    --highlight-opacity: 30%;
    --highlight-background-red: color-mix(in oklch, var(--color-red) var(--highlight-opacity), transparent);
    --highlight-background-orange: color-mix(in oklch, var(--color-orange) var(--highlight-opacity), transparent);
    --highlight-background-yellow: color-mix(in oklch, var(--color-yellow) var(--highlight-opacity), transparent);
    --highlight-background-green: color-mix(in oklch, var(--color-green) var(--highlight-opacity), transparent);
    --highlight-background-blue: color-mix(in oklch, var(--color-blue) var(--highlight-opacity), transparent);
    --highlight-background-purple: color-mix(in oklch, var(--color-purple) var(--highlight-opacity), transparent);
    /* As in Obsidian, --text-highlight-bg is an optional override with no default. */
    --highlight-background: var(--text-highlight-bg, var(--highlight-background-yellow));

    --font-text-theme: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, 'Segoe UI', 'Google Sans Flex',
      Roboto, 'Inter Variable', 'Inter', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
    --font-monospace-theme: ui-monospace, SFMono-Regular, 'Cascadia Mono', 'Roboto Mono', 'DejaVu Sans Mono',
      'Liberation Mono', Menlo, Monaco, 'Consolas', 'Source Code Pro', monospace;
    --font-interface: var(--font-text-theme);
    --font-text-size: 16px;
    --line-height-normal: 1.5;
    --line-height-tight: 1.3;
    --p-spacing: 1rem;
    --heading-spacing: calc(var(--p-spacing) * 2.5);
    --bold-weight: 600;

    --h1-size: 1.618em;
    --h2-size: 1.462em;
    --h3-size: 1.318em;
    --h4-size: 1.188em;
    --h5-size: 1.076em;
    --h6-size: 1em;
    --h1-weight: 700;
    --h2-weight: 680;
    --h3-weight: 660;
    --h4-weight: 640;
    --h5-weight: 620;
    --h6-weight: 600;
    --h1-line-height: 1.2;
    --h2-line-height: 1.2;
    --h3-line-height: 1.3;
    --h4-line-height: 1.4;
    --h5-line-height: var(--line-height-normal);
    --h6-line-height: var(--line-height-normal);
    --h1-letter-spacing: -0.015em;
    --h2-letter-spacing: -0.011em;
    --h3-letter-spacing: -0.008em;
    --h4-letter-spacing: -0.005em;
    --h5-letter-spacing: -0.002em;
    --h6-letter-spacing: 0em;

    --link-color: var(--text-accent);
    --link-color-hover: var(--text-accent-hover);
    --link-decoration: underline;
    --link-decoration-hover: underline;
    --link-external-color: var(--text-accent);
    --link-external-color-hover: var(--text-accent-hover);
    --link-external-decoration: underline;
    --link-external-decoration-hover: underline;

    --tag-size: 0.875em;
    --tag-color: var(--text-accent);
    --tag-color-hover: var(--text-accent);
    --tag-decoration: none;
    --tag-decoration-hover: none;
    --tag-background: color-mix(in oklch, var(--interactive-accent) 10%, transparent);
    --tag-background-hover: color-mix(in oklch, var(--interactive-accent) 20%, transparent);
    --tag-border-color: color-mix(in oklch, var(--interactive-accent) 15%, transparent);
    --tag-border-color-hover: color-mix(in oklch, var(--interactive-accent) 15%, transparent);
    --tag-border-width: 0px;
    --tag-padding-x: 0.65em;
    --tag-padding-y: 0.25em;
    --tag-radius: 2em;

    --callout-border-width: 0px;
    --callout-border-opacity: 0.25;
    --callout-padding: 12px 12px 12px 24px;
    --callout-radius: 4px;
    /* Obsidian uses darken (light) / lighten (dark). A keyword can't follow light-dark(), and over a plain page it looks the same. */
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
    --callout-quote: #9e9e9e;

    --blockquote-background-color: transparent;
    --blockquote-border-thickness: 2px;
    --blockquote-border-color: var(--interactive-accent);
    --blockquote-font-style: normal;
    --blockquote-color: inherit;

    --code-background: var(--background-primary-alt);
    --code-radius: 4px;
    --code-size: 0.875em;
    --code-white-space: pre-wrap;
    --code-normal: var(--text-normal);
    --code-comment: var(--text-faint);
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
    --hr-thickness: 2px;

    --table-background: transparent;
    --table-border-width: 1px;
    --table-border-color: var(--background-modifier-border);
    --table-header-background: transparent;
    --table-header-color: var(--text-normal);
    --table-header-weight: 600;
    --table-line-height: var(--line-height-tight);
    --table-cell-vertical-alignment: top;
    --table-white-space: break-spaces;

    --list-indent: 2.25em;
    --list-spacing: 0.075em;
    --list-marker-color: var(--text-faint);
    --checkbox-size: 1em;
    --checkbox-radius: 4px;
    --checkbox-color: var(--interactive-accent);
    --checkbox-color-hover: var(--interactive-accent-hover);
    --checkbox-border-color: var(--text-faint);
    --checkbox-marker-color: var(--background-primary);
    --checklist-done-color: var(--text-muted);
    --checklist-done-decoration: line-through;

    --footnote-size: 0.875em;

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
      margin-block-end: 3em;
    }
    .ofm-properties-heading {
      position: relative;
      display: block;
      padding-block: 0 4px;
      color: var(--text-normal);
      font-size: 1em;
      font-weight: var(--bold-weight);
      list-style: none;
      cursor: pointer;
      user-select: none;
      &::-webkit-details-marker {
        display: none;
      }
      /* Hangs in the gutter, so the title stays flush with the body text. */
      &::before {
        content: '';
        position: absolute;
        inset-inline-end: 100%;
        top: 0.75em;
        width: 0.4em;
        height: 0.4em;
        margin-inline-end: 0.6em;
        border-right: 1.5px solid currentColor;
        border-bottom: 1.5px solid currentColor;
        color: var(--text-accent);
        transform: translateY(-50%) rotate(-45deg);
        transition: transform 100ms ease-in-out, opacity 100ms ease-in-out;
      }
    }
    /* Open, the arrow is faint and shows only on hover or focus. Closed, it's always shown in the accent color. */
    .ofm-properties[open] > .ofm-properties-heading::before {
      color: var(--text-faint);
      opacity: 0;
      transform: translateY(-50%) rotate(45deg);
    }
    .ofm-properties[open] > .ofm-properties-heading:is(:hover, :focus-visible)::before {
      opacity: 1;
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
    > :first-child {
      margin-top: 0;
    }
    > :last-child {
      margin-bottom: 0;
    }
    p, ul, ol, table {
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
      margin-block: var(--p-spacing);
    }
    /* Obsidian's reading view wraps blocks, so its rule also catches headings after blockquotes. */
    :is(p, pre, table, ul, ol, blockquote) + :is(h1, h2, h3, h4, h5, h6) {
      margin-top: var(--heading-spacing);
    }
    li :is(h1, h2, h3, h4, h5) {
      margin-block: 0;
    }
    h1 {
      color: var(--h1-color, inherit);
      font-family: var(--h1-font, inherit);
      font-size: var(--h1-size);
      font-style: var(--h1-style, normal);
      font-variant: var(--h1-variant, normal);
      font-weight: var(--h1-weight);
      line-height: var(--h1-line-height);
      letter-spacing: var(--h1-letter-spacing);
    }
    h2 {
      color: var(--h2-color, inherit);
      font-family: var(--h2-font, inherit);
      font-size: var(--h2-size);
      font-style: var(--h2-style, normal);
      font-variant: var(--h2-variant, normal);
      font-weight: var(--h2-weight);
      line-height: var(--h2-line-height);
      letter-spacing: var(--h2-letter-spacing);
    }
    h3 {
      color: var(--h3-color, inherit);
      font-family: var(--h3-font, inherit);
      font-size: var(--h3-size);
      font-style: var(--h3-style, normal);
      font-variant: var(--h3-variant, normal);
      font-weight: var(--h3-weight);
      line-height: var(--h3-line-height);
      letter-spacing: var(--h3-letter-spacing);
    }
    h4 {
      color: var(--h4-color, inherit);
      font-family: var(--h4-font, inherit);
      font-size: var(--h4-size);
      font-style: var(--h4-style, normal);
      font-variant: var(--h4-variant, normal);
      font-weight: var(--h4-weight);
      line-height: var(--h4-line-height);
      letter-spacing: var(--h4-letter-spacing);
    }
    h5 {
      color: var(--h5-color, inherit);
      font-family: var(--h5-font, inherit);
      font-size: var(--h5-size);
      font-style: var(--h5-style, normal);
      font-variant: var(--h5-variant, normal);
      font-weight: var(--h5-weight);
      line-height: var(--h5-line-height);
      letter-spacing: var(--h5-letter-spacing);
    }
    h6 {
      color: var(--h6-color, inherit);
      font-family: var(--h6-font, inherit);
      font-size: var(--h6-size);
      font-style: var(--h6-style, normal);
      font-variant: var(--h6-variant, normal);
      font-weight: var(--h6-weight);
      line-height: var(--h6-line-height);
      letter-spacing: var(--h6-letter-spacing);
    }

    a {
      color: var(--link-external-color);
      font-weight: var(--link-weight, inherit);
      text-decoration: var(--link-external-decoration);
      text-decoration-thickness: auto;
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
    /* Obsidian's public/external-link.svg. */
    a.external-link {
      padding-inline-end: 0.9em;
      background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='9.38%25'><path d='M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18'/></svg>")
        right 0.25em / 0.825em no-repeat;
    }
    a.tag {
      line-height: 1;
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
      padding: 0.15em 0.3em;
      border-radius: var(--code-radius);
      background: var(--code-background);
      color: var(--code-normal);
    }
    pre {
      /* Obsidian sets * { box-sizing: border-box }, so its 38px includes the padding. */
      box-sizing: border-box;
      min-height: 38px;
      padding: 12px 16px;
      overflow-x: auto;
      border-radius: var(--code-radius);
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
      margin-inline: 0;
      padding-block: 0;
      padding-inline-start: 24px;
      border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color);
      background: var(--blockquote-background-color);
      color: var(--blockquote-color);
      font-style: var(--blockquote-font-style);
      > :first-child {
        margin-top: 0;
      }
      > :last-child {
        margin-bottom: 0;
      }
    }

    hr {
      margin: 2rem 0;
      border: 0;
      border-top: var(--hr-thickness) solid var(--hr-color);
    }

    table {
      border-collapse: collapse;
      background: var(--table-background);
      line-height: var(--table-line-height);
    }
    th, td {
      min-width: 6ch;
      padding: 4px 8px;
      border: var(--table-border-width) solid var(--table-border-color);
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
      padding-inline-start: 0;
    }
    :is(ul, ol) :is(ul, ol) {
      margin-block: 0;
    }
    li {
      margin-inline-start: 3ch;
      padding-block: var(--list-spacing);
    }
    :is(ul, ol) :is(ul, ol) > li {
      margin-inline-start: var(--list-indent);
    }
    li > p:first-of-type {
      margin-top: 0;
    }
    li > p:last-of-type {
      margin-bottom: 0;
    }
    li::marker {
      color: var(--list-marker-color);
    }
    .task-list-item {
      list-style: none;
    }
    /* Obsidian strikes through only [x], not other task characters. */
    .task-list-item:is([data-task='x'], [data-task='X']) {
      color: var(--checklist-done-color);
      text-decoration: var(--checklist-done-decoration);
    }
    .task-list-item-checkbox {
      appearance: none;
      position: relative;
      top: 0.2em;
      width: var(--checkbox-size);
      height: var(--checkbox-size);
      margin: 0;
      margin-inline: calc(var(--checkbox-size) * -1.5) 0.6em;
      padding: 0;
      border: 1px solid var(--checkbox-border-color);
      border-radius: var(--checkbox-radius);
      &:checked {
        border-color: var(--checkbox-color);
        background: var(--checkbox-color);
      }
      /* Obsidian's check mark. */
      &:checked::after {
        content: '';
        position: absolute;
        inset: -1px;
        background: var(--checkbox-marker-color);
        mask: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path transform='translate(-4 -6)' d='M8.1043257,14.0367999 L4.52468714,10.5420499 C4.32525014,10.3497722 4.32525014,10.0368095 4.52468714,9.8424863 L5.24777413,9.1439454 C5.44721114,8.95166768 5.77142411,8.95166768 5.97086112,9.1439454 L8.46638057,11.5903727 L14.0291389,6.1442083 C14.2285759,5.95193057 14.5527889,5.95193057 14.7522259,6.1442083 L15.4753129,6.84377194 C15.6747499,7.03604967 15.6747499,7.35003511 15.4753129,7.54129009 L8.82741268,14.0367999 C8.62797568,14.2290777 8.3037627,14.2290777 8.1043257,14.0367999'/></svg>")
          52% 52% / 65% no-repeat;
      }
    }

    mark {
      background: var(--highlight-background);
      color: var(--text-normal);
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

    /* Obsidian puts an hr before the footnotes; this border stands in for it. */
    .footnotes {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: var(--hr-thickness) solid var(--hr-color);
      font-size: var(--footnote-size);
    }
    .footnote-backref {
      margin-inline-start: 4px;
      color: var(--text-faint);
      text-decoration: none;
      &:hover {
        color: var(--text-accent);
        text-decoration: none;
      }
    }

    .callout {
      --callout-color: var(--callout-default);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/><path d='m15 5 4 4'/></svg>");
      overflow: hidden;
      margin: 1em 0;
      padding: var(--callout-padding);
      border: var(--callout-border-width) solid
        color-mix(in oklch, var(--callout-color) calc(var(--callout-border-opacity) * 100%), transparent);
      border-radius: var(--callout-radius);
      background: color-mix(in oklch, var(--callout-color) 10%, transparent);
      mix-blend-mode: var(--callout-blend-mode);
    }
    .callout-content .callout {
      margin-top: 20px;
    }
    .callout-title {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      padding: var(--callout-title-padding);
      color: var(--callout-color);
      font-size: var(--callout-title-size, inherit);
      line-height: var(--line-height-tight);
    }
    /* Obsidian's 16px Lucide icons, drawn as masks so they take the callout color. */
    .callout-title::before, .callout-fold::after {
      content: '';
      flex: none;
      width: 16px;
      height: calc(1em * var(--line-height-tight));
      background: currentColor;
      mask: var(--callout-icon) center / 16px no-repeat;
    }
    .callout-title-inner {
      color: var(--callout-title-color, inherit);
      font-weight: var(--callout-title-weight);
    }
    .callout-content {
      overflow-x: auto;
      padding: var(--callout-content-padding);
      background: var(--callout-content-background);
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
    .callout-fold {
      display: flex;
      padding-inline-end: 8px;
      &::after {
        mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>");
        transition: transform 100ms ease-in-out;
      }
    }
    .callout:not([open]) > .callout-title .callout-fold::after {
      transform: rotate(-90deg);
    }

    [data-callout='info'] {
      --callout-color: var(--callout-info);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 16v-4'/><path d='M12 8h.01'/></svg>");
    }
    [data-callout='todo'] {
      --callout-color: var(--callout-todo);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='m9 12 2 2 4-4'/></svg>");
    }
    :is([data-callout='abstract'], [data-callout='summary'], [data-callout='tldr']) {
      --callout-color: var(--callout-summary);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='8' y='2' width='8' height='4' rx='1' ry='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/><path d='M12 11h4'/><path d='M12 16h4'/><path d='M8 11h.01'/><path d='M8 16h.01'/></svg>");
    }
    [data-callout='important'] {
      --callout-color: var(--callout-important);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4'/></svg>");
    }
    :is([data-callout='tip'], [data-callout='hint']) {
      --callout-color: var(--callout-tip);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4'/></svg>");
    }
    :is([data-callout='success'], [data-callout='check'], [data-callout='done']) {
      --callout-color: var(--callout-success);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 6 9 17l-5-5'/></svg>");
    }
    :is([data-callout='question'], [data-callout='help'], [data-callout='faq']) {
      --callout-color: var(--callout-question);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'/><path d='M12 17h.01'/></svg>");
    }
    :is([data-callout='warning'], [data-callout='caution'], [data-callout='attention']) {
      --callout-color: var(--callout-warning);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/><path d='M12 9v4'/><path d='M12 17h.01'/></svg>");
    }
    :is([data-callout='failure'], [data-callout='fail'], [data-callout='missing']) {
      --callout-color: var(--callout-fail);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18'/><path d='m6 6 12 12'/></svg>");
    }
    :is([data-callout='danger'], [data-callout='error']) {
      --callout-color: var(--callout-error);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'/></svg>");
    }
    [data-callout='bug'] {
      --callout-color: var(--callout-bug);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 20v-9'/><path d='M14 7a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4z'/><path d='M14.12 3.88 16 2'/><path d='M21 21a4 4 0 0 0-3.81-4'/><path d='M21 5a4 4 0 0 1-3.55 3.97'/><path d='M22 13h-4'/><path d='M3 21a4 4 0 0 1 3.81-4'/><path d='M3 5a4 4 0 0 0 3.55 3.97'/><path d='M6 13H2'/><path d='m8 2 1.88 1.88'/><path d='M9 7.13V6a3 3 0 1 1 6 0v1.13'/></svg>");
    }
    [data-callout='example'] {
      --callout-color: var(--callout-example);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 5h.01'/><path d='M3 12h.01'/><path d='M3 19h.01'/><path d='M8 5h13'/><path d='M8 12h13'/><path d='M8 19h13'/></svg>");
    }
    :is([data-callout='quote'], [data-callout='cite']) {
      --callout-color: var(--callout-quote);
      --callout-icon: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z'/><path d='M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z'/></svg>");
    }
  }
`;
