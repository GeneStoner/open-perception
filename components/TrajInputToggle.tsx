'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type View = 'traj' | 'input';

export default function TrajInputToggle({
  trajSrc,
  inputSrc,
  width,
  height,
  trajAlt = 'Feature trajectories',
  inputAlt = "The model's direction input",
  intervalMs = 1800,
}: {
  trajSrc: string;
  inputSrc: string;
  width: number;
  height: number;
  trajAlt?: string;
  inputAlt?: string;
  intervalMs?: number;
}) {
  const [view, setView] = useState<View>('traj');
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(
      () => setView(v => (v === 'traj' ? 'input' : 'traj')),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [auto, intervalMs]);

  const pick = (v: View) => {
    setView(v);
    setAuto(false);
  };

  const btn = (active: boolean): React.CSSProperties => ({
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-dim)' : 'transparent',
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => pick('traj')}
          className="px-3 py-1.5 rounded border font-medium"
          style={btn(view === 'traj')}
        >
          Feature trajectories
        </button>
        <button
          type="button"
          onClick={() => pick('input')}
          className="px-3 py-1.5 rounded border font-medium"
          style={btn(view === 'input')}
        >
          What the model sees
        </button>
        <button
          type="button"
          onClick={() => setAuto(a => !a)}
          className="px-3 py-1.5 rounded border font-medium ml-auto"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {auto ? '❚❚ Pause' : '▶ Auto'}
        </button>
      </div>

      <div
        className="relative rounded-lg border overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <Image
          src={trajSrc}
          alt={trajAlt}
          width={width}
          height={height}
          className="w-full h-auto"
          style={{
            opacity: view === 'traj' ? 1 : 0,
            transition: 'opacity 0.45s ease',
          }}
          priority
        />
        <Image
          src={inputSrc}
          alt={inputAlt}
          width={width}
          height={height}
          className="w-full h-auto absolute inset-0"
          style={{
            opacity: view === 'input' ? 1 : 0,
            transition: 'opacity 0.45s ease',
          }}
        />
      </div>
    </div>
  );
}
