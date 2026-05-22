import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

const APERTURE_DEG = 4.5;
const APERTURE_AREA_DEG2 = Math.PI * APERTURE_DEG * APERTURE_DEG;
const DENSITY = 13;
const DOTS_PER_FIELD = Math.round(DENSITY * APERTURE_AREA_DEG2);

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeader title="counter-rotation + membership swap" />
      <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-muted)" }}>
        <dt>aperture</dt><dd>4.5° (135 px)</dd>
        <dt>density</dt><dd>13 dots/°² — matches experimental 500 condition</dd>
        <dt>dots / field</dt><dd>{DOTS_PER_FIELD} (derived: density × aperture area)</dd>
        <dt>rotation speed</dt><dd>experimental (81 °/s)</dd>
        <dt>green field</dt><dd>rotates CW</dd>
        <dt>red field</dt><dd>rotates CCW</dd>
        <dt>dot radius</dt><dd>0.04° (experimental)</dd>
        <dt>swap interval (B only)</dt><dd>500 ms</dd>
      </dl>

      <div className="flex flex-wrap gap-6 justify-center mt-8">
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "#e8eaf0" }}>
            A — counter-rotation baseline
          </h3>
          <p className="text-xs mb-3 text-center" style={{ color: "var(--text-muted)" }}>
            Both fields visible continuously, each dot stays in its field (no events).
          </p>
          <Demo />
        </div>
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: "#e8eaf0" }}>
            B — every 500 ms, half of each field swaps
          </h3>
          <p className="text-xs mb-3 text-center" style={{ color: "var(--text-muted)" }}>
            Same baseline. Every 500 ms, half of each field's dots flip both color and rotation direction simultaneously (position preserved).
          </p>
          <Demo swap />
        </div>
      </div>
    </div>
  );
}
