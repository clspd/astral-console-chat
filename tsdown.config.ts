import { defineConfig } from 'tsdown'
import banner from './banner.mjs'

export default defineConfig({
  entry: {
    cli: './src/bootstrap.ts',
  },
  format: ['esm'],
  platform: 'node',
  outDir: 'dist',
  dts: {
    build: true,
  },
  deps: {
    onlyBundle: false,
    neverBundle: [],
  },
  outputOptions: {
    codeSplitting: false,
  },
  sourcemap: false,
  minify: true,
  clean: true,
  fixedExtension: false,
  banner: { js: banner },
})
