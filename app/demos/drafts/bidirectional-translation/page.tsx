import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

const sharedParams = (
  <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-muted)" }}>
    <dt>aperture</dt><dd>4.5° (135 px)</dd>
    <dt>density</dt><dd>4.5 dots/°² — matches experimental 173 condition</dd>
    <dt>dots / field</dt><dd>286 (derived: density × aperture area)</dd>
    <dt>coherence</dt><dd>50% coherent / 50% random (8 dirs)</dd>
    <dt>speeds</dt><dd>experimental (81 °/s rotation, 2.26 °/s translation)</dd>
    <dt>green field</dt><dd>rotates CW; translates LEFT if it's a translating field</dd>
    <dt>red field</dt><dd>rotates CCW; translates RIGHT if it's a translating field</dd>
    <dt>timing</dt><dd>solo 750 / pre-trans 300 / <strong>trans 100</strong> / post 500 / blank 500 ms — loops</dd>
  </dl>
);

function Pair({ bothTranslate }: { bothTranslate: boolean }) {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
          delayed: <span style={{ color: "rgb(230,110,110)" }}>red</span>
        </p>
        <Demo delayedField={1} bothTranslate={bothTranslate} />
      </div>
      <div className="flex-1 min-w-[280px] max-w-[420px]">
        <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
          delayed: <span style={{ color: "rgb(90,180,90)" }}>green</span>
        </p>
        <Demo delayedField={0} bothTranslate={bothTranslate} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeader title="bidirectional translation" />
      {sharedParams}

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 mt-4" style={{ color: "#e8eaf0" }}>
        Variant A — only red translates
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Red translates rightward during the trans window. Green keeps rotating CW throughout.
      </p>
      <Pair bothTranslate={false} />

      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 mt-12" style={{ color: "#e8eaf0" }}>
        Variant B — both fields translate, opposite directions
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Red translates rightward and green translates leftward during the same trans window. Outside that window, each field rotates as in Variant A.
      </p>
      <Pair bothTranslate={true} />
    </div>
  );
}
