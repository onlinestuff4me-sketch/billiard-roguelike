# -*- coding: utf-8 -*-
exec(open('_gen.py').read())

def goal(n, title, body, test):
    return (f'<div class="goal"><span class="gn">{n}</span>'
            f'<div><div class="gt">{title}</div>'
            f'<div class="gb">{body}</div>'
            f'<div class="gtest"><span>Passes when</span>{test}</div></div></div>')

def rule(h, d):
    return f'<div class="rule"><div class="rh">{h}</div><div class="rd">{d}</div></div>'

EXTRA = f'''
    .goals {{ display: grid; grid-template-columns: repeat(1, minmax(0,1fr)); gap: 10px; }}
    .goal {{ display: flex; gap: 14px; padding: 15px 17px; border-radius: 8px;
             background: #080d12; border: 1px solid rgba(234,246,255,.08); }}
    .gn {{ font-size: 22px; font-weight: 700; color: {LIP}; line-height: 1; min-width: 26px; }}
    .gt {{ font-size: 16px; font-weight: 700; color: {BONE}; }}
    .gb {{ font-size: 13.5px; line-height: 1.45; color: rgba(234,246,255,.6); margin-top: 4px; text-wrap: pretty; }}
    .gtest {{ margin-top: 9px; font-size: 12.5px; color: {GOOD}; display: flex; gap: 8px; align-items: baseline; }}
    .gtest span {{ font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
                   color: {CARD_EYEBROW}; white-space: nowrap; }}
    .rules {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }}
    .rule {{ padding: 13px 15px; border-radius: 6px; background: #05070a;
             border-left: 2px solid {GOOD}; }}
    .rh {{ font-size: 13.5px; font-weight: 700; color: {GOOD}; }}
    .rd {{ font-size: 12.5px; line-height: 1.45; color: rgba(234,246,255,.6); margin-top: 4px; text-wrap: pretty; }}
    .mx {{ width: 100%; border-collapse: collapse; margin-top: 6px; }}
    .mx th {{ text-align: left; font-size: 9.5px; font-weight: 700; letter-spacing: .18em;
              text-transform: uppercase; color: {CARD_EYEBROW}; padding: 0 12px 8px 0; }}
    .mx td {{ font-size: 13px; color: rgba(234,246,255,.72); padding: 9px 12px 9px 0;
              border-top: 1px solid rgba(234,246,255,.08); vertical-align: top; }}
    .mx td b {{ color: {BONE}; }}
    .pick {{ margin-top: 26px; padding: 18px 20px; border-radius: 8px;
             background: rgba(46,242,196,.06); border: 1px solid rgba(46,242,196,.3); }}
'''

s = head('Main', EXTRA)
s += f'''<div class="sheet">
<span class="kicker">Sink the Rack &middot; coaching system</span>
<h1>Teaching one shot at a time</h1>
<p class="lede">Six boards, each with one idea on it. What follows is what a coached board owes the player, the rules that follow from it, and three directions for the component that carries it. Every board is already measured for playability by <code style="color:{CYAN}">npm&nbsp;run&nbsp;verify</code>; this is about whether the player can <em>understand</em> the board, which no sweep can tell us.</p>

<h2>What a board owes the player</h2>
<div class="goals">
{goal('1','One line, and it names the target and the pocket',
      'The instruction is a single sentence a player can hold while aiming. Not a paragraph, not two facts, not a rule and an example. If a board needs two sentences, the board is teaching two things and should be two boards.',
      'A stranger can restate the goal after reading it once.')}
{goal('2','The board points, it does not describe',
      'A highlighted region says which pieces the sentence is about, the lit pocket says where they go, and where a route is worth showing, the guide line shows it &mdash; including the ricochet and what happens to each ball after contact.',
      'Cover the text and the goal is still guessable from the table alone.')}
{goal('3','Coaching stays up until the player acts, and never covers the act',
      'The instruction is readable for as long as it is needed and out of the way for as long as the shot lasts. Nothing expires on a timer; nothing sits on the felt the shot will cross.',
      'At every moment of a shot, both the words and the balls they name are visible.')}
{goal('4','A miss is explained, and the next attempt is coached',
      'Failure states what happened in the player&rsquo;s terms &mdash; which ball, which pocket, what went in that should not have &mdash; and then shows, on the table, what to do differently. The board resets and the player goes again.',
      'The correction names a cause, not just an outcome, and the fix is visible on the felt.')}
{goal('5','Success is celebrated and clearly over',
      'A passed board says so, in that lesson&rsquo;s own words, and offers exactly one thing to do next. The table stops accepting shots so the finished board cannot be mistaken for a live one.',
      'There is exactly one control on screen, and it moves forward.')}
</div>

<h2>Rules that follow</h2>
<div class="rules">
{rule('One voice at a time',
      'While a board is coaching, the HUD banner stands down. Two components reporting one event is worse than either alone.')}
{rule('Nothing expires',
      'No coaching text is on a timer. It is replaced by the next thing that happens, or dismissed by the player.')}
{rule('Never a silent stroke',
      'Every stroke gets a verdict. The absence of a response is indistinguishable from the game being broken, so the absence of a verdict is itself a verdict.')}
{rule('Judged at rest',
      'A rep is judged when the table stops, not while it is still moving &mdash; so a stroke that pots and then scratches is a miss, and says why.')}
{rule('Two highlight colours, fixed',
      'Bone-white is the called pocket. Green is a thing that helps you and the way forward. Red is a thing that costs you and a miss. Nothing else gets a highlight.')}
{rule('Say what is on screen',
      'Only words for things the player can see and has been shown: the white circle, the lit pocket, the 4. No jargon the game has not taught.')}
</div>

<h2>The four states</h2>
<table class="mx">
<tr><th style="width:120px">State</th><th style="width:180px">Trigger</th><th>What it must carry</th></tr>
<tr><td><b>Instruct</b></td><td>Board loads</td><td>The one line, the highlighted region, the lit pocket, the resting aim placed near a real solution.</td></tr>
<tr><td><b>Aiming</b></td><td>Thumb down</td><td>The instruction, still readable, out of the shot. The routes: your ball, the struck ball, and where each ends.</td></tr>
<tr><td><b>Missed</b></td><td>Table at rest, rep not met</td><td>What happened, in one line. The line that was played, and the line to play instead. Board resets.</td></tr>
<tr><td><b>Complete</b></td><td>Table at rest, rep met</td><td>The lesson&rsquo;s own praise, the felt dimmed, shots refused, one CTA forward.</td></tr>
</table>

<div class="pick">
<div style="font-size:15px;font-weight:700;color:{GOOD};">Recommendation &mdash; Option C, the rail and the route</div>
<p class="lede" style="margin-top:7px;">It is the only one of the three that satisfies goal 3 <em>by construction</em> rather than by animating out of the way, and it leans on the two pieces the game already has: the chained route lines and the called-pocket glow. Option A is the cheapest change and the weakest link between word and object; Option B is the strongest link and the most code, and its placement solve is the part most likely to misbehave on a board nobody authored. Worth stealing from B either way: the endpoint tags in C are its leader-line idea, minus the solve.</p>
</div>
</div>'''
write('Main.dc.html', s + TAIL)
