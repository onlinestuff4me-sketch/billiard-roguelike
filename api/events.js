/**
 * POST /api/events — store a batch of anonymous gameplay events.
 *
 * Answers {ok:true} when stored. 503 {disabled:true} (storage not set up, or
 * this month's command budget spent) tells the client to keep its events on
 * the device for a later visit; any other refusal makes it stop for the page
 * load. Requests not from the game's own pages are refused before storage is
 * touched, and every command run is charged to the monthly budget (store.js).
 *
 * The client's IP is never stored. It is hashed with a daily salt into a
 * rate-limit counter that expires after a minute, and that is all.
 */
import { createHash } from 'node:crypto';
import { parseBatch } from './_lib/schema.js';
import { budget, budgetKey, pipeline, redisConfig, writeCommands } from './_lib/store.js';

const PER_MINUTE_PER_CLIENT = 60;

/** Set once this month's ingest budget is spent, so a warm instance stops asking Redis. */
let overMonth = null;

/**
 * Only the game's own pages may post. Browsers always send Origin on a POST,
 * and it has to name this deployment's host (or one in ANALYTICS_ORIGINS).
 * Checked before anything touches storage, so stray traffic costs nothing.
 */
function sameOrigin(req) {
  const origin = String(req.headers?.origin || '');
  if (!origin) return false;
  let host = '';
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const own = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '');
  const extra = String(process.env.ANALYTICS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return host === own || extra.includes(host) || extra.includes(origin);
}

function readBody(req) {
  if (req.body != null && req.body !== '') return Promise.resolve(req.body);
  return new Promise((resolve) => {
    let data = '';
    req.on?.('data', (c) => {
      data += c;
      if (data.length > 70000) req.destroy?.();
    });
    req.on?.('end', () => resolve(data));
    req.on?.('error', () => resolve(''));
    if (!req.on) resolve('');
  });
}

function clientKey(req) {
  const fwd = String(req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || req.socket?.remoteAddress || '');
  const ip = fwd.split(',')[0].trim();
  const salt = `${process.env.ANALYTICS_SALT || process.env.STATS_TOKEN || 'lightline'}:${new Date().toISOString().slice(0, 10)}`;
  return createHash('sha256').update(`${salt}|${ip}`).digest('hex').slice(0, 24);
}

export default async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

  if (!sameOrigin(req)) return res.status(403).json({ ok: false, error: 'not from the game' });

  const cfg = redisConfig();
  if (!cfg) return res.status(503).json({ ok: false, disabled: true, error: 'storage not configured' });

  const batch = parseBatch(await readBody(req));
  if (!batch.ok) return res.status(400).json({ ok: false, error: batch.error });

  // over this month's budget: the same answer as "not configured", so the
  // client keeps the events on the device and tries again on a later visit
  const month = budgetKey();
  const over = () => res.status(503).json({ ok: false, disabled: true, budget: true, error: 'monthly budget reached' });
  if (overMonth === month) return over();

  try {
    const { write, index } = writeCommands(batch);
    const ck = `ll:rl:c:${clientKey(req)}`;
    // charge the whole request up front (guard 3 + write 3, + index if new),
    // and start the client's 60 s rate-limit counter (INCR keeps SET's TTL)
    const est = 3 + write.length + (batch.events.some((e) => e.e === 'session_start') ? index.length : 0);
    const [used, , c] = await pipeline([['INCRBY', month, est], ['SET', ck, 0, 'EX', 60, 'NX'], ['INCR', ck]], cfg);
    if (used > budget().ingest) {
      overMonth = month;
      return over();
    }
    if (c > PER_MINUTE_PER_CLIENT) return res.status(429).json({ ok: false, error: 'slow down' });
    const out = await pipeline(write, cfg);
    if (out[2] === 1) await pipeline(index, cfg);
    return res.status(200).json({ ok: true, n: batch.events.length });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'storage error' });
  }
}
