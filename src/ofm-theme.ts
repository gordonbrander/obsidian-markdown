import { css } from 'lit';

/**
 * An optional look for `<ofm-note>`, `<ofm-markdown>` and `<ofm-frontmatter>`: Obsidian's default theme, with its
 * variable names, values, class names and selectors, so CSS snippets written for Obsidian apply here too.
 */
export const obsidianTheme = css`
  /*
   * In a layer, so any rule outside one wins, whatever its specificity or order. Obsidian loads snippets after its
   * own CSS, where an adopted stylesheet like this one comes after the page's. The layer gives snippets the last word again.
   */
  @layer ofm-theme {
  /* Obsidian 1.15's variables, copied with their expressions and declared on body as Obsidian does, so a snippet
     written for Obsidian (body { --h1-size: 2em }) applies unchanged. Zero specificity, so such a rule wins whatever the order. */
  :where(body) {
    --direction: 1;

    /* Base colors. Light and dark are Obsidian's .theme-light and .theme-dark values. */
    --accent-h: 258;
    --accent-s: 88%;
    --accent-l: 66%;
    --mono-0: light-dark(white, black);
    --mono-100: light-dark(black, white);
    --color-red: light-dark(#e93147, #fb464c);
    --color-orange: light-dark(#ec7500, #e9973f);
    --color-yellow: light-dark(#e0ac00, #e0de71);
    --color-green: light-dark(#08b94e, #44cf6e);
    --color-cyan: light-dark(#00bfbc, #53dfdd);
    --color-blue: light-dark(#086ddd, #027aff);
    --color-purple: light-dark(#7852ee, #a882ff);
    --color-pink: light-dark(#d53984, #fa99cd);
    --color-base-00: light-dark(#ffffff, #1C1C1C);
    --color-base-05: light-dark(#fcfcfc, #212121);
    --color-base-10: light-dark(#fafafa, #232323);
    --color-base-20: light-dark(#f6f6f6, #282828);
    --color-base-25: light-dark(#efefef, #2e2e2e);
    --color-base-30: light-dark(#e4e4e4, #333333);
    --color-base-35: light-dark(#dadada, #3f3f3f);
    --color-base-40: light-dark(#bdbdbd, #555555);
    --color-base-50: light-dark(#ababab, #666666);
    --color-base-60: light-dark(#707070, #999999);
    --color-base-70: light-dark(#5c5c5c, #b3b3b3);
    --color-base-100: light-dark(#222222, #dadada);
    --color-accent: hsl(var(--accent-h), var(--accent-s), var(--accent-l));
    --color-accent-1: light-dark(hsl(calc(var(--accent-h) - 1), calc(var(--accent-s) * 1.01), calc(var(--accent-l) * 1.075)), hsl(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15)));
    --color-accent-2: light-dark(hsl(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15)), hsl(calc(var(--accent-h) - 5), calc(var(--accent-s) * 1.05), calc(var(--accent-l) * 1.29)));
    --color-accent-hsl: var(--accent-h), var(--accent-s), var(--accent-l);

    /* Semantic colors */
    --background-primary: var(--color-base-00);
    --background-primary-alt: var(--color-base-10);
    --background-secondary: var(--color-base-20);
    --background-modifier-hover: color-mix(in oklch, var(--mono-100) 6.7%, transparent);
    --background-modifier-active-hover: color-mix(in oklch, var(--interactive-accent) 10%, transparent);
    --background-modifier-border: var(--color-base-30);
    --background-modifier-border-hover: var(--color-base-35);
    --background-modifier-border-focus: var(--color-base-40);
    --background-modifier-error: var(--color-red);
    --background-modifier-warning: var(--color-orange);
    --background-modifier-error-hover: var(--color-red);
    --background-modifier-warning-hover: var(--color-orange);
    --background-modifier-success: var(--color-green);
    --background-modifier-form-field: light-dark(var(--color-base-00), var(--color-base-25));
    --background-modifier-form-field-hover: var(--background-modifier-form-field);
    --text-normal: var(--color-base-100);
    --text-muted: var(--color-base-70);
    --text-faint: var(--color-base-50);
    --text-on-accent: white;
    --text-on-accent-inverted: black;
    --text-error: var(--color-red);
    --text-warning: var(--color-orange);
    --text-success: var(--color-green);
    --text-selection: light-dark(color-mix(in oklch, var(--interactive-accent) 20%, transparent), color-mix(in oklch, var(--interactive-accent) 33%, transparent));
    --text-accent: light-dark(var(--color-accent), var(--color-accent-1));
    --text-accent-hover: var(--color-accent-2);
    --interactive-normal: light-dark(var(--color-base-00), var(--color-base-30));
    --interactive-hover: light-dark(var(--color-base-10), var(--color-base-35));
    --interactive-accent: light-dark(var(--color-accent-1), var(--color-accent));
    --interactive-accent-hover: light-dark(var(--color-accent-2), var(--color-accent-1));
    --interactive-accent-hsl: var(--color-accent-hsl);
    --background-modifier-error-rgb: var(--color-red-rgb);
    --background-modifier-success-rgb: var(--color-green-rgb);
    --background-secondary-alt: light-dark(var(--color-base-05), var(--color-base-30));

    /* Highlights */
    --highlight-opacity: 30%;
    --highlight-background: var(--text-highlight-bg, var(--highlight-background-yellow));
    --highlight-background-red: color-mix(in oklch, var(--color-red) var(--highlight-opacity), transparent);
    --highlight-background-orange: color-mix(in oklch, var(--color-orange) var(--highlight-opacity), transparent);
    --highlight-background-yellow: color-mix(in oklch, var(--color-yellow) var(--highlight-opacity), transparent);
    --highlight-background-green: color-mix(in oklch, var(--color-green) var(--highlight-opacity), transparent);
    --highlight-background-blue: color-mix(in oklch, var(--color-blue) var(--highlight-opacity), transparent);
    --highlight-background-purple: color-mix(in oklch, var(--color-purple) var(--highlight-opacity), transparent);

    /* Sizes */
    --anim-duration-none: 0;
    --anim-duration-superfast: 70ms;
    --anim-duration-fast: .14s;
    --anim-duration-moderate: .3s;
    --anim-duration-slow: .56s;
    --anim-motion-smooth: cubic-bezier(.45, .05, .55, .95);
    --anim-motion-delay: cubic-bezier(.65, .05, .36, 1);
    --anim-motion-jumpy: cubic-bezier(.68, -.55, .27, 1.55);
    --anim-motion-swing: cubic-bezier(0, .55, .45, 1);
    --anim-motion-spring: cubic-bezier(.36, .7, 0, 1);
    --border-width: 1px;
    --cursor: default;
    --cursor-link: pointer;
    --icon-size: var(--icon-m);
    --icon-stroke: var(--icon-m-stroke-width);
    --icon-xs: 14px;
    --icon-s: 16px;
    --icon-m: 16px;
    --icon-l: 18px;
    --icon-xl: 32px;
    --icon-xs-stroke-width: 2px;
    --icon-s-stroke-width: 2px;
    --icon-m-stroke-width: 2px;
    --icon-l-stroke-width: 1.75px;
    --icon-xl-stroke-width: 1.25px;
    --icon-color: var(--text-muted);
    --icon-color-hover: var(--text-muted);
    --icon-color-active: var(--text-accent);
    --icon-color-focused: var(--text-normal);
    --icon-opacity: .85;
    --icon-opacity-hover: 1;
    --icon-opacity-active: 1;
    --clickable-icon-radius: var(--radius-s);
    --indent-size: 4;
    --indent-unit: .5625em;
    --corner-shape: round;
    --radius-s: 4px;
    --radius-m: 8px;
    --radius-l: 12px;
    --radius-xl: 24px;
    --size-2-1: 2px;
    --size-2-2: 4px;
    --size-2-3: 6px;
    --size-4-1: 4px;
    --size-4-2: 8px;
    --size-4-3: 12px;
    --size-4-4: 16px;
    --size-4-5: 20px;
    --size-4-6: 24px;
    --size-4-8: 32px;
    --size-4-9: 36px;
    --size-4-10: 40px;
    --size-4-12: 48px;
    --size-4-16: 64px;
    --size-4-18: 72px;

    /* Fonts */
    --font-smallest: .8em;
    --font-smaller: .875em;
    --font-small: .933em;
    --font-ui-smaller: 12px;
    --font-ui-small: 13px;
    --font-ui-medium: 15px;
    --font-ui-large: 20px;
    --line-height-normal: 1.5;
    --line-height-tight: 1.3;
    --font-default: ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Google Sans Flex", Roboto, "Inter Variable", "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
    --font-monospace-default: ui-monospace, SFMono-Regular, "Cascadia Mono", "Roboto Mono", "DejaVu Sans Mono", "Liberation Mono", Menlo, Monaco, "Consolas", "Source Code Pro", monospace;
    --font-interface-override: "??";
    --font-interface-theme: "??";
    --font-interface: var(--font-interface-override), var(--font-interface-theme), var(--default-font, "??"), var(--font-default);
    --font-text-override: "??";
    --font-text-theme: "??";
    --font-text: var(--font-text-override), var(--font-text-theme), var(--font-default);
    --font-monospace-override: "??";
    --font-monospace-theme: "??";
    --font-monospace: var(--font-monospace-override), var(--font-monospace-theme), var(--font-monospace-default);
    --font-text-size: 16px;
    --font-preferred-size: var(--font-text-size);
    --font-mermaid: var(--font-text);

    /* Weights */
    --bold-modifier: 200;
    --bold-color: inherit;
    --bold-weight: calc(var(--font-weight) + var(--bold-modifier));
    --font-weight: var(--font-normal);
    --font-thin: 100;
    --font-extralight: 200;
    --font-light: 300;
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
    --font-extrabold: 800;
    --font-black: 900;
    --italic-color: inherit;
    --italic-weight: inherit;

    /* Paragraphs and headings */
    --heading-spacing: calc(var(--p-spacing) * 2.5);
    --h1-color: inherit;
    --h2-color: inherit;
    --h3-color: inherit;
    --h4-color: inherit;
    --h5-color: inherit;
    --h6-color: inherit;
    --h1-font: inherit;
    --h2-font: inherit;
    --h3-font: inherit;
    --h4-font: inherit;
    --h5-font: inherit;
    --h6-font: inherit;
    --h1-letter-spacing: -.015em;
    --h2-letter-spacing: -.011em;
    --h3-letter-spacing: -.008em;
    --h4-letter-spacing: -.005em;
    --h5-letter-spacing: -.002em;
    --h6-letter-spacing: 0em;
    --h1-line-height: 1.2;
    --h2-line-height: 1.2;
    --h3-line-height: 1.3;
    --h4-line-height: 1.4;
    --h5-line-height: var(--line-height-normal);
    --h6-line-height: var(--line-height-normal);
    --h1-size: 1.618em;
    --h2-size: 1.462em;
    --h3-size: 1.318em;
    --h4-size: 1.188em;
    --h5-size: 1.076em;
    --h6-size: 1em;
    --h1-style: normal;
    --h2-style: normal;
    --h3-style: normal;
    --h4-style: normal;
    --h5-style: normal;
    --h6-style: normal;
    --h1-variant: normal;
    --h2-variant: normal;
    --h3-variant: normal;
    --h4-variant: normal;
    --h5-variant: normal;
    --h6-variant: normal;
    --p-spacing: 1rem;
    --p-spacing-empty: 0rem;

    /* Links */
    --link-color: var(--text-accent);
    --link-color-hover: var(--text-accent-hover);
    --link-decoration: underline;
    --link-decoration-hover: underline;
    --link-decoration-thickness: auto;
    --link-weight: var(--font-weight);
    --link-external-color: var(--text-accent);
    --link-external-color-hover: var(--text-accent-hover);
    --link-external-decoration: underline;
    --link-external-decoration-hover: underline;
    --link-external-filter: none;
    --link-unresolved-color: var(--text-accent);
    --link-unresolved-opacity: .7;
    --link-unresolved-filter: none;
    --link-unresolved-decoration-style: solid;
    --link-unresolved-decoration-color: color-mix(in oklch, var(--interactive-accent) 30%, transparent);

    /* Tags */
    --tag-size: var(--font-smaller);
    --tag-color: var(--text-accent);
    --tag-color-hover: var(--text-accent);
    --tag-decoration: none;
    --tag-decoration-hover: none;
    --tag-background: color-mix(in oklch, var(--interactive-accent) 10%, transparent);
    --tag-background-hover: color-mix(in oklch, var(--interactive-accent) 20%, transparent);
    --tag-border-color: color-mix(in oklch, var(--interactive-accent) 15%, transparent);
    --tag-border-color-hover: color-mix(in oklch, var(--interactive-accent) 15%, transparent);
    --tag-border-width: 0px;
    --tag-padding-x: .65em;
    --tag-padding-y: .25em;
    --tag-radius: 2em;
    --tag-corner-shape: round;
    --tag-weight: inherit;

    /* Pills */
    --pill-color: var(--text-muted);
    --pill-color-hover: var(--text-normal);
    --pill-color-remove: var(--text-faint);
    --pill-color-remove-hover: var(--text-accent);
    --pill-decoration: none;
    --pill-decoration-hover: none;
    --pill-background: transparent;
    --pill-background-hover: transparent;
    --pill-border-color: var(--background-modifier-border);
    --pill-border-color-hover: var(--background-modifier-border-hover);
    --pill-border-width: var(--border-width);
    --pill-padding-x: .65em;
    --pill-padding-y: .25em;
    --pill-radius: 2em;
    --pill-weight: inherit;
    --pill-focus-width: calc(100% + 6px);
    --pill-focus-left-adjust: -4px;

    /* Callouts */
    --callout-border-width: 0px;
    --callout-border-opacity: .25;
    --callout-padding: var(--size-4-3) var(--size-4-3) var(--size-4-3) var(--size-4-6);
    --callout-radius: var(--radius-s);
    --callout-blend-mode: var(--highlight-mix-blend-mode);
    --callout-title-color: inherit;
    --callout-title-padding: 0;
    --callout-title-size: inherit;
    --callout-title-weight: calc(var(--font-weight) + var(--bold-modifier));
    --callout-content-padding: 0;
    --callout-content-background: transparent;
    --callout-bug: var(--color-red);
    --callout-default: var(--color-blue);
    --callout-error: var(--color-red);
    --callout-example: var(--color-purple);
    --callout-fail: var(--color-red);
    --callout-important: var(--color-cyan);
    --callout-info: var(--color-blue);
    --callout-question: var(--color-orange);
    --callout-success: var(--color-green);
    --callout-summary: var(--color-cyan);
    --callout-tip: var(--color-cyan);
    --callout-todo: var(--color-blue);
    --callout-warning: var(--color-orange);
    --callout-quote: #9e9e9e;

    /* Blockquotes */
    --blockquote-border-thickness: 2px;
    --blockquote-border-color: var(--interactive-accent);
    --blockquote-font-style: normal;
    --blockquote-color: inherit;
    --blockquote-background-color: transparent;

    /* Code */
    --code-white-space: pre-wrap;
    --code-border-width: 0px;
    --code-border-color: var(--background-modifier-border);
    --code-radius: var(--radius-s);
    --code-size: var(--font-smaller);
    --code-background: var(--background-primary-alt);
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

    /* Horizontal rules */
    --hr-color: var(--background-modifier-border);
    --hr-thickness: 2px;

    /* Tables */
    --table-background: transparent;
    --table-border-width: 1px;
    --table-border-color: var(--background-modifier-border);
    --table-white-space: break-spaces;
    --table-header-background: var(--table-background);
    --table-header-background-hover: inherit;
    --table-header-border-width: var(--table-border-width);
    --table-header-border-color: var(--table-border-color);
    --table-header-font: inherit;
    --table-header-size: var(--table-text-size);
    --table-header-weight: calc(var(--font-weight) + var(--bold-modifier));
    --table-header-color: var(--text-normal);
    --table-line-height: var(--line-height-tight);
    --table-text-size: var(--font-preferred-size);
    --table-text-color: inherit;
    --table-column-min-width: 6ch;
    --table-column-max-width: none;
    --table-column-alt-background: var(--table-background);
    --table-column-first-border-width: var(--table-border-width);
    --table-column-last-border-width: var(--table-border-width);
    --table-row-background-hover: var(--table-background);
    --table-row-alt-background: var(--table-background);
    --table-row-alt-background-hover: var(--table-background);
    --table-row-last-border-width: var(--table-border-width);
    --table-cell-vertical-alignment: top;

    /* Lists and checkboxes */
    --checkbox-radius: var(--radius-s);
    --checkbox-size: var(--font-preferred-size);
    --checkbox-marker-color: var(--background-primary);
    --checkbox-color: var(--interactive-accent);
    --checkbox-color-hover: var(--interactive-accent-hover);
    --checkbox-border-color: var(--text-faint);
    --checkbox-border-color-hover: var(--text-muted);
    --checkbox-margin-inline-start: .85em;
    --checklist-done-decoration: line-through;
    --checklist-done-color: var(--text-muted);
    --list-indent: calc(var(--indent-unit) * var(--indent-size));
    --list-spacing: .075em;
    --list-marker-color: var(--text-faint);
    --list-marker-color-hover: var(--text-muted);
    --list-marker-color-collapsed: var(--text-accent);
    --list-bullet-border: none;
    --list-bullet-radius: 50%;
    --list-bullet-size: .3em;
    --list-bullet-transform: none;
    --list-numbered-style: decimal;
    --list-bullet-end-padding: 1.3rem;

    /* Footnotes */
    --footnote-divider-color-active: var(--metadata-divider-color-focus);
    --footnote-divider-color: var(--metadata-divider-color);
    --footnote-divider-width: var(--border-width);
    --footnote-gap: var(--size-4-1);
    --footnote-id-color-no-occurrences: var(--text-faint);
    --footnote-id-color: var(--text-muted);
    --footnote-id-delimiter: ".";
    --footnote-input-background-active: var(--metadata-input-background-active);
    --footnote-input-background: var(--metadata-input-background);
    --footnote-line-height: var(--line-height-normal);
    --footnote-padding-block: var(--size-2-3);
    --footnote-padding-inline: var(--size-2-3);
    --footnote-radius: var(--radius-s);
    --footnote-size: var(--font-smaller);

    /* Embeds and images */
    --embed-max-height: 4000px;
    --embed-background: inherit;
    --embed-border-start: 2px solid var(--interactive-accent);
    --embed-border-end: none;
    --embed-border-top: none;
    --embed-border-bottom: none;
    --embed-padding: 0 0 0 var(--size-4-6);
    --embed-font-style: inherit;
    --embed-block-shadow-hover: 0 0 0 1px var(--background-modifier-border), inset 0 0 0 1px var(--background-modifier-border);
    --image-radius: 4px;

    /* Diagrams */
    --mermaid-background: var(--background-primary);
    --mermaid-text-color: var(--text-normal);
    --mermaid-muted-color: var(--text-muted);
    --mermaid-line-color: var(--text-normal);
    --mermaid-surface: var(--background-secondary);
    --mermaid-surface-alt: var(--background-primary-alt);
    --mermaid-border-color: var(--background-modifier-border-hover);
    --mermaid-accent: var(--interactive-accent);
    --mermaid-critical: var(--color-red);
    --mermaid-error: var(--text-error);
    --mermaid-radius: var(--radius-s);
    --mermaid-title-weight: var(--font-semibold);
    --mermaid-heading-weight: var(--font-semibold);
    --mermaid-bold-weight: var(--bold-weight);
    --mermaid-color-1: var(--color-blue);
    --mermaid-color-2: var(--color-orange);
    --mermaid-color-3: var(--color-green);
    --mermaid-color-4: var(--color-red);
    --mermaid-color-5: var(--color-cyan);
    --mermaid-color-6: var(--color-yellow);
    --mermaid-color-7: var(--color-purple);
    --mermaid-color-8: var(--color-pink);

    /* Properties */
    --collapse-icon-color: var(--text-faint);
    --collapse-icon-color-collapsed: var(--text-accent);
    --input-height: 30px;
    --input-padding: var(--size-4-1) var(--size-4-2);
    --input-radius: 5px;
    --input-corner-shape: var(--corner-shape);
    --input-font-weight: var(--font-normal);
    --input-border-width: var(--border-width);
    --input-border-width-focus: 2px;
    --input-placeholder-color: var(--text-faint);
    --input-date-separator: var(--text-faint);
    --input-transition: none;
    --nav-collapse-icon-color: var(--collapse-icon-color);
    --nav-collapse-icon-color-collapsed: var(--text-faint);
    --metadata-background: transparent;
    --metadata-display-reading: block;
    --metadata-display-editing: block;
    --metadata-max-width: none;
    --metadata-padding: var(--size-4-2) 0;
    --metadata-border-color: var(--background-modifier-border);
    --metadata-border-radius: 0;
    --metadata-border-width: 0;
    --metadata-divider-color-hover: transparent;
    --metadata-divider-color-focus: transparent;
    --metadata-divider-width: 0;
    --metadata-gap: 3px;
    --metadata-property-padding: 0;
    --metadata-property-radius: 6px;
    --metadata-property-radius-hover: 6px;
    --metadata-property-radius-focus: 6px;
    --metadata-property-corner-shape: var(--corner-shape);
    --metadata-property-corner-shape-hover: var(--corner-shape);
    --metadata-property-corner-shape-focus: var(--corner-shape);
    --metadata-property-background: transparent;
    --metadata-property-background-hover: transparent;
    --metadata-property-background-active: var(--background-modifier-hover);
    --metadata-property-box-shadow-hover: 0 0 0 var(--border-width) var(--background-modifier-border-hover);
    --metadata-property-box-shadow-focus: 0 0 0 2px var(--background-modifier-border-focus);
    --metadata-label-background: transparent;
    --metadata-label-background-hover: transparent;
    --metadata-label-background-active: var(--background-modifier-hover);
    --metadata-label-font: var(--font-interface);
    --metadata-label-font-size: var(--font-smaller);
    --metadata-label-font-weight: inherit;
    --metadata-label-text-color: var(--text-muted);
    --metadata-label-text-color-hover: var(--text-muted);
    --metadata-label-width: 9em;
    --metadata-input-height: calc(var(--font-preferred-size) * 1.75);
    --metadata-input-text-color: var(--text-normal);
    --metadata-input-font: var(--font-interface);
    --metadata-input-font-size: var(--font-smaller);
    --metadata-input-background: transparent;
    --metadata-input-background-hover: transparent;
    --metadata-input-background-active: var(--background-modifier-hover);
    --metadata-input-longtext-lines: 3;
    --metadata-input-padding: var(--size-4-1) var(--size-4-2);

    /* Without variable fonts; the @supports block below has the usual values. */
    --h1-weight: 700;
    --h2-weight: 600;
    --h3-weight: 600;
    --h4-weight: 600;
    --h5-weight: 600;
    --h6-weight: 600;

    /* Not colors, so they can't go through light-dark(). They follow the OS, or a .theme-light / .theme-dark class. */
    --highlight-mix-blend-mode: darken;
    --mono-rgb-0: 255, 255, 255;
    --mono-rgb-100: 0, 0, 0;
    --color-red-rgb: 233, 49, 71;
    --color-orange-rgb: 236, 117, 0;
    --color-yellow-rgb: 224, 172, 0;
    --color-green-rgb: 8, 185, 78;
    --color-cyan-rgb: 0, 191, 188;
    --color-blue-rgb: 8, 109, 221;
    --color-purple-rgb: 120, 82, 238;
    --color-pink-rgb: 213, 57, 132;
  }
  :where([dir='rtl']) {
    --direction: -1;
  }
  @supports (font-variation-settings: normal) {
    :where(body) {
      --h1-weight: 700;
      --h2-weight: 680;
      --h3-weight: 660;
      --h4-weight: 640;
      --h5-weight: 620;
      --h6-weight: 600;
    }
  }
  @media (prefers-color-scheme: dark) {
    :where(body) {
      --highlight-mix-blend-mode: lighten;
      --mono-rgb-0: 0, 0, 0;
      --mono-rgb-100: 255, 255, 255;
      --color-red-rgb: 251, 70, 76;
      --color-orange-rgb: 233, 151, 63;
      --color-yellow-rgb: 224, 222, 113;
      --color-green-rgb: 68, 207, 110;
      --color-cyan-rgb: 83, 223, 221;
      --color-blue-rgb: 2, 122, 255;
      --color-purple-rgb: 168, 130, 255;
      --color-pink-rgb: 250, 153, 205;
    }
  }
  :where(.theme-light) {
    --highlight-mix-blend-mode: darken;
    --mono-rgb-0: 255, 255, 255;
    --mono-rgb-100: 0, 0, 0;
    --color-red-rgb: 233, 49, 71;
    --color-orange-rgb: 236, 117, 0;
    --color-yellow-rgb: 224, 172, 0;
    --color-green-rgb: 8, 185, 78;
    --color-cyan-rgb: 0, 191, 188;
    --color-blue-rgb: 8, 109, 221;
    --color-purple-rgb: 120, 82, 238;
    --color-pink-rgb: 213, 57, 132;
  }
  :where(.theme-dark) {
    --highlight-mix-blend-mode: lighten;
    --mono-rgb-0: 0, 0, 0;
    --mono-rgb-100: 255, 255, 255;
    --color-red-rgb: 251, 70, 76;
    --color-orange-rgb: 233, 151, 63;
    --color-yellow-rgb: 224, 222, 113;
    --color-green-rgb: 68, 207, 110;
    --color-cyan-rgb: 83, 223, 221;
    --color-blue-rgb: 2, 122, 255;
    --color-purple-rgb: 168, 130, 255;
    --color-pink-rgb: 250, 153, 205;
  }
  /* Obsidian's theme classes force a scheme, which light-dark() then follows. */
  .theme-light :is(ofm-note, ofm-markdown, ofm-frontmatter) {
    color-scheme: light;
  }
  .theme-dark :is(ofm-note, ofm-markdown, ofm-frontmatter) {
    color-scheme: dark;
  }

  ofm-note, ofm-markdown, ofm-frontmatter {
    display: block;
    color-scheme: light dark;
  }
  /* Temml resets on body; per note here, so each note numbers its equations from (1). */
  ofm-markdown {
    counter-reset: tmlEqnNo;
  }

  /*
   * Properties. These rules are Obsidian's, with its selectors: <ofm-note> renders Obsidian's .metadata-container,
   * <ofm-frontmatter> is its .metadata-properties and each <ofm-proprow> a .metadata-property.
   */

  /* Not Obsidian's: these stand in for the view Obsidian's properties sit in, which gives them their font. */
  ofm-note, :where(ofm-frontmatter) {
    font-family: var(--font-text);
    font-size: var(--font-preferred-size);
    line-height: var(--line-height-normal);
    color: var(--text-normal);
  }
  /* Not Obsidian's: a property list used on its own gets what .metadata-container would give it. */
  :where(ofm-frontmatter):not(.metadata-container *) {
    --input-height: var(--metadata-input-height);
    color: var(--text-muted);
  }
  /* Not Obsidian's: a foldable <details>, where Obsidian folds a div with script. */
  summary.metadata-properties-heading {
    list-style: none;
    cursor: var(--cursor);
  }
  summary.metadata-properties-heading::-webkit-details-marker {
    display: none;
  }
  .metadata-properties-heading .collapse-indicator {
    display: inline-flex;
    cursor: var(--cursor);
    user-select: none;
  }

  /* Obsidian applies these to every element and form field of the app. */
  :where(.metadata-container, .metadata-properties) {
    &, & *, & ::before, & ::after {
      box-sizing: border-box;
    }
    :focus {
      outline: none;
    }
    svg.svg-icon {
      height: var(--icon-size);
      width: var(--icon-size);
      stroke-width: var(--icon-stroke);
    }
    .multi-select-container, input.metadata-input-text, input[type=date], input[type=datetime-local], input[type=text],
    input[type=number] {
      background: var(--background-modifier-form-field);
      border: var(--input-border-width) solid var(--background-modifier-border);
      color: var(--text-normal);
      font-family: inherit;
      padding: var(--input-padding);
      font-size: var(--font-ui-small);
      border-radius: var(--input-radius);
      corner-shape: var(--input-corner-shape);
      transition: var(--input-transition);
      outline: none;
    }
    @media (hover: hover) {
      :is(.multi-select-container, input.metadata-input-text, input[type=date], input[type=datetime-local],
      input[type=text], input[type=number]):where(:not(:disabled)):hover {
        background-color: var(--background-modifier-form-field-hover);
        border-color: var(--background-modifier-border-hover);
        transition: box-shadow var(--anim-duration-fast) ease-in-out, border var(--anim-duration-fast) ease-in-out;
      }
    }
    :is(.multi-select-container, input.metadata-input-text, input[type=date], input[type=datetime-local],
    input[type=text], input[type=number]):is(:active, :focus) {
      box-shadow: 0 0 0 var(--input-border-width-focus) var(--background-modifier-border-focus);
    }
    input::placeholder {
      color: var(--input-placeholder-color);
    }
    input[type=text], input[type=number] {
      height: var(--input-height);
    }
    input[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    input[type=date], input[type=datetime-local] {
      font-variant-numeric: tabular-nums;
      position: relative;
    }
    input[type=date]::-webkit-datetime-edit-text, input[type=datetime-local]::-webkit-datetime-edit-text {
      color: var(--input-date-separator);
      padding-inline-end: 0;
    }
    input, .metadata-input-longtext, .multi-select-pill-content {
      unicode-bidi: plaintext;
    }
  }

  .collapse-icon {
    display: flex;
    align-items: center;
  }
  .collapse-icon:before {
    content: "\\200b";
  }
  .collapse-icon svg.svg-icon {
    color: var(--nav-collapse-icon-color);
    stroke-width: 4px;
    width: 10px;
    height: 10px;
    transition: transform .1s ease-in-out;
  }
  .collapse-icon.is-collapsed svg.svg-icon {
    transform: rotate(calc(var(--direction) * -1 * 90deg));
  }
  .multi-select-container {
    cursor: text;
    display: inline-flex;
    vertical-align: top;
    flex-wrap: wrap;
    flex: 1 1 auto;
    gap: var(--size-2-3);
    min-height: var(--input-height);
  }
  .multi-select-pill {
    --icon-size: var(--icon-xs);
    --icon-stroke: var(--icon-xs-stroke-width);
    display: flex;
    align-items: center;
    background-color: var(--pill-background);
    border: var(--pill-border-width) solid var(--pill-border-color);
    border-radius: var(--pill-radius);
    color: var(--pill-color);
    cursor: var(--cursor);
    font-weight: var(--pill-weight);
    padding: var(--pill-padding-y) 0;
    line-height: 1;
    max-width: calc(100% - var(--size-2-3) - 1ch);
    gap: var(--size-2-1);
    position: relative;
  }
  .multi-select-pill:focus:after {
    content: "";
    display: block;
    position: absolute;
    pointer-events: none;
    border-radius: var(--pill-radius);
    inset-inline-end: var(--pill-focus-left-adjust);
    width: var(--pill-focus-width);
    height: 100%;
    box-shadow: 0 0 0 1px var(--background-modifier-border-focus),inset 0 0 0 1px var(--background-modifier-border-focus);
  }
  @media (hover: hover) {
    .multi-select-pill:hover {
      background-color: var(--pill-background-hover);
      border: var(--pill-border-width) solid var(--pill-border-color-hover);
      color: var(--pill-color-hover);
      text-decoration: var(--pill-decoration-hover);
    }
  }
  .multi-select-pill-content {
    word-break: break-word;
    margin-inline-start: var(--pill-padding-x);
    overflow: hidden;
  }
  .multi-select-pill-remove-button {
    margin-inline-end: min(var(--size-2-3),var(--pill-padding-x));
    cursor: var(--cursor);
    color: var(--pill-color-remove);
    border-radius: var(--radius-s);
    corner-shape: var(--corner-shape);
    display: flex;
    align-items: center;
    --icon-size: var(--icon-xs);
    --icon-stroke: var(--icon-xs-stroke-width);
  }
  @media (hover: hover) {
    .multi-select-pill-remove-button:hover {
      color: var(--pill-color-remove-hover);
    }
  }
  .multi-select-input {
    cursor: text;
    font-family: var(--font-interface);
    min-width: 1ch;
    max-width: max-content;
    color: var(--text-normal);
    background-color: inherit;
    border: none;
    word-break: break-word;
    --scrollbar-native-width: none;
  }
  .multi-select-input::-webkit-scrollbar {
    display: none;
  }
  .multi-select-input:empty:before {
    content: attr(placeholder,"\\200b");
    color: var(--input-placeholder-color);
    pointer-events: none;
  }
  .metadata-container {
    --input-height: var(--metadata-input-height);
    border-radius: var(--metadata-border-radius);
    background-color: var(--metadata-background);
    border-color: var(--metadata-border-color);
    border-style: solid;
    border-width: var(--metadata-border-width);
    padding: var(--metadata-padding);
    color: var(--text-muted);
    position: relative;
    max-width: var(--metadata-max-width);
    margin-block-end: 2rem;
  }
  .metadata-container.is-collapsed .metadata-property {
    display: none;
  }
  .metadata-properties {
    display: flex;
    flex-direction: column;
    gap: var(--metadata-gap);
  }
  .metadata-properties .metadata-input-longtext {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--metadata-input-longtext-lines);
  }
  .metadata-properties .metadata-input-longtext:not(:empty) {
    display: -webkit-box;
  }
  .metadata-properties .metadata-input-longtext:focus {
    -webkit-line-clamp: unset;
  }
  .metadata-properties-heading {
    display: inline-block;
    padding: var(--size-4-1);
    margin-bottom: var(--size-4-2);
    position: relative;
    line-height: 1.2;
  }
  .metadata-properties-heading:before {
    content: "";
    border-radius: var(--metadata-property-radius);
    corner-shape: var(--metadata-property-corner-shape);
    position: absolute;
    display: inline-block;
    inset: 0;
  }
  .metadata-properties-heading:focus:before {
    box-shadow: 0 0 0 2px var(--background-modifier-border-focus);
  }
  .metadata-properties-heading .collapse-indicator {
    position: absolute;
    inset-inline-start: -22px;
    padding: 0 6px;
  }
  .metadata-properties-title {
    user-select: none;
    font-size: max(var(--font-ui-small),1em);
    color: var(--text-normal);
    font-weight: var(--font-medium);
    font-family: var(--font-interface);
  }
  input[type=checkbox].metadata-input-checkbox {
    margin: var(--input-padding);
  }
  .metadata-input-text {
    background-color: transparent;
    width: 100%;
    min-height: var(--input-height);
    border-width: 0px;
    resize: none;
    overflow-y: hidden;
  }
  .metadata-input-text::-webkit-date-and-time-value {
    text-align: start;
  }
  .metadata-input-text.mod-date {
    padding-inline-end: 0;
    width: auto;
  }
  .metadata-property {
    --input-border-width: 0;
    --input-border-width-focus: 0;
    --input-radius: 0;
    position: relative;
    display: flex;
    align-items: start;
    padding: var(--metadata-property-padding);
    border-radius: var(--metadata-property-radius);
    corner-shape: var(--metadata-property-corner-shape);
    overflow: hidden;
    background-color: var(--metadata-property-background);
    box-shadow: var(--metadata-property-box-shadow);
  }
  @media (hover: hover) {
    .metadata-property:hover {
      --metadata-divider-color: var(--metadata-divider-color-hover);
      background-color: var(--metadata-property-background-hover);
      box-shadow: var(--metadata-property-box-shadow-hover);
      border-radius: var(--metadata-property-radius-hover);
      corner-shape: var(--metadata-property-corner-shape-hover);
    }
  }
  .metadata-property.has-focus, .metadata-property:focus-within {
    --metadata-divider-color: var(--metadata-divider-color-focus);
    background-color: var(--metadata-property-background-hover);
    box-shadow: var(--metadata-property-box-shadow-focus);
    border-radius: var(--metadata-property-radius-focus);
    corner-shape: var(--metadata-property-corner-shape-focus);
  }
  .metadata-property-icon {
    cursor: var(--cursor);
    color: var(--icon-color);
    display: flex;
    align-items: center;
    padding: var(--size-4-1) 0;
    height: var(--input-height);
    -webkit-user-select: none;
  }
  .metadata-property-icon:before {
    content: "\\200b";
    width: var(--size-4-1);
  }
  @media (hover: hover) {
    .metadata-property-icon:hover .svg-icon {
      color: var(--icon-color-focused);
    }
  }
  .metadata-property-icon[aria-disabled=true] {
    color: var(--text-muted);
    opacity: .4;
  }
  .metadata-input-number {
    background-color: transparent;
    width: 100%;
    border-width: 0px;
  }
  .metadata-property-key {
    display: flex;
    align-self: stretch;
    align-items: flex-start;
    flex-direction: row;
    flex-shrink: 0;
    font-family: var(--metadata-label-font);
    border-bottom: var(--metadata-divider-width) solid var(--metadata-divider-color);
    background-color: var(--metadata-label-background);
    width: var(--metadata-label-width);
    min-width: var(--metadata-label-width);
  }
  @media (hover: hover) {
    .metadata-property-key:hover {
      background-color: var(--metadata-label-background-hover);
    }
  }
  .metadata-property-key:focus-within {
    background-color: var(--metadata-label-background-active);
  }
  input.metadata-property-key-input {
    border: none;
    flex-grow: 1;
    color: var(--metadata-label-text-color);
    font-size: var(--metadata-label-font-size);
    font-weight: var(--metadata-label-font-weight);
    padding: var(--metadata-input-padding);
    height: var(--input-height);
    background-color: transparent;
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    text-align: left;
  }
  @media (hover: hover) {
    input.metadata-property-key-input:hover {
      background-color: transparent;
    }
  }
  input.metadata-property-key-input:active, input.metadata-property-key-input:focus {
    background-color: transparent;
  }
  .metadata-property-value {
    --input-padding: var(--metadata-input-padding);
    display: flex;
    flex: 1 1 auto;
    gap: var(--size-2-2);
    align-items: center;
    align-self: stretch;
    overflow: hidden;
    font-family: var(--metadata-input-font);
    min-height: var(--input-height);
    background-color: var(--metadata-input-background);
    border-bottom: var(--metadata-divider-width) solid var(--metadata-divider-color);
  }
  .metadata-property-value .metadata-input-text, .metadata-property-value .metadata-input-number, .metadata-property-value .multi-select-container {
    background-color: transparent;
  }
  @media (hover: hover) {
    .metadata-property-value .metadata-input-text:hover, .metadata-property-value .metadata-input-number:hover, .metadata-property-value .multi-select-container:hover {
      background-color: transparent;
    }
  }
  .metadata-property-value .metadata-input-text:active, .metadata-property-value .metadata-input-number:active, .metadata-property-value .multi-select-container:active, .metadata-property-value .metadata-input-text:focus, .metadata-property-value .metadata-input-number:focus, .metadata-property-value .multi-select-container:focus, .metadata-property-value .metadata-input-text:focus-within, .metadata-property-value .metadata-input-number:focus-within, .metadata-property-value .multi-select-container:focus-within {
    background-color: transparent;
  }
  .metadata-property-value .multi-select-pill {
    --pill-border-width: 0;
    --pill-padding-x: 0;
    --pill-padding-y: 0;
    --pill-color: var(--metadata-input-text-color);
    line-height: var(--line-height-tight);
  }
  .metadata-property-value .metadata-input-text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .metadata-property-value .mod-unknown {
    color: var(--text-warning);
    padding: var(--input-padding);
    font-size: var(--metadata-input-font-size);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .metadata-property-value .multi-select-input {
    font-size: inherit;
  }
  .metadata-property-value .multi-select-container, .metadata-property-value .metadata-link-inner, .metadata-property-value input {
    font-size: var(--metadata-input-font-size);
  }
  .metadata-property-value .multi-select-container {
    --background-modifier-form-field: transparent;
    --background-modifier-border: transparent;
    align-items: center;
    overflow: hidden;
  }
  .metadata-property-value .multi-select-container input {
    background-color: transparent;
  }
  .metadata-property-value .external-link .multi-select-pill-content, .metadata-property-value .internal-link .multi-select-pill-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (hover: hover) {
    .metadata-property-value:hover {
      background-color: var(--metadata-input-background-hover);
    }
  }
  .metadata-property-value:focus-within {
    background-color: var(--metadata-input-background-active);
  }
  .metadata-property-value[data-property-type=tags] .multi-select-pill {
    --pill-color: var(--tag-color);
    --pill-color-hover: var(--tag-color-hover);
    --pill-color-remove: var(--tag-color);
    --pill-color-remove-hover: var(--tag-color-hover);
    --pill-decoration: var(--tag-decoration);
    --pill-decoration-hover: var(--tag-decoration-hover);
    --pill-background: var(--tag-background);
    --pill-background-hover: var(--tag-background-hover);
    --pill-border-color: var(--tag-border-color);
    --pill-border-color-hover: var(--tag-border-color-hover);
    --pill-border-width: var(--tag-border-width);
    --pill-padding-x: var(--tag-padding-x);
    --pill-padding-y: var(--tag-padding-y);
    --pill-radius: var(--tag-radius);
    --pill-corner-shape: var(--tag-corner-shape);
    --pill-weight: var(--tag-weight);
    --pill-focus-width: 100%;
    --pill-focus-left-adjust: 0;
    cursor: var(--cursor-link);
    line-height: 1;
  }
  .metadata-input-longtext {
    flex-grow: 1;
    cursor: text;
    white-space: pre-wrap;
    color: var(--metadata-input-text-color);
    font-size: var(--metadata-input-font-size);
    max-height: 300px;
    padding: var(--input-padding);
  }
  .metadata-input-longtext:focus {
    overflow-y: auto;
  }
  .metadata-input-longtext:empty:before {
    content: attr(placeholder);
    color: var(--input-placeholder-color);
  }
  .metadata-link {
    cursor: text;
    align-items: center;
    padding: var(--input-padding);
    display: flex;
    flex: 1 1 auto;
    gap: var(--size-4-2);
  }
  @media (hover: hover) {
    .metadata-link:hover .metadata-link-flair {
      opacity: var(--icon-opacity);
      transition: .1s opacity .25s ease-in-out;
    }
  }
  .metadata-link-inner {
    cursor: var(--cursor-link);
    color: var(--link-color);
    text-decoration-line: var(--link-decoration);
    text-decoration-thickness: var(--link-decoration-thickness);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  @media (hover: hover) {
    .metadata-link-inner:hover {
      text-decoration-line: var(--link-decoration-hover);
      color: var(--link-color-hover);
    }
  }
  @media (hover: hover) {
    .metadata-link-inner:hover~.metadata-link-flair {
      opacity: 0;
    }
  }
  .metadata-link-flair {
    --icon-size: var(--icon-xs);
    background-color: transparent;
    cursor: text;
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-2-1);
    border-radius: var(--clickable-icon-radius);
    color: var(--icon-color);
    opacity: 0;
    transition: opacity var(--anim-duration-fast) ease-in-out;
    height: auto;
  }
  .metadata-property-value .internal-link {
    cursor: var(--cursor-link);
    text-decoration-line: var(--link-decoration);
    --font-weight: var(--link-weight);
    color: var(--link-color);
    transition: opacity var(--anim-duration-fast) ease-in-out;
  }
  @media (hover: hover) {
    .metadata-property-value .internal-link:hover {
      color: var(--link-color-hover);
      text-decoration-line: var(--link-decoration-hover);
    }
  }
  .metadata-property-value .internal-link.is-unresolved {
    color: var(--link-unresolved-color);
    opacity: var(--link-unresolved-opacity);
    filter: var(--link-unresolved-filter);
    text-decoration-style: var(--link-unresolved-decoration-style);
    text-decoration-color: var(--link-unresolved-decoration-color);
  }
  @media (hover: hover) {
    .metadata-property-value .internal-link.is-unresolved:hover {
      opacity: 1;
      color: var(--link-color-hover);
      text-decoration-color: var(--link-color-hover);
      text-decoration-line: var(--link-decoration-hover);
    }
  }
  .metadata-container {
    container-type: inline-size;
    container-name: metadata;
  }
  @container (width < 250px) {
    .metadata-property {
      flex-wrap: wrap;
    }
  }
  @container (width < 250px) {
    .metadata-property .metadata-property-key {
      width: 100%;
      border-bottom: 0;
    }
  }
  @container (width < 250px) {
    .metadata-property .metadata-property-value {
      margin-top: -2px;
      padding-inline-start: calc(var(--icon-size) + var(--size-4-1));
    }
  }

  /*
   * The rules below are Obsidian's, with its selectors. <ofm-markdown> renders into a
   * div.markdown-preview-view.markdown-rendered, as Obsidian's reading view does.
   * Rules Obsidian scopes to those classes are copied as they are. Rules Obsidian applies to the whole app
   * (a, table, .callout) sit under :where(.markdown-rendered), which keeps Obsidian's specificity without
   * restyling the host page. Either way, a snippet written for Obsidian overrides them as it would there.
   */

  /* Obsidian also sizes and scrolls this as an app pane; only its text styles apply here. */
  .markdown-preview-view {
    font-size: var(--font-preferred-size);
    font-family: var(--font-text);
    line-height: var(--line-height-normal);
    overflow-wrap: break-word;
    color: var(--text-normal);

    img {
      image-rendering: -webkit-optimize-contrast;
      max-width: 100%;
    }
    img:not([width]) {
      outline: none;
    }
    .task-list-item-checkbox {
      position: relative;
      top: .2em;
      margin-inline-end: .6em;
    }
    .mermaid {
      max-width: 100%;
      overflow-x: auto;
    }
    .markdown-embed .markdown-preview-view {
      height: 100%;
      padding: 0;
    }
  }

  .markdown-rendered {
    tab-size: var(--indent-size);

    > :first-child {
      margin-top: 0;
    }
    > :last-child {
      margin-bottom: 0;
    }
    p {
      margin-block-start: var(--p-spacing);
      margin-block-end: var(--p-spacing);
      unicode-bidi: plaintext;
    }

    h1 {
      --font-weight: var(--h1-weight);
      font-variant: var(--h1-variant);
      letter-spacing: var(--h1-letter-spacing);
      line-height: var(--h1-line-height);
      font-size: var(--h1-size);
      color: var(--h1-color);
      font-weight: var(--font-weight);
      font-style: var(--h1-style);
      font-family: var(--h1-font);
    }
    h1 a {
      --link-weight: var(--h1-weight);
    }
    h2 {
      --font-weight: var(--h2-weight);
      font-variant: var(--h2-variant);
      letter-spacing: var(--h2-letter-spacing);
      line-height: var(--h2-line-height);
      font-size: var(--h2-size);
      color: var(--h2-color);
      font-weight: var(--font-weight);
      font-style: var(--h2-style);
      font-family: var(--h2-font);
    }
    h2 a {
      --link-weight: var(--h2-weight);
    }
    h3 {
      --font-weight: var(--h3-weight);
      font-variant: var(--h3-variant);
      letter-spacing: var(--h3-letter-spacing);
      line-height: var(--h3-line-height);
      font-size: var(--h3-size);
      color: var(--h3-color);
      font-weight: var(--font-weight);
      font-style: var(--h3-style);
      font-family: var(--h3-font);
    }
    h3 a {
      --link-weight: var(--h3-weight);
    }
    h4 {
      --font-weight: var(--h4-weight);
      font-variant: var(--h4-variant);
      letter-spacing: var(--h4-letter-spacing);
      line-height: var(--h4-line-height);
      font-size: var(--h4-size);
      color: var(--h4-color);
      font-weight: var(--font-weight);
      font-style: var(--h4-style);
      font-family: var(--h4-font);
    }
    h4 a {
      --link-weight: var(--h4-weight);
    }
    h5 {
      --font-weight: var(--h5-weight);
      font-variant: var(--h5-variant);
      letter-spacing: var(--h5-letter-spacing);
      font-size: var(--h5-size);
      line-height: var(--h5-line-height);
      color: var(--h5-color);
      font-weight: var(--font-weight);
      font-style: var(--h5-style);
      font-family: var(--h5-font);
    }
    h5 a {
      --link-weight: var(--h5-weight);
    }
    h6 {
      --font-weight: var(--h6-weight);
      font-variant: var(--h6-variant);
      letter-spacing: var(--h6-letter-spacing);
      font-size: var(--h6-size);
      line-height: var(--h6-line-height);
      color: var(--h6-color);
      font-weight: var(--font-weight);
      font-style: var(--h6-style);
      font-family: var(--h6-font);
    }
    h6 a {
      --link-weight: var(--h6-weight);
    }
    /* Obsidian's reading view wraps each block in a div, and its rule catches blockquotes and callouts through those. */
    :is(p, pre, table, ul, ol, blockquote, .callout) + :is(h1, h2, h3, h4, h5, h6) {
      margin-top: var(--heading-spacing);
    }
    li h1, li h2, li h3, li h4, li h5 {
      margin-top: 0;
      margin-bottom: 0;
    }

    .internal-link {
      cursor: var(--cursor-link);
      text-decoration-line: var(--link-decoration);
      --font-weight: var(--link-weight);
      color: var(--link-color);
      transition: opacity var(--anim-duration-fast) ease-in-out;
    }
    .internal-link.is-unresolved {
      color: var(--link-unresolved-color);
      opacity: var(--link-unresolved-opacity);
      filter: var(--link-unresolved-filter);
      text-decoration-style: var(--link-unresolved-decoration-style);
      text-decoration-color: var(--link-unresolved-decoration-color);
    }
    @media (hover: hover) {
      .internal-link:hover {
        color: var(--link-color-hover);
        text-decoration-line: var(--link-decoration-hover);
      }
      .internal-link.is-unresolved:hover {
        opacity: 1;
        color: var(--link-color-hover);
        text-decoration-color: var(--link-color-hover);
        text-decoration-line: var(--link-decoration-hover);
      }
    }

    mark {
      background-color: var(--highlight-background);
      color: var(--text-normal);
    }
    mark .internal-link {
      color: var(--text-normal);
    }
    mark[data-highlight=red] {
      --highlight-background: var(--highlight-background-red);
    }
    mark[data-highlight=orange] {
      --highlight-background: var(--highlight-background-orange);
    }
    mark[data-highlight=yellow] {
      --highlight-background: var(--highlight-background-yellow);
    }
    mark[data-highlight=green] {
      --highlight-background: var(--highlight-background-green);
    }
    mark[data-highlight=blue] {
      --highlight-background: var(--highlight-background-blue);
    }
    mark[data-highlight=purple] {
      --highlight-background: var(--highlight-background-purple);
    }

    code {
      color: var(--code-normal);
      font-family: var(--font-monospace);
      font-size: var(--code-size);
      background-color: var(--code-background);
      border-radius: var(--code-radius);
      padding: .15em .3em;
      border: var(--code-border-width) solid var(--code-border-color);
      -webkit-box-decoration-break: clone;
    }
    pre {
      position: relative;
      padding: var(--size-4-3) var(--size-4-4);
      min-height: 38px;
      background-color: var(--code-background);
      border-radius: var(--code-radius);
      white-space: var(--code-white-space);
      border: var(--code-border-width) solid var(--code-border-color);
      overflow-x: auto;
    }
    pre code {
      border: none;
      padding: 0;
      background-color: transparent;
    }
    li > pre {
      margin: 0;
    }

    blockquote {
      color: var(--blockquote-color);
      font-style: var(--blockquote-font-style);
      background-color: var(--blockquote-background-color);
      border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color);
      padding-top: 0;
      padding-bottom: 0;
      padding-inline-start: var(--size-4-6);
      margin-inline-start: 0;
      margin-inline-end: 0;
    }
    blockquote > :first-child {
      margin-top: 0;
    }
    blockquote > :last-child {
      margin-bottom: 0;
    }

    hr {
      border: none;
      border-top: var(--hr-thickness) solid;
      border-color: var(--hr-color);
    }

    ul, ol {
      padding-inline-start: 0;
      margin-block-start: var(--p-spacing);
      margin-block-end: var(--p-spacing);
    }
    ul ul, ol ul, ul ol, ol ol {
      margin-block-start: 0;
      margin-block-end: 0;
    }
    ul li p:first-of-type, ol li p:first-of-type {
      margin-block-start: 0;
    }
    ul li p:last-of-type, ol li p:last-of-type {
      margin-block-end: 0;
    }
    ul > li, ol > li {
      padding-top: var(--list-spacing);
      padding-bottom: var(--list-spacing);
      position: relative;
    }
    ul > li {
      margin-inline-start: 3ch;
    }
    ol > li {
      margin-inline-start: 3ch;
    }
    ol ol > li, ul ul > li {
      margin-inline-start: var(--list-indent);
    }
    .list-bullet {
      float: left;
      float: inline-start;
      margin-inline-start: -.8em;
    }
    .task-list-item > .list-bullet {
      display: none;
    }
    ul.has-list-bullet {
      list-style-type: "\\200b";
    }
    ul.has-list-bullet > li::marker {
      color: transparent;
    }

    table {
      margin-block-start: var(--p-spacing);
      margin-block-end: var(--p-spacing);
      word-break: normal;
      border-collapse: collapse;
      line-height: var(--table-line-height);
    }
    td, th {
      padding: var(--size-2-2) var(--size-4-2);
      border: var(--table-border-width) solid var(--table-border-color);
      max-width: var(--table-column-max-width);
      min-width: var(--table-column-min-width);
      vertical-align: var(--table-cell-vertical-alignment);
    }
    td {
      font-size: var(--table-text-size);
      color: var(--table-text-color);
    }
    th {
      font-size: var(--table-header-size);
      font-weight: var(--table-header-weight);
      color: var(--table-header-color);
      font-family: var(--table-header-font);
      line-height: var(--line-height-tight);
    }
    th, td, th[align=left], td[align=left] {
      text-align: start;
    }
    th[align=center], td[align=center] {
      text-align: center;
    }
    th[align=right], td[align=right] {
      text-align: end;
    }
    thead > tr > th, tbody > tr > td {
      white-space: var(--table-white-space);
      text-overflow: ellipsis;
      overflow: hidden;
    }
    thead > tr > th > .markdown-embed, tbody > tr > td > .markdown-embed {
      white-space: normal;
    }
    tbody tr {
      background-color: var(--table-background);
    }
    tbody tr:nth-child(odd) {
      background-color: var(--table-row-alt-background);
    }
    tbody tr > td:nth-child(2n+2) {
      background-color: var(--table-column-alt-background);
    }
    tbody tr:last-child > td {
      border-bottom-width: var(--table-row-last-border-width);
    }
    tbody tr > td:first-child {
      border-left-width: var(--table-column-first-border-width);
    }
    tbody tr > td:last-child {
      border-right-width: var(--table-column-last-border-width);
    }
    thead tr {
      background-color: var(--table-header-background);
    }
    thead tr > th {
      border-top-width: var(--table-header-border-width);
      border-color: var(--table-header-border-color);
    }
    thead tr > th:nth-child(2n+2) {
      background-color: var(--table-column-alt-background);
    }
    thead tr > th:first-child {
      border-left-width: var(--table-column-first-border-width);
    }
    thead tr > th:last-child {
      border-right-width: var(--table-column-last-border-width);
    }
    @media (hover: hover) {
      tbody tr:hover {
        background-color: var(--table-row-background-hover);
      }
      tbody tr:nth-child(odd):hover {
        background-color: var(--table-row-alt-background-hover);
      }
      thead tr:hover {
        background-color: var(--table-header-background-hover);
      }
    }
  }

  :where(.markdown-rendered, .metadata-container, .metadata-properties) {
    /* Obsidian sets this on every element of the app. */
    &, & *, & ::before, & ::after {
      box-sizing: border-box;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-block-start: var(--p-spacing);
      margin-block-end: var(--p-spacing);
    }
    hr {
      border: none;
      border-top: var(--hr-thickness) solid;
      border-color: var(--hr-color);
      margin: 2rem 0;
    }
    ul ul, ol ul, ol ol ul, ol ul ul, ul ol ul, ul ul ul {
      list-style-type: disc;
    }
    ol {
      list-style-type: var(--list-numbered-style);
    }
    ul > li, ol > li {
      text-align: start;
    }
    ol > li::marker, ul > li::marker {
      color: var(--list-marker-color);
    }

    a {
      --font-weight: var(--link-weight);
      color: var(--link-color);
      font-weight: var(--link-weight);
      outline: none;
      text-decoration-line: var(--link-decoration);
      text-decoration-thickness: var(--link-decoration-thickness);
      cursor: var(--cursor-link);
      transition: opacity var(--anim-duration-fast) ease-in-out;
    }
    b, strong {
      font-weight: calc(var(--font-weight) + var(--bold-modifier));
      color: var(--bold-color);
    }
    b a, strong a {
      font-weight: calc(var(--link-weight) + var(--bold-modifier));
    }
    i, em {
      font-style: italic;
      color: var(--italic-color);
    }
    kbd {
      color: var(--code-normal);
      font-family: var(--font-monospace);
      background-color: var(--code-background);
      border-radius: var(--radius-s);
      font-size: var(--code-size);
      padding: .1em .25em;
    }

    /* The icon is Obsidian's public/external-link.svg. */
    .external-link {
      color: var(--link-external-color);
      text-decoration-line: var(--link-external-decoration);
      background-position: center right;
      background-repeat: no-repeat;
      background-image: linear-gradient(transparent, transparent), url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='9.38%25'><path d='M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18'/></svg>");
      background-size: .825em;
      padding-inline-end: .9em;
      background-position-y: .25em;
      cursor: var(--cursor-link);
      filter: var(--link-external-filter);
      transition: opacity var(--anim-duration-fast) ease-in-out;
    }
    a.tag {
      background-color: var(--tag-background);
      border: var(--tag-border-width) solid var(--tag-border-color);
      border-radius: var(--tag-radius);
      corner-shape: var(--tag-corner-shape);
      color: var(--tag-color);
      font-size: var(--tag-size);
      font-weight: var(--tag-weight);
      text-decoration: var(--tag-decoration);
      padding: var(--tag-padding-y) var(--tag-padding-x);
      line-height: 1;
    }
    @media (hover: hover) {
      .external-link:hover {
        color: var(--link-external-color-hover);
        text-decoration-line: var(--link-external-decoration-hover);
      }
      a.tag:hover {
        background-color: var(--tag-background-hover);
        border: var(--tag-border-width) solid var(--tag-border-color-hover);
        color: var(--tag-color-hover);
        text-decoration: var(--tag-decoration-hover);
      }
    }

    /* Prism, as in Obsidian's app.css. */
    code[class*=language-] {
      color: var(--code-normal);
      background: none;
      word-wrap: break-word;
      white-space: pre-wrap;
      word-break: normal;
      direction: ltr;
      font-family: var(--font-monospace);
      text-align: left;
      word-spacing: normal;
      line-height: var(--line-height-normal);
      hyphens: none;
    }
    .token.important, .token.bold { font-weight: 700; }
    .token.italic { font-style: italic; }
    .token.entity { cursor: help; }
    .token.comment, .token.prolog, .token.doctype, .token.cdata { color: var(--code-comment); }
    .token.namespace { opacity: .7; }
    .token.tag, .token.constant, .token.symbol, .token.deleted { color: var(--code-tag); }
    .token.punctuation { color: var(--code-punctuation); }
    .token.boolean, .token.number { color: var(--code-value); }
    .token.selector, .token.attr-name, .token.string, .token.char, .token.inserted { color: var(--code-string); }
    .token.operator { color: var(--code-operator); }
    .token.entity, .token.parameter, .token.property, .token.url, .language-css .token.string, .style .token.string,
    .token.variable { color: var(--code-property); }
    .token.atrule, .token.attr-value, .token.builtin, .token.function, .token.class-name, .token.property-access {
      color: var(--code-function);
    }
    .token.keyword { color: var(--code-keyword); }
    .token.regex, .token.important { color: var(--code-important); }

    input[type=checkbox] {
      -webkit-appearance: none;
      appearance: none;
      border-radius: var(--checkbox-radius);
      border: 1px solid var(--checkbox-border-color);
      flex-shrink: 0;
      padding: 0;
      margin: 0;
      margin-inline-end: 6px;
      width: var(--checkbox-size);
      height: var(--checkbox-size);
      position: relative;
      transition: box-shadow .15s ease-in-out;
    }
    input[type=checkbox]:active, input[type=checkbox]:focus {
      outline: 0;
      border-color: var(--checkbox-border-color-hover);
    }
    input[type=checkbox]:focus-visible {
      box-shadow: 0 0 0 2px var(--background-modifier-border-focus);
    }
    input[type=checkbox]:checked {
      background-color: var(--checkbox-color);
      border-color: var(--checkbox-color);
    }
    /* Obsidian's check mark. */
    input[type=checkbox]:checked:after {
      content: "";
      top: -1px;
      inset-inline-start: -1px;
      position: absolute;
      width: var(--checkbox-size);
      height: var(--checkbox-size);
      display: block;
      background-color: var(--checkbox-marker-color);
      mask-position: 52% 52%;
      mask-size: 65%;
      mask-repeat: no-repeat;
      mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'><path transform='translate(-4 -6)' d='M8.1043257,14.0367999 L4.52468714,10.5420499 C4.32525014,10.3497722 4.32525014,10.0368095 4.52468714,9.8424863 L5.24777413,9.1439454 C5.44721114,8.95166768 5.77142411,8.95166768 5.97086112,9.1439454 L8.46638057,11.5903727 L14.0291389,6.1442083 C14.2285759,5.95193057 14.5527889,5.95193057 14.7522259,6.1442083 L15.4753129,6.84377194 C15.6747499,7.03604967 15.6747499,7.35003511 15.4753129,7.54129009 L8.82741268,14.0367999 C8.62797568,14.2290777 8.3037627,14.2290777 8.1043257,14.0367999'/></svg>");
    }
    @media (hover: hover) {
      input[type=checkbox]:hover {
        border-color: var(--checkbox-border-color-hover);
      }
      input[type=checkbox]:checked:hover {
        background-color: var(--checkbox-color-hover);
        border-color: var(--checkbox-color-hover);
      }
    }
    .task-list-item-checkbox {
      width: var(--checkbox-size);
      height: var(--checkbox-size);
    }
    ul > li.task-list-item {
      list-style: none;
    }
    ul > li.task-list-item > p > .task-list-item-checkbox, ul > li.task-list-item > .task-list-item-checkbox {
      margin-inline-start: calc(var(--checkbox-size) * -1.5);
    }
    ul > li.task-list-item[data-task=x], ul > li.task-list-item[data-task=X] {
      text-decoration: var(--checklist-done-decoration);
      color: var(--checklist-done-color);
    }

    .list-bullet {
      color: transparent;
      position: relative;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .list-bullet:before {
      content: "\\200b";
    }
    .list-bullet:after {
      position: absolute;
      content: "\\200b";
      pointer-events: none;
      color: var(--list-marker-color);
      border-radius: var(--list-bullet-radius);
      width: var(--list-bullet-size);
      height: var(--list-bullet-size);
      border: var(--list-bullet-border);
      transform: var(--list-bullet-transform);
      background-color: var(--list-marker-color);
      transition: transform .15s, box-shadow .15s;
    }

    .footnote-link {
      text-decoration: none;
    }
    .footnotes {
      font-size: var(--footnote-size);
    }
    .footnote-ref {
      vertical-align: super;
    }
    .footnote-backref {
      display: inline-block;
      margin-inline-start: var(--size-4-1);
      color: var(--text-faint);
      text-decoration: none;
    }
    @media (hover: hover) {
      .footnote-backref:hover {
        color: var(--text-accent);
        text-decoration: none;
      }
    }

    svg.svg-icon {
      height: var(--icon-size);
      width: var(--icon-size);
      stroke-width: var(--icon-stroke);
    }

    .internal-embed:not(.image-embed) {
      display: block;
    }
    .internal-embed img:not([width]) {
      max-width: 100%;
    }
    .internal-embed img {
      border-radius: var(--image-radius);
    }
    .markdown-embed, .file-embed {
      position: relative;
    }
    .markdown-embed-link {
      position: absolute;
      top: 4px;
      inset-inline-end: 4px;
      color: var(--icon-color);
      opacity: var(--icon-opacity);
      cursor: var(--cursor-link);
      padding: var(--size-2-2);
      border-radius: var(--radius-s);
      display: flex;
      align-items: center;
      --icon-size: var(--icon-s);
      --icon-stroke: var(--icon-s-stroke-width);
    }
    @media (hover: hover) {
      .markdown-embed-link:hover {
        color: var(--icon-color-hover);
        opacity: var(--icon-opacity-hover);
        background: var(--background-modifier-hover);
      }
    }
    .markdown-embed-content {
      height: 100%;
    }
    .embed-title {
      align-items: center;
      display: flex;
      gap: var(--size-4-1);
      font-size: var(--font-preferred-size);
      font-weight: calc(var(--font-weight) + var(--bold-modifier));
      text-align: start;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0 0 var(--size-4-2) 0;
    }
    .markdown-embed {
      font-style: var(--embed-font-style);
      background-color: var(--embed-background);
      border-top: var(--embed-border-top);
      border-inline-end: var(--embed-border-end, var(--embed-border-right));
      border-bottom: var(--embed-border-bottom);
      border-inline-start: var(--embed-border-start, var(--embed-border-left));
      margin: 0;
    }
    .markdown-embed .markdown-preview-view {
      padding: 0;
    }
    .inline-embed > .markdown-embed-title {
      padding: var(--embed-padding);
    }
    .inline-embed > .markdown-embed-content {
      height: fit-content;
      max-height: var(--embed-max-height);
      overflow: auto;
    }
    .inline-embed > .markdown-embed-content > .markdown-preview-view {
      padding: var(--embed-padding);
    }
    /* An embed whose note or section is missing, as Obsidian shows a file that doesn't exist. */
    .file-embed.mod-empty {
      cursor: var(--cursor-link);
      padding: var(--size-4-2);
      color: var(--text-muted);
      text-align: center;
      font-size: var(--font-smaller);
    }
    /* Not Obsidian's: an embed nothing has loaded, because the page set no loader. */
    span.internal-embed:empty::before {
      content: '↪ ' attr(src);
      color: var(--text-muted);
      font-size: var(--font-smaller);
    }

    /* Pele draws diagrams from these variables, so they follow light and dark without a redraw. */
    .mermaid {
      --pele-bg: var(--mermaid-background);
      --pele-fg: var(--mermaid-text-color);
      --pele-muted: var(--mermaid-muted-color);
      --pele-line: var(--mermaid-line-color);
      --pele-surface: var(--mermaid-surface);
      --pele-surface-alt: var(--mermaid-surface-alt);
      --pele-border: var(--mermaid-border-color);
      --pele-accent: var(--mermaid-accent);
      --pele-critical: var(--mermaid-critical);
      --pele-error: var(--mermaid-error);
      --pele-font: var(--font-mermaid);
      --pele-font-mono: var(--font-monospace);
      --pele-radius: var(--mermaid-radius);
      --pele-title-weight: var(--mermaid-title-weight);
      --pele-heading-weight: var(--mermaid-heading-weight);
      --pele-bold-weight: var(--mermaid-bold-weight);
      --pele-series-1: var(--mermaid-color-1);
      --pele-series-2: var(--mermaid-color-2);
      --pele-series-3: var(--mermaid-color-3);
      --pele-series-4: var(--mermaid-color-4);
      --pele-series-5: var(--mermaid-color-5);
      --pele-series-6: var(--mermaid-color-6);
      --pele-series-7: var(--mermaid-color-7);
      --pele-series-8: var(--mermaid-color-8);
      --pele-zoom-cursor: var(--cursor);
      /* Not Obsidian's, whose diagrams sit at the start of the line. */
      text-align: center;
    }
    .mermaid .pele a.internal-link {
      fill: var(--link-color);
    }

    .callout {
      --callout-color: var(--callout-default);
      --callout-icon: lucide-pencil;
      --table-border-color: color-mix(in oklch, var(--callout-color) 25%, var(--background-primary) 50%);
    }
    .callout[data-callout=abstract], .callout[data-callout=summary], .callout[data-callout=tldr] {
      --callout-color: var(--callout-summary);
      --callout-icon: lucide-clipboard-list;
    }
    .callout[data-callout=info] {
      --callout-color: var(--callout-info);
      --callout-icon: lucide-info;
    }
    .callout[data-callout=todo] {
      --callout-color: var(--callout-todo);
      --callout-icon: lucide-check-circle-2;
    }
    .callout[data-callout=important] {
      --callout-color: var(--callout-important);
      --callout-icon: lucide-flame;
    }
    .callout[data-callout=tip], .callout[data-callout=hint] {
      --callout-color: var(--callout-tip);
      --callout-icon: lucide-flame;
    }
    .callout[data-callout=success], .callout[data-callout=check], .callout[data-callout=done] {
      --callout-color: var(--callout-success);
      --callout-icon: lucide-check;
    }
    .callout[data-callout=question], .callout[data-callout=help], .callout[data-callout=faq] {
      --callout-color: var(--callout-question);
      --callout-icon: help-circle;
    }
    .callout[data-callout=warning], .callout[data-callout=caution], .callout[data-callout=attention] {
      --callout-color: var(--callout-warning);
      --callout-icon: lucide-alert-triangle;
    }
    .callout[data-callout=failure], .callout[data-callout=fail], .callout[data-callout=missing] {
      --callout-color: var(--callout-fail);
      --callout-icon: lucide-x;
    }
    .callout[data-callout=danger], .callout[data-callout=error] {
      --callout-color: var(--callout-error);
      --callout-icon: lucide-zap;
    }
    .callout[data-callout=bug] {
      --callout-color: var(--callout-bug);
      --callout-icon: lucide-bug;
    }
    .callout[data-callout=example] {
      --callout-color: var(--callout-example);
      --callout-icon: lucide-list;
    }
    .callout[data-callout=quote], .callout[data-callout=cite] {
      --callout-color: var(--callout-quote);
      --callout-icon: quote-glyph;
    }
    .callout {
      overflow: hidden;
      border-style: solid;
      border-color: color-mix(in oklch, var(--callout-color) calc(var(--callout-border-opacity) * 100%), transparent);
      border-width: var(--callout-border-width);
      border-radius: var(--callout-radius);
      margin: 1em 0;
      mix-blend-mode: var(--callout-blend-mode);
      background-color: color-mix(in oklch, var(--callout-color) 10%, transparent);
      padding: var(--callout-padding);
    }
    .callout.is-collapsible .callout-title {
      cursor: var(--cursor);
    }
    .callout-title {
      padding: var(--callout-title-padding);
      display: flex;
      gap: var(--size-4-1);
      font-size: var(--callout-title-size);
      color: var(--callout-color);
      line-height: var(--line-height-tight);
      align-items: flex-start;
    }
    .callout-content {
      overflow-x: auto;
      padding: var(--callout-content-padding);
      background-color: var(--callout-content-background);
    }
    .callout-content .callout {
      margin-top: 20px;
    }
    .callout-icon {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
    }
    .callout-icon .svg-icon {
      color: var(--callout-color);
    }
    .callout-icon:after {
      content: "\\200b";
    }
    .callout-title-inner {
      --font-weight: var(--callout-title-weight);
      font-weight: var(--font-weight);
      color: var(--callout-title-color);
    }
    .callout-fold {
      display: flex;
      align-items: center;
      padding-inline-end: var(--size-4-2);
    }
    .callout-fold:after {
      content: "\\200b";
    }
    .callout-fold .svg-icon {
      transition: transform .1s ease-in-out;
    }
    .callout-fold.is-collapsed .svg-icon {
      transform: rotate(calc(var(--direction) * -1 * 90deg));
    }

    /*
     * Not Obsidian's: it folds a div with script, where a foldable callout here is a <details>, which needs none.
     * The component mirrors Obsidian's is-collapsed class onto it.
     */
    summary.callout-title {
      list-style: none;
    }
    summary.callout-title::-webkit-details-marker {
      display: none;
    }
    /* Browsers without ::details-content or interpolate-size toggle instantly. */
    details.callout {
      interpolate-size: allow-keywords;
    }
    details.callout::details-content {
      height: 0;
      overflow: clip;
      transition: height 150ms ease-out, content-visibility 150ms allow-discrete;
    }
    details.callout[open]::details-content {
      height: auto;
    }
    @media (prefers-reduced-motion: reduce) {
      details.callout::details-content {
        transition: none;
      }
    }

    /* Not Obsidian's, which draws math with MathJax. */
    .math-block {
      display: block;
      text-align: center;
      overflow-x: auto;
    }

    /* Temml 0.14.0 dist/Temml-Latin-Modern.css minus its @font-face rules, which src/tex.ts registers. Backslashes dropped from comments. */
    math {
      font-style: normal;
      font-weight: normal;
      line-height: normal;
      font-size-adjust: none;
      text-indent: 0;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      direction: ltr;
      /* Prevent Firefox from omitting the dot on i or j. */
      font-feature-settings: "dtls" off;
    }

    math * {
      border-color: currentColor;
    }

    math {
      font-family: "Latin Modern Math", math;
    }

    /* display: block is necessary in Firefox and Safari.
     * Not in Chromium, which recognizes display: "block math" written inline. */
     math.tml-display {
      display: block;
      width: 100%;
    }

    *.mathscr {
      font-family: "Temml";
    }

    /* Cramped superscripts in WebKit */
    mfrac > :nth-child(2),
    msqrt,
    mover > :first-child {
      math-shift: compact
    }

    .menclose {
      display: inline-block;
      position: relative;
      padding: 0.5ex 0ex;
    }
    .tml-cancelto {
      display: inline-block;
      position: absolute;
      top: 0;
      left: 0;
      padding: 0.5ex 0ex;
      background-color: currentColor;
      /* Use the SVG as an alpha mask (painted by background-color) */
      -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><marker id='a' markerHeight='5' markerUnits='strokeWidth' markerWidth='7' orient='auto' refX='7' refY='2.5'><path fill='black' d='m0 0 7 2.5L0 5z'/></marker></defs><line x2='100%25' y1='100%25' stroke='black' stroke-width='.06em' marker-end='url(%23a)' vector-effect='non-scaling-stroke'/></svg>");
              mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><marker id='a' markerHeight='5' markerUnits='strokeWidth' markerWidth='7' orient='auto' refX='7' refY='2.5'><path fill='black' d='m0 0 7 2.5L0 5z'/></marker></defs><line x2='100%25' y1='100%25' stroke='black' stroke-width='.06em' marker-end='url(%23a)' vector-effect='non-scaling-stroke'/></svg>");
      -webkit-mask-repeat: no-repeat;
              mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
              mask-size: 100% 100%;
      -webkit-mask-position: 0 0;
              mask-position: 0 0;
    }

    @supports (-moz-appearance: none) {
      /* vec w/o italic correction for Firefox */
      .tml-vec {
        transform: scale(0.75)
      }
      /* Fix cancelto in Firefox */
      .ff-narrow {
        width: 0em;
      }
      .ff-nudge-left {
        margin-left: -0.2em;
      }
      /* Squash hidden mrows in bordermatrix. Messes with centering, but necessary to squash. */
      .ff-squash mtd {
        display: block;
        height: 0;
      }
    }

    @supports (not (-moz-appearance: none)) {
      /* Chromium and WebKit */
      /* prime vertical alignment */
      mo.tml-prime {
        font-family: Temml;
      }
      /* Italic correction on superscripts */
      .tml-sml-pad {
        padding-left: 0.05em;
      }
      .tml-med-pad {
        padding-left: 0.10em;
      }
      .tml-lrg-pad {
        padding-left: 0.15em;
      }
    }

    @supports (-webkit-backdrop-filter: blur(1px)) {
      /* WebKit vertical & italic correction on accents */
      .wbk-acc {
        /* lower by x-height distance */
        transform: translate(0em, 0.431em);
      }
      .wbk-sml {
        transform: translate(0.07em, 0);
      }
      .wbk-sml-acc {
        transform: translate(0.07em, 0.431em);
      }
      .wbk-sml-vec {
        transform: scale(0.75) translate(0.07em, 0);
      }
      .wbk-med {
        transform: translate(0.14em, 0);
      }
      .wbk-med-acc {
        transform: translate(0.14em, 0.431em);
      }
      .wbk-med-vec {
        transform: scale(0.75) translate(0.14em, 0);
      }
      .wbk-lrg {
        transform: translate(0.21em, 0);
      }
      .wbk-lrg-acc {
        transform: translate(0.21em, 0.431em);
      }
      .wbk-lrg-vec {
        transform: scale(0.75) translate(0.21em, 0);
      }
    }

    /* cancel & phase use background images. Get them to print. */
    menclose {
      -webkit-print-color-adjust: exact;  /* Chrome & Edge */
              print-color-adjust: exact;
    }

    /* Array cell justification in Firefox & WebKit */
    .tml-right {
      text-align: right;
    }
    .tml-left {
      text-align: left;
    }

    /* For CD labels that grow to the left in Firefox and WebKit */
    .tml-shift-left { margin-left:-200% }

    /* Styles for Chromium only */
    @supports (not (-webkit-backdrop-filter: blur(1px))) and (not (-moz-appearance: none)) {
      /* Italic correction on accents */
      .chr-sml {
        transform: translate(0.07em, 0)
      }
      .chr-sml-vec {
        transform: scale(0.75) translate(0.07em, 0)
      }
      .chr-med {
        transform: translate(0.14em, 0)
      }
      .chr-med-vec {
        transform: scale(0.75) translate(0.14em, 0)
      }
      .chr-lrg {
        transform: translate(0.21em, 0)
      }
      .chr-lrg-vec {
        transform: scale(0.75) translate(0.21em, 0)
      }

      /* For CD labels that grow to the left */
      .tml-shift-left { margin-left:-100% }

      /* MathML Core & Chromium do not support the MathML 3.0 element <menclose> attributes. */
      /* So use styles. */
      menclose {
        position: relative;
        padding: 0.5ex 0ex;
      }
      
      .tml-overline {
        padding: 0.1em 0 0 0;
        border-top: 0.065em solid;
      }

      .tml-underline {
        padding: 0 0 0.1em 0;
        border-bottom: 0.065em solid;
      }

      .tml-cancel {
        display: inline-block;
        position: absolute;
        left: 0.5px;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: currentColor;
      }
      .upstrike {
        clip-path: polygon(0.05em 100%, 0em calc(100% - 0.05em), calc(100% - 0.05em) 0em, 100% 0.05em);
      }
      .downstrike {
        clip-path: polygon(0em 0.05em, 0.05em 0em, 100% calc(100% - 0.05em), calc(100% - 0.05em) 100%);
      }
      .sout {
        clip-path: polygon(0em calc(55% + 0.0333em), 0em calc(55% - 0.0333em), 100% calc(55% - 0.0333em), 100% calc(55% + 0.0333em));
      }
      .tml-xcancel {
        clip-path: polygon(0.05em 0em, 0em 0.05em, calc(50% - 0.05em) 50%, 0em calc(100% - 0.05em), 0.05em 100%, 50% calc(50% + 0.05em), calc(100% - 0.05em) 100%, 100% calc(100% - 0.05em), calc(50% + 0.05em) 50%, 100% 0.05em, calc(100% - 0.05em) 0%, 50% calc(50% - 0.05em));
      }

      .longdiv-top {
        border-top: 0.067em solid;
        padding: 0.1em 0.2em 0.2em 0.433em;
      }
      .longdiv-arc {
        position: absolute;
        top: 0;
        bottom: 0.1em;
        left: -0.4em;
        width: 0.7em;
        border: 0.067em solid;
        transform: translateY(-0.067em);
        border-radius: 70%;
        clip-path: inset(0 0 0 0.4em);
        box-sizing: border-box;}
        .menclose {display: inline-block;
        text-align: left;
        position: relative;
      }
      
      .phasor-bottom {
        border-bottom: 0.067em solid;
        padding: 0.2em 0.2em 0.1em 0.6em;
      }
      .phasor-angle {
        display: inline-block;
        position: absolute;
        left: 0.5px;
        bottom: -0.04em;
        height: 100%;
        aspect-ratio: 0.5;
        background-color: currentColor;
        clip-path: polygon(0.05em 100%, 0em calc(100% - 0.05em), calc(100% - 0.05em) 0em, 100% 0.05em);
      }

      .tml-fbox {
        padding: 3pt;
        border: 1px solid;
      }

      .circle-pad {
        padding: 0.267em;
      }
      .textcircle {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        border: 0.067em solid;
        border-radius: 50%;
       }

       .actuarial {
        padding: 0.03889em 0.03889em 0 0.03889em;
        border-width: 0.08em 0.08em 0em 0em;
        border-style: solid;
        margin-right: 0.03889em;
       }

       /* Stretch widetilde */
      .tml-tilde-2 {
        transform: scale(2.0, 1.1)
      }
      .tml-tilde-3 {
        transform: scale(3.0, 1.3)
      }
      .tml-tilde-4 {
        transform: scale(4.0, 1.4)
      }
      /* Stretch widehat */
      .tml-hat-1 {
        transform: scale(1.8, 1.1)
      }
      .tml-hat-2 {
        transform: scale(3.5, 1.1)
      }
      .tml-hat-3 {
        transform: scale(5.4, 1.3)
      }
      .tml-hat-4 {
        transform: scale(7.2, 1.4)
      }

      /* set array cell justification */
      .tml-right {
        text-align: -webkit-right;
      }
      .tml-left {
        text-align: -webkit-left;
      }
    }

    .special-fraction {
      font-family: 'Times New Roman', Times, 'STIX TWO', Tinos, serif;
    }

    /* flex-wrap for line-breaking in Chromium */
    math {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: baseline;
    }
    math > mrow {
      padding: 0.5ex 0ex;
    }

    /* Default mtd top padding is 0.5ex per MathML-Core and user-agent CSS */
    /* We adjust for jot and small */
    mtable.tml-jot > mtr > mtd {
      padding-top: 0.7ex;
      padding-bottom: 0.7ex;
    }
    mtable.tml-small mtd {
      padding-top: 0.35ex;
      padding-bottom: 0.35ex;
    }

    /* Firefox */
    @-moz-document url-prefix() {
      /* Avoid flex-wrap */
      math { display: inline; }
      math > mrow { padding: 0 }
      /* Adjust Firefox spacing between array rows */
      mtd, mtable.tml-small mtd { padding-top: 0; padding-bottom: 0; }
      mtable.tml-jot > mtr > mtd { padding-top: 0.2ex; padding-bottom: 0.2ex; }
    }

    /* AMS environment auto-numbering via CSS counter. */
    .tml-eqn::before {
      counter-increment: tmlEqnNo;
      content: "(" counter(tmlEqnNo) ")";
    }
  }
  }
`;
