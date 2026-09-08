# Table Language — working files

`*.dc.html` are the working files the canvas is seeded from. Edit those, then
re-seed and republish; that is the loop the design skill expects.

`_lib.py` and `_teaching.py` generate the boards that are heavy on drawing —
every pocket, ball, pick-up and hazard on every board comes out of `_lib.py`,
so the catalogue and the lesson sketches cannot drift apart. Regenerate with
`python3 _teaching.py`, which overwrites `Teaching.dc.html`.

The other three boards were generated the same way and are now hand-maintained
as `.dc.html`. If one needs a specimen redrawn, take the SVG from `_lib.py`.
