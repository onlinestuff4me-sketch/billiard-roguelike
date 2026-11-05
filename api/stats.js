/**
 * /api/stats — the dashboard's data, behind STATS_TOKEN.
 *
 *   GET  ?from=<ms>&to=<ms>&tz=<zone>   two reports for a date range: `report`
 *                                       (players) and `internal` (us), kept
 *                                       apart; tz defaults to Pacific
 *   GET  ?session=<sid>                 one session's events, in order
 *   GET  ?player=<pid>                  one player's sessions and their events
 *   POST ?mark=<pid>&internal=1|0       file a player under internal (or not)
 *   GET  ?demo=1                        the same report over made-up data (no token)
 *
 * The token goes in an `Authorization: Bearer <token>` header (the dashboard
 * does this). Set STATS_TOKEN in the Vercel project's environment variables.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { buildReport, DEFAULT_TZ, splitInternal } from './_lib/metrics.js';
import { demoData } from './_lib/demo.js';
import { budget, budgetKey, loadPlayers, loadSessions, pipeline, redisConfig, sessionIds, TTL_SECONDS, usage } from './_lib/store.js';
import { validId } from './_lib/schema.js';

const DAY = 24 * 3600 * 1000;

function authorized(req) {
  const want = process.env.STATS_TOKEN || '';
  if (want.length < 8) return false;
  const h = String(req.headers?.authorization || '');
  const got = h.startsWith('Bearer ') ? h.slice(7) : String(req.headers?.['x-stats-token'] || '');
  const a = createHash('sha256').update(got).digest();
  const b = createHash('sha256').update(want).digest();
  return got.length > 0 && timingSafeEqual(a, b);
}

const num = (v, d) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : d);

/** An IANA zone name the runtime knows, a minute offset, or Pacific. */
function zone(v) {
  if (typeof v === 'string' && /^[A-Za-z_]+\/[A-Za-z_\/+-]+$/.test(v)) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: v });
      return v;
    } catch {
      /* unknown zone */
    }
  }
  if (v !== undefined && v !== '' && Number.isFinite(Number(v))) return Math.max(-840, Math.min(840, Number(v)));
  return DEFAULT_TZ;
}

/** Both reports for one set of sessions: players, and our own devices apart. */
function reports({ sessions, players, internalPids, from, to, tz, now }) {
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.ANALYTICS_PRODUCTION_HOST || '';
  const split = splitInternal(sessions, internalPids, prodHost);
  return {
    report: buildReport({ sessions: split.external, players, from, to, tz, now }),
    internal: buildReport({ sessions: split.internal, players, from, to, tz, now }),
    internalPlayers: [...split.internalPids]
  };
}

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ ok: false, error: 'GET or POST only' });
  const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
  const now = Date.now();
  const tz = zone(q.tz);

  if (q.demo) {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'demo is read-only' });
    const from = num(q.from, now - 14 * DAY);
    const to = num(q.to, now);
    const data = demoData(now);
    if (q.session) {
      const s = data.sessions.find((x) => x.sid === q.session);
      return s ? res.status(200).json({ ok: true, demo: true, session: s }) : res.status(404).json({ ok: false, error: 'no such session' });
    }
    if (q.player) {
      const list = data.sessions.filter((x) => x.pid === q.player).sort((a, b) => a.start - b.start);
      return res.status(200).json({ ok: true, demo: true, player: q.player, sessions: list });
    }
    const sessions = data.sessions.filter((s) => s.start >= from && s.start <= to);
    // two made-up "internal" devices, so the split can be seen
    const internalPids = new Set(Object.keys(data.players).slice(0, 2));
    return res.status(200).json({ ok: true, demo: true, ...reports({ sessions, players: data.players, internalPids, from, to, tz, now }) });
  }

  if (!process.env.STATS_TOKEN) return res.status(503).json({ ok: false, error: 'STATS_TOKEN is not set on the server' });
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'bad token' });
  const cfg = redisConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: 'storage not configured' });

  // reads are charged to the same monthly budget as writes; the dashboard
  // stops at the total, which is above where new events stop being stored
  const month = budgetKey();
  const B = budget();
  let used = 0;
  try {
    used = Number((await pipeline([['GET', month]], cfg))[0]) || 0;
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err.message || err) });
  }
  if (used >= B.total) return res.status(503).json({ ok: false, error: `this month's storage budget (${B.total.toLocaleString('en-US')} commands) is used up; the dashboard opens again on the 1st` });
  usage.commands = 0;
  const charge = () => pipeline([['INCRBY', month, usage.commands + 1]], cfg).catch(() => null);

  try {
    if (req.method === 'POST') {
      if (!validId(q.mark)) return res.status(400).json({ ok: false, error: 'bad id' });
      const on = q.internal !== '0';
      await pipeline([[on ? 'SADD' : 'SREM', 'll:internal', q.mark]], cfg);
      await charge();
      return res.status(200).json({ ok: true, pid: q.mark, internal: on });
    }
    if (q.session) {
      if (!validId(q.session)) return res.status(400).json({ ok: false, error: 'bad id' });
      const [s] = await loadSessions([q.session], cfg);
      await charge();
      return s ? res.status(200).json({ ok: true, session: s }) : res.status(404).json({ ok: false, error: 'no such session' });
    }
    if (q.player) {
      if (!validId(q.player)) return res.status(400).json({ ok: false, error: 'bad id' });
      const [flat] = await pipeline([['ZRANGE', `ll:p:${q.player}`, 0, -1]], cfg);
      const sids = (flat || []).slice(-60);
      const sessions = (await loadSessions(sids, cfg)).sort((a, b) => a.start - b.start);
      await charge();
      return res.status(200).json({ ok: true, player: q.player, sessions });
    }
    const to = num(q.to, now);
    const from = num(q.from, to - 14 * DAY);
    const sids = await sessionIds(from, to, 2500, cfg);
    const sessions = await loadSessions(sids, cfg);
    const players = await loadPlayers([...new Set(sessions.map((s) => s.pid))], cfg);
    const [marked] = await pipeline([['SMEMBERS', 'll:internal']], cfg);
    // drop index entries whose sessions have expired
    const old = now - TTL_SECONDS * 1000;
    await pipeline([['ZREMRANGEBYSCORE', 'll:sessions', 0, old], ['ZREMRANGEBYSCORE', 'll:players', 0, old]], cfg);
    const out = reports({ sessions, players, internalPids: new Set(marked || []), from, to, tz, now });
    out.report.truncated = sids.length >= 2500;
    await charge();
    const b = { month: month.slice(-7), used: used + usage.commands + 1, ingest: B.ingest, total: B.total };
    out.report.budget = b;
    out.internal.budget = b;
    return res.status(200).json({ ok: true, ...out });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err.message || err) });
  }
}
