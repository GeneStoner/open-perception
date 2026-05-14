import Link from "next/link";
import OBADemo from "@/components/OBADemo";
import HeroPanel from "@/components/HeroPanel";
import ContentBlurb from "@/components/ContentBlurb";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative px-6 py-24 text-center"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-5">

          {/* "Open Perception" logo — rare peek-a-boo reveal */}
          <HeroPanel />

          {/* Tagline */}
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: "var(--text-secondary)" }}
          >
            Open Perception is a platform for distributed psychophysical and neuroscientific experimentation.
          </p>
        </div>
      </section>

      {/* Blurb */}
      <section
        className="max-w-2xl mx-auto px-6 py-14"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <ContentBlurb
          file="home-blurb.md"
          className="text-sm leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        />
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Research Portals */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-10 text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            Research Portals
          </h2>

          <div className="flex flex-wrap gap-12 justify-center">

            {/* Transparent Motion portal */}
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
