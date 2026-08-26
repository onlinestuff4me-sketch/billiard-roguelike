import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * A one-file build of the game, for hosting somewhere that can only take a
 * single page (a shared preview link, an itch.io upload, an email attachment).
 *
 * Differences from the normal build: one JS chunk instead of a lazily-loaded
 * lesson chunk, no sourcemaps, and every asset inlined. `npm run build:single`
 * writes it to `dist-single/`, and `scripts/inline.mjs` folds the bundle into
 * the HTML so the result is genuinely one file.
 */
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: process.env.SINGLE_OUT || 'dist-single',
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      input: resolve(import.meta.dirname, 'index.html'),
      output: { inlineDynamicImports: true, entryFileNames: 'bundle.js' }
    }
  }
});
