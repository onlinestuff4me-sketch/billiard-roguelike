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

/**
 * THE REPLACEMENT IS A FUNCTION, NOT A STRING, AND THAT IS NOT A STYLE CHOICE.
 *
 * `String.prototype.replace` interprets `$&`, `$\``, `$'` and `$1`..`$9` inside
 * a STRING replacement. Minified code is full of one-character identifiers,
 * and the day the minifier named one `$` this build shipped broken: three.js
 * emitted `iridescenceMapUv:$&&g(...)`, the `$&` in it was expanded to the
 * matched `</body>`, and 720 kB of JavaScript acquired a stray HTML tag in the
 * middle of it. The page threw `Unexpected token '<'` before a single line
 * ran, so the game never booted and every button on it was dead — which is
 * exactly how it was reported, and gives no hint at all about the cause.
 *
 * A function replacement is returned verbatim. Nothing in it is a pattern.
 */
const put = (haystack, needle, value) => haystack.replace(needle, () => value);

if (bodyOnly) {
  const head = stripRefs(/<head>(.*?)<\/head>/s.exec(doc)[1]);
  const body = stripRefs(/<body>(.*?)<\/body>/s.exec(doc)[1]);
  writeFileSync(htmlPath, [head.trim(), body.trim(), inline].join('\n'));
} else {
  writeFileSync(htmlPath, put(stripRefs(doc), '</body>', `${inline}\n</body>`));
}

// AND THEN PROVE IT. The failure above was silent: the build succeeded, the
// file was the right size, and the only symptom was a page that did nothing.
// Reading the script back out and comparing it to the bundle byte for byte is
// the check that would have caught it, so it runs on every build.
const written = readFileSync(htmlPath, 'utf8');
const open = written.lastIndexOf('<script type="module">');
const close = written.lastIndexOf('</script>');
const embedded = written.slice(open + '<script type="module">'.length, close).trim();
if (open < 0 || close < open || embedded !== js.trim()) {
  throw new Error(
    'inlined script does not match bundle.js byte for byte — the page would ' +
      'ship with corrupted JavaScript and boot into a dead screen'
  );
}

console.log(`inlined ${(js.length / 1024).toFixed(0)} kB into ${htmlPath}`);
