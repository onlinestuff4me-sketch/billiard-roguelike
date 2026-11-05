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

export const TTL_SECONDS = 400 * 24 * 3600;

export function redisConfig(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL || '';
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN || '';
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

/** Run commands in one round trip; returns each command's result (or throws). */
export async function pipeline(cmds, cfg = redisConfig()) {
  if (!cfg) throw new Error('storage not configured');
  if (!cmds.length) return [];
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

/** One batch from parseBatch → the commands that store it. */
export function writeCommands(batch) {
  const { pid, sid, events } = batch;
  const start = events[0].ts;
  const last = events[events.length - 1].ts;
  const cmds = [
    ['RPUSH', `ll:e:${sid}`, ...events.map((e) => JSON.stringify(e))],
    ['EXPIRE', `ll:e:${sid}`, TTL_SECONDS],
    ['HSETNX', `ll:s:${sid}`, 'start', String(start)],
    ['HSETNX', `ll:s:${sid}`, 'pid', pid],
    ['HSET', `ll:s:${sid}`, 'last', String(last)],
    ['HINCRBY', `ll:s:${sid}`, 'n', events.length],
    ['EXPIRE', `ll:s:${sid}`, TTL_SECONDS],
    ['ZADD', 'll:sessions', 'NX', start, sid],
    ['ZADD', 'll:players', 'NX', start, pid],
    ['ZADD', `ll:p:${pid}`, 'NX', start, sid],
    ['EXPIRE', `ll:p:${pid}`, TTL_SECONDS]
  ];
  const meta = events.find((e) => e.e === 'session_start');
  if (meta) cmds.push(['HSETNX', `ll:s:${sid}`, 'meta', JSON.stringify(meta)]);
  return cmds;
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
