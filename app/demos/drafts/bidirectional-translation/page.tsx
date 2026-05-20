import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <SectionHeader title="bidirectional translation" />
      <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-muted)" }}>
        <dt>aperture</dt><dd>4.5° (135 px)</dd>
        <dt>dots / field</dt><dd>1000 (high density)</dd>
        <dt>coherence</dt><dd>50% coherent / 50% random (8 dirs)</dd>
        <dt>green field</dt><dd>rotates CW, translates LEFT during trans phase</dd>
        <dt>red field</dt><dd>rotates CCW continuously (does not translate)</dd>
        <dt>timing</dt><dd>solo 750 / pre-trans 300 / <strong>trans 120</strong> / post 500 ms — loops</dd>
      </dl>
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
            delayed: <span style={{ color: "rgb(204,51,51)" }}>red</span>
          </p>
          <Demo delayedField={1} />
        </div>
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          <p className="text-xs mb-2 text-center" style={{ color: "var(--text-muted)" }}>
            delayed: <span style={{ color: "rgb(34,139,34)" }}>green</span>
          </p>
          <Demo delayedField={0} />
        </div>
      </div>
    </div>
  );
}
