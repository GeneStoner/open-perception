<!-- ============================================================================
     STALE as of 2026-07-26 — numbers come from the WITHDRAWN operating point
     and/or the pre-correction densities (11%% too high) and the wrong measurement
     windows.
     VERIFIED 2026-08-28 against the generator, hcps_swap_test.m: v1grid 16 (a 16x16
     lattice, NOT 8x8), tauE 3 frames = 30 ms, ffFloor 2 (withdrawn 2026-07-24 as
     "not part of the native foundation"), kappa 60 deg ~ 1.05, 2AFC read-out.
     The CURRENT point is tauE 20 ms, ffFloor 1, kappa 2, and Figure 17 is 8-AFC.
     hcps_step3_grid.m (Figure 19) is the SAME withdrawn configuration.
     DO NOT publish without regenerating. See HCPS_MODELING_SECTION_TODO.md.
     ============================================================================ -->

**Figure 20.** **The feature-swap test.** At the moment the probe begins, the non-translating field can reverse its motion (*motion swap*) and the two fields can exchange colours (*MC swap*) — the manipulation that asks whether the cue follows the surface or its features. Each panel is one field speed; human no-swap and MC-swap references are dashed and dotted. Two things to note. The model's MC-swap benefit **tracks the no-swap condition at every density**, whereas the observers lose it entirely at the highest density (1.04 versus 2.16). And the *motion-swap* condition sits slightly **above** no-swap — but that ordering belongs to this run, not to the model. These panels come from a superseded operating point (a 16×16 lattice, τ_E 30 ms, `ffFloor` 2); on the tiled model at the current τ_E 20 ms ([Figure 17](#figure-17)) motion-swap sits very slightly *below* no-swap, +0.130 against +0.144 — about one standard error, so the two are indistinguishable either way. Reproducing the density × swap interaction remains the model's outstanding failure.
