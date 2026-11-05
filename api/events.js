/**
 * POST /api/events — store a batch of anonymous gameplay events.
 *
 * Answers {ok:true} when stored. Anything else (not provisioned, refused,
 * rate-limited) tells the client to stop sending for this page load, which is
 * how the game degrades to a no-op before storage exists.
 *
 * The client's IP is never stored. It is hashed with a daily salt into a
 * rate-limit counter that expires after a minute, and that is all.
 */
import { createHash } from 'node:crypto';
import { parseBatch } from './_lib/schema.js';
import { pipeline, redisConfig, writeCommands } from './_lib/store.js';

const PER_MINUTE_PER_CLIENT = 60;
const PER_MINUTE_PER_SESSION = 20;

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

  const cfg = redisConfig();
  if (!cfg) return res.status(503).json({ ok: false, disabled: true, error: 'storage not configured' });

  const batch = parseBatch(await readBody(req));
  if (!batch.ok) return res.status(400).json({ ok: false, error: batch.error });

  try {
    const ck = `ll:rl:c:${clientKey(req)}`;
    const sk = `ll:rl:s:${batch.sid}`;
    // SET NX starts each counter with a 60 s life; INCR keeps that TTL
    const [, c, , s] = await pipeline([['SET', ck, 0, 'EX', 60, 'NX'], ['INCR', ck], ['SET', sk, 0, 'EX', 60, 'NX'], ['INCR', sk]], cfg);
    if (c > PER_MINUTE_PER_CLIENT || s > PER_MINUTE_PER_SESSION) {
      return res.status(429).json({ ok: false, error: 'slow down' });
    }
    await pipeline(writeCommands(batch), cfg);
    // occasionally drop index entries whose data has expired
    if (Math.random() < 0.01) {
      const old = Date.now() - 400 * 24 * 3600 * 1000;
      await pipeline([['ZREMRANGEBYSCORE', 'll:sessions', 0, old], ['ZREMRANGEBYSCORE', 'll:players', 0, old]], cfg);
    }
    return res.status(200).json({ ok: true, n: batch.events.length });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'storage error' });
  }
}
