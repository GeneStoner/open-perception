import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import ContentBlurb from "@/components/ContentBlurb";
import ApkDownloads from "@/components/ApkDownloads";

export default function CollaboratorDataPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">

      <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
        Collaborators
      </h1>

      {/* ── Experiment Software ──────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Experiment Software" subtitle="Meta Quest 3 · Sideload via SideQuest" />
        <ApkDownloads />
      </section>

      {/* ── Key Publications ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Key Publications" />
        <div className="space-y-3">
          {[
            {
              authors: "Stoner, G. R. & Blanc, G.",
              year:    "2010",
              title:   "Exploring the mechanisms underlying surface-based stimulus selection",
              journal: "Vision Research, 50(2), 229–241",
              doi:     "https://doi.org/10.1016/j.visres.2009.11.015",
            },
            {
              authors: "Catek, M., Özkan, M., Kafaligonul, H. & Stoner, G. R.",
              year:    "2022",
              title:   "Behavioral and ERP evidence that object-based attention utilizes fine-grained spatial mechanisms",
              journal: "Cortex, 151, 89–104",
              doi:     "https://doi.org/10.1016/j.cortex.2022.02.013",
            },
          ].map(pub => (
            <div
              key={pub.doi}
              className="rounded-lg border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {pub.authors} ({pub.year})
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {pub.title}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {pub.journal}{" "}·{" "}
                <a
                  href={pub.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  {pub.doi.replace("https://doi.org/", "doi:")}
                </a>
              </p>
            </div>
          ))}
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

      </section>

    </div>
  );
}
