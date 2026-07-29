/* ============================================================================================
 * ⛔ STALE — DO NOT PRESENT AS CURRENT.  See HCPS_MODELING_SECTION_TODO.md in the repo root.
 *
 * This viewer renders public/data/hcps_web_data.json, which was exported from the WITHDRAWN
 * operating point: 64 point-sets, sigma 0.60 deg, tau_E 30 ms.  The model was reset on
 * 2026-07-26 to the native 11x11 (121 point-sets, sigma 0.2424 deg, tau_E 150 ms), and the
 * SCHEMATIC above this viewer on the page was regenerated — this was not.  So the page
 * currently shows two different models one above the other.
 *
 * Fix: run `hcps_export_web` in the model repo (after `hcps_default_check` passes).
 * ========================================================================================== */
'use client';

/**
 * HCPSViewer — the model running, left to right.
 *
 * Mirrors ps_model_viewer.m's chain:
 *   STIMULUS → STIMULUS DRIVE → COOPERATIVE POOL (cued|uncued) → MT / V4 (cued|uncued)
 * with the three attention-index traces underneath and the two measurement windows shaded.
 *
 * Everything is REAL model output (pointset/hcps_export_web.m) from a single dot layout,
 * exactly as the MATLAB viewer runs one condition.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Cond = {
  rho: number; base: number; dotsRF: number; spdRF: number; nDots: number;
  Ax0: number[]; Ay0: number[]; Bx0: number[]; By0: number[];
  Bprobe: number[]; stepBase: number; stepProbe: number;
  drive: number[][]; Ecued: number[][]; Euncued: number[][];
  mtCued: number[][]; mtUncued: number[][]; v4Cued: number[][]; v4Uncued: number[][];
  aiPrimary: number[]; aiColour: number[]; aiTranslation: number[];
  aiTranslationMean: number;
};
type Meta = {
  sigDeg: number; v1grid: number; nPointSets: number; tauE_ms: number; kappa: number;
  transDeg: number; nFrames: number; msPerFrame: number;
  preWin: [number, number]; probeWin: [number, number];
  transStart: number; coh: number; nDotShow: number; nSeedAvg: number;
  psX: number[]; psY: number[];
};
type Data = { meta: Meta; conditions: Cond[] };

const MOTION = '#3a6fd8';
const COLOUR = '#8d5bbf';
const POOL   = '#c4831f';
const RED    = '#cf3b2f';
const GREEN  = '#2f8f5b';
/* the colour hypercolumn: red opposite green, every mixture yellow (both arcs) */
const HUES = ['#cf3b2f','#dd7a22','#d9c31e','#93b62b','#2f8f5b','#93b62b','#d9c31e','#dd7a22'];

/** Grayscale for the lattice maps — deliberately achromatic so that map intensity can never be
 *  confused with the dot colours or the hue rosette, which carry real chromatic meaning.
 *
 *  GAMMA. The pool is extremely heavy-tailed: its own positive feedback turns tiny initial
 *  differences into a few fixed hot spots, so even after clipping at the 95th percentile the
 *  median cell sits at ~1% of full scale and a linear ramp renders the lattice blank. A gamma
 *  of 0.4 spreads the low end (0.01 → 0.16, 0.14 → 0.44) so the stimulus-driven structure is
 *  visible. Intensity is therefore ordinal, not proportional. */
const GAMMA = 0.4;
function heat(v: number) {
  const t = Math.pow(Math.max(0, Math.min(1, v)), GAMMA);
  const c = Math.round(248 - t * 214);   // 248 (near-white) → 34 (near-black)
  return `rgb(${c},${c},${c})`;
}

/** one stage of the chain: a titled square panel */
function Stage({
  title, sub, children, tint,
}: { title: string; sub?: string; children: React.ReactNode; tint?: string }) {
  return (
    <div className="shrink-0" style={{ width: 132 }}>
      <div className="text-[10px] font-semibold leading-tight mb-0.5"
           style={{ color: tint ?? 'var(--text-primary)' }}>{title}</div>
      <div className="text-[9px] leading-tight mb-1" style={{ color: 'var(--text-muted)', minHeight: 11 }}>
        {sub ?? ''}
      </div>
      {children}
    </div>
  );
}

function Arrow() {
  return (
    <div className="shrink-0 flex items-center justify-center" style={{ width: 22, paddingTop: 34 }}>
      <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
        <path d="M0,6 L16,6" stroke="var(--text-muted)" strokeWidth="1.4" />
        <path d="M15,2 L21,6 L15,10 z" fill="var(--text-muted)" />
      </svg>
    </div>
  );
}

export default function HCPSViewer({ src = '/data/hcps_web_data.json' }: { src?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [iRho, setIRho] = useState(2);   // default to the S&B dot count (63/field)
  const [iSpd, setISpd] = useState(1);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(src).then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (alive) setData(d); })
      .catch(e => { if (alive) setErr(String(e)); });
    return () => { alive = false; };
  }, [src]);

  const rhos = useMemo(() => (data ? [...new Set(data.conditions.map(c => c.rho))] : []), [data]);
  const spds = useMemo(() => (data ? [...new Set(data.conditions.map(c => c.base))] : []), [data]);
  const cond = useMemo(() => {
    if (!data) return null;
    return data.conditions.find(c => c.rho === rhos[iRho] && c.base === spds[iSpd]) ?? data.conditions[0];
  }, [data, rhos, spds, iRho, iSpd]);

  const nF = data?.meta.nFrames ?? 35;
  const step = useCallback((t: number) => {
    if (t - last.current > 95) { last.current = t; setFrame(f => (f + 1) % nF); }
    raf.current = requestAnimationFrame(step);
  }, [nF]);
  useEffect(() => {
    if (!playing) { if (raf.current) cancelAnimationFrame(raf.current); return; }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, step]);

  if (err) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}>
      Could not load the model data ({err}).
    </div>
  );
  if (!data || !cond) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
      Loading model output…
    </div>
  );

  const { meta } = data;
  const g = meta.v1grid;
  const inPre = frame + 1 >= meta.preWin[0] && frame + 1 <= meta.preWin[1];
  const inProbe = frame + 1 >= meta.probeWin[0] && frame + 1 <= meta.probeWin[1];
  const btn = (a: boolean): React.CSSProperties => ({
    borderColor: a ? 'var(--accent)' : 'var(--border)',
    color: a ? 'var(--accent)' : 'var(--text-secondary)',
    background: a ? 'var(--accent-dim)' : 'transparent',
  });
  const boxStyle = { background: 'var(--background)', border: '1px solid var(--border)' };

  /* ── GEOMETRY, shared by every spatial panel ─────────────────────────────
     Model y increases UPWARD (ps_stimulus: y += spd*sin(dir), UP = pi/2) while SVG y increases
     downward, so every panel flips y. Point-set centres come from the exported rf.v1c rather
     than being inferred from the index: grid_centres builds them with
     [X,Y] = meshgrid(t,t); C = [X(:) Y(:)], which is COLUMN-major, so x tracks floor(k/g) and
     y tracks k mod g — the transposition that has now bitten this project twice.
     meta.psX/psY are normalised over the centres, which are inset by half a spacing; this maps
     them into the same 0..1 frame the dots use. */
  const inset = 1 / (2 * g);
  const toFrameX = (v: number) => (v * (1 - 1 / g) + inset) * 1000;
  const toFrameY = (v: number) => (1 - (v * (1 - 1 / g) + inset)) * 1000;
  const cell = (1000 / g);

  /* EVERY dot, integrated from the exported kinematics. Field A runs UP for the whole trial;
     field B runs DOWN except during the probe, when each dot takes its own scattered direction
     (50% coherence). Toroidal wrap in the square, exactly as ps_stimulus does it. */
  /* NOT a hook — this sits below the early returns above, so a useMemo here would be skipped on
     the loading render and called afterwards, changing the hook order. It is a few thousand
     arithmetic ops per frame, so plain computation is fine. */
  const dotPos = (() => {
    const wrap = (v: number) => ((v % 1000) + 1000) % 1000;
    const t = frame;                                  // frames elapsed since frame 0
    const pS = meta.probeWin[0] - 1, pE = meta.probeWin[1] - 1;
    const nProbe = Math.max(0, Math.min(t, pE) - pS + (t >= pS ? 1 : 0));
    const nPre = t - nProbe;                          // frames spent at the base motion
    const A = cond.Ax0.map((x0, i) => [x0, wrap(cond.Ay0[i] + t * cond.stepBase)] as const);
    const B = cond.Bx0.map((x0, i) => {
      const th = cond.Bprobe[i];
      const x = wrap(x0 + nProbe * cond.stepProbe * Math.cos(th));
      const y = wrap(cond.By0[i] - nPre * cond.stepBase + nProbe * cond.stepProbe * Math.sin(th));
      return [x, y] as const;
    });
    return { A, B };
  })();

  const dotR = cond.nDots > 800 ? 6 : cond.nDots > 300 ? 9 : 14;
  const Stimulus = () => (
    <svg viewBox="0 0 1000 1000" className="w-full h-auto rounded" style={boxStyle}>
      {dotPos.A.map(([x, y], i) => (
        <circle key={`a${i}`} cx={x} cy={1000 - y} r={dotR} fill={RED} opacity={0.85} />
      ))}
      {dotPos.B.map(([x, y], i) => (
        <circle key={`b${i}`} cx={x} cy={1000 - y} r={dotR} fill={GREEN} opacity={0.85} />
      ))}
      {inProbe && (
        <g>
          <path d="M740,110 L890,110" stroke={POOL} strokeWidth={26} />
          <path d="M870,80 L925,110 L870,140 z" fill={POOL} />
        </g>
      )}
    </svg>
  );

  /* ── a lattice map (drive / pool), drawn at the true point-set centres ── */
  const Lattice = ({ M }: { M: number[][] }) => (
    <svg viewBox="0 0 1000 1000" className="w-full h-auto rounded" style={boxStyle}>
      {M.map((series, i) => (
        <rect key={i}
              x={toFrameX(meta.psX[i]) - cell / 2}
              y={toFrameY(meta.psY[i]) - cell / 2}
              width={cell} height={cell}
              fill={heat(series[frame] ?? 0)} />
      ))}
    </svg>
  );

  /* ── a rosette: 8 channels as radial bars ── */
  const Rosette = ({ v, colours, mark }: { v: number[][]; colours: string | string[]; mark?: number }) => {
    const R0 = 14, R1 = 46;
    return (
      <svg viewBox="0 0 110 110" className="w-full h-auto rounded" style={boxStyle}>
        <circle cx={55} cy={55} r={R1} fill="none" stroke="var(--border)" strokeDasharray="2 3" />
        {v.map((series, k) => {
          const a = (k * Math.PI) / 4;
          const len = R0 + (R1 - R0) * Math.max(0, Math.min(1, series[frame] ?? 0));
          const x = 55 + len * Math.cos(a), y = 55 - len * Math.sin(a);
          const col = Array.isArray(colours) ? colours[k] : colours;
          return (
            <g key={k}>
              <line x1={55} y1={55} x2={x} y2={y} stroke={col}
                    strokeWidth={k === mark ? 6 : 4} strokeLinecap="round"
                    opacity={k === mark ? 1 : 0.75} />
            </g>
          );
        })}
        <circle cx={55} cy={55} r={2.5} fill="var(--text-muted)" />
      </svg>
    );
  };

  /* ── AI traces ── */
  const W = 660, H = 190, ML = 44, MR = 10, MT = 10, MB = 28;
  const traces = [
    { key: 'primary',     v: cond.aiPrimary,     c: MOTION, label: 'primary (attended motion)' },
    { key: 'colour',      v: cond.aiColour,      c: COLOUR, label: 'colour transfer' },
    { key: 'translation', v: cond.aiTranslation, c: POOL,   label: 'translation' },
  ];
  const allv = traces.flatMap(t => t.v);
  const lo = Math.min(-0.05, Math.floor(Math.min(...allv) * 20) / 20);
  const hi = Math.max(0.25, Math.ceil(Math.max(...allv) * 20) / 20);
  const px = (f: number) => ML + (f / (nF - 1)) * (W - ML - MR);
  const py = (v: number) => MT + (1 - (v - lo) / (hi - lo)) * (H - MT - MB);
  const path = (v: number[]) => v.map((y, i) => `${i ? 'L' : 'M'}${px(i)},${py(y)}`).join(' ');

  return (
    <div className="rounded-lg border overflow-hidden"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* controls */}
      <div className="px-4 py-3 border-b space-y-2" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>density</span>
          {rhos.map((r, i) => (
            <button key={r} type="button" onClick={() => setIRho(i)}
                    className="px-2.5 py-1 rounded border font-medium" style={btn(i === iRho)}>
              {r} <span className="opacity-60">dots/deg²</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium" style={{ color: 'var(--text-muted)' }}>field speed</span>
          {spds.map((s, i) => (
            <button key={s} type="button" onClick={() => setISpd(i)}
                    className="px-2.5 py-1 rounded border font-medium" style={btn(i === iSpd)}>
              {s} <span className="opacity-60">°/s</span>
            </button>
          ))}
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            (probe pinned at {meta.transDeg}°/s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <button type="button" onClick={() => setPlaying(p => !p)}
                  className="px-3 py-1 rounded border font-medium" style={btn(false)}>
            {playing ? '❚❚ Pause' : '▶ Play'}
          </button>
          <input type="range" min={0} max={nF - 1} value={frame} className="flex-1 min-w-[150px]"
                 onChange={e => { setPlaying(false); setFrame(Number(e.target.value)); }}
                 aria-label="frame" />
          <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {frame * meta.msPerFrame} ms
          </span>
          {inPre && <span className="px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>pre-probe</span>}
          {inProbe && <span className="px-2 py-0.5 rounded" style={{ background: '#f6e6c8', color: POOL }}>probe</span>}
        </div>
      </div>

      {/* ── THE CHAIN, left to right ── */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex items-start" style={{ minWidth: 940 }}>
          <Stage title="STIMULUS" sub={`${cond.nDots} dots per field · all shown`}>
            <Stimulus />
          </Stage>
          <Arrow />
          <Stage title="STIMULUS DRIVE" sub="raw, before input normalization">
            <Lattice M={cond.drive} />
          </Stage>
          <Arrow />
          <div className="shrink-0 flex gap-2">
            <Stage title="POOL · CUED" sub="attends the translating surface" tint={POOL}>
              <Lattice M={cond.Ecued} />
            </Stage>
            <Stage title="POOL · UNCUED" sub="attends the other surface" tint={POOL}>
              <Lattice M={cond.Euncued} />
            </Stage>
          </div>
          <Arrow />
          <div className="shrink-0 flex gap-2">
            {/* The marked channel is the one the index reads, and it is the SAME channel in the
                cued and uncued rosette — DOWN for motion, GREEN for colour. Both belong to the
                attended surface; only whether it is attended differs between the two runs. */}
            <Stage title="MT · cued / uncued" sub="8 directions · DOWN marked" tint={MOTION}>
              <div className="flex gap-1">
                <Rosette v={cond.mtCued} colours={MOTION} mark={6} />
                <Rosette v={cond.mtUncued} colours={MOTION} mark={6} />
              </div>
            </Stage>
            <Stage title="V4 · cued / uncued" sub="8 hues · GREEN marked" tint={COLOUR}>
              <div className="flex gap-1">
                <Rosette v={cond.v4Cued} colours={HUES} mark={4} />
                <Rosette v={cond.v4Uncued} colours={HUES} mark={4} />
              </div>
            </Stage>
          </div>
        </div>
      </div>

      {/* condition summary */}
      <div className="px-4 py-2 text-[11px] flex flex-wrap gap-x-5 gap-y-1 border-t border-b"
           style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <span><strong>{cond.dotsRF}</strong> dots/RF</span>
        <span><strong>{cond.spdRF}</strong> RF/s</span>
        <span>σ = {meta.sigDeg.toFixed(2)}°</span>
        <span>τ<sub>E</sub> = {meta.tauE_ms} ms</span>
        <span>κ = {meta.kappa}</span>
        <span>coherence {meta.coh}</span>
        <span className="opacity-70">one dot layout</span>
      </div>

      {/* AI traces */}
      <div className="px-4 py-4">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Attention index over the trial
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <rect x={px(meta.preWin[0] - 1)} y={MT} width={px(meta.preWin[1] - 1) - px(meta.preWin[0] - 1)}
                height={H - MT - MB} fill="var(--accent-dim)" />
          <rect x={px(meta.probeWin[0] - 1)} y={MT} width={px(meta.probeWin[1] - 1) - px(meta.probeWin[0] - 1)}
                height={H - MT - MB} fill="#f6e6c8" />
          <line x1={ML} y1={py(0)} x2={W - MR} y2={py(0)} stroke="var(--border)" strokeDasharray="3 3" />
          <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="var(--border)" />
          {[lo, 0, hi].map(v => (
            <text key={v} x={ML - 6} y={py(v) + 3.5} textAnchor="end" fontSize={9} fill="var(--text-muted)">
              {v.toFixed(2)}
            </text>
          ))}
          {traces.map(t => <path key={t.key} d={path(t.v)} fill="none" stroke={t.c} strokeWidth={1.9} />)}
          <line x1={px(frame)} y1={MT} x2={px(frame)} y2={H - MB} stroke="var(--text-primary)" strokeWidth={1} opacity={0.5} />
          {traces.map(t => <circle key={t.key} cx={px(frame)} cy={py(t.v[frame] ?? 0)} r={3.2} fill={t.c} />)}
          <text x={px(meta.preWin[0] - 1) + 4} y={H - MB + 13} fontSize={9} fill="var(--accent)">pre-probe</text>
          <text x={px(meta.probeWin[0] - 1) + 2} y={H - MB + 23} fontSize={9} fill={POOL}>probe</text>
          <text x={W - MR} y={H - MB + 13} textAnchor="end" fontSize={9} fill="var(--text-muted)">time →</text>
        </svg>

        <div className="mt-2 grid grid-cols-3 gap-3 text-[11px]">
          {traces.map(t => (
            <div key={t.key} className="rounded border px-2 py-1.5"
                 style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: t.c }} />
                <span style={{ color: 'var(--text-primary)' }}>{t.label}</span>
              </div>
              <div className="mt-1 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                now <strong>{(t.v[frame] ?? 0).toFixed(3)}</strong>
                {t.key === 'translation' && (
                  <span className="ml-2 opacity-70">
                    {meta.nSeedAvg}-layout probe mean {cond.aiTranslationMean.toFixed(3)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
