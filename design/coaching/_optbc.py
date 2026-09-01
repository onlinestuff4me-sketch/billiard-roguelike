# -*- coding: utf-8 -*-
exec(open('_options.py').read())

def chip(u, v, html, tone='', anchor=None, wide=176):
    """A small dark chip on the felt, optionally with a leader line to a ball."""
    edge = {'good': GOOD, 'bad': BAD}.get(tone, 'rgba(29,111,122,.9)')
    fx, fy, fw, fh = 16, 60, W - 32, H - 84
    x, y = fx + u * fw, fy + v * fh
    lead = ''
    if anchor:
        ax, ay = fx + anchor[0] * fw, fy + anchor[1] * fh
        lead = (f'<svg style="position:absolute;left:0;top:0;pointer-events:none" width="{W}" height="{H}">'
                f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{ax:.0f}" y2="{ay:.0f}" stroke="{edge}" '
                f'stroke-width="1.4" stroke-dasharray="3 3" opacity=".85"/></svg>')
    return (lead + f'<div style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;transform:translate(-50%,-50%);'
            f'width:{wide}px;padding:7px 11px;border-radius:8px;background:rgba(5,7,10,.92);'
            f'border:1.5px solid {edge};color:{BONE};font-size:11.5px;line-height:1.3;text-align:center;">{html}</div>')

optB = head('Option B', '')
optB += f'''<div class="sheet">
<span class="kicker">Option B</span>
<h1>The on-felt callout</h1>
<p class="lede">No card at all. The instruction is a small chip <b>on the table, tethered to the thing it names</b> by a leader line, and it moves as the lesson moves. There is no gap between the sentence and its subject, so nothing has to be carried across the screen by the player.</p>
<h2>The four states</h2>
<div class="frames">
{frame('1 &middot; Instruct',
  wrap(table(BALLS, CUE, lit=LIT),
       chip(.30,.28,'Sink the <b style="color:'+SOLID+'">1</b> in the side pocket, off the <b style="color:'+SOLID+'">4</b>', anchor=(.44,.58))),
  'The chip sits in dead space and points at the ball. Placement is computed from the board &mdash; it goes where no route will run.')}
{frame('2 &middot; Aiming',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_CUE, ROUTE_BALL, ROUTE_IN]),
       chip(.24,.16,'into the <b style="color:'+SOLID+'">1</b>', anchor=None, wide=104)),
  'It shrinks and slides clear of the drawn route rather than fading. Still on the felt, still readable, never on the line.')}
{frame('3 &middot; Missed',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_BAD, ('ghost',(.44,.58),(.82,.30)), ('ghost',(.82,.30),(1,.5))]),
       chip(.66,.80,'You aimed at the pocket. Aim <b style="color:'+GOOD+'">through the 4 at the 1</b>.','bad', anchor=(.44,.58))),
  'The correction is tethered to the ball that was mis-hit, names the cause rather than the outcome, and the ghost route beside it is the line to play instead.')}
{frame('4 &middot; Complete',
  wrap(table([(.44,.58,'4','solid')], CUE, lit=LIT, dim=True),
       chip(.5,.40,'<div style="font-size:13px;font-weight:700;color:'+GOOD+'">One ball moved another</div>'
            '<div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(234,246,255,.5);margin-top:3px">Lesson 2 complete</div>'
            '<div style="margin-top:7px;padding:7px 16px;border-radius:999px;background:'+GOOD+';color:#04120e;font-size:13px;font-weight:800;">Next lesson &rarr;</div>','good', wide=190)),
  'The chip becomes the CTA in place. One object the whole lesson through: instruction, correction, reward.')}
</div>
<h2>Why / why not</h2>
<div class="row" style="margin-top:2px;">
  <p class="lede" style="flex:1"><b style="color:{GOOD}">For.</b> Strongest possible link between word and object &mdash; the sentence is attached to the ball. Frees the whole top band. The correction can be placed at the scene of the mistake, which no card can do.</p>
  <p class="lede" style="flex:1"><b style="color:{BAD}">Against.</b> It trades the focus ring for the tether &mdash; one ball gets pointed at, a region does not &mdash; so a board about a pair is harder to frame. Text on felt competes with the balls, and every chip needs a placement solve per board and per aim: the most code of the three, and the most that can go wrong on a table nobody authored.</p>
</div>
</div>'''
write('OptionB.dc.html', optB + TAIL)

def band(text, tone='', cta=None, prog='2 / 6'):
    edge = {'good': GOOD, 'bad': BAD}.get(tone, 'rgba(29,111,122,.55)')
    ink = {'good': GOOD, 'bad': BAD}.get(tone, BONE)
    right = (f'<div style="padding:5px 14px;border-radius:999px;background:{GOOD};color:#04120e;'
             f'font-size:12px;font-weight:800;white-space:nowrap;">{cta}</div>') if cta else \
            f'<div style="font-size:10px;font-weight:700;letter-spacing:.18em;color:{CARD_EYEBROW};white-space:nowrap;">{prog}</div>'
    return (f'<div style="position:absolute;left:0;top:0;width:100%;height:44px;display:flex;align-items:center;'
            f'gap:10px;padding:0 12px;box-sizing:border-box;background:rgba(5,7,10,.94);'
            f'border-bottom:1.5px solid {edge};">'
            f'<div style="flex:1;font-size:13px;font-weight:700;line-height:1.15;color:{ink};'
            f'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{text}</div>{right}</div>')

def tag(u, v, text, col):
    fx, fy, fw, fh = 16, 60, W - 32, H - 84
    x, y = fx + u * fw, fy + v * fh
    return (f'<div style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;transform:translate(-50%,-50%);'
            f'padding:2px 7px;border-radius:5px;background:rgba(5,7,10,.9);border:1px solid {col};'
            f'color:{col};font-size:9.5px;font-weight:700;letter-spacing:.1em;white-space:nowrap;">{text}</div>')

optC = head('Option C', '')
optC += f'''<div class="sheet">
<span class="kicker" style="color:{GOOD}">Option C &middot; built</span>
<h1>The rail and the route</h1>
<p class="lede">One line of type on a fixed band above the felt, and everything else carried by <b>the routes already drawn on the table</b>: the aim line, the ricochet, the ball's own path, each ending in a small tag that names where it goes. The band never moves and never overlaps play, so it needs no fade, no collapse and no placement solve.</p>
<h2>The four states</h2>
<div class="frames">
{frame('1 &middot; Instruct',
  wrap(table(BALLS, CUE, lit=LIT, ring=(.63,.44,58)),
       band('Sink the <b style="color:'+SOLID+'">1</b> in the side pocket, off the <b style="color:'+SOLID+'">4</b>')),
  'One sentence, one fixed place. The ring says which pair, the lit pocket says where.')}
{frame('2 &middot; Aiming',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_CUE, ROUTE_BALL, ROUTE_IN]),
       band('Sink the <b style="color:'+SOLID+'">1</b> in the side pocket, off the <b style="color:'+SOLID+'">4</b>')
       + tag(.80,.68,'&rarr; SIDE POCKET', SOLID) + tag(.22,.93,'YOUR BALL', CYAN)),
  'Unchanged &mdash; it was never in the way. The routes take over the explaining, and the tags name each endpoint so the plan reads without prose.')}
{frame('3 &middot; Missed',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_BAD, ('ghost',(.44,.58),(.82,.30))]),
       band('You aimed at the pocket, not through the <b>4</b>','bad')
       + tag(.70,.40,'AIM HERE INSTEAD', GOOD)),
  'Band turns red and states the fact. On the felt: what was played in red, what to play in ghost &mdash; the fix is shown beside the mistake.')}
{frame('4 &middot; Complete',
  wrap(table([(.44,.58,'4','solid')], CUE, lit=LIT, dim=True),
       band('One ball moved another','good','Next &rarr;')),
  'The band goes green and grows the CTA. Same object, same place, all four states &mdash; nothing appears or disappears.')}
</div>
<h2>Why / why not</h2>
<div class="row" style="margin-top:2px;">
  <p class="lede" style="flex:1"><b style="color:{GOOD}">For.</b> Satisfies &ldquo;never obstruct the table&rdquo; by construction rather than by animation. One component, four states, no placement logic. The route drawing and the called-pocket glow already exist &mdash; this mostly wires up what is built.</p>
  <p class="lede" style="flex:1"><b style="color:{BAD}">Against.</b> One line is a hard budget; a board that needs two sentences cannot have them, and the endpoint tags have to carry the rest. The band costs a fixed 46px whether or not the lesson needs it.</p>
</div>
<h2>As built</h2>
<p class="lede">Shipped across all six boards &mdash; see <b>docs/COACHING.md</b>. Three things changed on contact with the real table. The band holds <b>two wrapped lines</b> of one sentence rather than one visual line: at 390px a sentence with any substance wraps, and a 64-character budget with a fixed height is the honest version of the same rule. Its position is <b>measured from the live pocket geometry</b> on every resize, not set as a percentage &mdash; the camera frames the felt edge to edge, so there is exactly one empty strip and it has to be found rather than guessed. And the <b>hull readout hides during a lesson</b>, because the two far corner pockets live under it and two boards call one of them.</p>
</div>'''
write('OptionC.dc.html', optC + TAIL)
