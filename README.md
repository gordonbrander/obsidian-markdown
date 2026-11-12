---
title: obsidian-markdown
github: https://github.com/gordonbrander/obsidian-markdown
license: https://github.com/gordonbrander/obsidian-markdown/blob/main/LICENSE-MIT
demos:
  - "[[ofm-note.html|ofm-note]]"
  - "[[ofm-markdown.html|ofm-markdown]]"
  - "[[ofm-frontmatter.html|ofm-frontmatter]]"
  - "[[ofm-markdown-editor.html|ofm-markdown-editor]]"
---
# obsidian-markdown

A [specification](https://github.com/gordonbrander/obsidian-markdown/blob/main/SPEC.md), renderer, and complete test suite for [Obsidian-flavored Markdown](https://obsidian.md/help/syntax).

Ships with a spec-complete [markdown-it](https://github.com/markdown-it/markdown-it) renderer, as well as some optional lightweight web components for displaying Obsidian-flavored Markdown.

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
import 'obsidian-markdown/components/ofm-note.js';
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
  - **`proprow-change`**: a property was edited. Bubbles up from its `<ofm-proprow>`; `detail` is `{ key, value, type, effectiveType }`.
  - **`click-wikilink`**: a wikilink was clicked, in a property or the note. Bubbles up from `<ofm-frontmatter>` or `<ofm-markdown>`; `detail.target` is the link target.

The Properties drawer is hidden when the note has no properties. If the front matter isn't valid YAML, the properties are skipped with a console warning and the note still renders.

### `<ofm-markdown>`

```js
import 'obsidian-markdown/components/ofm-markdown.js';
```

```html
<ofm-markdown></ofm-markdown>
<script type="module">
  const note = document.querySelector('ofm-markdown');
  note.value = '# Hello\n\nSee [[Another note]].';
  note.addEventListener('click-wikilink', (event) => {
    event.preventDefault(); // Route the link yourself instead of following its href.
    console.log(event.detail.target);
  });
</script>
```

Renders a note, drawing math (MathJax) and Mermaid diagrams, and highlighting code blocks with Prism's grammars (via refractor's common set, plus `jsx` and `tsx`; `svelte` and `vue` highlight as HTML), so Obsidian snippets that style `.token.*` or `--code-*` apply. Each library loads on demand, only when a note contains math, a diagram or a code block with a language.

- Properties/attributes:
  - **`value`**: the note's Markdown source.
  - **`strict-line-breaks`**: a boolean attribute. When set, single line breaks don't become `<br>`.
  - **`rendered`**: set by the element once its first content is in the DOM and drawn. It stays set after that. Use it to fade in the first render:
    ```css
    ofm-markdown { transition: opacity 150ms; }
    ofm-markdown:not([rendered]) { opacity: 0; }
    ```
- Events:
  - **`click-wikilink`**: a wikilink was clicked. `detail.target` is the link target.
  - **`rendered`**: the new content is in the DOM and drawn.

### `<ofm-frontmatter>`

```js
import 'obsidian-markdown/components/ofm-frontmatter.js';
```

An editable property list, like Obsidian's properties view.

- Properties/attributes:
  - **`properties`**: the note's properties, as an object or JSON attribute.
  - **`types`**: optional declared types per property: `text`, `number`, `checkbox`, `link`, `date`, `datetime`, `list` or `object`. A value that the declared type can't show without losing data keeps the type sniffed from it.
  - **`readonly`**: a boolean attribute that disables editing.
- Events:
  - **`proprow-change`**: a property was edited. Bubbles up from its `<ofm-proprow>`; `detail` is `{ key, value, type, effectiveType }`. By then, `properties` holds the edit.
  - **`click-wikilink`**: a wikilink in a property value was clicked. `detail` is `{ key, target }`.

`<ofm-proprow>`, a single property row, is registered along with it. Each row has two attributes for styling:

- **`type`**: the declared type, if any.
- **`effective-type`**: the type the row actually draws, declared or sniffed from the value.

### `<ofm-markdown-editor>`

```js
import 'obsidian-markdown/components/ofm-markdown-editor.js';
```

```html
<ofm-markdown-editor value="# Hello" mode="live"></ofm-markdown-editor>
```

A [CodeMirror 6](https://codemirror.net) editor that looks and works like Obsidian's. Live Preview is the default: formatting hides unless the cursor touches it, and callouts, tables, math, Mermaid diagrams, embeds and Properties render in place until you click into them. Source mode shows the styled Markdown. The editor uses Obsidian's class names (`.markdown-source-view.mod-cm6`, `.HyperMD-*`, `.cm-formatting-*`…), so Obsidian theme snippets for the editor apply.

- Properties/attributes:
  - **`value`**: the whole note, front matter included. Setting it replaces the document without firing `input`.
  - **`mode`**: `live` (default) or `source`.
  - **`readonly`**: a boolean attribute that disables editing.
  - **`readable-line-width`**: on by default. Set it to `"false"` to use the full width.
  - **`spellcheck`**, **`placeholder`**: passed to the editable area.
  - **`completions`** (property only): `(query, kind) => Promise<string[]>`, where `kind` is `'link'` or `'tag'`. Powers `[[` and `#` autocomplete. With no callback there's no popup.
  - **`view`** (read-only property): the CodeMirror `EditorView`.
- Events:
  - **`input`**: the document changed. `detail.value` is the whole note.
  - **`change`**: on blur, when the text changed since focus.
  - **`click-wikilink`**: a wikilink was clicked: a plain click in Live Preview, Cmd/Ctrl-click in Source mode. `detail.target` is the link target. Cancelable.
  - **`proprow-change`**: a property was edited. The editor has already rewritten the front matter, keeping YAML comments and key order.
  - **`toggle-reading`**: Mod-E asked for Reading view, as it does in Obsidian. Show the note in `<ofm-note>`. `detail.value` is the whole note.

Note embeds (`![[Other note]]`, `![[Other note#Heading]]`, `![[Other note#^block-id]]`) load through a loader you register once per page. The loader gets the note's name and returns its source, or `null` if it doesn't exist. Embeds nest up to four deep, and cycles stop. Results are cached until you call `setNoteLoader` again or `OfmMarkdownEditor.invalidateNote(name)`.

```js
import { OfmMarkdownEditor } from 'obsidian-markdown/components/ofm-markdown-editor.js';

OfmMarkdownEditor.setNoteLoader(async (name) => {
  const response = await fetch(`/notes/${encodeURIComponent(name)}.md`);
  return response.ok ? response.text() : null;
});
```

Keys follow Obsidian 1.15's defaults: Enter continues lists, tasks, quotes and callouts; Tab and Shift-Tab indent list items with their children; Mod-B, Mod-I and Mod-K format; Mod-L toggles a checkbox; Mod-/ toggles a `%%` comment; Mod-E asks for Reading view; Mod-F opens a find bar like Obsidian's, which searches as you type; Mod-Alt-F (macOS) or Mod-H adds its replace row; Mod-D selects the next occurrence; Alt-Up and Alt-Down move lines; Alt-click adds a cursor. Like Obsidian, there's no default key for Live Preview ↔ Source mode. Set `mode` yourself. Typing `*`, `_`, `=`, `$`, `~` or `` ` `` with text selected wraps it.

Tables are edited as source: click a rendered table to reveal its Markdown. The editor loads about 240 KB gzipped up front (710 KB minified), including the 90 KB of rendering code the reading components share. CodeMirror is most of the rest. Code-block languages, MathJax and Mermaid load on demand.

### Using with frameworks

The components are standard custom elements, so you can use them from any framework. Import the module once to register the element, then pass properties and listen for events with your framework's syntax.

`<ofm-markdown-editor>` works the same way. Bind `value` and update it from the `input` event's `detail.value`. Passing back the text the editor already holds does nothing, so the cursor stays put. `completions` is a function, so pass it as a property, not an attribute.

#### React

React 19+ sets properties on custom elements and listens to custom events through `on<event>` props. The event name is case-sensitive.

```jsx
import 'obsidian-markdown/components/ofm-note.js';

export function Note({ note }) {
  return (
    <ofm-note
      value={note}
      onclick-wikilink={(event) => console.log(event.detail.target)}
      onproprow-change={(event) => console.log(event.detail)}
    />
  );
}
```

React 18 and earlier don't do this. Set properties and add listeners yourself through a `ref`.

#### Vue

Tell Vue's compiler that `ofm-` tags are custom elements:

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: { isCustomElement: (tag) => tag.startsWith('ofm-') },
      },
    }),
  ],
});
```

```vue
<script setup>
import 'obsidian-markdown/components/ofm-note.js';

defineProps(['note']);
</script>

<template>
  <ofm-note
    :value="note"
    @click-wikilink="(event) => console.log(event.detail.target)"
    @proprow-change="(event) => console.log(event.detail)"
  />
</template>
```

Vue passes bound values as properties when the element has them, so `:properties="{ title: 'Hello' }"` on `<ofm-frontmatter>` passes the object as-is.

#### Svelte

No setup needed in Svelte 5:

```svelte
<script>
  import 'obsidian-markdown/components/ofm-note.js';

  let { note } = $props();
</script>

<ofm-note
  value={note}
  onclick-wikilink={(event) => console.log(event.detail.target)}
  onproprow-change={(event) => console.log(event.detail)}
></ofm-note>
```

#### Solid

Use `prop:` to set properties and `on:` to listen for events. `on:` keeps the event name exactly as written.

```jsx
import 'obsidian-markdown/components/ofm-note.js';

export function Note(props) {
  return (
    <ofm-note
      prop:value={props.note}
      on:click-wikilink={(event) => console.log(event.detail.target)}
      on:proprow-change={(event) => console.log(event.detail)}
    />
  );
}
```

#### TypeScript

In TypeScript, React and Solid will reject `<ofm-*>` tags until you declare them in your app's `JSX.IntrinsicElements`.

### Styling components

All components render into the light DOM, with no shadow root, so page styles apply. They're unstyled until you style them. For an Obsidian-like look, adopt the optional theme:

```js
import { obsidianTheme } from 'obsidian-markdown/ofm-theme.js';
import { adoptSheet } from 'obsidian-markdown/adopt-sheet.js';

adoptSheet(obsidianTheme);
```

The theme uses Obsidian's CSS variable names (`--text-normal`, `--text-accent`, `--link-color`, …), so you can restyle it by setting those variables.

`<ofm-markdown-editor>` has its own sheet, which builds on the variables in `obsidianTheme`. Adopt both:

```js
import { obsidianEditorTheme } from 'obsidian-markdown/ofm-editor-theme.js';

adoptSheet(obsidianTheme);
adoptSheet(obsidianEditorTheme);
```

It adds editor variables of its own: `--file-line-width`, `--file-margins`, `--caret-color`, `--text-selection` and `--list-indent-editing`.

## License

MIT
