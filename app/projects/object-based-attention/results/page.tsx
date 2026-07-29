import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import ContentBlurb from "@/components/ContentBlurb";
import VRDotsDemo from "@/components/VRDotsDemo";
import CatekReplicationResults from "@/components/CatekReplicationResults";
import CatekDemo from "@/components/CatekDemo";
import DensityResults from "@/components/DensityResults";
import DensityDemo from "@/components/DensityDemo";
import HighDensSwapResults from "@/components/HighDensSwapResults";

const DENSITY_LEVELS = [
  { dotsPerField: 63,   label: 'VRDots',    densityLabel: '~1.6 dots/deg²/field' },
  { dotsPerField: 173,  label: 'HighDens',  densityLabel: '~4.5 dots/deg²/field' },
  { dotsPerField: 500,  label: 'Peak',      densityLabel: '13 dots/deg²/field'   },
  { dotsPerField: 1000, label: 'UltraHigh', densityLabel: '26 dots/deg²/field'   },
] as const;

export default function ResultsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Replicating and Extending Published Research using Meta Quest 3 V4 Headsets
        </h1>
      </div>

      {/* ── Replication section ───────────────────────────────────────────────── */}
      <section className="space-y-10">

        {/* Figures 1 & 5 side by side */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 items-start">
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Image
                src="/figures/sb2010/fig1.png"
                alt="Figure 1: Delayed-onset design"
                width={1347}
                height={1553}
                className="w-full h-auto"
              />
            </div>
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Image
                src="/figures/sb2010/fig5.png"
                alt="Figure 5: Feature trajectories, Experiment 2"
                width={1347}
                height={1266}
                className="w-full h-auto"
              />
            </div>
          </div>
          <ContentBlurb
            file="collab-fig1-5.md"
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />
        </div>

        {/* Stimulus comparison blurb */}
        <ContentBlurb
          file="collab-stimulus-comparison.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Live stimulus demos */}
        <div className="space-y-4">
          <ContentBlurb file="collab-sb-demo-caption.md" className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {([
              { cued: true,  swapType: "none", label: "No Swap — Cued",               sub: "Red field onset precedes green by 750 ms" },
              { cued: false, swapType: "none", label: "No Swap — Uncued",              sub: "Both fields onset simultaneously" },
              { cued: true,  swapType: "cm",   label: "Color + Motion Swap — Cued",   sub: "Features exchange during translation" },
              { cued: false, swapType: "cm",   label: "Color + Motion Swap — Uncued", sub: "Swap without temporal onset cue" },
            ] as const).map(({ cued, swapType, label, sub }) => (
              <div key={label} className="space-y-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
                </div>
                <VRDotsDemo cued={cued} swapType={swapType} />
              </div>
            ))}
          </div>
        </div>

        {/* Figure 7 + VRDots replication side by side */}
        <div className="grid grid-cols-2 gap-6 items-start">

          {/* Left: S&B Figure 7 */}
          <div className="flex flex-col h-full space-y-3">
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Image
                src="/figures/sb2010/fig7.png"
                alt="Figure 7: Results of Experiment 2"
                width={1347}
                height={830}
                className="w-full h-auto"
              />
            </div>
            <div
              className="flex-1 rounded border border-dashed p-4"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <ContentBlurb file="collab-fig7.md" className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            </div>
          </div>

          {/* Right: VRDots replication */}
          <div className="flex flex-col h-full space-y-3">
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <Image
                src="/figures/sb2010/vrdots_replication.png"
                alt="VRDots replication of S&B Experiment 2"
                width={970}
                height={406}
                className="w-full h-auto"
              />
            </div>
            <div
              className="flex-1 rounded border border-dashed p-4"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <ContentBlurb file="collab-vrdots.md" className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            </div>
          </div>

        </div>

        {/* ── Çatak et al. (2022) ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionHeader title="Çatak et al. (2022)" />

          <ContentBlurb
            file="collab-catek-comparison.md"
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />

          {/* Live Çatak demos */}
          <div className="space-y-4">
            <ContentBlurb file="collab-catek-demo-caption.md" className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            <div className="grid grid-cols-4 gap-4">
              {([
                { swapType: "N",  label: "No Swap",      sub: "N" },
                { swapType: "M",  label: "Motion Swap",  sub: "M" },
                { swapType: "C",  label: "Color Swap",   sub: "C" },
                { swapType: "MC", label: "Motion+Color", sub: "MC" },
              ] as const).map(({ swapType, label, sub }) => (
                <div key={swapType} className="space-y-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub} — cued</p>
                  </div>
                  <CatekDemo cued={true} swapType={swapType} />
                </div>
              ))}
            </div>
          </div>

          {/* Çatak Fig 3 + VRDots replication side by side */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Çatak et al. (2022) — Figure 3
              </p>
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <Image
                  src="/figures/catek2022/fig3.png"
                  alt="Çatak et al. (2022) Figure 3: Behavioral results"
                  width={1201}
                  height={1200}
                  className="w-full h-auto"
                />
              </div>
              <ContentBlurb file="collab-catek-fig3.md"
                className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                VRDots Replication
              </p>
              <CatekReplicationResults />
            </div>
          </div>
        </div>

        {/* ── Dot Density ──────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <SectionHeader title="Dot Density" />
          <ContentBlurb file="collab-density-intro.md"
            className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }} />

          {/* Density demos */}
          <div className="grid grid-cols-4 gap-4">
            {DENSITY_LEVELS.map(({ dotsPerField, label, densityLabel }) => (
              <div key={dotsPerField} className="space-y-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{densityLabel} — cued</p>
                </div>
                <DensityDemo dotsPerField={dotsPerField} />
              </div>
            ))}
          </div>

          {/* Density chart */}
          <DensityResults />

          {/* High-density + MC swap */}
          <div className="space-y-4">
            <SectionHeader title="Motion+Color Swap at High Density" />
            <ContentBlurb file="collab-highdensswap-intro.md"
              className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            <HighDensSwapResults />
          </div>
        </div>

      </section>

      {/* ── Computational Modeling (older version — for review) ──────────────── */}
      <section className="space-y-10">
        <SectionHeader
          title="Modeling"
          subtitle="Re-implementing the published accounts, then testing them against the VR data"
        />

        <ContentBlurb file="model-intro.md"
          className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }} />

        {/* Biased-competition circuit (Reynolds et al. 1999) */}
        <div className="space-y-3">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_circuit.png"
              alt="Biased-competition circuit (Reynolds et al. 1999) mapped onto MT/MST and V1"
              width={1767}
              height={1188}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb file="model-circuit-caption.md"
            className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
        </div>

        {/* Feature trajectories — no-swap + motion-swap (Figs. 1B & 4) */}
        <div className="space-y-3">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_motionswap.png"
              alt="Feature trajectories, no-swap and motion-swap — Stoner & Blanc (2010) Figs. 1B & 4"
              width={2202}
              height={1130}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb file="model-trajectories-caption.md"
            className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
        </div>

        {/* Directional inputs — all four trial types */}
        <div className="space-y-3">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_inputs.png"
              alt="Directional inputs S(t) across all four trial types"
              width={2697}
              height={1159}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb file="model-inputs-caption.md"
            className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
        </div>

        {/* Model responses — all four trial types (no-swap + swap) */}
        <div className="space-y-3">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_responses.png"
              alt="Model responses across all four trial types — cued advantage and its reversal under motion swap"
              width={2697}
              height={1647}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb file="model-responses-caption.md"
            className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
        </div>

        {/* Colour-swap feature trajectories (Fig. 5 idiom) — model is colour-blind */}
        <div className="space-y-3">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/web_model_colorswap.png"
              alt="Colour-swap feature trajectories — identity (line style) is invariant; the model is colour-blind"
              width={2202}
              height={1130}
              className="w-full h-auto"
            />
          </div>
          <ContentBlurb file="model-colorswap-caption.md"
            className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
        </div>

      </section>

    </div>
  );
}
