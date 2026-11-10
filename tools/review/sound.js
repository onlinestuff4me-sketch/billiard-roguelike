/* Lightline's sounds, playable: today's voices ported from src/core/AudioManager.js (NOW) and the sound pass's proposals (NEW).
   From the sound review page (docs/SOUND.md on branch sound-pass); kept as written there. */
/* Lightline sound review — the synth. Two engines on one AudioContext:
   NOW  = the game's current chain (voices → slow-mo low-pass → master 0.55 → out, no limiter)
   NEW  = the proposed chain (world bus → slow-mo low-pass ┐
                               dry bus (strike, score, UI) ┴→ duck → limiter → master → out)
   Both pass through an optional "phone speaker" preview (high-pass ~280 Hz). */
(function () {
  'use strict';
  var ROOT = 220, SCALE = [0, 3, 5, 7, 10];
  function deg(i) { i = Math.max(0, Math.min(24, Math.floor(i))); return ROOT * Math.pow(2, (SCALE[i % 5] + 12 * Math.floor(i / 5)) / 12); }
  function rnd(c) { return Math.pow(2, ((Math.random() * 2 - 1) * c) / 1200); } // ±c cents as a ratio
  function ok() { for (var i = 0; i < arguments.length; i++) if (!Number.isFinite(arguments[i])) return false; return true; }

  var S = { ctx: null, phone: false };

  function boot() {
    if (S.ctx) { if (S.ctx.state === 'suspended' && S.ctx.resume) { var r = S.ctx.resume(); if (r && r.catch) r.catch(function () {}); } return S.ctx; }
    var C = window.AudioContext || window.webkitAudioContext;
    var ctx = (S.ctx = new C());
    // the phone preview sits last, shared by both chains
    S.phoneIn = ctx.createGain();
    S.hp1 = ctx.createBiquadFilter(); S.hp1.type = 'highpass'; S.hp1.frequency.value = 10; S.hp1.Q.value = 0.707;
    S.hp2 = ctx.createBiquadFilter(); S.hp2.type = 'highpass'; S.hp2.frequency.value = 10; S.hp2.Q.value = 0.707;
    S.pk = ctx.createBiquadFilter(); S.pk.type = 'peaking'; S.pk.frequency.value = 2500; S.pk.Q.value = 0.8; S.pk.gain.value = 0;
    S.phoneIn.connect(S.hp1); S.hp1.connect(S.hp2); S.hp2.connect(S.pk); S.pk.connect(ctx.destination);
    setPhone(S.phone);
    S.noise = (function () { var n = Math.floor(ctx.sampleRate * 1.2), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; })();
    // soft-clip curve for the "phone-audible" harmonic layer
    S.curve = (function () { var n = 1024, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(x * 4) / Math.tanh(4); } return c; })();
    S.now = makeEngine(ctx, false);
    S.neu = makeEngine(ctx, true);
    return ctx;
  }
  function setPhone(on) {
    S.phone = !!on;
    if (!S.ctx) return;
    var f = S.phone ? 280 : 10;
    S.hp1.frequency.value = f; S.hp2.frequency.value = f; S.pk.gain.value = S.phone ? 4 : 0;
  }

  function makeEngine(ctx, proposed) {
    var E = { ctx: ctx, proposed: proposed, base: 0, recent: {} };
    E.master = ctx.createGain(); E.master.gain.value = 0.55;
    E.slow = ctx.createBiquadFilter(); E.slow.type = 'lowpass'; E.slow.frequency.value = 18000; E.slow.Q.value = 0.9;
    if (proposed) {
      E.duckG = ctx.createGain();
      E.lim = ctx.createDynamicsCompressor();
      E.lim.threshold.value = -4; E.lim.knee.value = 0; E.lim.ratio.value = 20; E.lim.attack.value = 0.002; E.lim.release.value = 0.15;
      E.dry = ctx.createGain();
      E.slow.connect(E.duckG); E.dry.connect(E.duckG); E.duckG.connect(E.lim); E.lim.connect(E.master);
    } else {
      E.dry = E.slow; // today everything goes through the slow-mo filter
      E.slow.connect(E.master);
    }
    E.master.connect(S.phoneIn);
    E.world = E.slow;

    E.t = function (delay) { return Math.max(E.base, ctx.currentTime) + (delay || 0); };
    /** cap: at most `n` of this voice inside `win` seconds (voice stealing by refusal). */
    E.cap = function (key, n, win) {
      if (!proposed) return true;
      var now = E.t(0), list = (E.recent[key] || []).filter(function (x) { return now - x < win; });
      if (list.length >= n) { E.recent[key] = list; return false; }
      list.push(now); E.recent[key] = list; return true;
    };
    E.tone = function (o) {
      var t0 = E.t(o.delay), type = o.type || 'sine', f = o.freq || 220, fe = o.freqEnd == null ? null : o.freqEnd;
      var dur = o.dur || 0.25, g = o.gain == null ? 0.2 : o.gain, a = o.attack || 0.004;
      if (!ok(t0, f, dur, g, a) || (fe !== null && !ok(fe))) return;
      var osc = ctx.createOscillator(), env = ctx.createGain(), node = osc;
      osc.type = type; osc.detune.value = o.detune || 0;
      osc.frequency.setValueAtTime(Math.max(f, 1), t0);
      if (fe !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(fe, 1), t0 + (o.glide || dur));
      if (o.lp) { var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.lp; lp.Q.value = o.q || 0.8; osc.connect(lp); node = lp; }
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t0 + a);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      node.connect(env); env.connect(o.dry ? E.dry : E.world);
      osc.start(t0); osc.stop(t0 + dur + 0.03);
      osc.onended = function () { osc.disconnect(); env.disconnect(); if (node !== osc) node.disconnect(); };
    };
    E.noise = function (o) {
      var t0 = E.t(o.delay), dur = o.dur || 0.2, g = o.gain == null ? 0.25 : o.gain, f = o.freq || 800, fe = o.freqEnd == null ? null : o.freqEnd, a = o.attack || 0.003;
      if (!ok(t0, dur, g, f, a) || (fe !== null && !ok(fe))) return;
      var src = ctx.createBufferSource(); src.buffer = S.noise; src.loop = true;
      src.playbackRate.value = o.rate || 1;
      var bp = ctx.createBiquadFilter(); bp.type = o.filter || 'bandpass'; bp.Q.value = o.q == null ? 1.2 : o.q;
      bp.frequency.setValueAtTime(Math.max(f, 20), t0);
      if (fe !== null) bp.frequency.exponentialRampToValueAtTime(Math.max(fe, 20), t0 + (o.glide || dur));
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t0);
      env.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t0 + a);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(bp); bp.connect(env); env.connect(o.dry ? E.dry : E.world);
      src.start(t0, Math.random() * 0.8); src.stop(t0 + dur + 0.03);
      src.onended = function () { src.disconnect(); bp.disconnect(); env.disconnect(); };
    };
    /** A low thump a phone can play: the sine sub, plus the same sweep driven
     *  through a soft clipper and band-passed to 150–600 Hz, so its harmonics
     *  carry the pitch on a speaker that has no bass (missing fundamental). */
    E.thump = function (o) {
      E.tone({ type: 'sine', freq: o.freq, freqEnd: o.freqEnd, dur: o.dur, gain: o.gain, delay: o.delay, dry: o.dry, attack: o.attack || 0.003 });
      if (!proposed) return;
      var t0 = E.t(o.delay), dur = o.dur, g = (o.gain || 0.3) * (o.harm == null ? 0.55 : o.harm);
      if (!ok(t0, o.freq, dur, g)) return;
      var osc = ctx.createOscillator(), sh = ctx.createWaveShaper(), bp = ctx.createBiquadFilter(), env = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(o.freq, t0);
      if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(o.freqEnd, 20), t0 + dur);
      sh.curve = S.curve; bp.type = 'bandpass'; bp.frequency.value = 320; bp.Q.value = 0.5;
      env.gain.setValueAtTime(0.0001, t0); env.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), t0 + 0.004); env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.8);
      osc.connect(sh); sh.connect(bp); bp.connect(env); env.connect(o.dry ? E.dry : E.world);
      osc.start(t0); osc.stop(t0 + dur + 0.03);
      osc.onended = function () { osc.disconnect(); sh.disconnect(); bp.disconnect(); env.disconnect(); };
    };
    /** A ball-on-ball click: a sub-millisecond-feeling noise snap and a short bright ring. */
    E.click = function (o) {
      var i = o.i == null ? 0.6 : o.i, v = rnd(o.cents == null ? 70 : o.cents);
      E.noise({ dur: 0.006 + 0.01 * i, gain: (o.gain || 1) * (0.18 + 0.42 * i), filter: 'bandpass', freq: (o.freq || 3400) * v, q: 0.9, attack: 0.0008, delay: o.delay, dry: o.dry });
      E.tone({ type: 'sine', freq: (o.ring || 2900) * v, dur: 0.03 + 0.05 * i, gain: (o.gain || 1) * (0.04 + 0.1 * i), attack: 0.001, delay: o.delay, dry: o.dry });
    };
    /** Duck everything on the NEW chain: dip to `depth` (0..1) at `at`, hold, release. */
    E.duck = function (depth, at, hold, release) {
      if (!proposed) return;
      var t0 = E.t(at), p = E.duckG.gain;
      p.cancelScheduledValues(t0); p.setValueAtTime(p.value || 1, t0);
      p.linearRampToValueAtTime(depth, t0 + 0.012);
      p.setValueAtTime(depth, t0 + 0.012 + hold);
      p.linearRampToValueAtTime(1, t0 + 0.012 + hold + release);
    };
    /** Today's slow-mo: aiming runs at time scale 0, so the filter sits at 620 Hz
     *  and only opens as the game eases back out after the release. */
    E.slowmo = function (closed, delay) {
      var t0 = E.t(delay || 0), f = E.slow.frequency;
      f.cancelScheduledValues(t0);
      if (closed) { f.setValueAtTime(620, t0); E.master.gain.setValueAtTime(0.55 * 0.78, t0); }
      else { f.setValueAtTime(f.value, t0); f.setTargetAtTime(18000, t0, 0.2); E.master.gain.setTargetAtTime(0.55, t0, 0.2); }
    };
    E.reset = function () {
      var t = ctx.currentTime;
      E.slow.frequency.cancelScheduledValues(t); E.slow.frequency.setValueAtTime(18000, t);
      E.master.gain.cancelScheduledValues(t); E.master.gain.setValueAtTime(0.55, t);
      if (proposed) { E.duckG.gain.cancelScheduledValues(t); E.duckG.gain.setValueAtTime(1, t); }
      E.recent = {};
    };
    return E;
  }

  /** Play fn(E) on an engine, `at` seconds from now. */
  function play(which, fn, at, arg) {
    boot();
    var E = which === 'now' ? S.now : S.neu;
    E.base = S.ctx.currentTime + 0.03 + (at || 0);
    try { fn(E, arg); } finally { E.base = 0; }
  }
  function haptic(p) { try { if (p && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not on iOS */ } }

  window.LLS = { boot: boot, play: play, setPhone: setPhone, deg: deg, rnd: rnd, haptic: haptic, state: S,
    reset: function () { if (S.ctx) { S.now.reset(); S.neu.reset(); } } };
})();

/* NOW: src/core/AudioManager.js ported line for line (gain, pitch, sweeps).
   NEW: the proposals. Each takes (E, ...args). */
(function () {
  'use strict';
  var deg = LLS.deg, rnd = LLS.rnd, ROOT = 220;
  var subGain = 0.5, chainGain = 0.22, impactGain = 0.34, releaseGain = 0.3;

  var NOW = {
    slingshot: function (E, p) {
      if (p == null) p = 1;
      E.noise({ dur: 0.16, gain: releaseGain * (0.6 + p * 0.6), filter: 'bandpass', freq: 900 + p * 700, freqEnd: 180, q: 1.1 });
      E.tone({ type: 'square', freq: 520 + p * 240, freqEnd: 190, dur: 0.1, gain: 0.09 });
    },
    focusEnter: function (E) { E.tone({ freq: 480, freqEnd: 150, dur: 0.34, gain: 0.14 }); },
    focusExit: function (E) { E.tone({ freq: 170, freqEnd: 460, dur: 0.2, gain: 0.1 }); },
    scoreNote: function (E, i, bucket, falling) {
      var f = deg(i) * (bucket === 'mult' ? 1.5 : 1);
      if (bucket === 'mult') {
        E.tone({ type: 'sawtooth', freq: f, freqEnd: falling ? f * 0.5 : null, dur: 0.3, gain: chainGain * 0.42, attack: 0.006 });
        E.tone({ type: 'triangle', freq: f * 0.5, dur: 0.3, gain: chainGain * 0.5, attack: 0.006 });
      } else {
        E.tone({ type: 'triangle', freq: f, freqEnd: falling ? f * 0.5 : null, dur: 0.34, gain: chainGain, attack: 0.006 });
        E.tone({ freq: f * 2, dur: 0.18, gain: chainGain * 0.4 });
      }
    },
    coin: function (E, i, falling) {
      var s = Math.min(Math.max(0, i || 0), 16), f = ROOT * 4 * Math.pow(2, (falling ? -s : s) / 24);
      E.tone({ type: 'square', freq: f, dur: 0.05, gain: 0.035, attack: 0.002 });
      E.tone({ freq: f * 1.5, dur: 0.16, gain: 0.07, attack: 0.002, delay: 0.035 });
    },
    maxPower: function (E) {
      var r = ROOT * 2;
      E.tone({ freq: 140, freqEnd: 90, dur: 0.12, gain: 0.18 });
      E.tone({ type: 'triangle', freq: r * 1.5, dur: 0.16, gain: 0.13 });
      E.tone({ type: 'triangle', freq: r * 2, dur: 0.3, gain: 0.14, delay: 0.07 });
      E.tone({ freq: r * 4, dur: 0.22, gain: 0.05, delay: 0.07 });
    },
    scoreThud: function (E) { E.tone({ freq: 180, freqEnd: 80, dur: 0.14, gain: 0.2 }); },
    scoreLock: function (E) {
      var r = ROOT * 2;
      E.tone({ freq: 150, freqEnd: 70, dur: 0.18, gain: 0.24 });
      E.tone({ type: 'triangle', freq: r, dur: 0.32, gain: 0.12, delay: 0.02 });
      E.tone({ type: 'triangle', freq: r * 1.5, dur: 0.4, gain: 0.11, delay: 0.08 });
    },
    scoreSlam: function (E) {
      E.tone({ freq: 120, freqEnd: 38, dur: 0.5, gain: subGain });
      E.noise({ dur: 0.16, gain: 0.26, freq: 2400, freqEnd: 500, q: 0.8 });
    },
    ignite: function (E) {
      E.noise({ dur: 0.45, gain: 0.16, filter: 'lowpass', freq: 300, freqEnd: 2400, q: 0.9 });
      E.tone({ type: 'sawtooth', freq: 90, freqEnd: 180, dur: 0.4, gain: 0.07 });
    },
    lockOn: function (E) {
      E.tone({ type: 'square', freq: 2400, dur: 0.025, gain: 0.07 });
      E.tone({ type: 'square', freq: 1800, dur: 0.03, gain: 0.07, delay: 0.06 });
      E.tone({ freq: 110, freqEnd: 70, dur: 0.18, gain: 0.22, delay: 0.06 });
    },
    strikeImpact: function (E, p) {
      E.noise({ dur: 0.09, gain: 0.18 + 0.14 * p, filter: 'highpass', freq: 1800, q: 0.7 });
      E.tone({ freq: 140, freqEnd: 45, dur: 0.3, gain: 0.16 + 0.12 * p });
    },
    freezeOn: function (E) {
      var r = ROOT * 4;
      E.tone({ freq: 160, freqEnd: 60, dur: 0.3, gain: 0.2 });
      E.tone({ type: 'triangle', freq: r * 1.5, freqEnd: r, dur: 0.6, gain: 0.1 });
      E.tone({ freq: r * 3, freqEnd: r * 2, dur: 0.5, gain: 0.05, delay: 0.03 });
      E.noise({ dur: 0.35, gain: 0.08, filter: 'highpass', freq: 5000, freqEnd: 2000, q: 0.7 });
    },
    shatter: function (E) {
      E.noise({ dur: 0.22, gain: 0.2, filter: 'highpass', freq: 3000, freqEnd: 7000, q: 0.6 });
      var r = ROOT * 4;
      [[2, 0], [2.5, 0.025], [3, 0.05]].forEach(function (m) { E.tone({ freq: r * m[0], dur: 0.18, gain: 0.05, delay: m[1] }); });
    },
    derez: function (E) {
      E.noise({ dur: 0.4, gain: 0.16, freq: 3000, freqEnd: 300, q: 1.2 });
      E.tone({ type: 'sawtooth', freq: 400, freqEnd: 80, dur: 0.35, gain: 0.06 });
    },
    boot: function (E) {
      E.noise({ dur: 0.5, gain: 0.1, freq: 300, freqEnd: 3200, q: 1.4 });
      var r = ROOT * 2;
      [[1, 0.08], [1.5, 0.2], [2, 0.32]].forEach(function (m) { E.tone({ type: 'triangle', freq: r * m[0], dur: 0.16, gain: 0.08, delay: m[1] }); });
    },
    impact: function (E, i) {
      i = Math.min(Math.max(i, 0), 1);
      E.noise({ dur: 0.14 + i * 0.1, gain: impactGain * (0.5 + i * 0.8), filter: 'lowpass', freq: 1400 + i * 2600, freqEnd: 260, q: 0.9 });
      E.tone({ freq: 140 + i * 90, freqEnd: 52, dur: 0.2 + i * 0.14, gain: 0.22 + i * 0.16 });
    },
    carom: function (E) {
      E.tone({ freq: 130, freqEnd: 38, dur: 0.42, gain: subGain });
      E.noise({ dur: 0.2, gain: 0.3, freq: 2600, freqEnd: 420, q: 0.8 });
      E.tone({ type: 'triangle', freq: 330, freqEnd: 165, dur: 0.24, gain: 0.14 });
    },
    wallSplat: function (E) {
      E.noise({ dur: 0.26, gain: 0.34, filter: 'lowpass', freq: 900, freqEnd: 120, q: 1.4 });
      E.tone({ freq: 96, freqEnd: 34, dur: 0.36, gain: subGain * 0.85 });
    },
    rebound: function (E, i) {
      i = Math.min(Math.max(i, 0), 1);
      E.noise({ dur: 0.09, gain: 0.14 + i * 0.14, freq: 1800 + i * 1800, freqEnd: 700, q: 2.2 });
    },
    bumper: function (E) {
      E.tone({ type: 'square', freq: 660, freqEnd: 1180, dur: 0.13, gain: 0.16 });
      E.tone({ freq: 1320, dur: 0.1, gain: 0.09 });
    },
    pyre: function (E) { E.tone({ type: 'sawtooth', freq: 180, freqEnd: 720, dur: 0.3, gain: 0.13 }); },
    enemyDeath: function (E) {
      E.noise({ dur: 0.22, gain: 0.2, freq: 1800, freqEnd: 300, q: 0.7 });
      E.tone({ type: 'triangle', freq: 220, freqEnd: 70, dur: 0.24, gain: 0.14 });
    },
    playerHurt: function (E) {
      E.tone({ type: 'square', freq: 150, freqEnd: 62, dur: 0.28, gain: 0.24, detune: -18 });
      E.noise({ dur: 0.14, gain: 0.16, filter: 'lowpass', freq: 600, q: 1.1 });
    },
    playerDeath: function (E) {
      E.tone({ type: 'sawtooth', freq: 220, freqEnd: 28, dur: 1.1, gain: 0.3 });
      E.noise({ dur: 0.9, gain: 0.2, filter: 'lowpass', freq: 1200, freqEnd: 90, q: 1 });
    },
    roomClear: function (E) {
      E.tone({ freq: 120, freqEnd: 40, dur: 0.5, gain: subGain });
      E.tone({ type: 'triangle', freq: ROOT, dur: 0.3, gain: 0.16, delay: 0.02 });
      E.tone({ type: 'triangle', freq: ROOT * 1.5, dur: 0.3, gain: 0.15, delay: 0.11 });
      E.tone({ type: 'triangle', freq: ROOT * 2, dur: 0.45, gain: 0.16, delay: 0.2 });
    },
    boonPick: function (E) {
      var r = ROOT * 1.5;
      [[1, 0], [1.25, 0.05], [1.5, 0.1], [2, 0.16]].forEach(function (m) { E.tone({ type: 'triangle', freq: r * m[0], dur: 0.7, gain: 0.13, attack: 0.05, delay: m[1] }); });
    },
    doorOpen: function (E) {
      E.tone({ freq: 300, freqEnd: 900, dur: 0.35, gain: 0.14 });
      E.noise({ dur: 0.3, gain: 0.12, freq: 500, freqEnd: 2600, q: 1.6 });
    }
  };
  /** Today's strike: the release lands while the table is still in slow motion. */
  NOW.strikeInGame = function (E, p) {
    E.slowmo(true, -0.02);
    NOW.focusExit(E);
    NOW.slingshot(E, p);
    if (p >= 0.99) NOW.strikeImpact(E, p);
    E.slowmo(false, 0.01);
  };
  NOW.withDelay = function (E, d, fn) { var b = E.base; E.base = b + d; fn(); E.base = b; };

  /* ------------------------------------------------------------------ *
   * NEW
   * ------------------------------------------------------------------ */
  var NEW = {};
  function at(E, d, fn) { var b = E.base; E.base = b + d; try { fn(); } finally { E.base = b; } }
  NEW.at = at;

  // --- the shot
  NEW.strikeA = function (E, p) {
    // the release opens the world at once: nothing about the strike is muffled
    E.click({ i: 0.5 + 0.5 * p, freq: 2600, ring: 1500, cents: 40, dry: true, gain: 1.1 });
    E.tone({ type: 'triangle', freq: 1150 * rnd(40), freqEnd: 820, dur: 0.05 + 0.03 * p, gain: 0.1 + 0.1 * p, attack: 0.001, dry: true });
    E.noise({ dur: 0.05 + 0.06 * p, gain: 0.08 + 0.14 * p, filter: 'bandpass', freq: 1200 + 900 * p, freqEnd: 400, q: 0.9, dry: true });
    if (p > 0.35) E.thump({ freq: 120 + 50 * p, freqEnd: 55, dur: 0.12 + 0.12 * p, gain: 0.15 + 0.3 * p, dry: true });
    LLS.haptic(p > 0.9 ? 24 : 12);
  };
  NEW.strikeB = function (E, p) {
    NEW.strikeA(E, p);
    if (p > 0.65) {
      E.tone({ type: 'sawtooth', freq: 700, freqEnd: 2600, dur: 0.14, gain: 0.03 + 0.05 * p, lp: 5000, delay: 0.012, dry: true });
      E.noise({ dur: 0.18, gain: 0.05 + 0.05 * p, filter: 'highpass', freq: 3500, freqEnd: 7000, q: 0.7, delay: 0.01, dry: true });
    }
  };
  NEW.maxA = function (E) {
    E.tone({ type: 'square', freq: 2400, dur: 0.018, gain: 0.06, dry: true });
    E.tone({ type: 'square', freq: 3200, dur: 0.02, gain: 0.06, delay: 0.05, dry: true });
    E.tone({ type: 'triangle', freq: deg(10), dur: 0.22, gain: 0.12, delay: 0.05, dry: true });
    E.tone({ type: 'triangle', freq: deg(13), dur: 0.32, gain: 0.1, delay: 0.1, dry: true });
    E.thump({ freq: 120, freqEnd: 70, dur: 0.14, gain: 0.2, delay: 0.05, dry: true });
    LLS.haptic([10, 40, 14]);
  };
  NEW.maxB = function (E) {
    E.noise({ dur: 0.3, gain: 0.1, filter: 'bandpass', freq: 500, freqEnd: 3200, q: 2, attack: 0.25, dry: true });
    E.tone({ type: 'sawtooth', freq: 110, freqEnd: 220, dur: 0.3, gain: 0.04, lp: 1200, attack: 0.2, dry: true });
    at(E, 0.27, function () { NEW.maxA(E); });
  };
  NEW.contactA = function (E, i) {
    if (!E.cap('contact', 4, 0.05)) return;
    E.click({ i: i, freq: 3400, ring: 2900, cents: 80, gain: 2.4 });
    E.tone({ type: 'triangle', freq: 640 * rnd(60), dur: 0.03 + 0.03 * i, gain: 0.05 + 0.12 * i, attack: 0.001 });
    if (i > 0.6) E.thump({ freq: 150, freqEnd: 80, dur: 0.1, gain: 0.08 + 0.12 * i, harm: 0.7 });
    LLS.haptic(i > 0.6 ? 10 : 0);
  };
  NEW.contactB = function (E, i, n) {
    NEW.contactA(E, i);
    E.tone({ freq: deg(5 + (n || 0)), dur: 0.22, gain: 0.05 + 0.04 * i, attack: 0.002, delay: 0.004 });
  };
  NEW.railA = function (E, i) {
    if (!E.cap('rail', 3, 0.05)) return;
    E.thump({ freq: 210 * rnd(50), freqEnd: 120, dur: 0.07 + 0.05 * i, gain: 0.08 + 0.22 * i, harm: 0.8 });
    E.noise({ dur: 0.05, gain: 0.04 + 0.12 * i, filter: 'lowpass', freq: 1100, freqEnd: 400, q: 0.8 });
  };
  NEW.railB = function (E, i) {
    NEW.railA(E, i);
    E.tone({ type: 'sawtooth', freq: 1800 * rnd(40), freqEnd: 2500, dur: 0.06, gain: 0.015 + 0.035 * i, lp: 6000, delay: 0.005 });
  };
  NEW.potA = function (E, n) {
    n = n || 0;
    E.thump({ freq: 170, freqEnd: 70, dur: 0.22, gain: 0.24, harm: 0.8 });
    E.noise({ dur: 0.06, gain: 0.12, filter: 'lowpass', freq: 900, q: 0.8 });
    [0.07, 0.115, 0.15, 0.178].forEach(function (d, k) { E.click({ i: 0.45 - k * 0.09, freq: 2200 - k * 150, ring: 1700 - k * 120, delay: d, cents: 60, gain: 0.5 }); });
    E.tone({ type: 'triangle', freq: deg(n + 5), dur: 0.42, gain: 0.12, delay: 0.05, dry: true });
    E.tone({ freq: deg(n + 5) * 2, dur: 0.22, gain: 0.06, delay: 0.05, dry: true });
    LLS.haptic(18);
  };
  NEW.potB = function (E, n) {
    n = n || 0;
    E.thump({ freq: 170, freqEnd: 60, dur: 0.26, gain: 0.25, harm: 0.8 });
    E.noise({ dur: 0.08, gain: 0.1, filter: 'lowpass', freq: 900, q: 0.8 });
    [0, 1, 2].forEach(function (k) { E.tone({ type: 'triangle', freq: deg(n + 5 + k), dur: 0.26, gain: 0.09, delay: 0.04 + k * 0.045, dry: true }); E.tone({ freq: deg(n + 5 + k) * 2, dur: 0.14, gain: 0.04, delay: 0.04 + k * 0.045, dry: true }); });
    E.noise({ dur: 0.35, gain: 0.04, filter: 'highpass', freq: 6000, q: 0.7, delay: 0.05, dry: true });
    LLS.haptic(18);
  };
  NEW.scratchA = function (E) {
    E.duck(0.5, 0, 0.05, 0.3);
    E.thump({ freq: 150, freqEnd: 55, dur: 0.28, gain: 0.38 });
    E.tone({ type: 'sawtooth', freq: 233, freqEnd: 110, dur: 0.34, gain: 0.07, lp: 1400, delay: 0.06, dry: true });
    E.tone({ type: 'sawtooth', freq: 220, freqEnd: 104, dur: 0.34, gain: 0.07, lp: 1400, delay: 0.06, dry: true });
    LLS.haptic([30, 30, 30]);
  };
  NEW.respawnA = function (E) {
    E.noise({ dur: 0.3, gain: 0.14, filter: 'bandpass', freq: 300, freqEnd: 3000, q: 1.5, attack: 0.27, dry: true });
    E.click({ i: 0.6, freq: 3000, ring: 2400, delay: 0.29, dry: true });
    E.tone({ type: 'triangle', freq: deg(5), dur: 0.22, gain: 0.1, delay: 0.29, dry: true });
  };
  NEW.scratchB = function (E) {
    E.duck(0.5, 0, 0.1, 0.4);
    [1, 1.19, 1.5].forEach(function (m) { E.tone({ type: 'triangle', freq: 440 * m, freqEnd: 55 * m, glide: 0.45, dur: 0.5, gain: 0.08, dry: true }); });
    E.noise({ dur: 0.45, gain: 0.12, filter: 'lowpass', freq: 3000, freqEnd: 120, q: 1.2, dry: true });
    E.thump({ freq: 120, freqEnd: 40, dur: 0.4, gain: 0.3 });
    LLS.haptic([30, 30, 30]);
  };
  NEW.foulA = function (E) {
    [0, 0.16].forEach(function (d) {
      E.tone({ type: 'square', freq: 147, dur: 0.12, gain: 0.1, lp: 1600, delay: d, dry: true, attack: 0.002 });
      E.tone({ type: 'square', freq: 156, dur: 0.12, gain: 0.1, lp: 1600, delay: d, dry: true, attack: 0.002 });
    });
    E.noise({ dur: 0.28, gain: 0.12, filter: 'bandpass', freq: 400, freqEnd: 2600, q: 1.4, delay: 0.34 });
    E.tone({ type: 'triangle', freq: 330, freqEnd: 660, dur: 0.2, gain: 0.08, delay: 0.38 });
    LLS.haptic([40, 40, 40]);
  };
  NEW.x2A = function (E) {
    var f = deg(7) * 1.5;
    E.tone({ type: 'sawtooth', freq: f, dur: 0.32, gain: 0.08, lp: 2600, dry: true });
    E.tone({ type: 'sawtooth', freq: f * 1.5, dur: 0.36, gain: 0.07, lp: 3000, delay: 0.07, dry: true });
    E.tone({ type: 'triangle', freq: f * 0.5, dur: 0.3, gain: 0.1, dry: true });
    E.noise({ dur: 0.3, gain: 0.07, filter: 'highpass', freq: 5000, freqEnd: 8000, q: 0.7 });
    E.thump({ freq: 140, freqEnd: 80, dur: 0.12, gain: 0.18 });
    LLS.haptic(16);
  };
  NEW.x2B = function (E) {
    var f = deg(9);
    E.tone({ type: 'sawtooth', freq: f, dur: 0.12, gain: 0.09, lp: 2400, dry: true });
    E.tone({ type: 'sawtooth', freq: f * 2, dur: 0.34, gain: 0.09, lp: 3600, delay: 0.09, dry: true });
    E.tone({ freq: f * 4, dur: 0.24, gain: 0.04, delay: 0.09, dry: true });
    E.thump({ freq: 140, freqEnd: 80, dur: 0.12, gain: 0.18, delay: 0.09 });
    LLS.haptic(16);
  };
  NEW.mineA = function (E) {
    E.duck(0.55, 0, 0.08, 0.35);
    E.noise({ dur: 0.55, gain: 0.42, filter: 'lowpass', freq: 3500, freqEnd: 140, q: 0.9 });
    E.thump({ freq: 110, freqEnd: 35, dur: 0.55, gain: 0.38, harm: 1.1 });
    for (var k = 0; k < 7; k++) E.click({ i: 0.35, freq: 2500 + Math.random() * 3000, ring: 1800 + Math.random() * 1800, delay: 0.04 + Math.random() * 0.32, gain: 0.6 });
    LLS.haptic([60]);
  };
  NEW.kickerA = function (E) {
    E.thump({ freq: 130, freqEnd: 60, dur: 0.16, gain: 0.3 });
    E.tone({ type: 'triangle', freq: 180, freqEnd: 560, glide: 0.07, dur: 0.07, gain: 0.14 });
    E.tone({ type: 'triangle', freq: 560, freqEnd: 240, dur: 0.22, gain: 0.12, delay: 0.07 });
    E.tone({ type: 'square', freq: 560, freqEnd: 240, dur: 0.18, gain: 0.03, lp: 1800, delay: 0.07 });
    LLS.haptic(30);
  };
  NEW.iceA = function (E) {
    [[2637, 0], [3951, 0.03], [5274, 0.06], [3136, 0.1]].forEach(function (p) { E.tone({ freq: p[0] * rnd(10), dur: 0.5, gain: 0.05, attack: 0.002, delay: p[1], dry: true }); });
    E.noise({ dur: 0.4, gain: 0.05, filter: 'highpass', freq: 6000, freqEnd: 9000, q: 0.7, dry: true });
    E.tone({ type: 'triangle', freq: deg(10), dur: 0.3, gain: 0.08, dry: true });
  };
  NEW.freezeOnA = function (E) {
    E.duck(0.45, 0.16, 0.1, 0.4);
    E.noise({ dur: 0.2, gain: 0.12, filter: 'highpass', freq: 2500, freqEnd: 6000, q: 0.7, attack: 0.18, dry: true });
    at(E, 0.18, function () {
      E.thump({ freq: 150, freqEnd: 50, dur: 0.32, gain: 0.32, dry: true });
      [[1760, 0], [2640, 0.01], [3520, 0.02]].forEach(function (p) { E.tone({ freq: p[0], dur: 0.7, gain: 0.05, delay: p[1], dry: true }); });
      E.tone({ type: 'triangle', freq: deg(12), freqEnd: deg(10), dur: 0.7, gain: 0.08, dry: true });
    });
    LLS.haptic([10, 160, 30]);
  };
  NEW.freezeOffA = function (E) {
    E.noise({ dur: 0.18, gain: 0.2, filter: 'highpass', freq: 3000, freqEnd: 7000, q: 0.6, dry: true });
    for (var k = 0; k < 5; k++) E.click({ i: 0.3, freq: 4000 + k * 600, ring: 3000 + k * 500, delay: k * 0.018, gain: 0.6, dry: true });
    E.tone({ type: 'triangle', freq: 110, freqEnd: 440, dur: 0.26, gain: 0.08, dry: true });
  };
  NEW.portalA = function (E) {
    E.noise({ dur: 0.16, gain: 0.12, filter: 'bandpass', freq: 400, freqEnd: 3000, q: 2.5 });
    E.noise({ dur: 0.18, gain: 0.1, filter: 'bandpass', freq: 3000, freqEnd: 500, q: 2.5, delay: 0.14 });
    E.tone({ freq: 600, freqEnd: 1250, dur: 0.15, gain: 0.07 });
    E.tone({ freq: 1250, freqEnd: 600, dur: 0.18, gain: 0.07, delay: 0.14 });
  };
  NEW.bumperA = function (E) {
    var v = rnd(60);
    E.tone({ type: 'square', freq: 520 * v, dur: 0.02, gain: 0.08, dry: false });
    E.tone({ freq: 880 * v, dur: 0.26, gain: 0.12, attack: 0.001 });
    E.tone({ freq: 1320 * v, dur: 0.16, gain: 0.06, attack: 0.001 });
    E.thump({ freq: 170, freqEnd: 90, dur: 0.1, gain: 0.2 });
    LLS.haptic(14);
  };
  NEW.plusShotA = function (E) {
    [0, 1, 2].forEach(function (k) { E.tone({ type: 'triangle', freq: deg(8 + k * 2), dur: 0.2, gain: 0.12, delay: k * 0.06, dry: true }); E.tone({ freq: deg(8 + k * 2) * 2, dur: 0.12, gain: 0.04, delay: k * 0.06, dry: true }); });
    // and the counter catching it, 0.55 s later
    E.click({ i: 0.5, freq: 2600, ring: 2000, delay: 0.55, dry: true });
    E.thump({ freq: 160, freqEnd: 80, dur: 0.1, gain: 0.2, delay: 0.55, dry: true });
  };
  NEW.upgradeA = function (E) {
    [0, 1, 2, 3].forEach(function (k) { E.tone({ type: 'sawtooth', freq: deg(5 + k * 2), dur: 0.3, gain: 0.05, lp: 3000, delay: k * 0.05, dry: true }); E.tone({ type: 'triangle', freq: deg(5 + k * 2), dur: 0.3, gain: 0.08, delay: k * 0.05, dry: true }); });
    E.noise({ dur: 0.5, gain: 0.05, filter: 'highpass', freq: 5000, freqEnd: 9000, q: 0.7, delay: 0.15, dry: true });
  };
  NEW.comboA = function (E, n) {
    n = n || 2;
    var f = deg(n + 5);
    [1, 1.5, 2].forEach(function (m, k) { E.tone({ type: 'sawtooth', freq: f * m, dur: 0.3, gain: 0.06, lp: 2800, delay: 0.02 * k, dry: true }); });
    E.tone({ type: 'triangle', freq: f * 2, dur: 0.4, gain: 0.08, dry: true });
    E.thump({ freq: 140, freqEnd: 70, dur: 0.14, gain: 0.2, dry: true });
  };
  NEW.lastBallA = function (E) {
    // silence first: the table hushes for a beat, then the drop lands big
    E.duck(0.2, 0, 0.12, 0.05);
    E.noise({ dur: 0.14, gain: 0.08, filter: 'bandpass', freq: 600, freqEnd: 3500, q: 2, attack: 0.12, dry: true });
    at(E, 0.15, function () {
      E.thump({ freq: 160, freqEnd: 45, dur: 0.45, gain: 0.48, harm: 0.8, dry: true });
      E.tone({ type: 'triangle', freq: deg(10), dur: 0.7, gain: 0.16, dry: true });
      E.tone({ freq: deg(15), dur: 0.6, gain: 0.07, delay: 0.02, dry: true });
      E.tone({ freq: deg(17), dur: 0.6, gain: 0.05, delay: 0.04, dry: true });
      E.noise({ dur: 0.7, gain: 0.05, filter: 'highpass', freq: 6000, q: 0.7, dry: true });
    });
    LLS.haptic([10, 120, 40]);
  };
  NEW.bombA = function (E) {
    E.duck(0.4, 0, 0.12, 0.5);
    E.noise({ dur: 0.9, gain: 0.45, filter: 'lowpass', freq: 4500, freqEnd: 120, q: 0.9 });
    E.thump({ freq: 95, freqEnd: 32, dur: 0.85, gain: 0.4, harm: 1.1 });
    E.noise({ dur: 0.08, gain: 0.3, filter: 'highpass', freq: 2500, q: 0.7 });
    for (var k = 0; k < 10; k++) E.click({ i: 0.3, freq: 2000 + Math.random() * 4000, ring: 1500 + Math.random() * 2500, delay: 0.06 + Math.random() * 0.5, gain: 0.55 });
    LLS.haptic([80]);
  };
  NEW.cutinA = function (E) {
    E.noise({ dur: 0.2, gain: 0.12, filter: 'bandpass', freq: 600, freqEnd: 4500, q: 1.4, dry: true });
    E.thump({ freq: 150, freqEnd: 70, dur: 0.14, gain: 0.26, delay: 0.17, dry: true });
    E.click({ i: 0.7, freq: 3000, ring: 2200, delay: 0.17, dry: true });
  };

  // --- scoring
  NEW.noteA = function (E, i, bucket) {
    var f = deg(i) * (bucket === 'mult' ? 1.5 : 1);
    if (bucket === 'mult') {
      E.tone({ type: 'sawtooth', freq: f, dur: 0.26, gain: 0.08, lp: 2200, attack: 0.002, dry: true });
      E.tone({ type: 'square', freq: f * 0.5, dur: 0.2, gain: 0.04, lp: 1200, attack: 0.002, dry: true });
      E.thump({ freq: 160, freqEnd: 90, dur: 0.08, gain: 0.12, dry: true });
    } else {
      E.tone({ type: 'triangle', freq: f, dur: 0.3, gain: 0.18, attack: 0.002, dry: true });
      E.tone({ freq: f * 2, dur: 0.14, gain: 0.07, attack: 0.001, dry: true });
    }
    E.click({ i: 0.35, freq: 4200, ring: 3600, cents: 30, gain: 0.5, dry: true });
  };
  NEW.noteB = function (E, i, bucket) {
    // a chip landing: two fast clacks with the note under them
    E.click({ i: 0.5, freq: 5200, ring: 4300, cents: 90, dry: true });
    E.click({ i: 0.35, freq: 4800, ring: 3900, cents: 90, delay: 0.022, dry: true });
    var f = deg(i) * (bucket === 'mult' ? 1.5 : 1);
    E.tone({ type: bucket === 'mult' ? 'sawtooth' : 'triangle', freq: f, dur: 0.24, gain: bucket === 'mult' ? 0.07 : 0.15, lp: bucket === 'mult' ? 2200 : null, dry: true });
  };
  NEW.thudA = function (E) { E.thump({ freq: 170, freqEnd: 85, dur: 0.1, gain: 0.18, harm: 0.8, dry: true }); };
  NEW.lockA = function (E) {
    E.click({ i: 0.8, freq: 2400, ring: 1800, dry: true });
    E.thump({ freq: 150, freqEnd: 70, dur: 0.16, gain: 0.26, dry: true });
    E.tone({ type: 'triangle', freq: deg(10), dur: 0.34, gain: 0.11, delay: 0.02, dry: true });
    E.tone({ type: 'triangle', freq: deg(13), dur: 0.4, gain: 0.09, delay: 0.06, dry: true });
  };
  NEW.slamA = function (E) {
    // a beat of quiet before the hit (the duck), then the hit on top of it
    E.duck(0.25, 0, 0.07, 0.02);
    at(E, 0.09, function () {
      E.duck(0.6, 0.0, 0.05, 0.35);
      E.noise({ dur: 0.16, gain: 0.3, filter: 'bandpass', freq: 2400, freqEnd: 500, q: 0.8, dry: true });
      E.click({ i: 1, freq: 3000, ring: 2200, dry: true });
      E.thump({ freq: 120, freqEnd: 40, dur: 0.5, gain: 0.5, harm: 0.85, dry: true });
      [1, 1.5, 2].forEach(function (m) { E.tone({ type: 'sawtooth', freq: deg(5) * m, dur: 0.36, gain: 0.055, lp: 2000, dry: true }); });
    });
    LLS.haptic([0, 90, 40]);
  };
  NEW.slamB = function (E) {
    NEW.slamA(E);
    at(E, 0.09, function () {
      E.tone({ type: 'sawtooth', freq: deg(10), dur: 0.5, gain: 0.04, lp: 3000, delay: 0.06, dry: true });
      E.noise({ dur: 0.9, gain: 0.05, filter: 'highpass', freq: 6500, q: 0.7, delay: 0.02, dry: true });
      E.thump({ freq: 60, freqEnd: 30, dur: 0.6, gain: 0.25, harm: 1, dry: true });
    });
  };
  NEW.tallyA = function (E, k, last) {
    // the run of ticks climbs the scale, each a touch brighter; every fourth is accented
    var f = deg(Math.min(4 + k, 18));
    E.tone({ type: 'triangle', freq: f, dur: 0.12, gain: k % 4 === 0 ? 0.14 : 0.09, attack: 0.002, dry: true });
    E.click({ i: 0.2, freq: 5000, ring: 4200, gain: 0.5, dry: true });
    if (last) { E.tone({ type: 'triangle', freq: deg(15), dur: 0.6, gain: 0.15, delay: 0.05, dry: true }); E.tone({ freq: deg(20), dur: 0.5, gain: 0.06, delay: 0.05, dry: true }); E.thump({ freq: 150, freqEnd: 70, dur: 0.14, gain: 0.22, delay: 0.05, dry: true }); }
  };
  NEW.coinA = function (E, k, falling) {
    if (!E.cap('coin', 3, 0.06)) return;
    var s = Math.min(k || 0, 12), r = Math.pow(2, (falling ? -s : s) / 12);
    E.tone({ type: 'square', freq: 988 * r, dur: 0.06, gain: 0.085, lp: 5000, attack: 0.001, dry: true });
    E.tone({ type: 'square', freq: 1319 * r, dur: 0.22, gain: 0.085, lp: 5000, attack: 0.001, delay: 0.055, dry: true });
    E.tone({ freq: 2638 * r, dur: 0.15, gain: 0.03, delay: 0.055, dry: true });
  };
  NEW.kachingA = function (E) {
    E.click({ i: 0.9, freq: 3200, ring: 2500, dry: true });
    E.click({ i: 0.7, freq: 2800, ring: 2100, delay: 0.05, dry: true });
    [[2093, 0.08], [2637, 0.1], [3136, 0.12]].forEach(function (p) { E.tone({ freq: p[0], dur: 0.6, gain: 0.05, delay: p[1], dry: true }); });
    E.thump({ freq: 160, freqEnd: 90, dur: 0.12, gain: 0.18, delay: 0.05, dry: true });
  };
  NEW.clearA = function (E) {
    E.duck(0.3, 0, 0.08, 0.02);
    at(E, 0.09, function () {
      E.thump({ freq: 130, freqEnd: 40, dur: 0.55, gain: 0.5, harm: 0.85, dry: true });
      [0, 1, 2, 3, 4].forEach(function (k) { E.tone({ type: 'triangle', freq: deg(5 + k), dur: 0.22, gain: 0.12, delay: k * 0.05, dry: true }); });
      [10, 12, 15].forEach(function (d, k) { E.tone({ type: 'sawtooth', freq: deg(d), dur: 0.7, gain: 0.045, lp: 2600, delay: 0.27 + k * 0.01, dry: true }); E.tone({ type: 'triangle', freq: deg(d), dur: 0.8, gain: 0.08, delay: 0.27, dry: true }); });
      E.noise({ dur: 1, gain: 0.05, filter: 'highpass', freq: 6500, q: 0.7, delay: 0.27, dry: true });
    });
    LLS.haptic([0, 90, 30, 30, 30]);
  };
  NEW.failA = function (E) {
    // one sound for a table lost: the heart cracks, and a falling minor line
    E.noise({ dur: 0.12, gain: 0.18, filter: 'highpass', freq: 3500, q: 0.7, dry: true });
    E.tone({ freq: 1400, freqEnd: 900, dur: 0.3, gain: 0.05, dry: true });
    E.tone({ freq: 1480, freqEnd: 870, dur: 0.3, gain: 0.05, dry: true });
    E.thump({ freq: 120, freqEnd: 50, dur: 0.4, gain: 0.25, harm: 1, dry: true });
    [7, 5, 3].forEach(function (d, k) { E.tone({ type: 'triangle', freq: deg(d), dur: 0.45, gain: 0.12, delay: 0.18 + k * 0.17, dry: true }); });
    LLS.haptic([60, 40, 30]);
  };
  NEW.heartA = function (E) {
    E.noise({ dur: 0.1, gain: 0.2, filter: 'highpass', freq: 3500, q: 0.7, dry: true });
    E.tone({ freq: 1400, freqEnd: 900, dur: 0.3, gain: 0.06, dry: true });
    E.tone({ freq: 1480, freqEnd: 870, dur: 0.3, gain: 0.06, dry: true });
    E.thump({ freq: 120, freqEnd: 50, dur: 0.4, gain: 0.26, harm: 1, dry: true });
    LLS.haptic([50]);
  };
  NEW.runOverA = function (E) {
    [10, 7, 5, 2].forEach(function (d, k) { E.tone({ type: 'triangle', freq: deg(d), dur: 0.55, gain: 0.12, delay: k * 0.22, dry: true }); });
    E.tone({ type: 'sawtooth', freq: 110, dur: 1.8, gain: 0.05, lp: 700, attack: 0.3, dry: true });
    E.thump({ freq: 100, freqEnd: 40, dur: 0.9, gain: 0.2, harm: 1, delay: 0.66, dry: true });
  };
  NEW.runCompleteA = function (E) {
    E.duck(0.3, 0, 0.08, 0.02);
    at(E, 0.09, function () {
      [[5, 7, 10], [7, 10, 12], [10, 12, 15]].forEach(function (ch, k) {
        ch.forEach(function (d) { E.tone({ type: 'sawtooth', freq: deg(d), dur: 0.3, gain: 0.035, lp: 2600, delay: k * 0.18, dry: true }); E.tone({ type: 'triangle', freq: deg(d), dur: 0.32, gain: 0.06, delay: k * 0.18, dry: true }); });
        E.thump({ freq: 130, freqEnd: 60, dur: 0.2, gain: 0.3, delay: k * 0.18, dry: true });
      });
      [10, 11, 12, 13, 14, 15].forEach(function (d, k) { E.tone({ type: 'triangle', freq: deg(d), dur: 0.3, gain: 0.08, delay: 0.6 + k * 0.05, dry: true }); });
      [15, 17, 20].forEach(function (d) { E.tone({ freq: deg(d), dur: 1.4, gain: 0.05, delay: 0.92, dry: true }); });
      E.noise({ dur: 1.4, gain: 0.05, filter: 'highpass', freq: 6500, q: 0.7, delay: 0.9, dry: true });
    });
  };
  NEW.achA = function (E) {
    [[1319, 0], [1760, 0.09]].forEach(function (p) { E.tone({ freq: p[0], dur: 0.5, gain: 0.08, delay: p[1], dry: true }); E.tone({ type: 'triangle', freq: p[0] / 2, dur: 0.45, gain: 0.08, delay: p[1], dry: true }); });
    E.noise({ dur: 0.5, gain: 0.04, filter: 'highpass', freq: 7000, q: 0.7, delay: 0.09, dry: true });
  };
  NEW.cardA = function (E) {
    E.noise({ dur: 0.22, gain: 0.1, filter: 'bandpass', freq: 500, freqEnd: 3000, q: 1.3, dry: true });
    E.thump({ freq: 140, freqEnd: 65, dur: 0.16, gain: 0.26, delay: 0.2, dry: true });
    E.click({ i: 0.6, freq: 2600, ring: 2000, delay: 0.2, dry: true });
  };
  NEW.rerollA = function (E) {
    for (var k = 0; k < 8; k++) { var d = 0.3 * (1 - Math.pow(1 - k / 8, 1.6)); E.click({ i: 0.35, freq: 2400 + k * 200, ring: 1800 + k * 160, delay: d, cents: 30, dry: true }); }
    E.tone({ type: 'triangle', freq: deg(8), dur: 0.2, gain: 0.1, delay: 0.33, dry: true });
  };
  NEW.sellA = function (E) {
    [0, 1, 2].forEach(function (k) { NEW.at(E, k * 0.07, function () { NEW.coinA(E, 4 - k * 2, true); }); });
  };
  NEW.tapA = function (E) {
    E.tone({ freq: 1900 * rnd(30), dur: 0.03, gain: 0.05, attack: 0.001, dry: true });
    E.noise({ dur: 0.01, gain: 0.04, filter: 'highpass', freq: 4000, q: 0.7, attack: 0.001, dry: true });
  };
  NEW.backA = function (E) { E.tone({ freq: 1300 * rnd(30), dur: 0.035, gain: 0.05, attack: 0.001, dry: true }); };
  NEW.derezA = function (E) {
    E.noise({ dur: 0.35, gain: 0.12, freq: 3000, freqEnd: 300, q: 1.2, dry: true });
    E.tone({ type: 'sawtooth', freq: 400, freqEnd: 80, dur: 0.3, gain: 0.05, lp: 2000, dry: true });
  };
  NEW.bootA = function (E) {
    E.noise({ dur: 0.4, gain: 0.08, freq: 300, freqEnd: 3200, q: 1.4, dry: true });
    [5, 7, 10].forEach(function (d, k) { E.tone({ type: 'triangle', freq: deg(d), dur: 0.14, gain: 0.08, delay: 0.08 + k * 0.1, dry: true }); });
    E.thump({ freq: 140, freqEnd: 70, dur: 0.12, gain: 0.18, delay: 0.38, dry: true });
  };
  NEW.aimInA = function (E) { E.noise({ dur: 0.25, gain: 0.06, filter: 'lowpass', freq: 1400, freqEnd: 350, q: 0.7, dry: true }); E.tone({ freq: 320, freqEnd: 160, dur: 0.22, gain: 0.05, dry: true }); };
  NEW.aimCancelA = function (E) { E.tone({ freq: 200, freqEnd: 330, dur: 0.12, gain: 0.05, dry: true }); };

  window.LLV = { NOW: NOW, NEW: NEW };
})();

/* The review cards. `now` = what plays today (null: silent), `level` = measured
   loudest-50ms RMS of today's voice, rendered offline through the real chain. */
(function () {
  'use strict';
  var N = LLV.NOW, W = LLV.NEW, at = W.at;
  var P3 = [['Soft', 0.3], ['Medium', 0.65], ['Full', 1]];
  function seq(list) { return function (E) { list.forEach(function (s) { at(E, s[0], function () { s[1](E); }); }); }; }

  var GROUPS = [
    { id: 'shot', title: 'The shot', lede: 'Your strike, the balls meeting, rails and pockets. These play most often, so they get the most variation and the tightest voice caps.' },
    { id: 'table', title: 'Things on the table', lede: 'Rings, mines, pickups, freeze, portals, bumpers, abilities.' },
    { id: 'score', title: 'Scoring', lede: 'Points × Mult, the slam, the tally, coins. Pitch climbs the same pentatonic scale the game already uses.' },
    { id: 'run', title: 'Tables and the run', lede: 'CLEAR!, a lost table, hearts, the end of a run.' },
    { id: 'meta', title: 'Menus and shop', lede: 'Cards, the shop and taps. Quiet and short by design.' }
  ];

  var CARDS = [
    { id: 'strike', g: 'shot', title: 'Cue strike', when: 'Releasing the shot, at any power.', where: 'main.js:2295 slingshot · main.js:994 strikeImpact (full power)',
      now: { fn: function (E, p) { N.strikeInGame(E, p); }, desc: 'slingshot: a noise snap and a falling square blip; strikeImpact adds a crack at full power.' }, level: '−29.5 dB, 12 dB under the slam',
      issues: ['Plays while the table is still in slow motion, so the 620 Hz slow-mo filter takes the crack off: 0% of its energy above 1 kHz in game, against 7% unmuffled.', 'The quietest key sound in the game, though it is the one you make most.', 'Same sound every time except for power.'],
      args: P3,
      v: [{ k: 'A', name: 'Crack', desc: 'A dry click, a short knock and a thump that grows with power. It bypasses the slow-mo filter (the release breaks it at once). ±40 cents per strike. Haptic 12 / 24 ms.', fn: W.strikeA },
          { k: 'B', name: 'Crack + streak', desc: 'A, plus a rising zip and air over 65% power, matching the streak trail.', fn: W.strikeB }] },
    { id: 'max', g: 'shot', title: 'Full power reached', when: 'Pulling back to 100%.', where: 'main.js:1268–1284 maxPower / ignite / lockOn',
      now: { fn: function (E) { N.maxPower(E); }, desc: 'maxPower: a two-note riser over a soft thump (plus ignite or lockOn by cue style). Muffled the same way, since it plays during aim.' }, level: '−29.3 dB',
      issues: ['Plays at slow-mo time scale 0, so it is muffled like the strike.', 'The riser and thump are below most phone speakers.'],
      v: [{ k: 'A', name: 'Lock click', desc: 'Two hard ticks, a rising fifth and a phone-audible thump. Dry, so the slow-mo filter does not touch it.', fn: W.maxA },
          { k: 'B', name: 'Charge then lock', desc: 'A short rising charge over the last stretch of the pull, landing on A.', fn: W.maxB }] },
    { id: 'contact', g: 'shot', title: 'Ball meets ball', when: 'The cue ball hits a ball, or two balls hit each other (combo, carom).', where: 'main.js:2005 impact (cue → ball) · main.js:2024 carom (ball → ball)',
      now: { fn: function (E, i) { if (i === 'four') { [0, 0.06, 0.13, 0.19].forEach(function (d, k) { at(E, d, function () { k ? N.carom(E) : N.impact(E, 0.8); }); }); } else N.impact(E, i); }, desc: 'impact: a low-passed noise burst and a sine drop. carom (any ball-on-ball after the first) is a 130→38 Hz sub drop with a crack.' }, level: 'impact −20 to −25 dB · carom −17.6 dB (as loud as the slam)',
      issues: ['No click. A real ball-on-ball contact is a sharp, very short transient, and this is a thud.', 'carom is 49% sub-bass below 150 Hz, which a phone speaker cannot play, and it is as loud as the score slam.', 'Same pitch every time, so a break sounds like one sample repeated.'],
      args: [['Soft', 0.25], ['Hard', 0.9], ['Break (4 hits)', 'four']],
      v: [{ k: 'A', name: 'Click', desc: 'A sub-millisecond-sharp click and a 2.9 kHz ring, loudness and length by speed, ±80 cents random per hit, at most 4 clicks in 50 ms. Hard hits add a small thump.', fn: function (E, i) { if (i === 'four') { [0, 0.06, 0.13, 0.19].forEach(function (d, k) { at(E, d, function () { W.contactA(E, 0.9 - k * 0.15); }); }); } else W.contactA(E, i); } },
          { k: 'B', name: 'Click + ladder note', desc: 'A, with a quiet pentatonic ping that climbs one step per contact in the stroke (the Peggle peg ladder).', fn: function (E, i) { if (i === 'four') { [0, 0.06, 0.13, 0.19].forEach(function (d, k) { at(E, d, function () { W.contactB(E, 0.9 - k * 0.15, k); }); }); } else W.contactB(E, i, 0); } }] },
    { id: 'rail', g: 'shot', title: 'Rail (cushion)', when: 'Any ball off a cushion.', where: 'main.js:2267 rebound (cue ball) · main.js:2038 wallSplat (object ball, hard) · main.js:2051 enemyRebound (object ball, soft: silent)',
      now: { fn: function (E, i) { if (i === 'obj') N.wallSplat(E); else N.rebound(E, i); }, desc: 'Cue ball: a 90 ms noise tick. Object ball: silent, unless it hits at 16+ speed, then wallSplat, a heavy sub thud.' }, level: 'cue rail −41 to −47 dB (nearly inaudible) · wallSplat −19.6 dB (louder than a pot)',
      issues: ['The cue ball\'s rail is 25 dB under the slam, so banks are almost silent.', 'An object ball off a soft rail makes no sound.', 'A hard object rail is 75% sub-bass and louder than a pot.'],
      args: [['Cue, soft', 0.3], ['Cue, hard', 0.9], ['Object, hard', 'obj']],
      v: [{ k: 'A', name: 'Cushion thup', desc: 'A short 210→120 Hz body with harmonics a phone can play, plus a soft noise puff, by speed. Every ball, every rail, ±50 cents. At most 3 in 50 ms.', fn: function (E, i) { W.railA(E, i === 'obj' ? 0.85 : i); } },
          { k: 'B', name: 'Thup + light zing', desc: 'A, plus a tiny bright zing, because these rails are lines of light.', fn: function (E, i) { W.railB(E, i === 'obj' ? 0.85 : i); } }] },
    { id: 'pot', g: 'shot', title: 'Pocket drop', when: 'A ball goes down.', where: 'main.js:1553 removeBall → enemyDeath · main.js:2135 chainNote (only with the score feed off)',
      now: { fn: function (E, n) { if (n === 'three') { [0, 0.5, 1].forEach(function (d) { at(E, d, function () { N.enemyDeath(E); }); }); } else N.enemyDeath(E); }, desc: 'enemyDeath, left from the action prototype: a falling noise sweep and a triangle drop.' }, level: '−31.2 dB, 14 dB under the slam and 12 dB under a hard rail',
      issues: ['The moment the game is about is one of its quietest sounds.', 'No drop, no rattle, no pitch. Every pot sounds the same, whether it is the first, a combo, or the last ball.'],
      args: [['One pot', 0], ['Three pots in a stroke', 'three']],
      v: [{ k: 'A', name: 'Drop and rattle', desc: 'A harmonic thunk, four quick rattles in the pocket and a note that climbs one step for each pot in the stroke. Haptic 18 ms.', fn: function (E, n) { if (n === 'three') { [0, 0.5, 1].forEach(function (d, k) { at(E, d, function () { W.potA(E, k); }); }); } else W.potA(E, 0); } },
          { k: 'B', name: 'Drop and light', desc: 'The thunk, then a fast three-note glass rise and sparkle, also climbing per pot.', fn: function (E, n) { if (n === 'three') { [0, 0.5, 1].forEach(function (d, k) { at(E, d, function () { W.potB(E, k * 2); }); }); } else W.potB(E, 0); } }] },
    { id: 'scratch', g: 'shot', title: 'Scratch', when: 'The cue ball drops.', where: 'main.js:2181 playerHurt · Moments.js:1621–1681 (glitch: playerHurt, scoreSlam, doorOpen, scoreLock, boot)',
      now: { fn: seq([[0, function (E) { N.playerHurt(E); }], [0.49, function (E) { N.scoreSlam(E); }], [1.29, function (E) { N.doorOpen(E); }], [2.0, function (E) { N.scoreLock(E); }], [2.1, function (E) { N.boot(E); }]]), desc: 'playerHurt (an old damage sound), then five more voices over two seconds, including the score slam.' }, level: 'playerHurt −23.8 dB, then the slam at −17.4 dB',
      issues: ['Uses the score slam, the reward sound, for a mistake.', 'Five voices for one event.'],
      v: [{ k: 'A', name: 'Drop, deny, respawn', desc: 'A thunk under a falling two-saw rub (a minor second), then a reversed swell into a click as the cue ball comes back. The two halves are one gesture, the way Celeste\'s death and respawn are.', fn: seq([[0, W.scratchA], [1.2, W.respawnA]]) },
          { k: 'B', name: 'Tape stop', desc: 'A chord dives in pitch like a tape stopping, with a low thud. Then the same respawn as A.', fn: seq([[0, W.scratchB], [1.2, W.respawnA]]) }] },
    { id: 'foul', g: 'shot', title: 'Foul: the 8 comes back', when: 'The 8 (or a ball out of order) drops too early and is put back.', where: 'main.js:2084 playerHurt',
      now: { fn: function (E) { N.playerHurt(E); }, desc: 'playerHurt, the same as a scratch, a mine or a kickback.' }, level: '−23.8 dB',
      issues: ['Four different mistakes share one sound.', 'Nothing marks the ball coming back.'],
      v: [{ k: 'A', name: 'Buzz and pop back', desc: 'Two short low buzzes (rejected), then a rising whoosh as the ball pops back onto its spot.', fn: W.foulA }] },

    { id: 'x2', g: 'table', title: '×2 ring', when: 'The cue ball crosses a ×2 ring.', where: 'main.js:2214 pyre',
      now: { fn: function (E) { N.pyre(E); }, desc: 'pyre, left from the prototype: a rising sawtooth.' }, level: '−33.6 dB',
      issues: ['Quiet, and has nothing to do with the MULT box\'s sound.'],
      v: [{ k: 'A', name: 'Mult chime', desc: 'The MULT box\'s own filtered saw, a fifth and its fifth, with air on top, so you hear the multiplier going up.', fn: W.x2A },
          { k: 'B', name: 'Times two', desc: 'Two notes, the second an octave up: "×2" said in pitch.', fn: W.x2B }] },
    { id: 'mine', g: 'table', title: 'Mine', when: 'A ball sets off a mine.', where: 'main.js:2256 wallSplat',
      now: { fn: function (E) { N.wallSplat(E); }, desc: 'wallSplat, the same as a hard rail.' }, level: '−19.6 dB, 75% below 150 Hz',
      issues: ['Sounds like a rail, and on a phone it is mostly gone.'],
      v: [{ k: 'A', name: 'Blast', desc: 'A closing noise blast, a harmonic sub and a crackle tail. Ducks the rest of the mix briefly. Haptic 60 ms.', fn: W.mineA }] },
    { id: 'kicker', g: 'table', title: 'Kicker', when: 'A ball hits a kicker and is thrown back.', where: 'main.js:2247 wallSplat',
      now: { fn: function (E) { N.wallSplat(E); }, desc: 'wallSplat, again.' }, level: '−19.6 dB',
      issues: ['The same as a mine and a hard rail.'],
      v: [{ k: 'A', name: 'Spring kick', desc: 'A thump and a quick up-and-down spring.', fn: W.kickerA }] },
    { id: 'ice', g: 'table', title: 'Freeze pickup (ice)', when: 'The cue ball picks up a freeze charge.', where: 'main.js:2220 boonPick',
      now: { fn: function (E) { N.boonPick(E); }, desc: 'boonPick: a slow triad. Also used for the upgrade, +1 shot, achievements, shop buys and holds.' }, level: '−28 dB',
      issues: ['Six different events share it.', 'Its 50 ms attack is soft for a pickup.'],
      v: [{ k: 'A', name: 'Ice ting', desc: 'Bell partials high up, an icy shimmer and one note.', fn: W.iceA }] },
    { id: 'freeze', g: 'table', title: 'Freeze on / off', when: 'Tapping FREEZE, and time starting again.', where: 'Moments.js:1726 freezeOn · Moments.js:1790 shatter · main.js:1924 focusEnter (cut-ins off)',
      now: { fn: seq([[0, function (E) { N.freezeOn(E); }], [1.4, function (E) { N.shatter(E); }]]), desc: 'freezeOn: a glassy chime over a low hit. shatter: noise and three tones.' }, level: 'freezeOn −24.9 dB · shatter −28.8 dB',
      issues: ['Good ideas already. The hit comes with no build-up, and the low hit does not reach a phone.'],
      v: [{ k: 'A', name: 'Swell, hit, crack', desc: 'A short reversed swell into the glass hit, which ducks the table. Off: a crackle of ice and a tape-start rise.', fn: seq([[0, W.freezeOnA], [1.4, W.freezeOffA]]) }] },
    { id: 'portal', g: 'table', title: 'Portal', when: 'A ball goes through a portal.', where: 'none (PhysicsSystem raises no event for it)',
      now: null, level: 'silent',
      issues: ['Silent. Needs a new hook from the physics.'],
      v: [{ k: 'A', name: 'Phase through', desc: 'A whoosh in and out with the pitch flipping across the gate.', fn: W.portalA }] },
    { id: 'bumper', g: 'table', title: 'Bumper', when: 'The cue ball hits a bumper.', where: 'main.js:2283 bumper (plus the rail tick)',
      now: { fn: function (E) { N.bumper(E); }, desc: 'bumper: a rising square and a sine.' }, level: '−29.4 dB',
      issues: ['Fine as an idea. Thin, and the same every time.'],
      v: [{ k: 'A', name: 'Pinball pop', desc: 'A click, a ringing two-partial bong and a thump, ±60 cents per hit.', fn: W.bumperA }] },
    { id: 'plus', g: 'table', title: '+1 shot ring', when: 'Picking up an extra shot; it flies to the counter.', where: 'main.js:2241 boonPick · main.js:1873 scoreLock (lands)',
      now: { fn: seq([[0, function (E) { N.boonPick(E); }], [0.55, function (E) { N.scoreLock(E); }]]), desc: 'boonPick, then scoreLock when it lands.' }, level: '−28 dB, then −26 dB',
      issues: ['Shares its sound with five other events.'],
      v: [{ k: 'A', name: 'Extra-life run', desc: 'A quick three-note climb, then a click and thump as it lands on the counter.', fn: W.plusShotA }] },
    { id: 'upgrade', g: 'table', title: 'Upgrade pickup', when: 'Picking up an upgrade token.', where: 'main.js:2232 boonPick',
      now: { fn: function (E) { N.boonPick(E); }, desc: 'boonPick.' }, level: '−28 dB',
      issues: ['Shared with five other events.'],
      v: [{ k: 'A', name: 'Power-up', desc: 'A four-note saw climb with sparkle, brighter than a pickup.', fn: W.upgradeA }] },
    { id: 'combo', g: 'table', title: 'Combo / two in one', when: 'A combo pot, or two balls down in one stroke.', where: 'via the score feed only (ScoreFeed.js:565 scoreNote)',
      now: { fn: function (E) { N.scoreNote(E, 2, 'points'); }, desc: 'No sound of its own: the next score note.' }, level: '−26.6 dB',
      issues: ['The trick has no sound of its own.'],
      v: [{ k: 'A', name: 'Chord stab', desc: 'The pot note becomes a chord (root, fifth, octave) with a thump: a little brass hit.', fn: function (E) { W.comboA(E, 2); } }] },
    { id: 'last', g: 'table', title: 'Last ball', when: 'The last ball of the table goes down.', where: 'main.js:2123 juice.beam (no sound)',
      now: { fn: function (E) { N.enemyDeath(E); }, desc: 'The same pot sound as any other ball.' }, level: '−31.2 dB',
      issues: ['The biggest moment on the table is no different from a normal pot.'],
      v: [{ k: 'A', name: 'Hush, then drop', desc: 'The table goes quiet for a beat (a 120 ms duck), a riser sucks in, then a big drop, a high chord and sparkle. Peggle\'s last peg is the model.', fn: W.lastBallA }] },
    { id: 'bomb', g: 'table', title: 'Bomb shot blast', when: 'A bomb shot\'s first hit goes off.', where: 'main.js:2153 playerDeath',
      now: { fn: function (E) { N.playerDeath(E); }, desc: 'playerDeath: the game-over sound of the old prototype, a 1.1 s sawtooth dive.' }, level: '−23.1 dB',
      issues: ['A bought ability plays a death sound.'],
      v: [{ k: 'A', name: 'Explosion', desc: 'A big noise blast with a harmonic sub, a crack and flying debris clicks. Ducks the mix. Haptic 80 ms.', fn: W.bombA }] },
    { id: 'cutin', g: 'table', title: 'Ability cut-in', when: 'The Curve / Bomb / Freeze panel slams in.', where: 'Juice.js:689 cutIn (no sound)',
      now: null, level: 'silent',
      issues: ['The panel slams in silently.'],
      v: [{ k: 'A', name: 'Swish and stamp', desc: 'A whoosh in, then a stamp as the panel lands.', fn: W.cutinA }] },

    { id: 'note', g: 'score', title: 'Number lands in a box', when: 'Each +N into POINTS or ×N into MULT.', where: 'ScoreFeed.js:565 scoreNote',
      now: { fn: function (E, b) { [0, 1, 2].forEach(function (k) { at(E, k * 0.28, function () { N.scoreNote(E, k, b); }); }); }, desc: 'scoreNote: POINTS a triangle, MULT a saw a fifth up, climbing the pentatonic scale.' }, level: 'POINTS −26.6 dB · MULT −31.5 dB',
      issues: ['MULT is 5 dB quieter than POINTS, though it is the bigger number.', 'Soft 6 ms attack: it blooms instead of landing.'],
      args: [['Points ×3', 'points'], ['Mult ×3', 'mult']],
      v: [{ k: 'A', name: 'Tick and note', desc: 'Same pitches. A tiny click on every landing, a 2 ms attack and MULT at the same loudness with its own thump.', fn: function (E, b) { [0, 1, 2].forEach(function (k) { at(E, k * 0.28, function () { W.noteA(E, k, b); }); }); } },
          { k: 'B', name: 'Chip clack', desc: 'Two fast clacks like a chip on felt, with the note under them.', fn: function (E, b) { [0, 1, 2].forEach(function (k) { at(E, k * 0.28, function () { W.noteB(E, k, b); }); }); } }] },
    { id: 'lock', g: 'score', title: 'Lock (first pot locks the boxes)', when: 'The first pot of a stroke locks the score in.', where: 'ScoreFeed.js:606 scoreLock (also 10 other places)',
      now: { fn: function (E) { N.scoreLock(E); }, desc: 'scoreLock: a thud and a two-note chime. Used in eleven places.' }, level: '−26 dB',
      issues: ['Eleven different moments share it.'],
      v: [{ k: 'A', name: 'Clack lock', desc: 'A hard click, a phone-audible thump and the rising fifth, higher.', fn: W.lockA }] },
    { id: 'slam', g: 'score', title: 'The slam (Points × Mult)', when: 'The two boxes collide.', where: 'ScoreFeed.js:596 scoreSlam (also 4 other places)',
      now: { fn: function (E) { N.scoreSlam(E); }, desc: 'scoreSlam: a 120→38 Hz sub drop under a noise crack.' }, level: '−17.4 dB, the loudest thing in the game, and 59% below 150 Hz',
      issues: ['On a phone, most of it is gone: only the crack is left.', 'Nothing ducks for it, so a slam in a busy moment gets lost.'],
      v: [{ k: 'A', name: 'Hush, hit, chord', desc: 'Everything dips for 90 ms (silence before impact), then a crack, a harmonic sub and a three-note saw chord land together; the mix comes back over 350 ms. Haptic.', fn: W.slamA },
          { k: 'B', name: 'Bigger', desc: 'A, plus a high note, a long shimmer and an octave sub.', fn: W.slamB }] },
    { id: 'tally', g: 'score', title: 'Result tally count-up', when: 'The result screen counts the table\'s score up.', where: 'Moments.js:1350 scoreNote(4 + n)',
      now: { fn: function (E) { for (var k = 0; k < 12; k++) (function (k) { at(E, k * 0.07, function () { N.scoreNote(E, 4 + k, 'points'); }); })(k); at(E, 0.95, function () { N.scoreSlam(E); }); }, desc: 'scoreNote stepping up, then scoreSlam.' }, level: '−26.6 dB per tick',
      issues: ['Each tick is a 340 ms note, so a fast count smears into a wash.', 'The notes climb past four octaves, to 1.7 kHz and up.'],
      v: [{ k: 'A', name: 'Ticks and ding', desc: 'Short 120 ms ticks climbing the scale (capped), every fourth accented, a ding on the last.', fn: function (E) { for (var k = 0; k < 12; k++) (function (k) { at(E, k * 0.07, function () { W.tallyA(E, k, k === 11); }); })(k); } }] },
    { id: 'coins', g: 'score', title: 'Coins', when: 'Cash counted into the wallet, and spent.', where: 'Moments.js:1541 coin · Moments.js:1584 coin (spend)',
      now: { fn: function (E, s) { for (var k = 0; k < 6; k++) (function (k) { at(E, k * 0.08, function () { N.coin(E, k, s === 'spend'); }); })(k); }, desc: 'coin: a square tick and a sine a fifth up, a quarter-tone higher per coin.' }, level: '−37.5 dB, 20 dB under the slam',
      issues: ['Very quiet.', 'Quarter-tone steps: six coins move less than a fifth, and the pitches fall between the game\'s scale notes.'],
      args: [['Earn ×6', 'earn'], ['Spend ×6', 'spend']],
      v: [{ k: 'A', name: 'Coin', desc: 'The classic two-note coin (B5 to E6, square, filtered), a semitone up per coin, at most 3 in 60 ms.', fn: function (E, s) { for (var k = 0; k < 6; k++) (function (k) { at(E, k * 0.08, function () { W.coinA(E, k, s === 'spend'); }); })(k); } },
          { k: 'B', name: 'Coin + ka-ching', desc: 'A, with a register ka-ching when the count finishes.', fn: function (E, s) { for (var k = 0; k < 6; k++) (function (k) { at(E, k * 0.08, function () { W.coinA(E, k, s === 'spend'); }); })(k); if (s !== 'spend') at(E, 0.55, function () { W.kachingA(E); }); } }] },

    { id: 'clear', g: 'run', title: 'CLEAR!', when: 'The table is beaten and CLEAR! slams in.', where: 'Moments.js:417 roomClear · Moments.js:1154 doorOpen (same moment) · Juice.js:746 finish (no sound)',
      now: { fn: function (E) { N.roomClear(E); N.doorOpen(E); }, desc: 'roomClear (a sub drop and root, fifth, octave) and doorOpen, together.' }, level: '−17.3 dB, 51% below 150 Hz',
      issues: ['A short three-note figure for the biggest win in a table.', 'Fires with doorOpen at the same instant.'],
      v: [{ k: 'A', name: 'Stinger', desc: 'A beat of quiet, a five-note run up, then a chord, a harmonic sub and a shimmer.', fn: W.clearA }] },
    { id: 'fail', g: 'run', title: 'Table lost', when: 'Out of shots with balls left.', where: 'main.js:2860 playerDeath · Moments.js:417 roomClear · Moments.js:1154 doorOpen, all at once',
      now: { fn: function (E) { N.playerDeath(E); N.roomClear(E); N.doorOpen(E); }, desc: 'Three sounds in the same 2 ms: the old death dive, the CLEAR fanfare and the door.' }, level: '−16.5 dB together, the loudest moment measured',
      issues: ['A lost table plays the clear fanfare.', 'Three voices at once.'],
      v: [{ k: 'A', name: 'Crack and fall', desc: 'One sound: a glass crack, a low thud and a slow falling minor line.', fn: W.failA }] },
    { id: 'heart', g: 'run', title: 'Heart lost', when: 'The heart breaks on the result screen.', where: 'Moments.js:1402 (shake only, no sound)',
      now: null, level: 'silent',
      issues: ['Silent. Losing a life is only seen.'],
      v: [{ k: 'A', name: 'Heart breaks', desc: 'A glass crack, two detuned falling tones and a deep thud. Haptic 50 ms.', fn: W.heartA }] },
    { id: 'runover', g: 'run', title: 'Run over', when: 'The last heart is gone.', where: 'Moments.js:673 playerDeath · main.js:2338 playerDeath',
      now: { fn: function (E) { N.playerDeath(E); }, desc: 'playerDeath: a 1.1 s saw dive.' }, level: '−23.1 dB',
      issues: ['The same sound as the bomb shot.', 'The run score then counts up silently (Moments.js:680).'],
      v: [{ k: 'A', name: 'Falling line', desc: 'A slow four-note falling minor line over a low drone, ending on a deep thud.', fn: W.runOverA }] },
    { id: 'runwin', g: 'run', title: 'Run complete', when: 'Through the last table.', where: 'Moments.js:674 roomClear',
      now: { fn: function (E) { N.roomClear(E); }, desc: 'roomClear, the same as one table.' }, level: '−17.3 dB',
      issues: ['Beating the game sounds the same as beating one table.'],
      v: [{ k: 'A', name: 'Fanfare', desc: 'Three stabbed chords climbing, a run up and a long shimmer.', fn: W.runCompleteA }] },

    { id: 'ach', g: 'meta', title: 'Achievement', when: 'An achievement is earned.', where: 'main.js:2702 / 2706 boonPick',
      now: { fn: function (E) { N.boonPick(E); }, desc: 'boonPick.' }, level: '−28 dB',
      issues: ['Shared with five other events.'],
      v: [{ k: 'A', name: 'Ding-ding', desc: 'Two bright bell notes and a little sparkle.', fn: W.achA }] },
    { id: 'card', g: 'meta', title: 'Table card', when: 'A table\'s rule card comes in.', where: 'Moments.js:311 doorOpen · Moments.js:336 slingshot(0.25)',
      now: { fn: seq([[0, function (E) { N.doorOpen(E); }], [0.4, function (E) { N.slingshot(E, 0.25); }]]), desc: 'doorOpen, then a soft strike sound.' }, level: '−29 dB',
      issues: ['Borrows the strike sound.'],
      v: [{ k: 'A', name: 'Whoosh and stamp', desc: 'A whoosh in and a stamp as the card lands.', fn: W.cardA }] },
    { id: 'buy', g: 'meta', title: 'Shop: buy', when: 'Buying a card.', where: 'main.js:2800 boonPick (+ coin spend)',
      now: { fn: function (E) { N.boonPick(E); }, desc: 'boonPick.' }, level: '−28 dB',
      issues: ['Shared with five other events.'],
      v: [{ k: 'A', name: 'Ka-ching', desc: 'A register clack and bell.', fn: W.kachingA }] },
    { id: 'reroll', g: 'meta', title: 'Shop: reroll', when: 'Rerolling the shop.', where: 'main.js:2779 doorOpen',
      now: { fn: function (E) { N.doorOpen(E); }, desc: 'doorOpen.' }, level: '−29 dB',
      issues: ['The same as opening the shop, a table card and a sell.'],
      v: [{ k: 'A', name: 'Spin', desc: 'A run of ticks that slows like a wheel stopping, then a note.', fn: W.rerollA }] },
    { id: 'sell', g: 'meta', title: 'Shop: sell / undo', when: 'Selling or putting a card back.', where: 'main.js:2813 / 2831 doorOpen',
      now: { fn: function (E) { N.doorOpen(E); }, desc: 'doorOpen.' }, level: '−29 dB',
      issues: ['The same as a reroll.'],
      v: [{ k: 'A', name: 'Coins back', desc: 'Three falling coins.', fn: W.sellA }] },
    { id: 'tap', g: 'meta', title: 'Menu taps', when: 'Any button in the menus.', where: 'none',
      now: null, level: 'silent',
      issues: ['Silent.'],
      v: [{ k: 'A', name: 'Tick', desc: 'A 30 ms tick, quiet, with a lower one for Back.', fn: seq([[0, W.tapA], [0.3, W.tapA], [0.6, W.backA]]) }] },
    { id: 'tables', g: 'meta', title: 'Table out / table in', when: 'Between tables.', where: 'Moments.js:1865 derez · Moments.js:1906 boot',
      now: { fn: seq([[0, function (E) { N.derez(E); }], [0.7, function (E) { N.boot(E); }]]), desc: 'derez (a falling sweep), boot (a rising sweep and three blips).' }, level: 'derez −35 dB · boot −38 dB',
      issues: ['Fine. Quiet, and the blips are off the game\'s scale.'],
      v: [{ k: 'A', name: 'Tidied', desc: 'The same shape, blips on the scale, and a landing thump when the table is up.', fn: seq([[0, W.derezA], [0.7, W.bootA]]) }] },
    { id: 'aim', g: 'meta', title: 'Aim start / cancel', when: 'Touching down to aim, and cancelling.', where: 'main.js:5153 focusEnter · main.js:5178 focusExit',
      now: { fn: seq([[0, function (E) { N.focusEnter(E); }], [0.6, function (E) { N.focusExit(E); }]]), desc: 'focusEnter: a 480→150 Hz sine. focusExit: the reverse, also played on every release.' }, level: '−29 dB',
      issues: ['focusExit fires on every release, at the same instant as the strike, and blurs it.'],
      v: [{ k: 'A', name: 'Air', desc: 'A soft air swell into slow motion. Cancel is a small rise. No exit sound on a release: the strike says it.', fn: seq([[0, W.aimInA], [0.6, W.aimCancelA]]) }] },

    { id: 'mix', g: 'meta', title: 'The mix itself', when: 'Every sound: the bus everything goes through.', where: 'AudioManager.js:52–66 (filter → master → out)',
      now: { fn: function (E) { [0, 0.04, 0.05, 0.07, 0.08, 0.1].forEach(function (d, k) { at(E, d, function () { [function () { N.impact(E, 1); }, function () { N.carom(E); }, function () { N.carom(E); }, function () { N.wallSplat(E); }, function () { N.carom(E); }, function () { N.wallSplat(E); }][k](); }); }); }, desc: 'Everything through one slow-mo low-pass and a 0.55 master gain. No limiter, no ducking, no voice caps (except impact, 30 ms).' }, level: 'a six-hit break peaks between −7 and −2 dBFS (the noise is random); a bomb at −6 dBFS',
      issues: ['No limiter. Nothing clips yet, only because the master is at 0.55.', 'UI and score sounds are muffled by the slow-mo filter like the table is.', 'Most weight is below 150 Hz, where phone speakers give nothing.'],
      v: [{ k: 'A', name: 'New bus', desc: 'Two buses: the table goes through the slow-mo filter; the strike, score and UI stay dry. Both go through a duck (for slams) and a limiter (−4 dB, 20:1). Voice caps per sound, and a harmonic layer under every thump so phones hear it. Same break, new voices.', fn: function (E) { [0, 0.04, 0.05, 0.07, 0.08, 0.1].forEach(function (d, k) { at(E, d, function () { k === 3 || k === 5 ? W.railA(E, 0.9) : W.contactA(E, 1 - k * 0.1); }); }); } }] }
  ];

  /* the big moments: whole sequences, now and proposed */
  var MOMENTS = [
    { id: 'm-shot', title: 'A full shot', sub: 'Strike, contact, rail, pot, then the score: three numbers, the slam, the tally and coins.',
      now: seq([[0, function (E) { N.strikeInGame(E, 0.7); }], [0.9, function (E) { N.impact(E, 0.8); }], [1.15, function (E) { N.rebound(E, 0.5); }], [1.9, function (E) { N.enemyDeath(E); }], [1.97, function (E) { N.scoreThud(E); }], [2.4, function (E) { N.scoreNote(E, 0, 'points'); }], [2.7, function (E) { N.scoreNote(E, 1, 'points'); }], [3.0, function (E) { N.scoreNote(E, 0, 'mult'); }], [3.5, function (E) { N.scoreSlam(E); }], [3.65, function (E) { N.scoreLock(E); }]].concat(range(10).map(function (k) { return [4.3 + k * 0.07, function (E) { N.scoreNote(E, 4 + k, 'points'); }]; })).concat(range(5).map(function (k) { return [5.3 + k * 0.08, function (E) { N.coin(E, k); }]; }))),
      neu: seq([[0, function (E) { W.strikeA(E, 0.7); }], [0.9, function (E) { W.contactA(E, 0.8); }], [1.15, function (E) { W.railA(E, 0.5); }], [1.9, function (E) { W.potA(E, 0); }], [1.97, W.thudA], [2.4, function (E) { W.noteA(E, 0, 'points'); }], [2.7, function (E) { W.noteA(E, 1, 'points'); }], [3.0, function (E) { W.noteA(E, 0, 'mult'); }], [3.5, W.slamA], [3.85, W.lockA]].concat(range(10).map(function (k) { return [4.3 + k * 0.07, function (E) { W.tallyA(E, k, k === 9); }]; })).concat(range(5).map(function (k) { return [5.3 + k * 0.08, function (E) { W.coinA(E, k); }]; })).concat([[5.75, W.kachingA]])) },
    { id: 'm-break', title: 'A break', sub: 'The cue ball into a pack: six contacts and two rails in a tenth of a second.',
      now: CARDS.filter(function (c) { return c.id === 'mix'; })[0].now.fn,
      neu: CARDS.filter(function (c) { return c.id === 'mix'; })[0].v[0].fn },
    { id: 'm-scratch', title: 'A scratch', sub: 'The cue ball off a rail and into a pocket, and back on the table.',
      now: seq([[0, function (E) { N.rebound(E, 0.98); }], [0.13, function (E) { N.playerHurt(E); }], [0.62, function (E) { N.scoreSlam(E); }], [1.42, function (E) { N.doorOpen(E); }], [2.13, function (E) { N.scoreLock(E); }], [2.23, function (E) { N.boot(E); }]]),
      neu: seq([[0, function (E) { W.railA(E, 0.95); }], [0.13, W.scratchA], [1.4, W.respawnA]]) },
    { id: 'm-clear', title: 'Clearing the table', sub: 'The last ball drops, the slam, CLEAR!, the tally and the cash.',
      now: seq([[0, function (E) { N.enemyDeath(E); }], [0.9, function (E) { N.scoreSlam(E); }], [1.05, function (E) { N.scoreLock(E); }], [2.0, function (E) { N.roomClear(E); N.doorOpen(E); }]].concat(range(10).map(function (k) { return [3.0 + k * 0.07, function (E) { N.scoreNote(E, 4 + k, 'points'); }]; })).concat([[3.8, function (E) { N.scoreSlam(E); }]]).concat(range(6).map(function (k) { return [4.4 + k * 0.08, function (E) { N.coin(E, k); }]; }))),
      neu: seq([[0, W.lastBallA], [0.15, function (E) { W.potA(E, 4); }], [1.0, W.slamA], [2.0, W.clearA]].concat(range(10).map(function (k) { return [3.2 + k * 0.07, function (E) { W.tallyA(E, k, k === 9); }]; })).concat(range(6).map(function (k) { return [4.4 + k * 0.08, function (E) { W.coinA(E, k); }]; })).concat([[4.95, W.kachingA]])) },
    { id: 'm-fail', title: 'Losing a table', sub: 'Out of shots with balls left: the result, then a heart breaks.',
      now: seq([[0, function (E) { N.playerDeath(E); N.roomClear(E); N.doorOpen(E); }], [1.25, function (E) { N.scoreThud(E); }], [1.56, function (E) { N.scoreNote(E, 0, 'points'); }]]),
      neu: seq([[0, W.failA], [1.25, W.thudA], [1.56, function (E) { W.noteA(E, 0, 'points'); }], [2.4, W.heartA]]) }
  ];
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }

  window.LLC = { GROUPS: GROUPS, CARDS: CARDS, MOMENTS: MOMENTS };
})();
