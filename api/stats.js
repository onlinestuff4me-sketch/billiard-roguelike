/**
 * GET /api/stats — the dashboard's data, behind STATS_TOKEN.
 *
 *   ?from=<ms>&to=<ms>&tz=<minutes>   the report for a date range
 *   ?session=<sid>                    one session's events, in order
 *   ?player=<pid>                     one player's sessions and their events
 *   ?demo=1                           the same report over made-up data (no token)
 *
 * The token goes in an `Authorization: Bearer <token>` header (the dashboard
 * does this). Set STATS_TOKEN in the Vercel project's environment variables.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { buildReport } from './_lib/metrics.js';
import { demoData } from './_lib/demo.js';
import { loadPlayers, loadSessions, pipeline, redisConfig, sessionIds } from './_lib/store.js';
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

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'GET only' });
  const q = req.query || Object.fromEntries(new URL(req.url, 'http://x').searchParams);
  const now = Date.now();
  const tz = Math.max(-840, Math.min(840, num(q.tz, 0)));

  if (q.demo) {
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
    return res.status(200).json({ ok: true, demo: true, report: buildReport({ sessions, players: data.players, from, to, tz, now }) });
  }

  if (!process.env.STATS_TOKEN) return res.status(503).json({ ok: false, error: 'STATS_TOKEN is not set on the server' });
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'bad token' });
  const cfg = redisConfig();
  if (!cfg) return res.status(503).json({ ok: false, error: 'storage not configured' });

  try {
    if (q.session) {
      if (!validId(q.session)) return res.status(400).json({ ok: false, error: 'bad id' });
      const [s] = await loadSessions([q.session], cfg);
      return s ? res.status(200).json({ ok: true, session: s }) : res.status(404).json({ ok: false, error: 'no such session' });
    }
    if (q.player) {
      if (!validId(q.player)) return res.status(400).json({ ok: false, error: 'bad id' });
      const [flat] = await pipeline([['ZRANGE', `ll:p:${q.player}`, 0, -1]], cfg);
      const sids = (flat || []).slice(-60);
      const sessions = (await loadSessions(sids, cfg)).sort((a, b) => a.start - b.start);
      return res.status(200).json({ ok: true, player: q.player, sessions });
    }
    const to = num(q.to, now);
    const from = num(q.from, to - 14 * DAY);
    const sids = await sessionIds(from, to, 2500, cfg);
    const sessions = await loadSessions(sids, cfg);
    const players = await loadPlayers([...new Set(sessions.map((s) => s.pid))], cfg);
    const report = buildReport({ sessions, players, from, to, tz, now });
    report.truncated = sids.length >= 2500;
    return res.status(200).json({ ok: true, report });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err.message || err) });
  }
}
