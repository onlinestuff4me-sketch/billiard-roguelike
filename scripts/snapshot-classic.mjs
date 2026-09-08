/**
 * Freeze a git ref's build into `public/classic/`, so the game can ship a
 * previous design alongside the current one.
 *
 * WHY A SNAPSHOT AND NOT A FLAG.
 *
 * `RULES.staticTable` is the switch for "does anything move on its own", and
 * it reads like the whole difference between the two designs. It is not. The
 * real-time build also had nine lessons instead of six, a goal bar, a gun on
 * the stripe balls, chain targets, doors to shoot through instead of buttons,
 * and no contract or stroke budget at all — two dozen commits of behaviour
 * that the current design removed rather than gated. Flipping the flag would
 * produce a hybrid that nobody designed and nobody has played.
 *
 * A previous design is a previous VERSION. So it is built from its own commit,
 * exactly as it shipped, and served as its own page. It cannot drift, it
 * cannot break when the live game changes, and it costs nothing to keep.
 *
 *   node scripts/snapshot-classic.mjs [ref]     # default: origin/main
 *
 * The output is committed, because Vercel builds one project from one repo and
 * a page it cannot build is a page it cannot serve. Re-run this only to move
 * the snapshot to a different commit.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ref = process.argv[2] || 'origin/main';
const root = resolve(import.meta.dirname, '..');
const out = join(root, 'public', 'classic');

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

const sha = git('rev-parse', '--short', ref);
const subject = git('log', '-1', '--format=%s', ref);
console.log(`snapshotting ${ref} (${sha}) — ${subject}`);

const work = mkdtempSync(join(tmpdir(), 'classic-'));
const tree = join(work, 'src');
try {
  git('worktree', 'add', '--detach', tree, ref);
  // The snapshot builds with the CURRENT dependency tree rather than its own.
  // Both refs pin the same major of three and vite, and a snapshot is a
  // rendering of source, not a re-creation of a machine from a year ago.
  execFileSync('ln', ['-s', join(root, 'node_modules'), join(tree, 'node_modules')]);
  execFileSync('npx', ['vite', 'build'], { cwd: tree, stdio: 'inherit' });

  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'assets'), { recursive: true });

  const dist = join(tree, 'dist');
  cpSync(join(dist, 'index.html'), join(out, 'index.html'));
  // The game page only. Source maps are three times the size of the code they
  // describe, and the table editor at /tool is a workshop, not a mode.
  for (const file of readdirSync(join(dist, 'assets'))) {
    if (file.endsWith('.map') || file.startsWith('tool-')) continue;
    cpSync(join(dist, 'assets', file), join(out, 'assets', file));
  }

  // A MODE HAS TO BE LEAVABLE. Without this the snapshot is a one-way door:
  // its own menu knows nothing about the game that now hosts it, so the only
  // way back would be the browser's back button, which is not a thing a player
  // on a phone in full screen reliably has.
  const back =
    '<a href="../" id="leave-mode" style="position:fixed;left:50%;top:8px;' +
    'transform:translateX(-50%);z-index:9999;padding:5px 13px;border-radius:999px;' +
    "font:600 11px/1 'Rajdhani',system-ui,sans-serif;letter-spacing:.14em;" +
    'text-transform:uppercase;text-decoration:none;color:#9aa6b2;' +
    'background:rgba(5,7,10,.72);border:1px solid rgba(234,246,255,.16);' +
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);">Leave mode</a>';

  const page = readFileSync(join(out, 'index.html'), 'utf8');
  if (!page.includes('</body>')) throw new Error('snapshot has no </body> to anchor the exit link to');
  // A FUNCTION REPLACEMENT, for the same reason scripts/inline.mjs uses one:
  // `$&` and friends are patterns inside a string replacement, and there is no
  // reason to leave that rake on the floor a second time.
  writeFileSync(
    join(out, 'index.html'),
    page.replace('</body>', () => `${back}\n</body>`)
  );

  writeFileSync(
    join(out, 'SNAPSHOT.txt'),
    `${ref} @ ${sha}\n${subject}\n\nBuilt by scripts/snapshot-classic.mjs. Do not edit by hand —\n` +
      're-run the script against a different ref to move the snapshot.\n'
  );
  console.log(`wrote ${out} from ${sha}`);
} finally {
  git('worktree', 'remove', '--force', tree);
  rmSync(work, { recursive: true, force: true });
}
