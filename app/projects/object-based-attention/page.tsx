import SectionHeader from "@/components/SectionHeader";
import ContentBlurb from "@/components/ContentBlurb";
import CounterRotationDemo from "@/components/CounterRotationDemo";
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
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Counter-rotation baseline
            </p>
            <CounterRotationDemo swap={false} />
            <ContentBlurb
              file="oba-demo-baseline-caption.md"
              className="text-xs leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>

          {/* Same + 500 ms swaps */}
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Same — field-membership swap every 500 ms
            </p>
            <CounterRotationDemo swap={true} swapIntervalMs={500} />
            <ContentBlurb
              file="oba-demo-swap-caption.md"
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
