import SectionHeader from "@/components/SectionHeader";
import ContentBlurb from "@/components/ContentBlurb";
import ApkDownloads from "@/components/ApkDownloads";
import SignOutButton from "@/components/SignOutButton";

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

    </div>
  );
}
