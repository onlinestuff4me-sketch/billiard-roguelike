# Lightline — Design Bible

The single source for how **Lightline: Billiard Roguelike** looks, sounds, moves
and speaks. If a screen, effect, sound or sentence is not covered here, this
document is what gets updated first, then the code.

It replaces `docs/STYLE_GUIDE.md` ("Dark Velvet Cyber-Billiards"), which
describes enemies, focus and bullet time from the real-time game this one
replaced. The token values live in the **Lightline** design system (its
`tokens.json`); `src/config.js` (`PALETTE`, `CSS_PALETTE`, `SCORE_FEED`,
`MOMENTS`) is where the game reads them.

---

## 1. What the game is, in one line

Short-round trick-shot billiards on a Grid of light. The table is a black floor
ruled with thin lines; rails, pockets and balls are edges of light; every point
is a piece of light with a source on the table.

**The bar for everything:** every moment should be exciting and satisfying.
If an action or a reward does not get a reaction the player can see, hear and
(where the phone allows) feel, it is not finished.

---

## 2. The seven laws

1. **Colour says which number it feeds.** White light (`pts`) adds points.
   Heat (`mult`) multiplies them. Cyan (`you`) is your ball and nothing you
   collect. Pink-red (`hazard`) costs you. Everything else is `structure`,
   architecture with no meaning. A new mechanic takes one of these roles, or it
   gets no colour.
2. **Shape says what a thing is.** Circles are things on the table: balls,
   pockets, rings. Diamonds multiply, rings add, chevrons cost. Chamfered
   rectangles are UI. Nothing on the HUD is round; nothing on the table is
   chamfered.
3. **Brightness says what is happening.** Four glow levels. The table rests at
   `glow-0` and `glow-1`; only the cue ball and the aim line live at `glow-2`;
   `glow-3` is an event, 300 ms or less, one at a time.
4. **Every number has a place.** A point appears where it was earned (the rail,
   the ball, the field, the pocket) and then flies to its box. Never in a corner.
5. **One number at a time, and nothing counts until a ball drops.** Points build
   live, stay faded until a pot locks them in, and fly back out and shatter if
   the shot ends without one. (See §7, The count.)
6. **Every moment earns a reaction.** From its cause, one at a time, never over
   the aim preview. Full power, a wall, a pot, a lock, a slam, a scratch, a
   freeze, a cleared table: each gets light, sound and, where possible, a buzz.
7. **The preview never lies.** The drawn line is the shot the table plays
   (`npm run aim`). Twists may show less; they may never show something false.
   (This also binds puzzle design: see `docs/PUZZLE_RAMP.md`.)

---

## 3. Colour

| Role | Token | Hex | Use it for | Never for |
| --- | --- | --- | --- | --- |
| You | `you` | `#22e8ff` | Cue ball, aim line, cue stick edge, trail, shot pips, primary button, lock ring | Anything you collect or that scores |
| You, ghost | `you-deep` | `#0b8fa6` | Reflected aim legs, resting trail, empty pip | |
| Points | `pts` | `#e9f8ff` | POINTS box, + fields, hit and pot plates, table total | Large fills other than the box |
| Multiplier | `mult` | `#ff8a1e` | MULT box, × fields, rail lights, heated trail | Hazards; resting UI |
| Heat tip | `mult-hot` | `#ffc266` | Slam flash, bonus rows, ×N plates | A resting state |
| Hazard | `hazard` | `#ff2e7e` | Scratch, foul, void, take-back, out of shots | Anything without a chevron or a strike |
| Ice | `ice` | `#bff4ff` | Freeze frame only: the ice wave, frost rings, the label, charge plates | Anything else (it is a state, not a reward) |
| Money | `credit` | `#a98bff` | $ in the shop and the table-end ledger | The table |
| Floor | `floor` / `void` | `#040b16` / `#02050b` | Table bed / beyond the table, cover panels | Text |
| Architecture | `grid`, `structure`, `structure-lit` | `#0f2b3f`, `#1e4f6b`, `#3a87a8` | Grid, rails, lips, dividers | Text |
| Text | `ink`, `muted-ink`, `on-plate` | `#e9f8ff`, `#7fa3b8`, `#02050b` | Words; `on-plate` is ink printed on a solid plate | |

**Colour-blind safety.** POINTS and MULT differ by lightness (white vs orange),
not hue alone. Hazard always comes with a chevron, a strike-through or the word.
Object balls carry no hue that matters: number and band identify them. Check
every new pair with `npm run palette`.

---

## 4. Type

| Face | Token | Job |
| --- | --- | --- |
| Orbitron | `--font-display` | Trick names, banners, moment titles (TABLE CLEAR, SCRATCH, TIME STOPPED), buttons. Uppercase, tracked +0.10 to +0.16em. Never body text. |
| Oxanium | `--font-num` | Every number. Tabular figures. The table total is the loudest glyph on screen. |
| Rajdhani | `--font-ui` | Labels, mission sentences, card text. Labels 11px uppercase +0.24em; nothing else under 13px. |

Scale: trick-name 34, banner 22, card-title 15 · score-hero 48 (tally 72) ·
box-value 26 · popup 26 · tick 13 · mission 18 · body 16 · label 11.

---

## 5. Shape, line and glow

- **Corners are cut, never rounded:** 4 px ticks and pips, 8 px plates and
  buttons, 12 px cards and the ledger. Cut top-left and bottom-right.
- **Cut on a backing layer, glow on the element.** A `clip-path` on an element
  clips its own glow; put the cut on `::before` and the drop-shadow on the
  element (`.sf-plate`, `.max-badge`, `.mo-stamp`, `.mo-ledger`).
- **Strokes:** hair 1 px (grid) · ui 1.5 px (plate edges) · object 2 px (rails,
  rings, aim line) · emphasis 3 px (selection, trail head, rez rings). A halo is
  2.5× its core, additive, about 35% alpha.
- **Glow levels** (emissive multipliers against bloom threshold 1.0): 0.6 · 1.2
  · 2.0 · 4.0. GPU line width is 1 px everywhere, so anything thicker is a
  ribbon mesh (`Ribbon` in `Player.js`).
- Hollow with a dashed edge = you drive through it. Solid = it stops you.
- No icon set. Glyphs are built from table strokes: + ring, × diamond, chevron,
  pip, pocket ring, on a 16-unit grid.

---

## 6. Motion

**Durations:** instant 80 · fast 150 · base 250 · slow 400 · boot 700 ·
hit-stop 90 · pop 420 · hold 800 (×0.9 per event, min 400) · flight 340 ·
lock 500 · take-back step 300 · slam breath 400 · total roll 600 (ms).

**Easings:**

| Token | Curve | For |
| --- | --- | --- |
| `ease-draw` | `cubic-bezier(0.16, 1, 0.3, 1)` | Lines drawing on, things settling |
| `ease-pop` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Plates popping, boxes jumping, buttons arriving |
| `ease-fly` | `cubic-bezier(0.6, 0, 0.9, 0.4)` | Anything flying into its box: slow, then accelerating |
| `ease-slam` | `cubic-bezier(0.7, 0, 0.84, 0)` | Collisions: boxes slamming, stamps landing |
| `ease-boot` | `steps(4, end)` | Glyph flicker, glitch |

**Time:** `timescale-slow` 0.12 while a number presents; `timescale-fast` 2.5
on tap. A tap speeds things up and never skips a number entirely.

**The wiggle** (Balatro's): an instant squash, then about 8 Hz decaying as
(1 − t/0.45)³.

**Moments run on real time** (setTimeout and WAAPI), so a hit-stop freezes
the table, never the presentation.

---

## 7. The count (scoring presentation)

Summarised here; the full spec is in the Lightline design system ("The count")
and the code in `src/systems/Rules.js` and `src/ui/ScoreFeed.js`.

1. **Freeze** (90 ms hit-stop, soft thud).
2. **Slow motion** at 0.12×.
3. **The cause reacts** in the colour of the box it feeds: the wall lights, the
   zone swells, the ball wiggles, the pocket flares.
4. **A plate pops** beside the cause, holds, then **flies** into POINTS or
   MULT, which jumps; a note one scale degree higher plays.
5. **Lock** on the first pot: the boxes go solid and a `you` ring expands.
6. **Take-back:** anything after the last pot flies back to its cause in
   `hazard` and shatters.
7. **Slam:** the boxes collide, the product replaces them, the trick name
   shows, and it rolls into the total.

| Event | Box | Value | Plate |
| --- | --- | --- | --- |
| Cue touches a ball | PTS | +5 | HIT · n |
| A ball drops | PTS | +10 × number | n SUNK |
| Cue off a wall | MULT | +1 | WALL |
| Ball drives ball | MULT | +1 | KISS |
| Bank pot | MULT | +2 | BANK |
| Each pot after the first | MULT | +2 | TWO IN ONE |
| × field | MULT | ×2 | ZONE |

---

## 8. The moment catalogue

Every beat of the game, what it must say, and how. Where two treatments are on
trial, both are built and switchable (Settings, or `window.__moment(kind, v)`)
until one is picked; the pick is then recorded here and the other deleted.

### 8.1 Aiming and the strike

| Beat | Treatment | Code |
| --- | --- | --- |
| Aim | Touch anywhere and drag. The full preview, always: cue path with reflections, ghost ball, cue path after contact, struck ball to its landing or pocket, and hazard colouring for scratches and refused pots. | `Player.js` `AimRenderer`, `main.js` |
| Power | **Cue** style (default). A full-length cue stick runs back off the table past the rail, tapered, with cyan lit edges, a lit centre streak, butt bands and a two-layer shadow on the felt and rail. It slides back 1:1 with the thumb (5.2 units over a full draw). The ring around the ball fills both ways as power builds. | `CueStick`, `_ring` |
| Full power | The ring closes and flashes, a burst of light leaves the ball, a MAX POWER badge flies out away from the aim line, a two-note riser plays, the screen jolts and the phone buzzes (18 ms). One threshold: `TRAJECTORY.fullDraw`. | `noteAimPower`, `maxPowerBadge` |
| Strike | The table holds (60 ms) while the stick snaps into the ball, accelerating, with a light smear over the ground it covers. It follows through past the ball, then eases back as it fades. The ball leaves when it is hit, not when the thumb lets go. | `AimRenderer.tick`, `onRelease` |

**On trial (Settings → Stick, Full power, Strike; `TRAJECTORY.stickLook`,
`maxStyle`, `strikeStyle`).** They mix freely.

| | A (today) | B | C |
| --- | --- | --- | --- |
| Stick | **Rod**: dark steel, cyan edges, lit streak, butt bands | **Classic**: maple shaft, white ferrule, blue tip, cyan joint, ebony butt with inlays | **Hardlight**: faint fill, segmented light-cycle edges, white core, faint shadow |
| Full power | **Flash**: ring flash, burst, MAX POWER badge | **Ignite**: heat crawls up from the butt; at full the cue burns, trembles and sparks | **Lock**: the stick kicks and catches; a reticle of four chevrons closes on the ball |
| Strike | **Snap**: follow through, ease back, fade | **Impact**: the table freezes on contact (longer the harder), flash, shockwave, the stick bounces off | **Pierce**: the stick carries on through as a thinning bolt; a bolt runs down the shot line |

### 8.2 Scratch (the cue ball goes down)

It must say: your own ball went in, this shot pays nothing, and here is your
ball back.

**Glitch** (picked). Red alert: the screen edges pulse pink, the table flashes
to a red hue twice, and bands of the screen tear sideways while SCRATCH
resolves out of a jittering cyan and red split. Then a beam of light drops from
the top of the screen onto the spot, a ring closes, and the ball rezzes in. The
light traces the cue stick under the ball, pointing straight up at it, and
hands over to the real stick when the table is ready to aim. The next shot's
heading is set straight up the table.

### 8.3 Freeze frame

What it is: a charge you spend **mid-roll**. Tap while the balls are moving and
time stops. Your cue ball halts where it is and you re-aim it from there. Every
other ball keeps the speed it had and carries on when you release. It costs a
charge, not a shot. "Freeze frame" is the mechanic's name everywhere the player
reads it.

It must say: the frame is taken, time has stopped, nothing else is moving, and
this did not cost a shot.

**Flash and ice** (picked). A white flash, then a wave of ice spreads from the
cue ball, turning the table into a frozen blue monotone as it passes. Each
rolling ball gets a frost hexagon and a dashed arrow showing where it is
headed. FREEZE FRAME is set in ice type. On release the ice shatters outward
from the cue ball and colour floods back. No viewfinder brackets: they
collided with the corner pockets.

**Earning charges** (built). Charges come in halves, capped at 3, and are
earned only by shots that pay (`RULES.freeze`):

| Earned by | Charge |
| --- | --- |
| A combination: a ball you hit knocks another one in | +½ |
| Each extra ball down in the same shot | +½ |
| A shot paying ×5 mult or more | +½ |
| The Freeze frame exit after a table | +2 |
| Bought on the table-clear screen for 15 credits | +1 |

Each earned charge lands as an ice plate above the score boxes ("+½ Freeze
frame · Combination") that flies into the meter, which pulses. In the meter
a half charge fills half a diamond, and only a whole charge freezes.

**Credits** are money, in `credit` violet: 1 per 100 points a table banks
(bonuses included) plus 1 per unspent shot (`RULES.credits`). They count in
on the ledger under the total, and the cash-in button sits under the exits.
The score is never spent.

### 8.4 Table clear (and out of shots)

It must say: the table is done, here is what every shot paid, here is the
total, it is now in your run, and here is what comes next.

**Ledger** (picked). A scanline sweeps up the table and dims it behind itself.
A large chamfered panel drops in with TABLE CLEAR (the panel and the title
arrive together, once). Each shot's line slides in and counts up (P × M = pay)
with a rising note. Bonuses (shots saved, swept in order) land bigger, in heat.
A rule draws across, the TABLE total counts up in large type and slams, then
flies into RUN in the top corner, which counts up and pulses while a "+N
Banked" plate pops under it. Then NEXT TABLE, with the exits rising in as
buttons with a passing sheen.

Out of shots uses the same treatment, with the title in `hazard` and a
"Balls left" row that costs hull. A tap during the count speeds it up. The
exits arrive last, so nothing can be tapped before the count has had its
moment.

**Rule this taught:** a delayed animation holds its first frame (`fill:
'both'`). Without it, an element shows, vanishes and then animates in.

### 8.5 Next table

It must say: one table is gone and the next is here, with its number. The new
table is built while the screen is covered, and its mission is stated only once
the table is fully in view.

**Boot** (picked). The table derezzes into horizontal strips that slide shut
from alternating sides, each with a cyan leading edge. ROOM and the number you
finished appear big and solid; the number rolls over to the next one with a
note and a jolt, and holds. What the exit just gave you ("Freeze frame · +2
charges") is written in heat under it. Then two light-cycles leave the bottom
centre and trace the rails, meeting at the top, and the strips open from the
middle outward on the new table. About 3 s.

### 8.6 Smaller beats (today's treatment)

| Beat | Treatment |
| --- | --- |
| Pot | Pocket flare, shockwave, ball derez into the void, plate "n SUNK". |
| Lock | `you` ring from the boxes, "Locked in", lock chime. |
| Take-back | Plates fly back in `hazard`, struck through, falling notes. |
| Slam | Boxes collide (`ease-slam`), sub drop, jolt, product and trick name. |
| Mission | A banner that waits for a tap: the terms of the table. |

---

## 9. Sound

All synthesised (Web Audio, `src/core/AudioManager.js`). Pitch is quantised to
a minor pentatonic, so a long shot plays a rising melody.

| Event | Voice |
| --- | --- |
| Freeze-frame thud | Sine 180 → 80 Hz |
| PTS arrives | Bright triangle, next pentatonic degree |
| MULT arrives | Filtered saw a fifth above |
| Lock | Thud plus a chime |
| Take-back | The same note falling an octave |
| Slam | Sub drop 120 → 38 Hz under a noise crack |
| Max power | Soft thump under a two-note riser |
| Time stops | Glassy chime falling a fifth over a low hit (`freezeOn`) |
| Time starts | High noise crack and three glass tones (`shatter`) |
| Table out | Falling noise sweep (`derez`) |
| Table in | Rising sweep under three blips (`boot`) |
| Table clear | Sub drop and a root, fifth, octave release |

---

## 10. Voice

- Short and literal. The mission is one sentence: "Sink all 4 · 7 shots".
- Trick names are real pool nouns: BANK, KICK, COMBO, CAROM, TWO IN ONE, RUN
  OUT. Use the pool term when one exists.
- Numbers as they are counted: `+30`, `+1`, `×2` (a real ×, never a letter x).
- No exclamation marks. Big moments get size and light, not punctuation.
- A moment's title is two words or fewer: TABLE CLEAR, SCRATCH, TIME STOPPED.
  Its subline says the consequence: "This shot pays nothing", "No shot spent".

---

## 11. Where the build stands

The bible is the target; this table is the honest gap. Close a row, delete it.
The Tron pass closed the felt, the colour of you, the type and the grid.

| Area | Bible | Build today |
| --- | --- | --- |
| Mines and hazard pads | `hazard` pink with a chevron | Still `#ff5a3d` (`PALETTE.bad`), which `npm run palette` reserves as "danger"; moving it means re-picking the ball inks against pink |
| Boot | Grid draws on, rails trace in, balls flicker up | The Boot transition traces the rails (§8.5); the grid draw-on and ball flicker are not built |
| Rail hit | The rail flashes, then a `mult` light runs along it | The score feed lights the rail it pays from; no run of light yet |
| Fonts in the single-file build | The three faces | `npm run build:single` does not inline `./fonts`, so that build falls back to system faces |
| Old guide | — | `docs/STYLE_GUIDE.md` is superseded and kept only for history |

### What the Tron pass changed

- **The floor** is unlit black (`felt` `#061222` at the centre to `feltDeep`
  `#02050b` at the edge), not lit cloth.
- **The grid** is hair lines every 1.5 units with every third brighter
  (`feltLine`, `gridMajor`). It is a shader that **answers**: pots, a cleared
  table, a scratch and a full-power or impact strike push a ripple through it
  that bends the lines and lights the wavefront (`gridPulse` in `main.js`).
- **Rails** are dark bodies outlined in lit structure (`railGlow`).
- **Pockets** are voids with a `pocketRing` mouth, dimmer than the cue ball.
- **You** is `#22e8ff` everywhere (the table, the HUD, the moments).
- **Type**: Orbitron, Oxanium and Rajdhani are served from `public/fonts`
  (SIL OFL 1.1), so the game needs no network to look right. Titles in Orbitron
  come down a size, because it runs wide.
