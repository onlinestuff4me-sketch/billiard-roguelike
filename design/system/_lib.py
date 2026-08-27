"""Shared drawing for the Table Language boards.

Every specimen on every board comes out of this file, so the catalogue, the
architecture board and the lesson sketches cannot drift apart. Regenerate a
board with `python3 _<board>.py`; each writes its own `.dc.html`.
"""

CSS = '''    body {
      margin: 0;
      background: #05070a;
      color: #eaf6ff;
      font-family: 'Rajdhani', 'Chakra Petch', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    a { color: #35f2ff; }
    a:hover { color: #8ffcff; }
    .sheet { box-sizing: border-box; background: #05070a; padding: 34px 36px 38px; display: flex; flex-direction: column; gap: 26px; }
    .tag { font-size: 10px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase; color: #2ef2c4; }
    .title { margin: 6px 0 0; font-size: 33px; font-weight: 700; line-height: 1.02; color: #eaf6ff; }
    .lede { margin: 9px 0 0; max-width: 820px; font-size: 15px; font-weight: 500; line-height: 1.5; color: rgba(234,246,255,0.66); text-wrap: pretty; }
    .lede b { color: #eaf6ff; font-weight: 700; }
    .lede em { font-style: normal; color: #2ef2c4; font-weight: 600; }
    h3 { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #2ef2c4; }
    .panel { padding: 20px 22px 22px; border-radius: 6px; background: #080d12; border: 1px solid rgba(29,111,122,0.3); display: flex; flex-direction: column; gap: 13px; }
    .panel p { margin: 0; font-size: 13.5px; font-weight: 500; line-height: 1.5; color: rgba(234,246,255,0.7); text-wrap: pretty; }
    .panel p b { color: #eaf6ff; font-weight: 700; }
    .rule { height: 1px; background: rgba(234,246,255,0.12); }
    .svgtext { font-family: 'Rajdhani', 'Segoe UI', Arial, sans-serif; }
'''

HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap">
  <style>
%s%s  </style>
</helmet>

'''

def write(name, extra_css, body):
    open(name, 'w').write(HEAD % (CSS, extra_css) + body + '\n</x-dc>\n</body>\n</html>\n')

# ------------------------------------------------------------------ #
# THE FIVE CHANNELS. No hue appears in two of them.
# ------------------------------------------------------------------ #
CUE    = '#35f2ff'   # you: the cue ball and the aim line
FRAME  = '#0a1a24'   # the table: frame body
CUSH   = '#123040'   # the table: cushion body
LIP    = '#1d6f7a'   # the table: every lit edge, pocket mouths included
VOID   = '#04060a'   # the table: what is inside a pocket
FELT   = '#0b3a2e'
GRID   = '#14624c'
GOOD   = '#2ef2c4'   # pick-ups: hit these
BAD    = '#ff5a3d'   # hazards: avoid these
SOLID  = '#ffb340'   # the rack: 1-4
STRIPE = '#a05cff'   # the rack: 5-7
EIGHT  = '#14181f'   # the rack: the 8
BONE   = '#eaf6ff'

_UID = [0]

def _uid(tag):
    _UID[0] += 1
    return f'{tag}{_UID[0]}'

# ------------------------------------------------------------------ #
# Balls — raised, solid, numbered.
# ------------------------------------------------------------------ #

def ball(cx, cy, r, kind, number):
    shadow = f'<ellipse cx="{cx}" cy="{cy + r*0.92:.1f}" rx="{r*0.95:.1f}" ry="{r*0.28:.1f}" fill="#05070a" opacity="0.55"/>'
    if kind == 'solid':
        body = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{SOLID}"/>'
        ink = '#2a1500'
    elif kind == 'stripe':
        # A real stripe: bone body, coloured band, clipped to the circle. The
        # word "stripe" then names something you can see.
        band = r * 0.62
        cid = _uid('st')
        body = (f'<clipPath id="{cid}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>'
                f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{BONE}"/>'
                f'<rect x="{cx-r}" y="{cy-band:.1f}" width="{2*r}" height="{2*band:.1f}" fill="{STRIPE}" clip-path="url(#{cid})"/>')
        ink = '#180432'
    else:
        body = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{EIGHT}"/>'
                f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{BONE}" stroke-width="{r*0.09:.1f}" opacity="0.55"/>')
        ink = '#05070a'
    num = (f'<text class="svgtext" x="{cx}" y="{cy + r*0.36:.1f}" font-size="{r*1.02:.1f}" font-weight="700" '
           f'fill="{BONE}" stroke="{ink}" stroke-width="{r*0.15:.1f}" paint-order="stroke" text-anchor="middle">{number}</text>')
    return f'<g>{shadow}{body}{num}</g>'

def cue_ball(cx, cy, r):
    return (f'<g><ellipse cx="{cx}" cy="{cy + r*0.92:.1f}" rx="{r*0.95:.1f}" ry="{r*0.28:.1f}" fill="#05070a" opacity="0.5"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*1.35:.1f}" fill="{CUE}" opacity="0.14"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{CUE}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*0.4:.1f}" fill="#d9feff"/></g>')

# ------------------------------------------------------------------ #
# Felt objects — flat, open, dashed. Mint means hit it, red means don't.
# ------------------------------------------------------------------ #

def glyph(cx, cy, r, colour, kind):
    k = r * 0.44
    if kind == 'x2':
        return (f'<text class="svgtext" x="{cx}" y="{cy + r*0.26:.1f}" font-size="{r*0.78:.1f}" '
                f'font-weight="700" fill="{colour}" text-anchor="middle">&#215;2</text>')
    if kind == 'freeze':
        return (f'<path d="M{cx},{cy-k} L{cx+k},{cy} L{cx},{cy+k} L{cx-k},{cy} Z" fill="none" stroke="{colour}" stroke-width="{r*0.12:.1f}"/>'
                f'<path d="M{cx},{cy-k*0.46:.1f} L{cx+k*0.46:.1f},{cy} L{cx},{cy+k*0.46:.1f} L{cx-k*0.46:.1f},{cy} Z" fill="{colour}"/>')
    if kind == 'boon':
        return (f'<path d="M{cx-k},{cy+k*0.34:.1f} L{cx},{cy-k*0.5:.1f} L{cx+k},{cy+k*0.34:.1f}" fill="none" stroke="{colour}" stroke-width="{r*0.14:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<path d="M{cx-k},{cy+k*0.9:.1f} L{cx},{cy+k*0.06:.1f} L{cx+k},{cy+k*0.9:.1f}" fill="none" stroke="{colour}" stroke-width="{r*0.14:.1f}" stroke-linecap="round" stroke-linejoin="round"/>')
    if kind == 'stroke':
        return (f'<rect x="{cx-k*0.62:.1f}" y="{cy-k}" width="{r*0.16:.1f}" height="{k*2:.1f}" rx="{r*0.08:.1f}" fill="{colour}"/>'
                f'<line x1="{cx+k*0.18:.1f}" y1="{cy}" x2="{cx+k*0.95:.1f}" y2="{cy}" stroke="{colour}" stroke-width="{r*0.13:.1f}" stroke-linecap="round"/>'
                f'<line x1="{cx+k*0.56:.1f}" y1="{cy-k*0.38:.1f}" x2="{cx+k*0.56:.1f}" y2="{cy+k*0.38:.1f}" stroke="{colour}" stroke-width="{r*0.13:.1f}" stroke-linecap="round"/>')
    if kind == 'mine':
        # A warning triangle: the only pointed silhouette on the felt.
        return (f'<path d="M{cx},{cy-k*1.05:.1f} L{cx+k},{cy+k*0.72:.1f} L{cx-k},{cy+k*0.72:.1f} Z" '
                f'fill="none" stroke="{colour}" stroke-width="{r*0.13:.1f}" stroke-linejoin="round"/>'
                f'<line x1="{cx}" y1="{cy-k*0.28:.1f}" x2="{cx}" y2="{cy+k*0.2:.1f}" stroke="{colour}" stroke-width="{r*0.12:.1f}" stroke-linecap="round"/>'
                f'<circle cx="{cx}" cy="{cy+k*0.46:.1f}" r="{r*0.065:.1f}" fill="{colour}"/>')
    if kind == 'kicker':
        return (f'<path d="M{cx+k*0.75:.1f},{cy-k} L{cx-k*0.8:.1f},{cy} L{cx+k*0.75:.1f},{cy+k} Z" fill="{colour}"/>'
                f'<line x1="{cx+k*0.95:.1f}" y1="{cy-k*0.9:.1f}" x2="{cx+k*0.95:.1f}" y2="{cy+k*0.9:.1f}" stroke="{colour}" stroke-width="{r*0.12:.1f}" stroke-linecap="round"/>')
    return ''

def felt_object(cx, cy, r, good, kind):
    colour = GOOD if good else BAD
    dash = f'{r*0.36:.1f} {r*0.26:.1f}'
    return f'''<g>
      <circle cx="{cx}" cy="{cy}" r="{r*0.88:.1f}" fill="{colour}" opacity="0.08"/>
      <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{colour}" stroke-width="{r*0.11:.1f}" stroke-dasharray="{dash}" stroke-linecap="round"/>
      {glyph(cx, cy, r, colour, kind)}
    </g>'''

def wall(cx, cy, w, h):
    return (f'<g><rect x="{cx-w/2}" y="{cy-h/2+h*0.18:.1f}" width="{w}" height="{h}" rx="3" fill="#05070a" opacity="0.6"/>'
            f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="3" fill="{CUSH}" stroke="{LIP}" stroke-width="1.6"/></g>')

# ------------------------------------------------------------------ #
# THE TABLE. Pockets are cut into it, and the frame swells around each.
# ------------------------------------------------------------------ #

def _grid(w, h, step=52):
    lines = []
    x = step
    while x < w:
        lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{h}"/>')
        x += step
    y = step
    while y < h:
        lines.append(f'<line x1="0" y1="{y}" x2="{w}" y2="{y}"/>')
        y += step
    return f'<g stroke="{GRID}" stroke-width="0.9" opacity="0.24">{"".join(lines)}</g>'

def _cushion(x1, y1, x2, y2, t, jaw, side):
    """A cushion run whose ends flare open toward the pockets at either end."""
    if side in ('top', 'bottom'):
        sgn = 1 if side == 'top' else -1
        oy, iy = y1, y1 + sgn * t
        return (f'<polygon points="{x1-jaw},{oy} {x2+jaw},{oy} {x2},{iy} {x1},{iy}" fill="{CUSH}"/>'
                f'<line x1="{x1}" y1="{iy}" x2="{x2}" y2="{iy}" stroke="{LIP}" stroke-width="1.7" opacity="0.85"/>')
    sgn = 1 if side == 'left' else -1
    ox, ix = x1, x1 + sgn * t
    return (f'<polygon points="{ox},{y1-jaw} {ox},{y2+jaw} {ix},{y2} {ix},{y1}" fill="{CUSH}"/>'
            f'<line x1="{ix}" y1="{y1}" x2="{ix}" y2="{y2}" stroke="{LIP}" stroke-width="1.7" opacity="0.85"/>')

def _mouth(cx, cy, pr, hot=False):
    rim = BONE if hot else LIP
    return (f'<circle cx="{cx}" cy="{cy}" r="{pr*1.24:.1f}" fill="{rim}" opacity="{0.22 if hot else 0.11}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{pr}" fill="{VOID}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{pr}" fill="none" stroke="{rim}" stroke-width="{3.4 if hot else 2.6}" opacity="{1 if hot else 0.92}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{pr*0.995:.1f}" fill="none" stroke="#8ffcff" stroke-width="1" opacity="{0.7 if hot else 0.3}"/>')

def pocket_centres(w, h):
    return [(0, 0), (w, 0), (0, h / 2), (w, h / 2), (0, h), (w, h)]

def table(w, h, pr=31, ft=24, t=13, jaw=15, lit=None, extra=''):
    centres = pocket_centres(w, h)
    swell = pr + ft * 0.52
    frame = [f'<rect x="{-ft}" y="{-ft}" width="{w+2*ft}" height="{h+2*ft}" rx="{ft*0.7:.1f}" fill="{FRAME}"/>']
    frame += [f'<circle cx="{cx}" cy="{cy}" r="{swell:.1f}" fill="{FRAME}"/>' for cx, cy in centres]
    outline = [f'<rect x="{-ft}" y="{-ft}" width="{w+2*ft}" height="{h+2*ft}" rx="{ft*0.7:.1f}" fill="none" stroke="{LIP}" stroke-width="1.5" opacity="0.42"/>']
    outline += [f'<circle cx="{cx}" cy="{cy}" r="{swell:.1f}" fill="none" stroke="{LIP}" stroke-width="1.5" opacity="0.42"/>' for cx, cy in centres]
    cushions = [
        _cushion(pr + jaw, 0, w - pr - jaw, 0, t, jaw, 'top'),
        _cushion(pr + jaw, h, w - pr - jaw, h, t, jaw, 'bottom'),
        _cushion(0, pr + jaw, 0, h / 2 - pr - jaw, t, jaw, 'left'),
        _cushion(0, h / 2 + pr + jaw, 0, h - pr - jaw, t, jaw, 'left'),
        _cushion(w, pr + jaw, w, h / 2 - pr - jaw, t, jaw, 'right'),
        _cushion(w, h / 2 + pr + jaw, w, h - pr - jaw, t, jaw, 'right')
    ]
    voids = [_mouth(cx, cy, pr, lit is not None and i == lit) for i, (cx, cy) in enumerate(centres)]
    return (f'{"".join(frame)}<rect x="0" y="0" width="{w}" height="{h}" fill="{FELT}"/>'
            f'{_grid(w, h)}{"".join(cushions)}{"".join(voids)}{"".join(outline)}{extra}')

def corner_detail(w=300, h=300, pr=54, ft=40, t=24, jaw=28):
    swell = pr + ft * 0.52
    ox, oy = ft + 10, ft + 10
    cid = _uid('cc')
    return f'''<g>
      <clipPath id="{cid}"><rect x="0" y="0" width="{w}" height="{h}" rx="7"/></clipPath>
      <g clip-path="url(#{cid})">
        <rect x="0" y="0" width="{w}" height="{h}" fill="{FRAME}"/>
        <circle cx="{ox}" cy="{oy}" r="{swell:.1f}" fill="{FRAME}"/>
        <rect x="{ox}" y="{oy}" width="{w-ox}" height="{h-oy}" fill="{FELT}"/>
        <g transform="translate({ox},{oy})">{_grid(w-ox, h-oy, 58)}</g>
        <g transform="translate({ox},{oy})">
          {_cushion(pr + jaw, 0, w - ox, 0, t, jaw, 'top')}
          {_cushion(0, pr + jaw, 0, h - oy, t, jaw, 'left')}
        </g>
        {_mouth(ox, oy, pr)}
        <circle cx="{ox}" cy="{oy}" r="{swell:.1f}" fill="none" stroke="{LIP}" stroke-width="1.8" opacity="0.5"/>
      </g>
    </g>'''

def side_detail(w=300, h=300, pr=54, ft=40, t=24, jaw=28):
    swell = pr + ft * 0.52
    ox, oy = ft + 10, h / 2
    cid = _uid('sc')
    return f'''<g>
      <clipPath id="{cid}"><rect x="0" y="0" width="{w}" height="{h}" rx="7"/></clipPath>
      <g clip-path="url(#{cid})">
        <rect x="0" y="0" width="{w}" height="{h}" fill="{FRAME}"/>
        <circle cx="{ox}" cy="{oy}" r="{swell:.1f}" fill="{FRAME}"/>
        <rect x="{ox}" y="0" width="{w-ox}" height="{h}" fill="{FELT}"/>
        <g transform="translate({ox},0)">{_grid(w-ox, h, 58)}</g>
        <g transform="translate({ox},0)">
          {_cushion(0, 0, 0, oy - pr - jaw, t, jaw, 'left')}
          {_cushion(0, oy + pr + jaw, 0, h, t, jaw, 'left')}
        </g>
        {_mouth(ox, oy, pr)}
        <circle cx="{ox}" cy="{oy}" r="{swell:.1f}" fill="none" stroke="{LIP}" stroke-width="1.8" opacity="0.5"/>
      </g>
    </g>'''
