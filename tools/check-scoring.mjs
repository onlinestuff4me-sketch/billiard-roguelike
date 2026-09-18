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
import { Rules, missionFor, missionText } from '../src/systems/Rules.js';

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

/**
 * A room, actually begun. This used to call `rules.startRoom?.(1)` — a method
 * that does not exist — so every check below was quietly measuring the state
 * the constructor happens to leave behind rather than a room the game would
 * ever deal. It passed anyway, which is the problem with an optional call to a
 * name nobody owns.
 */
const fresh = (opts = {}) => {
  const rules = new Rules();
  rules.beginRoom(opts.level ?? 1, opts.mission ?? null);
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

console.log('\nthe order\n');

// The rack of room 1 is 1, 2, 3, 8 — ascending, which puts the 8 last on its
// own. Taking them in that order is worth more than taking the same balls in
// any other, and that is the whole mechanic.
{
  const ordered = fresh();
  for (const n of [1, 2, 3, 8]) ordered.pot(n);
  const jumbled = fresh();
  for (const n of [3, 1, 2, 8]) jumbled.pot(n);
  check(
    ordered.strokeScore > jumbled.strokeScore,
    'the same four balls pay more in order',
    `${jumbled.strokeScore.toLocaleString()} → ${ordered.strokeScore.toLocaleString()}`
  );
}

// The streak is what grows, and it is capped so a long rack cannot run away.
{
  const rules = fresh({ level: 9 });
  const got = [1, 2, 3, 4, 5].map((n) => rules.pot(n).rungs);
  check(
    got.join(',') === '1,2,3,3,3',
    'the streak grows and then stops growing',
    `+${got.join(' +')}`
  );
}

// Breaking the order costs the streak and nothing else: the ball still pays.
{
  const rules = fresh({ level: 9 });
  rules.pot(1);
  rules.pot(2);
  const broke = rules.pot(5);
  check(broke.value > 0, 'a ball out of order still pays', `${broke.value.toLocaleString()}`);
  check(rules.orderStreak === 0, 'but the streak goes back to nothing');
  check(rules.pot(3).streak === 1, 'and the next one in order starts a new run');
}

// The clean sweep is a line on the scorecard, not a silent adjustment.
{
  const rules = fresh();
  for (const n of [1, 2, 3, 8]) rules.pot(n);
  rules.endStroke();
  const out = rules.endRoom();
  check(out.swept && out.sweepBonus > 0, 'a rack swept in order pays a sweep bonus', `${out.sweepBonus}`);
  check(
    rules.ledger.some((l) => l.id === 'sweep'),
    'and the scorecard says so on its own line'
  );
}
{
  const rules = fresh();
  for (const n of [3, 1, 2, 8]) rules.pot(n);
  rules.endStroke();
  const out = rules.endRoom();
  check(!out.swept && out.sweepBonus === 0, 'one ball out of place and there is no sweep');
}

console.log('\nthe order, made strict\n');

// Strict order is the same rule at full strength: out of turn is a foul, the
// way an early 8 is. It is never on unless a mode asked for it.
{
  const loose = fresh();
  check(loose.foulReason(3) === null, 'by default a ball out of order is legal');
  check(loose.mission.strictOrder === false, 'and strict order is off unless asked for');

  const strict = fresh({ mission: { strictOrder: true } });
  check(strict.foulReason(3) === 'order', 'under strict order it is a foul', `next is ${strict.nextInOrder}`);
  check(strict.foulReason(1) === null, 'and the next ball in order is not');
  check(missionText(strict.mission) === 'SINK ALL 4 · IN ORDER', 'and the mission line says so', missionText(strict.mission));
}

// The 8-last rule is this same order made mandatory for one ball, so it has to
// keep holding on its own from room 5.
{
  const eight = fresh({ level: 5 });
  check(missionFor(5).eightLast === true, 'the 8 goes last from room 5');
  check(eight.foulReason(8) === 'eight', 'and potting it early is still a foul');
  check(eight.foulReason(2) === null, 'while everything else stays legal');
}

console.log('');
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed\n`);
  process.exit(1);
}
console.log('the ladder pays for what happened\n');
