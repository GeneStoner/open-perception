import Link from "next/link";
import OBADemo from "@/components/OBADemo";
import HeroPanel from "@/components/HeroPanel";
import ContentBlurb from "@/components/ContentBlurb";

export default function Home() {
  return (
    <div>
      {/* Under-construction notice */}
      <div
        className="w-full text-center text-xs py-2 px-4"
        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
      >
        This site is actively under development — content and features are incomplete and subject to change.
      </div>

      {/* Hero */}
      <section
        className="relative px-6 py-24 text-center"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-5">
          <HeroPanel />
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Open Perception is a platform for distributed psychophysical and neuroscientific experimentation.
          </p>
        </div>
      </section>

      {/* Two-column blurb: The Platform / Why VR */}
      <section
        className="max-w-5xl mx-auto px-6 py-14"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--text-muted)" }}>The Platform</h2>
            <ContentBlurb
              file="home-platform.md"
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--text-muted)" }}>Why VR for Psychophysics</h2>
            <ContentBlurb
              file="home-why-vr.md"
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </div>
      </section>

      {/* How to participate */}
      <section
        className="max-w-5xl mx-auto px-6 py-14"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h2 className="text-xs uppercase tracking-[0.2em] mb-8 text-center"
          style={{ color: "var(--text-muted)" }}>Participate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Researcher path */}
          <Link href="/projects/object-based-attention/collaborators/signin" className="block group">
            <div
              className="rounded-lg border p-6 h-full transition-colors group-hover:border-[var(--accent)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                I&apos;m a researcher
              </p>
              <ContentBlurb
                file="home-researcher.md"
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              />
              <p className="text-xs mt-4" style={{ color: "var(--accent)" }}>
                Sign in →
              </p>
            </div>
          </Link>

          {/* Volunteer path */}
          <Link href="/projects/object-based-attention/volunteer" className="block group">
            <div
              className="rounded-lg border p-6 h-full transition-colors group-hover:border-[var(--accent)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                I&apos;m a volunteer participant
              </p>
              <ContentBlurb
                file="home-volunteer.md"
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              />
              <p className="text-xs mt-4" style={{ color: "var(--accent)" }}>
                Learn more →
              </p>
            </div>
          </Link>

        </div>
      </section>

      {/* Current Project */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <section>
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-10 text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Current Project
          </h2>
          <div className="flex flex-wrap gap-12 justify-center">
            <div className="flex flex-col items-center gap-4">
              <p
                className="text-sm font-semibold tracking-wide text-center"
                style={{ color: "var(--text-primary)" }}
              >
                Transparent Motion and Object-Based Attention
              </p>
              <Link href="/projects/object-based-attention">
                <div
                  className="rounded-full overflow-hidden cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    width: 320,
                    height: 320,
                    border: "2px solid var(--border)",
                    background: "#000",
                  }}
                >
                  <OBADemo />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
