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

  function snapshot() {
    const game = g();
    return {
      balls: game.enemies.map((e) => ({ e, x: e.x, z: e.z, alive: e.alive })),
      px: game.player.x,
      pz: game.player.z
    };
  }

  function restore(snap) {
    const game = g();
    // reRackScripted revives the rack; the snapshot then re-kills what was down.
    game.rooms.reRackScripted();
    game.rooms.table.rearmForStroke();
    for (const b of snap.balls) {
      b.e.x = b.x;
      b.e.z = b.z;
      b.e.vx = 0;
      b.e.vz = 0;
      if (!b.alive && b.e.alive) game.forceKill(b.e);
    }
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
    if (lesson.handoff) return out.passes >= 1;
    if (lesson.bankThenHit) return out.hits >= 1 && out.bounces >= 1;
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
      gate: L.handoff
        ? 'hand-off'
        : L.bankThenHit
          ? 'bank+strike'
          : L.clearRack
            ? 'a ball down'
            : 'own pot rule',
      balls: g().rooms.scriptedEnemies.filter((e) => e.alive).length
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
    const powers = spec.powers ?? [0.5, 0.75, 1.0];
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
