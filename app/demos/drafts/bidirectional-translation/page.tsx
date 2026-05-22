import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

const APERTURE_DEG = 4.5;
const APERTURE_AREA_DEG2 = Math.PI * APERTURE_DEG * APERTURE_DEG;
const dotsAt = (density: number) => Math.round(density * APERTURE_AREA_DEG2);
const EXPERIMENTAL_DOT_RADIUS_DEG = 0.04;

const sharedParams = (
  <div className="text-xs mb-6 space-y-3" style={{ color: "var(--text-muted)" }}>
    <p>
      <strong style={{ color: "#e8eaf0" }}>About sizes.</strong>{" "}
      The true visual angle these demos subtend depends on your viewing
      distance and display, neither of which we know. So all sizes below
      are stated relative to the <strong>aperture diameter D</strong> —
      the visible dot circle in each panel. The short horizontal bar just
      below each aperture is the scale reference: it spans{" "}
      <strong>¼ D</strong>. Original experimental values (in degrees of
      visual angle, at the experimental viewing distance) are given in
      parentheses for reference only.
    </p>
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      <dt>aperture (D)</dt><dd>the visible dot circle (270 canvas px ≈ 9° at experimental scale)</dd>
      <dt>scale bar</dt><dd>¼ D, drawn below each aperture</dd>
      <dt>fixation ring (outer Ø)</dt><dd>20% of D (1.8° experimental)</dd>
      <dt>fixation exclusion zone (Ø)</dt><dd>24% of D — dots never enter this central region (2.2° experimental)</dd>
      <dt>dot diameter (default)</dt><dd>≈0.9% of D (0.08° experimental)</dd>
      <dt>dot diameter (larger)</dt><dd>≈1.1% of D — 25% larger than default (0.10° experimental, sections 4–5)</dd>
      <dt>translation per trial</dt><dd>≈3% of D — distance a coherent dot moves during the 120 ms trans window (0.27° experimental)</dd>
      <dt>rotation rate</dt><dd>81 °/s about the aperture centre (≈ 0.22 turns/s, same at any viewing distance)</dd>
      <dt>green field</dt><dd>rotates CW; translates LEFT if it's a translating field</dd>
      <dt>red field</dt><dd>rotates CCW; translates RIGHT if it's a translating field</dd>
      <dt>timing</dt><dd>solo 750 / pre-trans 300 / <strong>trans 120</strong> / post 500 / blank 500 ms — loops</dd>
    </dl>
  </div>
);

function Pair({
  bothTranslate,
  density,
  coherenceFraction,
  dotRadiusDeg,
  colorSwap = false,
}: {
  bothTranslate: boolean;
  density: number;
  coherenceFraction: number;
  dotRadiusDeg: number;
  colorSwap?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
          delayed: <span style={{ color: "rgb(230,110,110)" }}>red</span>
        </p>
        <Demo delayedField={1} bothTranslate={bothTranslate} density={density} coherenceFraction={coherenceFraction} dotRadiusDeg={dotRadiusDeg} colorSwap={colorSwap} />
      </div>
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
          delayed: <span style={{ color: "rgb(90,180,90)" }}>green</span>
        </p>
        <Demo delayedField={0} bothTranslate={bothTranslate} density={density} coherenceFraction={coherenceFraction} dotRadiusDeg={dotRadiusDeg} colorSwap={colorSwap} />
      </div>
    </div>
  );
}

function DensitySection({
  density,
  experimentalCondition,
  coherenceFraction = 0.5,
  dotRadiusDeg = EXPERIMENTAL_DOT_RADIUS_DEG,
  colorSwap = false,
}: {
  density: number;
  experimentalCondition: string;
  coherenceFraction?: number;
  dotRadiusDeg?: number;
  colorSwap?: boolean;
}) {
  const count = dotsAt(density);
  const coherencePct = Math.round(coherenceFraction * 100);
  const isLargerDot = dotRadiusDeg !== EXPERIMENTAL_DOT_RADIUS_DEG;
  const headerExtras = [
    isLargerDot ? `${dotRadiusDeg}° dots` : null,
  ].filter(Boolean).join(" · ");
  const variantSuffix = colorSwap ? " · color-swap variant" : "";
  return (
    <section className="mt-12">
      {colorSwap && (
        <div className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-widest rounded"
             style={{ background: "rgb(120,60,140)", color: "#fff" }}>
          Color-swap control
        </div>
      )}
      <h2 className="text-base font-semibold mb-1" style={{ color: "#e8eaf0" }}>
        Density {density} dots/°² · {coherencePct}% coherent{headerExtras ? " · " + headerExtras : ""}
      </h2>
      <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        Matches experimental {experimentalCondition} condition · {count} dots/field
        {isLargerDot && ` · dot diameter ≈1.1% of D (${dotRadiusDeg}° radius experimental — ${(dotRadiusDeg / EXPERIMENTAL_DOT_RADIUS_DEG * 100 - 100).toFixed(0)}% larger than experimental dot)`}
        {colorSwap && " · at trans onset the two fields swap colors and stay swapped — tests whether the effect is tied to color identity. Note: the swap is instantaneous on one frame, producing a salient global chromatic transient that is itself a visible event."}
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#e8eaf0" }}>
        Variant A — only red translates{variantSuffix}
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        {coherenceFraction === 1
          ? <>All red dots translate rightward during the trans window (≈3% of D). Green keeps rotating CW throughout.</>
          : <>{coherencePct}% of red dots translate coherently rightward during the trans window (≈3% of D); the remaining {100 - coherencePct}% move in fixed random directions (one of 8). Green keeps rotating CW throughout.</>}
      </p>
      <Pair bothTranslate={false} density={density} coherenceFraction={coherenceFraction} dotRadiusDeg={dotRadiusDeg} colorSwap={colorSwap} />

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 mt-10" style={{ color: "#e8eaf0" }}>
        Variant B — both fields translate, opposite directions{variantSuffix}
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        {coherenceFraction === 1
          ? <>All red dots translate rightward and all green dots translate leftward during the same trans window (≈3% of D each).</>
          : <>{coherencePct}% of red dots translate coherently rightward and {coherencePct}% of green dots translate coherently leftward during the same trans window (≈3% of D each); the remaining {100 - coherencePct}% of each field move in fixed random directions (one of 8).</>}
      </p>
      <Pair bothTranslate={true} density={density} coherenceFraction={coherenceFraction} dotRadiusDeg={dotRadiusDeg} colorSwap={colorSwap} />
    </section>
  );
}

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeader title="bidirectional translation" />
      {sharedParams}

      <DensitySection density={4.5} experimentalCondition="173" coherenceFraction={0.5} />
      <DensitySection density={13}  experimentalCondition="500" coherenceFraction={0.5} />
      <DensitySection density={13}  experimentalCondition="500" coherenceFraction={1.0} />
      <DensitySection density={13}  experimentalCondition="500" coherenceFraction={1.0} dotRadiusDeg={0.05} />
      <DensitySection density={13}  experimentalCondition="500" coherenceFraction={1.0} dotRadiusDeg={0.05} colorSwap />
    </div>
  );
}
