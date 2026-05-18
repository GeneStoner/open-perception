import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import ContentBlurb from "@/components/ContentBlurb";
import ApkDownloads from "@/components/ApkDownloads";
import SignOutButton from "@/components/SignOutButton";
import VRDotsDemo from "@/components/VRDotsDemo";
import CatekReplicationResults from "@/components/CatekReplicationResults";
import CatekDemo from "@/components/CatekDemo";
import DensityResults from "@/components/DensityResults";
import DensityDemo from "@/components/DensityDemo";
import HighDensSwapResults from "@/components/HighDensSwapResults";

export default function CollaboratorDataPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Collaborators
        </h1>
        <SignOutButton />
      </div>

      {/* ── Experiment Software ──────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Experiment Software" subtitle="Meta Quest 3 · Sideload via SideQuest" />
        <ApkDownloads />
      </section>

      {/* ── Key Publications ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Key Publications" />
        <div
          className="rounded-lg border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <ContentBlurb file="collab-publications.md"
            className="text-sm leading-relaxed space-y-3" style={{ color: "var(--text-secondary)" }} />
        </div>
      </section>

      {/* ── Replication section ───────────────────────────────────────────────── */}
      <section className="space-y-10">
        <SectionHeader
          title="Replicating Published Research Using Meta Quest 3 VR Headsets"
        />

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
          <div className="grid grid-cols-2 gap-6">
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

        {/* ── Catek et al. (2022) ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionHeader title="Catek et al. (2022)" />

          {/* Stimulus comparison blurb */}
          <ContentBlurb
            file="collab-catek-comparison.md"
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          />

          {/* Live Catek demos */}
          <div className="space-y-4">
            <ContentBlurb file="collab-catek-demo-caption.md" className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} />
            <div className="grid grid-cols-4 gap-4">
              {([
                { swapType: "N",  label: "No Swap",         sub: "N" },
                { swapType: "M",  label: "Motion Swap",     sub: "M" },
                { swapType: "C",  label: "Color Swap",      sub: "C" },
                { swapType: "MC", label: "Motion+Color",    sub: "MC" },
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

          {/* Catek Fig 3 + VRDots replication side by side */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Catek et al. (2022) — Figure 3
              </p>
              <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <Image
                  src="/figures/catek2022/fig3.png"
                  alt="Catek et al. (2022) Figure 3: Behavioral results"
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
            {([63, 173, 500, 1000] as const).map(n => (
              <div key={n} className="space-y-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {n === 63 ? 'VRDots' : n === 173 ? 'HighDens' : n === 500 ? 'Peak' : 'UltraHigh'}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{n} dots/field — cued</p>
                </div>
                <DensityDemo dotsPerField={n} />
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

    </div>
  );
}
