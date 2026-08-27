exec(open('_lib.py').read())

EX = '''    .sheet { width: 1060px; }
    .q { display: grid; grid-template-columns: 46px 1fr; gap: 20px; align-items: start; }
    .q .num { font-size: 30px; font-weight: 700; line-height: 1; color: rgba(234,246,255,0.18); }
    .q .head { font-size: 22px; font-weight: 700; color: #eaf6ff; line-height: 1.15; }
    .q .ans { margin: 7px 0 0; font-size: 14px; font-weight: 500; line-height: 1.5; color: rgba(234,246,255,0.68); text-wrap: pretty; }
    .q .ans b { color: #eaf6ff; font-weight: 700; }
    .q .ans em { font-style: normal; color: #2ef2c4; font-weight: 600; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 16px; }
    .sp { display: flex; flex-direction: column; gap: 7px; align-items: center; width: 122px; }
    .sp .art { height: 100px; display: flex; align-items: center; justify-content: center; }
    .sp .nm { font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #8ffcff; }
    .sp .dd { font-size: 11.5px; font-weight: 500; line-height: 1.35; color: rgba(234,246,255,0.5); text-align: center; }
    .warn { padding: 14px 17px; border-radius: 5px; background: rgba(255,90,61,0.08); border-left: 2px solid #ff5a3d; font-size: 13.5px; font-weight: 500; line-height: 1.5; color: rgba(234,246,255,0.78); }
    .warn b { color: #ff5a3d; font-weight: 700; }
    .scales { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
    .sc { display: flex; flex-direction: column; gap: 9px; align-items: center; }
    .sc .art { display: flex; justify-content: center; }
    .sc .lbl { font-size: 15px; font-weight: 700; color: var(--c); }
    .sc .stat { font-size: 12.5px; font-weight: 500; line-height: 1.4; color: rgba(234,246,255,0.6); text-align: center; }
    .sc .stat b { color: #eaf6ff; font-weight: 700; }
    .num-tbl { display: flex; flex-direction: column; }
    .nr { display: grid; grid-template-columns: 1fr 110px 110px 110px; gap: 12px; padding: 8px 4px; border-bottom: 1px solid rgba(234,246,255,0.08); align-items: baseline; }
    .nr:last-child { border-bottom: 0; }
    .nr.hd span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(234,246,255,0.4); }
    .nr .k { font-size: 13.5px; font-weight: 500; color: rgba(234,246,255,0.68); }
    .nr .v { font-size: 14px; font-weight: 700; color: #eaf6ff; text-align: right; font-variant-numeric: tabular-nums; }
    .nr .v.pick { color: #2ef2c4; }
    .nr .v.floorv { color: #ff5a3d; }
'''

def sp(art, name, note, w=100, h=100):
    return (f'<div class="sp"><div class="art"><svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            f'xmlns="http://www.w3.org/2000/svg">{art}</svg></div>'
            f'<span class="nm">{name}</span><span class="dd">{note}</span></div>')

def shape(art, name, note):
    return (f'<div class="sp" style="width: 152px"><div class="art"><svg width="144" height="96" viewBox="0 0 144 96" '
            f'xmlns="http://www.w3.org/2000/svg">{art}</svg></div>'
            f'<span class="nm">{name}</span><span class="dd">{note}</span></div>')

# --- scale comparison: same rack, three piece scales -------------------------
def rack_at(scale):
    r = 17 * scale
    spots = [(96, 116, 'solid', '2'), (238, 176, 'stripe', '6'), (150, 292, 'eight', '8'),
             (262, 402, 'solid', '4'), (78, 240, 'solid', '1'), (196, 66, 'stripe', '5')]
    balls = ''.join(ball(x, y, r, k, n) for x, y, k, n in spots)
    objs = felt_object(246, 330, 26 * scale, True, 'x2') + felt_object(84, 430, 24 * scale, False, 'mine')
    return (f'<svg width="228" height="352" viewBox="-30 -30 400 620" xmlns="http://www.w3.org/2000/svg">'
            f'{table(340, 560, pr=31 * scale, ft=24, t=13, jaw=15 * scale, extra=objs + balls + cue_ball(170, 470, r))}</svg>')

body = f'''<div class="sheet">
  <div>
    <div class="tag">Table language · headroom</div>
    <h2 class="title">Three questions the system has to survive</h2>
    <p class="lede">Answers to what happens when the game wants more than the system currently draws. All three resolve without adding a channel — which is the test a colour allocation has to pass to be worth having.</p>
  </div>

  <div class="q">
    <span class="num">01</span>
    <div>
      <div class="head">More pocket and wall states — yes, and none of them are a colour</div>
      <p class="ans">The table channel has three axes that scale a long way: <em>brightness</em> for attention, <em>geometry</em> for behaviour, and <em>motion</em> for anything alive. A pocket worth more gets a <b>physically wider mouth</b>, which is more honest than a glow because it changes the shot as well as the payoff.</p>
      <div class="row">
        {sp(pocket_state(100, 100, 'open'), 'Open', 'The default.')}
        {sp(pocket_state(100, 100, 'called'), 'Called', 'Bone lip. The contract names it.')}
        {sp(pocket_state(100, 100, 'shut'), 'Shut', 'Barred. A ball that arrives bounces.')}
        {sp(pocket_state(100, 100, 'wide'), 'Wide', 'A bigger mouth for a bigger payout.')}
        {sp(pocket_state(100, 100, 'badged'), 'Badged', 'A green pip: it does something to your score.')}
      </div>
      <div class="row">
        {sp(wall_state(50, 50, 74, 20, 'plain'), 'Plain wall', 'Bounce off it.')}
        {sp(wall_state(50, 52, 74, 20, 'bouncy'), 'Springy', 'Ribs and a flex arc. Gives speed back.')}
        {sp(wall_state(50, 50, 62, 20, 'moving'), 'Moving', 'Motion says it. Nothing else needs to.')}
        {sp(wall_state(50, 50, 62, 20, 'badged'), 'Badged', 'Same pip rule as the pocket.')}
      </div>
      <p class="ans" style="margin-top: 14px"><b>The rule for anything table-shaped that touches your score: badge it, never repaint it.</b> A small green or red pip sits <em>on</em> the object; the silhouette still reads as architecture and the pip reads as valence. And where it works, prefer the simpler answer — a "kicker wall" is just a red hazard sitting against a cushion, and the four families stay pure.</p>
    </div>
  </div>

  <div class="warn">
    <b>Already broken, and worth fixing on the way in.</b> Two layouts — <b>triangle-rack</b> and <b>pinball-pillars</b> — use bumpers, drawn today in <b>#2ef2c4</b>, which is now exactly the "good" colour. A bumper becomes a springy wall in the table channel: ribbed face, flex arc, and a green pip if we want to advertise that bouncing off it pays.
  </div>

  <div class="q">
    <span class="num">02</span>
    <div>
      <div class="head">Bigger and stranger pick-up shapes — the rule already allows it</div>
      <p class="ans">What carries the family is not the circle. It is <b>a dashed edge around a hollow interior</b>. So the rule generalises to: <em>a pick-up or hazard is any dashed outline</em> — bars, lanes, gates, blobs, a strip down one rail. Nothing about the silhouette is load-bearing.</p>
      <div class="row">
        {shape(hazard_shape('bar'), 'Bar', 'A band across a lane.')}
        {shape(hazard_shape('blob'), 'Blob', 'Irregular is fine. The edge is the rule.')}
        {shape(hazard_shape('gate'), 'Gate', 'Posts are walls; the beam between is the hazard.')}
        {shape(hazard_shape('lane'), 'Lane', 'Long shapes repeat the glyph rather than stretch it.')}
      </div>
      <p class="ans" style="margin-top: 14px">Two constraints come with the freedom. <b>The glyph never scales with the shape</b> — it sits at a fixed size at the centroid, or repeats along a long one, because a full-size warning triangle on a big hazard looks like a different mechanic. And <b>the interior never gets a real fill</b> beyond the 8% tint, because filled-and-raised is the only thing that says "wall". As shapes get large, hollow-versus-filled is all that separates the two families.</p>
    </div>
  </div>

  <div class="q">
    <span class="num">03</span>
    <div>
      <div class="head">The table should feel bigger — and the balls are what is oversized</div>
      <p class="ans">Measured against a real 7ft table, the pockets are already right and the felt is short. One multiplier on ball and pocket radii fixes it <b>without touching a line of authored layout geometry.</b></p>
      <div class="scales" style="margin-top: 18px">
        <div class="sc" style="--c: rgba(234,246,255,0.6)">
          <div class="art">{rack_at(1.0)}</div>
          <span class="lbl">1.00 — today</span>
          <span class="stat"><b>14.5</b> balls wide<br>23 px across on a phone</span>
        </div>
        <div class="sc" style="--c: #2ef2c4">
          <div class="art">{rack_at(0.78)}</div>
          <span class="lbl">0.78 — proposed</span>
          <span class="stat"><b>18.6</b> balls wide — real-table proportions<br>18 px across</span>
        </div>
        <div class="sc" style="--c: #ff5a3d">
          <div class="art">{rack_at(0.66)}</div>
          <span class="lbl">0.66 — the floor</span>
          <span class="stat"><b>22</b> balls wide<br>15 px across, and the number starts to fail</span>
        </div>
      </div>
      <div class="num-tbl" style="margin-top: 20px">
        <div class="nr hd"><span>Measured</span><span>Today</span><span>0.78</span><span>Real table</span></div>
        <div class="nr"><span class="k">Table width, in ball diameters</span><span class="v">14.5</span><span class="v pick">18.6</span><span class="v">17.6</span></div>
        <div class="nr"><span class="k">Table length, in ball diameters</span><span class="v">25.8</span><span class="v pick">33.1</span><span class="v">35.1</span></div>
        <div class="nr"><span class="k">Pocket mouth, in ball diameters</span><span class="v">2.02</span><span class="v pick">2.02</span><span class="v">~2.0</span></div>
        <div class="nr"><span class="k">Ball on a 390 px phone</span><span class="v">23 px</span><span class="v pick">18 px</span><span class="v">—</span></div>
        <div class="nr"><span class="k">The 8, on the same phone</span><span class="v floorv">43 px</span><span class="v pick">18 px</span><span class="v">same as any ball</span></div>
      </div>
      <p class="ans" style="margin-top: 16px"><b>The number decal sets the floor.</b> Below about 15 px across the digit stops being readable, so 0.66 is the limit unless numbers come off the ball entirely — pips, or numbers only on the balls the contract names.</p>
      <p class="ans"><b>One free win: the 8 is r=1.15, nearly double a normal ball.</b> On a real table the 8 is the same size as everything else — it is special by colour, not bulk. Bringing it to ball size gives back a lot of felt on its own.</p>
      <p class="ans"><b>And piece scale is a good difficulty axis.</b> Stepping it down with the room ramp raises density and tightens angles without adding a single rule the player has to learn. Held back until the flat version has been played.</p>
    </div>
  </div>
</div>'''

write('Headroom.dc.html', EX, body)
print('headroom ok')
