import { defineConfig, transformWithEsbuild } from 'vite';

export default defineConfig({
  // Pre-bundling would give the lazily loaded font files (src/tex.ts) a second copy of the font class.
  optimizeDeps: { exclude: ['@mathjax/src', '@mathjax/mathjax-newcm-font'] },
  build: {
    outDir: 'demo-dist',
    rolldownOptions: { input: ['index.html', 'ofm-markdown.html'] },
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
