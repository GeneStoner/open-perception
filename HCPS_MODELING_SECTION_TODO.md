# ⛔ READ BEFORE TOUCHING THE HC/PS MODELING SECTION

**Status as of 2026-07-26: the modeling section is internally INCONSISTENT and must not be
published or presented as current.**

The model was reset on 2026-07-26 from a withdrawn operating point back to the native 11x11.
The schematic was regenerated. **The interactive viewer and the results figures were not.**
So the page currently shows two different models side by side:

| element | shows | status |
|---|---|---|
| `components/HCPSFlow.tsx` (schematic) | 121 point-sets, sigma 0.2424°, tau_E 150 ms | ✅ **CURRENT** — reads `lib/hcpsDefaults.ts`, generated from the model |
| `components/HCPSViewer.tsx` (interactive) | **64 point-sets, sigma 0.60°, tau_E 30 ms** | ⛔ **STALE** — `public/data/hcps_web_data.json` is the WITHDRAWN op point |
| `public/figures/modeling/hcps_measures.png` | withdrawn-op-point results | ⛔ **STALE** |
| `public/figures/modeling/hcps_swap.png` | withdrawn-op-point results | ⛔ **STALE** |
| `content/hcps-measures-caption.md` | "1.8–28.8 dots/deg²", "d′ 1.60 → 1.09" | ⛔ **STALE** on both counts |
| `content/hcps-swap-caption.md` | withdrawn-op-point numbers | ⛔ check before use |
| `content/hcps-summary.md`, `hcps-results-intro.md`, `hcps-future.md` | claims drawn from withdrawn results | ⛔ re-read against the current findings |

A reader comparing the schematic to the viewer directly beneath it is looking at two different
models. That is the thing to fix first.

---

## What is wrong with the stale numbers, specifically

1. **Withdrawn operating point.** sigma 0.30 → 0.60 also took the lattice 16x16 → 8x8, so RF
   size *and* point-set count changed together, out of a search criterion later shown invalid
   three ways. Withdrawn 2026-07-26.
2. **Wrong measurement windows.** Every index was read during the translation, when the cued
   surface had already stopped carrying the cued features. Corrected: primary/colour at frames
   15–19, translation at 22–26.
3. **Densities 11% too high.** 1.82/4.99/14.4/28.8 implies a 3.32° radius; the aperture is 3.5°.
   Correct values ≈ 1.64/4.50/12.99/25.98 — and even those are ESTIMATES (see below).
4. **Swap uncued arms were assumed, and wrongly.** Real values are on this site's own
   `HighDensSwapResults.tsx`.

## Also unresolved, and it affects the data page too

- The **density labels are estimates** (nominal count ÷ aperture area). Whether the Unity assets
  exclude the central fixation region is UNKNOWN — it would raise every value ~1.3%.
  **The Unity source is the authority.** Labels carry a leading `~` until then.
- **The experiment's translation lasts 80 ms; the model's probe is 50 ms.** Never reconciled.
  S&B used 40 ms, Çatak 133 ms.

---

## To rebuild the section

Everything needed is in the model repo. Full inventory:
**`pointset/logs/WEBSITE_ASSETS.md`**. Model spec and naming: **`pointset/logs/MODEL_SPEC.md`**.

    cd <pointset>
    hcps_default_check          % must PASS before regenerating anything
    hcps_export_params          % refreshes lib/hcpsDefaults.ts  (schematic)
    hcps_export_web             % refreshes public/data/hcps_web_data.json  (VIEWER)
    hcps_vs_human               % the model-vs-human figure

Then regenerate `hcps_measures.png` / `hcps_swap.png` from `hcps_windows.mat` and rewrite the
captions against `HC_PS_findings_2026-07-26.pdf`.

**Label every figure with the model identifier** — `PS-11 v1.0 "linear pool" #d0ea82` — which
`hcps_modelid()` generates. The hash is a fingerprint of the actual parameters, so a figure can
never again silently disagree with the model it claims to show. That is exactly how the
schematic came to display a withdrawn operating point for a day.
