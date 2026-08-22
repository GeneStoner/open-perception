'use client';

/**
 * TwoPSResponse — Model IV running with TWO POINT-SETS, one V1 receptive field each.
 *
 * ⭐ THIS IS fig_2ps_response.py's LAYOUT, MADE LIVE — which is in turn fig_2ps_schematic.py's
 * body with the whole time story beside it. Same rule as stage 1's HCMinResponse: the layout
 * carries meaning, so the component matches the PNG panel for panel rather than reflowing into
 * a different claim.
 *
 *   LEFT COLUMN   one x-axis, one cursor: the two RFs' stimulus rasters, then the five response
 *                 traces (three motion channels, two colours), then the cooperation pools —
 *                 each drawing cued (solid) against uncued (dashed)
 *   RIGHT         the schematic body at the cursor: two point-sets, each an RF feeding a motion
 *                 and a colour hypercolumn bound by one pool, both sharing ONE normalizer and
 *                 ONE attentional bias field
 *
 * ⭐ THE BODY SHOWS ONE CUE CONDITION AT A TIME, switched by the toggle. GS's call: the
 * schematic is already two point-sets stacked, and drawing it twice would double an eight-panel
 * figure. The cued-vs-uncued comparison lives in the traces, which show both at once always.
 *
 * ⭐ THE RF BOXES ARE THE STIMULUS EVENT. A's dot points up for the whole run; B's turns RIGHT
 * for the 80 ms translation and back. Their direction is read from meta.dotDeg, i.e. from the
 * model's own stimulus — never drawn by hand, so the dot cannot disagree with the drive.
 *
 * ⚠️ EVERY NUMBER COMES FROM THE MODEL, via public/data/toy_2ps.json, exported by
 * toy_2ps_export.m. No illustrative values. The read-outs are ASSERTED on load and the component
 * renders an explicit error rather than a plausible-looking figure.
 *
 * ⚠️ WHY THE PROVENANCE FOOTER EXISTS. HCPSViewer.tsx rendered a WITHDRAWN operating point for a
 * month while the schematic above it was regenerated. This JSON is a COPY of the file in the
 * MATLAB tree and can drift the same way, so meta.generated and every run parameter are printed.
 *
 * ⚠️ Panels are scaled to the RUN's peak over BOTH cue conditions (scales.* in the payload),
 * never per-frame — per-frame peaks make bars jump under playback, and per-panel peaks would
 * destroy the comparison the toggle exists for.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PS<T> = { A: T; B: T };
type Side = {
  a: number[]; Rm: PS<number[][]>; Rc: PS<number[][]>; Pin: PS<number[][]>;
  S: PS<number[]>; C: PS<number[]>; den: number[]; biasIdx: number;
};
type Trace = { cued: number[]; uncued: number[]; deg: number; pointset: string };
type Meta = {
  source: string; model: string; figure: string; generated: string;
  msPerStep: number; decim: number; nSteps: number; nFrames: number; frames: number[];
  durs: number[]; wPre: [number, number]; wProbe: [number, number];
  params: { tau: number; tauS: number; CoopL: number; biasAmp: number; nV1: number;
            sigNR: number; normW: number; cdrive: number; kappa: number; kappaC: number;
            biasInPool: boolean; featureNorm: boolean; Rmax: number };
  physDeg: number[]; hueDeg: number[]; dotDeg: PS<number[]>;
  read: { primary: number; colour: number; translation: number };
  checks: { converged: boolean; denIdentity: number; RmaxFrac: number };
};
type Data = {
  meta: Meta;
  stim: { um: PS<number[][]>; uc: PS<number[]> };
  traces: Record<string, Trace> & {
    S: Record<'cued' | 'uncued', PS<number[]>>; C: Record<'cued' | 'uncued', PS<number[]>>;
  };
  scales: { um: number; uc: number; Rm: number; Rc: number; Pin: number; bias: number;
            S: number; den: number };
  cued: Side; uncued: Side;
};

/* What toy_2ps_run prints. If the payload disagrees, the PAYLOAD is wrong — never adjust these
 * to match it. The same guard the Python generator carries. */
const EXPECT = { primary: 0.4684280, colour: 0.4684280, translation: 0.3538053 };

/* Palette, in step with fig_2ps_response.py and fig_2ps_schematic.py; fig_cvd_check.py measures
 * ATT against COOP (orange/green failed at 9 under protanopia, this pair passes at 56). COOP
 * also carries a DASH, so the distinction survives monochrome. STIM is the one role that does
 * not hardcode: in print it is dark ink on white, which would vanish on this site's dark theme. */
const ATT = '#E69F00';
const COOP = '#0072B2';
const NORM = 'var(--text-secondary)';
const STIM = 'var(--text-primary)';
const INK = 'var(--text-primary)';
const MUTE = 'var(--text-muted)';
const LINE = 'var(--border)';
const FILL = 'var(--surface)';
const CURSOR = '#C1272D';
const HUE_RING = ['#cf3b2f', '#dd7a22', '#d9c31e', '#93b62b', '#2f8f5b', '#93b62b', '#d9c31e', '#dd7a22'];
const RED_INK = HUE_RING[0], GREEN_INK = HUE_RING[4];

/* ── canvas, in fig_2ps_response.py's own constants ──────────────────────────────────────── */
const CH = 0.26, COLW = 1.62, PH = 8 * CH;
const LEFTW = 6.70;
const RFX = 1.05 + LEFTW, RFW = 1.75;
const FKX = 3.25 + LEFTW;
const C1 = 3.85 + LEFTW;
const XOP1 = 6.30 + LEFTW;
const XDIV = 7.15 + LEFTW;
const C2 = 7.70 + LEFTW;
const XOP2 = 9.95 + LEFTW;
const C3 = 10.55 + LEFTW;
const SX = 13.30 + LEFTW;
const SR = 0.40;
const NORMW = 2.60, NORMH = 2.10;   // 2.10: the box now carries C_A and C_B too
const CBIAS = XOP2 - COLW / 2;
const YCB = 1.40, YMB = YCB + PH + 0.80;
const YCA = YMB + PH + 4.20, YMA = YCA + PH + 0.80;
const XL = 15.2 + LEFTW, YL = 17.0;
const RET_A = YCA - 0.36, RET_B = YMB + PH + 0.78;
const LX = 0.75, LW = 5.45;
const LTOP = 15.52;
const RASH = 1.15, TRH = 1.26, TGAP = 0.56;
/* the PNG's title/subtitle live in HTML here, so the viewBox TRIMS that band rather than the
 * constants diverging — fig_2ps_layout_check.py compares YL, not the trimmed height */
const TRIM = 0.80;

const spine = (y0: number) => y0 + 4 * CH;
const MID = 0.5 * (spine(YMB) + spine(YCA));
const Y = (v: number) => YL - v;                    // figure coords are y-UP; SVG is y-down
/* points -> figure units: the PNG is 12.6in wide for 15.2 units, so 1 unit = 59.7pt */
const PT = 1 / 59.7;
const fs = (pt: number) => pt * PT;

const DEGS = [0, 45, 90, 135, 180, 225, 270, 315];
const nz = (v: number) => (v > 0 ? v : 1e-9);

export default function TwoPSResponse({ src = '/data/toy_2ps.json' }: { src?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cond, setCond] = useState<'cued' | 'uncued'>('cued');
  const [fi, setFi] = useState(99);                 // step 496: end of the settle, where the still parks
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: Data) => {
        if (!alive) return;
        if (!d.meta?.checks?.converged) return setErr('the export did not converge');
        for (const k of ['primary', 'colour', 'translation'] as const) {
          if (Math.abs(d.meta.read[k] - EXPECT[k]) > 5e-5) {
            return setErr(`read-out ${k} disagrees with toy_2ps_run — expected ${EXPECT[k]}, ` +
                          `payload has ${d.meta.read[k]}. The export is stale or wrong.`);
          }
        }
        setData(d);
      })
      .catch(e => alive && setErr(String(e)));
    return () => { alive = false; };
  }, [src]);

  const nF = data?.meta.nFrames ?? 166;
  const step = useCallback((t: number) => {
    // 5 ms of model time per frame; 60 ms of real time is ~12x slowed, the same order as
    // HCMinResponse's march so the two figures feel like one page
    if (t - last.current > 60) { last.current = t; setFi(f => (f + 1) % nF); }
    raf.current = requestAnimationFrame(step);
  }, [nF]);
  useEffect(() => {
    if (!playing) { if (raf.current) cancelAnimationFrame(raf.current); return; }
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, step]);

  /* ⚠️ hooks must stay ABOVE the early returns — HCPSViewer carries a comment about this trap */
  const ORD = useMemo(
    () => (data ? DEGS.map(d => data.meta.physDeg.indexOf(d)) : []), [data]);

  if (err) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-secondary)' }}>
      <strong>The model output would not validate, so nothing is drawn.</strong>
      <div className="mt-1 opacity-80">{err}</div>
      <div className="mt-2 text-xs opacity-70">
        Re-export it: <code>matlab -batch &quot;toy_2ps_run; toy_2ps_export&quot;</code>, then copy
        the JSON into <code>public/data/</code>.
      </div>
    </div>
  );
  if (!data) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
      Loading model output…
    </div>
  );

  const M = data.meta, SC = data.scales, T = M.nSteps;
  const side = data[cond];
  const STEP = M.frames[fi];
  const tx = (t: number) => LX + ((t - 1) / (T - 1)) * LW;
  const mo = (v: number[]) => ORD.map(i => v[i]);

  /* ── primitives ─────────────────────────────────────────────────────────────────────── */
  const Arrow = ({ x1, y1, x2, y2, c = INK, w = 1.6, dash }: any) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, h = 0.15, sp = 0.42;
    return (
      <g>
        <line x1={x1} y1={Y(y1)} x2={x2 - ux * h} y2={Y(y2 - uy * h)} stroke={c}
              strokeWidth={w * PT} strokeDasharray={dash} strokeLinecap="round" />
        <polygon fill={c}
                 points={`${x2},${Y(y2)} ${x2 - ux * h + uy * h * sp},${Y(y2 - uy * h - ux * h * sp)} `
                       + `${x2 - ux * h - uy * h * sp},${Y(y2 - uy * h + ux * h * sp)}`} />
      </g>
    );
  };
  const Seg = ({ x1, y1, x2, y2, c = INK, w = 1.6, dash }: any) => (
    <line x1={x1} y1={Y(y1)} x2={x2} y2={Y(y2)} stroke={c} strokeWidth={w * PT}
          strokeDasharray={dash} strokeLinecap="round" />
  );
  const Txt = ({ x, y, children, size = 9, c = INK, a = 'start', b = false, i = false }: any) => (
    <text x={x} y={Y(y)} fontSize={fs(size)} fill={c} textAnchor={a}
          fontWeight={b ? 700 : 400} fontStyle={i ? 'italic' : 'normal'}
          dominantBaseline="middle" fontFamily="Georgia, 'Times New Roman', serif">{children}</text>
  );
  const Panel = ({ x, y0, vals, top, colour, title, formula, ticks, tickink }: any) => (
    <g>
      <rect x={x} y={Y(y0 + PH)} width={COLW} height={PH} rx={0.05}
            fill="var(--background)" stroke={INK} strokeWidth={1.4 * PT} />
      {vals.map((v: number, k: number) => {
        const cy = y0 + PH - CH * (k + 1);
        return (
          <g key={k}>
            {k > 0 && <line x1={x} y1={Y(y0 + PH - CH * k)} x2={x + COLW} y2={Y(y0 + PH - CH * k)}
                            stroke={LINE} strokeWidth={0.5 * PT} />}
            <rect x={x + 0.05} y={Y(cy + CH - 0.055)} width={0.88 * COLW * Math.max(v, 0) / top}
                  height={CH - 0.11} fill={colour} opacity={0.92} />
            {ticks?.[k]
              ? <Txt x={x - 0.12} y={cy + CH / 2} size={6.4} a="end"
                     c={tickink ? tickink[k] : MUTE} b={!!tickink}>{ticks[k]}</Txt>
              : tickink && <rect x={x - 0.27} y={Y(cy + CH / 2 + 0.075)} width={0.15} height={0.15}
                                 fill={tickink[k]} stroke={INK} strokeWidth={0.45 * PT} />}
          </g>
        );
      })}
      <Txt x={x} y={y0 + PH + 0.42} size={9} b>{title}</Txt>
      <Txt x={x} y={y0 + PH + 0.20} size={8.8} c="var(--text-secondary)">{formula}</Txt>
    </g>
  );
  const Op = ({ x, y, sym }: any) => (
    <g>
      <circle cx={x} cy={Y(y)} r={0.21} fill="var(--background)" stroke={INK} strokeWidth={1.5 * PT} />
      <Txt x={x} y={y} size={12.5} a="middle">{sym}</Txt>
    </g>
  );

  /* ── LEFT COLUMN ────────────────────────────────────────────────────────────────────── */
  const Frame = ({ y0, h, title, sub }: any) => (
    <g>
      <rect x={LX} y={Y(y0 + h)} width={LW} height={h} rx={0.04}
            fill="var(--background)" stroke={INK} strokeWidth={1.2 * PT} />
      <Txt x={LX} y={y0 + h + 0.20} size={8.4} b>{title}</Txt>
      {sub && <Txt x={LX + LW} y={y0 + h + 0.20} size={7.4} c={MUTE} a="end" i>{sub}</Txt>}
    </g>
  );
  const Windows = ({ y0, h }: any) => (
    <g opacity={0.55}>
      {([M.wPre, M.wProbe] as [number, number][]).map(([w0, w1], i) => (
        <rect key={i} x={tx(w0)} y={Y(y0 + h)} width={tx(w1) - tx(w0)} height={h}
              fill="var(--accent-dim)" opacity={i ? 0.9 : 0.5} />
      ))}
    </g>
  );

  /* the stimulus is piecewise constant — three runs, not 166 columns of rects */
  const rasterRuns = (key: 'A' | 'B') => {
    const U = data.stim.um[key];
    const runs: { i0: number; i1: number; v: number[] }[] = [];
    for (let i = 0; i < U.length; i++) {
      const prev = runs[runs.length - 1];
      if (prev && U[i].every((x, k) => x === prev.v[k])) prev.i1 = i;
      else runs.push({ i0: i, i1: i, v: U[i] });
    }
    return runs;
  };
  const Raster = ({ y0, psKey: k, name, ink, huelab }: any) => (
    <g>
      <Frame y0={y0} h={RASH} title={`STIMULUS · V1 RF ${name}`} sub={huelab} />
      {rasterRuns(k).map((r, ri) => {
        const x0 = tx(M.frames[r.i0]);
        const x1 = r.i1 + 1 < M.frames.length ? tx(M.frames[r.i1 + 1]) : LX + LW;
        return mo(r.v).map((v, row) => (
          <rect key={`${ri}-${row}`} x={x0} y={Y(y0 + RASH - (row * RASH) / 8)}
                width={x1 - x0} height={RASH / 8}
                fill={STIM} opacity={Math.min(1, Math.max(0, v / SC.um))} />
        ));
      })}
      {DEGS.map((d, k2) => d % 90 === 0 && (
        <Txt key={d} x={LX - 0.10} y={y0 + RASH - (k2 + 0.5) * RASH / 8} size={5.8} a="end" c={MUTE}>
          {d}°
        </Txt>
      ))}
      <rect x={LX} y={Y(y0 + RASH)} width={LW} height={RASH} fill="none" stroke={INK}
            strokeWidth={1.2 * PT} />
    </g>
  );
  const poly = (vals: number[], y0: number, h: number, top: number) =>
    vals.map((v, i) => `${tx(i + 1)},${Y(y0 + (v / top) * h)}`).join(' ');
  const TraceRow = ({ y0, k, title, ink, note }: any) => {
    const t = data.traces[k] as Trace;
    const top = nz(Math.max(...t.cued, ...t.uncued) * 1.12);
    return (
      <g>
        <Frame y0={y0} h={TRH} title={title} sub={note} />
        <Windows y0={y0} h={TRH} />
        <polyline points={poly(t.uncued, y0, TRH, top)} fill="none" stroke={ink}
                  strokeWidth={1.4 * PT} strokeDasharray="0.07 0.04" />
        <polyline points={poly(t.cued, y0, TRH, top)} fill="none" stroke={ink}
                  strokeWidth={1.7 * PT} />
        <rect x={LX} y={Y(y0 + TRH)} width={LW} height={TRH} fill="none" stroke={INK}
              strokeWidth={1.2 * PT} />
      </g>
    );
  };

  const TRACES: [string, string, string, string | null][] = [
    ['motionUp', 'MOTION 90° UP · point-set A', RED_INK, null],
    ['motionDown', 'MOTION 270° DOWN · point-set B', GREEN_INK, 'PRIMARY read-out'],
    ['motionRight', 'MOTION 0° RIGHT · both point-sets', STIM, 'TRANSLATION read-out'],
    ['colourRed', 'COLOUR RED · point-set A', RED_INK, null],
    ['colourGreen', 'COLOUR GREEN · point-set B', GREEN_INK, 'COLOUR read-out'],
  ];
  const yRasA = LTOP - RASH;
  const yRasB = yRasA - RASH - TGAP;
  const yTr0 = yRasB - RASH - TGAP;
  const yPool = yTr0 - 5 * (TRH + TGAP);
  const LBOT = yPool;
  const Cscale = nz(SC.S * M.params.CoopL * 1.12);

  /* ── BODY ───────────────────────────────────────────────────────────────────────────── */
  /* C with a real subscript — the box carries the two cooperation pools now */
  const Csub = ({ x, y, nm, v }: any) => (
    <text x={x} y={Y(y)} fontSize={fs(9.2)} fill={COOP} textAnchor="middle"
          dominantBaseline="middle" fontFamily="Georgia, 'Times New Roman', serif">
      C<tspan dy={fs(2.6)} fontSize={fs(6.6)}>{nm}</tspan>
      <tspan dy={-fs(2.6)}>{` = ${v.toFixed(3)}`}</tspan>
    </text>
  );

  const DEG_T = DEGS.map(d => `${d}°`);
  const HUE_T = M.hueDeg.map(d => (d === 0 ? 'RED' : d === 180 ? 'GREEN' : null));

  const HcRow = ({ y0, u, utop, R, Rtop, tu, tR, ticks, motion, Pin, tickink }: any) => {
    const sp = spine(y0);
    return (
      <g>
        <Panel x={C1} y0={y0} vals={u} top={utop} colour={STIM} title={tu} formula="u" ticks={ticks} tickink={tickink} />
        <Arrow x1={C1 + COLW + 0.05} y1={sp} x2={XOP1 - 0.25} y2={sp} />
        <Op x={XOP1} y={sp} sym="×" />
        <Seg x1={XOP1 + 0.25} y1={sp} x2={XDIV - 0.25} y2={sp} />
        <Op x={XDIV} y={sp} sym="÷" />
        <Arrow x1={XDIV + 0.25} y1={sp} x2={C2 - 0.05} y2={sp} />
        <Panel x={C2} y0={y0} vals={R} top={Rtop} colour={STIM} title={tR} formula="R" />
        {motion && <>
          <Arrow x1={C2 + COLW + 0.05} y1={sp} x2={XOP2 - 0.25} y2={sp} />
          <Op x={XOP2} y={sp} sym="×" />
          <Arrow x1={XOP2 + 0.25} y1={sp} x2={C3 - 0.05} y2={sp} />
          <Panel x={C3} y0={y0} vals={Pin} top={SC.Pin} colour={ATT} title="POOL AFFERENT" formula="(1+a) R" />
        </>}
      </g>
    );
  };

  const PointSet = ({ YM, YC, k, name, dirlabel, huelabel, ret, above }: any) => {
    const ink = name === 'A' ? RED_INK : GREEN_INK;
    const spm = spine(YM), spc = spine(YC), sy = 0.5 * (spm + spc);
    const dirdeg = M.dotDeg[k as 'A' | 'B'][fi];
    const vx = 0.34 * Math.cos((dirdeg * Math.PI) / 180);
    const vy = 0.34 * Math.sin((dirdeg * Math.PI) / 180);
    const cx0 = RFX + RFW / 2;
    const xEnd = C3 + COLW + 0.05, xEndC = C2 + COLW + 0.05;
    const d = above ? 1 : -1;
    return (
      <g>
        <HcRow y0={YM} u={mo(data.stim.um[k as 'A' | 'B'][fi])} utop={SC.um}
               R={mo(side.Rm[k as 'A' | 'B'][fi])} Rtop={SC.Rm} tu="MOTION DRIVE" tR="MOTION HC"
               ticks={DEG_T} motion Pin={mo(side.Pin[k as 'A' | 'B'][fi])} />
        <HcRow y0={YC} u={data.stim.uc[k as 'A' | 'B']} utop={SC.uc}
               R={side.Rc[k as 'A' | 'B'][fi]} Rtop={SC.Rc} tu="COLOUR DRIVE" tR="COLOUR HC"
               ticks={HUE_T} motion={false} tickink={HUE_RING} />
        {/* the V1 receptive field, with its dot pointing where the model's stimulus says */}
        <rect x={RFX} y={Y(sy + RFW / 2)} width={RFW} height={RFW} rx={0.05}
              fill="var(--background)" stroke={INK} strokeWidth={1.4 * PT} />
        <circle cx={cx0} cy={Y(sy)} r={0.52} fill="none" stroke={LINE} strokeWidth={1.1 * PT}
                strokeDasharray="0.05 0.037" />
        <circle cx={cx0 - vx / 2} cy={Y(sy - vy / 2)} r={0.085} fill={ink} />
        <Arrow x1={cx0 - vx / 2} y1={sy - vy / 2} x2={cx0 + vx / 2} y2={sy + vy / 2} c={ink} w={1.6} />
        <Txt x={RFX} y={sy + RFW / 2 + 0.40} size={9} b>{`V1 RF · ${name}`}</Txt>
        <Txt x={RFX} y={sy + RFW / 2 + 0.19} size={7.8} c={ink} i>{huelabel}</Txt>
        <Txt x={RFX + RFW} y={sy - RFW / 2 - 0.22} size={7} c={ink} a="end">
          {`${dirdeg}° at ${STEP} ms`}
        </Txt>
        <Seg x1={RFX + RFW + 0.05} y1={sy} x2={FKX} y2={sy} />
        <Seg x1={FKX} y1={spm} x2={FKX} y2={spc} />
        <Arrow x1={FKX} y1={spm} x2={C1 - 0.05} y2={spm} />
        <Arrow x1={FKX} y1={spc} x2={C1 - 0.05} y2={spc} />
        {/* both hypercolumns into this point-set's own pool */}
        {[[xEnd, spm], [xEndC, spc]].map(([x0, y0], i) => (
          <g key={i}>
            <Seg x1={x0} y1={y0} x2={SX - SR - 0.55} y2={y0} c="var(--text-muted)" w={1.5} />
            <Arrow x1={SX - SR - 0.55} y1={y0} x2={SX - SR - 0.04} y2={sy} c="var(--text-muted)" w={1.5} />
          </g>
        ))}
        <circle cx={SX} cy={Y(sy)} r={SR} fill={FILL} stroke={INK} strokeWidth={1.7 * PT} />
        <Txt x={SX} y={sy} size={15} a="middle">Σ</Txt>
        <Txt x={SX + SR + 0.12} y={sy + 0.10} size={10} b>{`S${name}`}</Txt>
        <Txt x={SX + SR + 0.12} y={sy - 0.16} size={8.2} c={MUTE}>
          {side.S[k as 'A' | 'B'][fi].toFixed(3)}
        </Txt>
        <g transform={`rotate(-90 ${0.26 + LEFTW} ${Y(sy)})`}>
          <Txt x={0.26 + LEFTW} y={sy} size={12} b a="middle">{`POINT-SET ${name}`}</Txt>
        </g>
        <g transform={`rotate(-90 ${0.58 + LEFTW} ${Y(sy)})`}>
          <Txt x={0.58 + LEFTW} y={sy} size={8} c={ink} i a="middle">{`${dirlabel} · ${huelabel}`}</Txt>
        </g>
        {/* the cooperative return lane — THE LOOP */}
        <Seg x1={SX} y1={sy + (above ? SR : -SR)} x2={SX} y2={ret} c={COOP} w={1.8} dash="0.084 0.037" />
        <Seg x1={SX} y1={ret} x2={XOP1} y2={ret} c={COOP} w={1.8} dash="0.084 0.037" />
        <Seg x1={XOP1} y1={ret} x2={XOP1} y2={above ? spc : spm} c={COOP} w={1.8} dash="0.084 0.037" />
        {[spm, spc].map((sp, i) => (
          <Arrow key={i} x1={XOP1} y1={sp + 0.62 * d} x2={XOP1} y2={sp + 0.23 * d} c={COOP} w={1.8} />
        ))}
        <Txt x={SX - 0.20} y={ret + 0.20} size={10} c={COOP} a="end">
          {`C${name} = ${side.C[k as 'A' | 'B'][fi].toFixed(3)}`}
        </Txt>
      </g>
    );
  };

  return (
    <figure className="not-prose my-6">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        <button onClick={() => setPlaying(p => !p)}
                className="px-3 py-1 rounded border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {playing ? '❚❚ pause' : '▶ play'}
        </button>
        <input type="range" min={0} max={nF - 1} value={fi} className="flex-1 min-w-[10rem]"
               onChange={e => { setPlaying(false); setFi(Number(e.target.value)); }} />
        <span style={{ color: 'var(--text-muted)' }} className="tabular-nums w-20">{STEP} ms</span>
        <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {(['cued', 'uncued'] as const).map(c => (
            <button key={c} onClick={() => setCond(c)}
                    className="px-3 py-1"
                    style={{ background: cond === c ? 'var(--accent-dim)' : 'var(--surface)',
                             fontWeight: cond === c ? 700 : 400 }}>
              {c === 'cued' ? 'cued (attend 270°)' : 'uncued (attend 90°)'}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 ${TRIM} ${XL} ${YL - TRIM}`} className="w-full h-auto"
           style={{ background: 'var(--background)' }}>
        {/* ── the left column: the whole time story, one x-axis, one cursor ── */}
        <Raster y0={yRasA} psKey="A" name="A" ink={RED_INK} huelab="red · moves up" />
        <Raster y0={yRasB} psKey="B" name="B" ink={GREEN_INK} huelab="green · moves down" />
        {TRACES.map(([k, title, ink, note], i) => (
          <TraceRow key={k} y0={yTr0 - i * (TRH + TGAP)} k={k} title={title} ink={ink} note={note} />
        ))}
        <g>
          <Frame y0={yPool} h={TRH} title="COOPERATION POOLS  C_A, C_B" sub="solid = cued, dashed = uncued" />
          <Windows y0={yPool} h={TRH} />
          {(['A', 'B'] as const).map(nm => (
            <g key={nm}>
              <polyline points={poly(data.traces.C.uncued[nm], yPool, TRH, Cscale)} fill="none"
                        stroke={nm === 'A' ? RED_INK : GREEN_INK} strokeWidth={1.4 * PT}
                        strokeDasharray="0.07 0.04" />
              <polyline points={poly(data.traces.C.cued[nm], yPool, TRH, Cscale)} fill="none"
                        stroke={nm === 'A' ? RED_INK : GREEN_INK} strokeWidth={1.7 * PT} />
            </g>
          ))}
          <rect x={LX} y={Y(yPool + TRH)} width={LW} height={TRH} fill="none" stroke={INK}
                strokeWidth={1.2 * PT} />
        </g>
        <Seg x1={tx(STEP)} y1={LBOT - 0.10} x2={tx(STEP)} y2={LTOP + 0.10} c={CURSOR} w={1.3} />
        <Txt x={tx(STEP)} y={LTOP + 0.44} size={8} c={CURSOR} a="middle" b>{`${STEP} ms`}</Txt>
        <Txt x={LX} y={LBOT - 0.30} size={7.2} c={MUTE}>0 ms</Txt>
        <Txt x={LX + LW} y={LBOT - 0.30} size={7.2} c={MUTE} a="end">{`${T} ms`}</Txt>
        <Txt x={LX + LW / 2} y={LBOT - 0.30} size={7} c={MUTE} a="middle" i>
          time — shaded: the two read windows
        </Txt>

        {/* ── the body, at the cursor ── */}
        <PointSet YM={YMA} YC={YCA} k="A" name="A" dirlabel="moves UP" huelabel="RED"
                  ret={RET_A} above={false} />
        <PointSet YM={YMB} YC={YCB} k="B" name="B" dirlabel="moves DOWN" huelabel="GREEN"
                  ret={RET_B} above />

        {/* the shared normalization pool — one denominator on a bus through all four ÷ nodes */}
        <Seg x1={XDIV} y1={spine(YCB)} x2={XDIV} y2={spine(YMA)} c={NORM} w={1.6} />
        <rect x={XDIV - NORMW / 2} y={Y(MID + NORMH / 2)} width={NORMW} height={NORMH} rx={0.06}
              fill={FILL} stroke={INK} strokeWidth={1.6 * PT} />
        <Txt x={XDIV} y={MID + 0.80} size={8.8} a="middle" b>SHARED</Txt>
        <Txt x={XDIV} y={MID + 0.59} size={8.8} a="middle" b>NORMALIZATION</Txt>
        <Txt x={XDIV} y={MID + 0.30} size={10.5} a="middle">σⁿ + w Σ Dⁿ</Txt>
        {/* ⭐ the denominator's only TIME-VARYING inputs are these two, so the box shows them */}
        <Csub x={XDIV - 0.62} y={MID - 0.02} nm="A" v={side.C.A[fi]} />
        <Csub x={XDIV + 0.62} y={MID - 0.02} nm="B" v={side.C.B[fi]} />
        <Txt x={XDIV} y={MID - 0.36} size={11.5} a="middle" b>{`= ${side.den[fi].toFixed(2)}`}</Txt>
        <Txt x={XDIV} y={MID - 0.68} size={7.2} a="middle" c={MUTE} i>one number, all four</Txt>
        <Txt x={XDIV} y={MID - 0.88} size={7.2} a="middle" c={MUTE} i>hypercolumns</Txt>
        {[spine(YMA), spine(YCA), spine(YMB), spine(YCB)].map((sp, i) => (
          <Arrow key={i} x1={XDIV} y1={MID + (sp > MID ? NORMH / 2 : -NORMH / 2)}
                 x2={XDIV} y2={sp + (sp > MID ? -0.24 : 0.24)} c={NORM} w={1.5} />
        ))}
        {([['A', RET_A, XDIV - 0.55, true, 'end'], ['B', RET_B, XDIV + 0.55, false, 'start']] as const)
          .map(([nm, ret, bx, dn, ha]) => {
            const y1 = dn ? MID + NORMH / 2 + 0.04 : MID - NORMH / 2 - 0.04;
            return (
              <g key={nm}>
                <Arrow x1={bx} y1={ret} x2={bx} y2={y1} c={COOP} w={1.6} />
                <Txt x={bx + (ha === 'end' ? -0.10 : 0.10)} y={0.5 * (ret + y1)} size={8}
                     c={COOP} a={ha}>{`(1+C${nm})ⁿ U${nm}`}</Txt>
              </g>
            );
          })}

        {/* the shared attentional bias — ONE field, into BOTH point-sets, MOTION rows only */}
        <Panel x={CBIAS} y0={MID - PH / 2} vals={mo(side.a).map(v => 1 + v)} top={SC.bias}
               colour={ATT} title="ATTENTIONAL BIAS" formula="1 + a" />
        <Txt x={CBIAS + COLW + 0.30} y={MID + 0.74} size={7.8} c={ATT} i>ONE field — the same a</Txt>
        <Txt x={CBIAS + COLW + 0.30} y={MID + 0.52} size={7.8} c={ATT} i>into BOTH point-sets</Txt>
        {[spine(YMA), spine(YMB)].map((sp, i) => (
          <Arrow key={i} x1={XOP2} y1={MID + (sp > MID ? PH / 2 : -PH / 2)}
                 x2={XOP2} y2={sp + (sp > MID ? -0.24 : 0.24)} c={ATT} w={1.7} />
        ))}
        {['colour gets NO bias —', 'it is reached ONLY through', "its point-set's shared pool S"]
          .map((t, i) => (
            <Txt key={i} x={CBIAS + COLW + 0.30} y={MID + 0.12 - i * 0.24} size={7.8} c={MUTE} i>{t}</Txt>
          ))}
      </svg>

      <figcaption className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <strong>Model IV, two point-sets, running.</strong> Each point-set reads its own V1
        receptive field and binds a motion and a colour hypercolumn with one cooperative pool; the
        two share one normalization pool and one attentional bias field. The bias reaches colour
        only through the pool — which is the claim Model IV exists to make, and why the colour
        read-out ({M.read.colour.toFixed(4)}) equals the primary ({M.read.primary.toFixed(4)}).
        Panels are scaled to the run&apos;s peak over both cue conditions, so bars are comparable
        across frames and rows, but not between panels.
        {' '}Cue on 270° · biasAmp {M.params.biasAmp} · CoopL {M.params.CoopL} · n {M.params.nV1} ·
        translation {M.read.translation.toFixed(4)}.
        <br />
        <span className="opacity-70">
          {M.source} · settle {M.durs[0]} ms, translation {M.durs[1]} ms · exported {M.generated}
        </span>
      </figcaption>
    </figure>
  );
}
