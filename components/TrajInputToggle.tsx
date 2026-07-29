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
  trajLabel = 'With dot field identity',
  trajSubtitle = 'Object-based',
  inputLabel = 'Without dot field identity',
  inputSubtitle = 'What the model sees',
  intervalMs = 3600,
}: {
  trajSrc: string;
  inputSrc: string;
  width: number;
  height: number;
  trajAlt?: string;
  inputAlt?: string;
  trajLabel?: string;
  trajSubtitle?: string;
  inputLabel?: string;
  inputSubtitle?: string;
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
      <div className="flex flex-wrap items-start gap-2 text-xs">
        <div className="flex flex-col items-start">
          <button
            type="button"
            onClick={() => pick('traj')}
            className="px-3 py-1.5 rounded border font-medium"
            style={btn(view === 'traj')}
          >
            {trajLabel}
          </button>
          {trajSubtitle && (
            <span className="px-3 pt-0.5 text-xs italic font-bold" style={{ color: 'var(--text-muted)' }}>
              {trajSubtitle}
            </span>
          )}
        </div>
        <div className="flex flex-col items-start">
          <button
            type="button"
            onClick={() => pick('input')}
            className="px-3 py-1.5 rounded border font-medium"
            style={btn(view === 'input')}
          >
            {inputLabel}
          </button>
          {inputSubtitle && (
            <span className="px-3 pt-0.5 text-xs italic font-bold" style={{ color: 'var(--text-muted)' }}>
              {inputSubtitle}
            </span>
          )}
        </div>
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
          unoptimized
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
          unoptimized
        />
      </div>
    </div>
  );
}
