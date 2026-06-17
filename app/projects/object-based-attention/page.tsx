import SectionHeader from "@/components/SectionHeader";
import ContentBlurb from "@/components/ContentBlurb";
import CounterRotationDemo from "@/components/CounterRotationDemo";
import VRDotsDemo from "@/components/VRDotsDemo";
import Link from "next/link";

export default function ObjectBasedAttentionPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">


      {/* ── Transparent Motion ───────────────────────────────────────────────── */}
      <section className="space-y-8">
        <SectionHeader title="Transparent Motion" />

        <ContentBlurb
          file="oba-transparent-motion-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Side-by-side demos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* Baseline */}
          <div className="flex flex-col gap-3">
            <div className="h-16 flex items-center justify-center">
              <ContentBlurb
                file="tm-demo-constant-title.md"
                className="text-sm font-semibold text-center"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <CounterRotationDemo swap={false} />
            <ContentBlurb
              file="tm-demo-constant-caption.md"
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

          {/* Swap every 500 ms */}
          <div className="flex flex-col gap-3">
            <div className="h-16 flex items-center justify-center">
              <ContentBlurb
                file="tm-demo-swap-title.md"
                className="text-sm font-semibold text-center"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
            <CounterRotationDemo swap={true} swapIntervalMs={500} />
            <ContentBlurb
              file="tm-demo-swap-caption.md"
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

        </div>
      </section>

      {/* ── Object-Based Attention ───────────────────────────────────────────── */}
      <section className="space-y-6">
        <SectionHeader title="Transparent Motion and Object-Based Attention" />
        <div className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <ContentBlurb file="oba-tagline.md" />
        </div>
        <ContentBlurb
          file="oba-object-based-intro.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        {/* Cued vs Uncued demos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <em>Cued</em> — delayed-onset field translates
            </p>
            <VRDotsDemo cued={true} swapType="none" />
            <ContentBlurb
              file="oba-delayed-onset-caption-cued.md"
              className="text-xs leading-relaxed pt-2"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <em>Uncued</em> — always-on field translates
            </p>
            <VRDotsDemo cued={false} swapType="none" />
            <ContentBlurb
              file="oba-delayed-onset-caption-uncued.md"
              className="text-xs leading-relaxed pt-2"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>

        {/* Cued vs Uncued demos — with motion + color swap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <em>Cued</em> — with motion + color swap
            </p>
            <VRDotsDemo cued={true} swapType="cm" />
            <ContentBlurb
              file="oba-delayed-onset-swap-caption-cued.md"
              className="text-xs leading-relaxed pt-2"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              <em>Uncued</em> — with motion + color swap
            </p>
            <VRDotsDemo cued={false} swapType="cm" />
            <ContentBlurb
              file="oba-delayed-onset-swap-caption-uncued.md"
              className="text-xs leading-relaxed pt-2"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>
      </section>

      {/* ── For the Curious ──────────────────────────────────────────────────── */}
      <section className="space-y-8">
        <SectionHeader title="For the Curious" />

        <div
          className="rounded-lg border p-6 text-sm leading-relaxed"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <ContentBlurb file="oba-for-the-curious.md" className="text-sm leading-relaxed" />
        </div>

        {/* Volunteer callout */}
        <div
          className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Have a Quest headset? Volunteer to be a subject.
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              We are recruiting remote observers. Participation takes about 30 minutes
              and requires a Meta Quest headset.
            </p>
          </div>
          <Link
            href="/projects/object-based-attention/volunteer"
            className="text-xs font-medium px-4 py-2 rounded border whitespace-nowrap self-start sm:self-auto"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Learn more →
          </Link>
        </div>
      </section>

      {/* ── Computational Modeling ───────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Computational Modeling" subtitle="Re-implementing the published accounts of surface-based selection" />
        <div
          className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Transparent, parameter-by-parameter models we can falsify against the VR data.
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Starting with the motion-competition model of Stoner &amp; Blanc (2010) — every
              prediction traces back to explicit neurons and equations.
            </p>
          </div>
          <Link
            href="/projects/object-based-attention/modeling"
            className="text-xs font-medium px-4 py-2 rounded border whitespace-nowrap self-start sm:self-auto"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Explore the models →
          </Link>
        </div>
      </section>

      {/* ── For Collaborators ────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="For Collaborators" subtitle="Access by invitation" />
        <div
          className="rounded-lg border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex-1 space-y-2">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Internal data, session logs, analysis scripts, and experimental protocols are available
              to invited collaborators. To request access contact{" "}
              <a href="mailto:Generstoner@gmail.com"
                style={{ color: "var(--accent)", textDecoration: "underline" }}>
                Generstoner@gmail.com
              </a>.
            </p>
          </div>
          <Link
            href="/projects/object-based-attention/collaborators"
            className="text-xs font-medium px-4 py-2 rounded border whitespace-nowrap self-start sm:self-auto"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Sign in →
          </Link>
        </div>
      </section>

    </div>
  );
}
