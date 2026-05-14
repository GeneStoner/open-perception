import SectionHeader from "@/components/SectionHeader";
import ContentBlurb from "@/components/ContentBlurb";
import Link from "next/link";

export default function InstallGuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">

      <div>
        <Link
          href="/projects/object-based-attention/collaborators/data"
          className="text-xs"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          ← Back to collaborator page
        </Link>
        <h1
          className="mt-4 text-3xl font-semibold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Installing on Meta Quest 3
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Sideloading a VRDots APK via SideQuest
        </p>
      </div>

      <div
        className="rounded-lg border p-8 space-y-4 text-sm leading-relaxed"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <ContentBlurb file="sidequest-install.md" className="space-y-4 text-sm leading-relaxed" />
      </div>

    </div>
  );
}
