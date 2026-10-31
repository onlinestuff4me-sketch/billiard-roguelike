#!/usr/bin/env node
/**
 * check-scoring — Points × Mult pays for what happened, in the order it happened,
 * and only once a ball has dropped.
 *
 *   npm run scoring
 *
 * Rules.js is plain arithmetic with no renderer under it, so this is the one
 * check in the repo that needs no browser. It exists because of a report that
 * banks after a ball went down were "counting as extra multipliers".
 *
 * They were not being PAID — points are paid at the instant a ball drops, at
 * the multiplier standing then, and a rail hit afterward has nothing left to
 * pay. But the stroke's ledger line reported the multiplier the ladder had
 * REACHED, and the run's best-multiplier stat recorded it too. The number the
 * player was shown was the number they were told they had been paid at, and it
 * was wrong. Which is the same bug as being paid wrongly, from where they sit.
 */
import { Rules, missionFor, missionText, targetFor } from '../src/systems/Rules.js';
import { RULES } from '../src/config.js';
import { UPGRADES, rollShelf, applyUpgrade, removeUpgrade, sellPrice } from '../src/systems/Upgrades.js';

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

console.log('\npoints × mult\n');

// The worked example from the spec and the proposal demo: wall, zone, two
// contacts, the 5 down, the 3 banked down. 90 × 8 = 720.
{
  const rules = fresh();
  rules.bank();
  rules.gold();
  rules.hit(3);
  rules.hit(5);
  rules.pot(5);
  rules.pot(3, { banked: true });
  const out = rules.strokeResult();
  check(out.points === 90 && out.mult === 8, 'the worked example builds 90 points and ×8', `${out.points} × ${out.mult}`);
  check(out.paid === 720, 'and pays their product', `${out.paid}`);
  check(
    rules.events.map((e) => e.label).join(',') === 'WALL,ZONE,5 SUNK,3 SUNK,BANK,2 IN ONE',
    'and records every event in the order it happened',
    rules.events.map((e) => e.label).join(', ')
  );
}

// Order matters because the zone multiplies: a wall before it is doubled.
{
  const early = fresh();
  early.bank();
  early.gold();
  early.pot(3);
  const late = fresh();
  late.gold();
  late.bank();
  late.pot(3);
  check(early.strokeScore > late.strokeScore, 'a wall before the zone pays more than a wall after it', `${late.strokeScore} → ${early.strokeScore}`);
}

// Touching the same ball twice is one contact, so two balls cannot be rattled
// together for points; and a touch is paid with its ball, never on its own.
{
  const rules = fresh();
  rules.hit(3);
  rules.hit(3);
  check(rules.points === 0, 'a touch is not a number of its own', `${rules.points} points`);
  rules.pot(3);
  check(rules.points === 35, 'it pays +5 once, with the ball when it drops', `${rules.points} points`);
}

console.log('\nnothing counts until a ball drops\n');

// A stroke that sinks nothing pays nothing, however much it built.
{
  const rules = fresh();
  rules.bank();
  rules.gold();
  rules.hit(2);
  const out = rules.strokeResult();
  check(out.paid === 0 && !out.locked, 'a stroke with no pot pays 0', `${out.paid}`);
  check(out.takenBack.length === 2, 'and every event it built is taken back', `${out.takenBack.length} events`);
  const summary = rules.endStroke();
  check(summary.paid === 0 && rules.roomScore === 0, 'and the room banks nothing');
}

// A pot locks in everything up to it; whatever comes after is taken back.
{
  const rules = fresh();
  rules.bank();
  rules.hit(4);
  const paid = rules.pot(4);
  for (let i = 0; i < 5; i += 1) rules.bank();
  const out = rules.strokeResult();
  check(out.points === paid.points && out.mult === 2, 'walls after the last pot do not count', `${out.points} × ${out.mult}`);
  check(out.takenBack.length === 5 && out.takenBack.every((e) => e.kind === 'bank'), 'and are the events taken back', `${out.takenBack.length}`);
  const summary = rules.endStroke();
  check(summary.paid === 45 * 2, 'and the stroke pays what the pot locked', `${summary.paid}`);
  check(summary.banks === 1, 'counting only the walls it locked in', `${summary.banks}`);
  check(rules.bestMultiplier === 2, 'and the run remembers only what was locked', `×${rules.bestMultiplier}`);
}

// Walls BETWEEN two pots are locked in by the second one.
{
  const rules = fresh();
  rules.pot(2);
  rules.bank();
  rules.bank();
  rules.pot(2);
  const summary = rules.endStroke();
  check(summary.banks === 2, 'walls between two pots are locked by the second', `${summary.banks}`);
  check(summary.multiplier === 1 + 2 + 2, 'and the second pot adds the two-in-one bonus', `×${summary.multiplier}`);
}

// A scratch voids the stroke.
{
  const rules = fresh();
  rules.pot(3);
  rules.scratch();
  const summary = rules.endStroke();
  check(summary.paid === 0 && summary.voided, 'a scratch voids what was locked', `${summary.paid}`);
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

console.log('\nfreeze frame charges\n');

// Earned in halves, only by shots that paid, capped at three.
{
  const r = fresh();
  const paid = { paid: 300, voided: false, pots: 2, multiplier: 5 };
  const got = r.earnCharges(paid, 1);
  check(got.length === 3 && r.freezeCharges === 1.5, 'a combination, a second pot and ×5 each earn half a charge', `${r.freezeCharges}`);
  check(r.earnCharges({ paid: 0, voided: false, pots: 0, multiplier: 9 }, 2).length === 0, 'a shot that paid nothing earns nothing');
  check(r.earnCharges({ paid: 300, voided: true, pots: 2, multiplier: 9 }, 2).length === 0, 'nor does a voided one');
  check(!r.spendFreeze() || r.freezeCharges >= 0, 'a charge is spent whole');
  const half = fresh();
  half.grantFreeze(0.5);
  check(!half.spendFreeze(), 'half a charge does not freeze', `${half.freezeCharges}`);
  const cap = fresh();
  cap.grantFreeze(10);
  check(cap.freezeCharges === RULES.freeze.maxCharges && RULES.freeze.maxCharges === 3, 'charges stop at three', `${cap.freezeCharges}`);
  check(cap.earnCharges(paid, 1).length === 0, 'and a full meter earns nothing more');
}

// THE ECONOMY: points are each table's test; cash is what carries over.
{
  const r = fresh();
  check(r.target === targetFor(1) && targetFor(1) === RULES.target.base, 'the first table asks for the base target', `${r.target}`);
  check(targetFor(8) > targetFor(1) * 2, 'and the target grows table by table', `${targetFor(1)} → ${targetFor(8)}`);
  r.roomScore = 1005;
  r.strokesLeft = 2;
  r.cash = 7;
  r.roomScore -= 2 * r.val('savedStroke'); // endRoom adds the saved shots back
  const res = r.endRoom();
  const by = (id) => (res.payout.find((p) => p.id === id) || {}).amount || 0;
  check(res.beaten && by('beaten') === RULES.cash.beaten, 'beating the target pays its base', JSON.stringify(res.payout.map((p) => p.id)));
  check(by('shots') === 2 * RULES.cash.perShotLeft, 'and $1 per shot left');
  check(by('over') === Math.min(RULES.cash.overCap, Math.floor((res.roomScore / res.target - 1) / RULES.cash.overStep)), 'and more the further past the target', `${by('over')} at ${res.roomScore}/${res.target}`);
  check(by('interest') === 1, 'interest is $1 per $5 held coming in', `${by('interest')}`);
  check(res.cash === 7 + res.earned && res.lives === RULES.lives.start, 'cash goes up by exactly what was paid, and no life is lost');
  check(r.spend(5) && r.cash === res.cash - 5, 'the shop spends cash');
  check(!r.spend(1000) && !r.spend(0), 'and you cannot spend what you do not have, or nothing');

  const m = fresh();
  m.strokesLeft = 0;
  m.cash = 30;
  m.roomScore = 100;
  const miss = m.endRoom();
  check(!miss.beaten && miss.lives === RULES.lives.start - 1, 'missing the target costs a life');
  check(miss.payout.length === 1 && miss.payout[0].id === 'interest' && miss.payout[0].amount === RULES.cash.interestCap, 'and pays only interest, capped', JSON.stringify(miss.payout));
  check(m.gainLife() && m.lives === RULES.lives.start && !m.gainLife(), 'an extra life refills one, never past the cap');
}

// UPGRADES: each one changes what a shot pays, and only once bought.
{
  const pocket = (slot) => ({ at: { x: 0, z: 0, kind: 'pocket', ref: { slot } } });
  const base = fresh();
  base.bank();
  base.hit(3);
  base.pot(3, pocket('tl'));
  const plain = base.strokeResult();

  const r = fresh();
  applyUpgrade(UPGRADES.find((u) => u.id === 'long-rail'), { rules: r });
  applyUpgrade(UPGRADES.find((u) => u.id === 'soft-touch'), { rules: r });
  applyUpgrade(UPGRADES.find((u) => u.id === 'corner-office'), { rules: r });
  r.bank();
  r.hit(3);
  r.pot(3, pocket('tl'));
  const out = r.strokeResult();
  check(out.points === plain.points + 5, 'Soft Touch: a touched ball pays +5 more when it drops', `${plain.points} → ${out.points}`);
  check(out.mult === plain.mult + 1 + 3, 'Long Rail and Corner Office add their Mult', `${plain.mult} → ${out.mult}`);

  const side = fresh();
  applyUpgrade(UPGRADES.find((u) => u.id === 'corner-office'), { rules: side });
  side.pot(3, pocket('ml'));
  check(!side.events.some((e) => e.label === 'CORNER OFFICE'), 'Corner Office pays nothing in a side pocket');

  const eight = fresh();
  applyUpgrade(UPGRADES.find((u) => u.id === 'eight-ball'), { rules: eight });
  eight.pot(8);
  const e8 = fresh();
  e8.pot(8);
  check(eight.strokeResult().mult === e8.strokeResult().mult * 2, 'Eight Ball doubles the Mult of the shot that sinks the 8');

  const ice = new Rules();
  applyUpgrade(UPGRADES.find((u) => u.id === 'ice-box'), { rules: ice });
  ice.beginRoom(1, null);
  check(ice.freezeCharges === 0.5, 'Ice Box: every table starts with half a charge', `${ice.freezeCharges}`);

  const shelf = rollShelf(new Set(), RULES.shop.slots, () => 0.5);
  check(shelf.length === RULES.shop.slots && new Set(shelf.map((u) => u.id)).size === shelf.length, 'a shelf holds four different upgrades');
  const owned = new Set(UPGRADES.filter((u) => !u.stack).map((u) => u.id));
  check(rollShelf(owned, 4).every((u) => u.stack), 'and never one the run already owns, unless it stacks');
  check(UPGRADES.length >= 20, 'the pool is large enough to be a roguelike', `${UPGRADES.length}`);
  // hearts are the dear exception (round 11): a scoring card is $4–10, a heart up to $15
  const heart = (u) => u.id === 'extra-life' || u.id === 'spare-heart';
  check(UPGRADES.every((u) => u.price >= 4 && u.price <= (heart(u) ? 15 : 10)), 'every upgrade costs $4–10 (a heart up to $15)', UPGRADES.map((u) => u.price).join(','));
  // Shop cards are one fixed size (from review): a name fits one line and the
  // rule two, so a reroll never makes the grid jump.
  check(UPGRADES.every((u) => u.name.length <= 14 && u.text.length <= 46), 'every card fits its fixed size (name ≤ 14, rule ≤ 46 characters)', UPGRADES.filter((u) => u.name.length > 14 || u.text.length > 46).map((u) => u.id).join(',') || 'all fit');
  const ctx = { rules: fresh(), game: {}, boons: { addRunBonus() {} } };
  const rail = UPGRADES.find((u) => u.id === 'long-rail');
  applyUpgrade(rail, ctx);
  removeUpgrade(rail, ctx);
  check(!('perBank' in ctx.rules.perks) && sellPrice(rail) === Math.floor(rail.price / 2), 'selling undoes an upgrade and pays back half');
}

console.log('');
if (fails.length) {
  console.log(`${fails.length} check${fails.length === 1 ? '' : 's'} failed\n`);
  process.exit(1);
}
console.log('points × mult pays for what happened, and only once a ball drops\n');
