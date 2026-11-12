import { resolve } from 'node:path';
import { defineConfig, transformWithEsbuild } from 'vite';

const examples = (page: string) => resolve(import.meta.dirname, 'examples', page);

export default defineConfig({
  root: 'examples',
  // Relative asset URLs, so the build works under GitHub Pages' /obsidian-markdown/ subpath.
  base: './',
  // Pre-bundling would give the lazily loaded font files (src/tex.ts) a second copy of the font class.
  optimizeDeps: { exclude: ['@mathjax/src', '@mathjax/mathjax-newcm-font'] },
  // The example pages load the library as /src/..., which lives beside the root, not in it.
  resolve: { alias: [{ find: /^\/src\//, replacement: `${resolve(import.meta.dirname, 'src')}/` }] },
  build: {
    outDir: 'dist',
    rolldownOptions: { input: ['index.html', 'ofm-note.html', 'ofm-markdown.html', 'ofm-frontmatter.html'].map(examples) },
  },
  plugins: [
    {
      // ponytail: Oxc passes standard decorators through and browsers reject them. Delete once Oxc lowers them.
      name: 'lower-standard-decorators',
      enforce: 'pre',
      transform(code, id) {
        if (!/\/src\/[^?]*\.ts(\?|$)/.test(id)) return;
        return transformWithEsbuild(code, id, { loader: 'ts', target: 'es2022' });
      },
    },
  ],
});
