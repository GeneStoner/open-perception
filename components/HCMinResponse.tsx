'use client';

/**
 * HCMinResponse — the motion-only hypercolumn model running, one dot in one V1 receptive field.
 *
 * ⭐ THIS IS fig_response_profile.py's LAYOUT, MADE LIVE. GS, 2026-08-21: the interactive version
 * "should have the same spatial layout and components as the static schematics". It does, and the
 * reason is not consistency for its own sake — the layout carries meaning:
 *
 *   * a modulator arrives OFF-AXIS, above the spine (Figure 6's grammar). WHICH OPERATOR the
 *     attention panel feeds is the one visible fact separating Model III from Model IV, and the
 *     first version of this file flattened everything onto one line and lost it — drawing Model
 *     IV's bias gaining the DRIVE, which is Model III's claim.
 *   * the cooperative return lane is THE LOOP. That version reduced C to a printed number, hiding
 *     the thing this figure exists to show.
 *
 * LAYOUT, matching the PNG panel for panel:
 *   LEFT COLUMN   the whole time story on one x-axis — the stimulus raster, R_theta(t) for the
 *                 three directions, then S(t) — with ONE cursor through all of it
 *   RIGHT         two rows, CUED above UNCUED, each the schematic's spine with its off-axis
 *                 bias/gain and its cooperative return lane, carrying the values AT the cursor
 *
 * So the still is this component with the cursor parked: at frame 60 it is
 * fig_model{III,IV}_response.png, at frame 63 the _f63 stills.
 *
 * It is ONE <svg> with a viewBox rather than a reflowing flex layout, because the spine geometry
 * IS the statement — it scales down on a narrow screen instead of rearranging into a different
 * claim. Coordinates are the PNG's own figure units (y UP), flipped once at render by Y(), so the
 * two files can be read side by side when either is edited.
 *
 * ⚠️ EVERY NUMBER COMES FROM THE MODEL, via public/data/hc_min_onedot.json, exported by
 * pointset/hc_min_onedot_export.m. No illustrative values anywhere. The read-outs are ASSERTED on
 * load and the component renders an explicit error rather than a plausible-looking figure.
 *
 * ⚠️ WHY THE PROVENANCE FOOTER EXISTS. HCPSViewer.tsx has been rendering a WITHDRAWN operating
 * point since 2026-07-26 while the schematic above it was regenerated — see
 * HCPS_MODELING_SECTION_TODO.md. The JSON here is a COPY of the file in the MATLAB tree and can
 * drift the same way, so the export timestamp and every run parameter are printed on the page.
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

/* What hc_min_onedot prints. If the payload disagrees, the PAYLOAD is wrong — never adjust these
 * to match it. The same guard the Python generators carry. */
const EXPECT: Record<'III' | 'IV', [number, number]> = { III: [0.4445, 0.3681], IV: [0.4338, 0.4358] };

/* Palette, in step with the Python generators — orange/green failed CIEDE2000 at 9 under
 * protanopia and 6 in greyscale; this Okabe-Ito pair passes at 56/22 (fig_cvd_check.py). COOP also
 * carries a DASH, so the distinction survives monochrome.
 * STIM is the one role that does NOT hardcode: in print it is dark ink on white, which would
 * vanish on this site's dark theme, and it is a neutral sensory quantity — what --text-primary
 * means here. It plays no part in the CVD result, which measures ATT against COOP. */
const ATT = '#E69F00';
const COOP = '#0072B2';
const STIM = 'var(--text-primary)';
const CURSOR = '#C1272D';
const BAND = 'var(--accent-dim)';

const nz = (v: number) => (v > 0 ? v : 1e-9);

/* ── canvas, in fig_response_profile.py's own constants ─────────────────────────────────── */
const XL = 16.9, YL = 16.6;      // identical to fig_response_profile.py
const CH = 0.32, COLW = 1.75, PH = 8 * CH;
const RX = 1.42, RW = 3.95;
const RAS_TOP = 15.05, RAS_BOT = RAS_TOP - PH;
const TRH = 1.62, TRG = 0.26;
const TR_TOP = RAS_BOT - 1.05;
const POOL_TOP = TR_TOP - 3 * TRH - 2 * TRG - 1.05;
const POOL_H = 2.0;
const LC_BOT = POOL_TOP - POOL_H;
const RCEN = RAS_BOT + PH / 2;
const FX = RX + RW + 0.48;
const YB_U = 0.95, YA_U = YB_U + PH + 1.05;
const YB_C = YA_U + PH + 1.85, YA_C = YB_C + PH + 1.05;
const SP_U = YB_U + 4 * CH, SP_C = YB_C + 4 * CH;
const C1 = 6.30, XOP1 = 8.90, C2 = 9.70, XOP2 = 12.30, C3 = 13.10;
const CG = XOP1 - COLW / 2, CB = XOP2 - COLW / 2, CA = 6.30;
const SR = 0.40;         // the pool neuron's radius
// SX (the pool's x) depends on the model, so it is resolved per render, not here

const Y = (v: number) => YL - v;                    // figure coords are y-UP; SVG is y-down

export default function HCMinResponse({ src = '/data/hc_min_onedot.json' }: { src?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<'III' | 'IV'>('III');
  const [frame, setFrame] = useState(59);           // end of rotation — where the stills park
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: Data) => {
        if (!alive) return;
        for (const key of ['III', 'IV'] as const) {
          const m = d.models?.[key];
          if (!m) return setErr(`payload has no model ${key}`);
          if (!m.converged) return setErr(`model ${key} did not converge in the export`);
          const [p, t] = EXPECT[key];
          if (Math.abs(m.primary - p) > 5e-5 || Math.abs(m.translation - t) > 5e-5) {
            return setErr(
              `model ${key} read-outs disagree with hc_min_onedot — expected ${p}/${t}, payload ` +
              `has ${m.primary}/${m.translation}. The export is stale or wrong.`);
          }
        }
        setData(d);
      })
      .catch(e => alive && setErr(String(e)));
    return () => { alive = false; };
  }, [src]);

  const nF = data?.meta.nFrames ?? 65;
  const step = useCallback((t: number) => {
    // 10 ms of model time per frame; 95 ms of real time is the ~10x slowed march GS asked for,
    // and matches HCPSViewer's cadence so the two figures feel like one page
    if (t - last.current > 95) { last.current = t; setFrame(fr => (fr + 1) % nF); }
    raf.current = requestAnimationFrame(step);
  }, [nF]);
  useEffect(() => {
    if (!playing) { if (raf.current) cancelAnimationFrame(raf.current); return; }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, step]);

  /* FIXED SCALES — the run's peak over every frame AND both cue conditions, exactly as the PNGs
   * compute them. Never per-frame: bars would jump under playback, and the cued-vs-uncued
   * comparison the two rows exist for would be destroyed.
   * ⚠️ A hook, so it must stay ABOVE the early returns — HCPSViewer carries a comment about
   * exactly this hook-order trap. */
  const sc = useMemo(() => {
    if (!data) return null;
    const m = data.models[mode];
    const cols = (A: number[][]) => Math.max(...A.map(r => Math.max(...r)));
    const both = (fn: (s: Side) => number) => Math.max(fn(m.cued), fn(m.uncued));
    const chans = data.meta.plotDeg.map(d => data.meta.prefsDeg.indexOf(d));
    return {
      drive: nz(cols(data.stim.u)),
      bias: nz(both(s => Math.max(...s.a))),
      // what the GAIN panel actually draws: a_theta + C in Model III, C alone in Model IV.
      // Scaled to its own max over time and both cue conditions so the flat band uses the
      // panel's full sweep — the point of the panel is watching that band move.
      gain: nz(mode === 'III' ? both(s => Math.max(...s.a) + Math.max(...s.C))
                              : both(s => Math.max(...s.C))),
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
  const onDrive = mode === 'III';
  const SX = onDrive ? 12.55 : 15.95;
  const f = Math.min(frame, meta.nFrames - 1);
  const MS = meta.msPerFrame, T = meta.nFrames * MS, T_ROT = meta.nRot * MS;
  const tMs = (f + 1) * MS;
  const inTrans = f + 1 > meta.nRot;
  const xOf = (ms: number) => RX + RW * (ms / T);
  const xc = xOf(tMs);

  const btn = (a: boolean): React.CSSProperties => ({
    borderColor: a ? 'var(--accent)' : 'var(--border)',
    color: a ? 'var(--accent)' : 'var(--text-secondary)',
    background: a ? 'var(--accent-dim)' : 'transparent',
  });

  const el: React.ReactNode[] = [];
  let n = 0;
  const k = () => `n${n++}`;

  const txt = (x: number, y: number, s: string, o: Partial<{
    size: number; fill: string; anchor: 'start' | 'middle' | 'end'; weight: number; italic: boolean;
  }> = {}) => el.push(
    <text key={k()} x={x} y={Y(y)} fontSize={o.size ?? 0.19} fill={o.fill ?? 'var(--text-primary)'}
          textAnchor={o.anchor ?? 'start'} fontWeight={o.weight ?? 400}
          fontStyle={o.italic ? 'italic' : 'normal'} dominantBaseline="middle">{s}</text>);

  const line = (x0: number, y0: number, x1: number, y1: number, o: Partial<{
    c: string; w: number; dash: string;
  }> = {}) => el.push(
    <line key={k()} x1={x0} y1={Y(y0)} x2={x1} y2={Y(y1)} stroke={o.c ?? 'var(--text-primary)'}
          strokeWidth={o.w ?? 0.035} strokeDasharray={o.dash} strokeLinecap="round" />);

  /* the arrowhead is drawn, not an SVG marker, so it lives in figure units and cannot rescale
   * independently of the geometry it points at */
  const arrow = (x0: number, y0: number, x1: number, y1: number, o: Partial<{
    c: string; w: number; dash: string;
  }> = {}) => {
    const c = o.c ?? 'var(--text-primary)';
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, h = 0.17, s = 0.42;
    line(x0, y0, x1 - ux * h, y1 - uy * h, o);
    el.push(<polygon key={k()} fill={c}
      points={`${x1},${Y(y1)} ${x1 - ux * h + uy * h * s},${Y(y1 - uy * h - ux * h * s)} ` +
              `${x1 - ux * h - uy * h * s},${Y(y1 - uy * h + ux * h * s)}`} />);
  };

  /* one FIELD over the 8 channels — the schematic's panel() */
  const panel = (x: number, y0: number, vals: number[], scale: number, colour: string,
                 title: string, formula: string, ticks = false) => {
    el.push(<rect key={k()} x={x} y={Y(y0 + PH)} width={COLW} height={PH} rx={0.05}
                  fill="var(--background)" stroke="var(--text-primary)" strokeWidth={0.032} />);
    vals.forEach((v, i) => {
      const cy = y0 + PH - CH * (i + 1);
      if (i) line(x, y0 + PH - CH * i, x + COLW, y0 + PH - CH * i, { c: 'var(--border)', w: 0.014 });
      el.push(<rect key={k()} x={x + 0.05} y={Y(cy + CH - 0.065)}
                    width={Math.max(0, 0.88 * COLW * (v / scale))} height={CH - 0.13}
                    fill={colour} opacity={0.92} />);
      if (ticks) txt(x - 0.14, cy + CH / 2, `${meta.prefsDeg[i]}°`,
                     { size: 0.16, fill: 'var(--text-muted)', anchor: 'end' });
    });
    txt(x, y0 + PH + 0.46, title, { size: 0.2, weight: 700 });
    txt(x, y0 + PH + 0.22, formula, { size: 0.19, fill: 'var(--text-secondary)' });
  };

  /* the GAIN box: the flat cooperative band C with the tuned cap a_theta stacked on it. Stacking
   * IS addition — they add, they do not compound (the cross-term would be 104% of the coded
   * gain), which is why no operator glyph sits between them. Returns the flat band's centre x, so
   * the cooperative arrow drops onto the band it actually feeds and cannot drift. */
  const gainbox = (x: number, y0: number, s: Side, tuned: number[], formula: string) => {
    const C = s.C[f];
    const kmax = Math.max(...tuned) > 0 ? tuned.indexOf(Math.max(...tuned)) : 0;
    el.push(<rect key={k()} x={x} y={Y(y0 + PH)} width={COLW} height={PH} rx={0.05}
                  fill="var(--background)" stroke="var(--text-primary)" strokeWidth={0.032} />);
    tuned.forEach((av, i) => {
      const cy = y0 + PH - CH * (i + 1);
      if (i) line(x, y0 + PH - CH * i, x + COLW, y0 + PH - CH * i, { c: 'var(--border)', w: 0.014 });
      const w1 = 0.88 * COLW * (C / sc.gain), w2 = 0.88 * COLW * (av / sc.gain);
      el.push(<rect key={k()} x={x + 0.05} y={Y(cy + CH - 0.065)} width={Math.max(0, w1)}
                    height={CH - 0.13} fill={COOP} opacity={0.95} />);
      el.push(<rect key={k()} x={x + 0.05 + w1} y={Y(cy + CH - 0.065)} width={Math.max(0, w2)}
                    height={CH - 0.13} fill={ATT} opacity={0.95} />);
      // Model IV has NO tuned cap, so the C label keys off the FLAT band's own width
      if (i === kmax && w1 > 0.30) txt(x + 0.05 + w1 / 2, cy + CH / 2, 'C',
                                       { size: 0.16, fill: '#fff', anchor: 'middle' });
      if (i === kmax && w2 > 0.16) txt(x + 0.05 + w1 + w2 / 2, cy + CH / 2, 'aθ',
                                       { size: 0.16, anchor: 'middle' });
    });
    // right-aligned: the cooperative arrow comes down into this box's top-LEFT
    txt(x + COLW, y0 + PH + 0.46, 'GAIN', { size: 0.2, weight: 700, anchor: 'end' });
    txt(x + COLW, y0 + PH + 0.22, formula,
        { size: 0.19, fill: 'var(--text-secondary)', anchor: 'end' });
    return x + 0.05 + (0.88 * COLW * (C / sc.gain)) / 2;
  };

  const opnode = (x: number, y: number, sym: string) => {
    el.push(<circle key={k()} cx={x} cy={Y(y)} r={0.22} fill="var(--background)"
                    stroke="var(--text-primary)" strokeWidth={0.032} />);
    txt(x, y, sym, { size: 0.26, anchor: 'middle' });
  };

  /* ── LEFT COLUMN: the whole time story, one x-axis, one cursor ─────────────────────── */
  const tracePanel = (y0: number, h: number, cued: number[], unc: number[], top: number,
                      label: string, colour: string, note?: string, shade?: [number, number]) => {
    if (shade) el.push(<rect key={k()} x={xOf(shade[0])} y={Y(y0 + h)}
                             width={xOf(shade[1]) - xOf(shade[0])} height={h}
                             fill={BAND} opacity={0.55} />);
    line(RX, y0, RX + RW, y0, { c: 'var(--border)', w: 0.02 });
    const path = (v: number[]) => v.map((y, i) =>
      `${i ? 'L' : 'M'}${xOf((i + 1) * MS).toFixed(3)},${Y(y0 + h * (y / top)).toFixed(3)}`).join(' ');
    // uncued is DOTTED, deliberately not the schematics' dash — there, dashed means COOPERATION
    el.push(<path key={k()} d={path(unc)} fill="none" stroke={colour} strokeWidth={0.032}
                  strokeDasharray="0.09 0.09" />);
    el.push(<path key={k()} d={path(cued)} fill="none" stroke={colour} strokeWidth={0.045} />);
    txt(RX - 0.14, y0 + h / 2, label, { size: 0.19, weight: 700, anchor: 'end' });
    if (note) txt(RX + 0.12, y0 + h - 0.18, note,
                  { size: 0.15, fill: 'var(--text-muted)', italic: true });
  };

  // the raster
  el.push(<rect key={k()} x={RX} y={Y(RAS_TOP)} width={RW} height={PH} rx={0.05}
                fill="var(--background)" stroke="var(--text-primary)" strokeWidth={0.032} />);
  const lit = data.stim.u.map(r => r.indexOf(Math.max(...r)));
  const NAME: Record<number, string> = { 0: 'RIGHT', 2: 'UP', 4: 'LEFT', 6: 'DOWN' };
  meta.prefsDeg.forEach((d, i) => {
    const cy = RAS_BOT + PH - CH * (i + 1);
    if (i) line(RX, RAS_BOT + PH - CH * i, RX + RW, RAS_BOT + PH - CH * i,
                { c: 'var(--border)', w: 0.014 });
    txt(RX - 0.14, cy + CH / 2, `${d}°`, { size: 0.16, fill: 'var(--text-muted)', anchor: 'end' });
    const on = lit.reduce<number[]>((acc, v, j) => (v === i ? [...acc, j] : acc), []);
    if (!on.length) return;
    const x0 = xOf(on[0] * MS), x1 = xOf((on[on.length - 1] + 1) * MS);
    el.push(<rect key={k()} x={x0} y={Y(cy + CH - 0.065)} width={x1 - x0} height={CH - 0.13}
                  fill={STIM} opacity={0.85} />);
    // ⚠️ the lit rows are DERIVED from the drive's argmax, never typed, so the raster and the
    // DRIVE panel beside it cannot disagree about which way the dot is going
    if (NAME[i]) {
      const wide = x1 - x0 > 0.9;
      txt(wide ? (x0 + x1) / 2 : x0 - 0.10, cy + CH / 2, NAME[i],
          { size: 0.155, weight: 700, anchor: wide ? 'middle' : 'end',
            fill: wide ? 'var(--background)' : STIM });
    }
  });
  txt(RX, RAS_TOP + 0.46, 'STIMULUS', { size: 0.2, weight: 700 });
  txt(RX, RAS_TOP + 0.24, 'one dot, one V1 RF',
      { size: 0.17, fill: 'var(--text-secondary)', italic: true });
  txt(RX + RW, RAS_TOP + 0.46, `frame ${f + 1} · t = ${tMs} ms`,
      { size: 0.18, fill: CURSOR, weight: 700, anchor: 'end' });

  // the three directions
  txt(RX, TR_TOP + 0.30, 'HC RESPONSE', { size: 0.2, weight: 700 });
  txt(RX + 2.90, TR_TOP + 0.30, 'Rθ(t)', { size: 0.19, fill: 'var(--text-secondary)' });
  meta.plotDeg.forEach((d, i) => {
    const ch = sc.chans[i], y0 = TR_TOP - (i + 1) * TRH - i * TRG;
    tracePanel(y0, TRH, M.cued.R.map(r => r[ch]), M.uncued.R.map(r => r[ch]), sc.trace,
               `${d}°`, STIM, d === meta.uncuedDeg ? 'no drive, ever' : undefined,
               d === meta.rotDeg ? [0, T_ROT] : d === meta.transDeg ? [T_ROT, T] : undefined);
  });

  // the pool
  txt(RX, POOL_TOP + 0.30, 'COOPERATIVE POOL', { size: 0.2, weight: 700 });
  txt(RX + 2.90, POOL_TOP + 0.30, 'S(t)', { size: 0.19, fill: 'var(--text-secondary)' });
  tracePanel(POOL_TOP - POOL_H, POOL_H, M.cued.S, M.uncued.S, sc.pool, 'S', COOP,
             `C = CoopL·S — the ONLY route to ${meta.transDeg}°`, [T_ROT, T]);

  // the shared time axis
  for (let t = 0; t <= T; t += 200) {
    line(xOf(t), LC_BOT - 0.06, xOf(t), LC_BOT, { w: 0.025 });
    txt(xOf(t), LC_BOT - 0.26, `${t}`, { size: 0.16, fill: 'var(--text-muted)', anchor: 'middle' });
  }
  txt(RX + RW / 2, LC_BOT - 0.58, 'time (ms)',
      { size: 0.18, fill: 'var(--text-secondary)', anchor: 'middle' });

  /* ── RIGHT: one row per cue condition, the schematic's own spine ───────────────────── */
  const row = (side: Side, YB: number, YA: number) => {
    const SP = YB + 4 * CH;
    panel(C1, YB, data.stim.u[f], sc.drive, STIM, 'STIMULUS DRIVE', 'uθ', true);
    arrow(C1 + COLW + 0.05, SP, XOP1 - 0.26, SP);
    opnode(XOP1, SP, '×');
    arrow(XOP1 + 0.26, SP, C2 - 0.05, SP);
    panel(C2, YB, side.R[f], sc.resp, STIM, 'HC RESPONSE', 'Rθ');

    let drop: number;
    if (onDrive) {
      arrow(C2 + COLW + 0.05, SP, SX - SR - 0.05, SP, { c: 'var(--text-muted)' });
      drop = gainbox(CG, YA, side, side.a, 'aθ + C');
      arrow(XOP1, YA - 0.05, XOP1, SP + 0.26);
      panel(CA, YA, side.a, sc.bias, ATT, 'ATTENTIONAL BIAS', 'aθ');
      arrow(CA + COLW + 0.05, YA + PH * 0.5, CG - 0.05, YA + PH * 0.5, { c: ATT });
    } else {
      // ⚠️ ORDER IS THE CLAIM. Model IV's bias multiplies the RESPONSE, not the drive: it arrives
      // off-axis onto the SECOND operator, and the spine's third slot is the POOL AFFERENT, which
      // is what Sigma sums. Putting the bias before the response would be Model III's claim.
      arrow(C2 + COLW + 0.05, SP, XOP2 - 0.26, SP);
      opnode(XOP2, SP, '×');
      arrow(XOP2 + 0.26, SP, C3 - 0.05, SP);
      panel(C3, YB, side.Pin[f], sc.pin, ATT, 'POOL AFFERENT', '(1+aθ) Rθ');
      arrow(C3 + COLW + 0.05, SP, SX - SR - 0.05, SP, { c: 'var(--text-muted)' });
      panel(CB, YA, side.a.map(v => 1 + v), 1 + sc.bias, ATT, 'ATTENTIONAL BIAS', '1 + aθ');
      arrow(XOP2, YA - 0.05, XOP2, SP + 0.26, { c: ATT });
      // ⭐ GS, 2026-08-22: Model IV gets a GAIN panel too. Its gain is a lone SCALAR, so all
      // eight bars are identical — and that IS the point once this animates: they rise and fall
      // in UNISON, the visible signature of a broadcast scalar, read against Model III's stack
      // where the same flat band carries a FIXED tuned cap on top. Same slot as Model III's, so
      // the two are compared at the same position.
      // (Until 2026-08-21 this panel was deliberately omitted, the argument being that its
      // ABSENCE said "one number". True in a still; in an animation the MOTION says it better.)
      drop = gainbox(CG, YA, side, side.a.map(() => 0), 'C');
      arrow(XOP1, YA - 0.05, XOP1, SP + 0.26);
    }

    // the pool, and the cooperative gain returning up and to the left — THE LOOP
    el.push(<circle key={k()} cx={SX} cy={Y(SP)} r={SR} fill="var(--surface-raised)"
                    stroke="var(--text-primary)" strokeWidth={0.038} />);
    txt(SX, SP, 'Σ', { size: 0.34, anchor: 'middle' });
    txt(SX, SP - SR - 0.26, `S = ${side.S[f].toFixed(1)}`,
        { size: 0.19, weight: 700, anchor: 'middle' });
    const RET = YA + PH + 0.98;
    line(SX, SP + SR + 0.02, SX, RET, { c: COOP, w: 0.042, dash: '0.16 0.09' });
    line(SX, RET, drop, RET, { c: COOP, w: 0.042, dash: '0.16 0.09' });
    arrow(drop, RET, drop, YA + PH + 0.05, { c: COOP, w: 0.042, dash: '0.16 0.09' });
    txt(SX - 0.14, RET + 0.24, `C = ${side.C[f].toFixed(2)}`,
        { size: 0.2, fill: COOP, weight: 700, anchor: 'end' });
  };

  row(M.cued, YB_C, YA_C);
  row(M.uncued, YB_U, YA_U);

  /* ── the fork, then THE CURSOR last so it sits above everything ────────────────────── */
  // one stimulus, forking into the two cue conditions — the SAME dot field drives both
  line(RX + RW + 0.06, RCEN, FX, RCEN, { w: 0.038 });
  line(FX, SP_U, FX, SP_C, { w: 0.038 });
  arrow(FX, SP_C, C1 - 0.05, SP_C, { w: 0.038 });
  arrow(FX, SP_U, C1 - 0.05, SP_U, { w: 0.038 });
  el.push(<line key={k()} x1={xc} y1={Y(LC_BOT)} x2={xc} y2={Y(RAS_TOP + 0.02)}
                stroke={CURSOR} strokeWidth={0.038} />);
  el.push(<polygon key={k()} fill={CURSOR}
    points={`${xc},${Y(RAS_TOP + 0.04)} ${xc - 0.10},${Y(RAS_TOP + 0.24)} ${xc + 0.10},${Y(RAS_TOP + 0.24)}`} />);

  const rowLabel = (y: number, big: string, small: string) => (
    <>
      <g transform={`rotate(-90 0.42 ${Y(y)})`}>
        <text x={0.42} y={Y(y)} fontSize={0.30} fontWeight={700} textAnchor="middle"
              dominantBaseline="middle" fill="var(--text-primary)">{big}</text>
      </g>
      <g transform={`rotate(-90 0.74 ${Y(y)})`}>
        <text x={0.74} y={Y(y)} fontSize={0.17} fontStyle="italic" textAnchor="middle"
              dominantBaseline="middle" fill={ATT}>{small}</text>
      </g>
    </>
  );

  return (
    <div className="rounded-lg border overflow-hidden"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="px-4 pt-3 pb-2 flex flex-wrap items-center gap-3 text-xs border-b"
           style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-1">
          {(['III', 'IV'] as const).map(m => (
            <button key={m} type="button" onClick={() => setMode(m)}
                    className="px-2.5 py-1 rounded border font-medium" style={btn(mode === m)}>
              Model {m}
            </button>
          ))}
        </div>
        <span style={{ color: 'var(--text-muted)' }}>
          {onDrive ? 'bias on the drive' : 'bias into the pool'}
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
              style={inTrans ? { background: '#f6e6c8', color: '#8a5a10' }
                             : { background: 'var(--accent-dim)', color: 'var(--accent)' }}>
          {inTrans ? 'translation' : 'rotation'}
        </span>
      </div>

      <div className="px-3 py-3">
        {/* the PNG's top 0.6 is its title band; here that lives in HTML, so trim it */}
        <svg viewBox={`0 0.6 ${XL} ${YL - 0.6}`} className="w-full h-auto"
             role="img" aria-label={`Model ${mode} response at ${tMs} ms`}>
          {rowLabel(SP_C, 'CUED', `bias at ${meta.cuedDeg}° (UP)`)}
          {rowLabel(SP_U, 'UNCUED', `bias at ${meta.uncuedDeg}° (DOWN)`)}
          {el}
        </svg>
      </div>

      <div className="px-4 py-2 text-[11px] flex flex-wrap gap-x-5 gap-y-1 border-t"
           style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <span>attentional index — primary <strong className="tabular-nums">{M.primary.toFixed(4)}</strong></span>
        <span>translation <strong className="tabular-nums">{M.translation.toFixed(4)}</strong></span>
        <span>ratio <strong className="tabular-nums">{M.ratio.toFixed(3)}</strong></span>
        <span className="opacity-70">solid = cued · dotted = uncued</span>
        <span className="opacity-70">
          every panel is fixed to the run&apos;s peak over both rows — comparable across rows and time
        </span>
      </div>
      <div className="px-4 py-2 text-[10px] flex flex-wrap gap-x-4 gap-y-1"
           style={{ color: 'var(--text-muted)', background: 'var(--surface-raised)' }}>
        <span>CoopL {M.CoopL.toFixed(2)}</span>
        <span>biasAmp {M.biasAmp.toFixed(4)}</span>
        <span>loop gain {M.loopGain.toFixed(3)}</span>
        <span>τ {meta.tau_ms} ms (cells)</span>
        <span>τ<sub>S</sub> {meta.tauS_ms} ms (pool)</span>
        <span>{T_ROT} ms rotation at {meta.rotDeg}° + {meta.nTrans * MS} ms translation at {meta.transDeg}°</span>
        <span className="opacity-80">exported {meta.generated} from {meta.source}</span>
      </div>
    </div>
  );
}
