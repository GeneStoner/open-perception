# counter-rotation-swap — design notes

Two-panel demo:

- **A (left)**: two counter-rotating dot fields. Field 0 (green) CW, field 1 (red) CCW. No delayed onset, no translation, no events. Just continuous counter-rotation. Acts as the baseline.
- **B (right)**: identical baseline, plus **every 500 ms, half of each field's dots simultaneously flip both their color and rotation direction**. Dot position is preserved across the swap.

## Parameters (shared between A and B)

| param           | value |
| --------------- | ----- |
| aperture        | 4.5° (135 px) |
| density         | 13 dots/°² (= experimental 500 condition) |
| dots / field    | 287 (derived: density × π × 4.5²) |
| rotation speed  | 81 °/s (experimental) |
| dot radius      | 0.04° (experimental) |
| colors          | green `rgb(90,180,90)`, red `rgb(230,110,110)` (≈ equiluminant) |
| draw order      | per-frame Fisher-Yates shuffle (no z-bias) |
| swap interval (B) | 500 ms |

## Why "symmetric exchange"

Naive implementation: flip half of field 0 → field 1, then flip half of field 1 → field 0.
Bug: after step 1, "field 1" includes the just-flipped dots, so step 2 is drawing from a different population than intended.

Correct implementation (used here): capture each field's roster *before* any flips, then flip half of each captured set. Keeps the exchange genuinely symmetric and total counts per field stable at N_PER_FIELD on average.

## What this is testing

The percept of "two surfaces" in counter-rotating dot fields could be supported by:
1. **Field/color identity** — each dot is bound to its surface by its color.
2. **Local motion coherence** — each dot is bound to its surface by its rotation direction (and thus its local neighbors).

In B, every 500 ms half of each surface's dots are simultaneously reassigned in both color AND direction. If the percept is color-bound, the surfaces should appear to swap halves. If it's motion-coherence-bound, the surfaces should still look like two counter-rotating fields, with the swapped dots looking like noise being "captured" by the other surface.

## Open questions / follow-ups

- Try unsynchronized swaps (each dot has its own random swap interval) vs. the current synchronized hard-edge swap
- Try swapping just color (not direction) or just direction (not color) to dissociate
- Try varying the swap fraction (currently exactly 50%)
- Compare to a control where swapped dots also jump to a random position — would the percept survive position discontinuity?
