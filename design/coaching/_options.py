# -*- coding: utf-8 -*-
exec(open('_gen.py').read())

# The board every option is drawn against: lesson 2, the combination.
BALLS = [(.82, .30, '1', 'solid'), (.44, .58, '4', 'solid')]
CUE   = (.28, .78)
LIT   = ('mr',)
ROUTE_CUE  = ('cue', CUE, (.44, .58))
ROUTE_BALL = ('ball', (.44, .58), (.82, .30))
ROUTE_IN   = ('ball', (.82, .30), (1, .5))
ROUTE_BAD  = ('bad', (.44, .58), (1, .5))

# ---------------------------------------------------------------- OPTION A
def cardA(step, title, sub, tone='', cta=None, compact=False):
    edge = {'good': GOOD, 'bad': BAD}.get(tone, '')
    ring = f'box-shadow:0 0 0 2.5px {edge},0 6px 0 rgba(0,0,0,.35),0 10px 30px rgba(0,0,0,.55);' if edge else 'box-shadow:0 6px 0 rgba(0,0,0,.35),0 10px 30px rgba(0,0,0,.55);'
    if compact:
        return (f'<div style="position:absolute;left:50%;top:8px;transform:translateX(-50%);'
                f'width:88%;padding:6px 12px;border-radius:9px;background:rgba(242,244,246,.93);'
                f'color:{CARD_INK};font-size:12px;font-weight:700;text-align:center;'
                f'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;{ring}">{title}</div>')
    btn = (f'<div style="margin:10px auto 0;width:max-content;padding:8px 20px;border-radius:999px;'
           f'background:{GOOD};color:#04120e;font-size:14px;font-weight:800;letter-spacing:.04em;">{cta}</div>') if cta else ''
    return (f'<div style="position:absolute;left:50%;top:8px;transform:translateX(-50%);width:88%;'
            f'padding:9px 14px 11px;border-radius:12px;background:{CARD_BG};color:{CARD_INK};{ring}">'
            f'<div style="font-size:9px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:{CARD_EYEBROW};">{step}</div>'
            f'<div style="font-size:16px;font-weight:700;line-height:1.14;margin-top:2px;">{title}</div>'
            f'<div style="font-size:11.5px;line-height:1.3;color:{CARD_SUB};margin-top:3px;">{sub}</div>{btn}</div>')

def wrap(svg, overlay):
    return f'<div style="position:relative;width:{W}px;height:{H}px;">{svg}{overlay}</div>'

optA = head('Option A', '')
optA += f'''<div class="sheet">
<span class="kicker">Option A</span>
<h1>The docked card</h1>
<p class="lede">Today's card, made honest. The words stay in the band under the HUD, clear of everything but the topmost sliver of felt; while a thumb is down they collapse to a <b>single readable line</b> instead of fading to nine percent, so the instruction is legible at the exact moment it is being followed. The felt carries the focus ring and the lit pocket.</p>
<h2>The four states</h2>
<div class="frames">
{frame('1 · Instruct',
  wrap(table(BALLS, CUE, lit=LIT, ring=(.63,.44,58), routes=[]),
       cardA('Lesson 2 of 6','Sink the <b style="color:'+BAD+'">1</b> in the side pocket','Hit the <b>4</b> into it &mdash; they already line up.')),
  'Full card. Ring around the pair the sentence is about, pocket lit. Nothing on the felt the shot needs.')}
{frame('2 · Aiming',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_CUE, ROUTE_BALL, ROUTE_IN]),
       cardA('','Sink the <b>1</b> in the side pocket','',compact=True)),
  'One line, pinned to the top edge. The ring drops away — the routes now say what the ring said, and say it better.')}
{frame('3 · Missed',
  wrap(table(BALLS, CUE, lit=LIT, routes=[ROUTE_BAD, ('ghost',(.44,.58),(.82,.30)), ('ghost',(.82,.30),(1,.5))]),
       cardA('Try again','The <b style="color:'+BAD+'">4</b> went in, not the <b style="color:'+BAD+'">1</b>','Aim through the 4 <b>at the 1</b>, not at the pocket.','bad')),
  'Red edge, names what happened, and the felt draws both lines &mdash; the one played in red, the one to play in ghost. The fix is shown, not only described.')}
{frame('4 · Complete',
  wrap(table([(.44,.58,'4','solid')], CUE, lit=LIT, dim=True),
       cardA('Lesson 2 complete','One ball moved another','That is a combination.','good','Next lesson →')),
  'Felt dims, table stops taking shots, one green CTA. The board is unmistakably over.')}
</div>
<h2>Why / why not</h2>
<div class="row" style="margin-top:2px;">
  <p class="lede" style="flex:1"><b style="color:{GOOD}">For.</b> Cheapest to build — it is the component that already exists. Room for a second line on the boards that genuinely need one &mdash; though goal 1 says most should not want it. The collapse-to-one-line is a small, contained change.</p>
  <p class="lede" style="flex:1"><b style="color:{BAD}">Against.</b> The words are always somewhere the eye is not. The player reads at the top, then looks down to act, and the link between sentence and object is theirs to make. The band costs 13–25% of the screen permanently, and its lower edge does sit over the first few pixels of felt.</p>
</div>
</div>'''
write('OptionA.dc.html', optA + TAIL)
