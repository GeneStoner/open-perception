import SectionHeader from "@/components/SectionHeader";
import Demo from "./Demo";

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <SectionHeader title="bidirectional translation" />
      <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 mb-6" style={{ color: "var(--text-muted)" }}>
        <dt>aperture</dt><dd>4.5° (135 px)</dd>
        <dt>dots / field</dt><dd>1000 (high density)</dd>
        <dt>coherence</dt><dd>50% coherent / 50% random (8 dirs)</dd>
        <dt>field 0 (red)</dt><dd>non-delayed, rotates CW, translates LEFT</dd>
        <dt>field 1 (green)</dt><dd>delayed onset 750 ms, rotates CCW, translates RIGHT</dd>
        <dt>timing</dt><dd>solo 750 / pre-trans 300 / <strong>trans 120</strong> / post 500 ms — loops</dd>
      </dl>
      <Demo />
    </div>
  );
}
