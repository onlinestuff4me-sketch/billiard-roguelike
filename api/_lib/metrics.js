/**
 * metrics.js — everything the dashboard shows, derived from raw sessions.
 *
 * Pure: no storage, no clock except the `now` passed in, so tools/check-
 * analytics.mjs can feed it synthetic sessions and check the arithmetic.
 *
 * A session is { sid, pid, start, last, meta, events: [{e, ts, ...}] } with
 * events sorted by ts. Players is { [pid]: { first, sessions: [{sid, ts}] } }.
 *
 * DERIVED HERE, NOT IN THE CLIENT
 *   active time   wall time minus hidden stretches
 *   stall         a visible gap of STALL_GAP with no event, or STALL_CANCELS
 *                 aim cancels in a row with no shot
 *   churn point   where the player was at the last event of a session after
 *                 which they never came back (and it has been CHURN_AFTER)
 *   rage reload   a reload of a session that was mid-table or mid-lesson,
 *                 within RAGE_GAP of the last thing that happened
 *   funnel        first sessions of new players, step by step
 */

export const STALL_GAP = 30 * 1000;
export const STALL_CANCELS = 5;
export const RAGE_GAP = 60 * 1000;
export const CHURN_AFTER = 24 * 3600 * 1000;
export const IDLE_MARK = 30 * 1000;
const DAY = 24 * 3600 * 1000;

const LIFECYCLE = new Set(['hidden', 'visible', 'leave', 'error', 'boot', 'session_start', 'reload', 'setting', 'achievement']);

export const FUNNEL = [
  { id: 'load', label: 'Loaded the game' },
  { id: 'play', label: 'Pressed Play' },
  { id: 'lesson1', label: 'Started lesson 1' },
  { id: 'lessons', label: 'Finished the lessons' },
  { id: 'table1', label: 'Reached table 1' },
  { id: 'table1c', label: 'Cleared table 1' },
  { id: 'table3', label: 'Reached table 3' },
  { id: 'runEnd', label: 'Run over or complete' }
];

/* ------------------------------------------------------------------ *
 * small helpers
 * ------------------------------------------------------------------ */

export const median = (xs) => {
  const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const mean = (xs) => {
  const a = xs.filter((x) => Number.isFinite(x));
  return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
};
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : null);
const inc = (o, k, by = 1) => (o[k] = (o[k] || 0) + by);

/** Calendar day key for a timestamp in the viewer's time zone (offset in minutes, as Date#getTimezoneOffset). */
export const dayKey = (ts, tz = 0) => new Date(ts - tz * 60000).toISOString().slice(0, 10);
const dayIndex = (ts, tz = 0) => Math.floor((ts - tz * 60000) / DAY);

export function fmtMs(ms) {
  if (!Number.isFinite(ms)) return '–';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

/** Where a player is after an event: the words the churn table and the timeline use. */
export function stateAfter(ev, prev) {
  switch (ev.e) {
    case 'session_start':
    case 'boot':
      return 'Home screen';
    case 'menu_open':
      return 'Home screen';
    case 'play_pressed':
      return ev.tut ? 'Play screen' : 'Starting the lessons';
    case 'tut_start':
      return 'Tutorial';
    case 'lesson_start':
    case 'lesson_leave':
      return `Lesson ${(ev.li ?? 0) + 1}${ev.ls ? ` (${ev.ls})` : ''}`;
    case 'lesson_complete':
      return `Lesson ${(ev.li ?? 0) + 1} done`;
    case 'tut_complete':
      return 'Lessons finished';
    case 'tut_skip':
      return 'Lessons skipped';
    case 'tut_quit':
      return 'Left the lessons';
    case 'table_start':
      return `Table ${ev.lv}${ev.replay ? ' (replay)' : ''}`;
    case 'table_end':
      return `Table ${ev.lv} ${ev.cleared ? 'cleared' : 'failed'}${ev.replay ? ' (replay)' : ''}`;
    case 'shop_open':
      return `Shop after table ${ev.lv}`;
    case 'run_over':
      return `Run over at table ${ev.lv}`;
    case 'run_complete':
      return 'Run complete';
    case 'quit_run':
      return `Quit run at table ${ev.lv}`;
    default:
      return prev;
  }
}

/* ------------------------------------------------------------------ *
 * one session
 * ------------------------------------------------------------------ */

export function summarizeSession(s) {
  const ev = s.events;
  const first = ev[0]?.ts ?? s.start;
  const lastTs = ev[ev.length - 1]?.ts ?? s.last;
  let hiddenMs = 0;
  let hiddenAt = null;
  let state = 'Home screen';
  let endState = 'Home screen';
  let lastAction = null;
  let prevTs = first;
  let cancelRun = 0;
  const stalls = [];
  const reached = new Set(['load']);
  const out = {
    sid: s.sid,
    pid: s.pid,
    start: first,
    end: lastTs,
    events: ev.length,
    shots: 0,
    cancels: 0,
    pots: 0,
    scratches: 0,
    freezes: 0,
    errors: 0,
    reloadMid: false,
    rage: false,
    reload: false,
    maxTable: 0,
    tablesCleared: 0,
    tablesFailed: 0,
    lessonsDone: 0,
    tut: null,
    runEnd: null,
    os: s.meta?.os,
    br: s.meta?.br,
    touch: s.meta?.touch,
    vw: s.meta?.vw,
    vh: s.meta?.vh,
    ref: s.meta?.ref,
    prior: !!s.meta?.prior,
    nav: s.meta?.nav
  };
  for (const e of ev) {
    // stall: a long visible silence
    // (a gap that ends in `leave` counts: idling until you close the tab is the
    // clearest stall there is; one that ends in `visible` was spent away)
    if (hiddenAt == null && e.ts - prevTs >= STALL_GAP && e.e !== 'visible' && e.e !== 'session_start') {
      stalls.push({ kind: 'idle', ts: prevTs, ms: e.ts - prevTs, where: state });
    }
    if (e.e === 'hidden') hiddenAt = e.ts;
    if (e.e === 'visible' && hiddenAt != null) {
      hiddenMs += e.ts - hiddenAt;
      hiddenAt = null;
    }
    prevTs = e.ts;
    switch (e.e) {
      case 'play_pressed':
      case 'run_start':
      case 'run_resume':
      case 'replay_start':
      case 'tut_start':
        reached.add('play');
        break;
      case 'lesson_start':
        if (!e.li) reached.add('lesson1');
        break;
      case 'lesson_complete':
        out.lessonsDone += 1;
        break;
      case 'tut_complete':
        reached.add('lessons');
        out.tut = 'completed';
        break;
      case 'tut_skip':
        reached.add('lessons');
        out.tut = 'skipped';
        break;
      case 'tut_quit':
        if (!out.tut) out.tut = 'left';
        break;
      case 'table_start':
        if (!e.replay) {
          out.maxTable = Math.max(out.maxTable, e.lv || 0);
          if (e.lv >= 1) reached.add('table1');
          if (e.lv >= 3) reached.add('table3');
        }
        break;
      case 'table_end':
        if (e.cleared) out.tablesCleared += 1;
        else out.tablesFailed += 1;
        if (e.cleared && e.lv >= 1 && !e.replay) reached.add('table1c');
        break;
      case 'run_over':
      case 'run_complete':
        reached.add('runEnd');
        out.runEnd = { kind: e.e === 'run_over' ? 'over' : 'complete', lv: e.lv };
        break;
      case 'quit_run':
        out.runEnd = { kind: 'quit', lv: e.lv };
        break;
      case 'shot':
        out.shots += 1;
        out.pots += e.pots || 0;
        if (e.scr) out.scratches += 1;
        cancelRun = 0;
        break;
      case 'cancel':
        out.cancels += 1;
        cancelRun += 1;
        if (cancelRun === STALL_CANCELS) stalls.push({ kind: 'cancels', ts: e.ts, ms: 0, where: state, n: cancelRun });
        break;
      case 'freeze':
        out.freezes += 1;
        break;
      case 'error':
        out.errors += 1;
        break;
      case 'reload':
        out.reload = true;
        if (e.mid) {
          out.reloadMid = true;
          if (Number.isFinite(e.gap) && e.gap * 1000 <= RAGE_GAP) out.rage = true;
        }
        break;
      default:
        break;
    }
    state = stateAfter(e, state);
    if (!LIFECYCLE.has(e.e) && e.e !== 'cancel') {
      lastAction = e;
      endState = state;
    } else if (!LIFECYCLE.has(e.e)) {
      endState = state;
    }
  }
  // a session that ends hidden: the time after hiding was not play
  const wallEnd = hiddenAt != null ? hiddenAt : lastTs;
  out.ms = Math.max(0, lastTs - first);
  out.activeMs = Math.max(0, wallEnd - first - hiddenMs);
  out.endState = endState;
  out.lastAction = lastAction?.e || null;
  out.stalls = stalls;
  out.reached = [...reached];
  return out;
}

/* ------------------------------------------------------------------ *
 * the report
 * ------------------------------------------------------------------ */

/**
 * @param {object} p
 * @param {Array} p.sessions   raw sessions in range
 * @param {object} p.players   pid → { first, sessions: [{sid, ts}] }  (all time)
 * @param {number} p.from
 * @param {number} p.to
 * @param {number} [p.tz]      minutes, as Date#getTimezoneOffset
 * @param {number} [p.now]
 */
export function buildReport({ sessions, players, from, to, tz = 0, now = Date.now() }) {
  const sums = sessions.map(summarizeSession).sort((a, b) => a.start - b.start);
  const raw = new Map(sessions.map((s) => [s.sid, s]));
  const byPlayer = new Map();
  for (const s of sums) {
    if (!byPlayer.has(s.pid)) byPlayer.set(s.pid, []);
    byPlayer.get(s.pid).push(s);
  }

  // --- who is new --------------------------------------------------
  const playerInfo = (pid) => players[pid] || { first: byPlayer.get(pid)?.[0]?.start ?? 0, sessions: [] };
  const allStarts = (pid) => {
    const st = playerInfo(pid).sessions.map((x) => x.ts);
    return st.length ? st.sort((a, b) => a - b) : (byPlayer.get(pid) || []).map((s) => s.start);
  };
  const isFirstSession = (s) => {
    const st = allStarts(s.pid);
    return !st.length || Math.abs(st[0] - s.start) < 2000 || playerInfo(s.pid).sessions[0]?.sid === s.sid;
  };
  const priorOf = (pid) => (byPlayer.get(pid) || []).some((s) => s.prior);
  const pids = [...byPlayer.keys()];
  const newPids = pids.filter((pid) => {
    const f = playerInfo(pid).first || allStarts(pid)[0];
    return f >= from && f <= to && !priorOf(pid);
  });
  const newSet = new Set(newPids);

  // --- overview ----------------------------------------------------
  const active = sums.map((s) => s.activeMs);
  const overview = {
    players: pids.length,
    newPlayers: newPids.length,
    returningPlayers: pids.length - newPids.length,
    priorPlayers: pids.filter(priorOf).length,
    sessions: sums.length,
    sessionsPerPlayer: pids.length ? Math.round((sums.length / pids.length) * 10) / 10 : null,
    medianSessionMs: median(active),
    meanSessionMs: mean(active),
    totalPlayMs: active.reduce((a, b) => a + b, 0),
    shots: sums.reduce((a, s) => a + s.shots, 0),
    touchShare: pct(sums.filter((s) => s.touch).length, sums.length)
  };

  // --- retention (D1 / D7) -----------------------------------------
  const ret = (days, exact) => {
    let eligible = 0;
    let back = 0;
    for (const pid of newPids) {
      const st = allStarts(pid);
      const f = st[0];
      const d0 = dayIndex(f, tz);
      // the window has to be over before the player counts either way
      const windowEnd = (d0 + days + 1) * DAY + tz * 60000;
      if (windowEnd > now) continue;
      eligible += 1;
      const hit = st.some((ts) => {
        const d = dayIndex(ts, tz) - d0;
        return exact ? d === days : d >= 1 && d <= days;
      });
      if (hit) back += 1;
    }
    return { eligible, returned: back, rate: pct(back, eligible) };
  };
  overview.d1 = ret(1, true);
  overview.d7 = ret(7, false);
  overview.anyReturn = (() => {
    const n = newPids.filter((pid) => allStarts(pid).length > 1).length;
    return { eligible: newPids.length, returned: n, rate: pct(n, newPids.length) };
  })();

  // --- funnel ------------------------------------------------------
  const funnelOf = (list) => {
    const counts = FUNNEL.map((st) => ({ ...st, n: 0 }));
    for (const s of list) for (const c of counts) if (s.reached.includes(c.id)) c.n += 1;
    // a step's count can't exceed the one before it in a funnel (a resumed
    // run "reaches table 1" without "pressing Play" in the same session only
    // if Play came from another session); make it monotone and say so
    let prev = null;
    for (const c of counts) {
      c.raw = c.n;
      if (prev && c.n > prev.n) c.n = prev.n;
      c.pctOfStart = pct(c.n, counts[0].n);
      c.pctOfPrev = prev ? pct(c.n, prev.n) : 100;
      c.drop = prev ? prev.n - c.n : 0;
      prev = c;
    }
    return counts;
  };
  const firstSessions = sums.filter((s) => newSet.has(s.pid) && isFirstSession(s));
  // all players: merge every session in range per player
  const merged = pids.map((pid) => ({ reached: [...new Set(byPlayer.get(pid).flatMap((s) => s.reached))] }));
  const funnel = {
    first: funnelOf(firstSessions),
    all: funnelOf(merged),
    firstSkipped: firstSessions.filter((s) => s.tut === 'skipped').length,
    firstCount: firstSessions.length
  };

  // --- tutorial ----------------------------------------------------
  const lessonMap = new Map();
  const L = (id, li) => {
    if (!lessonMap.has(id)) lessonMap.set(id, { id, li, startedBy: new Set(), completedBy: new Set(), starts: 0, completes: 0, skips: 0, quits: 0, endedHere: 0, ms: [], shots: [], cancels: [], stopCancels: [], failShots: [] });
    return lessonMap.get(id);
  };
  let tutStarted = new Set();
  let tutCompleted = new Set();
  let tutSkipped = new Set();
  for (const s of sessions) {
    for (const e of s.events) {
      if (e.e === 'tut_start') tutStarted.add(s.pid);
      if (e.e === 'tut_complete') tutCompleted.add(s.pid);
      if (e.e === 'tut_skip') tutSkipped.add(s.pid);
      if (!e.ls) continue;
      if (e.e === 'lesson_start') {
        const l = L(e.ls, e.li);
        l.starts += 1;
        l.startedBy.add(s.pid);
      } else if (e.e === 'lesson_complete') {
        const l = L(e.ls, e.li);
        l.completes += 1;
        l.completedBy.add(s.pid);
        l.ms.push(e.ms);
        l.shots.push(e.shots);
        l.cancels.push(e.cancels);
      } else if (e.e === 'lesson_skip') {
        const l = L(e.ls, e.li);
        l.skips += 1;
        l.failShots.push(e.shots);
        l.stopCancels.push(e.cancels || 0);
      } else if (e.e === 'lesson_quit') {
        const l = L(e.ls, e.li);
        l.quits += 1;
        l.failShots.push(e.shots);
        l.stopCancels.push(e.cancels || 0);
      }
    }
  }
  // a session that simply ended inside a lesson
  for (const s of sums) {
    const m = /^Lesson (\d+) \(([^)]+)\)$/.exec(s.endState);
    if (m) {
      const l = L(m[2], Number(m[1]) - 1);
      l.endedHere += 1;
      const leave = raw.get(s.sid)?.events.findLast?.((e) => e.e === 'leave' && e.ls === m[2]);
      if (leave) l.stopCancels.push(leave.cancels || 0);
      if (leave?.shots != null) l.failShots.push(leave.shots);
    }
  }
  const lessons = [...lessonMap.values()]
    .sort((a, b) => (a.li ?? 99) - (b.li ?? 99))
    .map((l) => ({
      id: l.id,
      index: l.li,
      players: l.startedBy.size,
      completedPlayers: l.completedBy.size,
      starts: l.starts,
      completes: l.completes,
      skips: l.skips,
      quits: l.quits,
      endedHere: l.endedHere,
      // started it, never passed it, never finished or skipped the lessons
      stoppedHere: [...l.startedBy].filter((p) => !l.completedBy.has(p) && !tutCompleted.has(p) && !tutSkipped.has(p)).length,
      completionRate: pct(l.completedBy.size, l.startedBy.size),
      medianMs: median(l.ms),
      medianShots: median(l.shots),
      meanCancels: mean(l.cancels),
      meanCancelsStopped: mean(l.stopCancels),
      medianShotsBeforeLeaving: median(l.failShots)
    }));
  const tutorial = {
    started: tutStarted.size,
    completed: tutCompleted.size,
    skipped: tutSkipped.size,
    completionRate: pct(tutCompleted.size, tutStarted.size),
    skipRate: pct(tutSkipped.size, tutStarted.size),
    lessons
  };

  // --- tables ------------------------------------------------------
  const tableMap = new Map();
  const T = (lv) => {
    if (!tableMap.has(lv)) tableMap.set(lv, { lv, name: null, players: new Set(), attempts: 0, clears: 0, fails: 0, shots: [], ratio: [], ms: [], hearts: 0, over: 0, quit: 0, abandoned: 0, replays: 0 });
    return tableMap.get(lv);
  };
  for (const s of sessions) {
    for (const e of s.events) {
      if (!Number.isFinite(e.lv) || e.lv < 1) continue;
      if (e.e === 'table_start') {
        if (e.replay) {
          T(e.lv).replays += 1;
          continue;
        }
        const t = T(e.lv);
        t.attempts += 1;
        t.players.add(s.pid);
        if (e.name) t.name = e.name;
      } else if (e.e === 'table_end' && !e.replay) {
        const t = T(e.lv);
        if (e.cleared) t.clears += 1;
        else t.fails += 1;
        if (Number.isFinite(e.shots)) t.shots.push(e.shots);
        if (Number.isFinite(e.score) && e.target > 0) t.ratio.push(e.score / e.target);
        if (Number.isFinite(e.ms)) t.ms.push(e.ms);
        t.hearts += e.lost || 0;
      } else if (e.e === 'run_over') T(e.lv).over += 1;
      else if (e.e === 'quit_run') T(e.lv).quit += 1;
    }
  }
  for (const s of sums) {
    const m = /^Table (\d+)$/.exec(s.endState);
    if (m) T(Number(m[1])).abandoned += 1;
  }
  const tables = [...tableMap.values()]
    .sort((a, b) => a.lv - b.lv)
    .map((t) => {
      const ended = t.clears + t.fails;
      return {
        lv: t.lv,
        name: t.name,
        players: t.players.size,
        attempts: t.attempts,
        clears: t.clears,
        fails: t.fails,
        clearRate: pct(t.clears, ended),
        failRate: pct(t.fails, ended),
        medianShots: median(t.shots),
        meanShots: mean(t.shots),
        medianScoreToTarget: median(t.ratio),
        medianMs: median(t.ms),
        heartsLost: t.hearts,
        runsOver: t.over,
        runsQuit: t.quit,
        abandoned: t.abandoned,
        runsEndedHere: t.over + t.quit + t.abandoned,
        replays: t.replays
      };
    });
  const runEnds = tables.reduce((n, t) => n + t.runsEndedHere, 0);
  const runsCompleted = sessions.reduce((n, s) => n + s.events.filter((e) => e.e === 'run_complete').length, 0);

  // --- health ------------------------------------------------------
  const errMsgs = {};
  let errors = 0;
  for (const s of sessions) for (const e of s.events) if (e.e === 'error') {
    errors += 1;
    inc(errMsgs, `${e.msg || 'error'}${e.src ? ` (${e.src}${e.line ? `:${e.line}` : ''})` : ''}`);
  }
  const health = {
    errors,
    sessionsWithErrors: sums.filter((s) => s.errors).length,
    topErrors: Object.entries(errMsgs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([msg, n]) => ({ msg, n })),
    reloads: sums.filter((s) => s.reload).length,
    reloadsMid: sums.filter((s) => s.reloadMid).length,
    rageReloads: sums.filter((s) => s.rage).length
  };

  // --- stalls ------------------------------------------------------
  const stallWhere = {};
  let stallCount = 0;
  let cancelStalls = 0;
  for (const s of sums) for (const st of s.stalls) {
    stallCount += 1;
    if (st.kind === 'cancels') cancelStalls += 1;
    inc(stallWhere, st.where);
  }
  const stalls = {
    total: stallCount,
    idle: stallCount - cancelStalls,
    cancels: cancelStalls,
    sessions: sums.filter((s) => s.stalls.length).length,
    where: Object.entries(stallWhere).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([where, n]) => ({ where, n }))
  };

  // --- churn -------------------------------------------------------
  const churnWhere = {};
  const lastWhere = {};
  let churned = 0;
  for (const pid of pids) {
    const list = byPlayer.get(pid);
    const last = list[list.length - 1];
    const later = allStarts(pid).some((ts) => ts > last.start + 2000);
    if (later) continue;
    inc(lastWhere, last.endState);
    if (now - last.end >= CHURN_AFTER) {
      churned += 1;
      inc(churnWhere, last.endState);
    }
  }
  const sortCounts = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([where, n]) => ({ where, n }));
  const churn = { churned, notBackYet: pids.length - churned, where: sortCounts(churnWhere), lastSeenAt: sortCounts(lastWhere) };

  // --- by day ------------------------------------------------------
  const days = [];
  for (let d = dayIndex(from, tz); d <= dayIndex(Math.min(to, now), tz); d++) {
    days.push({ day: new Date(d * DAY).toISOString().slice(0, 10), sessions: 0, players: new Set(), newPlayers: new Set(), activeMs: 0 });
  }
  const dayAt = new Map(days.map((d) => [d.day, d]));
  for (const s of sums) {
    const d = dayAt.get(dayKey(s.start, tz));
    if (!d) continue;
    d.sessions += 1;
    d.players.add(s.pid);
    d.activeMs += s.activeMs;
    if (newSet.has(s.pid) && isFirstSession(s)) d.newPlayers.add(s.pid);
  }
  const daily = days.map((d) => ({ day: d.day, sessions: d.sessions, players: d.players.size, newPlayers: d.newPlayers.size, activeMs: d.activeMs }));

  // --- users and sessions lists ------------------------------------
  const users = pids
    .map((pid) => {
      const list = byPlayer.get(pid);
      const last = list[list.length - 1];
      const tut = list.some((s) => s.tut === 'completed') ? 'completed' : list.some((s) => s.tut === 'skipped') ? 'skipped' : list.some((s) => s.reached.includes('lesson1')) ? 'in lessons' : priorOf(pid) ? 'before stats' : 'not started';
      return {
        pid,
        first: playerInfo(pid).first || list[0].start,
        lastSeen: last.end,
        sessions: list.length,
        sessionsAllTime: allStarts(pid).length,
        activeMs: list.reduce((a, s) => a + s.activeMs, 0),
        shots: list.reduce((a, s) => a + s.shots, 0),
        maxTable: Math.max(0, ...list.map((s) => s.maxTable)),
        tut,
        isNew: newSet.has(pid),
        prior: priorOf(pid),
        device: [last.os, last.br, last.touch ? 'touch' : 'mouse'].filter(Boolean).join(' · '),
        lastState: last.endState,
        errors: list.reduce((a, s) => a + s.errors, 0)
      };
    })
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 400);
  const sessionList = sums
    .slice()
    .sort((a, b) => b.start - a.start)
    .slice(0, 600)
    .map((s) => ({
      sid: s.sid,
      pid: s.pid,
      start: s.start,
      activeMs: s.activeMs,
      ms: s.ms,
      events: s.events,
      shots: s.shots,
      cancels: s.cancels,
      maxTable: s.maxTable,
      endState: s.endState,
      first: newSet.has(s.pid) && isFirstSession(s),
      flags: [s.errors ? 'error' : null, s.rage ? 'rage-reload' : s.reloadMid ? 'reload' : null, s.stalls.length ? 'stall' : null, s.tut === 'skipped' ? 'skipped lessons' : null].filter(Boolean),
      device: [s.os, s.br, s.touch ? 'touch' : 'mouse'].filter(Boolean).join(' · ')
    }));

  const report = {
    thresholds: { stallMs: STALL_GAP, stallCancels: STALL_CANCELS, rageMs: RAGE_GAP, churnMs: CHURN_AFTER },
    range: { from, to, tz, now, days: Math.max(1, Math.round((Math.min(to, now) - from) / DAY)) },
    overview,
    funnel,
    tutorial,
    tables,
    runs: { ended: runEnds, completed: runsCompleted },
    health,
    stalls,
    churn,
    daily,
    users,
    sessions: sessionList
  };
  report.narrative = narrate(report);
  return report;
}

/* ------------------------------------------------------------------ *
 * the narrative
 * ------------------------------------------------------------------ */

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const p0 = (x) => (x == null ? '–' : `${Math.round(x)}%`);

/** Plain sentences from the numbers, each one only when it has something to say. */
export function narrate(r) {
  const out = [];
  const o = r.overview;
  const fmtDay = (ts) => new Date(ts - r.range.tz * 60000).toISOString().slice(0, 10);
  const range = `${fmtDay(r.range.from)} to ${fmtDay(Math.min(r.range.to, r.range.now))}`;
  if (!o.sessions) {
    out.push(`No sessions recorded from ${range}.`);
    return { range, lines: out, small: true };
  }
  out.push(
    `From ${range}: ${plural(o.players, 'player')} (${o.newPlayers} new, ${o.returningPlayers} returning${o.priorPlayers ? `, of whom ${o.priorPlayers} had played before stats began` : ''}) played ${plural(o.sessions, 'session')}. Median session ${fmtMs(o.medianSessionMs)} of active play; ${plural(o.shots, 'shot')} taken in all.`
  );

  // funnel
  const f = r.funnel.first;
  const n0 = f[0].n;
  if (n0) {
    const at = (id) => f.find((x) => x.id === id);
    const parts = [
      `${p0(at('play').pctOfStart)} pressed Play`,
      `${p0(at('lesson1').pctOfStart)} started lesson 1`,
      `${p0(at('lessons').pctOfStart)} got through the lessons${r.funnel.firstSkipped ? ` (${r.funnel.firstSkipped} by skipping)` : ''}`,
      `${p0(at('table1').pctOfStart)} reached table 1`,
      `${p0(at('table1c').pctOfStart)} cleared it`,
      `${p0(at('table3').pctOfStart)} reached table 3`
    ];
    out.push(`Of ${plural(n0, 'first-time player')}, ${parts.join(', ')}.`);
    let worst = null;
    for (let i = 1; i < f.length; i++) if (f[i].drop > 0 && (!worst || f[i].drop > worst.drop)) worst = { ...f[i], prev: f[i - 1] };
    if (worst) out.push(`The biggest drop is between “${worst.prev.label.toLowerCase()}” and “${worst.label.toLowerCase()}”: ${worst.drop} of ${worst.prev.n} stopped there.`);
  }

  // tutorial
  const t = r.tutorial;
  if (t.started) {
    const stuck = t.lessons.filter((l) => l.stoppedHere > 0).sort((a, b) => b.stoppedHere - a.stoppedHere)[0];
    let line = `${p0(t.completionRate)} of the ${plural(t.started, 'player')} who began the lessons finished them${t.skipped ? `, ${t.skipped} skipped` : ''}.`;
    if (stuck) {
      line += ` Lesson ${stuck.index + 1} (${stuck.id}) is where most stop: ${stuck.stoppedHere} of ${stuck.players} who started it never finished${stuck.meanCancelsStopped != null ? `, after ${stuck.meanCancelsStopped.toFixed(1)} aim cancels on average` : ''}.`;
    }
    const slow = t.lessons.filter((l) => l.medianShots != null).sort((a, b) => b.medianShots - a.medianShots)[0];
    if (slow && slow.medianShots > 2) line += ` Lesson ${slow.index + 1} takes a median ${slow.medianShots} shots to pass.`;
    out.push(line);
  }

  // tables
  const tbl = r.tables.filter((x) => x.attempts > 0);
  if (tbl.length) {
    const ender = tbl.slice().sort((a, b) => b.runsEndedHere - a.runsEndedHere)[0];
    if (ender && ender.runsEndedHere > 0) {
      out.push(`Table ${ender.lv}${ender.name ? ` (${ender.name})` : ''} is where runs end most often: ${ender.runsEndedHere} of ${r.runs.ended} run endings (${ender.runsOver} out of hearts, ${ender.runsQuit} quit, ${ender.abandoned} closed the game there).`);
    }
    const hard = tbl.filter((x) => x.clears + x.fails >= 3).sort((a, b) => a.clearRate - b.clearRate)[0];
    if (hard) out.push(`Hardest table so far: ${hard.lv}${hard.name ? ` (${hard.name})` : ''}, cleared on ${p0(hard.clearRate)} of ${hard.clears + hard.fails} attempts, a median ${hard.medianShots ?? '–'} shots each.`);
    const deepest = Math.max(...tbl.map((x) => x.lv));
    out.push(`The furthest anyone got is table ${deepest}${r.runs.completed ? `; ${plural(r.runs.completed, 'run')} reached the end` : ''}.`);
  }

  // stalls, churn
  if (r.stalls.total) {
    const w = r.stalls.where[0];
    out.push(`${plural(r.stalls.sessions, 'session')} stalled (${r.stalls.idle} long idle, ${r.stalls.cancels} runs of ${STALL_CANCELS}+ aim cancels); most often at ${w.where}.`);
  }
  if (r.churn.churned) {
    const w = r.churn.where[0];
    out.push(`${plural(r.churn.churned, 'player')} have not been back for a day or more. The most common last place was ${w.where} (${w.n}).`);
  }

  // retention
  if (o.d1.eligible) out.push(`D1 return: ${p0(o.d1.rate)} of ${o.d1.eligible} new players came back the next day${o.d7.eligible ? `; ${p0(o.d7.rate)} of ${o.d7.eligible} came back within a week` : ''}.`);
  else if (o.newPlayers) out.push(`Too early for D1 return: no new player's next day is over yet. ${o.anyReturn.returned} of ${o.anyReturn.eligible} have already come back.`);

  // health
  const h = r.health;
  if (h.errors || h.reloadsMid) {
    out.push(`${plural(h.errors, 'JavaScript error')} in ${plural(h.sessionsWithErrors, 'session')}${h.topErrors[0] ? ` (most common: “${h.topErrors[0].msg}”)` : ''}; ${plural(h.reloadsMid, 'reload')} mid-table or mid-lesson, ${h.rageReloads} within ${RAGE_GAP / 1000}s of the last action.`);
  } else out.push('No JavaScript errors and no mid-game reloads.');

  const small = o.players < 10;
  return { range, lines: out, small };
}
