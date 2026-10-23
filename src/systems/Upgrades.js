import { RULES } from '../config.js';
/**
 * Upgrades.js — what the shop sells between tables.
 *
 * CASH buys them (Rules.spend): $4–10 each, against a table that pays a few
 * dollars, so most shops you can afford one thing.
 *
 * Every upgrade changes how a shot SCORES or what a table gives you. Nothing
 * here changes the physics or the aim preview, because the preview never lies
 * (docs/DESIGN_BIBLE.md, law 7) and an upgrade that bent a ball's path would
 * have to bend the preview with it.
 *
 * Each entry:
 *   id, name     the card
 *   text         one line, as the player would say it
 *   rarity       'common' | 'rare' | 'epic', which sets its weight on the shelf
 *   price        price in $
 *   stack        true if it can be bought again
 *   consumable   used up when bought
 *   available    optional: false when buying it would do nothing (a full meter)
 *   apply(ctx)   does it: ctx = { rules, game, player, boons }
 *   unapply(ctx) undoes it when a purchase is taken back in the shop (perk
 *                numbers are undone for you)
 */

export const UPGRADES = [
  /* -- scoring: what each contact pays ------------------------------- */
  { id: 'soft-touch', name: 'Soft Touch', text: 'Each ball you touch and sink pays +5 more.', rarity: 'common', price: 5, perk: { perHit: 5 } },
  { id: 'long-rail', name: 'Long Rail', text: 'Each wall your ball takes: +1 more Mult.', rarity: 'common', price: 5, perk: { perBank: 1 } },
  { id: 'kiss-chase', name: 'Assist Ace', text: 'Each assist (ball into ball): +1 more Mult.', rarity: 'common', price: 5, perk: { perKiss: 1 } },
  { id: 'bank-vault', name: 'Bank Vault', text: 'Bank pots pay +2 more Mult.', rarity: 'common', price: 6, perk: { bankPot: 2 } },
  { id: 'doubles', name: 'Doubles', text: 'Each extra ball in one shot: +2 Mult.', rarity: 'common', price: 6, perk: { extraPot: 2 } },
  { id: 'heavy-numbers', name: 'Heavy Numbers', text: 'Balls pay 15 per number instead of 10.', rarity: 'rare', price: 8, perk: { perPip: 5 } },
  { id: 'prism', name: 'Prism', text: '× zones multiply by 3 instead of 2.', rarity: 'rare', price: 9, perk: { goldFactor: 1 } },

  /* -- scoring: where and what goes down ------------------------------ */
  { id: 'corner-office', name: 'Corner Office', text: 'A pot in a corner pocket: +3 Mult.', rarity: 'common', price: 6, perk: { corner: 3 } },
  { id: 'side-hustle', name: 'Side Hustle', text: 'A pot in a side pocket: +4 Mult.', rarity: 'common', price: 6, perk: { side: 4 } },
  { id: 'odd-ones', name: 'Odd Ones', text: 'Odd-numbered balls pay +25 points.', rarity: 'common', price: 5, perk: { odd: 25 } },
  { id: 'even-money', name: 'Even Money', text: 'Even-numbered balls pay +25 points.', rarity: 'common', price: 5, perk: { even: 25 } },
  { id: 'eight-ball', name: 'Eight Ball', text: 'Sinking the 8 doubles the shot’s Mult.', rarity: 'rare', price: 7, perk: { eight: 2 } },

  /* -- scoring: when ------------------------------------------------- */
  { id: 'opening-break', name: 'Opening Break', text: 'The first shot of every table: +3 Mult.', rarity: 'common', price: 6, perk: { opener: 3 } },
  { id: 'run-out', name: 'Run Out', text: 'Sinking the last ball doubles that Mult.', rarity: 'rare', price: 8, perk: { runout: 2 } },
  { id: 'hot-streak', name: 'Hot Streak', text: '+1 Mult per paying shot in a row.', rarity: 'epic', price: 10, perk: { streak: 1 } },
  { id: 'spare-change', name: 'Spare Change', text: 'Each unused shot pays +50 more points.', rarity: 'common', price: 5, perk: { savedStroke: 50 } },

  /* -- Freeze frame ---------------------------------------------------- */
  { id: 'ice-box', name: 'Ice Box', text: 'Start each table with half a Freeze charge.', rarity: 'rare', price: 7, perk: { icebox: 0.5 } },
  { id: 'frostbite', name: 'Frostbite', text: 'Combinations earn a whole Freeze charge.', rarity: 'rare', price: 7, perk: { frostbite: 1 } },

  /* -- the table ------------------------------------------------------- */
  {
    id: 'extra-shot', name: 'Extra Shot', text: '+1 shot on every table.', rarity: 'rare', price: 9, stack: true,
    apply: ({ game }) => { game.strokeBonus = (game.strokeBonus || 0) + 1; },
    unapply: ({ game }) => { game.strokeBonus = Math.max(0, (game.strokeBonus || 0) - 1); }
  },
  {
    id: 'bounce', name: 'Bounce', text: 'Your ball can take one more wall per shot.', rarity: 'common', price: 5, stack: true,
    apply: ({ boons }) => boons.addRunBonus({ maxBounces: 1 }),
    unapply: ({ boons }) => boons.addRunBonus({ maxBounces: -1 })
  },
  {
    id: 'extra-life', name: 'Extra Life', text: '+1 life (you can hold three).', rarity: 'rare', price: 8, stack: true, consumable: true,
    available: ({ rules }) => rules.lives < RULES.lives.max,
    apply: ({ rules }) => rules.gainLife(1),
    unapply: ({ rules }) => { rules.lives = Math.max(1, rules.lives - 1); }
  },
  {
    id: 'freeze-charge', name: 'Freeze Frame', text: '+1 Freeze frame charge, now.', rarity: 'common', price: 4, stack: true, consumable: true,
    available: ({ rules }) => rules.freezeCharges <= RULES.freeze.maxCharges - 1,
    apply: ({ rules }) => rules.grantFreeze(1),
    unapply: ({ rules }) => { rules.freezeCharges = Math.max(0, rules.freezeCharges - 1); }
  }
];

const WEIGHT = { common: 6, rare: 3, epic: 1 };

/** An upgrade's price at this table. */
export function priceAt(upgrade, level, growth) {
  return Math.round((upgrade.price * (1 + growth * Math.max(0, level - 1))) / 10) * 10;
}

/**
 * Roll a shelf: `count` different upgrades, weighted by rarity, never one the
 * run already owns unless it stacks.
 * @param {Set<string>} owned
 * @param {number} count
 * @param {() => number} rng
 */
export function rollShelf(owned, count, rng = Math.random) {
  const pool = UPGRADES.filter((u) => u.stack || !owned.has(u.id));
  const out = [];
  while (out.length < count && pool.length) {
    const total = pool.reduce((n, u) => n + WEIGHT[u.rarity], 0);
    let r = rng() * total;
    let pick = pool[pool.length - 1];
    for (const u of pool) {
      r -= WEIGHT[u.rarity];
      if (r <= 0) {
        pick = u;
        break;
      }
    }
    out.push(pick);
    pool.splice(pool.indexOf(pick), 1);
  }
  return out;
}

/** Apply a bought upgrade to the run. */
export function applyUpgrade(upgrade, ctx) {
  if (upgrade.perk) {
    for (const [k, v] of Object.entries(upgrade.perk)) ctx.rules.perks[k] = (ctx.rules.perks[k] || 0) + v;
  }
  upgrade.apply?.(ctx);
}

/** Undo an upgrade: a purchase taken back before leaving the shop. */
export function removeUpgrade(upgrade, ctx) {
  if (upgrade.perk) {
    for (const [k, v] of Object.entries(upgrade.perk)) {
      const left = (ctx.rules.perks[k] || 0) - v;
      if (left > 1e-9) ctx.rules.perks[k] = left;
      else delete ctx.rules.perks[k];
    }
  }
  upgrade.unapply?.(ctx);
}

/** What selling an upgrade gives back: half its price, rounded down. */
export const sellPrice = (upgrade) => Math.floor(upgrade.price / 2);
