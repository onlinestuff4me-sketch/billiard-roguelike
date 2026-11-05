/**
 * Analytics.js — anonymous gameplay stats, batched and sent in the background.
 *
 * WHAT IT RECORDS
 *
 *   A random player id (localStorage), a session id per page load, coarse
 *   device facts (viewport, touch or mouse, browser family, the referring
 *   host) and what happens in play: lessons, tables, shots, the shop, the
 *   run's end, settings, errors, and when the page is hidden or left. Nothing
 *   typed, no names, no raw user agent, no IP address. See docs/ANALYTICS.md.
 *
 * WHAT IT MUST NEVER DO
 *
 *   Break or slow the game. Every entry point is wrapped so a throw here is
 *   swallowed; events are queued in memory and sent every ~10 s, or when the
 *   page goes away, with sendBeacon (fetch keepalive as the fallback). A
 *   failed send is dropped, not retried. Until the server says it is set up
 *   (an `{ok:true}` from /api/events) the first refusal turns it off for the
 *   rest of the page load, so `vite dev` and the one-file build degrade to a
 *   no-op.
 *
 *   THE BACKLOG. One refusal is different: a deploy whose storage is not
 *   provisioned yet answers 503 `{disabled:true}`. Then the events are kept
 *   in a capped localStorage backlog (BACKLOG_MAX_EVENTS, BACKLOG_MAX_AGE)
 *   instead, and once a later visit finds the server set up, the backlog goes
 *   up one batch per flush, flagged `late`, under its original session ids
 *   and times. So play recorded before storage existed is not lost for
 *   anyone who comes back.
 *
 * HOW IT IS WIRED
 *
 *   main.js calls `analytics.attach({...})` once and then makes one-line calls
 *   at each hook point, each marked `// analytics`. Where an object's method
 *   says the same thing, it is wrapped here instead of adding a line to
 *   main.js (fewer lines for a parallel branch to collide with): the tutorial's
 *   lessons, rules.endRoom (a table's end), moments.runEnd (the run's end).
 *   Try again and Quit run are read from the sequence (see tableStart, menu).
 *
 *   Off when: the player opts out in Settings, Do Not Track or Global Privacy
 *   Control is on, the page is not served over http(s), or the browser is
 *   automated (navigator.webdriver) unless localStorage `lightline-stats-force`
 *   is '1' (tools/check-analytics.mjs sets it).
 */

const ENDPOINT = (import.meta.env && import.meta.env.VITE_ANALYTICS_URL) || '/api/events';
// 20 s, not 10: half the storage commands, and leaving still sends at once
const FLUSH_MS = 20000;
const MAX_BATCH = 100;
const MAX_QUEUE = 600;
const MAX_ERRORS = 15;
const BACKLOG_KEY = 'lightline-anon-backlog';
const BACKLOG_MAX_EVENTS = 3000;
const BACKLOG_MAX_AGE = 30 * 24 * 3600 * 1000;

const PID_KEY = 'lightline-anon-id';
const META_KEY = 'lightline-anon-meta';
const OPTOUT_KEY = 'lightline-stats-optout';
const FORCE_KEY = 'lightline-stats-force';
/**
 * INTERNAL DEVICES: ours, not players'. Set by opening the game once with
 * ?internal=1 (and cleared with ?internal=0), or automatically by opening the
 * stats dashboard with the token (same site, same storage). Their sessions
 * carry `int: 1` and are reported separately. Automated browsers carry `wd: 1`
 * and are treated the same way.
 */
const INTERNAL_KEY = 'lightline-internal';
const MID_KEY = 'lightline-anon-mid';
const LAST_KEY = 'lightline-anon-last';
/** Keys the game itself writes, read once to tell a player from before analytics from a new one. */
const PRIOR_KEYS = ['billiard-tutorial-done-v3', 'lightline-best-v1', 'lightline-reached-v1', 'lightline-run-v1'];

const now = () => Date.now();
const r2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : undefined);
const store = (kind) => {
  try {
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};
const get = (key, kind) => {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const set = (key, value, kind) => {
  try {
    if (value == null) store(kind)?.removeItem(key);
    else store(kind)?.setItem(key, value);
  } catch {
    /* private mode */
  }
};
const randomId = () => {
  try {
    if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const a = new Uint8Array(10);
    crypto.getRandomValues(a);
    return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
  }
};

/** Browser and OS family only — never the raw user-agent string. */
function uaFamily() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const br = /SamsungBrowser/.test(ua) ? 'Samsung' : /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  return { os, br, mob: /Mobi|iPhone|Android/.test(ua) };
}

function dntOn() {
  try {
    return navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

function navType() {
  try {
    const nav = performance.getEntriesByType?.('navigation')?.[0];
    if (nav?.type) return nav.type;
    const legacy = performance.navigation?.type;
    return legacy === 1 ? 'reload' : legacy === 2 ? 'back_forward' : 'navigate';
  } catch {
    return 'navigate';
  }
}

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const S = {
  attached: false,
  enabled: false,
  dead: false,
  confirmed: false,
  parked: false,
  draining: false,
  deps: null,
  pid: null,
  sid: randomId(),
  t0: now(),
  queue: [],
  batch: 0,
  timer: null,
  errors: 0,
  hiddenAt: null,
  // play
  aimAt: null,
  cancels: 0,
  shotN: 0,
  pending: null,
  table: null,
  lesson: null,
  tutAt: null
};

const game = () => S.deps?.game || {};
const tut = () => S.deps?.tutorial || null;
const inMenu = () => {
  try {
    return !!S.deps?.isMenu?.();
  } catch {
    return false;
  }
};
const inGame = () => !inMenu() && !game().headless;
const lessonActive = () => !!tut()?.active;

/** Where the player is, for leave / hidden / reload events. */
function where() {
  if (inMenu()) return { at: 'menu' };
  if (lessonActive() && S.lesson) return { at: 'lesson', ls: S.lesson.id, li: S.lesson.idx };
  const g = game();
  if (S.table) return { at: S.table.ended ? 'result' : 'table', lv: g.level };
  return { at: 'other', lv: g.level || 0 };
}

function markMid() {
  const w = where();
  if (w.at === 'table' || w.at === 'lesson') set(MID_KEY, JSON.stringify({ sid: S.sid, ...w, at0: w.at }), 'session');
  else set(MID_KEY, null, 'session');
}

/* ------------------------------------------------------------------ *
 * Queue and transport
 * ------------------------------------------------------------------ */

function push(e, data, t = now()) {
  if (!S.enabled || S.dead) return;
  if (S.queue.length >= MAX_QUEUE) return;
  const ev = { e, t: t - S.t0 };
  if (data) for (const k in data) if (data[k] !== undefined && data[k] !== null && data[k] !== '') ev[k] = data[k];
  S.queue.push(ev);
  set(LAST_KEY, String(t), 'session');
}

function payload(events) {
  S.batch += 1;
  return JSON.stringify({ v: 1, pid: S.pid, sid: S.sid, t0: S.t0, b: S.batch, sent: now(), events });
}

/* ------------------------------------------------------------------ *
 * The backlog: events kept on this device while storage is not set up
 * ------------------------------------------------------------------ */

function readBacklog() {
  try {
    const list = JSON.parse(get(BACKLOG_KEY) || '[]');
    if (!Array.isArray(list)) return [];
    return list.filter((b) => b && Array.isArray(b.events) && b.events.length && typeof b.sid === 'string' && now() - b.t0 < BACKLOG_MAX_AGE);
  } catch {
    return [];
  }
}

function writeBacklog(list) {
  let total = list.reduce((n, b) => n + b.events.length, 0);
  // over the cap, the oldest sessions go first
  while (list.length > 1 && total > BACKLOG_MAX_EVENTS) total -= list.shift().events.length;
  if (list.length === 1 && total > BACKLOG_MAX_EVENTS) list[0].events = list[0].events.slice(-BACKLOG_MAX_EVENTS);
  if (!list.length) return set(BACKLOG_KEY, null);
  try {
    localStorage.setItem(BACKLOG_KEY, JSON.stringify(list));
  } catch {
    // quota: keep the newer half and try once more
    try {
      localStorage.setItem(BACKLOG_KEY, JSON.stringify(list.slice(Math.floor(list.length / 2))));
    } catch {
      /* give up quietly */
    }
  }
}

function park(events) {
  if (!events.length) return;
  const list = readBacklog();
  const last = list[list.length - 1];
  if (last && last.sid === S.sid) last.events.push(...events);
  else list.push({ pid: S.pid, sid: S.sid, t0: S.t0, events });
  writeBacklog(list);
}

/** One backlog batch, oldest first, once the server has said it is set up. */
function drainOne() {
  if (!S.enabled || !S.confirmed || S.draining) return;
  const list = readBacklog();
  if (!list.length) return set(BACKLOG_KEY, null);
  const head = list[0];
  const events = head.events.slice(0, MAX_BATCH);
  const body = JSON.stringify({ v: 1, pid: head.pid, sid: head.sid, t0: head.t0, b: 0, sent: now(), late: 1, events });
  S.draining = true;
  const settle = (drop) => {
    if (drop) {
      const l = readBacklog();
      const h = l.find((x) => x.sid === head.sid);
      if (h) h.events.splice(0, events.length);
      writeBacklog(l.filter((x) => x.events.length));
    }
    S.draining = false;
  };
  try {
    fetch(ENDPOINT, { method: 'POST', body, headers: { 'content-type': 'text/plain' }, credentials: 'omit' })
      .then((res) => res.json().catch(() => null).then((json) => settle(!!json?.ok || (res.status >= 400 && res.status < 500 && res.status !== 429))))
      .catch(() => settle(false));
  } catch {
    settle(false);
  }
}

function flush(useBeacon) {
  if (!S.enabled || S.dead || !S.queue.length) return;
  // storage is not set up: keep this page's events on the device instead
  if (S.parked) {
    park(S.queue.splice(0));
    return;
  }
  while (S.queue.length) {
    const events = S.queue.splice(0, MAX_BATCH);
    const body = payload(events);
    let sent = false;
    // A beacon cannot tell us whether the server is set up, so the first send
    // of a page load always goes by fetch and reads the answer.
    if (useBeacon && S.confirmed && navigator.sendBeacon) {
      try {
        sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' }));
      } catch {
        sent = false;
      }
    }
    if (sent) continue;
    try {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: body.length < 60000, headers: { 'content-type': 'text/plain' }, credentials: 'omit' })
        .then((res) => res.json().catch(() => null).then((json) => ({ res, json })))
        .then(({ res, json }) => {
          if (json && json.ok) {
            S.confirmed = true;
            drainOne();
          } else if (res.status === 503 && json && json.disabled && !S.confirmed) {
            S.parked = true;
            park(events);
            park(S.queue.splice(0));
          } else stopForPage();
        })
        .catch(() => {
          /* offline or blocked: drop the batch, keep going */
        });
    } catch {
      /* drop */
    }
  }
}

/** The endpoint is missing or not provisioned: be a no-op for the rest of this page load. */
function stopForPage() {
  if (S.confirmed) return;
  S.dead = true;
  S.queue.length = 0;
  if (S.timer) clearInterval(S.timer);
  S.timer = null;
}

/* ------------------------------------------------------------------ *
 * Enable / disable
 * ------------------------------------------------------------------ */

function readInternalParam() {
  try {
    const v = new URLSearchParams(location.search).get('internal');
    if (v === '1') set(INTERNAL_KEY, '1');
    if (v === '0') set(INTERNAL_KEY, null);
  } catch {
    /* no query */
  }
}

function allowedByEnvironment() {
  try {
    if (!/^https?:$/.test(location.protocol)) return false;
    if (navigator.webdriver && get(FORCE_KEY) !== '1') return false;
    return true;
  } catch {
    return false;
  }
}

function optedOut() {
  return get(OPTOUT_KEY) === '1' || dntOn();
}

function startSession() {
  const hadPid = get(PID_KEY);
  S.pid = hadPid || randomId();
  if (!hadPid) set(PID_KEY, S.pid);
  let meta = {};
  try {
    meta = JSON.parse(get(META_KEY) || '{}') || {};
  } catch {
    meta = {};
  }
  const t = now();
  const visits = (meta.visits || 0) + 1;
  const sinceLast = meta.last ? t - meta.last : null;
  const first = meta.first || t;
  set(META_KEY, JSON.stringify({ first, last: t, visits }));
  const prior = !hadPid && PRIOR_KEYS.some((k) => get(k) != null);
  const nav = navType();
  let ref = '';
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).host;
      if (host && host !== location.host) ref = host;
    }
  } catch {
    /* no referrer */
  }
  const ua = uaFamily();
  let touch = false;
  try {
    touch = matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints || 0) > 0;
  } catch {
    /* default mouse */
  }
  push('session_start', {
    nav,
    ret: hadPid ? 1 : 0,
    prior: prior ? 1 : 0,
    visits,
    sinceLast: sinceLast == null ? undefined : Math.round(sinceLast / 1000),
    firstSeen: first,
    vw: window.innerWidth,
    vh: window.innerHeight,
    dpr: r2(window.devicePixelRatio || 1),
    touch: touch ? 1 : 0,
    os: ua.os,
    br: ua.br,
    mob: ua.mob ? 1 : 0,
    ref,
    tutDone: get(PRIOR_KEYS[0]) === '1' ? 1 : 0,
    host: location.host,
    int: get(INTERNAL_KEY) === '1' ? 1 : undefined,
    wd: (() => {
      try {
        return navigator.webdriver ? 1 : undefined;
      } catch {
        return undefined;
      }
    })()
  }, S.t0);
  push('boot', { ms: Math.round(performance.now()) });

  // RELOAD OF A SESSION THAT WAS MID-TABLE: performance says reload, and the
  // tab's sessionStorage still holds where the previous page load was.
  try {
    const mid = JSON.parse(get(MID_KEY, 'session') || 'null');
    const lastAt = Number(get(LAST_KEY, 'session')) || 0;
    if (nav === 'reload') {
      push('reload', {
        mid: mid ? 1 : 0,
        prevSid: mid?.sid,
        at: mid?.at0,
        lv: mid?.lv,
        ls: mid?.ls,
        gap: lastAt ? Math.round((t - lastAt) / 1000) : undefined
      });
    }
  } catch {
    /* nothing to say */
  }
  set(MID_KEY, null, 'session');

  if (!S.timer)
    S.timer = setInterval(
      () =>
        safe(() => {
          flush(false);
          drainOne();
        }),
      FLUSH_MS
    );
}

function enable() {
  if (S.enabled || S.dead) return;
  readInternalParam();
  if (!allowedByEnvironment() || optedOut()) return;
  S.enabled = true;
  startSession();
}

function disable() {
  S.enabled = false;
  S.queue.length = 0;
  set(BACKLOG_KEY, null);
  if (S.timer) clearInterval(S.timer);
  S.timer = null;
}

/* ------------------------------------------------------------------ *
 * Page lifecycle
 * ------------------------------------------------------------------ */

function onHidden() {
  S.hiddenAt = now();
  finishShot();
  push('hidden', where());
  flush(true);
}

function onVisible() {
  const away = S.hiddenAt ? Math.round((now() - S.hiddenAt) / 1000) : undefined;
  S.hiddenAt = null;
  push('visible', { away, ...where() });
}

function onLeave() {
  finishShot();
  const w = where();
  push('leave', { ...w, dur: Math.round((now() - S.t0) / 1000), cancels: S.cancels || undefined, shots: S.lesson?.shots });
  markMid();
  flush(true);
}

function onError(message, source, line) {
  if (S.errors >= MAX_ERRORS) return;
  S.errors += 1;
  let file = '';
  try {
    file = String(source || '').split('/').pop().split('?')[0].slice(0, 60);
  } catch {
    /* none */
  }
  push('error', { msg: String(message || 'error').slice(0, 200), src: file, line: line || undefined, ...where() });
}

function installPageHooks() {
  document.addEventListener('visibilitychange', () =>
    safe(() => (document.visibilityState === 'hidden' ? onHidden() : onVisible()))
  );
  window.addEventListener('pagehide', () => safe(onLeave));
  window.addEventListener('error', (event) => safe(() => onError(event.message, event.filename, event.lineno)));
  window.addEventListener('unhandledrejection', (event) =>
    safe(() => onError(`unhandled: ${event.reason?.message || event.reason}`, '', 0))
  );
}

/* ------------------------------------------------------------------ *
 * Tutorial — observed by wrapping, so Tutorial.js is untouched
 * ------------------------------------------------------------------ */

function lessonInfo(t) {
  const l = t.lesson;
  if (!l) return null;
  let idx = t.index;
  let of = 0;
  try {
    const p = t._progressOf?.();
    if (p) {
      idx = p[0] - 1;
      of = p[1];
    }
  } catch {
    /* fall back to the index */
  }
  return { id: l.id, idx, of };
}

function closeLesson(kind) {
  const L = S.lesson;
  if (!L) return;
  finishShot();
  push(kind, { ls: L.id, li: L.idx, ms: now() - L.at, shots: L.shots, cancels: L.cancels });
  S.lesson = null;
}

function wrap(obj, name, after, before) {
  const fn = obj?.[name];
  if (typeof fn !== 'function') return;
  obj[name] = function wrapped(...args) {
    let pre;
    if (before) safe(() => (pre = before.apply(this, args)));
    const out = fn.apply(this, args);
    if (after) safe(() => after.call(this, pre, ...args));
    return out;
  };
}

function watchTutorial(t) {
  if (!t) return;
  // before, not after: start() enters lesson 1 itself
  wrap(t, 'start', null, () => {
    if (game().headless) return;
    S.tutAt = now();
    push('tut_start', { done: get(PRIOR_KEYS[0]) === '1' ? 1 : 0 });
  });
  wrap(t, '_enter', () => {
    if (game().headless || !t.active) return;
    const info = lessonInfo(t);
    if (!info) return;
    if (S.lesson && S.lesson.id !== info.id && !S.lesson.done) closeLesson('lesson_leave');
    if (S.lesson && S.lesson.id === info.id) return;
    S.lesson = { ...info, at: now(), shots: 0, cancels: 0, done: false };
    push('lesson_start', { ls: info.id, li: info.idx, of: info.of });
    markMid();
  });
  wrap(t, '_complete', () => {
    if (!S.lesson) return;
    S.lesson.done = true;
    closeLesson('lesson_complete');
  });
  wrap(t, '_resolveShot', () => finishShot());
  // _finish is both "played to the end" (finishedAll) and Skip. Recorded
  // BEFORE it runs: it hands over to startRun, whose events come after.
  wrap(t, '_finish', null, function before() {
    this.__llFinishing = true;
    if (game().headless) return;
    const ms = S.tutAt ? now() - S.tutAt : undefined;
    if (this.finishedAll) push('tut_complete', { ms });
    else {
      const L = S.lesson;
      if (L) closeLesson('lesson_skip');
      push('tut_skip', { ms, ls: L?.id, li: L?.idx });
    }
    S.tutAt = null;
    S.lesson = null;
  });
  // stop() while a lesson is live and NOT on the way out through _finish:
  // the player left the tutorial some other way (the menu).
  wrap(
    t,
    'stop',
    function after(wasActive) {
      if (this.__llFinishing) {
        this.__llFinishing = false;
        return;
      }
      if (!wasActive || game().headless) return;
      const L = S.lesson;
      if (L) closeLesson('lesson_quit');
      push('tut_quit', { ls: L?.id, li: L?.idx });
      S.tutAt = null;
      set(MID_KEY, null, 'session');
    },
    function before() {
      return !!this.active;
    }
  );
}

/* ------------------------------------------------------------------ *
 * Shots
 * ------------------------------------------------------------------ */

function finishShot(paid) {
  const p = S.pending;
  if (!p) return;
  S.pending = null;
  if (paid !== undefined) p.data.paid = paid;
  p.data.dur = now() - p.at;
  push('shot', p.data, p.at);
}

function shot(aim, kind = 'drag') {
  const g = game();
  const counted = inGame() || lessonActive();
  const aimMs = S.aimAt ? now() - S.aimAt : 0;
  S.aimAt = null;
  if (!counted) return;
  // A release after a freeze resumes the same stroke: it is the same shot.
  if (g.midStroke && S.pending) {
    S.pending.data.reaim = (S.pending.data.reaim || 0) + 1;
    S.pending.data.aimMs += aimMs;
    return;
  }
  finishShot();
  S.shotN += 1;
  const L = lessonActive() ? S.lesson : null;
  if (L) L.shots += 1;
  if (S.table && !L) S.table.shots += 1;
  S.pending = {
    at: now(),
    data: {
      lv: L ? undefined : g.level,
      ls: L?.id,
      n: L ? L.shots : S.table?.shots,
      pw: r2(aim?.power ?? 1),
      aimMs,
      cancels: S.cancels || undefined,
      kind: kind === 'drag' ? undefined : kind,
      pots: 0,
      fouls: undefined,
      scr: undefined,
      frz: undefined
    }
  };
  S.cancels = 0;
}

/* ------------------------------------------------------------------ *
 * The public surface: every method is safe to call from anywhere.
 * ------------------------------------------------------------------ */

function safe(fn) {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

const api = {
  attach(deps) {
    if (S.attached) return;
    S.attached = true;
    S.deps = deps;
    enable();
    installPageHooks();
    watchTutorial(deps.tutorial);
    // a table's end: completeRoom and failRoom both bank through endRoom
    const endRoom = deps.rules?.endRoom;
    if (typeof endRoom === 'function') {
      deps.rules.endRoom = function (...args) {
        const out = endRoom.apply(this, args);
        safe(() => api.tableEnd(out, !!out?.filled));
        return out;
      };
    }
    // the end of a run: the panel that says so
    const runEnd = deps.moments?.runEnd;
    if (typeof runEnd === 'function') {
      deps.moments.runEnd = function (opts, ...rest) {
        safe(() => {
          if (!inGame()) return;
          finishShot();
          S.runEnded = true;
          push(opts?.kind === 'complete' ? 'run_complete' : 'run_over', { lv: opts?.level, run: opts?.runScore });
          set(MID_KEY, null, 'session');
        });
        return runEnd.call(this, opts, ...rest);
      };
    }
    const ach = deps.achievements;
    if (ach) {
      const prev = ach.onUnlock;
      ach.onUnlock = (a) => {
        safe(() => !game().headless && push('achievement', { id: a?.id }));
        return prev?.(a);
      };
    }
    wireSettings();
  },

  /** Generic event, gated on real play (not the attract table behind the menu). */
  ev(name, data) {
    if (!inGame() && !lessonActive()) return;
    push(name, { lv: game().level || undefined, ...data });
  },
  /** An event that happens on the menus, so it is not gated on play. */
  ui(name, data) {
    if (game().headless) return;
    push(name, data);
  },
  menu() {
    if (game().headless) return;
    finishShot();
    const T = S.table;
    if (T && !T.ended) push('table_abandon', { lv: T.lv, shots: T.shots, ms: now() - T.at });
    // from a failed table's result, with hearts left, the only way home is Quit run
    else if (T && T.ended && !T.cleared && !S.runEnded && !T.replay) push('quit_run', { lv: T.lv });
    S.table = null;
    push('menu_open');
    set(MID_KEY, null, 'session');
  },

  aimStart() {
    S.aimAt = now();
  },
  aimCancel() {
    if (S.aimAt == null) return;
    const ms = now() - S.aimAt;
    S.aimAt = null;
    if (!inGame() && !lessonActive()) return;
    S.cancels += 1;
    if (lessonActive() && S.lesson) S.lesson.cancels += 1;
    if (S.table) S.table.cancels += 1;
    push('cancel', { ms, lv: lessonActive() ? undefined : game().level, ls: lessonActive() ? S.lesson?.id : undefined });
  },
  shot,
  pot(number, foul) {
    const p = S.pending;
    if (!p) return;
    if (foul) p.data.fouls = (p.data.fouls || 0) + 1;
    else p.data.pots += 1;
  },
  scratch() {
    if (S.pending) S.pending.data.scr = 1;
  },
  freeze() {
    if (S.pending) S.pending.data.frz = (S.pending.data.frz || 0) + 1;
    if (inGame()) push('freeze', { lv: game().level, left: S.deps?.rules?.freezeCharges });
  },
  strokeEnd(summary) {
    finishShot(summary?.paid);
  },

  tableStart() {
    if (!inGame()) return;
    finishShot();
    const g = game();
    const rules = S.deps?.rules;
    const rooms = S.deps?.rooms;
    const prev = S.table;
    // the same table again, straight after failing it: Try again
    const retry = prev && prev.lv === g.level && prev.ended && !prev.cleared ? (prev.retry || 0) + 1 : 0;
    if (retry) push('try_again', { lv: g.level });
    if (!prev || !retry) S.runEnded = false;
    S.table = { lv: g.level, at: now(), shots: 0, cancels: 0, retry, ended: false, cleared: false, replay: !!g.replay };
    push('table_start', {
      lv: g.level,
      name: rooms?.authored?.name || rooms?.layout?.name,
      tid: rooms?.authored?.id,
      rack: rules?.mission?.rack,
      shots: rules?.strokesLeft,
      target: rules?.target,
      lives: rules?.lives,
      cash: rules?.cash,
      replay: g.replay ? 1 : undefined,
      retry: retry || undefined
    });
    markMid();
  },
  tableEnd(result, cleared) {
    if (!inGame()) return;
    finishShot();
    const g = game();
    const rules = S.deps?.rules;
    const T = S.table;
    const lost = result && result.livesFrom > result.lives ? result.livesFrom - result.lives : 0;
    push('table_end', {
      lv: g.level,
      cleared: cleared ? 1 : 0,
      score: result?.roomScore,
      target: result?.target,
      beaten: result?.beaten ? 1 : 0,
      down: rules?.ballsDown,
      rack: rules?.mission?.rack,
      shots: T?.shots,
      cancels: T?.cancels || undefined,
      ms: T ? now() - T.at : undefined,
      lives: result?.lives,
      lost: lost || undefined,
      run: result?.runScore,
      cash: result?.cash,
      replay: g.replay ? 1 : undefined
    });
    if (lost) push('heart_lost', { lv: g.level, lives: result.lives });
    if (T) {
      T.ended = true;
      T.cleared = !!cleared;
    }
    set(MID_KEY, null, 'session');
  },

  /** Exposed for tools/check-analytics.mjs and the console. */
  _debug: {
    flush: () => flush(false),
    state: () => ({ enabled: S.enabled, dead: S.dead, confirmed: S.confirmed, parked: S.parked, pid: S.pid, sid: S.sid, queued: S.queue.length, backlog: readBacklog().reduce((n, b) => n + b.events.length, 0) }),
    drain: () => drainOne(),
    queue: () => S.queue.slice()
  }
};

/* ------------------------------------------------------------------ *
 * Settings: the opt-out toggle, and which settings people change
 * ------------------------------------------------------------------ */

const NAV_BUTTONS = new Set(['set-back', 'set-modes', 'mode-back', 'set-stats']);

function statsLabel(btn) {
  if (!btn) return;
  const dnt = dntOn();
  btn.disabled = dnt;
  btn.textContent = dnt ? 'Anonymous stats: Off (Do Not Track)' : `Anonymous stats: ${get(OPTOUT_KEY) === '1' ? 'Off' : 'On'}`;
}

function wireSettings() {
  const btn = document.getElementById('set-stats');
  statsLabel(btn);
  btn?.addEventListener('click', () =>
    safe(() => {
      if (dntOn()) return;
      const out = get(OPTOUT_KEY) !== '1';
      if (out) {
        push('stats_off');
        flush(true);
        set(OPTOUT_KEY, '1');
        disable();
      } else {
        set(OPTOUT_KEY, null);
        enable();
      }
      statsLabel(btn);
    })
  );
  for (const id of ['menu-settings', 'menu-modes']) {
    document.getElementById(id)?.addEventListener('click', (event) =>
      safe(() => {
        const b = event.target?.closest?.('button');
        if (!b || !b.id || NAV_BUTTONS.has(b.id)) return;
        // read the label after the game's own handler has updated it
        setTimeout(() => safe(() => push('setting', { id: b.id, val: (b.textContent || '').trim().slice(0, 48) })), 0);
      })
    );
  }
}

// Every entry point swallows its own errors.
for (const k of Object.keys(api)) {
  if (typeof api[k] !== 'function') continue;
  const fn = api[k];
  api[k] = (...args) => safe(() => fn(...args));
}

if (typeof window !== 'undefined') window.__analytics = api._debug;

export const analytics = api;
export default analytics;
