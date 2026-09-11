#!/usr/bin/env node
/**
 * check-scoring — the ladder pays for what happened, in the order it happened.
 *
 *   npm run scoring
 *
 * Rules.js is plain arithmetic with no renderer under it, so this is the one
 * check in the repo that needs no browser. It exists because of a report that
 * banks after a ball went down were "counting as extra multipliers".
 *
 * They were not being PAID — points are paid at the instant a ball drops, at
 * the multiplier standing then, and a rail hit afterwards has nothing left to
 * pay. But the stroke's ledger line reported the multiplier the ladder had
 * REACHED, and the run's best-multiplier stat recorded it too. The number the
 * player was shown was the number they were told they had been paid at, and it
 * was wrong. Which is the same bug as being paid wrongly, from where they sit.
 */
import { Rules } from '../src/systems/Rules.js';

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

const fresh = () => {
  const rules = new Rules();
  rules.startRoom?.(1);
  rules.beginStroke();
  return rules;
};

console.log('\nthe ladder\n');

// A bank before a pot is worth money, and that is deliberate.
{
  const plain = fresh();
  const potted = plain.pot(4);
  const banked = fresh();
  banked.bank();
  const after = banked.pot(4);
  check(after.value > potted.value, 'a bank before a pot pays more', `${potted.value} → ${after.value}`);
}

// A bank after the last pot pays nothing, and is not reported as if it had.
{
  const rules = fresh();
  const paid = rules.pot(4);
  for (let i = 0; i < 5; i += 1) rules.bank();
  const summary = rules.endStroke();
  check(summary.paid === paid.value, 'a bank after the last pot pays nothing', `${summary.paid}`);
  check(
    summary.multiplier === paid.multiplier,
    'and the stroke reports the multiplier it paid at',
    `paid ×${paid.multiplier}, reported ×${summary.multiplier}`
  );
  check(summary.banks === 0, 'and counts no banks it never earned on', `${summary.banks}`);
  check(
    rules.bestMultiplier === paid.multiplier,
    'and the run remembers only what it was paid at',
    `×${rules.bestMultiplier}`
  );
}

// Banks BETWEEN two pots are earned by the second one.
{
  const rules = fresh();
  rules.pot(2);
  rules.bank();
  rules.bank();
  const second = rules.pot(2);
  const summary = rules.endStroke();
  check(summary.banks === 2, 'banks between two pots are earned by the second', `${summary.banks}`);
  check(summary.multiplier === second.multiplier, 'and the report follows the last one paid');
}

console.log('');
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed\n`);
  process.exit(1);
}
console.log('the ladder pays for what happened\n');
