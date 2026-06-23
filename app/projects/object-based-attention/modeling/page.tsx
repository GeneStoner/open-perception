import ContentBlurb from "@/components/ContentBlurb";
import TrajInputToggle from "@/components/TrajInputToggle";
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

      {/* ── The motion-competition model (Stoner & Blanc, 2010) ─────────────── */}
      <section className="space-y-8">
        {/* Section header — title + md subtitle (with clickable citation) + rule */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            The motion-competition model
          </h2>
          <ContentBlurb
            file="model-motion-competition-subtitle.md"
            className="mt-1 text-sm"
            style={{ color: "var(--text-secondary)" }}
          />
          <div className="mt-3 h-px w-12" style={{ background: "var(--accent)" }} />
        </div>

        <ContentBlurb
          file="model-motion-competition.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Model schematic: circuit + Stage-1 adapting channels */}
        <div id="figure-1" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden mx-auto max-w-2xl"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_circuit_adapting.png"
              alt="Motion-competition model: a divisively-normalized translation detector fed by two adapting rotation channels and a translation channel"
              width={1387}
              height={1381}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-circuit-caption.md"
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
              src="/figures/modeling/mt_rf_figure.png"
              alt="Two counter-rotating dot fields with an off-center MT receptive field; within it the rotations are locally approximate translations (clockwise up, counter-clockwise down)"
              width={1851}
              height={918}
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

        {/* Row-cascade: input -> adapt -> compete -> output */}
        <div id="figure-4" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/row_cascade.png"
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
          <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            The normalization model of attention
          </h2>
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
        <div id="figure-5" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_fig1_cued.png"
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
        <div id="figure-6" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_translation_response.png"
              alt="Translation-detector response over the trial for CUED vs UNCUED, computed with the verified R&H port: a fixed attentional gain on the cued direction yields a +43% cued advantage with no adaptation"
              width={1739}
              height={1255}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-rh-response-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Verification: the port reproduces all of R&H's published figures */}
        <ContentBlurb
          file="model-rh-verification.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
        <div id="figure-7" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_replication.png"
              alt="Our Python port of attentionModel.m reproduces all nine Reynolds & Heeger (2009) figures, overlaid on the authors' MATLAB output, to machine precision"
              width={2013}
              height={1643}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb
            file="model-rh-replication-caption.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* How the time-varying application differs from R&H's original */}
        <ContentBlurb
          file="model-rh-timevarying.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </section>

    </div>
  );
}
