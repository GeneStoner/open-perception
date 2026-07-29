<!-- ============================================================================
     STALE as of 2026-07-26 — numbers come from the WITHDRAWN operating point
     (sigma 0.60 deg, 8x8 lattice, tau_E 30 ms) and/or the pre-correction densities
     (11%% too high) and the wrong measurement windows.
     DO NOT publish without regenerating. See HCPS_MODELING_SECTION_TODO.md.
     ============================================================================ -->

**The mechanism works, and it works for the reason we wanted it to.** A bias applied to one attribute, entering a pool shared across attributes at a place, transfers to the other attributes of the same surface — with no object label anywhere in the model. Attending a direction lifts a colour that was never cued, because the dots carrying both are in the same receptive fields.

**Spatial scale turned out to be the binding constraint, and it is not a free parameter.** The gain lives in the pool, which is a map over *places*, while the surfaces *move*. Sweeping speed to the point of failure shows the effect dies once a dot travels about **1.3 receptive-field sigmas** during the interval the pool has to bridge — the same constant for every RF size tested. That gives a hard ceiling,

*v*_crit ≈ 1.3 σ / (τ_E + probe duration),

which is ~9.8°/s at the current settings. The rim of the human stimulus sits at about half of it, which is why σ = 0.60° works and σ = 0.30° does not; at the smaller size the index actually reverses inside the range the observers were tested in. Enlarging the receptive field or lengthening the pool's time constant *moves* this ceiling. Nothing in the present architecture *removes* it.

**The amplitude is right and the behaviour is not.** The noise-free index is positive across the whole stimulus range, but the behavioural *d′* ratio reaches only ~1.6 where observers show ~2.9, and it keeps falling where the human curve is flat. Two things follow, and both are quantitative rather than matters of taste. Under independent Poisson noise with a gain mechanism, *d′* scales as the square root of response, so the *d′* ratio is roughly the square root of the response ratio — which means matching the human effect by response gain alone would need an ~8× enhancement of firing rate. Attentional rate modulation in visual cortex is tens of percent. And pooling more neurons cannot rescue it either, because recruitment raises cued and uncued alike and leaves their *ratio* untouched. Recruitment can explain why performance does not collapse; it cannot explain how large the effect is.

**So the model is not short of gain — it is using gain to do a job that selection does better.** That, rather than any parameter, is what the next round should test.
