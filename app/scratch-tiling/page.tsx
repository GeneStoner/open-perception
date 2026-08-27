// SCRATCH route — Figure 1 (sampling) staged for review before it goes into the modeling
// page, whose figure numbering is hardcoded and must only be disturbed once.
// Delete before the splice.
import ContentBlurb from "@/components/ContentBlurb";
import FigureZoom from "@/components/FigureZoom";

export default function ScratchTiling() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          scratch — the tiled model, figures 1–5
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Staging only. Column width here matches the modeling page (max-w-5xl), so what you see
          is what it will look like once spliced in.
        </p>
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/hcps_tiling.png"
          alt="Three panels. A: the full arrangement of point-sets on concentric rings, one example highlighted in orange with the arc section marked. B: a zoomed wedge showing true point-set positions, the example and its two neighbours drawn at half-maximum extent. C: an arc section along one ring through the example, showing seven unit-peak Gaussian receptive-field profiles overlapping."
          width={2579}
          height={1066}
        />
        <ContentBlurb
          file="hcps-tiling-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/hcps_bias_map.png"
          alt="Two panels. A: the annulus of point-sets, each drawn as a short grey arrow pointing tangentially counter-clockwise, with a large curved arrow above marking the single global attentional state; three point-sets are circled in orange and numbered 1 to 3. B: three bar charts, one per circled point-set, showing the bias across eight direction channels; each peaks at a different channel, marked with an orange triangle."
          width={2579}
          height={1229}
        />
        <ContentBlurb
          file="hcps-bias-map-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/hcps_tiled_schematic.png"
          alt="A wide four-part schematic. A: the stimulus, an annulus of red and green dots with two curved arrows inside marking the two counter-rotating fields, and one point-set circled as its V1 receptive field. B: the circuit for one point-set, with motion and colour drive panels, multiply and divide operators, an attentional bias bar panel, and a cooperative pool E. C: the normalizer, a lattice of surrounding point-sets. D: three read-out boxes, MT translation, MST rotation and V4 colour."
          width={3154}
          height={2182}
        />
        <ContentBlurb
          file="hcps-tiled-schematic-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/hcps_transfer.png"
          alt="Three line plots. A: attention index against cue lead on a log axis, a high blue rotation curve and a low orange translation curve, both rising then levelling. B: the ratio of translation to rotation attention index against cue lead, rising then flat within error bars. C: attention index at PRE, TRANS and POST, rotation nearly flat and high, translation peaking at TRANS."
          width={2579}
          height={1100}
        />
        <ContentBlurb
          file="hcps-transfer-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/hcps_swap_headline.png"
          alt="Four bar-chart panels. A and B: attention index across four swap conditions for two stimulus geometries, all four bars positive and near-equal, with open diamonds marking a shorter cue lead. C and D: eight-alternative accuracy for the no-swap and motion-swap conditions, a solid dark blue cued bar well above a pale blue uncued bar in every case, with the cueing benefit bracketed above each pair."
          width={2520}
          height={1800}
        />
        <ContentBlurb
          file="hcps-swap-headline-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>
    </div>
  );
}
