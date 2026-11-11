# obsidian-markdown

Render [Obsidian Flavored Markdown](SPEC.md) with [markdown-it](https://github.com/markdown-it/markdown-it), plus [Lit](https://lit.dev) web components for displaying notes and their properties.

```sh
npm install obsidian-markdown
```

## Renderer

The package's main entry is the renderer. It has no DOM or Lit dependency, so it runs in Node as well as the browser.

```js
import { render, parseFrontmatter } from 'obsidian-markdown';

const html = render(note); // front matter is skipped
const { data, content } = parseFrontmatter(note); // data is the parsed YAML properties
```

| Export | Description |
|---|---|
| `render(src, { strictLineBreaks? })` | Render a note to HTML. Single line breaks become `<br>` unless `strictLineBreaks` is set. |
| `renderer()` | A new markdown-it instance configured for Obsidian Flavored Markdown. |
| `config(md)` | Configure an existing markdown-it instance. Mutates and returns it. |
| `splitFrontmatter(text)` | `{ frontmatter, content }`, where `frontmatter` is the raw YAML (`''` if there is none). |
| `parseFrontmatter(text)` | `{ data, content }`, where `data` is the parsed YAML (`{}` if there is none). Throws on invalid YAML. |

Raw HTML in notes is escaped.

## Web components

Each component is its own module, and importing it registers the element. Import only what you use.

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

- **`value`**: the note's Markdown source.
- **`strict-line-breaks`**: a boolean attribute. When set, single line breaks don't become `<br>`.
- **`wikilink` event**: an internal link was clicked. `detail.target` is the link target.
- **`rendered` event**: the note has been rendered and drawn.

The note renders into the light DOM, so page styles apply. For an Obsidian-like look, adopt the optional theme:

```js
import { obsidianTheme } from 'obsidian-markdown/ofm-markdown-theme.js';
import { adoptSheet } from 'obsidian-markdown/adopt-sheet.js';

adoptSheet(obsidianTheme);
```

The theme uses Obsidian's CSS variable names (`--text-normal`, `--text-accent`, `--link-color`, …), so you can restyle it by setting those variables.

### `<ofm-frontmatter>`

```js
import 'obsidian-markdown/ofm-frontmatter.js';
```

An editable property list, like Obsidian's properties view.

- **`properties`**: the note's properties, as an object or JSON attribute.
- **`types`**: optional declared types per property: `text`, `number`, `checkbox`, `date`, `datetime` or `list`.
- **`readonly`**: a boolean attribute that disables editing.
- **`change` event**: a property was edited. `detail` is `{ key, value, properties }`.
- **`wikilink` event**: a link in a property value was clicked. `detail` is `{ key, target }`.

`<ofm-proprow>`, a single property row, is registered along with it.

A [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org) ships in `custom-elements.json` for editors and documentation tools.

## Bundling

The package ships unbundled ES modules with TypeScript declarations, and works with any bundler.

## License

MIT
