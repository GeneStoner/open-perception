'use client';

/**
 * HCMinResponse — the motion-only hypercolumn model running, one dot in one V1 receptive field.
 *
 * This is the INTERACTIVE form of the two response figures. GS, 2026-08-21: "when we animate it
 * using the model's responses we can have an indicator showing which frame/time we are at as we
 * march (slowed down speed) through the stimulus."
 *
 * The layout is deliberately the same object as the stills, not a second design:
 *
 *   TIME IN            the stimulus raster, R_theta(t) for the three directions, and S(t),
 *                      all on one x-axis with ONE cursor
 *   INSTANT ACROSS     the schematic's own panels — DRIVE -> (x) -> RESPONSE -> Sigma, plus the
 *                      GAIN box (III) or the off-axis bias and POOL AFFERENT (IV) — carrying the
 *                      model's values AT the cursor, for CUED and UNCUED
 *
 * So the still is this component with the cursor parked, and the two cannot tell different
 * stories. Park it at frame 60 and it is fig_modelIII_response.png; at 63, the _f63 still.
 *
 * ⚠️ EVERY NUMBER COMES FROM THE MODEL, via public/data/hc_min_onedot.json, exported by
 * pointset/hc_min_onedot_export.m. There are no illustrative values anywhere in this file. The
 * read-outs are ASSERTED on load (III 0.4445/0.3681, IV 0.4338/0.4358) and the component renders
 * an explicit error rather than a plausible-looking figure if they disagree.
 *
 * ⚠️ WHY THE STALENESS FOOTER EXISTS. HCPSViewer.tsx below this on the page has been rendering a
 * WITHDRAWN operating point since 2026-07-26 while the schematic above it was regenerated — see
 * HCPS_MODELING_SECTION_TODO.md. The JSON this component reads is a COPY of the file in the
 * MATLAB tree and can drift the same way, so the export timestamp and every parameter that
 * defines the run are printed on the page. A stale payload should be VISIBLE, not merely wrong.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Side = { a: number[]; G: number[][]; R: number[][]; Pin: number[][]; S: number[]; C: number[] };
type Model = {
  CoopL: number; biasAmp: number; biasInPool: boolean; loopGain: number; converged: boolean;
  primary: number; translation: number; ratio: number; cued: Side; uncued: Side;
};
type Meta = {
  source: string; generated: string; msPerFrame: number; nFrames: number;
  nRot: number; nTrans: number; tau_ms: number; tauS_ms: number;
  prefsDeg: number[]; rotDeg: number; transDeg: number; cuedDeg: number; uncuedDeg: number;
  plotDeg: number[]; iUP: number; iRIGHT: number; iDOWN: number;
  wRot: [number, number]; wTrans: [number, number];
};
type Data = { meta: Meta; stim: { u: number[][] }; models: Record<'III' | 'IV', Model> };

/* The read-outs hc_min_onedot prints. If the payload disagrees, the payload is wrong — never
 * adjust these to match it. Same guard the Python generators carry. */
const EXPECT: Record<'III' | 'IV', [number, number]> = {
  III: [0.4445, 0.3681],
  IV: [0.4338, 0.4358],
};

/* Palette. ATT and COOP are the measured Okabe-Ito pair from the figures — orange/green failed
 * CIEDE2000 at 9 under protanopia and 6 in greyscale, blue/orange passes at 56/22 (fig_cvd_check.py).
 * Keep them in step with the Python generators.
 * STIM is the ONE role that does NOT hardcode: in the figures it is dark ink on white, which
 * would vanish on this site's dark theme, and it is a neutral sensory quantity — exactly what
 * --text-primary means here. It also plays no part in the CVD result, which measures ATT vs COOP. */
const ATT = '#E69F00';
const COOP = '#0072B2';
const STIM = 'var(--text-primary)';
const CURSOR = '#C1272D';

const nz = (v: number) => (v > 0 ? v : 1e-9);

export default function HCMinResponse({ src = '/data/hc_min_onedot.json' }: { src?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<'III' | 'IV'>('III');
  const [frame, setFrame] = useState(59);          // end of rotation — what the stills park at
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: Data) => {
        if (!alive) return;
        for (const k of ['III', 'IV'] as const) {
          const m = d.models?.[k];
          if (!m) return setErr(`payload has no model ${k}`);
          if (!m.converged) return setErr(`model ${k} did not converge in the export`);
          const [p, t] = EXPECT[k];
          if (Math.abs(m.primary - p) > 5e-5 || Math.abs(m.translation - t) > 5e-5) {
            return setErr(
              `model ${k} read-outs disagree with hc_min_onedot — expected ${p}/${t}, ` +
              `payload has ${m.primary}/${m.translation}. The export is stale or wrong.`,
            );
          }
        }
        setData(d);
      })
      .catch(e => alive && setErr(String(e)));
    return () => { alive = false; };
  }, [src]);

  const nF = data?.meta.nFrames ?? 65;
  const step = useCallback((t: number) => {
    // the model runs 10 ms/frame; 95 ms of real time per frame is the ~10x slow march GS asked
    // for, and matches HCPSViewer's cadence so the two figures feel like one page
    if (t - last.current > 95) { last.current = t; setFrame(f => (f + 1) % nF); }
    raf.current = requestAnimationFrame(step);
  }, [nF]);
  useEffect(() => {
    if (!playing) { if (raf.current) cancelAnimationFrame(raf.current); return; }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, step]);

  /* FIXED SCALES — the run's peak over every frame AND both cue conditions, exactly as the PNGs
   * compute them. Not each panel's own peak, and never the current frame's: per-frame scaling
   * would make the bars jump under playback and would destroy the cued-vs-uncued comparison that
   * is the entire point of showing two rows.
   * ⚠️ This is a hook, so it must sit ABOVE the early returns below — the file it follows
   * (HCPSViewer) carries a comment about exactly this hook-order trap. */
  const sc = useMemo(() => {
    if (!data) return null;
    const m = data.models[mode];
    const cols = (A: number[][]) => Math.max(...A.map(r => Math.max(...r)));
    const both = (f: (s: Side) => number) => Math.max(f(m.cued), f(m.uncued));
    const chans = data.meta.plotDeg.map(d => data.meta.prefsDeg.indexOf(d));
    return {
      drive: nz(cols(data.stim.u)),
      bias: nz(both(s => Math.max(...s.a))),
      gain: nz(both(s => Math.max(...s.a) + Math.max(...s.C))),
      resp: nz(both(s => cols(s.R))),
      pin: nz(both(s => cols(s.Pin))),
      pool: nz(both(s => Math.max(...s.S))),
      trace: nz(both(s => Math.max(...chans.map(c => Math.max(...s.R.map(r => r[c])))))),
      chans,
    };
  }, [data, mode]);

  if (err) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}>
      <strong>The model output would not validate, so nothing is drawn.</strong>
      <div className="mt-1 opacity-80">{err}</div>
      <div className="mt-2 text-xs opacity-70">
        Re-export it: <code>matlab -batch &quot;cd(&apos;pointset&apos;); hc_min_onedot_export&quot;</code>,
        then copy the JSON into <code>public/data/</code>.
      </div>
    </div>
  );
  if (!data || !sc) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
      Loading model output…
    </div>
  );

  const { meta } = data;
  const M = data.models[mode];
  const f = Math.min(frame, meta.nFrames - 1);
  const tMs = (f + 1) * meta.msPerFrame;
  const T = meta.nFrames * meta.msPerFrame;
  const T_ROT = meta.nRot * meta.msPerFrame;
  const inTrans = f + 1 > meta.nRot;

  const btn = (a: boolean): React.CSSProperties => ({
    borderColor: a ? 'var(--accent)' : 'var(--border)',
    color: a ? 'var(--accent)' : 'var(--text-secondary)',
    background: a ? 'var(--accent-dim)' : 'transparent',
  });

  /* ── the TIME block: one SVG, so the cursor cannot drift between panels ──────────────── */
  const W = 1000, ML = 54, MR = 58;
  const px = (ms: number) => ML + (W - ML - MR) * (ms / T);
  const LANE = 13, RAS_Y = 16, RAS_H = 8 * LANE;
  const TR_H = 46, TR_GAP = 7;
  const TR_Y = RAS_Y + RAS_H + 26;
  const POOL_Y = TR_Y + 3 * (TR_H + TR_GAP) + 22;
  const POOL_H = 62;
  const TH = POOL_Y + POOL_H + 24;

  const lit = data.stim.u.map(r => r.indexOf(Math.max(...r)));
  const NAME: Record<number, string> = { 0: 'RIGHT', 2: 'UP', 4: 'LEFT', 6: 'DOWN' };
  const linePath = (v: number[], y0: number, h: number, top: number) =>
    v.map((y, i) => `${i ? 'L' : 'M'}${px((i + 1) * meta.msPerFrame).toFixed(1)},` +
                    `${(y0 + h - h * (y / top)).toFixed(1)}`).join(' ');

  /* ── one 8-channel bar panel, the schematic's `panel()` ──────────────────────────────── */
  const Panel = ({ vals, scale, colour, title, formula, ticks = false }: {
    vals: number[]; scale: number; colour: string; title: string; formula: string; ticks?: boolean;
  }) => (
    <div className="shrink-0" style={{ width: ticks ? 116 : 96 }}>
      <div className="text-[9.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</div>
      <div className="text-[9px] leading-tight mb-1" style={{ color: 'var(--text-muted)' }}>{formula}</div>
      <svg viewBox={`0 0 ${ticks ? 116 : 96} 108`} className="w-full h-auto">
        {vals.map((v, k) => {
          const y = 4 + k * 12.5, x0 = ticks ? 22 : 2;
          return (
            <g key={k}>
              {ticks && (
                <text x={19} y={y + 8.4} textAnchor="end" fontSize={7.4} fill="var(--text-muted)">
                  {meta.prefsDeg[k]}°
                </text>
              )}
              <rect x={x0} y={y} width={(ticks ? 92 : 92)} height={11} fill="none"
                    stroke="var(--border)" strokeWidth={0.5} />
              <rect x={x0 + 0.7} y={y + 1.4} width={Math.max(0, 90.6 * (v / scale))} height={8.2}
                    fill={colour} opacity={0.92} />
            </g>
          );
        })}
      </svg>
    </div>
  );

  /* the GAIN box: the flat cooperative band C with the tuned cap a_theta stacked on it. Stacking
   * IS addition — the terms add, they do not compound (the cross-term would be 104% of the coded
   * gain), which is why there is no operator glyph between them. */
  const GainBox = ({ s }: { s: Side }) => {
    const C = s.C[f], kmax = s.a.indexOf(Math.max(...s.a));
    return (
      <div className="shrink-0" style={{ width: 96 }}>
        <div className="text-[9.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>GAIN</div>
        <div className="text-[9px] leading-tight mb-1" style={{ color: 'var(--text-muted)' }}>aθ + C</div>
        <svg viewBox="0 0 96 108" className="w-full h-auto">
          {s.a.map((av, k) => {
            const y = 4 + k * 12.5;
            const w1 = 90.6 * (C / sc.gain), w2 = 90.6 * (av / sc.gain);
            return (
              <g key={k}>
                <rect x={2} y={y} width={92} height={11} fill="none" stroke="var(--border)" strokeWidth={0.5} />
                <rect x={2.7} y={y + 1.4} width={Math.max(0, w1)} height={8.2} fill={COOP} opacity={0.95} />
                <rect x={2.7 + w1} y={y + 1.4} width={Math.max(0, w2)} height={8.2} fill={ATT} opacity={0.95} />
                {k === kmax && w1 > 12 && (
                  <text x={2.7 + w1 / 2} y={y + 8.4} textAnchor="middle" fontSize={7} fill="#fff">C</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const Op = ({ sym, note }: { sym: string; note?: string }) => (
    <div className="shrink-0 flex flex-col items-center" style={{ width: 34, paddingTop: 26 }}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <circle cx={13} cy={13} r={8.5} fill="none" stroke="var(--text-secondary)" strokeWidth={1.2} />
        <text x={13} y={17} textAnchor="middle" fontSize={12} fill="var(--text-secondary)">{sym}</text>
      </svg>
      {note && <div className="text-[8.5px] tabular-nums mt-0.5" style={{ color: COOP }}>{note}</div>}
    </div>
  );

  /* flow, not an operation — a circled glyph in this figure family means an OPERATOR, so the
   * step from an assembled gain to the response it produces must NOT be circled. */
  const Flow = () => (
    <div className="shrink-0 flex items-center justify-center" style={{ width: 22, paddingTop: 32 }}>
      <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
        <path d="M0,6 L16,6" stroke="var(--text-muted)" strokeWidth="1.4" />
        <path d="M15,2 L21,6 L15,10 z" fill="var(--text-muted)" />
      </svg>
    </div>
  );

  const Row = ({ side, label, cueDeg, cueName }: {
    side: Side; label: string; cueDeg: number; cueName: string;
  }) => (
    <div className="flex items-start gap-1.5 flex-wrap">
      <div className="shrink-0 pt-1" style={{ width: 74 }}>
        <div className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>{label}</div>
        <div className="text-[9px] leading-tight" style={{ color: ATT }}>
          bias at {cueDeg}° ({cueName})
        </div>
      </div>
      <Panel vals={data.stim.u[f]} scale={sc.drive} colour={STIM}
             title="STIMULUS DRIVE" formula="uθ" ticks />
      {mode === 'III' ? (
        <>
          <Op sym="×" />
          <GainBox s={side} />
          <Flow />
          <Panel vals={side.R[f]} scale={sc.resp} colour={STIM} title="HC RESPONSE" formula="Rθ" />
        </>
      ) : (
        <>
          {/* Model IV's drive gain is the lone scalar 1+C — no field reaches it, so no panel */}
          <Op sym="×" note={`1+C = ${(1 + side.C[f]).toFixed(2)}`} />
          <Panel vals={side.R[f]} scale={sc.resp} colour={STIM} title="HC RESPONSE" formula="Rθ" />
          <Op sym="×" />
          <Panel vals={side.a.map(v => 1 + v)} scale={1 + sc.bias} colour={ATT}
                 title="ATTENTIONAL BIAS" formula="1 + aθ" />
          <Flow />
          <Panel vals={side.Pin[f]} scale={sc.pin} colour={ATT}
                 title="POOL AFFERENT" formula="(1+aθ) Rθ" />
        </>
      )}
      <div className="shrink-0 pt-6 text-center" style={{ width: 84 }}>
        <svg width="46" height="46" viewBox="0 0 46 46" className="mx-auto">
          <circle cx={23} cy={23} r={16} fill="var(--surface-raised)" stroke="var(--text-secondary)" strokeWidth={1.3} />
          <text x={23} y={29} textAnchor="middle" fontSize={17} fill="var(--text-primary)">Σ</text>
        </svg>
        <div className="text-[10px] tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
          S = {side.S[f].toFixed(1)}
        </div>
        <div className="text-[10px] tabular-nums" style={{ color: COOP }}>
          C = {side.C[f].toFixed(2)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border overflow-hidden"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>

      {/* ── controls ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-3 text-xs border-b"
           style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-1">
          {(['III', 'IV'] as const).map(k => (
            <button key={k} type="button" onClick={() => setMode(k)}
                    className="px-2.5 py-1 rounded border font-medium" style={btn(mode === k)}>
              Model {k}
            </button>
          ))}
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {mode === 'III' ? 'bias on the drive' : 'bias into the pool'}
        </span>
        <button type="button" onClick={() => setPlaying(p => !p)}
                className="px-3 py-1 rounded border font-medium" style={btn(false)}>
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        <input type="range" min={0} max={meta.nFrames - 1} value={f} className="flex-1 min-w-[160px]"
               onChange={e => { setPlaying(false); setFrame(Number(e.target.value)); }}
               aria-label="frame" />
        <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          frame {f + 1} · {tMs} ms
        </span>
        <span className="px-2 py-0.5 rounded"
              style={inTrans
                ? { background: '#f6e6c8', color: '#8a5a10' }
                : { background: 'var(--accent-dim)', color: 'var(--accent)' }}>
          {inTrans ? 'translation' : 'rotation'}
        </span>
      </div>

      {/* ── the instant: the schematic's panels, at the cursor ────────────────── */}
      <div className="px-4 py-3 space-y-3">
        <Row side={M.cued} label="CUED" cueDeg={meta.cuedDeg} cueName="UP" />
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <Row side={M.uncued} label="UNCUED" cueDeg={meta.uncuedDeg} cueName="DOWN" />
      </div>

      {/* ── time: raster, the three directions, the pool — one cursor ─────────── */}
      <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <svg viewBox={`0 0 ${W} ${TH}`} className="w-full h-auto">
          {/* the stimulus raster */}
          <text x={ML} y={11} fontSize={11} fontWeight={600} fill="var(--text-primary)">STIMULUS</text>
          {meta.prefsDeg.map((d, k) => (
            <g key={k}>
              <text x={ML - 6} y={RAS_Y + k * LANE + 9.5} textAnchor="end" fontSize={9}
                    fill="var(--text-muted)">{d}°</text>
              <rect x={ML} y={RAS_Y + k * LANE} width={W - ML - MR} height={LANE}
                    fill="none" stroke="var(--border)" strokeWidth={0.5} />
            </g>
          ))}
          {meta.prefsDeg.map((_, k) => {
            const on = lit.reduce<number[]>((acc, v, i) => (v === k ? [...acc, i] : acc), []);
            if (!on.length) return null;
            const x0 = px(on[0] * meta.msPerFrame), x1 = px((on[on.length - 1] + 1) * meta.msPerFrame);
            const wide = x1 - x0 > 90;
            return (
              <g key={`b${k}`}>
                <rect x={x0} y={RAS_Y + k * LANE + 2.5} width={x1 - x0} height={LANE - 5}
                      fill={STIM} opacity={0.85} />
                {NAME[k] && (
                  <text x={wide ? (x0 + x1) / 2 : x0 - 5} y={RAS_Y + k * LANE + 10}
                        textAnchor={wide ? 'middle' : 'end'} fontSize={8.5} fontWeight={700}
                        fill={wide ? 'var(--surface)' : STIM}>{NAME[k]}</text>
                )}
              </g>
            );
          })}

          {/* the three directions */}
          <text x={ML} y={TR_Y - 8} fontSize={11} fontWeight={600} fill="var(--text-primary)">
            HC RESPONSE  Rθ(t)
          </text>
          {meta.plotDeg.map((d, i) => {
            const ch = sc.chans[i], y0 = TR_Y + i * (TR_H + TR_GAP);
            const isPrimary = d === meta.rotDeg, isTrans = d === meta.transDeg;
            return (
              <g key={d}>
                {isPrimary && <rect x={px(0)} y={y0} width={px(T_ROT) - px(0)} height={TR_H}
                                    fill="var(--accent-dim)" opacity={0.55} />}
                {isTrans && <rect x={px(T_ROT)} y={y0} width={px(T) - px(T_ROT)} height={TR_H}
                                  fill="#f6e6c8" opacity={0.75} />}
                <line x1={ML} y1={y0 + TR_H} x2={W - MR} y2={y0 + TR_H} stroke="var(--border)" />
                <text x={ML - 6} y={y0 + TR_H / 2 + 3.5} textAnchor="end" fontSize={10}
                      fontWeight={700} fill="var(--text-primary)">{d}°</text>
                <path d={linePath(M.uncued.R.map(r => r[ch]), y0, TR_H, sc.trace)} fill="none"
                      stroke={STIM} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.85} />
                <path d={linePath(M.cued.R.map(r => r[ch]), y0, TR_H, sc.trace)} fill="none"
                      stroke={STIM} strokeWidth={2} />
                {d === meta.uncuedDeg && (
                  <text x={ML + 6} y={y0 + 10} fontSize={8.5} fill="var(--text-muted)">
                    no drive, ever — where the UNCUED bias points
                  </text>
                )}
                <circle cx={px(tMs)} cy={y0 + TR_H - TR_H * (M.cued.R[f][ch] / sc.trace)} r={3}
                        fill={CURSOR} />
              </g>
            );
          })}

          {/* the pool */}
          <text x={ML} y={POOL_Y - 8} fontSize={11} fontWeight={600} fill="var(--text-primary)">
            COOPERATIVE POOL  S(t)
          </text>
          <rect x={px(T_ROT)} y={POOL_Y} width={px(T) - px(T_ROT)} height={POOL_H}
                fill="#f6e6c8" opacity={0.75} />
          <line x1={ML} y1={POOL_Y + POOL_H} x2={W - MR} y2={POOL_Y + POOL_H} stroke="var(--border)" />
          <path d={linePath(M.uncued.S, POOL_Y, POOL_H, sc.pool)} fill="none" stroke={COOP}
                strokeWidth={1.6} strokeDasharray="3 3" />
          <path d={linePath(M.cued.S, POOL_Y, POOL_H, sc.pool)} fill="none" stroke={COOP} strokeWidth={2.1} />
          <text x={ML + 6} y={POOL_Y + POOL_H - 5} fontSize={8.5} fill="var(--text-muted)">
            C = CoopL·S is the ONLY route to {meta.transDeg}° once the dot turns
          </text>
          <text x={W - MR + 4} y={POOL_Y + POOL_H - POOL_H * (M.cued.S[f] / sc.pool) + 3}
                fontSize={9} fontWeight={700} fill={COOP}>cued</text>
          <text x={W - MR + 4} y={POOL_Y + POOL_H - POOL_H * (M.uncued.S[f] / sc.pool) + 3}
                fontSize={9} fill={COOP} opacity={0.8}>unc</text>
          <circle cx={px(tMs)} cy={POOL_Y + POOL_H - POOL_H * (M.cued.S[f] / sc.pool)} r={3} fill={CURSOR} />

          {/* THE CURSOR — one line through every time panel, so they cannot disagree */}
          <line x1={px(tMs)} y1={RAS_Y} x2={px(tMs)} y2={POOL_Y + POOL_H}
                stroke={CURSOR} strokeWidth={1.5} />
          <polygon points={`${px(tMs)},${RAS_Y - 1} ${px(tMs) - 4},${RAS_Y - 8} ${px(tMs) + 4},${RAS_Y - 8}`}
                   fill={CURSOR} />
          {[0, 200, 400, 600].map(t => (
            <text key={t} x={px(t)} y={TH - 8} textAnchor="middle" fontSize={9} fill="var(--text-muted)">{t}</text>
          ))}
          <text x={W - MR} y={TH - 8} textAnchor="end" fontSize={9} fill="var(--text-muted)">time (ms)</text>
        </svg>
      </div>

      {/* ── read-outs, then the provenance footer ─────────────────────────────── */}
      <div className="px-4 py-2 text-[11px] flex flex-wrap gap-x-5 gap-y-1 border-t"
           style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <span>attentional index — primary <strong className="tabular-nums">{M.primary.toFixed(4)}</strong></span>
        <span>translation <strong className="tabular-nums">{M.translation.toFixed(4)}</strong></span>
        <span>ratio <strong className="tabular-nums">{M.ratio.toFixed(3)}</strong></span>
        <span className="opacity-70">solid = cued · dashed = uncued</span>
        <span className="opacity-70">
          panels fixed to the run&apos;s peak over both rows — comparable across rows and time
        </span>
      </div>
      <div className="px-4 py-2 text-[10px] flex flex-wrap gap-x-4 gap-y-1"
           style={{ color: 'var(--text-muted)', background: 'var(--surface-raised)' }}>
        <span>CoopL {M.CoopL.toFixed(2)}</span>
        <span>biasAmp {M.biasAmp.toFixed(4)}</span>
        <span>loop gain {M.loopGain.toFixed(3)}</span>
        <span>τ {meta.tau_ms} ms (cells)</span>
        <span>τ<sub>S</sub> {meta.tauS_ms} ms (pool)</span>
        <span>{meta.nRot * meta.msPerFrame} ms rotation at {meta.rotDeg}° + {meta.nTrans * meta.msPerFrame} ms translation at {meta.transDeg}°</span>
        <span className="opacity-80">exported {meta.generated} from {meta.source}</span>
      </div>
    </div>
  );
}
