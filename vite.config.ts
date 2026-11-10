import { defineConfig, transformWithEsbuild } from 'vite';

export default defineConfig({
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
