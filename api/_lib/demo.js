/**
 * Made-up sessions in the real event format, so the dashboard can be seen
 * (/dashboard.html?demo=1) before storage exists, and so the metrics have
 * something non-trivial to chew on in tools/check-analytics.mjs.
 * Deterministic for a given day.
 */

const DAY = 24 * 3600 * 1000;
const LESSONS = ['angle', 'combo'];
const TABLE_NAMES = ['First Light', 'Side Door', 'Two Lanes', 'The Gate', 'Cross Fire', 'Ice Field', 'Deep Six', 'Bank Job', 'Tight Lines', 'Zone Out', 'Last Call', 'Lightline'];

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function demoData(now = Date.now(), players = 46) {
  const r = rng(Math.floor(now / DAY));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const hex = (n) => Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join('');
  const sessions = [];
  const index = {};

  for (let p = 0; p < players; p++) {
    const pid = hex(20);
    const dev = r() < 0.75 ? { os: pick(['iOS', 'iOS', 'Android']), br: pick(['Safari', 'Chrome', 'Chrome', 'Samsung']), touch: 1, mob: 1, vw: pick([375, 390, 393, 412, 430]), vh: pick([667, 844, 852, 915, 932]) } : { os: pick(['macOS', 'Windows']), br: pick(['Chrome', 'Safari', 'Firefox', 'Edge']), touch: 0, mob: 0, vw: 1440, vh: 820 };
    const ref = pick(['', '', '', 't.co', 'discord.com', 'wa.me']);
    const geo = pick([{ city: 'San Francisco', region: 'CA', country: 'US' }, { city: 'Oakland', region: 'CA', country: 'US' }, { city: 'Los Angeles', region: 'CA', country: 'US' }, { city: 'Seattle', region: 'WA', country: 'US' }, { city: 'Portland', region: 'OR', country: 'US' }, { city: 'New York', region: 'NY', country: 'US' }, { city: 'London', region: 'ENG', country: 'GB' }, { city: 'Toronto', region: 'ON', country: 'CA' }]);
    let t = now - Math.floor(r() * 13.5 * DAY) - 3600 * 1000;
    let tutDone = false;
    let skill = 0.55 + r() * 0.4;
    let runLevel = 0;
    let sessionsLeft = r() < 0.55 ? 1 : 1 + Math.floor(r() * 5);
    let visit = 0;
    while (sessionsLeft-- > 0 && t < now - 60000) {
      visit += 1;
      const sid = hex(20);
      const t0 = t;
      const ev = [];
      const add = (e, data = {}, dt = 0) => {
        t += dt;
        ev.push({ e, ts: Math.round(t), ...data });
      };
      add('session_start', { nav: 'navigate', ret: visit > 1 ? 1 : 0, prior: 0, visits: visit, ...dev, dpr: dev.touch ? 3 : 2, ref: visit === 1 ? ref : '', tutDone: tutDone ? 1 : 0 });
      add('boot', { ms: 800 + Math.floor(r() * 1400) }, 900);
      if (r() < 0.08) {
        add('leave', { at: 'menu', dur: 6 }, 4000 + r() * 8000);
      } else {
        add('play_pressed', { tut: tutDone ? 1 : 0 }, 2500 + r() * 9000);
        let alive = true;
        if (!tutDone) {
          add('tut_start', {}, 200);
          if (r() < 0.12) {
            add('lesson_start', { ls: 'angle', li: 0, of: 2 }, 300);
            add('lesson_skip', { ls: 'angle', li: 0, ms: 4000, shots: 0, cancels: 1 }, 4000);
            add('tut_skip', { ms: 4200, ls: 'angle', li: 0 }, 10);
            tutDone = true;
          } else {
            for (let li = 0; li < LESSONS.length && alive; li++) {
              const ls = LESSONS[li];
              add('lesson_start', { ls, li, of: 2 }, 400);
              const ls0 = t;
              const shots = 1 + Math.floor(r() * (li ? 5 : 3));
              let cancels = 0;
              const quit = r() < (li ? 0.22 : 0.1);
              for (let k = 0; k < shots; k++) {
                const c = Math.floor(r() * (li ? 3.4 : 1.8));
                for (let j = 0; j < c; j++) add('cancel', { ms: 600 + Math.floor(r() * 2500), ls }, 1500 + r() * 3000);
                cancels += c;
                add('shot', { ls, n: k + 1, pw: Math.round((0.4 + r() * 0.6) * 100) / 100, aimMs: 1200 + Math.floor(r() * 5000), cancels: c || undefined, pots: k === shots - 1 && !quit ? 1 : 0, dur: 2600 }, 2500 + r() * 6000);
              }
              if (quit) {
                if (r() < 0.4) add('hidden', { at: 'lesson', ls, li }, 3000);
                add('leave', { at: 'lesson', ls, li, dur: Math.round((t - t0) / 1000), shots, cancels }, 2000);
                alive = false;
                sessionsLeft = r() < 0.3 ? sessionsLeft : 0;
                break;
              }
              add('lesson_complete', { ls, li, ms: Math.round(t - ls0), shots, cancels }, 2600);
            }
            if (alive) {
              add('tut_complete', { ms: Math.round(t - t0) }, 1500);
              tutDone = true;
            }
          }
          if (alive) add('run_start', {}, 300);
          runLevel = 1;
        } else if (alive) {
          if (runLevel > 1 && r() < 0.7) add('run_resume', { lv: runLevel }, 2500);
          else {
            runLevel = 1;
            add('run_start', {}, 2500);
          }
        }
        let lives = 3;
        while (alive && runLevel <= 12) {
          const lv = runLevel;
          add('table_start', { lv, name: TABLE_NAMES[lv - 1], tid: `t${lv}`, rack: 2 + Math.min(lv, 7), shots: 3 + Math.min(lv, 4), target: 300 * lv, lives }, 1800);
          const tt = t;
          const shots = 2 + Math.floor(r() * (2 + lv / 2));
          let paidAll = 0;
          for (let k = 0; k < shots; k++) {
            const c = r() < 0.3 ? 1 + Math.floor(r() * 2) : 0;
            for (let j = 0; j < c; j++) add('cancel', { ms: 900 + Math.floor(r() * 3000), lv }, 1500 + r() * 2500);
            const paid = r() < 0.6 ? Math.floor(r() * 300 * lv) : 0;
            paidAll += paid;
            add('shot', { lv, n: k + 1, pw: Math.round((0.3 + r() * 0.7) * 100) / 100, aimMs: 1500 + Math.floor(r() * 7000), cancels: c || undefined, pots: paid ? 1 + Math.floor(r() * 2) : 0, scr: r() < 0.07 ? 1 : undefined, frz: lv >= 7 && r() < 0.2 ? 1 : undefined, paid, dur: 3000 }, 3000 + r() * 9000);
            if (r() < 0.02) add('error', { msg: 'TypeError: Cannot read properties of undefined (reading \'x\')', src: 'index.js', line: 4120, at: 'table', lv }, 100);
          }
          if (r() < 0.05) add('hidden', { at: 'table', lv }, 1000), add('visible', { away: 40, at: 'table', lv }, 40000);
          if (r() < 0.05) {
            // idle in front of the table, then left
            add('leave', { at: 'table', lv, dur: Math.round((t - t0) / 1000) }, 120000);
            alive = false;
            break;
          }
          const pClear = Math.max(0.2, skill - lv * 0.05 - (lv === 3 ? 0.18 : 0));
          const cleared = r() < pClear;
          const lost = cleared ? 0 : 1;
          lives -= lost;
          add('table_end', { lv, cleared: cleared ? 1 : 0, score: paidAll, target: 300 * lv, beaten: paidAll >= 300 * lv ? 1 : 0, shots, ms: Math.round(t - tt), lives, lost: lost || undefined, run: paidAll }, 1500);
          if (lost) add('heart_lost', { lv, lives }, 10);
          if (lives <= 0) {
            add('run_over', { lv, run: paidAll }, 2500);
            runLevel = 1;
            if (r() < 0.5) add('leave', { at: 'result', lv, dur: Math.round((t - t0) / 1000) }, 5000);
            alive = false;
            break;
          }
          if (!cleared) {
            if (r() < 0.12) {
              add('quit_run', { lv }, 3000);
              add('menu_open', {}, 300);
              runLevel = 1;
              alive = false;
              break;
            }
            if (r() < 0.04) {
              add('reload', { mid: 1, at: 'table', lv, gap: 3 + Math.floor(r() * 20) }, 2000);
            }
            add('try_again', { lv }, 2500);
            continue;
          }
          add('shop_open', { lv, cash: 4 + lv }, 2500);
          if (r() < 0.5) add('buy', { lv, item: pick(['extra-life', 'ice-box', 'long-cue', 'chalk']), price: 4 }, 4000);
          add('shop_next', { lv, bought: 1 }, 3000);
          runLevel += 1;
          if (lv === 12) add('run_complete', { lv, run: 9999 }, 2000);
          if (r() < 0.12) {
            add('leave', { at: 'other', lv: runLevel, dur: Math.round((t - t0) / 1000) }, 4000);
            alive = false;
          }
        }
      }
      skill = Math.min(0.97, skill + 0.04);
      const s = { sid, pid, start: ev[0].ts, last: ev[ev.length - 1].ts, meta: ev[0], geo, events: ev };
      if (s.start <= now) {
        sessions.push(s);
        (index[pid] ||= { first: s.start, sessions: [] }).sessions.push({ sid, ts: s.start });
      }
      t += (r() < 0.5 ? 0.4 : 1 + r() * 4) * DAY;
    }
  }
  return { sessions, players: index };
}
