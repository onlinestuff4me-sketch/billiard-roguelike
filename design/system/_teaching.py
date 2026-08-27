exec(open('_lib.py').read())

EX = '''    .sheet { width: 1180px; }
    .principles { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; }
    .pr { padding: 15px 16px 17px; border-radius: 6px; background: #080d12; border: 1px solid rgba(234,246,255,0.08); display: flex; flex-direction: column; gap: 6px; }
    .pr .h { font-size: 14px; font-weight: 700; color: #2ef2c4; line-height: 1.25; }
    .pr .d { font-size: 12.5px; font-weight: 500; line-height: 1.45; color: rgba(234,246,255,0.62); text-wrap: pretty; }
    .boards { display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 16px; }
    .bd { display: flex; flex-direction: column; gap: 10px; }
    .bd .n { display: flex; align-items: baseline; gap: 8px; }
    .bd .n .i { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: rgba(234,246,255,0.3); }
    .bd .n .new { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #2ef2c4; }
    .bd .tbl { display: flex; justify-content: center; }
    .bd .card {
      padding: 11px 13px; border-radius: 5px; background: #05070a;
      border-left: 2px solid #2ef2c4; display: flex; flex-direction: column; gap: 4px;
    }
    .bd .card .l1 { font-size: 14px; font-weight: 700; color: #eaf6ff; line-height: 1.25; }
    .bd .card .l1 b { color: #ff5a3d; }
    .bd .card .l1 em { font-style: normal; color: #2ef2c4; }
    .bd .card .l2 { font-size: 12px; font-weight: 500; line-height: 1.38; color: rgba(234,246,255,0.55); }
    .bd .why { font-size: 12.5px; font-weight: 500; line-height: 1.4; color: rgba(234,246,255,0.6); text-wrap: pretty; }
    .bd .why b { color: #eaf6ff; font-weight: 700; }
    .bd .budget { display: flex; gap: 4px; align-items: center; }
    .bd .budget .cue { width: 4px; height: 15px; border-radius: 2px; background: #ffb340; }
    .bd .budget .cue.off { background: rgba(255,179,64,0.16); }
    .bd .budget .lb { font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(234,246,255,0.4); margin-left: 4px; }
    .rr { display: grid; grid-template-columns: 74px 54px 156px 1fr; gap: 14px; align-items: center; padding: 8px 4px; border-bottom: 1px solid rgba(234,246,255,0.08); }
    .rr:last-child { border-bottom: 0; }
    .rr.hd span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(234,246,255,0.4); }
    .rr .rm { font-size: 14px; font-weight: 700; color: #eaf6ff; }
    .rr .th { font-size: 13.5px; font-weight: 700; color: var(--c); }
    .rr .bn { font-size: 13px; font-weight: 500; color: rgba(234,246,255,0.6); }
    .chips { display: flex; gap: 14px; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 11px; border-radius: 4px; background: rgba(5,7,10,0.9); border: 1px solid var(--c); font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--c); }
'''

W, H = 340, 560

def mini(contents, px=190):
    """A lesson table at the same drawing as the real one, just smaller."""
    return (f'<svg width="{px}" height="{int(px * 620 / 400)}" viewBox="-30 -30 400 620" '
            f'xmlns="http://www.w3.org/2000/svg">{table(W, H, extra=contents)}</svg>')

def aim(x1, y1, x2, y2, dashed=False):
    d = ' stroke-dasharray="10 8"' if dashed else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{CUE}" stroke-width="3.4" opacity="0.85"{d}/>'

def ghost(x, y, r=17):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="#8ffcff" stroke-width="2.4" stroke-dasharray="5 5" opacity="0.9"/>'

def path_to(x1, y1, x2, y2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{BONE}" stroke-width="3" stroke-dasharray="9 7" opacity="0.55"/>'

# --- THE FIVE BOARDS, DRAWN FROM THE GAME'S OWN LESSON DATA -------------------
#
# These used to be hand-placed and they drifted the moment a board was retuned.
# They are now projected straight out of src/data/lessons.json, so a sheet that
# disagrees with the game is a bug in one file rather than a difference of
# opinion between two.
import json, math, os

LESSONS = json.load(open(os.path.join(os.path.dirname(os.path.abspath('_teaching.py')),
                                      '../../src/data/lessons.json')))
if isinstance(LESSONS, dict):
    LESSONS = LESSONS['lessons']
LESSONS = {l['id']: l for l in LESSONS}

# The real table is 18 x 32 world units with the cue spawning at z = +6.4;
# pieces carry RULES.pieceScale = 0.78. World -> mini is a straight linear map.
AW, AH = 18.0, 32.0
SPAWN = (0.0, 6.4)
BR = 0.4836 * 2          # centre-to-centre at contact, in world units
SLOT = {'tl': 0, 'tr': 1, 'ml': 2, 'mr': 3, 'bl': 4, 'br': 5}
POCKET = {'tl': (-8.1, -15.1), 'tr': (8.1, -15.1), 'ml': (-8.1, 0.0),
          'mr': (8.1, 0.0), 'bl': (-8.1, 15.1), 'br': (8.1, 15.1)}

def mx(x): return (x + AW / 2) / AW * W
def my(z): return (z + AH / 2) / AH * H
def mr(r): return r / AW * W

# Positions are true to the game; the PIECES are drawn 1.7x so a ball reads as
# a ball at thumbnail size. Everything that matters for judging a board — the
# lines, the angles, which pocket is lit — is unexaggerated.
GAIN = 1.7

def draw(lid):
    """One lesson board: the cue, the shot it teaches, and nothing else."""
    L = LESSONS[lid]
    call = L.get('call')
    pk = POCKET[call]
    target = L['enemies'][0]
    # The ghost: where the cue ball's centre sits at contact for this pot.
    dx, dz = pk[0] - target['x'], pk[1] - target['z']
    d = math.hypot(dx, dz) or 1
    gx, gz = target['x'] - dx / d * BR, target['z'] - dz / d * BR

    out = []
    for w in L.get('obstacles', []):
        out.append(wall(mx(w['x']), my(w['z']), mr(w['hw'] * 2), mr(w['hh'] * 2)))
    for o in L.get('objects', []):
        out.append(felt_object(mx(o['x']), my(o['z']), mr(1.1) * GAIN,
                               o['kind'] != 'mine', 'x2' if o['kind'] == 'double' else o['kind']))
    out.append(aim(mx(SPAWN[0]), my(SPAWN[1]), mx(gx), my(gz)))
    out.append(ghost(mx(gx), my(gz), mr(0.48) * GAIN))
    out.append(path_to(mx(target['x']), my(target['z']), mx(pk[0]), my(pk[1])))
    for e in L['enemies']:
        out.append(ball(mx(e['x']), my(e['z']), mr(0.48) * GAIN, e['type'], str(e['number'])))
    out.append(cue_ball(mx(SPAWN[0]), my(SPAWN[1]), mr(0.48) * GAIN))
    return ''.join(out), SLOT[call]

def board_svg(lid, px=190):
    contents, lit = draw(lid)
    return (f'<svg width="{px}" height="{int(px * 620 / 400)}" viewBox="-30 -30 400 620" '
            f'xmlns="http://www.w3.org/2000/svg">{table(W, H, lit=lit, extra=contents)}</svg>')

def budget(left, total):
    cues = ''.join(f'<span class="cue{"" if i < left else " off"}"></span>' for i in range(total))
    return f'<div class="budget">{cues}<span class="lb">{left} shots · {total - left + left} balls</span></div>'

def board(i, new, tbl, l1, l2, why, bud=None):
    b = f'<div class="budget">{bud}</div>' if bud else ''
    return f'''<div class="bd">
      <div class="n"><span class="i">{i}</span><span class="new">{new}</span></div>
      <div class="tbl">{tbl}</div>
      <div class="card"><span class="l1">{l1}</span><span class="l2">{l2}</span></div>
      {b}
      <div class="why">{why}</div>
    </div>'''

def cues(on, off, label):
    c = ''.join('<span class="cue"></span>' for _ in range(on)) + ''.join('<span class="cue off"></span>' for _ in range(off))
    return c + f'<span class="lb">{label}</span>'

boards = (
  board('01', 'pocket', board_svg('pocket'),
        'Knock the <b>3</b> in',
        'Press anywhere and pull back, like a cue.',
        'This board used to put the cue, the ball and the pocket on one straight line — and a square hit sends your own ball in behind it, so the first thing the game taught was how to scratch. It is an <i>angle</i> now, with the cue already resting on the potting line: pull straight back and it drops while your ball rolls clear. <b>Measured: 18 potting shots, none of them a scratch, at any power.</b>')
  + board('02', 'the angle', board_svg('angle'),
        'Now <em>angle</em> it in',
        'The white circle is where your ball will be when it touches the 2.',
        'Same board, but the cue now rests pointing straight <i>at</i> the ball, so the player has to find the angle themselves. The copy names only what is on screen: it used to say "aim at the ghost" and "slide it", and nothing had ever told anyone what a ghost was. <b>Measured window: 3.2° of aim, scratch-free at every power.</b>')
  + board('03', 'the budget', board_svg('budget'),
        'Four balls. <em>Three shots.</em>',
        'Knock them all in. Watch how fast three shots goes.',
        'This board used to demand two balls down in a <i>single</i> stroke, and brute-forcing every heading at every power found seven such shots in 2160 — the best re-tuned pair only widened that to 1.5°. Potting one ball already needs 1–3°; needing the follow-through to drop a second is a miracle, not a lesson. <b>The budget is now taught by counting: the rack stays down between strokes and the count is on screen.</b>',
        cues(3, 0, 'four balls'))
  + board('04', 'walls', board_svg('walls'),
        'The wall is <em>solid</em>',
        'Knock the <b>3</b> into the lit pocket. Nothing passes through a wall.',
        'This board used to put the 3 <i>behind</i> the barrier, so the only route was a bank — and a swept measurement found one potting shot in 2160. A banked pot needs better than half a degree. The wall now stands beside the shot, not across it. <b>Measured window: 3.5°, the widest on the table.</b>')
  + board('05', 'green &amp; red', board_svg('green-red'),
        'Take the <em>green</em>. Miss the <b>red</b>.',
        'Green is always good. Red always costs you.',
        'Both colours on one table: the green sits <i>on</i> the line to the 2, the red beside it, so the law is learned as a pair and as a decision. <b>32 of the 39 scratch-free potting shots also collect the green.</b>')
)

ramp = [
  ('Room 1', LIP, 'The contract', 'Knock every ball in. The shots you save are points.'),
  ('Room 2', GOOD, 'The double', 'Hit it and the shot is worth twice as much.'),
  ('Room 3', BAD, 'The mine', 'Only bites your ball. Go around.'),
  ('Room 4', GOOD, 'The freeze', 'Three charges. Tap while the table is still moving.'),
  ('Room 5', BONE, 'The 8 goes last', 'Knock it in early and it comes straight back.'),
  ('Room 6', GOOD, 'The upgrade', 'Buys a free pick at the door.'),
  ('Room 7', BAD, 'The kicker', 'Hit it and the nearest ball comes back at you.'),
  ('Room 9', SOLID, 'Fewer shots', 'Every shot has to knock one in from here.')
]
rrows = '<div class="rr hd"><span>Room</span><span></span><span>Arrives</span><span>Banner, once, on entry</span></div>'
for room, colour, name, banner in ramp:
    dot = f'<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="6" fill="{colour}"/></svg>'
    rrows += (f'<div class="rr" style="--c: {colour}"><span class="rm">{room}</span><span>{dot}</span>'
              f'<span class="th">{name}</span><span class="bn">{banner}</span></div>')

body = f'''<div class="sheet">
  <div>
    <div class="tag">Table language · teaching it</div>
    <h2 class="title">Five boards. The first one is already the whole game.</h2>
    <p class="lede">No board teaches a control in isolation. Board one is a real shot into a real pocket — the gesture and the rule arrive together, because a player who has only been told to "hit a ball" has not yet been told what the game is. Everything after that adds exactly one idea, and <b>two of the five teach by constraint rather than by card.</b></p>
  </div>

  <div class="boards">{boards}</div>

  <div class="principles">
    <div class="pr"><span class="h">One new idea per board</span><span class="d">A board that introduces two teaches neither. If a card needs a word the player has not met, that word is what the board exists for.</span></div>
    <div class="pr"><span class="h">Teach the budget by making it bite</span><span class="d">Board 03 has no explanation on it. Four balls and three shots is the lesson, and the player works out what that means faster than any card could tell them.</span></div>
    <div class="pr"><span class="h">Teach a pair as a pair</span><span class="d">Green and red arrive on the same table, on the two routes the player is choosing between. Either one alone is just a coloured circle.</span></div>
    <div class="pr"><span class="h">The board holds only its subject</span><span class="d">Empty felt around it. A lesson has to be able to promise that the table contains the thing it is about and nothing else.</span></div>
    <div class="pr"><span class="h">Unfailable, but not free</span><span class="d">Running out of shots on board 03 re-racks it with a nudge — no hull, no score, no run lost. The budget is real; the consequence is not, yet.</span></div>
    <div class="pr"><span class="h">Name it as it happens</span><span class="d">The text that flies off the table uses the word from the card, in the same second. The second sighting is what makes it stick.</span></div>
  </div>

  <div class="panel">
    <h3>What the tutorial no longer covers, and where it went</h3>
    <p>The <b>8 goes last</b> was a board and is now a room banner — it is a rule about balls the player already knows, so it does not need a table of its own. <b>Freeze</b> was never a board and stays a room arrival, because it cannot be taught until there is a shot worth interrupting. Everything else that used to have a board has been folded into the five above.</p>
  </div>

  <div class="panel">
    <h3>After the tutorial: one arrival per room</h3>
    <div>{rrows}</div>
  </div>

  <div class="panel">
    <h3>The first-sighting chip</h3>
    <p>Anchored beside the object in world space, three seconds, once per type per run. It names the thing and what it does in the words the lesson used — so a player who skipped the tutorial still meets every word once, in context, the moment it first matters.</p>
    <div class="chips">
      <span class="chip" style="--c: {GOOD}">Double &nbsp;·&nbsp; hit it, the shot is worth twice as much</span>
      <span class="chip" style="--c: {BAD}">Mine &nbsp;·&nbsp; stay off it</span>
      <span class="chip" style="--c: {GOOD}">Extra shot &nbsp;·&nbsp; +1 this room</span>
      <span class="chip" style="--c: {BAD}">Kicker &nbsp;·&nbsp; sends a ball back at you</span>
    </div>
  </div>
</div>'''

write('Teaching.dc.html', EX, body)
print('teaching ok')
