/**
 * items.mjs — the polish plan, as data. One source for docs/POLISH_PLAN.md and
 * the review page (tools/review/build.mjs writes both). Level items are added
 * by the build from the measured tables (tools/review/levels.json).
 */
export const GROUPS = [
  { id: 'levels', title: 'Levels', lede: 'The 13 run tables, measured with the tuning tool in the real game. Today on the left, the proposed layout on the right, each with its measured line being played.' },
  { id: 'sound', title: 'Sound', lede: 'The sound pass already audited all 37 sounds and proposed replacements. They are folded in here by family, playable, with one new item: sound for the new animation beats.' },
  { id: 'juice', title: 'Animation and juice', lede: 'What the table does when something happens on it. Each proposal is a working prototype in src/ui/Polish.js, off by default.' },
  { id: 'ui', title: 'UI and transitions', lede: 'Menus, the score bar and the moments between screens.' },
  { id: 'feel', title: 'Feel', lede: 'Weight on contact, and how the game runs on a phone.' }
];

export const ITEMS = [
  /* ------------------------------ sound ------------------------------ */
  {
    id: 'S1', group: 'sound', kind: 'sound', title: 'The mix: two buses, a limiter, thumps a phone can play',
    effort: 'M', riskLevel: 'Low',
    where: 'src/core/AudioManager.js:52-66; SOUND.md §6 "The bus"',
    problem: 'Everything goes through one slow-motion low-pass, so the strike, the score and the UI are muffled whenever the table is. 50 to 75% of the big hits sit below 150 Hz, which a phone speaker cannot play. There is no limiter and no voice cap: a six-ball break peaks at −2 dBFS.',
    proposal: 'Two buses (the table goes through the slow-mo filter; strike, score and UI stay dry), a duck for the slam, CLEAR! and the last ball, a −4 dB limiter, caps of 3 to 4 clicks per 50 ms, a harmonic layer under every thump, and small random detune on repeats. Android also gets a short buzz on the strike, pots, slam and blasts.',
    fits: 'Design bible law 6: every moment earns a reaction you can see, hear and feel. Nothing about the sound palette changes; this is the wiring under it.',
    risk: 'Touches every voice at once. Mitigated by keeping every existing method name and the non-finite guard, and by checking levels with the same offline render the audit used.',
    sounds: [{ id: 'mix', label: 'A six-ball break' }, { id: 'm-break', label: 'The same break, heard as a moment' }]
  },
  {
    id: 'S2', group: 'sound', kind: 'sound', title: 'The shot: strike, contact, rail, pocket',
    effort: 'M', riskLevel: 'Low',
    where: 'main.js playerLaunch, impact, carom, playerRebound, wallSplat, removeBall',
    problem: 'The strike plays while the table is still filtered: 0% of its energy is above 1 kHz and it is 12 dB under the slam. A cue-ball rail is nearly inaudible (−41 to −47 dB), an object ball off a soft rail is silent, and the pot (−31 dB, an old "enemy death" voice) is 12 dB quieter than a hard rail.',
    proposal: 'A dry crack for the strike that grows with power. A sharp click with a short ring for ball on ball. A cushion "thup" for every ball on every rail. A drop, a rattle in the pocket and a note that climbs one step per pot in the stroke.',
    fits: 'Real ball contact is a sub-millisecond click, not a thud. The climbing note uses the minor pentatonic ladder the score already plays (bible §9).',
    risk: 'These are the most repeated sounds, so a wrong level is tiring. Voice caps and the detune are there for that.',
    sounds: [{ id: 'm-shot', label: 'A full shot, strike to coins' }, { id: 'strike', arg: 0.65 }, { id: 'contact', arg: 0.9 }, { id: 'rail', arg: 0.9 }, { id: 'pot', arg: 'three', label: 'Pocket drop, three pots in a stroke' }]
  },
  {
    id: 'S3', group: 'sound', kind: 'sound', title: 'Scoring: numbers, lock, slam, tally, coins',
    effort: 'S', riskLevel: 'Low',
    where: 'ScoreFeed.js:565-606; Moments.js:1350, 1541, 1584',
    problem: 'MULT lands 5 dB quieter than POINTS though it is the bigger number. The slam is 59% sub-bass, so on a phone only its crack is left. The result tally plays 340 ms notes 70 ms apart, which smears into a wash. Coins are 20 dB under the slam and step in quarter-tones, off the scale.',
    proposal: 'A tick on every landing with a 2 ms attack, MULT at the same level with its own thump. A beat of quiet, then the slam as crack, harmonic sub and chord. Short tally ticks with a ding on the last. A classic two-note coin, a semitone up per coin.',
    fits: 'Same pitches and the same ladder as today (bible §7: "a note one scale degree higher plays"). The quiet before the slam is the audio half of the 90 ms hit-stop the count already takes.',
    risk: 'Low: each voice is a drop-in for an existing call.',
    sounds: [{ id: 'note', arg: 'points', label: 'Three numbers into POINTS' }, { id: 'note', arg: 'mult', label: 'Three numbers into MULT' }, { id: 'lock' }, { id: 'slam' }, { id: 'tally' }, { id: 'coins', arg: 'earn' }]
  },
  {
    id: 'S4', group: 'sound', kind: 'sound', title: 'Mistakes get their own sounds',
    effort: 'S', riskLevel: 'Low',
    where: 'main.js:2084, 2181, 2860; Moments.js:417, 1154, 1402, 1621-1681',
    problem: 'A scratch plays five voices over two seconds, including the score slam, a reward sound. Losing a table plays the old death dive, the CLEAR fanfare and a door at once: the loudest moment in the game. A foul, a scratch, a mine and a kickback share one voice. A heart breaking is silent.',
    proposal: 'Scratch: a drop and a deny, then a reversed swell as the ball comes back. Foul: two low buzzes, then the ball pops back. A lost table: one crack and a falling line. The heart: a glass crack and a thud. Run over: a slow falling line.',
    fits: 'Bible §8.2 says a scratch must say "your ball went in, this shot pays nothing, here is your ball back": a drop, a deny and a return are those three things.',
    risk: 'Low. Removes three stacked calls on the fail path.',
    sounds: [{ id: 'm-scratch', label: 'A scratch, start to respawn' }, { id: 'foul' }, { id: 'm-fail', label: 'Losing a table' }, { id: 'heart' }, { id: 'runover' }]
  },
  {
    id: 'S5', group: 'sound', kind: 'sound', title: 'Big wins: last ball, CLEAR!, combos, run complete',
    effort: 'S', riskLevel: 'Low',
    where: 'main.js:2123; Juice.js:746; Moments.js:417, 674',
    problem: 'The last ball of a table sounds like any other pot. CLEAR! is a short three-note figure doubled with a door sound, and the word itself slams in silently. A combo has no sound of its own. Finishing the whole run sounds the same as finishing one table.',
    proposal: 'Last ball: the table hushes for a beat, then a big drop with a high chord. CLEAR!: a run up into a chord. A combo turns the pot note into a chord stab. Run complete gets a three-chord fanfare.',
    fits: 'The picture already does this: the table runs at 8x after the last ball and CLEAR! slams in (bible §8.5c). The sound follows the same hold-then-hit shape.',
    risk: 'The last-ball hush ducks the mix for 120 ms; it must not swallow the pot itself. Sequenced so the drop lands after the dip.',
    sounds: [{ id: 'm-clear', label: 'Clearing a table, last ball to cash' }, { id: 'last' }, { id: 'clear' }, { id: 'combo' }, { id: 'runwin' }]
  },
  {
    id: 'S6', group: 'sound', kind: 'sound', title: 'Things on the table',
    effort: 'M', riskLevel: 'Low',
    where: 'main.js:2153, 2214-2256, 2283; Moments.js:1726, 1790; Juice.js:689; PhysicsSystem (portal has no event)',
    problem: 'A mine, a kicker and a hard rail all play the same sub thud. The ×2 ring plays a leftover saw that has nothing to do with the MULT box. The bomb shot, an ability you buy, plays the old game-over sound. The freeze pickup shares a voice with five other events. Portals and ability cut-ins are silent.',
    proposal: 'One voice each: a mult chime for ×2 (the MULT box\'s own timbre), a blast for the mine, a spring for the kicker, an ice ting, a swell into the freeze hit, a phase-through for portals, a pinball pop for bumpers, an explosion for the bomb, a swish and stamp for cut-ins.',
    fits: 'Bible law 1: color says which number a thing feeds. Sound follows the same rule: a thing that feeds Mult sounds like the MULT box, a hazard sounds like a hazard.',
    risk: 'The portal needs a new physics event (a notification only; the crossing itself is untouched, and check-portal stays the gate).',
    sounds: [{ id: 'x2' }, { id: 'mine' }, { id: 'kicker' }, { id: 'ice' }, { id: 'freeze' }, { id: 'portal' }, { id: 'bumper' }, { id: 'plus' }, { id: 'bomb' }, { id: 'cutin' }]
  },
  {
    id: 'S7', group: 'sound', kind: 'sound', title: 'Menus, cards and the shop',
    effort: 'S', riskLevel: 'Low',
    where: 'main.js:2702-2831, 5153-5178; Moments.js:311, 336, 1865, 1906; index.html menus (silent)',
    problem: 'Menu taps are silent. The table card borrows the strike sound. Buy, achievement and hold share one voice; reroll, sell, the shop opening and the card share another. The aim-exit sound fires on every release and blurs the strike.',
    proposal: 'A 30 ms tick on every button, a lower one for Back. A whoosh and stamp for the table card. A ka-ching for a buy, a slowing wheel for a reroll, coins back for an undo, two bells for an achievement. Aim: a soft air swell in, a small rise on cancel, nothing on release.',
    fits: 'Quiet and short by design: the bible keeps the HUD at rest brightness, and these stay under the table sounds.',
    risk: 'Low.',
    sounds: [{ id: 'tap' }, { id: 'card' }, { id: 'buy' }, { id: 'reroll' }, { id: 'sell' }, { id: 'ach' }, { id: 'tables' }, { id: 'aim' }]
  },
  {
    id: 'S8', group: 'sound', kind: 'sound', title: 'New: a sound on every new animation beat, on the frame it lands',
    effort: 'S', riskLevel: 'Low',
    where: 'src/ui/Polish.js (rezTick, targetBeaten, uiTick hooks); AudioManager.js',
    problem: 'The sound pass was written before the animation proposals below, so their beats have no voice: balls rezzing in, the score passing the target, the home screen booting. Today several sounds also start early or late against the picture (the table card\'s sound leads the card by 0.4 s; the pot sound plays when the ball is removed, not when it reaches the mouth).',
    proposal: 'One rule: a sound starts on the frame its picture lands, and a hit-stop holds both. New voices: a climbing tick per ball as the rack rezzes in; a click and rising fifth when the score passes the target; nine ticks and a swell as the title boots; a bright zing on the rail when light runs along it (the sound pass\'s "thup + light zing"). Every animation card on this page plays with these in step: use its Hear it buttons.',
    fits: 'Bible §6: one movement at a time, each finishing before the next. Sound on the same frame is what makes two things read as one event.',
    risk: 'Low. Each is one call at a point where the animation already runs.',
    sounds: [{ x: 'rezRun', label: 'The rack rezzes in (5 balls)', note: 'silent today' }, { x: 'targetBeaten', label: 'Score passes the target', note: 'silent today' }, { x: 'menuBoot', label: 'Home screen boots', note: 'silent today' }, { id: 'rail', arg: 0.9, pick: 'B', label: 'Rail, with the light-run zing' }]
  },

  /* --------------------------- animation ---------------------------- */
  {
    id: 'A1', group: 'juice', kind: 'clip', clip: 'rail', title: 'Rails: light runs along the cushion',
    effort: 'S', riskLevel: 'Low', toggle: "rail: 'run'",
    where: 'main.js playerRebound, wallSplat, enemyRebound; Polish.rail',
    problem: 'A ball off a rail throws five small sparks and that is all. The design bible lists this as an open gap: "the rail flashes, then a mult light runs along it" is specified and not built. Rails are how you build Mult, and the table barely notices them.',
    proposal: 'The cushion flashes where it was hit and light runs along it both ways, farther the harder the hit. Orange for the cue ball, whose rails feed Mult; plain structure light for any other ball. The +1 WALL plate still appears only when a pot cashes it in.',
    fits: 'Closes a row in the bible\'s own gap table (§11). Orange is the Mult channel (law 1), and the effect lights its cause with no number, which is what §7 asks for before a pot.',
    risk: 'Screen noise on a multi-rail shot. Each run lasts under 0.6 s and is skipped for slow touches.',
    captions: ['Five sparks at the point of contact.', 'A flash, then light runs along the cushion.'],
    soundFlags: { zing: true }
  },
  {
    id: 'A2', group: 'juice', kind: 'clip', clip: 'pocket', title: 'Pockets: the mouth gulps the ball',
    effort: 'S', riskLevel: 'Low', toggle: "pocket: 'gulp'",
    where: 'main.js potted handler, removeBall, sinkBall; Polish.pocket',
    problem: 'The pot is the moment the whole game is about, and the pocket itself does little: the ball shrinks away and one thin ring goes out. The pocket beam from the juice review was turned off, so nothing replaced it.',
    proposal: 'A ring in the ball\'s own color closes on the mouth as the ball falls, the mouth flashes, a ring goes out and ticks of light chase round the lip. The last ball of a table gets a wider ring and more ticks. No pillar and no beam.',
    fits: 'Bible §8.6 specifies "pocket flare, shockwave, ball derez into the void". Circles are table things (law 2), and it is one event under 300 ms at glow-3 (law 3).',
    risk: 'The beam was rejected in review; this stays flat on the felt, inside the pocket\'s own footprint, so it should not read as the same idea. Worth a look for that reason.',
    captions: ['The ball shrinks into the pocket; one ring.', 'The mouth closes on it, flashes, and the lip lights.']
  },
  {
    id: 'A3', group: 'juice', kind: 'clip', clip: 'rack', title: 'Table open: the balls rez in, by number',
    effort: 'S', riskLevel: 'Low', toggle: "rack: 'rez'",
    where: 'main.js showRoomBanner; Polish.rack',
    problem: 'When a table opens, its balls are simply there. The bible\'s Boot treatment says "balls flicker up" and lists it as not built. Every other arrival in the game (the stick, the cue ball after a scratch, cards, plates) is shown arriving.',
    proposal: 'Before the table card comes in, each ball drops in on a short beam, lowest number first, with a ring closing on its spot and a tick that climbs in pitch. About half a second for five balls, then the card.',
    fits: 'Bible law 8: nothing appears without being shown to appear. It is the scratch respawn\'s beam-and-ring (§8.2) at a smaller size, and it teaches the rack\'s order at a glance on the tables where order matters.',
    risk: 'Adds about 0.5 s before the card on each table. The balls are on the table for the physics and the aim line from the first frame; only their drawing waits.',
    captions: ['The rack is already there when the card arrives.', 'Balls beam in lowest first, then the card.'],
    soundNow: false
  },
  {
    id: 'A4', group: 'juice', kind: 'clip', clip: 'idle', title: 'Idle: the table stays alive between shots',
    effort: 'S', riskLevel: 'Low', toggle: "idle: 'breathe'",
    where: 'main.js frame loop; Polish._updateIdle',
    problem: 'At rest the only thing that moves is a slow pulse in the cue ball\'s glow. Clearing the stick and the aim lines from the resting table was a deliberate cleanup, but what is left is close to a still image whenever the player stops to think.',
    proposal: 'After two seconds of rest, and every 4.6 s after, the cue ball lets go of two slow rings and a pair of glints run a lap of the rails from the bottom to the top, the way the Boot\'s light-cycles do. Dim, and it stops the instant a thumb goes down.',
    fits: 'Stays at rest brightness (bible law 3: the table rests at glow-0 and glow-1) and draws nothing on the felt where the player aims. The lap reuses the Boot transition\'s own image (§8.5).',
    risk: 'You asked for nothing at rest once (the stick and lines). This is ambient rather than a control, but if it reads as clutter, reject it.',
    captions: ['Only the cue ball\'s glow pulses.', 'A slow ring off the cue ball; glints lap the rails.']
  },
  {
    id: 'A5', group: 'juice', kind: 'clip', clip: 'flash', title: 'Full power: light from the ball, not a white screen',
    effort: 'S', riskLevel: 'Med', toggle: "flash: 'soft'",
    where: 'Juice.js strike (flash 0.55) and slam (flash 0.8); Polish.softFlash',
    problem: 'A full-power strike fires two full-screen white flashes on the same frame (the strike\'s and the FULL POWER slam\'s), which stack to an almost completely white screen for a frame or two. On a phone at night that is harsh, and it hides the strike it is celebrating.',
    proposal: 'The strike lights from the cue ball outward (white core, orange falloff) and the screen-wide flash drops to under a third. Everything else about the full-power strike stays: the lines, the FULL POWER band, the jolt.',
    fits: 'Bible law 6: light comes from its cause. A flash from the ball says where the power went; a white screen says nothing.',
    risk: 'This changes a review pick ("the strike\'s flash at full power", juice round 1). It keeps the flash and moves it onto the ball, but it is your call.',
    captions: ['Two stacked flashes white out the screen.', 'The flash comes off the ball; the table stays visible.']
  },

  /* ------------------------------- ui -------------------------------- */
  {
    id: 'U1', group: 'ui', kind: 'clip', clip: 'menu', title: 'Menus: the home screen boots, panels arrive, buttons answer',
    effort: 'S', riskLevel: 'Low', toggle: "menu: 'boot'",
    where: 'main.js showPanel; index.html .menu-btn:active; Polish.menuPanel, _bindPress',
    problem: 'The home screen appears complete on the first frame, and moving between Home, Play, Settings and Achievements is a hard cut: one panel is hidden and the next shown. A tapped button shrinks by 2% and makes no sound. It is the one part of the game with no motion language.',
    proposal: 'On Home the title flickers on left to right, a line of light draws under it, and Play rises in. A panel\'s rows arrive one after another (the table list a row at a time). Every button dips and flashes under the thumb, with a tick.',
    fits: 'Uses the bible\'s own tokens: ease-boot (steps of 4) for the glyph flicker, ease-draw for lines drawing on. The result screen\'s buttons already "dip and flash the instant they are tapped" (§8.4); this makes every button do it.',
    risk: 'A returning player sees the boot each time they open Home (0.9 s, never blocking a tap).',
    captions: ['Hard cuts between screens; buttons barely react.', 'The title boots, rows arrive, buttons dip and tick.'],
    soundExtra: [[0.3, 'menuBoot'], [1.82, 'uiTick']]
  },
  {
    id: 'U2', group: 'ui', kind: 'clip', clip: 'target', title: 'Score bar: passing the target is a moment',
    effort: 'S', riskLevel: 'Low', toggle: "target: 'beat'",
    where: 'HUD.js update (target bar); Polish.targetBeaten',
    problem: 'The target is what pays cash, and beating it mid-table is the first win of every table. Today the bar fills and a small tick appears next to the number. Nothing marks the moment, and it is easy to miss while the tally flies in.',
    proposal: 'When the score passes the target, a sweep of white crosses the bar, a ring leaves its end, and a TARGET BEATEN chip pops under it for a second, with a click and a rising fifth.',
    fits: 'Bible law 8: "a counter that jumps on its own is a bug", and any figure that changes is telegraphed loudly. The chip is a chamfered UI plate in the `you` cyan the result screen already uses for BEATEN.',
    risk: 'It follows the tally landing by a quarter second, so two things happen close together at the top of the screen. Sequenced after the tally, not on top of it.',
    captions: ['The bar fills; a small tick appears.', 'A sweep, a ring and a TARGET BEATEN chip.']
  },

  /* ------------------------------ feel ------------------------------- */
  {
    id: 'F1', group: 'feel', kind: 'clip', clip: 'contact', title: 'Contact: a snap and a held beat when balls meet',
    effort: 'S', riskLevel: 'Med', toggle: "contact: 'snap'",
    where: 'main.js impact handler (hit-stop only when the score feed is off); Polish.contact',
    problem: 'In a run, the cue ball hitting a ball has no weight. The hit-stop on contact was switched off when the score presenter took over the freeze, so unless that contact is about to sink a ball, the table does not pause at all: ten soft particles and the balls part.',
    proposal: 'A fan of sparks thrown across the line of the hit, a ring off the struck ball in its own color, and on a firm hit the table holds for 20 to 60 ms, longer the harder. The hold is time only: the physics takes the same steps and the aim line is untouched.',
    fits: 'Bible §6 lists "hit-stop 90" as a core duration and §8.1 freezes the table on the strike; this gives the second most common impact the same language at a third of the length.',
    risk: 'A hit-stop on every firm contact changes rhythm on a busy break (overlapping stops take the longest, they do not add). The aim check (check-aim-run) must stay at 100%; it does not see hit-stops, but it is the gate.',
    captions: ['The balls part; a few soft particles.', 'Sparks across the hit, a ring, a held beat.']
  },
  {
    id: 'F2', group: 'feel', kind: 'table', title: 'Phones: measure frame time, then step quality down when it runs long',
    effort: 'M', riskLevel: 'Low',
    where: 'main.js buildComposer, bloomAllowed, resize; config.js RENDER',
    problem: 'On a 3x phone the game draws a 780×1386 half-float buffer through a five-level bloom every frame, even on a still table. Whether bloom runs is decided once, from the core count, which says little about the GPU: a budget phone with 8 slow cores gets the full pipeline, and nothing steps down if frames run long. I could not time a real phone GPU from here; these are counts and sizes.',
    proposal: 'First a frame-time probe (rolling average, shown with ?fps and reported in the anonymous stats). Then an adaptive step: above 22 ms for two seconds, pixel ratio 2 → 1.5; still above, bloom off for the session. Never stepping back up mid-table, so the look does not flicker.',
    fits: 'The look is unchanged on phones that keep up. On ones that do not, a steady frame rate is the bigger part of "feels polished".',
    risk: 'Without bloom the glow levels flatten (the bible\'s four levels lean on it). That is why it is the last step, not the first.',
    table: { head: ['Measured today', 'Value', 'After (slow phones only)'], rows: [['Drawing buffer, 390×844 @3x', '780×1386', '585×1040 at ratio 1.5'], ['Pixels through bloom per frame', '1.08 M', '0.61 M, then 0'], ['Bloom decided by', 'core count ≥ 4, once', 'measured frame time'], ['Geometries / textures / programs', '74 / 18 / 21', 'same'], ['DOM nodes at rest', '~390', 'same']], up: [2] }
  }
];
