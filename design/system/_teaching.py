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

# --- 01: straight in ---------------------------------------------------------
# Cue, ball and pocket are collinear: the only thing being tested is the draw.
b1 = (aim(170, 440, 252, 230) + path_to(264, 198, 336, 12)
      + ball(264, 198, 17, 'solid', '3') + cue_ball(170, 440, 17))

# --- 02: on an angle ---------------------------------------------------------
b2 = (aim(170, 450, 151, 289) + ghost(151, 289) + path_to(170, 260, 334, 14)
      + ball(170, 260, 17, 'solid', '2') + ball(280, 380, 17, 'stripe', '5')
      + cue_ball(170, 450, 17))

# --- 03: four balls, three strokes ------------------------------------------
b3 = (aim(170, 460, 232, 132) + path_to(250, 110, 300, 45) + path_to(300, 45, 336, 12)
      + ball(250, 110, 17, 'solid', '1') + ball(300, 45, 17, 'solid', '4')
      + ball(80, 150, 17, 'stripe', '6') + ball(95, 315, 17, 'solid', '2')
      + cue_ball(170, 460, 17))

# --- 04: round the barrier ---------------------------------------------------
# The direct line is a vertical through the barrier, so the only way in is a
# bounce. Solved for a bank off the left cushion that arrives on the ghost.
b4 = (aim(170, 450, 17, 317) + aim(17, 317, 147, 205, True) + ghost(147, 205)
      + path_to(170, 180, 334, 14)
      + wall(170, 330, 150, 22)
      + ball(170, 180, 17, 'solid', '3') + cue_ball(170, 450, 17))

# --- 05: green and red -------------------------------------------------------
# The green sits on the line to the 2; the red sits on the other route a
# player might take. Both are a choice, not decoration.
b5 = (aim(170, 455, 212, 209) + path_to(230, 180, 334, 14)
      + felt_object(197, 300, 30, True, 'x2') + felt_object(95, 300, 28, False, 'mine')
      + ball(230, 180, 17, 'solid', '2') + ball(88, 175, 17, 'stripe', '5')
      + cue_ball(170, 455, 17))

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
  board('01', 'pocket', mini(b1),
        'Knock the <b>3</b> in',
        'Press anywhere and pull back, like a cue.',
        'The cue, the pocket and the one rule the game runs on, in a single shot. Everything is already on a straight line, so the only thing being tested is the gesture. <b>Hitting a ball never breaks it — a pocket is the only way one leaves.</b>')
  + board('02', 'the angle', mini(b2),
        'Knock the <b>2</b> in <em>from an angle</em>',
        'Hit its far side. The white circle is where your ball ends up.',
        'The cue rests pointing straight at the ball, and straight is wrong — it would go into the top wall. The player has to move off the obvious line themselves. <b>The second ball is there so the table is a choice, not a rail.</b>')
  + board('03', 'the budget', mini(b3),
        'Four balls. <em>Three shots.</em>',
        'One shot has to knock two in.',
        'No card explains the budget, because the budget explains itself: the numbers do not add up and the player has to find the shot that does. <b>The first board that requires a plan.</b>',
        cues(3, 0, 'four balls'))
  + board('04', 'walls', mini(b4),
        '<em>Go round</em> the barrier',
        'The <b>3</b> is blocked. Bounce off a side wall.',
        'The first thing on the table that is in the way rather than in play. Ends on the fact that makes walls worth using rather than tolerating: <b>every wall you bounce off is worth more points.</b>')
  + board('05', 'green &amp; red', mini(b5),
        'Take the <em>green</em>. Miss the <b>red</b>.',
        'Green is always good. Red is always bad.',
        'Both colours on one table, one on each of the two obvious routes, so the law is learned as a pair and as a decision. <b>Nothing else new is on this board.</b>')
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
