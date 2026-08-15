import { defineConfig } from 'vite';

/**
 * Vite configuration for the Billiard Roguelike prototype.
 *
 * `base: './'` keeps the production build portable (itch.io zips, GitHub Pages
 * sub-paths, plain file servers) instead of hard-coding an absolute root.
 * `server.host: true` exposes the dev server on the LAN so the portrait build
 * can be tested on a real phone, which is where the touch feel actually matters.
 */
export default defineConfig({
  base: './',
  server: {
    host: true,
    port: 5173,
    open: false
  },
  preview: {
    host: true,
    port: 4173
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1200
  }
});
