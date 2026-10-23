/**
 * Achievements.js — small goals a player ticks off across runs (from review:
 * "achievements in the other corner with a trophy icon and a badge with the
 * progression").
 *
 * Each one is earned once, on this device, the moment it happens; the home
 * screen's trophy shows how many are done. Replay tutorial does not reset
 * them: they are progress, not first-time teaching.
 */

const KEY = 'lightline-achievements-v1';

/** In the order a first run tends to meet them. */
export const ACHIEVEMENTS = [
  { id: 'lessons', name: 'Lesson Learned', text: 'Finish the two lessons.' },
  { id: 'table1', name: 'Off the Mark', text: 'Clear Table 1.' },
  { id: 'bank', name: 'Bank Job', text: 'Sink a ball that came off a rail.' },
  { id: 'assist', name: 'Assist', text: 'Knock one ball in with another.' },
  { id: 'inone', name: 'Two in One', text: 'Sink two balls in one shot.' },
  { id: 'zone', name: 'Double Up', text: 'Roll through the ×2 ring, then sink a ball.' },
  { id: 'buy', name: 'Shopper', text: 'Buy an upgrade in the shop.' },
  { id: 'freeze', name: 'Freeze Frame', text: 'Freeze the table mid-shot.' },
  { id: 'big', name: 'Big Shot', text: 'Score 300 or more in one shot.' },
  { id: 'order', name: 'In Order', text: 'Sink every ball on a table in order.' },
  { id: 'table6', name: 'Halfway', text: 'Clear Table 6.' },
  { id: 'table12', name: 'First Run', text: 'Clear Table 12.' }
];

export class Achievements {
  constructor() {
    this.done = new Set();
    try {
      for (const id of JSON.parse(localStorage.getItem(KEY) || '[]')) this.done.add(id);
    } catch {
      /* private mode: nothing remembered */
    }
    /** called with the achievement the moment one is earned */
    this.onUnlock = null;
  }

  has(id) {
    return this.done.has(id);
  }

  /** Earn one. Returns true the first time only. */
  unlock(id) {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a || this.done.has(id)) return false;
    this.done.add(id);
    try {
      localStorage.setItem(KEY, JSON.stringify([...this.done]));
    } catch {
      /* private mode */
    }
    this.onUnlock?.(a);
    return true;
  }

  get count() {
    return ACHIEVEMENTS.filter((a) => this.done.has(a.id)).length;
  }

  get total() {
    return ACHIEVEMENTS.length;
  }
}
