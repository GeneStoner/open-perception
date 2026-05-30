import RotatingCylinderDemo from "@/components/RotatingCylinderDemo";

const PANELS = [
  {
    mode:    'random'      as const,
    title:   'Random motion',
    caption: 'Dots move in independent random directions. No global structure is perceived.',
  },
  {
    mode:    'single'      as const,
    title:   'One coherent field',
    caption: 'All dots translate together in one direction. Local motions integrate into a single global surface.',
  },
  {
    mode:    'transparent' as const,
    title:   'Two opposing fields',
    caption: 'Two superimposed fields moving in opposite directions. Both surfaces are simultaneously visible — transparent motion.',
  },
  {
    mode:    'cylinder'    as const,
    title:   'Rotating cylinder',
    caption: 'Same two fields, but speed varies sinusoidally: fastest at centre, zero at the edges. The visual system recovers a cylinder rotating in depth. The percept is bistable — rotation direction can spontaneously reverse.',
  },
  {
    mode:    'transition'  as const,
    title:   'Continuous transition',
    caption: 'The same dots cycle slowly through all four states. Watch a single region of dots to follow the transition from incoherent noise to transparent motion to structured depth.',
  },
] as const;

export default function RotatingCylinderPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">

      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          From transparent motion to rotating cylinder
        </h1>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          Two counter-rotating dot fields can be perceived either as overlapping transparent surfaces
          (transparent motion) or as a single three-dimensional rotating cylinder (kinetic depth effect).
          The four panels below show the progression from incoherent noise to structured 3D percept.
          The cylinder is bistable — fixate the centre and observe whether the rotation direction
          spontaneously reverses.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Wallach &amp; O&apos;Connell (1953) · Nawrot &amp; Blake (1989) · Bradley, Chang &amp; Andersen (1998)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {PANELS.map(({ mode, title, caption }) => (
          <div key={mode} className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </p>
            <RotatingCylinderDemo mode={mode} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {caption}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
