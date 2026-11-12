# Obsidian markup gap analysis

2026-11-12. This compares our `render()` output and `obsidianTheme` with Obsidian 1.15's reading view. Class and variable names were checked against the `app.css` and `app.js` in a local Obsidian 1.15 install. Where a wrapper's exact structure comes from memory, the text says so.

**Goal:** keep enough parity that people can paste snippets from their Obsidian theme to style the components. Total parity is not a goal. Foldable callouts deliberately use `<details>`.

**Overall:** our CSS variable names already match Obsidian's almost exactly. Of the 112 variables we define, only `--text-highlight-bg` isn't an Obsidian name. The real gaps are a missing root class, a few missing classes and attributes, and one scoping issue that stops pasted theme blocks from taking effect.

## Easy, high value

**Status: #1–#7 done** on branch `2026-11-12-obsidian-parity`. Where names conflicted, ours were renamed to Obsidian's: `.ofm-content` → `.markdown-rendered`, `data-highlight-color` → `data-highlight`, `.ofm-diagram` → `.mermaid`. External links get `external-link` only, without `target` or `rel`.

| # | Gap | Ours | Obsidian | Why it matters |
|---|---|---|---|---|
| 1 | Root class | `.ofm-content` | `.markdown-rendered` (125 selectors in `app.css`) | Most snippets are scoped to `.markdown-rendered …`. Adding the class to our content div is one line. |
| 2 | Colored highlight attribute | `<mark data-highlight-color="red">` | `<mark data-highlight="red">` (confirmed in `app.js`) | Obsidian 1.15 has colored highlights natively, so ours is just a different name. Changes SPEC Example 40. |
| 3 | Highlight variables | `--text-highlight-bg`, plus a hard-coded 35% color mix per color | `--highlight-background`, `--highlight-background-{red…purple}`, `--highlight-opacity` | Obsidian keeps `--text-highlight-bg` only as a fallback. Pair with #2. |
| 4 | External links | bare `<a>`, styled through a plain `a` rule | `a.external-link` | Snippets target `.external-link`. |
| 5 | Task checkbox | bare `<input>`, `li[data-task]` | `input.task-list-item-checkbox`, `li.is-checked` | Checkbox restyles in snippets are very common. We already match `data-task`. |
| 6 | Mermaid container | `.ofm-diagram` | `.mermaid` | Add `mermaid` next to our class. |
| 7 | Footnote links | `footnote-ref`, `footnote-backref` | adds `footnote-link` to both, plus `data-footnote-id` | Small win. |

## Scoping issue that blocks copy/paste

The theme defines its variables directly on `:where(ofm-note, ofm-markdown, ofm-frontmatter)`. Obsidian themes set theirs on `body`, `.theme-light` or `.theme-dark`. A variable set on the element itself beats one inherited from `body`, so a pasted `body { --text-normal: … }` does nothing.

Moving the defaults up to `:root` doesn't fix it either. Derived variables like `--link-external-color: var(--text-accent)` are worked out where they're defined, so a later `body` override wouldn't flow through to them.

The cheap fix is to document "change `body`/`.theme-*` to `ofm-markdown` when pasting." A real fix would be a scoping rethink, and that doesn't seem worth it.

## Wrapper elements to consider

| Gap | Obsidian | Recommendation |
|---|---|---|
| Block wrappers | Each top-level block sits in `div.el-<tag>` (`el-p`, `el-h1`, `el-pre`…). Confirmed in `app.js`. | **Maybe.** Some themes use these for block spacing. It could be done only in the component by wrapping the fragment's top-level children in `#build`, which avoids changing SPEC. |
| List bullets | `ul.has-list-bullet` with `span.list-bullet` (22 selectors) and the `--list-bullet-*` variables | **Skip for now.** It needs extra markup plus CSS to hide the native markers. Only worth it if bullet-restyling themes matter. |
| Callout icon | `.callout-icon`, `--callout-icon` | Skip until we have icons. |
| Embeds | `internal-embed` gets `image-embed`, `markdown-embed`, `media-embed` or `file-embed`, and `is-loaded`. Images are wrapped in a span (structure from memory). | **Add only the type classes** (`image-embed`, `markdown-embed`) to our elements. We don't resolve embeds, so full parity is moot. |
| Code blocks | `copy-code-button`, Prism `.token.*` classes | **Skip.** We have no syntax highlighter. |
| Headings | `data-heading`, `heading-collapse-indicator` | Skip. |
| Properties drawer | `metadata-container`, `metadata-properties-heading`, `metadata-property`, `-key`, `-value`, `multi-select-pill` | **Maybe.** We could add these alongside our `ofm-*` classes, but Obsidian's property CSS is complex and editor-oriented, so pasted CSS would rarely just work. |

## Missing CSS variables

Variables we could adopt for values we currently hard-code, or rules we already have:

- `--code-radius` (we hard-code 4px and 6px)
- `--image-radius`
- `--h1-letter-spacing` through `--h6-letter-spacing`
- the `--highlight-*` family (#3 above)
- `--link-unresolved-color`, `-opacity`, `-decoration-style` and `-decoration-color`. SPEC 8.x already says a renderer SHOULD add `is-unresolved`, so a theme rule for it is cheap.
- `--table-header-border-color`/`-width`, `--table-row-alt-background`
- `--checkbox-color`, `--checkbox-border-color`, `--checkbox-radius`, if we style the checkbox (#5)

Not needed, because they belong to features we don't render: the `--color-base-*`/`--color-accent*` palette, `--code-keyword` and other syntax colors, `--metadata-*`/`--pill-*`, `--footnote-*` (mostly the editor), `--inline-title-*`, `--file-line-width`, `--indentation-guide-*` and `--embed-*`.

## Suggested batch

- #1–#7.
- The scoping note in the README.
- The variables to adopt, listed above.

It's mostly one-line class additions in `src/ofm-core.ts` and the footnote and inline renderers, plus SPEC Example 40 and the theme.
