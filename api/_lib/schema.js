/**
 * What /api/events accepts. Anything else in a batch is dropped, field by
 * field, so a malformed or hostile client can store nothing but small flat
 * records with known names. The client is src/analytics/Analytics.js.
 */

export const EVENTS = new Set([
  // lifecycle
  'session_start', 'boot', 'reload', 'hidden', 'visible', 'leave', 'error',
  // menus
  'menu_open', 'play_pressed', 'setting', 'stats_off', 'achievement',
  // tutorial
  'tut_start', 'lesson_start', 'lesson_complete', 'lesson_skip', 'lesson_quit', 'lesson_leave',
  'tut_complete', 'tut_skip', 'tut_quit',
  // runs and tables
  'run_start', 'run_resume', 'replay_start', 'table_start', 'table_end', 'table_abandon',
  'heart_lost', 'run_over', 'run_complete', 'quit_run', 'try_again',
  // shots
  'shot', 'cancel', 'freeze',
  // shop
  'shop_open', 'buy', 'reroll', 'shop_next'
]);

export const LIMITS = {
  bodyBytes: 64 * 1024,
  eventsPerBatch: 100,
  fieldsPerEvent: 24,
  stringLength: 200,
  // a page load longer than this is not a session we want to trust
  sessionMs: 48 * 3600 * 1000,
  // a `late` batch: kept on the device while storage was not set up
  lateMs: 31 * 24 * 3600 * 1000
};

const ID = /^[a-z0-9]{8,32}$/i;
const KEY = /^[a-zA-Z][a-zA-Z0-9]{0,15}$/;

export const validId = (s) => typeof s === 'string' && ID.test(s);

/**
 * @returns {{ok:true, pid, sid, t0, sent, events}|{ok:false, error}}
 */
export function parseBatch(raw, serverNow = Date.now()) {
  let body = raw;
  if (typeof body === 'string') {
    if (body.length > LIMITS.bodyBytes) return { ok: false, error: 'too large' };
    try {
      body = JSON.parse(body);
    } catch {
      return { ok: false, error: 'bad json' };
    }
  }
  if (!body || typeof body !== 'object') return { ok: false, error: 'no body' };
  const { pid, sid, t0, sent, events } = body;
  if (!validId(pid) || !validId(sid)) return { ok: false, error: 'bad id' };
  if (!Number.isFinite(t0) || !Number.isFinite(sent)) return { ok: false, error: 'bad time' };
  if (!Array.isArray(events) || !events.length) return { ok: false, error: 'no events' };
  if (events.length > LIMITS.eventsPerBatch) return { ok: false, error: 'too many events' };

  // The client's clock may be wrong; its offsets are not. Shift the session
  // onto the server's clock when they disagree by more than a minute.
  const skew = Math.abs(serverNow - sent) > 60000 ? serverNow - sent : 0;
  const base = t0 + skew;
  const maxAge = body.late ? LIMITS.lateMs : LIMITS.sessionMs;
  if (base - serverNow > LIMITS.sessionMs || serverNow - base > maxAge) return { ok: false, error: 'stale' };

  const clean = [];
  for (const ev of events) {
    if (!ev || typeof ev !== 'object' || !EVENTS.has(ev.e)) continue;
    if (!Number.isFinite(ev.t) || ev.t < -1000 || ev.t > LIMITS.sessionMs) continue;
    const out = { e: ev.e, ts: Math.round(base + Math.max(0, ev.t)) };
    let n = 0;
    for (const [k, v] of Object.entries(ev)) {
      if (k === 'e' || k === 't' || k === 'ts') continue;
      if (++n > LIMITS.fieldsPerEvent || !KEY.test(k)) continue;
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v * 100) / 100;
      else if (typeof v === 'string') out[k] = v.slice(0, LIMITS.stringLength);
      else if (typeof v === 'boolean') out[k] = v ? 1 : 0;
    }
    clean.push(out);
  }
  if (!clean.length) return { ok: false, error: 'no valid events' };
  return { ok: true, pid, sid, t0: base, sent, events: clean };
}
