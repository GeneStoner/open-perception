// SCRATCH route — the FRONT END figure, staged for review before it goes into the modeling
// page. It is intended to sit immediately after Figure 8 (the two V1 receptive fields), which
// would renumber Figures 9–18 to 10–19 across ten caption files plus in-text cross-references —
// so it waits here until that renumber is done deliberately, in one pass.
// Delete this route at the splice.
import ContentBlurb from "@/components/ContentBlurb";
import FigureZoom from "@/components/FigureZoom";

export default function ScratchFrontend() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          scratch — the front end
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Staging only. Column width matches the modeling page (max-w-5xl), so this is what it
          will look like spliced in after Figure 8. The stimulus and receptive field are imported
          from <code>ps_stimulus_common</code>, the same module Figures 2 and 8 use, so the
          receptive field here is literally the one Figure 8 marks.
        </p>
      </div>

      <div className="space-y-3 scroll-mt-24">
        <FigureZoom
          src="/figures/modeling/ps_frontend_figure.png"
          alt="Five stages left to right. 1: one V1 receptive field magnified, containing a single green dot with an arrow giving its instantaneous direction and its Gaussian weight labelled. 2: two tuning curves, direction and hue, each with eight channels ghosted and the one the dot drives drawn solid; the hue axis is labelled only RED and GREEN. 3: the raw drive as eight-channel bar graphs in a single dark ink, one for motion with the preferred direction of each channel in degrees, one for colour with RED and GREEN named and the other six channels marked by a swatch of the hue they prefer. 4: the same bars after the per-stream input normalization. 5: a box reading HYPERCOLUMN AND POINT-SET MODELS."
          width={2473}
          height={1319}
        />
        <ContentBlurb
          file="ps-frontend-caption.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>
    </div>
  );
}
