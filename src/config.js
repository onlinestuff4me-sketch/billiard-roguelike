/**
 * config.js — single source of truth for balance, feel and palette.
 *
 * Nothing in here imports anything. Every system reads its numbers from this
 * file so the whole game can be re-tuned without touching gameplay logic.
 * World units are "table units": the arena is 18 x 32 (a true 9:16 rectangle),
 * so 1 unit is roughly the radius of a small enemy.
 */

/* ------------------------------------------------------------------ *
 * ARENA — fixed 9:16 portrait table
 * ------------------------------------------------------------------ */
export const ARENA = {
  width: 18,
  height: 32,
  get halfW() {
    return this.width / 2;
  },
  get halfH() {
    return this.height / 2;
  },
  /** Visual thickness of the rail cushions (purely cosmetic). */
  railThickness: 0.55,
  /** Camera pulls back past the rails so the cushions stay fully visible. */
  viewPadding: 1.4,
  aspect: 9 / 16
};

/* ------------------------------------------------------------------ *
 * TIME — dilation, hit-stop and the fixed-step physics budget
 * ------------------------------------------------------------------ */
export const TIME = {
  /** Real-time scale. */
  normal: 1.0,
  /**
   * Aiming stops the world outright rather than slowing it.
   *
   * At 0.2 the table still crept while you lined a shot up, so a plan made at
   * the start of an aim was subtly wrong by the end of it. A full stop makes
   * the preview a promise: what you see is exactly the table you are shooting
   * into. Focus still drains on real time, so it remains a resource.
   */
  bullet: 0,
  /** Seconds (real time) to blend into / out of bullet-time. */
  dilateIn: 0.07,
  dilateOut: 0.16,
  /** Frame clamp so an alt-tab does not teleport everything. */
  maxFrameDt: 1 / 25,
  /** Fixed physics step (scaled time). Sub-stepped for tunnel-free sweeps. */
  fixedStep: 1 / 180,
  /** Safety valve: never run more than this many sub-steps per frame. */
  maxSubSteps: 8,
  /** Hit-stop freezes the whole simulation for these durations (real time). */
  hitStop: 0.03,
  hitStopCrit: 0.06,
  /** Room-clear / boon-modal beats. */
  clearPause: 0.35
};

/* ------------------------------------------------------------------ *
 * FOCUS — the bullet-time resource
 * ------------------------------------------------------------------ */
export const FOCUS = {
  /**
   * Maximum seconds of slow-mo held in the gauge.
   *
   * Slow-mo is the most enjoyable part of the loop, so the gauge is deliberately
   * generous: a full tank is over four seconds of real thinking time, and the
   * drain is slow enough that a careful aim never feels rushed. Focus still
   * matters as a resource — it just stops being the thing that ends your fun.
   */
  max: 4.5,
  /** Drain per second of real time while aiming. */
  drainPerSecond: 0.5,
  /** Passive trickle while not aiming. */
  regenPerSecond: 0.85,
  /** Refunds. */
  onKill: 0.6,
  onChainHit: 0.25,
  onWallSplat: 0.5,
  onCarom: 0.4,
  onRoomClear: 4.5,
  /** Below this you cannot start a new aim (prevents stutter-aiming). */
  minToAim: 0.1
};

/* ------------------------------------------------------------------ *
 * PLAYER — the cue ball
 * ------------------------------------------------------------------ */
export const PLAYER = {
  radius: 0.62,
  maxHp: 100,
  /**
   * Where the ball starts, as a fraction of the table height measured up from
   * the bottom rail. Low enough to keep the table ahead of you, high enough to
   * leave room *behind* the ball for the cue — the draw needs somewhere to go.
   */
  spawnFromBottom: 0.3,
  /**
   * DRAW TO LOAD.
   *
   * Power is the DRAW: how far the cue is pulled back along its own axis.
   * Pulling straight away from the ball loads the shot without touching the
   * angle, which is the motion a player already makes at a real table.
   */
  launchSpeed: 40,
  launchSpeedMin: 24,
  launchSpeedMax: 56,
  /** Power floor, so the shortest draw is still a real shot rather than a dud. */
  minPower: 0.32,
  /** Velocity damping (per second, multiplicative) in each state. */
  /**
   * A STROKE HAS TO END.
   *
   * At 0.26 a full-power shot carried 170 units — ten crossings of an 18x32
   * table — and took eleven seconds to come to rest. That was fine when a
   * launch was just a move; it is unplayable when the launch IS the turn and
   * the player is waiting to take the next one. At 0.9 a max shot runs about
   * 60 units, which is three crossings: still a proper pinball route, and it
   * lands within a whisker of the 46 units the trajectory preview draws.
   */
  dragLaunched: 0.9,
  dragIdle: 2.6,
  /** Below this speed a launched player settles back to IDLE. */
  settleSpeed: 2.2,
  /** Contact damage of a full-power cue strike before multipliers. */
  strikeDamage: 22,
  /** Damage scales with impact speed relative to this reference. */
  referenceSpeed: 34,
  /**
   * Speed retained when passing through a body the strike just destroyed.
   *
   * Surviving bodies are no longer pierced — they are resolved with a real
   * two-body impulse (PHYSICS.ballRestitution). Momentum transfer and rebound
   * speed now fall out of that solve rather than being dialled in here, which
   * is what lets the aim preview promise the outcome.
   */
  pierceRetention: 0.9,
  /** Emergency dash (quick flick, no slow-mo). */
  dashSpeed: 30,
  dashDuration: 0.2,
  dashCooldown: 0.75,
  /** Invulnerability window granted by a launch, in scaled seconds. */
  iFrameGrace: 0.12,
  /** Contact damage taken from a chaser body-check. */
  touchDamage: 9,
  touchInterval: 0.6,
  /** Ribbon trail. */
  trailPoints: 26,
  trailWidth: 0.5,
  trailMinSpeed: 4
};

/* ------------------------------------------------------------------ *
 * PHYSICS — billiard response
 * ------------------------------------------------------------------ */
export const PHYSICS = {
  /**
   * Rail rebounds a launch survives before it is forced to settle.
   *
   * Kept high on purpose: a ball that stops dead at a cushion reads as a bug,
   * not a rule. Friction (PLAYER.dragLaunched) is what actually ends a stroke;
   * this is only a safety valve against a perfectly periodic orbit.
   */
  baseMaxBounces: 6,
  /** Energy retained by the player on a rail rebound. */
  wallRestitution: 0.96,
  /** Energy retained by a knocked enemy on a rail rebound. */
  enemyWallRestitution: 0.82,
  /** Energy retained on an obstacle rebound. */
  obstacleRestitution: 0.94,
  /**
   * Restitution for ball-vs-ball impulses (player↔enemy, enemy↔enemy).
   *
   * Near-elastic, so collisions obey the textbook billiard results the aim
   * preview draws: the object ball leaves along the line of centres, and the
   * cue ball departs along the tangent — the 90° rule.
   */
  ballRestitution: 0.96,
  /** Speed above which a knocked enemy splats against a rail. */
  wallSplatSpeed: 16,
  wallSplatDamage: 34,
  /** Object-ball caroms. */
  caromMinSpeed: 12,
  caromDamage: 26,
  /** Fraction of the carom's momentum passed into the secondary target. */
  caromTransfer: 0.7,
  /** Knocked enemies decay to harmless below this speed. */
  knockedSettleSpeed: 5.0,
  enemyDrag: 1.5,
  /** Object balls carry far enough to reach a pocket from mid-table, no further. */
  knockedDrag: 0.8,
  /** Separation bias so resolved circles never re-overlap next step. */
  skin: 0.002,
  /** Backstab window: cos(angle) threshold behind a shielded target. */
  backstabDot: -0.15
};

/* ------------------------------------------------------------------ *
 * CHAIN — cascade multipliers
 * ------------------------------------------------------------------ */
export const CHAIN = {
  /** 1st hit, 2nd hit, 3rd hit, 4th+ hit. */
  multipliers: [1.0, 1.4, 1.8, 2.5],
  /** Seconds (scaled) before an unbroken chain lapses. */
  window: 1.6,
  /** Chain index at which the pentatonic scale wraps an octave up. */
  octaveEvery: 5,
  maxDisplay: 99
};

/* ------------------------------------------------------------------ *
 * TRAJECTORY — aim preview
 * ------------------------------------------------------------------ */
export const TRAJECTORY = {
  /** How far the prediction sweep runs before giving up (world units). */
  maxDistance: 46,
  /** Reflection segments drawn beyond the first rail contact. */
  previewBounces: 4,
  /** Length of the predicted object-ball departure line. */
  caromConeLength: 6.5,
  /**
   * Length of the cue ball's own post-impact tangent line — the 90° rule.
   * Showing where *you* end up is what makes a collision legible in advance.
   */
  tangentLength: 4.6,
  /**
   * The main aim beam is a ribbon mesh, not a line.
   *
   * GPU line width is capped at 1px on virtually every platform, so a
   * "thicker line" has to be geometry. Width also doubles as the power read:
   * the beam swells as the shot charges, and a bright wavefront fills it from
   * the ball outward, so the wind-up is legible without looking at a meter.
   */
  beamSlices: 48,
  beamWidth: 0.45,
  beamWidthMax: 1.25,
  dashLength: 0.42,
  dashGap: 0.3
};

/* ------------------------------------------------------------------ *
 * ENEMIES — archetype stat blocks
 * ------------------------------------------------------------------ */
export const ENEMY = {
  /** "Solids" — red cubes, steady chasers. Cheap chain fodder. */
  solid: {
    id: 'solid',
    label: 'Solid',
    cost: 2,
    hp: 34,
    radius: 0.62,
    mass: 1,
    speed: 3.6,
    accel: 9,
    /** Light enough for the cue ball to pierce straight through. */
    pierceable: true,
    contactDamage: 9,
    scoreFocus: 0.5
  },
  /** "Stripes" — violet octagons that hold range and fire linear shots. */
  stripe: {
    id: 'stripe',
    label: 'Stripe',
    cost: 3,
    hp: 26,
    radius: 0.66,
    mass: 1.15,
    speed: 3.1,
    accel: 7,
    pierceable: true,
    contactDamage: 6,
    preferredRange: 9.5,
    rangeTolerance: 2.0,
    shotInterval: 2.4,
    /**
     * The wind-up. Long enough to read the barrel coming up and get out of the
     * line, short enough that it does not feel like the enemy is posing.
     */
    chargeTime: 0.7,
    /**
     * At 15 an incoming shot was 2.7x slower than your own ball, which read as
     * a drifting bubble rather than a threat. 26 still leaves a real dodge
     * window at the 9.5-unit stand-off — about 0.33s — while looking fired.
     */
    shotSpeed: 26,
    shotDamage: 12,
    shotRadius: 0.26,
    shotLife: 3.2,
    scoreFocus: 0.5
  },
  /** "Heavy Eight-Balls" — amber cylinders with a 180° frontal shield. */
  heavy: {
    id: 'heavy',
    label: 'Eight-Ball',
    cost: 6,
    hp: 130,
    radius: 1.15,
    mass: 3.4,
    speed: 1.9,
    accel: 4,
    pierceable: false,
    contactDamage: 16,
    /** Damage multiplier when struck inside the frontal shield arc. */
    shieldMitigation: 0.12,
    /** A banked shot (>=1 rail) ignores the shield entirely. */
    bankBreaksShield: true,
    /** Backstab bonus multiplier. */
    backstabMultiplier: 2.0,
    turnRate: 2.2,
    scoreFocus: 0.9
  }
};

/* ------------------------------------------------------------------ *
 * RULES — the billiards layer: contracts, stroke budgets and score
 *
 * The redesign turns every room into a static rack. Nothing moves between
 * strokes, so the pressure is not "something is walking at me" but "I have
 * four strokes and six balls". These are the numbers that hold that up.
 * ------------------------------------------------------------------ */
export const RULES = {
  /**
   * The table is frozen except while a stroke is resolving. This is the flag
   * every "does anything move on its own?" question routes through, so a
   * future mode can flip it in one place.
   */
  staticTable: true,

  /**
   * A stroke is over when every body on the table is slower than this, or when
   * the timeout expires (a ball trapped in a slow bumper loop must not hang
   * the room).
   */
  settleSpeed: 1.1,
  settleGrace: 0.28,
  /**
   * The tail of a shot is the boring part: a ball drifting at two units a
   * second is not going to reach anything, but it holds the whole turn open.
   * Below `creepSpeed` drag is forced up to `creepDrag`, which brings the
   * table to rest in about half a second without touching the part of the
   * shot anyone is watching.
   */
  creepSpeed: 5.5,
  creepDrag: 3.2,
  strokeTimeout: 14,

  /**
   * The ramp. Each band is `{ fromLevel, rack, strokes }`, read as "from this
   * room until the next band". Rack grows, budget shrinks, and the spare —
   * strokes minus balls — is what the player actually feels.
   *
   *   rooms 1-2   4 balls / 7 strokes   spare +3
   *   rooms 3-4   5 balls / 7 strokes   spare +2
   *   rooms 5-6   5 balls / 6 strokes   spare +1
   *   rooms 7-8   6 balls / 6 strokes   spare  0
   *   rooms 9-10  7 balls / 6 strokes   spare -1
   *   rooms 11+   7 balls / 5 strokes   spare -2
   */
  ramp: [
    { fromLevel: 1, rack: 4, strokes: 7 },
    { fromLevel: 3, rack: 5, strokes: 7 },
    { fromLevel: 5, rack: 5, strokes: 6 },
    { fromLevel: 7, rack: 6, strokes: 6 },
    { fromLevel: 9, rack: 7, strokes: 6 },
    { fromLevel: 11, rack: 7, strokes: 5 }
  ],

  /** The room where the 8 starts having to go last. */
  eightLastFrom: 5,

  score: {
    /** A ball pays its number times this. */
    perPip: 100,
    /** A ball driven through a shatter gate pays less than one that is potted. */
    gateRate: 0.6,
    /** The live pocket pays double, then fires the ball back at you. */
    liveRate: 2,
    /** Every stroke left in the budget at room end pays this times the room. */
    savedStroke: 500
  },

  multiplier: {
    /** Every stroke opens here. */
    base: 1,
    perBank: 1,
    perBallTouched: 1,
    perBallDown: 1,
    /** A gold ring or gold pocket doubles whatever has been built. */
    goldFactor: 2,
    max: 99
  },

  /** Freeze: stop the table mid-stroke and re-aim from where the cue ball got to. */
  freeze: {
    /** Charges granted by shooting the cue ball into a freeze cell. */
    cellCharges: 3,
    maxCharges: 6
  },

  /** Hull damage. Nothing hurts you between strokes — only during resolution. */
  damage: {
    mine: 12,
    /** A ball fired back out of a live pocket, on contact with the cue ball. */
    kickback: 10,
    /** Per ball still standing when the strokes run out. */
    looseBall: 8
  },

  /** Scratching (cue ball into a pocket) voids the stroke's score. */
  scratch: { voidScore: true }
};

/* ------------------------------------------------------------------ *
 * TABLE — pockets and the lit objects on the felt
 * ------------------------------------------------------------------ */
export const TABLE = {
  pocket: {
    /** A body whose centre gets inside this radius is captured. */
    radius: 1.25,
    /**
     * Side pockets sit almost flush with the cushion, so a ball can never get
     * its centre to the pocket centre. A smaller capture radius keeps the
     * live stretch of rail down to about two units instead of three.
     */
    sideRadius: 1.05,
    /** Corner pockets sit this far in from each rail. */
    cornerInset: 0.9,
    /** Side pockets sit on the long rails, this far in. */
    sideInset: 0.9,
    /** How the six pocket types are drawn from, by weight, each room. */
    weight: { score: 4, gold: 1.4, upgrade: 1, live: 1 },
    /** Every room is guaranteed at least this many plain score pockets. */
    minScore: 3
  },
  gold: { radius: 1.5 },
  gate: { width: 3.2, thickness: 0.5 },
  freezeCell: { radius: 1.2 },
  mine: { radius: 0.9 },
  /** Chances a room rolls each felt object, and the level each unlocks at. */
  objects: {
    gold: { chance: 0.75, minLevel: 2 },
    gate: { chance: 0.55, minLevel: 3 },
    freezeCell: { chance: 0.5, minLevel: 4 },
    mine: { chance: 0.5, minLevel: 6 }
  }
};

/* ------------------------------------------------------------------ *
 * BALLS — the numbered rack
 * ------------------------------------------------------------------ */
export const RACK = {
  /**
   * Which archetype wears which number. The silhouettes stay exactly as they
   * were — the number is a decal on top, so shape still encodes behaviour.
   */
  archetypeByNumber: ['solid', 'solid', 'solid', 'solid', 'stripe', 'stripe', 'stripe', 'heavy'],
  /** The 8 is always the last ball of a rack, and always the heavy. */
  eight: 8
};

/* ------------------------------------------------------------------ *
 * ROOMS — hybrid generation (handcrafted geometry + procedural threat)
 * ------------------------------------------------------------------ */
export const ROOM = {
  /**
   * Threat budget = base + perLevel * (level - 1), capped.
   *
   * The opening is deliberately thin. Room 1 is two Solids on an empty table:
   * enough to show that hitting things is the point, few enough that nothing
   * else competes for attention. Everything else arrives one idea at a time.
   */
  baseBudget: 4,
  budgetPerLevel: 2.2,
  maxBudget: 46,
  /** Waves per room ramp with depth. */
  waveCountByLevel: [1, 1, 1, 1, 2, 2, 2, 3],
  /** Level at which each archetype unlocks — one new enemy at a time. */
  unlock: { solid: 1, stripe: 4, heavy: 6 },
  /** Selection weights per archetype, scaled by level in the director. */
  weight: { solid: 1.0, stripe: 0.65, heavy: 0.4 },
  /** Enemies never spawn within this radius of the player. */
  safeSpawnRadius: 6.5,
  /** Spawn telegraph before an enemy becomes active. */
  spawnTelegraph: 0.55,
  /** Procedural environmental injectors. */
  injectors: {
    bumperChance: 0.55,
    pyreChance: 0.4,
    hazardChance: 0.35,
    maxPerRoom: 3,
    /** First level that can roll injectors — after the core loop has landed. */
    minLevel: 7
  },
  /** Exit doors. */
  door: {
    count: 2,
    width: 3.4,
    height: 1.5,
    /**
     * Inset from the top rail. Tuned so the doors and their reward labels sit
     * clear of the HUD's top band rather than underneath it.
     */
    inset: 2.6
  }
};

/* ------------------------------------------------------------------ *
 * INJECTORS — dynamic environment pieces
 * ------------------------------------------------------------------ */
export const INJECTOR = {
  bumper: {
    radius: 1.0,
    /** Outgoing speed multiplier when the player rebounds off a bumper. */
    boost: 1.28,
    minOut: 20,
    /** A bumper hit refunds a rail bounce, enabling long pinball routes. */
    refundsBounce: true,
    focus: 0.12
  },
  pyre: {
    radius: 1.5,
    /** Multiplier applied once per launch when flying through the pyre. */
    boost: 1.45,
    maxSpeed: 62,
    cooldown: 0.4,
    damageBonus: 0.25
  },
  hazard: {
    /** Damage per second while the player overlaps a hazard strip. */
    dps: 14,
    width: 4.0,
    height: 1.1
  }
};

/* ------------------------------------------------------------------ *
 * BOONS — 4-phase engine
 * ------------------------------------------------------------------ */
export const BOONS = {
  phases: ['launch', 'trajectory', 'impact', 'rebound'],
  /** Cards offered per reward. */
  offerCount: 3,
  /** Rarity roll weights and their stat scalar. */
  rarity: {
    common: { weight: 0.62, scalar: 1.0, label: 'Common' },
    rare: { weight: 0.28, scalar: 1.35, label: 'Rare' },
    epic: { weight: 0.1, scalar: 1.8, label: 'Epic' }
  },
  /** Same boon can be taken again to level it, up to this rank. */
  maxRank: 3
};

/* ------------------------------------------------------------------ *
 * FEEL — camera shake, hit-stop scaling, particles
 * ------------------------------------------------------------------ */
export const FEEL = {
  shake: {
    /** Impulse = momentum * scale, clamped. */
    scale: 0.0075,
    max: 0.85,
    /** Exponential decay per second. */
    decay: 7.5,
    frequency: 34
  },
  particles: {
    max: 320,
    sparkLife: 0.55,
    shatterLife: 0.8,
    sparkSpeed: 12
  },
  floatText: {
    life: 0.85,
    rise: 70
  },
  /** Zoom punch on big hits (fraction of ortho height). */
  zoomPunch: 0.028,
  zoomDecay: 6
};

/* ------------------------------------------------------------------ *
 * AUDIO — procedural Web Audio palette
 * ------------------------------------------------------------------ */
export const AUDIO = {
  masterGain: 0.55,
  /** Low-pass corner frequencies: wide open in real time, muffled in slow-mo. */
  filterOpen: 18000,
  filterBullet: 620,
  filterGlide: 0.09,
  /** Pentatonic minor scale (semitones from root) used for chain hits. */
  scale: [0, 3, 5, 7, 10],
  rootHz: 220,
  chainNoteGain: 0.22,
  impactGain: 0.34,
  subGain: 0.5,
  releaseGain: 0.3,
  /** Slow-mo also drops master gain slightly for an underwater feel. */
  bulletGain: 0.78
};

/* ------------------------------------------------------------------ *
 * PALETTE — "Dark Velvet Cyber-Billiards"
 * ------------------------------------------------------------------ */
export const PALETTE = {
  obsidian: 0x05070a,
  feltDeep: 0x06231d,
  felt: 0x0b3a2e,
  feltLine: 0x14624c,
  rail: 0x0a1a24,
  railGlow: 0x1d6f7a,
  player: 0x35f2ff,
  playerCore: 0xd9feff,
  trail: 0x1fd7ff,
  aim: 0x8ffcff,
  aimGhost: 0x4a8fa5,
  carom: 0xffe27a,
  solid: 0xff3d6e,
  stripe: 0xa05cff,
  heavy: 0xffb340,
  shield: 0xfff0c2,
  projectile: 0xff8ad4,
  bumper: 0x2ef2c4,
  pyre: 0xffd166,
  hazard: 0xff5a3d,
  door: 0x35f2ff,
  doorAlt: 0xff5ce1,
  spark: 0xfff6d8,
  bone: 0xeaf6ff
};

/* CSS-side mirror so DOM UI can share the exact same hues. */
export const CSS_PALETTE = {
  cyan: '#35f2ff',
  magenta: '#ff3d8b',
  amber: '#ffb340',
  violet: '#a05cff',
  bone: '#eaf6ff',
  obsidian: '#05070a',
  felt: '#0b3a2e'
};

/* ------------------------------------------------------------------ *
 * RENDER — presentation toggles
 * ------------------------------------------------------------------ */
export const RENDER = {
  /** Ortho half-height in world units (derived from the arena + padding). */
  get viewHeight() {
    return ARENA.height + ARENA.viewPadding * 2;
  },
  maxPixelRatio: 2,
  /**
   * Bloom is tuned to halo the neon without bleeding onto the felt: the
   * threshold sits above the lit-felt luminance so only emissive objects glow.
   */
  bloom: {
    enabled: true,
    strength: 0.7,
    radius: 0.5,
    threshold: 0.34,
    /** Disabled automatically when the device reports few cores. */
    minHardwareConcurrency: 4
  },
  /** Slight camera tilt sells the 3D primitives without hurting aim reading. */
  cameraTilt: 0.0,
  cameraHeight: 60,
  fogDensity: 0.0
};

/* ------------------------------------------------------------------ *
 * INPUT
 * ------------------------------------------------------------------ */
export const INPUT = {
  /**
   * Aiming is BALL-ANCHORED, the way 8 Ball Pool rotates the cue about the cue
   * ball: the launch direction is the vector from your finger to the ball, not
   * the delta from wherever you happened to touch down.
   *
   * The consequence that matters is angular resolution. With a drag-delta
   * anchor the lever arm starts at zero, so the first pixels of movement swing
   * the aim through tens of degrees — the classic "finicky" feel. Anchored at
   * the ball, the lever arm is your distance from it, so pulling further out
   * buys finer control exactly when you want it: on a long, committed shot.
   */
  /**
   * YOUR THUMB IS THE BUTT OF A CUE THAT RUNS THROUGH THE BALL.
   *
   * Time freezes on touch and the line is drawn from your thumb, through the
   * ball, and out the far side — the direction the ball will travel is simply
   * `ball − thumb`. Put your thumb below the ball and the shot goes up. Slide
   * it right and the far end swings left, exactly as a real cue does when you
   * move the butt.
   *
   * Drawing *back along that axis* loads the shot: how far your thumb sits
   * from the ball is the draw, and the draw is the power.
   *
   * The elegant part is that the metaphor solves the occlusion problem for
   * free. The cue is always behind the ball relative to the shot, so your
   * thumb is never on the stretch of table the shot will cross — you are
   * looking down the cue at your own target.
   *
   * Sensitivity is bounded the same way a real cue bounds it: angular gain is
   * 1/draw, and since a committed shot is drawn well back, the lever arm is
   * long precisely when accuracy matters.
   */
  /** Below this the direction is degenerate; the last good heading is held. */
  minAimRadius: 0.7,
  /** Draw distance (thumb → ball, world units) mapping to minimum power. */
  minDraw: 1.6,
  /** Draw distance at which the cue is fully loaded. */
  maxDraw: 9.5,
  /**
   * Exponential smoothing time constant (seconds) applied to the aim heading.
   * Long enough to swallow finger tremor, short enough to feel direct.
   */
  aimSmoothing: 0.055,
  /**
   * Emergency dash is a DOUBLE TAP, not a flick.
   *
   * A flick used to share the aim gesture, so any quick, decisive shot was
   * silently eaten and became a dash instead. Separating them means a gesture
   * can never be misread as the other.
   */
  doubleTapMs: 260,
  doubleTapMaxTravelPx: 24,
  /** Movement past this many pixels means the touch was a drag, not a tap. */
  tapMaxTravelPx: 14
};

/* ------------------------------------------------------------------ *
 * PROGRESSION — meta pacing
 * ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ *
 * ONBOARDING — one idea per room, stated plainly, then rewarded
 * ------------------------------------------------------------------ */
export const TUTORIAL = {
  /**
   * Room banners. These run AFTER the tutorial (see docs/TUTORIAL.md), so each
   * one may only introduce something the tutorial did not.
   *
   * Rooms 1-3 used to repeat lessons the player had just done — and room 1's
   * banner said "hold to charge", which has never been true: power is draw
   * distance alone. The first thing the game said contradicted the last thing
   * the tutorial said, on the only control that matters. Every entry below is
   * now keyed to the room where that thing genuinely first appears.
   */
  lessons: {
    1: { title: 'The Contract', sub: 'Sink every ball · the strokes you save are points' },
    2: { title: 'The Gold Ring', sub: 'Drive through it and the shot doubles' },
    3: { title: 'The Upgrade Pocket', sub: 'A ball in there buys a boon instead of points' },
    4: { title: 'The Live Pocket', sub: 'Pays double, then fires the ball back at you' },
    5: { title: 'The 8 Goes Last', sub: 'Potting it early is a foul · it comes back' },
    6: { title: 'Mines', sub: 'Route around them · they only bite the cue ball' },
    7: { title: 'Fewer Strokes Now', sub: 'Every stroke has to pot from here' }
  },
  graceSeconds: 3.0,
  /**
   * Multi-hit praise, indexed by hits landed in a single launch.
   *
   * Chaining is the whole game, so it gets the loudest feedback in it: a
   * callout, a shockwave, a zoom punch and Focus back. Reinforcing the good
   * play teaches the mechanic far better than any tooltip does.
   */
  /**
   * Multi-hit callouts used to be adjectives — DOUBLE!, RAMPAGE! — alongside a
   * separate "x1.8" float. Two texts, neither of which said what had been
   * earned. There is now one phrase, built in `hitCallout`: "3 HITS  x1.8".
   */
  praiseFocus: 0.55
};

export const PROGRESSION = {
  startRoom: 1,
  /** Rooms between guaranteed heal offers. */
  healEvery: 3,
  healAmount: 30,
  /** Stat reward magnitudes offered by doors. */
  statRewards: {
    maxHp: 15,
    focusMax: 0.4,
    damage: 0.12,
    bounce: 1,
    /** Extra strokes per room, for the rest of the run. */
    stroke: 1,
    /** Freeze charges granted at the door. */
    freeze: 2
  }
};

export default {
  ARENA,
  TIME,
  FOCUS,
  PLAYER,
  PHYSICS,
  CHAIN,
  TRAJECTORY,
  ENEMY,
  ROOM,
  INJECTOR,
  BOONS,
  FEEL,
  AUDIO,
  PALETTE,
  CSS_PALETTE,
  RULES,
  TABLE,
  RACK,
  RENDER,
  INPUT,
  PROGRESSION
};
