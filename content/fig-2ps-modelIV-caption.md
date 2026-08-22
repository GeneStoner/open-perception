**Figure 11.** **Two point-sets — Model IV.** *Draft caption: a list of the points this figure has
to make, not finished prose.*

- **In our initial implementations only a direction-of-motion attentional bias is included.** The
  colour hypercolumn receives no bias of its own.
- **Each point-set reads its own V1 receptive field** — two different RFs inside one area-MT RF.
  Reading different receptive fields is what makes these two point-sets rather than two features
  of one thing.
- **A point-set is a motion hypercolumn *and* a colour hypercolumn**, bound by a single
  cooperative pool neuron that sums across both features. The cooperative scalar *C<sub>s</sub>*
  returns to both hypercolumns of its own point-set — that shared gain is what binds motion to
  colour, and it is the only route the cue has to colour.
- **One normalization pool, shared across both point-sets and both features**, so a single number
  divides every unit in the figure. This is why the four ÷ operators sit on one vertical bus. It
  is also the *only* place the two point-sets interact; everything else is strictly
  within-point-set.
- **The cooperation pools feed that normalizer.** Its denominator is exactly
  σⁿ + w[(1+C<sub>A</sub>)ⁿU<sub>A</sub> + (1+C<sub>B</sub>)ⁿU<sub>B</sub>], where
  U<sub>s</sub> is a pure stimulus constant — so the normalizer's only time-varying inputs are the
  two cooperation pools. This holds for **Model IV only**: under Model III the bias is a field on
  the drive, and the gain does not factor out.
- **The attentional bias is one field applied to both point-sets**, not one bias per point-set,
  and in Model IV it enters the *pool afferent* — after the response. Which operator it feeds is
  the one visible difference between Models III and IV.
- Directions are physical degrees (0° right, 90° up); the colour axis is opponent, red at 0° and
  green at 180°. Red and green are the actual stimulus colours and are labelled in words.
- **Schematic:** the profiles show shape, not measured values. The model is `toy_color.m` with the
  bias in the pool; n = 2 throughout.
