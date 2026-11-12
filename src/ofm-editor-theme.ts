import { css } from 'lit';

/**
 * An optional look for `<ofm-markdown-editor>` that matches Obsidian's editor. Use it with `obsidianTheme`,
 * which defines the variables it reads. Selectors use Obsidian's class names, so Obsidian snippets for the editor apply too.
 */
export const obsidianEditorTheme = css`
  :where(ofm-markdown-editor) {
    --file-line-width: 700px;
    --file-margins: 32px 32px;
    --caret-color: var(--text-normal);
    --text-selection: color-mix(in oklch, var(--interactive-accent) 25%, transparent);
    --list-indent-editing: 0.75em;
    --list-bullet-size: 5px;
    --embed-border-start: 2px solid var(--interactive-accent);
  }

  ofm-markdown-editor {
    display: block;
    color-scheme: light dark;
    color: var(--text-normal);
    font-family: var(--font-text-theme);
    font-size: var(--font-text-size);
    line-height: var(--line-height-normal);
  }

  .markdown-source-view.mod-cm6 {
    height: 100%;

    .cm-editor {
      height: 100%;
      &.cm-focused {
        outline: none;
      }
    }
    .cm-scroller {
      padding: var(--file-margins);
      font-family: inherit;
      line-height: inherit;
    }
    .cm-content {
      padding: 0;
      caret-color: var(--caret-color);
    }
    &.is-readable-line-width .cm-content {
      max-width: var(--file-line-width);
      margin-inline: auto;
    }
    .cm-line {
      padding: 0;
    }
    .cm-cursor {
      border-left-color: var(--caret-color);
    }
    .cm-editor .cm-selectionLayer .cm-selectionBackground,
    .cm-editor.cm-focused .cm-selectionLayer .cm-selectionBackground {
      background: var(--text-selection);
    }
    .cm-placeholder {
      color: var(--text-faint);
    }

    /* Headings size the whole line, as in Obsidian. */
    .HyperMD-header-1 { font-size: var(--h1-size); line-height: var(--h1-line-height); letter-spacing: var(--h1-letter-spacing); }
    .HyperMD-header-2 { font-size: var(--h2-size); line-height: var(--h2-line-height); letter-spacing: var(--h2-letter-spacing); }
    .HyperMD-header-3 { font-size: var(--h3-size); line-height: var(--h3-line-height); letter-spacing: var(--h3-letter-spacing); }
    .HyperMD-header-4 { font-size: var(--h4-size); line-height: var(--h4-line-height); letter-spacing: var(--h4-letter-spacing); }
    .HyperMD-header-5 { font-size: var(--h5-size); line-height: var(--h5-line-height); letter-spacing: var(--h5-letter-spacing); }
    .HyperMD-header-6 { font-size: var(--h6-size); line-height: var(--h6-line-height); letter-spacing: var(--h6-letter-spacing); }
    .cm-header-1 { color: var(--h1-color, inherit); font-family: var(--h1-font, inherit); font-weight: var(--h1-weight); }
    .cm-header-2 { color: var(--h2-color, inherit); font-family: var(--h2-font, inherit); font-weight: var(--h2-weight); }
    .cm-header-3 { color: var(--h3-color, inherit); font-family: var(--h3-font, inherit); font-weight: var(--h3-weight); }
    .cm-header-4 { color: var(--h4-color, inherit); font-family: var(--h4-font, inherit); font-weight: var(--h4-weight); }
    .cm-header-5 { color: var(--h5-color, inherit); font-family: var(--h5-font, inherit); font-weight: var(--h5-weight); }
    .cm-header-6 { color: var(--h6-color, inherit); font-family: var(--h6-font, inherit); font-weight: var(--h6-weight); }

    /* Before the link and code colors, so those win inside quotes. */
    .cm-quote {
      color: var(--blockquote-color, inherit);
      font-style: var(--blockquote-font-style);
    }
    .cm-strong {
      color: var(--bold-color, inherit);
      font-weight: var(--bold-weight);
    }
    .cm-em {
      color: var(--italic-color, inherit);
      font-style: italic;
    }
    .cm-strikethrough {
      text-decoration: line-through;
    }
    .cm-highlight {
      background: var(--highlight-background);
      color: var(--text-normal);
    }
    .cm-comment, .cm-blockid {
      color: var(--text-faint);
    }
    .HyperMD-frontmatter {
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
    }
    .cm-inline-code {
      padding-block: 0.1em;
      background: var(--code-background);
      color: var(--code-normal);
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
    }
    .cm-formatting-code + .cm-inline-code:not(.cm-formatting-code), .cm-formatting-code:has(+ .cm-inline-code) {
      border-start-start-radius: var(--code-radius);
      border-end-start-radius: var(--code-radius);
    }
    .cm-inline-code:not(.cm-formatting-code):has(+ .cm-formatting-code), .cm-inline-code + .cm-formatting-code {
      border-start-end-radius: var(--code-radius);
      border-end-end-radius: var(--code-radius);
    }
    .cm-hmd-internal-link, .cm-link {
      color: var(--link-color);
      text-decoration: var(--link-decoration);
    }
    .cm-url {
      color: var(--link-external-color);
      text-decoration: var(--link-external-decoration);
    }
    /* Source mode shows link text plain, as Obsidian does. Live Preview underlines it. */
    &:not(.is-live-preview) :is(.cm-hmd-internal-link, .cm-link) {
      text-decoration: none;
    }
    /* Footnote refs stay as typed in both modes, small and raised, as in Obsidian. */
    :is(.cm-footref:not(.cm-hmd-footnote), .cm-inline-footnote) {
      font-size: var(--footnote-size);
      vertical-align: super;
    }
    .cm-formatting-link {
      text-decoration: none;
    }
    .cm-hashtag {
      color: var(--tag-color);
      font-size: var(--tag-size);
    }
    /*
     * Obsidian fades only these marks. Emphasis, highlight and code marks keep the text's style.
     * After the token colors above, so the faint wins inside quotes and links.
     */
    :is(.cm-formatting-header, .cm-formatting-list, .cm-formatting-quote, .cm-formatting-link,
      .cm-callout-mark, .cm-hmd-escape-backslash, .HyperMD-frontmatter .cm-formatting) {
      color: var(--text-faint);
    }
    .cm-footref, .cm-inline-footnote {
      color: var(--text-faint);
    }
    /* Obsidian sets math as italic code, with TeX tokens colored like code. */
    .cm-math {
      color: var(--code-normal);
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
      font-style: italic;
    }
    .cm-formatting-math {
      color: var(--text-accent);
    }
    .cm-math:is(.cm-variable-2, .cm-atom) {
      color: var(--code-property);
    }
    .HyperMD-table-row {
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
    }
    .cm-hmd-table-sep {
      color: var(--text-faint);
    }
    /* Tags are pills in both modes. */
    .cm-hashtag {
      padding-block: var(--tag-padding-y);
      background: var(--tag-background);
      line-height: 1;
    }
    .cm-hashtag-begin {
      padding-inline-start: var(--tag-padding-x);
      border-start-start-radius: var(--tag-radius);
      border-end-start-radius: var(--tag-radius);
      color: var(--tag-color);
    }
    .cm-hashtag-end {
      padding-inline-end: var(--tag-padding-x);
      border-start-end-radius: var(--tag-radius);
      border-end-end-radius: var(--tag-radius);
    }

    /* Code inside fences: the line has the background, spans carry --code-* colors. */
    .HyperMD-codeblock {
      padding-inline: 16px;
      background: var(--code-background);
      font-family: var(--font-monospace-theme);
      font-size: var(--code-size);
    }
    .HyperMD-codeblock-begin {
      position: relative;
      border-start-start-radius: var(--code-radius);
      border-start-end-radius: var(--code-radius);
    }
    .HyperMD-codeblock-end {
      border-end-start-radius: var(--code-radius);
      border-end-end-radius: var(--code-radius);
    }
    .cm-keyword { color: var(--code-keyword); }
    .cm-atom, .cm-number { color: var(--code-value); }
    .cm-def, .cm-function { color: var(--code-function); }
    .cm-variable, .cm-property, .cm-attribute { color: var(--code-property); }
    .cm-type, .cm-builtin { color: var(--code-function); }
    .cm-operator { color: var(--code-operator); }
    .HyperMD-codeblock .cm-comment { color: var(--code-comment); }
    .cm-string, .cm-string-2 { color: var(--code-string); }
    .cm-url.cm-string { color: var(--link-external-color); }
    .cm-tag { color: var(--code-tag); }
    .cm-punctuation { color: var(--code-punctuation); }
    .cm-meta { color: var(--code-important); }
    .cm-hashtag.cm-meta { color: var(--tag-color); }

    .cm-fold-indicator {
      opacity: 0;
      cursor: pointer;
      transition: opacity 100ms ease-in-out;
      &:hover, &.is-collapsed {
        opacity: 1;
      }
    }
    .collapse-indicator {
      width: 0.4em;
      height: 0.4em;
      margin: 0.55em 0.4em 0;
      border-right: 1.5px solid var(--text-faint);
      border-bottom: 1.5px solid var(--text-faint);
      transform: rotate(45deg);
    }
    .is-collapsed .collapse-indicator {
      transform: rotate(-45deg);
    }
    .cm-gutters {
      border: 0;
      background: transparent;
    }
    .cm-foldPlaceholder {
      border: 0;
      background: transparent;
      color: var(--text-faint);
    }

    /* Search, autocomplete and other panels, restyled to Obsidian's look. */
    .cm-panels {
      border-color: var(--background-modifier-border);
      background: var(--background-primary-alt);
      color: var(--text-normal);
      font-family: var(--font-interface);
    }
    /* Obsidian's find bar. */
    .cm-panels-top {
      border: 0;
      background: var(--background-primary);
    }
    .document-search-container {
      display: grid;
      gap: 8px;
      max-width: var(--file-line-width);
      margin: 8px auto;
      padding-inline: 8px;
    }
    .document-search, .document-replace {
      display: flex;
      gap: 8px;
      align-items: center;
      &[hidden] {
        display: none;
      }
    }
    .search-input-container {
      position: relative;
      display: flex;
      flex: 1;
      align-items: center;
    }
    .document-search-input input, .document-replace-input {
      flex: 1;
      height: 30px;
      padding: 0 64px 0 12px;
      border: 2px solid var(--background-modifier-border);
      border-radius: 15px;
      background: var(--background-primary-alt);
      color: var(--text-normal);
      font: 14px var(--font-interface);
      outline: none;
      &:focus {
        border-color: var(--background-modifier-border-focus);
      }
      &::-webkit-search-cancel-button {
        display: none;
      }
    }
    /* A magnifier at the start of the find field. */
    .document-search-input input {
      padding-inline-start: 32px;
      background: var(--background-primary-alt)
        url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888888' stroke-width='2' stroke-linecap='round'><circle cx='11' cy='11' r='7'/><path d='m20 20-4-4'/></svg>")
        12px center / 14px no-repeat;
    }
    .document-replace-input {
      padding-inline-end: 12px;
    }
    .document-search-count {
      position: absolute;
      inset-inline-end: 12px;
      color: var(--text-muted);
      font: 12px var(--font-interface);
      pointer-events: none;
    }
    .document-search-buttons {
      display: flex;
      gap: 4px;
    }
    .document-search-button, .document-search-close-button {
      min-width: 26px;
      height: 26px;
      padding: 0 6px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--text-muted);
      font: 14px var(--font-interface);
      cursor: pointer;
      &:hover {
        background: var(--background-modifier-hover);
        color: var(--text-normal);
      }
    }
    .document-search-buttons .svg-icon {
      display: block;
      width: 16px;
      height: 16px;
    }
    .document-search-button.mod-replace {
      border: 1px solid var(--background-modifier-border);
    }
    .cm-tooltip {
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      background: var(--background-primary);
      color: var(--text-normal);
      box-shadow: 0 4px 16px #0000002a;
    }
    .cm-tooltip-autocomplete ul li {
      padding: 4px 8px;
    }
    .cm-tooltip-autocomplete ul li[aria-selected] {
      background: var(--interactive-accent);
      color: #fff;
    }
    /* Obsidian outlines matches rather than filling them. */
    .cm-searchMatch {
      border-radius: 2px;
      background: transparent;
      outline: 1px solid var(--text-faint);
    }
    .cm-searchMatch.cm-searchMatch-selected {
      background: transparent;
      outline: 2px solid var(--interactive-accent);
    }
    .cm-selectionMatch {
      background: var(--background-modifier-hover);
    }
  }

  /* Live Preview. */
  .markdown-source-view.mod-cm6.is-live-preview {
    .cm-hmd-internal-link, .cm-link, .cm-url {
      cursor: pointer;
    }
    /* Obsidian's public/external-link.svg, as in the reading view. */
    .external-link {
      padding-inline-end: 0.9em;
      background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='%23888888' stroke-linecap='round' stroke-linejoin='round' stroke-width='9.38%25'><path d='M14 9 L3 9 3 29 23 29 23 18 M18 4 L28 4 28 14 M28 4 L14 18'/></svg>")
        right 0.25em / 0.825em no-repeat;
    }

    .HyperMD-quote {
      position: relative;
      padding-inline-start: 24px;
      &::before {
        content: '';
        position: absolute;
        inset-block: 0;
        inset-inline-start: 0;
        border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color);
      }
    }
    .HyperMD-list-line {
      padding-inline-start: var(--list-indent-editing);
    }
    /* Obsidian draws the bullet as a dot, not a glyph. */
    .list-bullet {
      position: relative;
      display: inline-block;
      min-width: 1ch;
      color: transparent;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: var(--list-bullet-size);
        height: var(--list-bullet-size);
        border-radius: 50%;
        background: var(--list-marker-color);
        transform: translate(-50%, -50%);
      }
    }
    .HyperMD-task-line:is([data-task='x'], [data-task='X']) {
      color: var(--checklist-done-color);
      text-decoration: var(--checklist-done-decoration);
    }
    .task-list-label {
      display: inline;
    }
    .task-list-item-checkbox {
      appearance: none;
      position: relative;
      top: 0.15em;
      width: var(--checkbox-size);
      height: var(--checkbox-size);
      margin: 0 0.4em 0 0;
      border: 1px solid var(--checkbox-border-color);
      border-radius: var(--checkbox-radius);
      cursor: pointer;
      &:checked {
        border-color: var(--checkbox-color);
        background: var(--checkbox-color);
      }
      &:checked::after {
        content: '';
        position: absolute;
        inset: 12% 33% 28%;
        border: solid var(--checkbox-marker-color);
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
    .HyperMD-hr:has(hr) {
      padding-block: 0.75em;
    }
    hr {
      margin: 0;
      border: 0;
      border-top: var(--hr-thickness) solid var(--hr-color);
    }
    .cm-image-embed img {
      max-width: 100%;
    }
    .cm-code-flair {
      position: absolute;
      inset-block-start: 4px;
      inset-inline-end: 8px;
      display: flex;
      gap: 8px;
      color: var(--text-faint);
      font-family: var(--font-interface);
      font-size: 0.8em;
    }
    .copy-code-button {
      padding: 0 6px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      &:hover {
        background: var(--background-modifier-hover);
      }
    }

    /*
     * Widgets sit inside .cm-content, whose pre-wrap would show their templates' whitespace.
     * CodeMirror measures a block widget's border box, so margins must stay inside it: flow-root, and padding not margin.
     */
    .cm-embed-block, .metadata-container {
      display: flow-root;
      white-space: normal;
    }
    .cm-embed-block {
      position: relative;
      cursor: text;
      &:hover {
        box-shadow: 0 0 0 1px var(--background-modifier-border);
        border-radius: 4px;
      }
      /* A slice renders its footnotes only so their refs resolve. Obsidian lists footnotes once, at the end. */
      .footnotes {
        display: none;
      }
    }
    .cm-embed-block:not(.markdown-embed) ofm-markdown .markdown-rendered > * {
      margin-block: 0;
    }
    .markdown-embed {
      padding: var(--embed-padding);
      border-inline-start: var(--embed-border-start);
      background: var(--embed-background);
    }
    .markdown-embed-link {
      position: absolute;
      inset-block-start: 4px;
      inset-inline-end: 4px;
      width: 16px;
      height: 16px;
      color: var(--text-faint);
      cursor: pointer;
      &::before {
        content: '↗';
      }
      &:hover {
        color: var(--text-accent);
      }
    }
    .internal-embed.is-unresolved {
      opacity: 0.6;
    }
    span.internal-embed:empty::before {
      content: '↪ ' attr(src);
      padding: var(--embed-padding);
      border: 1px dashed var(--background-modifier-border);
      border-radius: 4px;
      color: var(--text-muted);
      font-size: 0.9em;
    }
    .metadata-container {
      padding-block-end: 2em;
    }
  }
`;
