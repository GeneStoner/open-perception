# bidirectional-translation — design notes

Iterative exploration of a delayed-onset, bistable-style dot stimulus,
prototyped from iPad via Vercel branch previews on
`claude/ipad-transparent-motion-demos-Bz6Aj`.

## Current parameters (locked in)

| param                | value                                        |
| -------------------- | -------------------------------------------- |
| canvas               | 320 × 320 px                                 |
| aperture             | 4.5° (135 px at 30 px/°)                     |
| dots / field         | 173 (mid density — matches the 173 step of the experimental series) |
| coherence            | 50% coherent + 50% non-coherent (8 fixed dirs) |
| dot radius           | 1.2 px                                       |
| field 0 (green)      | `rgb(90,180,90)` — rotates CW, does **not** translate |
| field 1 (red)        | `rgb(230,110,110)` — rotates CCW, translates **right** during trans |
| translating field    | red only (same in both panels)               |
| translation speed    | 2.26 °/s — full experimental rate            |
| rotation speed       | 81 °/s — full experimental rate              |
| timing               | solo 750 / pre-trans 300 / **trans 160** / post 500 / blank 500 ms |
| total loop           | 2210 ms                                      |
| draw order           | per-frame Fisher-Yates shuffle of all 2000 dot indices |
| reinit               | both fields reset to fresh random positions at loop wrap |

Two panels side by side, identical except for which field is delay-onset:

- Left panel:  `delayedField = 1` (red delayed)
- Right panel: `delayedField = 0` (green delayed)

## Iteration log

1. **v1 — both fields translate, opposite directions, single trial loop.**
   First scaffold, larger aperture (4.5°) and high density (1000/field).
   Showed motion but lacked the percept Gene was hoping for.

2. **v2 — swap colors, add mirror panel.**
   Field 0 → green, field 1 → red. Duplicated the stimulus with the
   delay assignment flipped to put the two onset variants side by side.

3. **v3 — fix the (perceived) occlusion bias.**
   Two observers reported "green occludes red", but the code drew red
   on top of green. Root cause: green was ~25% more luminant in Rec.
   709, and brighter elements read as foreground regardless of pixel
   order. Fixed by (a) per-frame Fisher-Yates shuffle of all dot
   indices so neither field has a consistent z-position, and
   (b) approximately equiluminant colors (~150 each).

   **Open question / TODO:** verify that the Headquest-side stimuli
   don't have the same back-to-front-by-color blit. If they do, the
   same brightness illusion will be at play there.

4. **v4 — only one field translates.**
   Both fields translating turned out to be confusing rather than
   compelling. Switched to a single translating field (initially green,
   then red after v6) with the other field rotating continuously.

5. **v5 — add 500 ms inter-trial blank, reinit both fields at wrap.**
   Adds a clear reset between trials so the percept doesn't carry
   over. All dots get fresh random positions at the loop wrap; this
   only works cleanly *because* of the blank — both fields are
   invisible at wrap, so the position jump isn't seen.

6. **v6 — translating field = red (was green); trans duration 120 → 160 ms.**
   Gene's verdict: works, not super dramatic but the intended percept is there.

7. **v7 — drop density to 173 / field; use full experimental speeds.**
   Removed the demo-time 0.5× slow-mo on rotation (81 °/s) and
   translation (2.26 °/s). Density to 173 to match the 173-step of the
   original experimental series. Consequence: at experimental speed
   × 160 ms trans, displacement = 0.362° — that's 2× the experimental
   trans displacement of 0.181° (80 ms × 2.26 °/s). Still TBD whether
   to keep the longer trans for visibility or shrink to match the
   experimental displacement.

## Why the per-frame shuffle matters

`drawDots` originally batched all dots of one color into a single
`Path2D` and rendered it in one fill call (carried over from
`DensityDemo` for perf at high density). A single path fill has no
internal z-ordering — but between paths, the later one occludes the
earlier one. With two fields drawn back-to-front by color, one color
always wins overlap regions.

The shuffle replaces this with a per-dot draw loop: every dot gets its
own `beginPath`/`fill`, and the index order is re-shuffled each frame.
No persistent z-bias. Cost: ~2000 fillStyle changes + 2000 fills per
frame instead of 2 batched fills. Comfortably within Canvas2D budget on
modern iPads.

## Things that are NOT constant

Per individual dot, luminance is locked — same `fillStyle` every frame
it's visible. But these things still change over time:

- Hard onset of the delayed field at t = 750 ms (no ramp)
- Edge respawns when a dot drifts past the aperture or into the
  fixation exclusion ring — local pixel can flip bright↔dark in one
  frame even though no dot changed color
- Overlap pixels under the shuffled draw order — at any given pixel
  inside an overlap, the visible color flickers because the order
  changes each frame
- Onset/offset of all dots at the blank boundary (both fields → 0)

## Possible next moves (not yet tried)

- Longer trans (200-300 ms) for stronger percept
- Higher translation speed (the spec calls for 2.26 °/s, we're at half)
- Lower density (173 or 500 / field — high density can blur the percept)
- Slower rotation so it competes less with translation
- Soft onset ramp on the delayed field
- Headquest cross-check for the same per-color blit pattern
