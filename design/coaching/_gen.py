# -*- coding: utf-8 -*-
"""Generates the coaching-redesign artboards. Values are lifted from the game:
src/config.js PALETTE and the #coach rules in index.html."""
import os

# --- the game's own values -------------------------------------------------
OBSIDIAN, FELT_DEEP, FELT, FELT_LINE = '#05070a', '#06231d', '#0b3a2e', '#14624c'
FRAME, CUSHION, LIP, VOID = '#0a1a24', '#123040', '#1d6f7a', '#04060a'
CYAN, AIM, GHOST = '#35f2ff', '#8ffcff', '#4a8fa5'
SOLID, STRIPE, GOOD, BAD, BONE = '#ffb340', '#a05cff', '#2ef2c4', '#ff5a3d', '#eaf6ff'
CARD_BG, CARD_INK, CARD_SUB, CARD_EYEBROW = '#f2f4f6', '#12171d', '#3d4753', '#7c8794'
FONT = "'Rajdhani','Chakra Petch','Segoe UI','Helvetica Neue',Arial,sans-serif"

W, H = 300, 533          # one phone frame, the game's 9:16

def head(title, extra=''):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap">
  <style>
    body {{ margin: 0; font-family: {FONT}; background: {OBSIDIAN}; color: {BONE}; }}
    a {{ color: {CYAN}; }} a:hover {{ color: {AIM}; }}
    .sheet {{ padding: 34px 36px 40px; }}
    .kicker {{ font-size: 11px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase; color: {LIP}; }}
    h1 {{ font-size: 34px; font-weight: 700; margin: 8px 0 6px; letter-spacing: -.01em; }}
    h2 {{ font-size: 15px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: {GOOD}; margin: 34px 0 14px; }}
    .lede {{ font-size: 15px; line-height: 1.5; color: rgba(234,246,255,.62); max-width: 68ch; text-wrap: pretty; }}
    .row {{ display: flex; gap: 22px; align-items: flex-start; }}
    .frames {{ display: flex; gap: 20px; flex-wrap: wrap; }}
    .fr {{ display: flex; flex-direction: column; gap: 9px; width: {W}px; }}
    .fr .cap {{ font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: {LIP}; }}
    .fr .note {{ font-size: 12.5px; line-height: 1.45; color: rgba(234,246,255,.55); text-wrap: pretty; }}
    {extra}
  </style>
</helmet>
'''

TAIL = '''</x-dc>
</body>
</html>
'''

# --- the table, drawn the way the game draws it ----------------------------
def table(balls=(), cue=None, aim=None, routes=(), lit=(), ring=None, w=W, h=H,
          overlay='', dim=False):
    """One phone frame. Coordinates are 0-1 across the FELT."""
    fx, fy, fw, fh = 16, 60, w - 32, h - 84          # felt rect
    def px(u, v): return (fx + u * fw, fy + v * fh)
    pockets = {'tl': (0, 0), 'tr': (1, 0), 'ml': (0, .5), 'mr': (1, .5),
               'bl': (0, 1), 'br': (1, 1)}
    o = [f'<rect x="0" y="0" width="{w}" height="{h}" rx="14" fill="{OBSIDIAN}"/>',
         f'<rect x="{fx-7}" y="{fy-7}" width="{fw+14}" height="{fh+14}" rx="12" fill="{FRAME}"/>',
         f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="{FELT}"/>']
    for i in range(1, 4):
        o.append(f'<line x1="{fx+fw*i/4:.0f}" y1="{fy}" x2="{fx+fw*i/4:.0f}" y2="{fy+fh}" stroke="{FELT_LINE}" stroke-width="1" opacity=".35"/>')
    for i in range(1, 6):
        o.append(f'<line x1="{fx}" y1="{fy+fh*i/6:.0f}" x2="{fx+fw}" y2="{fy+fh*i/6:.0f}" stroke="{FELT_LINE}" stroke-width="1" opacity=".35"/>')
    for name, (u, v) in pockets.items():
        cx, cy = px(u, v)
        hot = name in lit
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="17" fill="{VOID}"/>')
        if hot:
            o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="25" fill="{BONE}" opacity=".16"/>')
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="17" fill="none" stroke="{BONE if hot else LIP}" stroke-width="{3 if hot else 2}" opacity="{1 if hot else .8}"/>')
    if dim:
        o.append(f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" fill="{OBSIDIAN}" opacity=".5"/>')
    if ring:
        u, v, r = ring
        cx, cy = px(u, v)
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{r}" fill="none" stroke="{BONE}" stroke-width="1.5" stroke-dasharray="5 5" opacity=".42"/>')
    for kind, a, b in routes:
        (x1, y1), (x2, y2) = px(*a), px(*b)
        col = {'cue': CYAN, 'ball': SOLID, 'bad': BAD, 'ghost': GHOST}[kind]
        dash = ' stroke-dasharray="6 5"' if kind in ('ghost', 'bad') else ''
        o.append(f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="{col}" stroke-width="{2.4 if kind!="ghost" else 1.6}" opacity="{.95 if kind!="ghost" else .6}"{dash}/>')
    for u, v, n, kind in balls:
        cx, cy = px(u, v)
        col = {'solid': SOLID, 'stripe': STRIPE}[kind]
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="11" fill="{col}" opacity=".22"/>')
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="9" fill="none" stroke="{col}" stroke-width="2.4"/>')
        o.append(f'<text x="{cx:.0f}" y="{cy+4:.0f}" text-anchor="middle" font-family="{FONT}" font-size="11" font-weight="700" fill="{BONE}">{n}</text>')
    if cue:
        cx, cy = px(*cue)
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="13" fill="{CYAN}" opacity=".2"/>')
        o.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="8.5" fill="{CYAN}"/>')
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">'
            + ''.join(o) + '</svg>' + overlay)

def frame(cap, svg, note):
    return f'<div class="fr"><span class="cap">{cap}</span>{svg}<span class="note">{note}</span></div>'

def write(name, body):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), name)
    open(path, 'w').write(body)
    print('wrote', name)
