import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

const APERTURE_DEG = 4.5;
const APERTURE_AREA_DEG2 = Math.PI * APERTURE_DEG * APERTURE_DEG;
const dotsAt = (density: number) => Math.round(density * APERTURE_AREA_DEG2);
const EXPERIMENTAL_DOT_RADIUS_DEG = 0.04;

const sharedParams = (
  <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-muted)" }}>
    <dt>aperture</dt><dd>4.5° (135 px)</dd>
    <dt>speeds</dt><dd>experimental (81 °/s rotation, 2.26 °/s translation)</dd>
    <dt>green field</dt><dd>rotates CW; translates LEFT if it's a translating field</dd>
    <dt>red field</dt><dd>rotates CCW; translates RIGHT if it's a translating field</dd>
    <dt>timing</dt><dd>solo 750 / pre-trans 300 / <strong>trans 120</strong> / post 500 / blank 500 ms — loops</dd>
    <dt>dot radius</dt><dd>0.04° (experimental) unless noted otherwise</dd>
  </dl>
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
    colorSwap ? "color swap at trans onset" : null,
  ].filter(Boolean).join(" · ");
  return (
    <section className="mt-12">
      <h2 className="text-base font-semibold mb-1" style={{ color: "#e8eaf0" }}>
        Density {density} dots/°² · {coherencePct}% coherent{headerExtras ? " · " + headerExtras : ""}
      </h2>
      <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        Matches experimental {experimentalCondition} condition · {count} dots/field
        {isLargerDot && ` · dot radius ${dotRadiusDeg}° (${(dotRadiusDeg / EXPERIMENTAL_DOT_RADIUS_DEG * 100 - 100).toFixed(0)}% larger than experimental)`}
        {colorSwap && " · at trans onset the two fields swap colors and stay swapped — tests whether the effect is tied to color identity"}
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#e8eaf0" }}>
        Variant A — only red translates
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Red translates rightward during the trans window. Green keeps rotating CW throughout.
      </p>
      <Pair bothTranslate={false} density={density} coherenceFraction={coherenceFraction} dotRadiusDeg={dotRadiusDeg} colorSwap={colorSwap} />

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 mt-10" style={{ color: "#e8eaf0" }}>
        Variant B — both fields translate, opposite directions
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Red translates rightward and green translates leftward during the same trans window.
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
