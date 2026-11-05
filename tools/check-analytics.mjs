#!/usr/bin/env node
/**
 * check-analytics — the anonymous stats, end to end, against local mocks.
 *
 *   npm run build && npm run analytics
 *
 * Serves dist/ from a small local server that mounts the REAL /api/events and
 * /api/stats handlers, with storage pointed at an in-memory stand-in for
 * Upstash's REST API. Then plays the game in headless Chromium: boot, Play
 * (a first visit, so the lessons), one cancelled aim, one shot, and leaving
 * the page. It checks:
 *
 *   ORDER      the events arrive in the order they happened
 *   FIELDS     each one carries valid, typed fields (and nothing personal)
 *   TRANSPORT  batches go by fetch, the last one by sendBeacon on pagehide
 *   STORAGE    the server stored them, and /api/stats reports them back
 *   NO-OP      with storage unset the client parks events on the device
 *              after one refusal and the game carries on; once storage
 *              exists the next visit uploads them; the opt-out stops it
 *   METRICS    the report over demo data is self-consistent
 *   DASHBOARD  the page renders with the token, and refuses without it
 *   BUDGET     every command is charged to the month; over the cap nothing
 *              is written, devices keep the events, and reads stop too
 */
import http from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { browserPath } from './sim.mjs';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIST = join(ROOT, 'dist');
const OUT = process.env.ANALYTICS_SHOTS || '';

const fails = [];
const check = (ok, what, detail = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${what}${detail ? ` — ${detail}` : ''}`);
  if (!ok) fails.push(what);
};

/* ------------------------------------------------------------------ *
 * a stand-in for Upstash's REST pipeline: just the commands store.js uses
 * ------------------------------------------------------------------ */
function fakeRedis() {
  const kv = new Map();
  const z = (k) => (kv.has(k) ? kv.get(k) : kv.set(k, new Map()).get(k));
  const h = z;
  const l = (k) => (kv.has(k) ? kv.get(k) : kv.set(k, []).get(k));
  const zsorted = (k) => [...z(k).entries()].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
  const run = ([cmd, ...a]) => {
    switch (cmd.toUpperCase()) {
      case 'SET': {
        const nx = a.includes('NX');
        if (nx && kv.has(a[0])) return null;
        kv.set(a[0], String(a[1]));
        return 'OK';
      }
      case 'SADD': {
        const set = kv.get(a[0]) instanceof Set ? kv.get(a[0]) : kv.set(a[0], new Set()).get(a[0]);
        const n = set.size;
        a.slice(1).forEach((m) => set.add(String(m)));
        return set.size - n;
      }
      case 'SREM': {
        const set = kv.get(a[0]);
        if (!(set instanceof Set)) return 0;
        let n = 0;
        for (const m of a.slice(1)) if (set.delete(String(m))) n++;
        return n;
      }
      case 'SMEMBERS':
        return kv.get(a[0]) instanceof Set ? [...kv.get(a[0])] : [];
      case 'GET':
        return kv.has(a[0]) ? String(kv.get(a[0])) : null;
      case 'INCRBY': {
        const v = Number(kv.get(a[0]) || 0) + Number(a[1]);
        kv.set(a[0], String(v));
        return v;
      }
      case 'INCR': {
        const v = Number(kv.get(a[0]) || 0) + 1;
        kv.set(a[0], String(v));
        return v;
      }
      case 'EXPIRE':
        return 1;
      case 'RPUSH': {
        const list = l(a[0]);
        list.push(...a.slice(1).map(String));
        return list.length;
      }
      case 'LRANGE': {
        const list = l(a[0]);
        const end = Number(a[2]) < 0 ? list.length : Number(a[2]) + 1;
        return list.slice(Number(a[1]), end);
      }
      case 'HSETNX': {
        const m = h(a[0]);
        if (m.has(a[1])) return 0;
        m.set(a[1], String(a[2]));
        return 1;
      }
      case 'HSET':
        h(a[0]).set(a[1], String(a[2]));
        return 1;
      case 'HINCRBY': {
        const m = h(a[0]);
        const v = Number(m.get(a[1]) || 0) + Number(a[2]);
        m.set(a[1], String(v));
        return v;
      }
      case 'HGETALL':
        return kv.has(a[0]) ? [...h(a[0]).entries()].flat() : [];
      case 'ZADD': {
        const m = z(a[0]);
        const nx = a[1] === 'NX';
        const [score, member] = nx ? [a[2], a[3]] : [a[1], a[2]];
        if (nx && m.has(member)) return 0;
        m.set(String(member), Number(score));
        return 1;
      }
      case 'ZSCORE': {
        const v = z(a[0]).get(String(a[1]));
        return v == null ? null : String(v);
      }
      case 'ZRANGE': {
        const all = zsorted(a[0]);
        const end = Number(a[2]) < 0 ? all.length : Number(a[2]) + 1;
        const sl = all.slice(Number(a[1]), end);
        return a.includes('WITHSCORES') ? sl.flatMap(([m, s]) => [m, String(s)]) : sl.map(([m]) => m);
      }
      case 'ZREVRANGEBYSCORE': {
        const [key, max, min] = a;
        let all = zsorted(key).filter(([, s]) => s <= Number(max) && s >= Number(min)).reverse();
        const li = a.indexOf('LIMIT');
        if (li >= 0) all = all.slice(Number(a[li + 1]), Number(a[li + 1]) + Number(a[li + 2]));
        return all.map(([m]) => m);
      }
      case 'ZREMRANGEBYSCORE': {
        const m = z(a[0]);
        let n = 0;
        for (const [k, s] of m) if (s >= Number(a[1]) && s <= Number(a[2])) m.delete(k), n++;
        return n;
      }
      default:
        throw new Error(`fake redis: ${cmd} not implemented`);
    }
  };
  return { kv, run };
}

/* ------------------------------------------------------------------ *
 * the local server: dist/ plus the real handlers, Vercel-style req/res
 * ------------------------------------------------------------------ */
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.map': 'application/json', '.mp3': 'audio/mpeg', '.webp': 'image/webp' };

function vercelRes(res) {
  res.status = (c) => ((res.statusCode = c), res);
  res.json = (o) => (res.setHeader('content-type', 'application/json'), res.end(JSON.stringify(o)), res);
  return res;
}

async function startServer({ events, stats, redis, log }) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://local');
    vercelRes(res);
    if (url.pathname === '/__redis/pipeline') {
      let body = '';
      for await (const c of req) body += c;
      try {
        const out = JSON.parse(body).map((cmd) => {
          try {
            return { result: redis.run(cmd) };
          } catch (e) {
            return { error: e.message };
          }
        });
        return res.json(out);
      } catch (e) {
        return res.status(400).json({ error: e.message });
      }
    }
    if (url.pathname === '/api/events' || url.pathname === '/api/stats') {
      let body = '';
      for await (const c of req) body += c;
      req.body = body;
      req.query = Object.fromEntries(url.searchParams);
      if (url.pathname === '/api/events' && !req.headers['x-vercel-ip-city']) {
        // what Vercel's edge adds to every request (the IP itself never reaches us)
        req.headers['x-vercel-ip-city'] = 'San%20Francisco';
        req.headers['x-vercel-ip-country-region'] = 'CA';
        req.headers['x-vercel-ip-country'] = 'US';
      }
      if (url.pathname === '/api/events') log.push({ at: Date.now(), body, ua: req.headers['user-agent'], type: req.headers['content-type'], purpose: req.headers['sec-purpose'] || '' });
      try {
        return await (url.pathname === '/api/events' ? events : stats)(req, res);
      } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
      }
    }
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    if (path.endsWith('/')) path += 'index.html';
    const file = join(DIST, path);
    try {
      const s = await stat(file);
      if (!s.isFile()) throw new Error('not a file');
      res.setHeader('content-type', TYPES[extname(file)] || 'application/octet-stream');
      return res.end(await readFile(file));
    } catch {
      res.statusCode = 404;
      return res.end('not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

/* ------------------------------------------------------------------ */

async function main() {
  try {
    await stat(join(DIST, 'index.html'));
    await stat(join(DIST, 'dashboard.html'));
  } catch {
    console.error('dist/ is missing or stale — run `npm run build` first');
    process.exit(1);
  }

  const redis = fakeRedis();
  const log = [];
  const TOKEN = 'test-token-0123456789';
  // the handlers read process.env per request, so the URL can be set once the server is up
  const events = (await import('../api/events.js')).default;
  const stats = (await import('../api/stats.js')).default;
  const { server, url } = await startServer({ events, stats, redis, log });
  process.env.STATS_TOKEN = TOKEN;
  process.env.KV_REST_API_URL = `${url}/__redis`;
  process.env.KV_REST_API_TOKEN = 'fake';

  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: browserPath() });
  const errors = [];

  try {
    /* ---------------- 1. play: boot, Play, a lesson, a cancel, a shot ---------------- */
    console.log('\nplay through');
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: false, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('lightline-stats-force', '1');
      } catch {}
      for (const k of ['setValueAtTime', 'exponentialRampToValueAtTime', 'linearRampToValueAtTime']) {
        const f = AudioParam.prototype[k];
        AudioParam.prototype[k] = function (v, t) {
          try {
            return f.call(this, v, t);
          } catch {
            return this;
          }
        };
      }
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e.message)));
    await page.goto(url + '/', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    check(await page.isVisible('#menu-privacy'), 'privacy note shows on the home screen');
    const st0 = await page.evaluate(() => window.__analytics?.state());
    check(st0?.enabled === true && !!st0.pid && !!st0.sid, 'client enabled with an anonymous id', JSON.stringify(st0));

    await page.click('#btn-play');
    await page.waitForTimeout(2500);
    const lesson = await page.evaluate(() => window.__game?.tutorial?.lesson?.id);
    check(lesson === 'angle', 'Play on a first visit opens lesson 1', String(lesson));

    // the stage, and a drag well clear of the coaching band
    const box = await page.evaluate(() => {
      const r = document.getElementById('stage').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.62 };
    });
    // a cancelled aim: pull back, then the window loses focus mid-aim, which
    // the game treats as a cancel (main.js: blur → input.cancel())
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x, box.y + i * 14, { steps: 1 }), await page.waitForTimeout(16);
    await page.waitForTimeout(250);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.mouse.up();
    await page.waitForTimeout(500);
    // a real shot: a long pull straight down, released
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + i * 2, box.y + i * 16, { steps: 1 }), await page.waitForTimeout(20);
    await page.waitForTimeout(700);
    await page.mouse.up();
    // let the lesson resolve the rep
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.__analytics.flush());
    await page.waitForTimeout(800);
    const sid = (await page.evaluate(() => window.__analytics.state())).sid;
    // leaving: pagehide sends the rest by beacon
    await page.goto('about:blank');
    await page.waitForTimeout(1500);

    const batches = log.map((x) => {
      try {
        return JSON.parse(x.body);
      } catch {
        return null;
      }
    }).filter(Boolean);
    const evs = batches.filter((b) => b.sid === sid).flatMap((b) => b.events);
    const names = evs.map((e) => e.e);
    console.log(`    ${batches.length} batches, ${evs.length} events: ${names.join(' → ')}`);
    check(log.every((x) => x.type === 'text/plain'), 'batches are sent as text/plain (no CORS preflight)');

    const expect = ['session_start', 'boot', 'play_pressed', 'tut_start', 'lesson_start', 'cancel', 'shot', 'leave'];
    let at = -1;
    const missing = [];
    for (const name of expect) {
      const i = names.indexOf(name, at + 1);
      if (i < 0) missing.push(name);
      else at = i;
    }
    check(!missing.length, 'events arrive in order: ' + expect.join(' → '), missing.length ? `missing or out of order: ${missing.join(', ')}` : '');
    const ts = evs.map((e) => e.t);
    check(ts.every((t, i) => i === 0 || t >= ts[i - 1] - 1), 'event times only move forward');

    const one = (n) => evs.find((e) => e.e === n) || {};
    const ss = one('session_start');
    check(ss.wd === 1, 'an automated browser marks its session (so it is filed as internal)');
    check(typeof ss.vw === 'number' && typeof ss.vh === 'number' && (ss.touch === 0 || ss.touch === 1) && typeof ss.br === 'string' && typeof ss.os === 'string', 'session_start carries viewport, input and browser family', JSON.stringify({ vw: ss.vw, vh: ss.vh, touch: ss.touch, br: ss.br, os: ss.os }));
    check(ss.ret === 0 && ss.visits === 1, 'a first visit is not a returning player');
    const raw = JSON.stringify(batches);
    check(!/Mozilla|HeadlessChrome|127\.0\.0\.1:\d+\/\?|@/.test(raw.replace(/"host":"[^"]*"/g, '')), 'no raw user agent, address or email-like data in any batch');
    check(Number.isFinite(one('boot').ms) && one('boot').ms > 0, 'boot time recorded', `${one('boot').ms} ms`);
    const ls = one('lesson_start');
    check(ls.ls === 'angle' && ls.li === 0 && ls.of >= 1, 'lesson_start names the lesson and its place', JSON.stringify(ls));
    const sh = one('shot');
    check(sh.ls === 'angle' && sh.n === 1, 'shot is counted against the lesson', JSON.stringify(sh));
    check(typeof sh.pw === 'number' && sh.pw > 0 && sh.pw <= 1, 'shot power is a 0–1 number', String(sh.pw));
    check(Number.isFinite(sh.aimMs) && sh.aimMs >= 500, 'shot records time spent aiming', `${sh.aimMs} ms`);
    check(sh.cancels === 1, 'shot carries the aim cancels before it', String(sh.cancels));
    check(Number.isFinite(sh.pots) && sh.pots >= 0, 'shot records balls potted', String(sh.pots));
    check(Number.isFinite(one('cancel').ms), 'cancel records how long the aim was held');
    const lv = one('leave');
    check(lv.at === 'lesson' && lv.ls === 'angle' && Number.isFinite(lv.dur), 'leave says where the player was', JSON.stringify(lv));
    check(log.some((x) => x.body.includes('"leave"')), 'the last batch is delivered on pagehide, after the page is gone');
    check(!names.includes('table_start'), 'the attract table behind the menu records nothing');
    check(!errors.length, 'no page errors', errors.join(' | '));

    /* ---------------- 2. storage and the stats endpoint ---------------- */
    console.log('\nstorage and /api/stats');
    check(redis.kv.has(`ll:e:${sid}`) && redis.kv.get(`ll:e:${sid}`).length === evs.length, 'every event is stored under its session', `${redis.kv.get(`ll:e:${sid}`)?.length} stored`);
    check(![...redis.kv.keys()].some((k) => /\d+\.\d+\.\d+\.\d+/.test(k)), 'no IP address in any stored key');
    const unauth = await fetch(`${url}/api/stats`);
    check(unauth.status === 401, '/api/stats without the token is refused', String(unauth.status));
    const res = await fetch(`${url}/api/stats?from=${Date.now() - 864e5}&to=${Date.now() + 1000}`, { headers: { authorization: `Bearer ${TOKEN}` } });
    const body = await res.json();
    check(res.ok && body.report?.overview.players === 0, 'our own (automated) session stays out of the players report', JSON.stringify(body.report?.overview).slice(0, 80));
    const rep = body.internal;
    check(rep?.overview.players === 1 && rep.overview.sessions === 1, '…and is in the internal report: one player, one session', JSON.stringify(rep?.overview).slice(0, 160));
    check(rep?.users[0]?.place === 'San Francisco, CA, US' && rep.sessions[0]?.place === 'San Francisco, CA, US', 'each player and session has a city', rep?.users[0]?.place);
    check(!JSON.stringify(body).match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/), 'and no IP address appears anywhere in the stats');
    check(/\((PST|PDT)\)/.test(rep?.narrative.range || ''), 'the summary\'s dates say they are Pacific', rep?.narrative.range);
    const reached = rep?.funnel.first.filter((f) => f.n === 1).map((f) => f.id);
    check(reached?.join() === 'load,play,lesson1', 'funnel: load → Play → lesson 1, and no further', reached?.join());
    check(rep?.tutorial.lessons[0]?.id === 'angle' && rep.tutorial.lessons[0].endedHere === 1, 'the session is recorded as ending inside lesson 1');
    check(rep?.narrative.lines.length >= 2, 'a narrative is written', rep?.narrative.lines[0]);
    const sres = await (await fetch(`${url}/api/stats?session=${sid}`, { headers: { authorization: `Bearer ${TOKEN}` } })).json();
    check(sres.session?.events?.length === evs.length && sres.session.events.every((e, i, a) => !i || e.ts >= a[i - 1].ts), 'session drill-down returns the events in order');

    // the endpoint's validation
    // a browser always sends Origin on a POST; these stand in for the game's own page
    const post = (b, origin = url) => fetch(`${url}/api/events`, { method: 'POST', headers: { 'content-type': 'text/plain', ...(origin ? { origin } : {}) }, body: typeof b === 'string' ? b : JSON.stringify(b) });
    const keysBefore = redis.kv.size;
    check((await post({ pid: 'abcdef1234567890', sid: 'noorigin12345678', t0: Date.now(), sent: Date.now(), events: [{ e: 'boot', t: 0 }] }, '')).status === 403, 'a post with no Origin is refused…');
    check((await post({ pid: 'abcdef1234567890', sid: 'elsewhere1234567', t0: Date.now(), sent: Date.now(), events: [{ e: 'boot', t: 0 }] }, 'https://example.com')).status === 403, '…and so is one from another site');
    check(redis.kv.size === keysBefore, 'neither touches storage (so neither costs anything)');
    check((await post('not json')).status === 400, 'garbage is refused');
    check((await post({ pid: 'x', sid: 'y', t0: 1, sent: 1, events: [{ e: 'boot', t: 0 }] })).status === 400, 'bad ids are refused');
    const junk = { pid: 'abcdef1234567890', sid: 'junk1234567890ab', t0: Date.now(), sent: Date.now(), events: [{ e: 'boot', t: 0, nested: { a: 1 }, 'bad key': 1, ok: 'x'.repeat(500) }, { e: 'not_an_event', t: 1 }] };
    check((await post(junk)).ok, 'a batch with junk fields is accepted…');
    const stored = (redis.kv.get('ll:e:junk1234567890ab') || []).map((s) => JSON.parse(s));
    check(stored.length === 1 && !('nested' in stored[0]) && !('bad key' in stored[0]) && stored[0].ok.length === 200, '…with the junk stripped', JSON.stringify(stored[0]).slice(0, 80));

    /* ---------------- 2b. the run: skip the lessons, table 1, its end ---------------- */
    console.log('\nthe run');
    const pr = await ctx.newPage();
    pr.on('pageerror', (e) => errors.push(String(e.message)));
    await pr.goto(url + '/?internal=1', { waitUntil: 'load' });
    await pr.waitForTimeout(1200);
    check((await pr.evaluate(() => window.__analytics.queue().find((e) => e.e === 'session_start')?.int)) === 1, 'opening the game with ?internal=1 marks the device internal');
    const sid2 = (await pr.evaluate(() => window.__analytics.state())).sid;
    await pr.click('#btn-play');
    await pr.waitForTimeout(1500);
    await pr.click('#coach-skip');
    await pr.waitForTimeout(1500);
    // the table's end as the game banks it (completeRoom / failRoom → rules.endRoom),
    // called directly: playing a table out is not what this check is about
    await pr.evaluate(() => window.__game.rules.endRoom());
    await pr.waitForTimeout(300);
    await pr.evaluate(() => window.__analytics.flush());
    await pr.waitForTimeout(800);
    const evs2 = log.map((x) => { try { return JSON.parse(x.body); } catch { return null; } }).filter((b) => b?.sid === sid2).flatMap((b) => b.events);
    const n2 = evs2.map((e) => e.e);
    console.log(`    ${n2.join(' → ')}`);
    const want2 = ['play_pressed', 'tut_start', 'lesson_start', 'lesson_skip', 'tut_skip', 'run_start', 'table_start', 'table_end', 'heart_lost'];
    let at2 = -1;
    const miss2 = want2.filter((name) => {
      const i = n2.indexOf(name, at2 + 1);
      if (i < 0) return true;
      at2 = i;
      return false;
    });
    check(!miss2.length, 'skip → run → table 1 → its end, in order', miss2.join(', '));
    const tsr = evs2.find((e) => e.e === 'table_start') || {};
    check(tsr.lv === 1 && typeof tsr.name === 'string' && tsr.target > 0 && tsr.rack > 0 && tsr.shots > 0, 'table_start names the table, its rack, shots and target', JSON.stringify(tsr));
    const ter = evs2.find((e) => e.e === 'table_end') || {};
    check(ter.lv === 1 && ter.cleared === 0 && Number.isFinite(ter.score) && ter.target === tsr.target && ter.lost === 1, 'table_end: failed, score against target, a heart lost', JSON.stringify(ter));
    await pr.close();

    /* ---------------- 3. no-op without storage; opt-out ---------------- */
    console.log('\nno-op');
    delete process.env.KV_REST_API_URL;
    const page2 = await ctx.newPage();
    const errs2 = [];
    page2.on('pageerror', (e) => errs2.push(String(e.message)));
    const before = log.length;
    await page2.goto(url + '/', { waitUntil: 'load' });
    await page2.waitForTimeout(1200);
    await page2.evaluate(() => window.__analytics.flush());
    await page2.waitForTimeout(600);
    const st2 = await page2.evaluate(() => window.__analytics.state());
    check(st2.parked === true && st2.queued === 0 && st2.backlog > 0, 'unprovisioned: one 503 parks the events on the device', JSON.stringify(st2));
    const sidParked = st2.sid;
    await page2.click('#btn-play');
    await page2.waitForTimeout(1500);
    await page2.evaluate(() => window.__analytics.flush());
    await page2.waitForTimeout(400);
    check(log.length - before === 1, 'nothing more is sent after the refusal', `${log.length - before} requests`);
    const st2b = await page2.evaluate(() => window.__analytics.state());
    check(st2b.backlog > st2.backlog, 'later events join the backlog', `${st2.backlog} → ${st2b.backlog}`);
    // (lessons on a first visit, the play screen once they are done or skipped)
    const went = await page2.evaluate(() => !!window.__game?.tutorial?.lesson || !document.getElementById('menu-play').hidden);
    check(went && !errs2.length, 'the game plays on regardless', errs2.join(' | '));
    await page2.close();
    check(!redis.kv.has(`ll:e:${sidParked}`), 'nothing from the parked session reached storage yet');

    // storage arrives: the next visit uploads the backlog under the old session
    console.log('\nbacklog');
    process.env.KV_REST_API_URL = `${url}/__redis`;
    const page2c = await ctx.newPage();
    await page2c.goto(url + '/', { waitUntil: 'load' });
    await page2c.waitForTimeout(800);
    // what the next visit finds: everything parked, including the closing page's leave
    const found = (await page2c.evaluate(() => window.__analytics.state())).backlog;
    await page2c.evaluate(() => window.__analytics.flush());
    for (let i = 0; i < 20; i++) {
      await page2c.waitForTimeout(250);
      if ((await page2c.evaluate(() => window.__analytics.state())).backlog === 0) break;
      await page2c.evaluate(() => window.__analytics.drain());
    }
    const st2c = await page2c.evaluate(() => window.__analytics.state());
    const parkedStored = (redis.kv.get(`ll:e:${sidParked}`) || []).map((x) => JSON.parse(x));
    check(st2c.confirmed && st2c.backlog === 0, 'the backlog empties once the server accepts', JSON.stringify(st2c));
    check(parkedStored.length === found && found > st2b.backlog && parkedStored[0]?.e === 'session_start', 'every parked event is stored under its original session', `${parkedStored.length} of ${found}`);
    check(parkedStored.some((e) => e.e === 'play_pressed') && parkedStored.some((e) => e.e === 'leave') && parkedStored.every((e, i, a) => !i || e.ts >= a[i - 1].ts), 'in order, with the times they happened');
    const tooOld = await fetch(`${url}/api/events`, { method: 'POST', headers: { 'content-type': 'text/plain', origin: url }, body: JSON.stringify({ pid: 'abcdef1234567890', sid: 'old1234567890abc', t0: Date.now() - 40 * 864e5, sent: Date.now(), late: 1, events: [{ e: 'boot', t: 0 }] }) });
    check(tooOld.status === 400, 'a backlog older than 31 days is refused');
    await page2c.close();

    process.env.KV_REST_API_URL = `${url}/__redis`;
    const page3 = await ctx.newPage();
    await page3.goto(url + '/', { waitUntil: 'load' });
    await page3.waitForTimeout(1000);
    await page3.click('#btn-settings');
    const label0 = await page3.textContent('#set-stats');
    await page3.click('#set-stats');
    const label1 = await page3.textContent('#set-stats');
    const st3 = await page3.evaluate(() => window.__analytics.state());
    check(/On/.test(label0) && /Off/.test(label1) && st3.enabled === false, 'the Settings switch turns stats off', `${label0} → ${label1}`);
    await page3.reload({ waitUntil: 'load' });
    await page3.waitForTimeout(800);
    check((await page3.evaluate(() => window.__analytics.state())).enabled === false, 'and it stays off across reloads');
    await page3.close();
    const dnt = await browser.newContext({ extraHTTPHeaders: { DNT: '1' } });
    await dnt.addInitScript(() => {
      localStorage.setItem('lightline-stats-force', '1');
      Object.defineProperty(Navigator.prototype, 'doNotTrack', { get: () => '1' });
    });
    const page4 = await dnt.newPage();
    await page4.goto(url + '/', { waitUntil: 'load' });
    await page4.waitForTimeout(800);
    check((await page4.evaluate(() => window.__analytics.state())).enabled === false, 'Do Not Track is respected');
    await dnt.close();
    let limited = false;
    for (let i = 0; i < 80 && !limited; i++) limited = (await post({ ...junk, events: [{ e: 'boot', t: i }] })).status === 429;
    check(limited, 'the endpoint is rate-limited per client');

    // the junk batches above are the only "real player"; file it under internal and back
    const auth = { authorization: `Bearer ${TOKEN}` };
    const statsNow = async () => (await fetch(`${url}/api/stats?from=${Date.now() - 864e5}&to=${Date.now() + 1000}`, { headers: auth })).json();
    const s0 = await statsNow();
    check(s0.report.overview.players === 1 && s0.internal.overview.players === 1, 'one player, and one of us, kept apart', `${s0.report.overview.players} / ${s0.internal.overview.players}`);
    const mk = await fetch(`${url}/api/stats?mark=abcdef1234567890&internal=1`, { method: 'POST', headers: auth });
    const s1 = await statsNow();
    check(mk.ok && s1.report.overview.players === 0 && s1.internal.overview.players === 2, 'marking a player internal moves them out of the players report');
    await fetch(`${url}/api/stats?mark=abcdef1234567890&internal=0`, { method: 'POST', headers: auth });
    check((await statsNow()).report.overview.players === 1, 'and unmarking moves them back');
    check((await fetch(`${url}/api/stats?mark=abcdef1234567890&internal=1`, { method: 'POST' })).status === 401, 'marking needs the token');

    /* ---------------- 4. metrics over demo data ---------------- */
    console.log('\nmetrics');
    const demo = await (await fetch(`${url}/api/stats?demo=1`)).json();
    const r = demo.report;
    const f = r.funnel.first;
    check(f.every((s, i) => !i || s.n <= f[i - 1].n), 'the funnel never grows from one step to the next');
    check(r.overview.newPlayers + r.overview.returningPlayers === r.overview.players, 'new + returning = players');
    check(r.daily.reduce((a, d) => a + d.sessions, 0) === r.overview.sessions, 'sessions per day add up to the total');
    check(r.tables.every((t) => t.clears + t.fails <= t.attempts), 'no table ends more often than it starts');
    check(r.thresholds.stallMs === 30000 && r.thresholds.rageMs === 60000 && r.thresholds.stallCancels === 5, 'thresholds: stall 30 s or 5 cancels, rage reload 60 s');
    const blank = r.narrative.lines.find((l) => /undefined|NaN|null/.test(l.replace(/“[^”]*”/g, '')));
    check(!blank, 'the narrative has no blanks in it', blank || '');

    /* ---------------- 5. the dashboard ---------------- */
    console.log('\ndashboard');
    for (const vp of [{ width: 390, height: 844, name: 'phone' }, { width: 1280, height: 900, name: 'desktop' }]) {
      const dctx = await browser.newContext({ viewport: vp, deviceScaleFactor: OUT ? 2 : 1 });
      const dp = await dctx.newPage();
      const derr = [];
      dp.on('pageerror', (e) => derr.push(e.message));
      await dp.goto(`${url}/dashboard.html?demo=1`, { waitUntil: 'load' });
      await dp.waitForSelector('.story p');
      const over = await dp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(over <= 0 && !derr.length, `${vp.name}: demo dashboard renders with no sideways scroll`, `${over}px over ${derr.join(' ')}`);
      if (OUT) {
        await mkdir(OUT, { recursive: true });
        await dp.screenshot({ path: join(OUT, `dashboard-${vp.name}.png`), fullPage: true });
      }
      await dp.click('#sessions tr.click');
      await dp.waitForSelector('#drill .tl li');
      const items = await dp.$$eval('#drill .tl li', (l) => l.length);
      check(items > 3, `${vp.name}: a session opens as a timeline`, `${items} rows`);
      if (OUT) await dp.screenshot({ path: join(OUT, `timeline-${vp.name}.png`) });
      await dctx.close();
    }
    const gctx = await browser.newContext();
    const gp = await gctx.newPage();
    await gp.goto(`${url}/dashboard.html`, { waitUntil: 'load' });
    check(await gp.isVisible('#gate-token'), 'without a token the dashboard asks for one');
    await gp.fill('#gate-token', 'wrong');
    await gp.click('.gate button');
    await gp.waitForSelector('.gate .err');
    check(true, 'a wrong token is refused');
    // a fresh page: a hash change on the same URL would not reload it
    await gp.goto('about:blank');
    await gp.goto(`${url}/dashboard.html#token=${TOKEN}`, { waitUntil: 'load' });
    await gp.waitForSelector('.story p');
    const story = await gp.textContent('.story');
    // players: only the junk-validation batch; everything the browser did is ours
    check(/1 player \(1 new/.test(story) && /\((PST|PDT)\)/.test(story), 'with the token it shows the players report, dated in Pacific time', story.slice(0, 90));
    const firstRow = await gp.textContent('#sessions tr');
    check(/ (PST|PDT)/.test(firstRow), 'session times say PST', firstRow.slice(0, 60));
    check(await gp.evaluate(() => localStorage.getItem('lightline-internal') === '1'), 'opening the dashboard marks this device internal');
    await gp.click('#view-mode [data-v="internal"]');
    const istory = await gp.textContent('.story');
    check(/1 player\b/.test(istory), 'the Internal switch shows our own sessions on their own', istory.slice(0, 90));
    check(/Storage this month: [\d,]+ of 350,000 commands/.test(await gp.textContent('footer')), 'the dashboard shows this month\'s storage use against the budget', (await gp.textContent('footer')).slice(0, 90));
    await gctx.close();

    /* ---------------- 6. the monthly budget ---------------- */
    // last, because once spent the handler remembers it for the month
    console.log('\nbudget');
    const month = `ll:budget:${new Date().toISOString().slice(0, 7)}`;
    const used = Number(redis.kv.get(month) || 0);
    check(used > 0, 'every request is charged to this month\'s budget', `${used} commands so far`);
    redis.kv.set(month, String(297500));
    const spent = await post({ pid: 'abcdef1234567890', sid: 'budget1234567890', t0: Date.now(), sent: Date.now(), events: [{ e: 'session_start', t: 0 }, { e: 'boot', t: 1 }] });
    const spentBody = await spent.json();
    check(spent.status === 503 && spentBody.disabled && spentBody.budget, 'over the ingest budget, events are refused as "not configured"', JSON.stringify(spentBody));
    check(!redis.kv.has('ll:e:budget1234567890'), 'and nothing is written');
    // a fresh browser: the shared one turned stats off in the opt-out check
    const bctx = await browser.newContext();
    await bctx.addInitScript(() => localStorage.setItem('lightline-stats-force', '1'));
    const pb = await bctx.newPage();
    await pb.goto(url + '/', { waitUntil: 'load' });
    await pb.waitForTimeout(800);
    await pb.evaluate(() => window.__analytics.flush());
    await pb.waitForTimeout(500);
    const stb = await pb.evaluate(() => window.__analytics.state());
    check(stb.parked && stb.backlog > 0, 'so players\' devices keep them for next month', JSON.stringify(stb));
    await bctx.close();
    const r1 = await fetch(`${url}/api/stats?from=${Date.now() - 864e5}&to=${Date.now()}`, { headers: { authorization: `Bearer ${TOKEN}` } });
    check(r1.ok, 'the dashboard still opens between the ingest cap and the total');
    redis.kv.set(month, String(350000));
    const r2 = await fetch(`${url}/api/stats?from=${Date.now() - 864e5}&to=${Date.now()}`, { headers: { authorization: `Bearer ${TOKEN}` } });
    check(r2.status === 503, 'at the total, the dashboard stops reading too', (await r2.json()).error);
    await ctx.close();
  } finally {
    await browser.close();
    server.close();
  }

  console.log(fails.length ? `\n${fails.length} failed:\n  ${fails.join('\n  ')}` : '\nall analytics checks pass');
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
