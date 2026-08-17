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
  /** Bullet-time scale while aiming — 80% slow-mo. */
  bullet: 0.2,
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
  dragLaunched: 0.26,
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
  knockedDrag: 0.4,
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
   * Half-angle of the departure cone. Kept narrow: the collision solver is
   * deterministic, so the object ball's line is a promise, not a guess. The
   * cone exists to read as a direction at a glance, not to hedge.
   */
  caromConeAngle: 0.12,
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
    shotInterval: 3.0,
    chargeTime: 0.75,
    shotSpeed: 15,
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
   * The opening rooms teach rather than test. Each states its goal in the
   * banner in the imperative, and the table is kept sparse enough that the
   * lesson is the only thing happening — a player who has never seen the game
   * should be able to work out what to do without being told twice.
   */
  lessons: {
    1: { title: 'Aim And Launch', sub: 'Hold to charge · slide to turn · release to fire' },
    2: { title: 'Hit Two In One Shot', sub: 'Enemies you strike become cannonballs' },
    3: { title: 'Use The Rails', sub: 'Bank off a wall to reach what you cannot' },
    4: { title: 'Mind The Shooters', sub: 'Violet enemies fire back · close the gap fast' },
    5: { title: 'Shields Face Forward', sub: 'Hit the heavies from behind, or bank into them' }
  },
  /**
   * Multi-hit praise, indexed by hits landed in a single launch.
   *
   * Chaining is the whole game, so it gets the loudest feedback in it: a
   * callout, a shockwave, a zoom punch and Focus back. Reinforcing the good
   * play teaches the mechanic far better than any tooltip does.
   */
  praise: ['', '', 'DOUBLE!', 'TRIPLE!', 'QUAD!', 'RAMPAGE!', 'UNREAL!'],
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
    bounce: 1
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
  RENDER,
  INPUT,
  PROGRESSION
};
