# obsidian-markdown

A [specification](SPEC.md), renderer, and complete test suite for [Obsidian-flavored Markdown](https://obsidian.md/help/syntax).

Ships with a spec-complete [markdown-it](https://github.com/markdown-it/markdown-it) renderer, as well as optional lightweight web components for displaying Obsidian-flavored Markdown and the Obsidian frontmatter property drawer.

```sh
npm install obsidian-markdown
```

## Basic use

```js
import { render, parseFrontmatter } from 'obsidian-markdown';

const html = render(note); // front matter is skipped
const { data, content } = parseFrontmatter(note); // data is the parsed YAML properties
```

| Export | Description |
|---|---|
| `render(src, { strictLineBreaks? })` | Render a note to HTML. Single line breaks become `<br>` unless `strictLineBreaks` is set. |
| `renderer()` | Returns a new markdown-it instance configured for Obsidian Flavored Markdown. |
| `config(md)` | Configure an existing markdown-it instance. Mutates and returns it. |
| `splitFrontmatter(text)` | `{ frontmatter, content }`, where `frontmatter` is the raw YAML (`''` if there is none). |
| `parseFrontmatter(text)` | `{ data, content }`, where `data` is the parsed YAML (`{}` if there is none). Throws on invalid YAML. |

Raw HTML in notes is escaped.

## Web components

`obsidian-markdown` offers several lightweight components for displaying Obsidian-flavored markdown in your app. The components ship as lightweight web components that will happily work within your framework of choice. Each component ships as a separate module, and will only be included in your bundle if you import it. Importing a module registers the element.

A [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org) ships in `custom-elements.json` for editors and documentation tools.

### `<ofm-note>`

```js
import 'obsidian-markdown/ofm-note.js';
```

```html
<ofm-note value="---
title: Hello
---
# Hello"></ofm-note>
```

Display a whole note: property drawer followed by rendered Markdown. It's built from `<ofm-frontmatter>` and `<ofm-markdown>`, and importing it registers both.

- Properties/attributes:
  - **`value`**: the note's source, front matter included.
  - **`types`**, **`readonly`**: passed to `<ofm-frontmatter>`.
  - **`strict-line-breaks`**: passed to `<ofm-markdown>`.
- Events:
  - **`change`**: a property was edited. Bubbles up from `<ofm-frontmatter>`; `detail` is `{ key, value, properties }`.
  - **`wikilink`**: a link was clicked, in a property or the note. Bubbles up from `<ofm-frontmatter>` or `<ofm-markdown>`; `detail.target` is the link target.

The Properties drawer is hidden when the note has no properties. If the front matter isn't valid YAML, the properties are skipped with a console warning and the note still renders.

### `<ofm-markdown>`

```js
import 'obsidian-markdown/ofm-markdown.js';
```

```html
<ofm-markdown></ofm-markdown>
<script type="module">
  const note = document.querySelector('ofm-markdown');
  note.value = '# Hello\n\nSee [[Another note]].';
  note.addEventListener('wikilink', (event) => console.log(event.detail.target));
</script>
```

Renders a note, drawing math (MathJax) and Mermaid diagrams. Both libraries load on demand, only when a note contains math or a diagram.

- Properties/attributes:
  - **`value`**: the note's Markdown source.
  - **`strict-line-breaks`**: a boolean attribute. When set, single line breaks don't become `<br>`.
- Events:
  - **`wikilink`**: an internal link was clicked. `detail.target` is the link target.
  - **`rendered`**: the note has been rendered and drawn.

### `<ofm-frontmatter>`

```js
import 'obsidian-markdown/ofm-frontmatter.js';
```

An editable property list, like Obsidian's properties view.

- Properties/attributes:
  - **`properties`**: the note's properties, as an object or JSON attribute.
  - **`types`**: optional declared types per property: `text`, `number`, `checkbox`, `date`, `datetime` or `list`.
  - **`readonly`**: a boolean attribute that disables editing.
- Events:
  - **`change`**: a property was edited. `detail` is `{ key, value, properties }`.
  - **`wikilink`**: a link in a property value was clicked. `detail` is `{ key, target }`.

`<ofm-proprow>`, a single property row, is registered along with it.

### Styling components

`<ofm-note>` and `<ofm-markdown>` render into the light DOM, so page styles apply. For an Obsidian-like look, adopt the optional theme:

```js
import { obsidianTheme } from 'obsidian-markdown/ofm-theme.js';
import { adoptSheet } from 'obsidian-markdown/adopt-sheet.js';

adoptSheet(obsidianTheme);
```

The theme uses Obsidian's CSS variable names (`--text-normal`, `--text-accent`, `--link-color`, …), so you can restyle it by setting those variables.

## License

MIT
