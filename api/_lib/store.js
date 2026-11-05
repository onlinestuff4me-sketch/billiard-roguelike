/**
 * Storage: Upstash Redis over its REST API, so no npm package is needed.
 *
 * Provision it from the Vercel dashboard: Storage (or Marketplace) → Upstash
 * for Redis → connect to this project. That sets KV_REST_API_URL and
 * KV_REST_API_TOKEN (the older Upstash integration sets UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN; either pair works). Until one pair is present
 * every function answers "not configured" and the game sends nothing more.
 *
 * KEYS (all under `ll:`)
 *   ll:e:<sid>       list   the session's events, JSON, in arrival order
 *   ll:s:<sid>       hash   pid, start, last, n, meta (the session_start event)
 *   ll:sessions      zset   sid  → session start (ms)
 *   ll:players       zset   pid  → first seen (ms)
 *   ll:p:<pid>       zset   sid  → session start, one per player
 *   ll:rl:<...>      string short-lived rate-limit counters (60 s)
 */

/** How long a session is kept. Short enough that storage stays far under 1 GB. */
export const TTL_SECONDS = 180 * 24 * 3600;

/**
 * THE MONTHLY BUDGET, in Redis commands (Upstash pay-as-you-go bills $0.20
 * per 100K). Every function charges what it runs to `ll:budget:<YYYY-MM>`:
 * new events stop being stored at `ingest` (players' devices keep them, see
 * src/analytics/Analytics.js), and the dashboard stops at `total`. 350K is
 * $0.70 at worst, which leaves room for storage under a $1 month. Set
 * ANALYTICS_MONTHLY_COMMANDS to move it; the Upstash budget is the backstop.
 */
export function budget(env = process.env) {
  const total = Math.max(10000, Number(env.ANALYTICS_MONTHLY_COMMANDS) || 350000);
  return { total, ingest: Math.floor(total * 0.85) };
}
export const budgetKey = (d = new Date()) => `ll:budget:${d.toISOString().slice(0, 7)}`;
/** Commands run by this instance since the last reset (stats charges its reads with it). */
export const usage = { commands: 0 };

export function redisConfig(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '';
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

/** Run commands in one round trip; returns each command's result (or throws). */
export async function pipeline(cmds, cfg = redisConfig()) {
  if (!cfg) throw new Error('storage not configured');
  if (!cmds.length) return [];
  usage.commands += cmds.length;
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: 'POST',
    headers: { authorization: `Bearer ${cfg.token}`, 'content-type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!res.ok) throw new Error(`storage ${res.status}`);
  const out = await res.json();
  return out.map((r) => {
    if (r && r.error) throw new Error(`storage: ${r.error}`);
    return r ? r.result : null;
  });
}

/** Large reads in slices, so no single response gets huge. */
export async function pipelineChunked(cmds, size = 60, cfg = redisConfig()) {
  const out = [];
  for (let i = 0; i < cmds.length; i += size) out.push(...(await pipeline(cmds.slice(i, i + size), cfg)));
  return out;
}

export const hashToObject = (flat) => {
  const o = {};
  if (Array.isArray(flat)) for (let i = 0; i + 1 < flat.length; i += 2) o[flat[i]] = flat[i + 1];
  else if (flat && typeof flat === 'object') Object.assign(o, flat);
  return o;
};

export const pairs = (flat) => {
  const out = [];
  if (Array.isArray(flat)) for (let i = 0; i + 1 < flat.length; i += 2) out.push([flat[i], Number(flat[i + 1])]);
  return out;
};

const parseJSON = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

/**
 * One batch from parseBatch → the commands that store it, in two parts so the
 * steady state is cheap (Upstash bills per command):
 *   write  every batch: append the events, move `last`, and HSETNX `start`,
 *          whose answer (1) says this is the session's first batch
 *   index  only then: the ids, the indexes, the expiry
 */
export function writeCommands(batch) {
  const { pid, sid, events } = batch;
  const start = events[0].ts;
  const last = events[events.length - 1].ts;
  const write = [
    ['RPUSH', `ll:e:${sid}`, ...events.map((e) => JSON.stringify(e))],
    ['HSET', `ll:s:${sid}`, 'last', String(last)],
    ['HSETNX', `ll:s:${sid}`, 'start', String(start)]
  ];
  const index = [
    ['HSETNX', `ll:s:${sid}`, 'pid', pid],
    ['EXPIRE', `ll:e:${sid}`, TTL_SECONDS],
    ['EXPIRE', `ll:s:${sid}`, TTL_SECONDS],
    ['ZADD', 'll:sessions', 'NX', start, sid],
    ['ZADD', 'll:players', 'NX', start, pid],
    ['ZADD', `ll:p:${pid}`, 'NX', start, sid],
    ['EXPIRE', `ll:p:${pid}`, TTL_SECONDS]
  ];
  const meta = events.find((e) => e.e === 'session_start');
  if (meta) index.push(['HSETNX', `ll:s:${sid}`, 'meta', JSON.stringify(meta)]);
  return { write, index };
}

/** Sessions that started in [from, to], newest first, at most `limit`. */
export async function sessionIds(from, to, limit = 2500, cfg) {
  const r = await pipeline([['ZREVRANGEBYSCORE', 'll:sessions', to, from, 'LIMIT', 0, limit]], cfg);
  return r[0] || [];
}

/** Full sessions: meta hash and events. Missing (expired) ones are dropped. */
export async function loadSessions(sids, cfg) {
  const cmds = [];
  for (const sid of sids) cmds.push(['HGETALL', `ll:s:${sid}`], ['LRANGE', `ll:e:${sid}`, 0, 1999]);
  const res = await pipelineChunked(cmds, 60, cfg);
  const out = [];
  for (let i = 0; i < sids.length; i++) {
    const h = hashToObject(res[i * 2]);
    if (!h.pid) continue;
    const events = (res[i * 2 + 1] || []).map(parseJSON).filter(Boolean).sort((a, b) => a.ts - b.ts);
    if (!events.length) continue;
    out.push({
      sid: sids[i],
      pid: h.pid,
      start: Number(h.start) || events[0].ts,
      last: Math.max(Number(h.last) || 0, events[events.length - 1].ts),
      meta: parseJSON(h.meta) || events.find((e) => e.e === 'session_start') || {},
      events
    });
  }
  return out;
}

/** For each player: first seen, and every session start they have. */
export async function loadPlayers(pids, cfg) {
  const cmds = [];
  for (const pid of pids) cmds.push(['ZSCORE', 'll:players', pid], ['ZRANGE', `ll:p:${pid}`, 0, -1, 'WITHSCORES']);
  const res = await pipelineChunked(cmds, 100, cfg);
  const out = {};
  pids.forEach((pid, i) => {
    const starts = pairs(res[i * 2 + 1]).map(([sid, ts]) => ({ sid, ts }));
    out[pid] = { first: Number(res[i * 2]) || starts[0]?.ts || 0, sessions: starts };
  });
  return out;
}
