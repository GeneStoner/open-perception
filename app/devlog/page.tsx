import ContentBlurb from "@/components/ContentBlurb";

const ENTRIES = [
  'devlog-002-fixation-shift.md',
  'devlog-001-replot-dissociation.md',
];

export default function DevLogPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">

      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-3"
          style={{ color: "var(--text-primary)" }}>Dev Log</h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          A running record of scientific and technical decisions — the questions behind the experiments,
          what surprised us, and what changed as a result. Not every session, just the ones worth thinking about.
        </p>
      </div>

      {ENTRIES.map((file) => (
        <article key={file}
          className="border-t pt-10 space-y-4"
          style={{ borderColor: "var(--border)" }}
        >
          <ContentBlurb
            file={file}
            className="text-sm leading-relaxed space-y-4"
            style={{ color: "var(--text-secondary)" }}
          />
        </article>
      ))}

    </div>
  );
}
