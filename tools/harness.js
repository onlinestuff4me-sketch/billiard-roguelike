/**
 * harness.js — injected into the running game. Everything here executes inside
 * the page, against the live systems.
 *
 * The one rule this file follows: WHEREVER THE GAME ALREADY DECIDES SOMETHING,
 * ASK THE GAME. A board's pass condition is evaluated by calling the board's
 * own `pot` predicate and reading its own flags, not by re-expressing what the
 * board means — a verifier that has its own opinion about the rules will
 * eventually be confidently wrong about a board that changed underneath it.
 */
(() => {
  const g = () => window.__game;

  /* ---------------------------------------------------------------- *
   * State capture — so a search can branch without reloading the page
   * ---------------------------------------------------------------- */

  // BY SLOT, NOT BY REFERENCE. This used to hold the Enemy objects themselves
  // and put them back by hand — but the first thing `restore` does is rebuild
  // the rack, which disposes every one of them, so the loop that followed was
  // writing positions onto discarded balls while the live ones stood at their
  // authored spots. From a fresh board the two are the same table, which is why
  // it never showed; from halfway through a rack they are not, and a search
  // that branches mid-attempt was silently starting each branch from the top.
  //
  // The game already knows how to restore a moment — the fourth lesson rewinds
  // a stroke with it — so this asks the game.
  function snapshot() {
    const game = g();
    return {
      balls: game.rooms.scriptedEnemies
        .filter((e) => e.alive && Number.isFinite(e.slotIndex))
        .map((e) => ({ index: e.slotIndex, x: e.x, z: e.z })),
      px: game.player.x,
      pz: game.player.z
    };
  }

  function restore(snap) {
    const game = g();
    game.rooms.restoreScripted(snap.balls);
    // THE WHOLE TABLE, not just the double. A probe that leaves a mine spent
    // hands every later probe a different board — which is how a search for
    // "a line that misses the mine" came back with every placement passing:
    // the first heading that hit it removed it, and the other 179 headings
    // measured a table with no mine on it at all.
    game.rooms.table.rearmBoard();
    game.player.placeAt(snap.px, snap.pz);
    game.player.vx = 0;
    game.player.vz = 0;
    game.chain = { count: 0, best: 0, timer: 0 };
  }

  /* ---------------------------------------------------------------- *
   * One stroke, fully resolved, with everything it did recorded
   * ---------------------------------------------------------------- */

  /** Physics steps to run before calling a stroke finished. */
  const STEPS = 1100;
  const H = 1 / 120;

  function shoot(headingDeg, power) {
    const game = g();
    const P = game.player;
    const out = { pots: [], passes: 0, hits: 0, scratched: false, green: false, mine: false };

    const real = {
      scratch: game.on.scratch,
      potted: game.on.potted,
      carom: game.on.carom,
      strike: game.on.cueStrike,
      object: game.on.objectHit
    };
    game.on.scratch = (p) => {
      out.scratched = true;
      return real.scratch(p);
    };
    game.on.potted = (p) => {
      out.pots.push({ number: p.ball.number, slot: p.pocket.slot, ball: p.ball, pocket: p.pocket });
      return real.potted(p);
    };
    game.on.carom = (p) => {
      out.passes += 1;
      return real.carom(p);
    };
    game.on.cueStrike = (p) => {
      out.hits += 1;
      return real.strike(p);
    };
    game.on.objectHit = (p) => {
      if (p.isCue && p.object.armed) {
        if (p.object.good) out.green = true;
        else out.mine = true;
      }
      return real.object(p);
    };

    // EVERY STROKE IS A FRESH STROKE. The scratch handler arms a 0.6s guard so
    // one cue ball cannot register two scratches on its way into a pocket, and
    // that guard is measured in WALL CLOCK time — which a search that plays a
    // hundred strokes between two animation frames never spends. It meant a
    // scratch could be silently swallowed simply because the previous probe had
    // scratched a millisecond earlier, and the board would be judged on a shot
    // the game had declined to act on.
    P.scratchGuard = 0;
    const th = (headingDeg * Math.PI) / 180;
    P.launch({ dirX: Math.sin(th), dirZ: -Math.cos(th), power }, game);
    game.midStroke = true;
    game.phase = 'resolve';
    for (let i = 0; i < STEPS; i++) game.physics.update(H, game);

    out.bounces = P.bouncesUsed;
    out.rest = { x: P.x, z: P.z };
    Object.assign(game.on, {
      scratch: real.scratch,
      potted: real.potted,
      carom: real.carom,
      cueStrike: real.strike,
      objectHit: real.object
    });
    return out;
  }

  /* ---------------------------------------------------------------- *
   * Did this stroke satisfy the board? Ask the board.
   * ---------------------------------------------------------------- */

  function passes(lesson, out) {
    if (out.scratched) return false;
    // A board that says "not the red" fails a stroke that took it — and the
    // gate has to know, or every measurement of that board counts strokes the
    // board itself refuses.
    if (lesson.rejectsMine && out.mine) return false;
    // A pot that has to come off another ball: the board's own `pot` rule
    // decides which ball, and `needsPass` decides that the cue did not do it.
    if (lesson.needsPass && out.passes < 1) return false;
    if (lesson.bankThenHit) return out.hits >= 1 && out.bounces >= 1;
    // TWO IN ONE STROKE. Without this the gate fell through to "any pot at
    // all" and reported the board four and a half degrees wide when what it
    // asks for is two balls down together — a board measuring a claim it does
    // not make is the failure this whole tool exists to catch.
    if (lesson.strokePots) return out.pots.length >= lesson.strokePots;
    if (lesson.clearRack) return out.pots.length >= 1;
    if (typeof lesson.pot === 'function') {
      // The board's OWN predicate, called with the same payload the game sends.
      return out.pots.some(
        (p) =>
          lesson.pot({
            ball: p.ball,
            pocket: p.pocket,
            tookGreen: out.green,
            bounces: out.bounces
          }) === 'score'
      );
    }
    return out.pots.length >= 1;
  }

  /* ---------------------------------------------------------------- *
   * Runs: contiguous stretches of heading that work
   * ---------------------------------------------------------------- */

  function toRuns(degrees, step) {
    const uniq = [...new Set(degrees)].sort((a, b) => a - b);
    const runs = [];
    let start = null;
    let prev = null;
    for (const v of uniq) {
      if (start === null) start = v;
      else if (v - prev > step * 1.5) {
        runs.push([start, prev]);
        start = v;
      }
      prev = v;
    }
    if (start !== null) runs.push([start, prev]);
    // A run's WIDTH is what a human has to hit. A single sampled heading is a
    // width of zero, and reporting it as a solution is how a 1-degree shot ends
    // up in a tutorial.
    return runs.map(([a, b]) => ({ from: +a.toFixed(2), to: +b.toFixed(2), width: +(b - a).toFixed(2) }));
  }

  /* ---------------------------------------------------------------- *
   * Public surface
   * ---------------------------------------------------------------- */

  window.__simBoards = () => window.__LESSON_IDS || [];

  /**
   * WHAT EACH BOARD PROMISES, AND WHAT IT CHECKS.
   *
   * A lit pocket means "put a ball in here" everywhere else in the game, so a
   * board that lights one and then passes the player for something else is
   * lying — which is how a lesson came to congratulate someone for bouncing a
   * ball off two walls and missing the corner it had lit.
   */
  window.__simPromises = () =>
    (g().tutorial?.boards || []).map((L) => ({
      id: L.id,
      lights: L.call == null ? [] : Array.isArray(L.call) ? L.call : [L.call],
      checksAPot: !!(L.pot || L.strokePots || L.clearRack || L.clearsRack || L.usesGoal)
    }));

  /**
   * DOES THE BOARD'S OWN STORED SOLUTION ACTUALLY SOLVE IT?
   *
   * `solve` is a heading, measured once and written into lessons.json, and two
   * things now lean on it: the demonstration that swings the cue after a miss,
   * and the coach route drawn on the felt. Both teach it as the answer. On the
   * four-in-three board it had drifted to a heading that pockets nothing at
   * any power — so the game was drawing, and demonstrating, a shot that does
   * not work.
   */
  window.__simSolve = () => {
    const L = g().tutorial?.lesson;
    if (!L || !Number.isFinite(L.solve)) return null;
    const game = g();
    const notify = game.tutorial.notify;
    game.tutorial.notify = () => {};
    const base = snapshot();
    const tried = [];
    for (const power of [0.55, 0.7, 0.85, 1]) {
      restore(base);
      // The board's OWN predicate, on the internal shape it expects — the
      // public `__simShot` result has been flattened for reporting and no
      // longer carries the ball objects a `pot` rule reads.
      const out = shoot(L.solve, power);
      tried.push({
        power,
        ok: passes(L, out),
        pots: out.pots.map((p) => `${p.number}->${p.slot}`),
        scratched: out.scratched
      });
    }
    restore(base);
    game.midStroke = false;
    game.phase = 'aim';
    game.tutorial.notify = notify;
    return { id: L.id, solve: L.solve, ok: tried.some((t) => t.ok), tried };
  };

  /** The coach route the board is currently drawing, as line counts and inks. */
  window.__simRoute = () => {
    const t = g().tutorial;
    if (!t?.lesson) return null;
    // THE ROAD THE FELT IS SHOWING, through the tutorial's own function. This
    // used to re-ask the sweep, which on a board that draws its own stored
    // line reported a heading the player was never shown.
    const want = t.lesson.clearRack ? {} : t.lesson.route;
    const lines = t.roadNow();
    return {
      id: t.lesson.id,
      want,
      plan: lines?.plan ?? null,
      // The heading the road is drawn along, so a check can PLAY it.
      heading: lines?.heading ?? null,
      lines: (lines || []).length,
      // Which balls the route is about — the route and the sentence above it
      // have to be describing the same shot.
      inks: (lines || []).map((l) => l.ink)
    };
  };

  /**
   * WHAT THE ROAD IS DOING ON THE FELT, and whether it keeps off the red.
   *
   * `__simRoute` asks the solver whether a road exists. It always said yes
   * while the player saw nothing at all: the fade that retires the road when a
   * stroke is fired was left armed by the menu's own attract-mode strokes, so
   * every road drawn after boot was gone a third of a second later. A check
   * that reads the solver cannot see that; this reads the meshes, through the
   * probe main.js exposes, and the clearance of the cue's own band from any
   * armed hazard — a road over a mine is advice to blow yourself up.
   */
  window.__simRoad = () => {
    const t = g().tutorial;
    const game = g();
    const drawn = window.__road?.() ?? null;
    const want = t?.lesson?.clearRack ? {} : t?.lesson?.route;
    const bands = want && t?.solveCoachRoute ? t.solveCoachRoute(want) : null;
    const armed = (game.rooms.table.objects || []).filter((o) => o.armed && !o.good);
    let clearance = Infinity;
    for (const seg of bands?.[0]?.segs || []) {
      const dx = seg.bx - seg.ax;
      const dz = seg.bz - seg.az;
      const len2 = dx * dx + dz * dz;
      if (len2 < 1e-9) continue;
      for (const o of armed) {
        const raw = ((o.x - seg.ax) * dx + (o.z - seg.az) * dz) / len2;
        const u = Math.max(0, Math.min(1, raw));
        const d = Math.hypot(o.x - (seg.ax + dx * u), o.z - (seg.az + dz * u)) - (o.radius ?? 0);
        clearance = Math.min(clearance, d);
      }
    }
    return {
      id: t?.lesson?.id ?? null,
      drawn,
      hazards: armed.length,
      clearance: Number.isFinite(clearance) ? +clearance.toFixed(2) : null
    };
  };

  window.__simLesson = () => {
    const L = g().tutorial?.lesson;
    if (!L) return null;
    const restDeg = ((Math.atan2(L.rest.x, -L.rest.z) * 180) / Math.PI + 360) % 360;
    return {
      id: L.id,
      rest: +restDeg.toFixed(2),
      solve: L.solve ?? null,
      call: L.call,
      shots: L.shots ?? null,
      gate: L.strokePots
        ? `${L.strokePots} in one stroke`
        : L.needsPass
        ? 'pot off a ball'
        : L.bankThenHit
          ? 'bank+strike'
          : L.clearRack
            ? 'a ball down'
            : 'own pot rule',
      balls: g().rooms.scriptedEnemies.filter((e) => e.alive).length
    };
  };

  /**
   * ONE STROKE, AND EVERYTHING IT DID.
   *
   * The sweep answers "is this board solvable"; this answers "what actually
   * happens on this shot", which is the question every piece of coaching COPY
   * is a claim about. A board that says "into the side pocket" is asserting a
   * fact about where a ball ends up, and that assertion is as checkable as the
   * board's own pass condition — it just was not being checked, which is how
   * a lesson came to name the wrong pocket.
   *
   * @param {{deg:number, power?:number}} spec
   */
  window.__simShot = (spec = {}) => {
    const game = g();
    const notify = game.tutorial?.notify;
    if (game.tutorial) game.tutorial.notify = () => {};
    const base = snapshot();
    restore(base);
    const out = shoot(spec.deg ?? 0, spec.power ?? 0.7);
    const nearestPocket = (b) => {
      let best = null;
      for (const p of game.rooms.table.pockets) {
        const d = Math.hypot(p.x - b.x, p.z - b.z);
        if (!best || d < best.d) best = { d: +d.toFixed(2), slot: p.slot };
      }
      return best;
    };
    const resting = game.rooms.scriptedEnemies
      .filter((e) => e.alive)
      .map((e) => ({ n: e.number, x: +e.x.toFixed(2), z: +e.z.toFixed(2), near: nearestPocket(e) }));
    restore(base);
    game.midStroke = false;
    game.phase = 'aim';
    if (game.tutorial) game.tutorial.notify = notify;
    return {
      pots: out.pots.map((p) => ({ n: p.number, slot: p.slot })),
      passes: out.passes,
      hits: out.hits,
      scratched: out.scratched,
      // Whether the stroke ran over either kind of pad. A board whose lesson
      // is "come through the green, not the red" cannot be searched without
      // them: the shot it wants is defined by which one the cue touched.
      green: out.green,
      mine: out.mine,
      // How many rails the cue took on the way — a board that teaches a bank
      // has to be able to tell one from a straight shot that happened to work.
      bounces: out.bounces,
      resting
    };
  };

  /**
   * ONE STROKE PLAYED FOR REAL, THROUGH THE COACH.
   *
   * `__simShot` deliberately gags the tutorial so a measurement of the physics
   * is not also a lesson being played. This is the opposite: the stroke goes
   * through the board's own rules, the band writes whatever it writes, and the
   * table is left in whatever state the lesson decided it should be left in.
   *
   * It is how a claim ABOUT THE COACHING gets checked — that a scratch on a
   * multi-shot board gives the stroke back rather than rebuilding the rack,
   * and that the sentence the player then reads names what happened.
   *
   * @param {{deg:number, power?:number}} spec
   * @returns {{band:string, tone:string, strokes:number, rack:Array, player:object, scratched:boolean, pots:Array}}
   */
  window.__simPlay = (spec = {}) => {
    const game = g();
    const tut = game.tutorial;
    // `spent` puts the board's shot budget where a check needs it. Reaching
    // the end of a three-shot budget by playing three real strokes that each
    // pot exactly one ball is a search in its own right, and the branch under
    // test is what happens AT the end, not how the board got there.
    if (Number.isFinite(spec.spent)) tut._strokes = spec.spent;
    const out = shoot(spec.deg ?? 0, spec.power ?? 0.7);
    // The lesson resolves a stroke on its own clock, and the clock only runs
    // when the game does. Drive it the way a frame would until it lets go.
    for (let i = 0; i < 2000 && tut._launched; i++) tut.update(1 / 60);
    game.midStroke = false;
    game.phase = 'aim';
    const band = tut.lineEl?.textContent || '';
    return {
      band,
      tone: tut.el?.classList.contains('bad') ? 'bad' : tut.el?.classList.contains('good') ? 'good' : '',
      strokes: tut._strokes,
      done: tut._awaitingNext,
      scratched: out.scratched,
      pots: out.pots.map((p) => p.number),
      rack: game.rooms.scriptedEnemies
        .filter((e) => e.alive)
        .map((e) => ({ n: e.number, x: +e.x.toFixed(2), z: +e.z.toFixed(2) }))
        .sort((a, b) => a.n - b.n),
      player: { x: +game.player.x.toFixed(2), z: +game.player.z.toFixed(2) }
    };
  };

  /** The table as the lesson currently has it — no stroke, no side effects. */
  window.__simTable = () => {
    const game = g();
    return {
      strokes: game.tutorial?._strokes ?? 0,
      rack: game.rooms.scriptedEnemies
        .filter((e) => e.alive)
        .map((e) => ({ n: e.number, x: +e.x.toFixed(2), z: +e.z.toFixed(2) }))
        .sort((a, b) => a.n - b.n),
      player: { x: +game.player.x.toFixed(2), z: +game.player.z.toFixed(2) }
    };
  };

  /**
   * Sweep every heading and report where the board is satisfied.
   * @param {{step?:number, powers?:number[]}} spec
   */
  window.__simSweep = (spec = {}) => {
    const game = g();
    const L = game.tutorial.lesson;
    const step = spec.step ?? 0.5;
    // SIX POWERS, NOT THREE. A thumb produces a continuum; a sweep samples it,
    // and a sparse sample reports the window for a player who only ever hits
    // the ball three ways. The two-in-one board reads 0.5° at three powers and
    // 3.5° at six, because the headings between its islands work at two thirds
    // power and nothing else — the same failure as measuring headings at two
    // degrees and calling everything between two hits solid.
    const powers = spec.powers ?? [0.45, 0.55, 0.65, 0.75, 0.85, 1.0];
    const notify = game.tutorial.notify;
    game.tutorial.notify = () => {};
    const base = snapshot();

    const good = [];
    const byPower = {};
    for (let deg = 0; deg < 360; deg += step) {
      for (const power of powers) {
        restore(base);
        const out = shoot(deg, power);
        if (passes(L, out)) {
          good.push(+deg.toFixed(2));
          byPower[power] = (byPower[power] || 0) + 1;
          break;
        }
      }
    }

    restore(base);
    game.midStroke = false;
    game.phase = 'aim';
    game.tutorial.notify = notify;

    const runs = toRuns(good, step);
    const widest = runs.reduce((a, b) => (b.width > (a?.width ?? -1) ? b : a), null);
    const rest = ((Math.atan2(L.rest.x, -L.rest.z) * 180) / Math.PI + 360) % 360;
    const gap = (a, b) => {
      const d = Math.abs(((a - b + 540) % 360) - 180);
      return +d.toFixed(2);
    };
    const nearest = runs.reduce(
      (best, r) => {
        const d = r.from <= rest && rest <= r.to ? 0 : Math.min(gap(rest, r.from), gap(rest, r.to));
        return d < best.d ? { d, run: r } : best;
      },
      { d: Infinity, run: null }
    );
    return {
      step,
      powers,
      headings: good.length,
      runs,
      widest,
      rest: +rest.toFixed(2),
      restGap: nearest.run ? nearest.d : null,
      restRun: nearest.run
    };
  };

  /**
   * MULTI-STROKE FEASIBILITY.
   *
   * A board with a shot budget makes a claim no single-stroke sweep can check:
   * that the rack can be CLEARED inside the budget. Each stroke leaves the cue
   * ball somewhere new, so stroke two is played from a table stroke one chose —
   * which is exactly the thing a player has to plan and exactly the thing that
   * is invisible when you only measure the opening shot.
   *
   * A beam search over strokes: from each surviving state, try every heading,
   * keep the states that put a ball down, and go again.
   */
  window.__simPlan = (spec = {}) => {
    const game = g();
    const L = game.tutorial.lesson;
    const strokes = spec.strokes ?? L.shots ?? 3;
    const step = spec.step ?? 2;
    const powers = spec.powers ?? [0.7, 1.0];
    const beam = spec.beam ?? 6;
    const notify = game.tutorial.notify;
    game.tutorial.notify = () => {};

    const start = snapshot();
    const total = game.rooms.scriptedEnemies.filter((e) => e.alive).length;
    let frontier = [{ snap: start, down: 0, line: [] }];
    let best = { down: 0, line: [] };

    for (let s = 0; s < strokes; s += 1) {
      const next = [];
      for (const node of frontier) {
        for (let deg = 0; deg < 360; deg += step) {
          for (const power of powers) {
            restore(node.snap);
            const out = shoot(deg, power);
            if (out.scratched || out.pots.length === 0) continue;
            const down = node.down + out.pots.length;
            const line = [...node.line, { deg: +deg.toFixed(1), power, got: out.pots.length }];
            const child = { snap: snapshot(), down, line };
            next.push(child);
            if (down > best.down) best = { down, line };
            break;
          }
        }
      }
      // Keep the deepest few: more balls down first, fewer strokes used to do it.
      next.sort((a, b) => b.down - a.down);
      frontier = next.slice(0, beam);
      if (!frontier.length) break;
      if (best.down >= total) break;
    }

    restore(start);
    game.midStroke = false;
    game.phase = 'aim';
    game.tutorial.notify = notify;
    return { total, strokes, cleared: best.down >= total, bestDown: best.down, line: best.line };
  };

  window.installSimHarness = () => true;
})();
