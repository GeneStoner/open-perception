import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";
import TransSwapDemo from "./TransSwapDemo";

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
    <dt>swap (B only)</dt><dd>selected fraction of each field flips both color and direction simultaneously every N ms (interval varies per section); positions preserved</dd>
  </dl>
);

function Pair({
  density,
  swapFraction,
  swapIntervalMs,
}: {
  density: number;
  swapFraction: number;
  swapIntervalMs: number;
}) {
  const pct = Math.round(swapFraction * 100);
  const intervalLabel = swapIntervalMs >= 1000
    ? `${(swapIntervalMs / 1000).toFixed(swapIntervalMs % 1000 === 0 ? 0 : 1)} s`
    : `${swapIntervalMs} ms`;
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
          B — same + {intervalLabel} {pct}% exchange
        </h4>
        <p className="text-xs mb-3 text-center" style={{ color: "var(--text-secondary)" }}>
          {swapFraction === 1
            ? <>Every {intervalLabel}, <strong>all</strong> dots in each field flip both color and rotation direction — the two fields fully exchange identities (positions preserved).</>
            : <>Every {intervalLabel}, <strong>{pct}%</strong> of each field's dots flip both color and rotation direction (positions preserved).</>}
        </p>
        <Demo swap density={density} swapFraction={swapFraction} swapIntervalMs={swapIntervalMs} />
      </div>
    </div>
  );
}

function DensitySection({
  density,
  label,
  conditionNote,
  swapFraction = 0.5,
  swapIntervalMs = 500,
}: {
  density: number;
  label: string;
  conditionNote: string;
  swapFraction?: number;
  swapIntervalMs?: number;
}) {
  const intervalLabel = swapIntervalMs >= 1000
    ? `${(swapIntervalMs / 1000).toFixed(swapIntervalMs % 1000 === 0 ? 0 : 1)} s`
    : `${swapIntervalMs} ms`;
  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </h2>
      <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
        {conditionNote} · {dotsAt(density)} dots/field (derived: density × π × 4.5²) · {Math.round(swapFraction * 100)}% exchange every {intervalLabel}
      </p>
      <Pair density={density} swapFraction={swapFraction} swapIntervalMs={swapIntervalMs} />
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
        swapFraction={0.5}
        swapIntervalMs={500}
      />

      <DensitySection
        density={5}
        label="Density 5 dots/°² · matches Stoner & Blanc (2010)"
        conditionNote="Original S&B density: 63 dots in a 2° aperture ≈ 5 dots/°²"
        swapFraction={0.5}
        swapIntervalMs={500}
      />

      <DensitySection
        density={5}
        label="Density 5 dots/°² · Stoner & Blanc · 100% exchange"
        conditionNote="Same as above, but every swap flips every dot — full identity exchange between the two fields"
        swapFraction={1.0}
        swapIntervalMs={500}
      />

      <DensitySection
        density={5}
        label="Density 5 dots/°² · Stoner & Blanc · 100% exchange · 1 s interval"
        conditionNote="Same as above, but the swap fires once per second instead of twice"
        swapFraction={1.0}
        swapIntervalMs={1000}
      />

      <section className="mt-12">
        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          S&B field-membership swap + translation · no delayed onset · 50% coherent
        </h2>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          Trial-based (loops). Both fields visible from t=0. After 1050 ms of normal counter-rotation
          (green CW, red CCW), at <strong>trans onset</strong>: every dot flips field membership — color
          AND rotation direction swap simultaneously. Dots now in field 1 (originally green CW, now
          red CCW) begin 50%-coherent rightward translation; 50% translate in random directions.
          At <strong>trans end</strong> (240 ms later): translation stops. All dots rotate per their
          current (swapped) field — green CW, red CCW — restoring normal counter-rotation. The
          color-direction pairing is the same as pre-swap, but the underlying dot membership has
          changed. Then 500 ms post, 500 ms blank, loop restarts.
          Density 5 dots/°² (Stoner-Blanc).
        </p>
        <div className="flex justify-center">
          <div className="max-w-[420px] w-full">
            <TransSwapDemo density={5} />
          </div>
        </div>
      </section>
    </div>
  );
}
