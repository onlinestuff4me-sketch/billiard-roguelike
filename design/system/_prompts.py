exec(open('_lib.py').read())

EX = '''    .sheet { width: 1120px; }
    .fails { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
    .fail { display: flex; flex-direction: column; gap: 10px; }
    .fail .art { display: flex; justify-content: center; }
    .fail .h { font-size: 14.5px; font-weight: 700; color: #ff5a3d; line-height: 1.25; }
    .fail .d { font-size: 12.5px; font-weight: 500; line-height: 1.42; color: rgba(234,246,255,0.62); text-wrap: pretty; }
    .fail .d b { color: #eaf6ff; font-weight: 700; }
    .rules7 { display: flex; flex-direction: column; }
    .r7 { display: grid; grid-template-columns: 30px 250px 1fr; gap: 18px; padding: 11px 4px; border-bottom: 1px solid rgba(234,246,255,0.08); align-items: baseline; }
    .r7:last-child { border-bottom: 0; }
    .r7 .i { font-size: 11px; font-weight: 700; color: rgba(234,246,255,0.28); }
    .r7 .k { font-size: 14px; font-weight: 700; color: #2ef2c4; line-height: 1.3; }
    .r7 .v { font-size: 13.5px; font-weight: 500; line-height: 1.45; color: rgba(234,246,255,0.68); text-wrap: pretty; }
    .r7 .v b { color: #eaf6ff; font-weight: 700; }
    .budget { display: grid; grid-template-columns: 300px 1fr; gap: 34px; align-items: start; }
    .bands { display: flex; flex-direction: column; }
    .bd2 { display: grid; grid-template-columns: 78px 1fr; gap: 16px; padding: 9px 4px; border-bottom: 1px solid rgba(234,246,255,0.08); align-items: baseline; }
    .bd2:last-child { border-bottom: 0; }
    .bd2 .z { font-size: 13px; font-weight: 700; color: var(--c); font-variant-numeric: tabular-nums; }
    .bd2 .w { font-size: 13.5px; font-weight: 500; line-height: 1.4; color: rgba(234,246,255,0.66); }
    .bd2 .w b { color: #eaf6ff; font-weight: 700; }
    .states { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
    .st2 { display: flex; flex-direction: column; gap: 9px; }
    .st2 .lbl { font-size: 10.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(234,246,255,0.4); }
    .st2 .d { font-size: 12.5px; font-weight: 500; line-height: 1.42; color: rgba(234,246,255,0.6); }
    .wordb { display: flex; flex-direction: column; }
    .wb { display: grid; grid-template-columns: 150px 92px 1fr; gap: 16px; padding: 8px 4px; border-bottom: 1px solid rgba(234,246,255,0.08); align-items: baseline; }
    .wb:last-child { border-bottom: 0; }
    .wb.hd span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(234,246,255,0.4); }
    .wb .k { font-size: 13.5px; font-weight: 600; color: rgba(234,246,255,0.7); }
    .wb .n { font-size: 14px; font-weight: 700; color: #2ef2c4; text-align: right; font-variant-numeric: tabular-nums; }
    .wb .e { font-size: 13px; font-weight: 500; color: rgba(234,246,255,0.5); }
    /* a real card, drawn at the size it ships at */
    .card2 { width: 268px; padding: 9px 12px 11px; border-radius: 12px; background: #f2f4f6; color: #12171d; box-shadow: 0 5px 0 rgba(0,0,0,0.35), 0 9px 26px rgba(0,0,0,0.5); position: relative; }
    .card2 .step { font-size: 8.5px; letter-spacing: 0.24em; text-transform: uppercase; color: #7c8794; margin-bottom: 2px; }
    .card2 .say { font-size: 16px; font-weight: 800; line-height: 1.12; color: #12171d; }
    .card2 .say em { font-style: normal; color: #12a150; }
    .card2 .say b { color: #d2402f; font-weight: 800; }
    .card2 .hint { margin-top: 3px; font-size: 11.5px; line-height: 1.3; color: #4a5560; }
    .card2 .hint em { font-style: normal; color: #12a150; font-weight: 700; }
    .card2 .hint b { color: #d2402f; font-weight: 700; }
    .card2 .hint.bad { color: #d2402f; font-weight: 700; }
    .card2 .skip { position: absolute; top: 5px; right: 7px; padding: 2px 8px; font-size: 8.5px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b95a1; border: 1px solid rgba(18,23,29,0.18); border-radius: 999px; }
    .card2.faded { opacity: 0.09; }
    .callout { display: flex; gap: 9px; align-items: baseline; font-size: 12.5px; font-weight: 500; line-height: 1.4; color: rgba(234,246,255,0.6); }
    .callout .n2 { flex: 0 0 16px; font-size: 11px; font-weight: 700; color: #2ef2c4; }
'''

def phone(contents, px=210, card=None, fade=False):
    """A lesson table with a card drawn over it, at the proportions it ships at."""
    svg = (f'<svg width="{px}" height="{int(px * 620 / 400)}" viewBox="-30 -30 400 620" '
           f'xmlns="http://www.w3.org/2000/svg">{table(340, 560, extra=contents)}</svg>')
    if not card:
        return f'<div style="position: relative; width: {px}px">{svg}</div>'
    top, height, opacity = card
    return (f'<div style="position: relative; width: {px}px">{svg}'
            f'<div style="position:absolute; left:5%; width:90%; top:{top}%; height:{height}%; '
            f'border-radius:8px; background:#f2f4f6; opacity:{opacity}; '
            f'box-shadow:0 4px 0 rgba(0,0,0,0.35)"></div></div>')

rack = (ball(120, 210, 15, 'solid', '1') + ball(230, 150, 15, 'solid', '4')
        + ball(78, 300, 15, 'stripe', '6') + cue_ball(170, 450, 15))

body = f'''<div class="sheet">
  <div>
    <div class="tag">Table language · prompts</div>
    <h2 class="title">A prompt that covers the shot is not a prompt</h2>
    <p class="lede">Every instruction the game gives lives in one component with one set of rules. The rules exist because the first build broke all three of them at once: the card sat over the middle of the table, corrections arrived as a second voice with its own timer, and boards described where to aim instead of pointing at it.</p>
  </div>

  <div class="fails">
    <div class="fail">
      <div class="art">{phone(rack, 210, (26, 22, 1))}</div>
      <div class="h">It sat on the table</div>
      <div class="d">Anchored at 21% and grown downward, a two-line card reached the middle of the felt. <b>On the board about knocking two balls in, the card covered both balls it named.</b></div>
    </div>
    <div class="fail">
      <div class="art">{phone(rack, 210, (56, 9, 0.82))}</div>
      <div class="h">A second voice, on a timer</div>
      <div class="d">Corrections appeared somewhere else, in another style, and expired after a couple of seconds. <b>Advice that disappears before it is read is worse than none</b> — the player now knows they were told something and does not know what.</div>
    </div>
    <div class="fail">
      <div class="art">{phone(rack + f'<g opacity="0.9">{_mouth(340, 0, 34, True)}</g>', 210)}</div>
      <div class="h">It described a place</div>
      <div class="d">"The far corner" is a sentence the player has to translate into a location on a table they have never seen. <b>Lighting the pocket costs no words and cannot be misread.</b></div>
    </div>
  </div>

  <div class="rule"></div>

  <div>
    <h3 style="margin-bottom: 14px">The seven rules</h3>
    <div class="rules7">
      <div class="r7"><span class="i">01</span><span class="k">One component, always</span><span class="v">Instructions, corrections and praise are the same object in the same place. A second style in a second position is a second thing to learn, and it arrives at the exact moment the player is least able to learn it.</span></div>
      <div class="r7"><span class="i">02</span><span class="k">It gets out of the way of the shot</span><span class="v">The instant a thumb goes down the player is aiming, not reading. The card drops to <b>9% opacity</b> and the spotlight scrim goes with it. Fading rather than hiding keeps the words recoverable at a glance and avoids a flash on every release.</span></div>
      <div class="r7"><span class="i">03</span><span class="k">Nothing expires</span><span class="v">A prompt is dismissed by the player acting on it, never by a clock. The only thing that replaces the current text is the next attempt.</span></div>
      <div class="r7"><span class="i">04</span><span class="k">Point, do not describe</span><span class="v">Anything with a position on the table is <b>shown</b>: the target pocket lights and breathes, the ball to hit is spotlit. Prose is for rules, not for places.</span></div>
      <div class="r7"><span class="i">05</span><span class="k">One instruction, one fact</span><span class="v">A headline that says what to do, and one line underneath carrying the single fact that makes it possible. Never a third line, and never two facts.</span></div>
      <div class="r7"><span class="i">06</span><span class="k">Two highlights, fixed colours</span><span class="v">The thing is red and the action is green, on every card, so the colour is readable before the sentence is — and they are the same red and green the felt uses.</span></div>
      <div class="r7"><span class="i">07</span><span class="k">Capped, not trusted</span><span class="v">The card has a hard <b>max-height of 13%</b> and clips. A rule that depends on an author keeping copy short is a rule that breaks on the first long sentence.</span></div>
    </div>
  </div>

  <div class="budget">
    <div>{phone(rack + f'<g opacity="0.95">{_mouth(340, 0, 34, True)}</g>', 300, (12.5, 13, 1))}</div>
    <div>
      <h3 style="margin-bottom: 12px">The vertical budget</h3>
      <p class="lede" style="margin-bottom: 14px">The screen is not free space with a card in it. Every band is spoken for, and the only unclaimed one is the strip under the HUD.</p>
      <div class="bands">
        <div class="bd2" style="--c: #8ffcff"><span class="z">0–11%</span><span class="w">HUD: hull, contract, score.</span></div>
        <div class="bd2" style="--c: #2ef2c4"><span class="z">12–25%</span><span class="w"><b>The card.</b> Capped here, and it clips rather than growing.</span></div>
        <div class="bd2" style="--c: #ffb340"><span class="z">28–64%</span><span class="w">Every rack, every target, every route. <b>Nothing may be authored above 28%.</b></span></div>
        <div class="bd2" style="--c: #35f2ff"><span class="z">~70%</span><span class="w">Where the cue ball spawns.</span></div>
        <div class="bd2" style="--c: #ff5a3d"><span class="z">70–100%</span><span class="w">Where the thumb goes. The foot of the screen looks free and is not — the cue model puts the thumb below the ball, so anything down here hides the ball, the cue and the player's own hand at once.</span></div>
      </div>
      <div class="callout" style="margin-top: 16px"><span class="n2">→</span><span>This is why board 3's rack moved. It was authored in the 12–25% band, so the card covered the two balls the card was talking about — the layout was wrong, not the copy.</span></div>
    </div>
  </div>

  <div>
    <h3 style="margin-bottom: 14px">Three states, one object</h3>
    <div class="states">
      <div class="st2">
        <span class="lbl">Instruction</span>
        <div class="card2"><div class="step">Lesson 3 of 5</div><div class="say">Four balls. <em>Three shots.</em></div><div class="hint">The <b>1</b> and the <b>4</b> line up on the lit pocket. Send the 1 through the 4.</div><div class="skip">Skip</div></div>
        <span class="d">The default. Sits until the board is passed.</span>
      </div>
      <div class="st2">
        <span class="lbl">Correction</span>
        <div class="card2"><div class="step">Lesson 3 of 5</div><div class="say">Four balls. <em>Three shots.</em></div><div class="hint bad">Scratch — your own ball went in. Take it again.</div><div class="skip">Skip</div></div>
        <span class="d">The hint line is replaced in place. Same card, same position, no timer.</span>
      </div>
      <div class="st2">
        <span class="lbl">While aiming</span>
        <div class="card2 faded"><div class="step">Lesson 3 of 5</div><div class="say">Four balls. <em>Three shots.</em></div><div class="hint">The <b>1</b> and the <b>4</b> line up on the lit pocket.</div><div class="skip">Skip</div></div>
        <span class="d">9% opacity, the whole time a thumb is down. Recoverable, never in the way.</span>
      </div>
    </div>
  </div>

  <div class="panel">
    <h3>Word budget, measured on a 390px phone</h3>
    <div class="wordb">
      <div class="wb hd"><span>Line</span><span>Ceiling</span><span>Example</span></div>
      <div class="wb"><span class="k">Headline</span><span class="n">6 words</span><span class="e">Knock the 2 in from an angle</span></div>
      <div class="wb"><span class="k">Hint</span><span class="n">14 words</span><span class="e">Hit its far side, toward the lit pocket.</span></div>
      <div class="wb"><span class="k">Correction</span><span class="n">12 words</span><span class="e">Scratch — your own ball went in. Take it again.</span></div>
      <div class="wb"><span class="k">Room banner</span><span class="n">8 words</span><span class="e">Green is good · hit it and the shot doubles</span></div>
      <div class="wb"><span class="k">Float text</span><span class="n">2 words</span><span class="e">SCRATCH &nbsp;·&nbsp; MINE &nbsp;·&nbsp; +1 SHOT</span></div>
    </div>
    <p>These are ceilings, not targets. The headline on the best board in the set is three words long and has no hint at all — <b>four balls, three shots</b> is the whole lesson, and anything added to it would be explaining a puzzle the player is meant to solve.</p>
  </div>
</div>'''

write('Prompts.dc.html', EX, body)
print('prompts ok')
