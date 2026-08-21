import ContentBlurb from "@/components/ContentBlurb";
import TrajInputToggle from "@/components/TrajInputToggle";
import HCPSFlow from "@/components/HCPSFlow";
import HCPSViewer from "@/components/HCPSViewer";
import Image from "next/image";
import Link from "next/link";


export default function ModelingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Link
          href="/projects/object-based-attention"
          className="text-xs font-medium"
          style={{ color: "var(--accent)" }}
        >
          ← Object-Based Attention
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Computational Modeling
        </h1>
        <ContentBlurb
          file="model-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </div>

      {/* ── Non-object-based models ─────────────────────────────────────────── */}
      <section className="space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Non-object-based models
        </h2>

      {/* ── The motion-competition model (Stoner & Blanc, 2010) ─────────────── */}
      <section className="space-y-8">
        {/* Section header — title + md subtitle (with clickable citation) + rule */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            The motion-competition model
          </h3>
        </div>

        <ContentBlurb
          file="model-motion-competition.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Delayed-onset design — published figure (Çatak et al., 2022) */}
        <div id="figure-1" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden mx-auto max-w-lg"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/catek_fig1_original.png" unoptimized
              alt="Delayed-onset design (Çatak et al., 2022): the trial as a sequence of rotating transparent dot-field frames for cued and uncued, and the feature-direction timeline"
              width={986}
              height={1070}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-catek-design-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* MT RF: rotations are locally translatory (conceptual setup) */}
        <div id="figure-2" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/mt_rf_figure.png" unoptimized
              alt="(A) Two counter-rotating dot fields, arcs marking each field's rotation sense, with an off-center MT receptive field. (B) That receptive field magnified: local motion directions, counter-clockwise up and clockwise down"
              width={2040}
              height={1020}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-mt-rf-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Feature trajectories ⟷ model input (toggle) — S&B (2010) Fig. 4 */}
        <div id="figure-3" className="space-y-3 scroll-mt-24">
          <TrajInputToggle
            trajSrc="/figures/modeling/web_model_traj_sb4.png"
            inputSrc="/figures/modeling/web_model_input_sb4.png"
            width={2202}
            height={1080}
            trajAlt="Feature trajectories of the two dot fields (A-D), after Stoner & Blanc (2010) Fig. 4"
            inputAlt="The same panels with dot identity removed: the direction-of-motion input the model receives (A≡B, C≡D)"
          />
          <ContentBlurb
            file="model-traj-input-toggle-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Inputs (A) feeding the rotated biased-competition circuit (B) */}
        <div id="figure-4" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/model_inputs_circuit_combo.png" unoptimized
              alt="Part A, the directional input (Up/Right/Down over time, cued no-swap), aligned row-for-row with Part B, the rotated biased-competition circuit, so each direction channel feeds its Stage-1 neuron (Up to R1, Right to R_T, Down to R2)"
              width={2560}
              height={1316}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-circuit-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Row-cascade: input -> adapt -> compete -> output */}
        <div id="figure-5" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/row_cascade.png" unoptimized
              alt="Two-row cascade (CUED / UNCUED) showing the computation left to right: stimulus input, adapting responses, competition (I vs E), and detector output R_TD"
              width={2388}
              height={974}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-cascade-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>
      </section>

      {/* ── The normalization model of attention (Reynolds & Heeger, 2009) ──── */}
      <section className="space-y-8">
        {/* Section header — title + md subtitle (with clickable citation) + rule */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            The normalization model of attention
          </h3>
          <ContentBlurb
            file="model-rh-subtitle.md"
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          />
          <div className="mt-3 h-px w-12" style={{ background: "var(--accent)" }} />
        </div>

        <ContentBlurb
          file="model-rh-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* R&H Fig. 1 cascade run on the delayed-onset stimulus */}
        <div id="figure-6" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_fig1_cued.png" unoptimized
              alt="Reynolds & Heeger Figure 1 schematic, run on the delayed-onset stimulus: stimulus drive multiplied by the attention field then divided by the suppressive drive to give the population response, as direction-by-time grayscale maps"
              width={2560}
              height={1440}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-rh-cascade-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Translation-detector response: cued vs uncued under attention */}
        <div id="figure-7" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_translation_response.png" unoptimized
              alt="Translation-detector response over the trial for CUED vs UNCUED, computed with the verified R&H port: a fixed attentional gain on the cued direction yields a +43% cued advantage with no adaptation"
              width={1739}
              height={746}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-rh-response-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Verification: summary only -- the figure and detail live at ./verification */}
        <ContentBlurb
          file="model-rh-verification.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
        {/* How the time-varying application differs from R&H's original */}
        <ContentBlurb
          file="model-rh-timevarying.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </section>

      </section>{/* end Non-object-based models */}

      {/* ══════════════════════════════════════════════════════════════════════
          INSERTION POINT — the simpler models go HERE, before the full model:
            1. a single hypercolumn (motion + colour, one shared pool)
            2. a minimal pair of point-sets (the smallest thing with space in it)
          Each will be its own <section>, same shape as the one below:
          header → prose → schematic → result → caption.
         ══════════════════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════════════════
          OBJECT-BASED MODELS — the new material goes here.

          Titles are GS's, tentative. Nothing below this block has been touched:
          the existing hypercolumn / point-set section stays as it is until we
          decide how much of it survives, so it is still its own <h2> sibling
          rather than nested under this one. Folding it in later means demoting
          its heading to <h3> and moving the closing tag of this section down
          past it.
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Object-based models
        </h2>

      {/* ── V1 point-sets as the unit of selection ───────────────────────────── */}
      <section className="space-y-8">
        {/* Section header — title, matching the h3 sections above */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Area V1 point-sets as the unit of object-based selection
          </h3>
        </div>

        {/* FIGURES PLACED 2026-08-21 to see how the section flows. Captions are
            DRAFTS and the figures themselves are still to be tweaked. Prose
            introducing them is deliberately still absent. */}

        {/* Two V1 receptive fields on the transparent-motion stimulus */}
        <div id="figure-8" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/ps_two_rf_figure.png" unoptimized
              alt="Two V1 receptive fields on the transparent-motion stimulus: panel A places two small receptive fields on the counter-rotating dot fields, panel B magnifies both to show the dot paths through the probe"
              width={2040}
              height={1020}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="ps-two-rf-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Model III schematic */}
        <div id="figure-9" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/fig_modelIII_profile.png" unoptimized
              alt="Model III schematic: the attentional bias acts on the stimulus drive, with a tuned bias field and a flat cooperative scalar summed in a gain box that then multiplies the drive"
              width={2380}
              height={2102}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="fig-modelIII-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Model IV schematic */}
        <div id="figure-10" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/fig_modelIV_profile.png" unoptimized
              alt="Model IV schematic: no tuned field reaches the gain, which is a single cooperative scalar; the attentional bias instead multiplies the hypercolumn response on its way to the cooperative pool"
              width={2380}
              height={2102}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="fig-modelIV-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

      </section>

      </section>{/* end Object-based models */}

      {/* ── The hypercolumn / point-set model ────────────────────────────────── */}
      <section className="space-y-8">
        {/* Section header — title + md subtitle + rule */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            The hypercolumn / point-set model
          </h2>
          <ContentBlurb
            file="hcps-subtitle.md"
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          />
          <div className="mt-3 h-px w-12" style={{ background: "var(--accent)" }} />
        </div>

        <ContentBlurb
          file="hcps-simpler-note.md"
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        />

        <ContentBlurb
          file="hcps-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Architecture, left to right */}
        <div id="figure-11" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-x-auto"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="min-w-[720px] p-4">
              <HCPSFlow />
            </div>
          </div>
          <ContentBlurb
            file="hcps-flow-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Results
          </h3>
          <div className="mt-2 h-px w-8" style={{ background: "var(--border)" }} />
        </div>

        <ContentBlurb
          file="hcps-results-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Measures grid: noise-free AI vs behavioural d' ratio */}
        <div id="figure-12" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/hcps_measures.png"
              alt="Two panels. Left: the noise-free attention index against density, one line per field speed, positive everywhere and falling with both density and speed. Right: the same runs read out behaviourally as a d-prime ratio, with the human reference dashed well above the model curves."
              width={1520}
              height={660}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="hcps-measures-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Swap test */}
        <div id="figure-13" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/hcps_swap.png"
              alt="Swap test across density at four field speeds, for no-swap, motion-swap and motion-plus-colour-swap conditions, in both the noise-free and behavioural read-outs, with human no-swap and MC-swap references overlaid."
              width={1600}
              height={730}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="hcps-swap-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* ── Interactive display ─────────────────────────────────────────── */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Watch the model run
          </h3>
          <div className="mt-2 h-px w-8" style={{ background: "var(--border)" }} />
        </div>

        <div id="figure-14" className="space-y-3 scroll-mt-24">
          <HCPSViewer />
          <ContentBlurb
            file="hcps-viewer-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            What the model shows
          </h3>
          <div className="mt-2 h-px w-8" style={{ background: "var(--border)" }} />
        </div>

        <ContentBlurb
          file="hcps-summary.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* ── Future directions ───────────────────────────────────────────── */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Where it goes next
          </h3>
          <div className="mt-2 h-px w-8" style={{ background: "var(--border)" }} />
        </div>

        <ContentBlurb
          file="hcps-future.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </section>

    </div>
  );
}
