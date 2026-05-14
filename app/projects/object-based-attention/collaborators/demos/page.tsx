import VRDotsDemo from '@/components/VRDotsDemo';

const DEMOS = [
  { label: 'No Swap — Cued',          sub: 'Red field onset precedes green by 750 ms',     cued: true,  swapType: 'none' },
  { label: 'No Swap — Uncued',         sub: 'Both fields onset simultaneously',              cued: false, swapType: 'none' },
  { label: 'Color + Motion Swap — Cued',   sub: 'Color and rotation direction exchange during translation', cued: true,  swapType: 'cm'   },
  { label: 'Color + Motion Swap — Uncued', sub: 'Swap without temporal onset cue',          cued: false, swapType: 'cm'   },
] as const;

export default function DemosPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Stimulus Demos
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Replication of Stoner &amp; Blanc (2010) — Meta Quest 3 VR adaptation.
          Two fields of rotating dots (red CW, green CCW) overlap within a circular aperture.
          During the trial, one field briefly translates (rightward here; 8 directions tested).
          Translation shown at 5× actual speed for visibility; actual duration 80 ms at 90 Hz.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Aperture 3.5° radius · 192 dots/field · Rotation 81°/s · Translation 2.26°/s ·
          Delayed onset 750 ms · Fixation: ring + crosshair (white)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {DEMOS.map(({ label, sub, cued, swapType }) => (
          <div key={label} className="space-y-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
            <VRDotsDemo cued={cued} swapType={swapType} />
          </div>
        ))}
      </div>
    </div>
  );
}
