# Anonymous gameplay stats

The game records anonymous sessions so we can see where players stall, churn,
succeed and fail. A dashboard at `/dashboard.html` tells that story.

Until storage is provisioned nothing reaches a server: the first send gets a
"not configured" answer (503), and from then on that page load keeps its
events **on the player's device** in a capped backlog (3,000 events, 30 days,
in localStorage) instead of sending them. When a later visit finds storage
set up, the backlog is uploaded one batch at a time under its original
session ids and times, so the dashboard shows that play as it happened.
Players who never come back after storage exists are the only ones lost, so
provision soon. Nothing breaks and nothing slows down either way; turning
stats off in Settings deletes the backlog.

## Turning it on (about 5 minutes, in the Vercel dashboard)

1. **Add storage.** Open the `billiard-roguelike` project on vercel.com, go to
   **Storage**, click **Create Database** (or **Browse Marketplace**), pick
   **Upstash → Upstash for Redis**, and choose the free plan and a region near
   your players. When it asks which projects to connect, pick
   `billiard-roguelike` and tick all three environments.
   That adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the project. (The
   older direct Upstash integration names them `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN`; either pair works.)
2. **Set the dashboard token.** Go to **Settings → Environment Variables**, add
   `STATS_TOKEN` with a long random value (for example the output of
   `openssl rand -hex 24`), for Production (and Preview if you want it there).
3. *(Optional)* `ANALYTICS_SALT`: any random string. It salts the hash used
   for the per-minute rate limit. If it is unset, `STATS_TOKEN` is used.
4. **Redeploy** (Deployments → ⋯ → Redeploy), because environment variables
   only reach new deployments.
5. Open `https://billiard-roguelike.vercel.app/dashboard.html#token=<STATS_TOKEN>`
   once. The page keeps the token in that browser's localStorage and removes it
   from the address bar. **Lock** forgets it.

`/dashboard.html?demo=1` shows the dashboard over made-up data, with no setup.

## Keeping the bill under $1 a month

**Use Upstash's Free plan.** It costs $0, needs no card, and allows
500,000 commands and 256 MB a month. The code below stops at 350,000
commands, so this project stays inside it. That is the only way to be
*certain* of paying nothing for storage. See *Switching to the Free plan*.

On pay-as-you-go instead ($0.20 per 100,000 commands, $0.25 per GB), the two
guardrails are:

1. **In Upstash.** Its lowest allowed budget is **$20**, so it cannot hold
   the bill to $1; set it to $20 anyway as a backstop against anything going
   badly wrong. At the budget the database is stopped. (Database page →
   **Usage** → **Change Budget**.)
2. **In the code (keeps you far from that stop).** Every command the
   functions run is counted in Redis under `ll:budget:<YYYY-MM>`:
   - at **297,500 commands** (85%) new events stop being stored; the server
     answers "not configured" and players' devices keep their events in the
     backlog to upload next month;
   - at **350,000 commands** (≈ $0.70 at most) the dashboard stops reading too
     and says so, until the 1st;
   - set `ANALYTICS_MONTHLY_COMMANDS` to move the total (ingest stays at 85%).
   The dashboard's footer shows this month's count.

What else keeps usage low: batches go every 20 s (and at once when the page
is hidden or closed); a steady-state batch costs 6 commands (14 for a
session's first); `/api/events` refuses anything not posted from the game's
own pages (Origin check, set `ANALYTICS_ORIGINS` to add a custom domain)
before it touches storage, and rate-limits each client to 60 posts a minute;
sessions expire after 180 days, which keeps storage to tens of MB.

At that rate 297,500 commands is roughly 240 hours of play a month. If a
month runs out, nothing is lost for players who come back within 30 days.

The functions themselves run on Vercel; on the Hobby plan their usage is
included, and on Pro, Vercel's Spend Management (Settings → Billing) can cap it.

## Switching to the Free plan, step by step

Button names on these sites change from time to time; if one is worded a
little differently, look for the closest match. Nothing is stored in the
current database yet, so replacing it loses nothing.

**First, try changing the plan in place:**

1. Go to **vercel.com**, log in, and click the **billiard-roguelike** project.
2. Click **Storage** (top menu, or the menu on the left).
3. Click your Upstash database's name.
4. Look for **Plan**, **Change Plan** or **Settings** on that page. If you
   can choose **Free**, do so, confirm, and you are done.

**If there is no way to pick Free there, make a new free database:**

1. On the same **Storage** page, open the current Upstash database, find
   **Settings**, and choose **Disconnect** (or *Remove from project*). Then
   delete it (**Delete Database**, usually at the bottom of Settings).
2. Back on **Storage**, click **Create Database** → **Upstash for Redis**.
3. When it asks for a plan, choose **Free**. Pick a region near you (for
   example *US West*). Click **Create** / **Continue**.
4. When it asks which projects to connect, choose **billiard-roguelike**
   with all environments ticked, and click **Connect**.
5. Redeploy so the site picks up the new database: **Deployments** tab →
   the **⋯** menu on the top deployment → **Redeploy**.

Your `STATS_TOKEN` is not affected; keep it as it is.

## Telling our own play apart

Everything we do ourselves is reported separately, under **Internal** on the
dashboard (a switch at the top), so it never mixes into the player numbers.
A session counts as internal when:

- the device has opened the dashboard with the token (it marks itself);
- the device opened the game once at
  `https://billiard-roguelike.vercel.app/?internal=1`. Do this on your phone
  and any other device you play on; `?internal=0` undoes it;
- the browser was automated (tests, or Claude checking the site);
- it ran anywhere but the live site (a preview deployment or a local copy);
- or you pressed **Mark internal** next to that player on the dashboard
  (for a device you forgot to mark; **Not internal** undoes it).

A player with any internal session is internal throughout.

## What is recorded

| | |
|---|---|
| Identity | A random id in localStorage (`lightline-anon-id`), and a new random session id on each page load. Returning-player detection uses that id plus a visit count. |
| Device | Viewport size, pixel ratio, touch or mouse, browser and OS **family** (e.g. "Safari · iOS"; never the raw user agent), and the referring site's host name. |
| Place | Approximate city, region and country, once per session. Vercel's network works this out from the connection and passes on only the result (`x-vercel-ip-city` and friends); the IP address itself is never read or stored. |
| Lifecycle | Page load and boot time; tab hidden/visible (for idle and away time); leaving (on `pagehide`); JavaScript errors (message, file, line); a reload of a session that was mid-table or mid-lesson. |
| Lessons | Each lesson's start, pass, skip or quit, its time, shots and aim cancels; the tutorial's start, completion or skip. |
| Play | Home screen, Play, run start/continue, table replays; each table's start (number, name, rack, shots, target) and end (cleared or failed, score against target, balls down, shots, time, hearts lost); run over / complete, Try again, Quit run; the shop opening, purchases and rerolls; freeze frames; achievements; settings changed. |
| Shots | One compact event per shot: power, time spent aiming, aim cancels before it, balls potted, foul, scratch, freezes used, points paid. |

**Never recorded:** names, anything typed, precise location, the raw user
agent, IP addresses. The server hashes the IP with a daily salt only to keep a
60-second rate-limit counter, and stores nothing else about it.

**Off when:** the player turns *Anonymous stats* off in Settings (remembered),
the browser sends Do Not Track or Global Privacy Control, the page is opened
from a file, or the browser is automated (except under
`tools/check-analytics.mjs`). The home screen says, under Play, that stats
are anonymous and can be turned off.

## How it fits together

```
src/analytics/Analytics.js   the client: queue, batch every 20 s, sendBeacon on hide
src/main.js                  one-line calls, each ending in `// analytics`
api/events.js                POST: validate, rate-limit, store
api/stats.js                 GET, behind STATS_TOKEN: the report, a session, a player
api/_lib/schema.js           the event whitelist and field rules
api/_lib/store.js            Upstash Redis over REST (no npm package)
api/_lib/metrics.js          every number on the dashboard, and the narrative
api/_lib/demo.js             made-up sessions for ?demo=1 and the tests
public/dashboard.html        the dashboard (self-contained, works on a phone)
tools/check-analytics.mjs    npm run analytics: the end-to-end check
```

Where an object already announces a moment, `Analytics.js` wraps it instead
of adding a line to `main.js`: the tutorial's lessons (so `Tutorial.js` is
untouched), `rules.endRoom` (a table's end) and `moments.runEnd` (a run's
end). Try again and Quit run are read from the event sequence. If a later
refactor renames one of those methods, its wrapping is silently skipped and
only those events go missing. Merging this branch into `lightline-scoring`
adds no conflicts beyond the ones `main` already has with it.

### Definitions the dashboard uses

- **Time zone**: every date and time is Pacific, labeled PST (PDT from
  March to November, when Pacific time is daylight time). Days start at
  Pacific midnight.

- **New player**: first seen in the range, and had no game progress saved
  before stats existed (`prior` covers friends who played before this shipped).
- **Active time**: a session's wall time minus the stretches the tab was hidden.
- **Funnel** (first sessions of new players): loaded → pressed Play → started
  lesson 1 → through the lessons (finished or skipped) → reached table 1 →
  cleared table 1 → reached table 3 → run over or complete. Each step is capped
  at the one before it.
- **D1**: came back on the next calendar day. **Back within 7d**: any session
  on days 1–7. Only players whose window has fully passed are counted.
- **Stall**: 30 s or more with no event while the tab is visible, or 5 aim
  cancels in a row with no shot.
- **Churn point**: where a player was at the last action of their last
  session, once they have been gone 24 hours.
- **Rage reload**: a reload mid-table or mid-lesson within 60 s of the last
  action.

## Checking it

```
npm run build && npm run analytics
```

This serves `dist/` with the real `/api` handlers over an in-memory stand-in
for Upstash, plays boot → Play → lesson 1 → a cancelled aim → a shot → leaving
the page in headless Chromium, and checks the events, their order and fields,
storage, the stats report, the no-op and opt-out paths, the metrics' arithmetic,
and the dashboard at phone and desktop sizes.
