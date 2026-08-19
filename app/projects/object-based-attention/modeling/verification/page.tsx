import ContentBlurb from "@/components/ContentBlurb";
import Image from "next/image";
import Link from "next/link";

/* The R&H port verification, split off the modeling page on 2026-08-19.
   Critical, but not part of the argument — the modeling page links here rather
   than carrying it inline. Both content files are the SAME ones the modeling
   page used: model-rh-verification-detail.md (the tail of the old
   model-rh-verification.md, split off at GS's marker -- the summary paragraph
   stays on the modeling page and links here) and model-rh-replication-caption.md. */

export default function VerificationPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Link
          href="/projects/object-based-attention/modeling"
          className="text-xs font-medium"
          style={{ color: "var(--accent)" }}
        >
          ← Computational Modeling
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Verifying the implementation
        </h1>
      </div>

      <section className="space-y-8">
        <ContentBlurb
          file="model-rh-verification-detail.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />

        <div id="figure-1" className="space-y-3 scroll-mt-24">
          <div
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <Image
              src="/figures/modeling/rh_replication.png" unoptimized
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
      </section>

    </div>
  );
}
