/**
 * Fold `dist-single/bundle.js` into `dist-single/index.html` so the build is
 * one self-contained file with no requests of its own.
 *
 * Run after `vite build --config vite.single.mjs`; `npm run build:single` does
 * both. Pass `--body-only` to emit page content without the document shell,
 * for hosts that supply their own <head> and <body>.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = process.env.SINGLE_OUT || 'dist-single';
const bodyOnly = process.argv.includes('--body-only');
const htmlPath = resolve(dir, 'index.html');

const doc = readFileSync(htmlPath, 'utf8');
const js = readFileSync(resolve(dir, 'bundle.js'), 'utf8');

if (js.includes('</script>')) {
  throw new Error('bundle contains a literal </script> and would close its own tag');
}

const stripRefs = (chunk) =>
  chunk
    .replace(/<script[^>]*src=[^>]*>\s*<\/script>/gs, '')
    .replace(/<link[^>]*rel="modulepreload"[^>]*>/gs, '');

const inline = `<script type="module">\n${js}\n</script>`;

if (bodyOnly) {
  const head = stripRefs(/<head>(.*?)<\/head>/s.exec(doc)[1]);
  const body = stripRefs(/<body>(.*?)<\/body>/s.exec(doc)[1]);
  writeFileSync(htmlPath, [head.trim(), body.trim(), inline].join('\n'));
} else {
  writeFileSync(htmlPath, stripRefs(doc).replace('</body>', `${inline}\n</body>`));
}

console.log(`inlined ${(js.length / 1024).toFixed(0)} kB into ${htmlPath}`);
