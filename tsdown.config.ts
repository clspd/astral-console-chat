import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    cli: './src/cli.tsx',
  },
  format: ['esm'],
  platform: 'node',
  outDir: 'dist',
  dts: {
    build: true,
  },
  deps: {
    onlyBundle: false,
    neverBundle: ["react-devtools-core"],
  },
  sourcemap: true,
  minify: true,
  clean: true,
  fixedExtension: false,
});
