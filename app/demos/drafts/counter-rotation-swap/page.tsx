import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

const APERTURE_DEG = 4.5;
const APERTURE_AREA_DEG2 = Math.PI * APERTURE_DEG * APERTURE_DEG;
const dotsAt = (density: number) => Math.round(density * APERTURE_AREA_DEG2);

const sharedParams = (
  <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-secondary)" }}>
    <dt>aperture</dt><dd>4.5° (135 px)</dd>
    <dt>rotation speed</dt><dd>experimental (81 °/s)</dd>
    <dt>green field</dt><dd>rotates CW</dd>
    <dt>red field</dt><dd>rotates CCW</dd>
    <dt>dot radius</dt><dd>0.04° (experimental)</dd>
    <dt>swap interval (B only)</dt><dd>500 ms — half of each field flips both color and direction simultaneously, position preserved</dd>
  </dl>
);

function Pair({ density }: { density: number }) {
  return (
    <div className="flex flex-wrap gap-6 justify-center mt-4">
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "var(--text-primary)" }}>
          A — counter-rotation baseline
        </h4>
        <p className="text-xs mb-3 text-center" style={{ color: "var(--text-secondary)" }}>
          Both fields visible continuously, each dot stays in its field (no events).
        </p>
        <Demo density={density} />
      </div>
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "var(--text-primary)" }}>
          B — same + 500 ms membership swap
        </h4>
        <p className="text-xs mb-3 text-center" style={{ color: "var(--text-secondary)" }}>
          Every 500 ms, half of each field's dots flip both color and rotation direction (position preserved).
        </p>
        <Demo swap density={density} />
      </div>
    </div>
  );
}

function DensitySection({
  density,
  label,
  conditionNote,
}: {
  density: number;
  label: string;
  conditionNote: string;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </h2>
      <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
        {conditionNote} · {dotsAt(density)} dots/field (derived: density × π × 4.5²)
      </p>
      <Pair density={density} />
    </section>
  );
}

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeader title="counter-rotation + membership swap" />
      {sharedParams}

      <DensitySection
        density={13}
        label="Density 13 dots/°² · matches experimental 500 condition"
        conditionNote="Higher-density follow-up series"
      />

      <DensitySection
        density={5}
        label="Density 5 dots/°² · matches Stoner & Blanc (2010)"
        conditionNote="Original S&B density: 63 dots in a 2° aperture ≈ 5 dots/°²"
      />
    </div>
  );
}
