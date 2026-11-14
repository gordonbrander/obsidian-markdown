---
title: obsidian-markdown
github: https://github.com/gordonbrander/obsidian-markdown
license: https://github.com/gordonbrander/obsidian-markdown/blob/main/LICENSE-MIT
demos:
  - "[[ofm-note.html|ofm-note]]"
  - "[[ofm-markdown.html|ofm-markdown]]"
  - "[[ofm-frontmatter.html|ofm-frontmatter]]"
---
# obsidian-markdown

Display [Obsidian-flavored Markdown](https://obsidian.md/help/syntax) in your app or website:

- **Markdown renderer**: OFM plugin stack for [markdown-it](https://github.com/markdown-it/markdown-it).
- **Components**: lightweight web components that work with React, or any other framework.
- **Spec**: a full [specification](https://github.com/gordonbrander/obsidian-markdown/blob/main/SPEC.md) reverse-engineered from Obsidian, along with a complete test suite.

## Installing

```sh
npm install obsidian-markdown
```

## Basic use

```js
import { render } from 'obsidian-markdown';

const html = render(note);
```

| Export | Description |
|---|---|
| `render(src, { strictLineBreaks? })` | Render Markdown to HTML. Frontmatter is skipped. Single line breaks become `<br>` unless `strictLineBreaks` is set. |
| `renderer()` | Returns a new markdown-it instance configured for Obsidian Flavored Markdown. |
| `config(md)` | Configure an existing markdown-it instance. Mutates and returns it. |
| `splitFrontmatter(text)` | `{ frontmatter, content }`, where `frontmatter` is the raw frontmatter string (`''` if there is none). |
| `parseFrontmatter(text)` | `{ data, content }`, where `data` is the parsed YAML frontmatter (`{}` if there is none). Throws on invalid YAML. |

## Web components

`obsidian-markdown` offers several lightweight components for displaying an Obsidian-style Markdown viewer in your app or website. The components work in React, Svelte, Solid, Vue, or vanilla JS.

Each component ships as a separate module, and will only be included in your bundle if you import it. A [Custom Elements Manifest](https://custom-elements-manifest.open-wc.org) ships in `custom-elements.json` for editors and documentation tools.

### `<ofm-note>`

```js
// Import module to auto-register component
import 'obsidian-markdown/components/ofm-note.js';
```

```html
<ofm-note value="---
title: Hello
---
# Hello"></ofm-note>
```

Display a whole note: property drawer followed by rendered Markdown. It's built from `<ofm-frontmatter>` and `<ofm-markdown>`.

- Properties/attributes:
  - **`value`**: the note's source, front matter included.
  - **`types`**, **`readonly`**: passed to `<ofm-frontmatter>`.
  - **`strict-line-breaks`**: passed to `<ofm-markdown>`.
- Events:
  - **`proprow-change`**: a property was edited. Bubbles up from its `<ofm-proprow>`; `detail` is `{ key, value, type, effectiveType }`.
  - **`wikilink-click`**: a wikilink was clicked, in a property or the note. Bubbles up from `<ofm-frontmatter>` or `<ofm-markdown>`; `detail.target` is the link target.

The Properties drawer is hidden when a note has no properties. If the front matter isn't valid YAML, the properties are skipped and the note still renders.

### `<ofm-markdown>`

```js
import 'obsidian-markdown/components/ofm-markdown.js';
```

```html
<ofm-markdown value="# Hello

See [[Another note]]."></ofm-markdown>
```

Renders a note, drawing...

- Math as MathML with [Temml](https://temml.org/)
- Mermaid diagrams with [Pele](https://pele.run)
- Highlighted code blocks with Prism (common set, plus `jsx` and `tsx`)

The component is rendered in the light DOM so page styles apply. Rendered HTML and class names mirror Obsidian's reading view wherever feasible, allowing you to easily port styles from your Obsidian theme to the component.

- Properties/attributes:
  - **`value`**: the note's Markdown source.
  - **`strict-line-breaks`**: a boolean attribute. When set, single line breaks don't become `<br>`.
  - **`rendered`**: set by the element once its first content is in the DOM, with math and diagrams drawn. It stays set after that. Code highlighting and note embeds don't hold it back. Use it to fade in the first render:
    ```css
    ofm-markdown { transition: opacity 150ms; }
    ofm-markdown:not([rendered]) { opacity: 0; }
    ```
  - **`loaded`**: set while the current content is fully loaded, with code highlighted and note embeds filled. It's removed when new content starts rendering.
- Events:
  - **`wikilink-click`**: a wikilink was clicked. `detail.target` is the link target.
  - **`markdown-rendered`**: the new content is in the DOM, with math and diagrams drawn. Code highlighting and note embeds may still be loading.
  - **`markdown-loaded`**: the new content is fully loaded, with code highlighted and note embeds filled. It follows `markdown-rendered`, unless newer content replaces it first.

### `<ofm-frontmatter>`

```js
import 'obsidian-markdown/components/ofm-frontmatter.js';
```

An editable property list, like Obsidian's properties view.

- Properties/attributes:
  - **`properties`**: the note's properties, as an object or JSON attribute.
  - **`types`**: optional declared types per property, with Obsidian's type names: `text`, `multitext` (a list), `number`, `checkbox`, `date`, `datetime`, `tags` or `aliases`. Properties named `tags` and `aliases` get those types without being declared, as in Obsidian. A value that the declared type can't show without losing data keeps the type sniffed from it, and a value no type can show has the type `unknown`. A text value that is one wikilink or URL shows as a link.
  - **`readonly`**: a boolean attribute that disables editing.
- Events:
  - **`proprow-change`**: a property was edited. Bubbles up from its `<ofm-proprow>`; `detail` is `{ key, value, type, effectiveType }`. By then, `properties` holds the edit.
  - **`wikilink-click`**: a wikilink in a property value was clicked. `detail` is `{ key, target }`.

`<ofm-proprow>`, a single property row, is registered along with it. Each row has two attributes for styling:

- **`type`**: the declared type, if any.
- **`effective-type`**: the type the row actually draws, declared or sniffed from the value.

### `<ofm-context>`

`<ofm-context>` provides shared configuration and context to components.

```html
<ofm-context id="vault">
  <ofm-note></ofm-note>
  <ofm-markdown></ofm-markdown>
</ofm-context>
```

Think of `<ofm-context>` as the vault for your components. Vault-level settings and capabilities are all provided by the context.

- `noteService`: loads and caches vault notes when rendering transclusions/embeds (`![[Other note]]`, `![[Other note#Heading]]`, `![[Other note#^block-id]]`).
- `resolveIcon`: turns icon names into SVGs during component rendering. Uses Lucide icons by default.

Components that are not wrapped in a context draw Lucide icons and leave note embeds as placeholders.

You can customize the context by setting its properties. In React:

```jsx
// Load embedded notes from your server.
const noteService = new NoteService(async (name) => {
  // ...Load .md file from your server by name
});

// Customize icons
const resolveMaterialIcon = (id) => {
  // ...Get Material icon for id
};

export function Vault({ note }) {
  return (
    <ofm-context noteService={noteService} resolveIcon={resolveMaterialIcon}>
      <ofm-note value={note} />
    </ofm-context>
  );
}
```

Or in vanilla DOM:

```html
<ofm-context id="vault">
  <ofm-note></ofm-note>
</ofm-context>

<script type="module">
  const vault = document.querySelector('#vault');

  // Load embedded notes from your server.
  vault.noteService = new NoteService(async (name) => {
    // ...Load .md file from your server by name
  });

  // Customize icons
  vault.resolveIcon = (id) => {
    // ...Get Material icon for id
  };
</script>
```

### Custom providers

`<ofm-context>` provides two contexts from [`@lit/context`](https://lit.dev/docs/data/context/), `noteContext` and `iconContext`, exported from `obsidian-markdown/components/ofm-context.js`. You can provide either one yourself. Each is answered by the nearest provider of that context, so a provider of icons alone, inside an `<ofm-context>`, replaces the icons and keeps the context's notes.

### Using with frameworks

Components are standard custom elements, so you can use them from any framework. Import the module once to register the element, then pass properties and listen for events with your framework's syntax.

#### React

React 19+ sets properties on custom elements and listens to custom events through `on<event>` props. The event name is case-sensitive.

```jsx
import 'obsidian-markdown/components/ofm-note.js';

export function Note({ note }) {
  return (
    <ofm-note
      value={note}
      onwikilink-click={(event) => console.log(event.detail.target)}
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
    @wikilink-click="(event) => console.log(event.detail.target)"
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
  onwikilink-click={(event) => console.log(event.detail.target)}
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
      on:wikilink-click={(event) => console.log(event.detail.target)}
      on:proprow-change={(event) => console.log(event.detail)}
    />
  );
}
```

#### TypeScript

In TypeScript, React and Solid will reject `<ofm-*>` tags until you declare them in your app's `JSX.IntrinsicElements`.

### Styling components

All components render into the light DOM, with no shadow root, so page styles apply. Components are unstyled until you style them. For an Obsidian-like look, you can adopt the optional theme:

```js
import { obsidianTheme } from 'obsidian-markdown/ofm-theme.js';
import { adoptSheet } from 'obsidian-markdown/adopt-sheet.js';

adoptSheet(obsidianTheme);
```

#### CSS snippets from Obsidian

Rendered CSS variables and classes closely align with the HTML in Obsidian's reading view, so that CSS snippets from an Obsidian theme will typically work when copy/pasted:

```css
body { --h1-size: 3em; --accent-h: 120; }
.callout[data-callout="tip"] { --callout-icon: lucide-rocket; }
.metadata-property[data-property-key="tags"] { display: none; }
```

Where it differs from Obsidian:

- **Light and dark** follow `color-scheme`, through `light-dark()`. Obsidian's `theme-light` and `theme-dark` classes also work, on `body` or any ancestor of a component, and snippets scoped to them need one of them set.
- **Scope**: rules Obsidian applies to the whole app, such as `a` or `table`, apply only inside the components.
- **Math** is MathML drawn by Temml, not MathJax, so `mjx-*` snippets have nothing to match.
- **Folding**: foldable callouts and the properties list are `<details>` elements. Obsidian's `is-collapsed` class is kept in sync on them.
- **Links** are not resolved against a vault, so `is-unresolved` is never set on a link.
- **Not editable**: task checkboxes are disabled, property names can't be renamed, and there is no "Add property" button.
- **Icons**: only the icons Obsidian draws by default are built in. Another Lucide id in `--callout-icon` draws nothing unless your `resolveIcon` supplies it.
- **Image embeds** have the class `is-loaded` from the start, where Obsidian adds it once the image has loaded.

## License

MIT
