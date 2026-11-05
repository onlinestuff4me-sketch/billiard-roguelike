# Sound

Audit, research and proposal for Lightline's sound. Every sound is synthesized
live by Web Audio in `src/core/AudioManager.js` (no audio files ship), with its
settings in `AUDIO` in `src/config.js`.

The review page, where every current sound and every proposal can be played
and picked: **Lightline Sound Pass** (claude.ai artifact
`1n7QWEUaFGQvLJEJfT9RH3`).

---

## 1. How this was measured

- **Call sites.** Every `audio.x(...)` / `this.audio?.x?.()` in `src/` was
  traced to the game event that triggers it (§3 lists them).
- **Real play.** A headless Chromium played a real run (table 1 onward) with
  every `AudioManager` method wrapped to log its name, arguments, time and the
  engine's time scale. The sequences in §4 come from that log.
- **Levels.** Each voice, and each logged sequence, was rendered offline
  (`OfflineAudioContext`) through the real `AudioManager` chain. Reported:
  - the peak (dBFS);
  - the loudest 50 ms RMS ("level");
  - the share of energy below 150 Hz, the part a phone speaker cannot play.

The score slam is the reference: **−17.4 dB**.

---

## 2. Headline findings

1. **The strike is muffled.**
   - Aiming runs at time scale 0, which closes the master low-pass to 620 Hz.
   - The release sound (`slingshot`, plus `focusExit` at the same instant)
     plays before the scale eases back.
   - In game the strike has **0% of its energy above 1 kHz** (7% unmuffled).
     At −29.5 dB it is 12 dB under the slam.
   - The sound the player makes most is one of the dullest in the game.
2. **The loudness hierarchy is upside down.**
   - A pot (`enemyDeath`, −31 dB) is 12 dB quieter than a hard object-ball
     rail (`wallSplat`, −19.6 dB).
   - A cue-ball rail is almost inaudible (−41 to −47 dB).
   - A ball-to-ball `carom` (−17.6 dB) is as loud as the slam.
3. **Most of the weight is sub-bass.**
   - The slam is 59% below 150 Hz, `carom` 49%, `wallSplat` 75% and
     `roomClear` 51%.
   - With a phone-speaker high-pass, the slam drops from −17 dB to −31 dB.
4. **Prototype voices stand in for the billiards game.**
   - `playerHurt`: scratch, foul, mine voiding, kickback.
   - `playerDeath`: the **bomb shot**, a lost table and run over.
   - `enemyDeath`: every pot.
   - `boonPick`: six events (freeze pickup, upgrade, +1 shot, achievements,
     shop buy, hold).
   - `doorOpen`: six events (shop open, reroll, sell, undo, table card, result
     wipe).
   - `scoreLock`: eleven places.
5. **Stacks and wrong sounds.**
   - **Losing a table** plays `playerDeath`, `roomClear` (the clear fanfare) and
     `doorOpen` within 2 ms (`main.js:2860`, `Moments.js:417`,
     `Moments.js:1154`). It is the loudest moment measured (−16.5 dB).
   - **A scratch** plays five voices over two seconds, including the score
     slam: a reward sound for a mistake.
6. **Silent events.**
   - Portal transit (no physics event exists).
   - Ability cut-ins and the CLEAR! word (`Juice.js` makes no sound).
   - A heart breaking (`Moments.js:1402`, shake only).
   - The run-over score count.
   - Object balls off a soft rail.
   - Menu taps.
7. **No variation.** Every repeat is identical apart from power or speed
   scaling. A break sounds like one sample repeated.
8. **No limiter, no ducking, no voice caps.**
   - The only cap is `impact` (30 ms).
   - Nothing clips today only because the master gain is 0.55. A six-hit break
     peaks between −7 and −2 dBFS, and a bomb at −6 dBFS.
9. **Dead code.**
   - `enemyShot` and `enemyCharge` (not defined, called via `?.`) belong to the
     shooter AI, which no billiards table uses.
   - `backstab` is never called.
   - `playerDash` and `playerDamaged` handlers remain in `main.js`.
10. **Haptics already exist.** `navigator.vibrate` fires on the strike
    (`main.js:996`) and on full power (`main.js:1288`). Nothing else vibrates.

---

## 3. Audit by event

Level = loudest 50 ms RMS, in dB (slam = −17.4). "Sub" = share below 150 Hz.

| Event | Plays now | Triggered at | Level | Problem |
| --- | --- | --- | --- | --- |
| Cue strike | `slingshot(p)` + `focusExit`; `strikeImpact` at full | main.js:2295, 5192, 994 | −29.5 in game | Muffled by the slow-mo filter; quiet; no variation |
| Full power | `maxPower` (+ `ignite` / `lockOn`) | main.js:1268–1284 | −29.3 | Muffled; thump below phone range |
| Ball meets ball | `impact(i)` (cue); `carom` (ball on ball) | main.js:2005, 2024 | −20 to −25; carom −17.6 | No click; carom 49% sub and as loud as the slam |
| Rail, cue ball | `rebound(i)` | main.js:2267 | −41 to −47 | Nearly inaudible |
| Rail, object ball | `wallSplat` if speed ≥ 16, else silent | main.js:2038, 2051 | −19.6 / silent | Hard: louder than a pot, 75% sub. Soft: nothing |
| Pocket drop | `enemyDeath` | main.js:1553 | −31.2 | Quietest key event; no pitch, rattle or escalation |
| Scratch | `playerHurt`, then slam, door, lock, boot | main.js:2181, Moments.js:1621–1681 | −23.8, then −17.4 | Reward sound for a mistake; five voices |
| Foul (8 back) | `playerHurt` | main.js:2084 | −23.8 | Same as four other mistakes |
| ×2 ring | `pyre` | main.js:2214 | −33.6 | Unrelated to the MULT box's voice |
| Mine | `wallSplat` | main.js:2256 | −19.6 | Same as a rail; mostly sub |
| Kicker | `wallSplat` | main.js:2247 | −19.6 | Same again |
| Freeze pickup | `boonPick` | main.js:2220 | −28 | Shared by six events |
| Freeze on / off | `freezeOn` / `shatter` | Moments.js:1726, 1790 | −24.9 / −28.8 | Good; no build-up; low end lost on phones |
| Portal | none | — | silent | Needs a hook |
| Bumper | `bumper` (+ rail tick) | main.js:2283 | −29.4 | Thin; identical every time |
| +1 shot | `boonPick`, then `scoreLock` on landing | main.js:2241, 1873 | −28 / −26 | Shared voices |
| Upgrade | `boonPick` | main.js:2232 | −28 | Shared |
| Combo / two in one | the next `scoreNote` only | ScoreFeed.js:565 | −26.6 | No sound of its own |
| Last ball | same as any pot | main.js:2125 (beam only) | −31.2 | The biggest moment sounds ordinary |
| Bomb blast | `playerDeath` | main.js:2153 | −23.1 | A death sound for a bought ability |
| Cut-in | none | Juice.js:689 | silent | — |
| Number in a box | `scoreNote(i, bucket)` | ScoreFeed.js:565 | Points −26.6, Mult −31.5 | Mult 5 dB quieter; soft 6 ms attack |
| Lock | `scoreLock` | ScoreFeed.js:606 (+10 more) | −26 | Used for eleven things |
| Slam | `scoreSlam` | ScoreFeed.js:596 (+4 more) | −17.4 | 59% sub; no ducking |
| Result tally | `scoreNote(4+n)`, then slam | Moments.js:1350 | −26.6 per tick | 340 ms notes smear at 70 ms spacing; climbs past 1.7 kHz |
| Coins | `coin(n)` | Moments.js:1541, 1584 | −37.5 | 20 dB under the slam; quarter-tone steps off the scale |
| CLEAR! | `roomClear` + `doorOpen` together | Moments.js:417, 1154 | −17.3 | Short; doubled; the CLEAR! word is silent |
| Table lost | `playerDeath` + `roomClear` + `doorOpen` | main.js:2860, Moments.js:417, 1154 | −16.5 together | Plays the clear fanfare on a loss |
| Heart lost | none | Moments.js:1402 | silent | — |
| Run over | `playerDeath`; the score counts up silently | Moments.js:673, main.js:2338 | −23.1 | Same as the bomb |
| Run complete | `roomClear` | Moments.js:674 | −17.3 | Same as one table |
| Achievement | `boonPick` | main.js:2702, 2706 | −28 | Shared |
| Table card | `doorOpen` + `slingshot(0.25)` | Moments.js:311, 336 | −29 | Borrows the strike |
| Shop buy / reroll / sell | `boonPick` / `doorOpen` / `doorOpen` | main.js:2800, 2779, 2813, 2831 | −28 / −29 | Reroll and sell sound the same |
| Menu taps | none | — | silent | — |
| Table out / in | `derez` / `boot` | Moments.js:1865, 1906 | −35 / −38 | Fine; blips off the scale |
| Aim start / cancel | `focusEnter` / `focusExit` | main.js:5153, 5178 | −29 | `focusExit` also fires on every release, blurring the strike |

---

## 4. Logged sequences (real run)

Timings in seconds from the first sound of each moment.

- **Pot.** `slingshot` (at time scale 0) → 1.4 `impact` → 2.66
  `enemyDeath` → 2.73 `scoreThud` → 4.78 `scoreNote` → 6.93 `scoreSlam` →
  7.34 `scoreLock` → 9.5 `scoreSlam`.
  - The pot is the quietest sound in the chain.
- **Scratch.** `rebound` → 0.13 `playerHurt` → 0.62 `scoreSlam` → 1.42
  `doorOpen` → 2.13 `scoreLock` → 2.23 `boot`.
- **Table lost.** `playerDeath` + `roomClear` + `doorOpen` inside 2 ms, then
  `scoreThud` and `scoreNote`.
  - A moment later, in another state, `slingshot`, `scoreSlam` and
    `playerHurt` also fired inside 2 ms.
- **Tap-shot.** `focusEnter`, `focusExit` and `slingshot` all fire inside 2 ms.

---

## 5. Research: what makes impact sound juicy

> **About the sources.** The research ran in this cloud session, whose
> network blocked the sites themselves. Every claim below was matched against
> search-result text for the source, **not read on the page**. Treat each one
> as a lead to check, not as a citation. A claim marked *(lore)* is common
> practice with no primary source found. A claim marked *(ours)* is our own
> judgement.

### Escalating pitch (Peggle)

- Peggle 2's peg hits are treated as a melody instrument. Hits climb a scale
  that follows the harmony of the music playing [1].
- Audiokinetic's Peggle Blast! notes say climbing pitch gave variety and
  excitement with no new assets, using real-time synthesis [2][3].
- The last peg: slow motion, a close-up, a drumroll, then "Ode to Joy", then a
  long count-up [4][5][8].
- **Here:**
  - The pentatonic ladder already exists. Extend it to pots and contacts
    within a stroke.
  - Give the last ball its own hush-then-drop.

### Tally tension and two voices (Balatro)

- Reviews single out numbers ticking up with escalating sound, and the
  suspense of watching the hand score [10][11].
- No developer source on its sound effects was found.
- **Here:**
  - POINTS and MULT keep distinct timbres. Today MULT is 5 dB quieter, which
    is backwards.
  - Ticks must be short enough not to smear.
  - The threshold moment gets its own stinger.

### Many small sounds at once (Vampire Survivors)

- No developer source was found. Players note that the game merges piled-up
  gems, which also merges their sounds [13].
- **Here:** cap coins and clicks per window, and let a final ka-ching carry
  the total (*ours*).

### Layering (Hades, general)

- Tutorials agree on three layers: a transient for definition, a body for
  character, and a low tail for weight. Short tails feel more responsive
  [29][30][31].
- Hades-specific layering is unsourced. Its adaptive, layered music is
  documented [16].
- **Here:** every proposal is built as click + body + thump.

### Paired fail and reset sounds (Celeste)

- Celeste's FMOD project, with the designer's notes, is public [18][19].
  It is the best primary source left to read.
- A wiki claims the respawn sound is the death sound reversed [20], but the
  claim is unattributed.
- **Here:** the scratch and respawn are one gesture: a drop, then a reversed
  swell back.

### Real billiards and pinball

- Ball-on-ball contact lasts about 0.2–0.3 ms. The sound is a broadband
  impulse, not a tone [22][23].
  - That rules out today's 140–330 ms thud as a contact sound.
  - **Here:** a sub-millisecond-feeling click plus a short bright ring, with
    loudness by speed.
- Sound libraries split pool sounds into hits, break, roll, pocket, rail and
  the return rail [24][25].
  - **Here:** each of those gets its own voice.
- Pinball designer Jeff Dodson routes jackpots through a priority bus and
  clears other sounds out of their way [27].
  - **Here:** the slam, CLEAR! and the last ball duck the mix.

### Techniques

- **Randomization.** Small pitch and volume changes on repeats.
  - Pitch-only randomization can sound artificial [32][33].
  - ±1–2 semitones is *(lore)*. We use 30–80 cents on noise hits.
  - We do not randomize scale notes, which would go out of tune.
- **Quantization.**
  - Snap score pitches to the scale.
  - Do not snap collisions in time: the added latency is felt [34][35].
  - Swink's definition of game feel puts response under about 100 ms [52].
- **Ducking and sidechain.** Important hits dip the rest [36][37].
  - About −4 to −8 dB with a 300–600 ms release *(ours)*.
- **Silence before impact.**
  - Hit-stop guides say to sync audio to the visual freeze [39][40].
  - A 50–100 ms pre-hit dip is *(lore)* [39].
  - We use 70–120 ms on the slam, CLEAR! and the last ball.
- **Phone speakers.**
  - Micro-speakers cannot reproduce low bass [41][42]. The quoted cutoffs vary
    (100–500 Hz).
  - The missing-fundamental effect lets harmonics imply bass, for pitched
    sounds [41][43].
  - **Here:** every thump gets a soft-clipped copy band-passed to
    150–600 Hz.
- **Voice limiting.**
  - FMOD and Wwise cap instances per event and steal or refuse the rest; they
    advise few priority tiers [44][45].
  - **Here:** at most 3–4 clicks, rails or coins in 50–60 ms.
- **Haptics.**
  - Apple's audio-haptic principles are causality, harmony and utility
    (WWDC21, via a summary [46]).
  - `navigator.vibrate` has no general support in iOS Safari [47][48].
  - **Here:** haptics are Android-only and an extra, never the only cue.
- **Web Audio.**
  - `DynamicsCompressorNode` tops out at a 20:1 ratio, so use a −4 dB
    threshold, 0 knee, 2 ms attack and 150 ms release, and keep headroom by
    design [53][54].
  - Ramp gains to 0.0001 (exponential ramps cannot reach 0) to avoid clicks
    [55].
  - Disconnect nodes when they end; WebKit has had crackle bugs with many live
    nodes [57].
  - On iOS, the silent switch mutes Web Audio [60][61].
- **Game feel talks.**
  - Jonasson & Purho, "Juice it or lose it" [49].
  - Nijman, "The Art of Screenshake" [50][51].
  - Swink, *Game Feel* [52].

### Sources (none loaded directly; see the note above)

1. Audio Gang, "Peggle 2 – Sonic Joy" — https://www.audiogang.org/peggle2-sonic-joy/
2. Audiokinetic, "Peggle Blast! Peg Hits and the Music System" — https://blog.audiokinetic.com/en/peggle-blast-peg-hits-and-the-music-system
3. Audiokinetic, "Real-time synthesis for sound creation in Peggle Blast" — https://www.audiokinetic.com/ko/blog/real-time-synthesis-for-sound-creation-in-peggle-blast
4. Common Sense Media, Peggle — https://www.commonsensemedia.org/game-reviews/peggle
5. Macworld, Peggle — https://www.macworld.com/article/188671/peggle.html
8. PC Gamer, "The Making of Peggle" — https://pcgamer.com/the-making-of-peggle/2
10. "Balatro's Cursed Design Problem" (video transcript) — https://amara.org/subtitles/qZaMrU6iDy4J/
11. GamesRadar, Balatro creator — https://www.gamesradar.com/games/roguelike/after-winning-big-at-the-game-awards-and-taking-hours-of-our-time-in-2024-balatro-creator-reveals-their-most-productive-night-resulted-in-one-of-the-games-most-satisfying-features
13. r/DestroyMyGame thread (player opinion) — https://twt.omada.cafe/r/DestroyMyGame/comments/1nf60bd/destroy_our_wip_sounds_and_visual_fx
16. Gameplay, "The Sound of Hades" — https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/
18. FMOD, Celeste project appendix — https://www.fmod.com/docs/studio/appendix-a-celeste.html
19. Game Developer, Celeste audio files public — https://gamedeveloper.com/audio/-i-celeste-s-i-audio-files-are-now-publicly-available-for-devs
20. ZHdK Gamesoundopedia, Celeste — https://wiki.zhdk.ch/gamesoundopedia/doku.php?id=celeste
22. Dr. Dave Billiards, contact time — https://drdavepoolinfo.com/FAQ/ball/contact-time/
23. AZBilliards forum, ball impact noise — https://forums.azbilliards.com/goto/post?id=2995139
24. A Sound Effect, billiards library — https://www.asoundeffect.com/?p=685740
25. Shockwave-Sound, pool sounds — https://shockwave-sound.com/sound-effects/4986/lyn070-pool-sounds-set-1-pool-snooker-billiards
27. Kineticist, Jeff Dodson interview — https://www.kineticist.com/post/jeff-dodson-dune-interview
29. Wayline, game audio — https://www.wayline.io/learn/game-audio/1
30. Violet Recording, impact sounds — https://violetrecording.com/how-to-make-impact-sounds/
31. Lior Tega, gun sound design — https://www.liortega.com/post/first-person-shooter-gun-sound-design
32. IRPR, repetitive game audio — https://sounddesign.irpr.agency/solutions/game-audio-repetitive/
33. US Patent 10453434 — https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10453434
34. CRIWARE, syncing SFX and music — https://blog.criware.com/index.php/2022/01/04/synchronizing-sfx-and-music/
35. Game Developer, "Planckogenesis Part I" — https://www.gamedeveloper.com/design/planckogenesis-part-i-quantizing-events
36. MCV, side-chaining in Wwise — https://mcvuk.com/development-news/audio-guide-side-chaining-in-wwise/
37. Game Developer, "Game Audio Theory: Ducking" — https://www.gamedeveloper.com/audio/game-audio-theory-ducking
39. Gamejuice, hit-stop (unvetted blog) — https://gamejuice.pages.dev/articles/hit-stop-frame-trick
40. Uhiyama Lab, hit feedback — https://uhiyama-lab.com/en/notes/unity/unity-game-feel-hit-feedback/
41. AES e-library, micro-speaker bass — https://aes2.org/publications/elibrary-page/?id=19278
42. LANDR, bass on phone speakers — https://blog.landr.com/make-bass-audible-phone-speakers
43. US Patent 11218805 (missing fundamental) — https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11218805
44. FMOD, managing resources — https://d1s9dnlmdewoh1.cloudfront.net/2.03/api/managing-resources-in-the-core-api.html
45. Unity, AudioSource.priority — https://docs.unity3d.com/ScriptReference/AudioSource-priority.html
46. WWDC21 "Practice audio haptic design", summarized — https://charleswiltgen.github.io/Axiom/reference/haptics
47. ios-vibrator-pro-max — https://github.com/samdenty/ios-vibrator-pro-max
48. Bugnet, vibrate on iOS Safari — https://bugnet.io/blog/fix-web-game-vibrate-api-not-available-ios-safari
49. Gamejuice, "Juice it or lose it" lessons — https://gamejuice.pages.dev/articles/juice-it-or-lose-it-lessons
50. Game Developer, Vlambeer advice — https://gamedeveloper.com/design/vlambeer-co-founder-shares-advice-on-building-better-action-games
51. "The Art of Screenshake" — https://youtu.be/AJdEqssNZ-U
52. Wikipedia, Game feel — https://en.wikipedia.org/wiki/Game_feel
53. WebPlatform, DynamicsCompressorNode — https://webplatform.github.io/docs/apis/webaudio/DynamicsCompressorNode
54. W3C Web Audio changeset — https://dvcs.w3.org/hg/audio/rev/ec9cc6af6ece
55. alemangui, "the ugly click" — https://alemangui.github.io/ramp-to-value
57. WebKit bug 222098 — https://bugs.webkit.org/show_bug.cgi?id=222098
60. feross/unmute-ios-audio — https://github.com/feross/unmute-ios-audio
61. Bugnet, iOS silent switch — https://bugnet.io/blog/how-to-fix-ios-web-game-audio-muted-by-the-silent-switch

Numbering follows the research notes; gaps are sources not used here.

---

## 6. The proposal

Every proposal is playable on the review page beside today's sound.

### The bus

- **Two buses.**
  - *World* (balls, rails, pockets, things on the table) goes through the
    slow-mo low-pass.
  - *Dry* (the strike, score, UI, stingers) does not.
- **A duck gain** after both buses, for the slam, CLEAR!, the last ball, mines
  and the bomb.
- **A limiter** after the duck: `DynamicsCompressorNode`, −4 dB threshold,
  20:1, 0 knee, 2 ms attack, 150 ms release.
- **Voice caps.** Contacts 4 per 50 ms, rails 3 per 50 ms, coins 3 per 60 ms.
- **`thump()`.** Every low hit is a sine sweep plus a tanh-clipped copy
  band-passed around 320 Hz, so a phone still hears it.
- **`click()`.** A ball contact: a very short band-passed noise snap and a
  short bright ring, both detuned at random.
- **Unchanged.** The guard against non-finite numbers stays on every voice
  builder.

### Proposed loudness

From the same offline render. Level is the loudest 50 ms; "phone" is the same
render through a 280 Hz high-pass.

| Event | Now | Proposed A | Now on a phone | A on a phone |
| --- | --- | --- | --- | --- |
| Strike (65%) | −33.2 | −22.5 | −34.6 | −30.4 |
| Rail | −42 | −25.5 | −39.3 | −31.2 |
| Pot | −30.9 | −19.5 | −33.2 | −25.5 |
| Slam | −17.3 | −15.8 | −31.1 | −24.0 |
| Last ball | −31.2 | −13.2 | −33.4 | −21.2 |
| Coins | −37.0 | −29.3 | −34.9 | −27.1 |
| Six-hit break (peak) | −2.4 dBFS | −6.2 dBFS | | |

The hierarchy this aims for, loudest first:

1. last ball, CLEAR!
2. slam
3. pot, strike, blasts
4. rails, contacts, score notes
5. coins, UI

### Hooks the proposals need

- **Portal transit:** a physics event.
- **Cut-in:** `Juice.cutIn`.
- **CLEAR! word:** `Juice.finish`.
- **Heart break:** `Moments._clearVerdict`.
- **Soft object-ball rails:** `enemyRebound`.
- **Menu taps.**
- **Last ball:** the `last` flag in `potted`.
- **Pot index within a stroke:** for the climbing note.
- **Remove:** the `focusExit` call on release, and the stacked
  `playerDeath` / `roomClear` / `doorOpen` on a lost table.

None of these touch the aim preview or the physics. They are calls added at
points where the game already knows the event happened.

Picks from the review are implemented in `AudioManager.js` and recorded here.
