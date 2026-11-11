// The manifest is read from src, but the package ships dist, so point its paths at the published files.
const toDist = (path) => path.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js');

export default {
  globs: ['src/ofm-note.ts', 'src/ofm-markdown.ts', 'src/ofm-frontmatter.ts', 'src/ofm-proprow.ts'],
  litelement: true,
  plugins: [
    {
      name: 'dist-paths',
      packageLinkPhase({ customElementsManifest }) {
        for (const mod of customElementsManifest.modules) {
          mod.path = toDist(mod.path);
          for (const exp of mod.exports ?? []) {
            if (exp.declaration?.module) exp.declaration.module = toDist(exp.declaration.module);
          }
        }
      },
    },
  ],
};
