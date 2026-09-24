'use client';

/**
 * TwoPSRealResponse — Model IV with two point-sets, driven by the REAL VRDots stimulus.
 *
 * ⭐ THIS IS fig_2ps_real.py's LAYOUT, MADE LIVE — the advanced counterpart to TwoPSResponse,
 * which drives the same model with toy_stimulus's idealised input. Both are kept, and the BODY
 * geometry is identical across all three (schematic, idealised, real) so that only the things
 * that actually differ differ.
 *
 *   LEFT   THE DISPLAY — the real annulus with all 126 dots where they actually are at the
 *          cursor's frame, the fixation hole, and the two receptive fields marked where they
 *          really sit — then the five response traces and the cooperation pools
 *   RIGHT  the schematic body at the cursor, with the RF boxes holding the ACTUAL dots and
 *          their real instantaneous directions — the very dots the drive was extracted from
 *
 * ⭐ ONE BIAS FIELD AT ONE FIXED DIRECTION — nothing about it is derived from where the
 * receptive fields are. GS: "there should not be any positional dependencies for the attentional
 * biases." An earlier version derived the direction from the point-set midpoint; sweeping the cue
 * over all 8 channels shows a fixed 90° gives +0.389 against the midpoint cue's +0.397, so the
 * positional derivation bought nothing.
 *
 * ⚠️ THE MAGNITUDE IS NOT A MEASUREMENT: biasAmp 9.7 is inherited and the index is monotone in
 * it; the contrast is CUED vs OPPOSITELY-CUED (0.40× against a neutral baseline); and
 * den_uncued/den_cued averages ~1.3, so part of it is the other point-set leaking through the
 * shared denominator. The SIGN, the ordering, and colour ≈ primary are what the model claims.
 *
 * (historical:) ONE BIAS FIELD, as the schematic draws it. Under rigid rotation the attended surface's
 * local direction does differ between the two point-sets (24 ± 12° across layouts), so an
 * earlier version used two. Measured, that was not worth it: one global field costs 0.018 of
 * 0.345, while deliberately MIS-ASSIGNING two matched fields costs only 0.036 — position-
 * matching was never doing the work, and a matched map has to know which surface is where,
 * which is the segmentation this model exists to explain.
 *
 * ⚠️⚠️ ONE LAYOUT IS NOT A RESULT, and an animation of one is the easiest place to forget it.
 * Over 40 layouts satisfying purity the primary index is +0.345 ± 0.225 (median +0.360, range
 * −0.152…+0.681, NEGATIVE in 4 of 40). The payload's seed is the one nearest the median, chosen
 * to be representative and NOT best — an earlier version defaulted to seed 1, which measurement
 * later showed to be rank 1 of 40. The population is printed under the figure and must stay
 * there.
 *
 * ⚠️ "PURE" IS A 1σ CONTAINMENT TEST, but the Gaussian drive has NO cutoff, so 12–38% of a
 * "pure" point-set's drive comes from the other surface's dots. That is why the RF boxes visibly
 * hold dots of both colours. It is the model's real input, not a drawing error.
 *
 * ⚠️ EVERY NUMBER COMES FROM THE MODEL, via public/data/toy_2ps_real.json, exported by
 * toy_2ps_real_export.m. The read-outs are ASSERTED on load; the component renders an explicit
 * error rather than a plausible-looking figure. That JSON is a COPY and can go stale, so
 * meta.generated and every run parameter are printed.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type PS<T> = { A: T; B: T };
type Side = {
  a: PS<number[]>; Rm: PS<number[][]>; Rc: PS<number[][]>; Pin: PS<number[][]>;
  S: PS<number[]>; C: PS<number[]>; den: number[];
};
type Trace = { cued: number[]; uncued: number[]; deg: number; pointset: string };
type RF = { c: [number, number]; sigma: number; cuedDeg: number; uncuedDeg: number;
            hue: string; surface: string };
type Meta = {
  source: string; model: string; variant: string; generated: string; seed: number;
  msPerFrame: number; nFrames: number; nSteps: number; frames: number[];
  probe: [number, number]; wPreMs: [number, number]; wProbeMs: [number, number];
  pureWin: [number, number];
  params: { CoopL: number; biasAmp: number; nV1: number; tau: number; tauS: number };
  prefsDeg: number[]; hueDeg: number[];
  read: { primary: number; colour: number; translation: number };
  checks: { converged: boolean };
  stim: { exDeg: number; apDeg: number; fps: number; omegaDeg: number; nDotsPerField: number;
          preMs: number; winMs: number; transSpeedDeg: number };
  rf: { A: RF; B: RF; rIn: number };
  biasMode: string; biasDeg: number[];
};
type Data = {
  meta: Meta;
  dots: { x: number[][]; y: number[][]; dir: number[][]; vis: number[][]; field: number[] };
  stim: { um: PS<number[][]>; uc: PS<number[][]> };
  traces: Record<string, Trace> & { C: Record<'cued' | 'uncued', PS<number[]>> };
  scales: { um: number; uc: number; Rm: number; Rc: number; Pin: number; bias: number;
            S: number; den: number };
  cued: Side; uncued: Side;
};

/* What toy_2ps_real prints for the default (representative) layout. If the payload disagrees,
 * the PAYLOAD is wrong — never adjust these to match it. */
const EXPECT = { primary: 0.8278144, colour: 0.8442837, translation: 0.0287517 };

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

/* ── canvas, in fig_2ps_real.py's own constants ──────────────────────────────────────────── */
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
const NORMW = 3.00, NORMH = 2.90;   // carries the collapsed identity AND the resultant
                                    // multiplier; trimmed so it clears B's panel titles
const CBIAS = XOP2 - COLW / 2;
const YCB = 1.40, YMB = YCB + PH + 0.80;
const YCA = YMB + PH + 4.20, YMA = YCA + PH + 0.80;
const XL = 15.2 + LEFTW, YL = 17.0;
const RET_A = YCA - 0.36, RET_B = YMB + PH + 0.78;
const LX = 0.75, LW = 5.45;
const LTOP = 15.52;
const STIMH = 3.60;
const TRH = 1.14, TGAP = 0.45;
const LEGGAP = 1.30;
const TRIM = 0.80;
const VIEW_SIG = 2.6;               // how much of each RF's neighbourhood the box shows

const spine = (y0: number) => y0 + 4 * CH;
const MID = 0.5 * (spine(YMB) + spine(YCA));
const Y = (v: number) => YL - v;
const PT = 1 / 59.7;
const fs = (pt: number) => pt * PT;
const nz = (v: number) => (v > 0 ? v : 1e-9);

export default function TwoPSRealResponse({ src = '/data/toy_2ps_real.json' }: { src?: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cond, setCond] = useState<'cued' | 'uncued'>('cued');
  const [fi, setFi] = useState(69);              // frame 70: the end of the pre-read window
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
            return setErr(`read-out ${k} disagrees with toy_2ps_real — expected ${EXPECT[k]}, ` +
                          `payload has ${d.meta.read[k]}. The export is stale, or its seed changed.`);
          }
        }
        setData(d);
      })
      .catch(e => alive && setErr(String(e)));
    return () => { alive = false; };
  }, [src]);

  const nF = data?.meta.nFrames ?? 89;
  const step = useCallback((t: number) => {
    // 10 ms of model time per frame; 90 ms of real time is a ~9x slowed march, matching the
    // cadence of the other two figures on this page
    if (t - last.current > 90) { last.current = t; setFi(f => (f + 1) % nF); }
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
      <strong>The model output would not validate, so nothing is drawn.</strong>
      <div className="mt-1 opacity-80">{err}</div>
      <div className="mt-2 text-xs opacity-70">
        Re-export it: <code>matlab -batch &quot;toy_2ps_real_export&quot;</code>, then copy the JSON
        into <code>public/data/</code>.
      </div>
    </div>
  );
  if (!data) return (
    <div className="rounded-lg border p-6 text-sm"
         style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
      Loading model output…
    </div>
  );

  const CUE_LABELS: [string, string] =
    [`${data.meta.biasDeg[0].toFixed(0)}°`, `${data.meta.biasDeg[1].toFixed(0)}°`];
  const M = data.meta, SC = data.scales, T = M.nSteps, DOT = data.dots;
  const side = data[cond];
  const STEP = M.frames[fi];
  const tx = (t: number) => LX + ((t - 1) / (T - 1)) * LW;
  const DEGS = M.prefsDeg;                       // already 0,45,…315 — no rotated frame to undo
  const RFA = M.rf.A, RFB = M.rf.B;
  const AP = M.stim.apDeg, EX = M.stim.exDeg;

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

  const Gsub = ({ x, y, nm, v }: any) => (
    <text x={x} y={Y(y)} fontSize={fs(8.4)} fill={COOP} textAnchor="middle"
          dominantBaseline="middle" fontFamily="Georgia, 'Times New Roman', serif">
      G<tspan dy={fs(2.4)} fontSize={fs(6.2)}>{nm}</tspan>
      <tspan dy={-fs(2.4)}>{` = ${v.toFixed(4)}`}</tspan>
    </text>
  );
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

  /* ── THE DISPLAY: the real dots, where they really are at this frame ── */
  const SPX = LX + (LW - STIMH) / 2, SPY = LTOP - STIMH;
  const scx = SPX + STIMH / 2, scy = SPY + STIMH / 2, sdeg = (STIMH * 0.46) / AP;
  const Display = () => (
    <g>
      <rect x={SPX} y={Y(SPY + STIMH)} width={STIMH} height={STIMH} rx={0.05}
            fill="var(--background)" stroke={INK} strokeWidth={1.4 * PT} />
      <circle cx={scx} cy={Y(scy)} r={AP * sdeg} fill="var(--surface)" stroke={LINE} strokeWidth={PT} />
      <circle cx={scx} cy={Y(scy)} r={EX * sdeg} fill="var(--background)" stroke={LINE} strokeWidth={PT} />
      {DOT.field.map((f, j) =>
        DOT.vis[fi][j] > 0 ? (
          <circle key={j} cx={scx + DOT.x[fi][j] * sdeg} cy={Y(scy + DOT.y[fi][j] * sdeg)}
                  r={0.028} fill={f === 1 ? RED_INK : GREEN_INK} />
        ) : null)}
      {([[RFA, RED_INK, 'A'], [RFB, GREEN_INK, 'B']] as const).map(([R, ink, lab]) => {
        const px = scx + R.c[0] * sdeg, py = scy + R.c[1] * sdeg;
        return (
          <g key={lab}>
            <circle cx={px} cy={Y(py)} r={R.sigma * sdeg} fill="none" stroke={INK} strokeWidth={1.2 * PT} />
            <circle cx={px} cy={Y(py)} r={0.20} fill="none" stroke={ink} strokeWidth={1.1 * PT}
                    strokeDasharray="0.042 0.033" />
            <Txt x={px + 0.26} y={py + 0.20} size={7.6} c={ink} b>{`RF ${lab}`}</Txt>
          </g>
        );
      })}
      <Txt x={SPX} y={SPY + STIMH + 0.42} size={9} b>THE DISPLAY</Txt>
      <Txt x={SPX} y={SPY + STIMH + 0.20} size={7.4} c={MUTE}>
        {`${M.stim.nDotsPerField} dots per field · annulus ${EX.toFixed(2)}–${AP.toFixed(2)}° · counter-rotating ${M.stim.omegaDeg}°/s`}
      </Txt>
      <Txt x={SPX + STIMH} y={SPY - 0.24} size={7.4} c={CURSOR} a="end" b>{`${STEP} ms`}</Txt>
    </g>
  );

  /* ── traces ── */
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
      {([M.wPreMs, M.wProbeMs] as [number, number][]).map(([w0, w1], i) => (
        <rect key={i} x={tx(w0)} y={Y(y0 + h)} width={tx(w1) - tx(w0)} height={h}
              fill="var(--accent-dim)" opacity={i ? 0.9 : 0.5} />
      ))}
    </g>
  );
  const poly = (vals: number[], y0: number, h: number, top: number) =>
    vals.map((v, i) => `${tx(i + 1)},${Y(y0 + (v / top) * h)}`).join(' ');
  const TraceRow = ({ y0, k, title, ink, note }: any) => {
    const t = data.traces[k] as Trace;
    /* ⚠️ EACH PANEL IS SCALED TO ITS OWN PEAK, unlike the body panels -- so heights are NOT
     * comparable between panels, which is why the peak is printed on every one. */
    const pk = Math.max(...t.cued, ...t.uncued);
    const top = nz(pk * 1.12);
    return (
      <g>
        <Frame y0={y0} h={TRH} title={title} sub={note} />
        <Windows y0={y0} h={TRH} />
        <polyline points={poly(t.uncued, y0, TRH, top)} fill="none" stroke={ink}
                  strokeWidth={1.4 * PT} strokeDasharray="0.07 0.04" />
        <polyline points={poly(t.cued, y0, TRH, top)} fill="none" stroke={ink} strokeWidth={1.7 * PT} />
        <line x1={LX} y1={Y(y0)} x2={LX + LW} y2={Y(y0)} stroke={LINE} strokeWidth={0.6 * PT} />
        <Txt x={LX + 0.06} y={y0 + 0.10} size={5.6} c={MUTE}>0</Txt>
        <rect x={LX + LW - 0.72} y={Y(y0 + TRH - 0.03)} width={0.66} height={0.17}
              fill="var(--background)" opacity={0.85} />
        <Txt x={LX + LW - 0.06} y={y0 + TRH - 0.13} size={5.8} c={MUTE} a="end">
          {`peak ${pk.toFixed(3)}`}
        </Txt>
        <rect x={LX} y={Y(y0 + TRH)} width={LW} height={TRH} fill="none" stroke={INK}
              strokeWidth={1.2 * PT} />
      </g>
    );
  };
  /* ⭐ solid vs dashed is the ONE thing a reader must know to read this column at all. */
  const CUE_TXT: [string, string] = CUE_LABELS;
  const TraceLegend = ({ y }: any) => (
    <g>
      <line x1={LX} y1={Y(y)} x2={LX + 0.34} y2={Y(y)} stroke={INK} strokeWidth={1.7 * PT} />
      <Txt x={LX + 0.40} y={y} size={7}>{`cued (attend ${CUE_TXT[0]})`}</Txt>
      <line x1={LX + 2.05} y1={Y(y)} x2={LX + 2.39} y2={Y(y)} stroke={INK} strokeWidth={1.4 * PT}
            strokeDasharray="0.07 0.04" />
      <Txt x={LX + 2.45} y={y} size={7}>{`uncued (attend ${CUE_TXT[1]})`}</Txt>
      <Txt x={LX} y={y - 0.24} size={6.4} c={MUTE} i>
        colour = point-set (red A, green B) · each panel scaled to its OWN peak, so heights are not
        comparable between panels
      </Txt>
      <g transform={`rotate(-90 0.30 ${Y(yTr0 - 0.62 - 3 * (TRH + TGAP))})`}>
        <Txt x={0.30} y={yTr0 - 0.62 - 3 * (TRH + TGAP)} size={7.4} c={MUTE} a="middle">
          RESPONSE R (fraction of Rmax)
        </Txt>
      </g>
    </g>
  );
  /* ⚠️ each title takes its degree FROM ITS OWN TRACE — the two point-sets read DIFFERENT
   * channels here, because each reads its own local direction. */
  const dg = (k: string) => Math.round((data.traces[k] as Trace).deg);
  const TRACES: [string, string, string, string | null][] = [
    ['motionA', `MOTION ${dg('motionA')}° · point-set A (its own)`, RED_INK, null],
    ['motionB', `MOTION ${dg('motionB')}° · point-set B (its own)`, GREEN_INK, 'PRIMARY read-out'],
    ['motionTr', `MOTION ${dg('motionTr')}° · both point-sets`, STIM, 'TRANSLATION read-out'],
    ['colourRed', 'COLOUR RED · point-set A', RED_INK, null],
    ['colourGreen', 'COLOUR GREEN · point-set B', GREEN_INK, 'COLOUR read-out'],
  ];
  const yTr0 = LTOP - STIMH - LEGGAP - TRH;
  const yPool = yTr0 - 5 * (TRH + TGAP);
  const Cscale = nz(SC.S * M.params.CoopL * 1.12);

  /* ── body ── */
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

  const PointSet = ({ YM, YC, k, R, ret, above }: any) => {
    const name = k as 'A' | 'B';
    const ink = name === 'A' ? RED_INK : GREEN_INK;
    const spm = spine(YM), spc = spine(YC), sy = 0.5 * (spm + spc);
    const cx0 = RFX + RFW / 2, s = 0.78 / VIEW_SIG / R.sigma;
    const near: number[] = [];
    let nIn = 0;
    DOT.field.forEach((_f, j) => {
      const d = Math.hypot(DOT.x[fi][j] - R.c[0], DOT.y[fi][j] - R.c[1]);
      if (d <= R.sigma) nIn++;
      if (d <= VIEW_SIG * R.sigma && DOT.vis[fi][j] > 0) near.push(j);
    });
    const d = above ? 1 : -1;
    return (
      <g>
        <HcRow y0={YM} u={data.stim.um[name][fi]} utop={SC.um} R={side.Rm[name][fi]} Rtop={SC.Rm}
               tu="MOTION DRIVE" tR="MOTION HC" ticks={DEG_T} motion Pin={side.Pin[name][fi]} />
        <HcRow y0={YC} u={data.stim.uc[name][fi]} utop={SC.uc} R={side.Rc[name][fi]} Rtop={SC.Rc}
               tu="COLOUR DRIVE" tR="COLOUR HC" ticks={HUE_T} motion={false} tickink={HUE_RING} />
        {/* ⭐ the RECEPTIVE FIELD, holding the ACTUAL dots the drive was extracted from */}
        <rect x={RFX} y={Y(sy + RFW / 2)} width={RFW} height={RFW} rx={0.05}
              fill="var(--background)" stroke={INK} strokeWidth={1.4 * PT} />
        <circle cx={cx0} cy={Y(sy)} r={R.sigma * s} fill="none" stroke={LINE} strokeWidth={1.1 * PT}
                strokeDasharray="0.05 0.037" />
        {near.map(j => {
          const px = cx0 + (DOT.x[fi][j] - R.c[0]) * s;
          const py = sy + (DOT.y[fi][j] - R.c[1]) * s;
          const dink = DOT.field[j] === 1 ? RED_INK : GREEN_INK;
          const vx = 0.30 * Math.cos(DOT.dir[fi][j]), vy = 0.30 * Math.sin(DOT.dir[fi][j]);
          return (
            <g key={j}>
              <circle cx={px} cy={Y(py)} r={0.070} fill={dink} />
              <Arrow x1={px} y1={py} x2={px + vx} y2={py + vy} c={dink} w={1.5} />
            </g>
          );
        })}
        <Txt x={RFX} y={sy + RFW / 2 + 0.40} size={9} b>{`V1 RF · ${name}`}</Txt>
        <Txt x={RFX} y={sy + RFW / 2 + 0.19} size={7.8} c={ink} i>{R.hue}</Txt>
        <Txt x={RFX + RFW} y={sy - RFW / 2 - 0.22} size={7} c={ink} a="end">
          {`${nIn} dot${nIn === 1 ? '' : 's'} within 1σ · σ ${R.sigma.toFixed(3)}°`}
        </Txt>
        <Seg x1={RFX + RFW + 0.05} y1={sy} x2={FKX} y2={sy} />
        <Seg x1={FKX} y1={spm} x2={FKX} y2={spc} />
        <Arrow x1={FKX} y1={spm} x2={C1 - 0.05} y2={spm} />
        <Arrow x1={FKX} y1={spc} x2={C1 - 0.05} y2={spc} />
        {[[C3 + COLW + 0.05, spm], [C2 + COLW + 0.05, spc]].map(([x0, y0], i) => (
          <g key={i}>
            <Seg x1={x0} y1={y0} x2={SX - SR - 0.55} y2={y0} c="var(--text-muted)" w={1.5} />
            <Arrow x1={SX - SR - 0.55} y1={y0} x2={SX - SR - 0.04} y2={sy} c="var(--text-muted)" w={1.5} />
          </g>
        ))}
        <circle cx={SX} cy={Y(sy)} r={SR} fill={FILL} stroke={INK} strokeWidth={1.7 * PT} />
        <Txt x={SX} y={sy} size={15} a="middle">Σ</Txt>
        <Txt x={SX + SR + 0.12} y={sy + 0.10} size={10} b>{`S${name}`}</Txt>
        <Txt x={SX + SR + 0.12} y={sy - 0.16} size={8.2} c={MUTE}>{side.S[name][fi].toFixed(3)}</Txt>
        <g transform={`rotate(-90 ${0.26 + LEFTW} ${Y(sy)})`}>
          <Txt x={0.26 + LEFTW} y={sy} size={12} b a="middle">{`POINT-SET ${name}`}</Txt>
        </g>
        <g transform={`rotate(-90 ${0.58 + LEFTW} ${Y(sy)})`}>
          <Txt x={0.58 + LEFTW} y={sy} size={8} c={ink} i a="middle">
            {`${R.surface.toUpperCase()} · ${R.hue}`}
          </Txt>
        </g>
        <Seg x1={SX} y1={sy + (above ? SR : -SR)} x2={SX} y2={ret} c={COOP} w={1.8} dash="0.084 0.037" />
        <Seg x1={SX} y1={ret} x2={XOP1} y2={ret} c={COOP} w={1.8} dash="0.084 0.037" />
        <Seg x1={XOP1} y1={ret} x2={XOP1} y2={above ? spc : spm} c={COOP} w={1.8} dash="0.084 0.037" />
        {[spm, spc].map((sp, i) => (
          <Arrow key={i} x1={XOP1} y1={sp + 0.62 * d} x2={XOP1} y2={sp + 0.23 * d} c={COOP} w={1.8} />
        ))}
        <Txt x={SX - 0.20} y={ret + 0.20} size={10} c={COOP} a="end">
          {`C${name} = ${side.C[name][fi].toFixed(3)}`}
        </Txt>
      </g>
    );
  };

  /* ⭐ ONE bias field, restored. GS: "shouldnt there just be one for all PSs?" — measured over
   * all 40 layouts (toy_2ps_bias_mode.m): one global field costs 0.018 of 0.345 against a
   * per-point-set map, and deliberately MIS-ASSIGNING two matched maps costs only 0.036, so
   * position-matching was never doing the work. A matched map also has to know which surface is
   * where — the segmentation this model exists to explain. */
  const Bias = () => (
    <g>
      <Panel x={CBIAS} y0={MID - PH / 2} vals={side.a.A.map(v => 1 + v)} top={SC.bias}
             colour={ATT} title="ATTENTIONAL BIAS" formula="1 + a" ticks={DEG_T} />
      {[spine(YMA), spine(YMB)].map((sp, i) => (
        <Arrow key={i} x1={XOP2} y1={MID + (sp > MID ? PH / 2 : -PH / 2)}
               x2={XOP2} y2={sp + (sp > MID ? -0.24 : 0.24)} c={ATT} w={1.7} />
      ))}
      <Txt x={CBIAS + COLW + 0.30} y={MID + 0.74} size={7.8} c={ATT} i>ONE field — the same a</Txt>
      <Txt x={CBIAS + COLW + 0.30} y={MID + 0.52} size={7.8} c={ATT} i>
        {`into BOTH — FIXED at ${M.biasDeg[cond === 'cued' ? 0 : 1].toFixed(0)}°, not positional`}
      </Txt>
      {['colour gets NO bias —', 'it is reached ONLY through', "its point-set's shared pool S"]
        .map((t, i) => (
          <Txt key={i} x={CBIAS + COLW + 0.30} y={MID + 0.12 - i * 0.24} size={7.8} c={MUTE} i>{t}</Txt>
        ))}
    </g>
  );

  return (
    <figure className="not-prose my-6">
      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
        <button onClick={() => setPlaying(p => !p)} className="px-3 py-1 rounded border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          {playing ? '❚❚ pause' : '▶ play'}
        </button>
        <input type="range" min={0} max={nF - 1} value={fi} className="flex-1 min-w-[10rem]"
               onChange={e => { setPlaying(false); setFi(Number(e.target.value)); }} />
        <span style={{ color: 'var(--text-muted)' }} className="tabular-nums w-20">{STEP} ms</span>
        <div className="flex rounded border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {(['cued', 'uncued'] as const).map(c => (
            <button key={c} onClick={() => setCond(c)} className="px-3 py-1"
                    style={{ background: cond === c ? 'var(--accent-dim)' : 'var(--surface)',
                             fontWeight: cond === c ? 700 : 400 }}>
              {c === 'cued' ? 'cued (attend green)' : 'uncued (attend red)'}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 ${TRIM} ${XL} ${YL - TRIM}`} className="w-full h-auto"
           style={{ background: 'var(--background)' }}>
        <Display />
        <TraceLegend y={yTr0 + TRH + 0.86} />
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
        <Seg x1={tx(STEP)} y1={yPool - 0.10} x2={tx(STEP)} y2={LTOP - STIMH - 0.30} c={CURSOR} w={1.3} />
        <Txt x={LX} y={yPool - 0.30} size={7.2} c={MUTE}>0 ms</Txt>
        <Txt x={LX + LW} y={yPool - 0.30} size={7.2} c={MUTE} a="end">{`${T} ms`}</Txt>
        <Txt x={LX + LW / 2} y={yPool - 0.30} size={7} c={MUTE} a="middle" i>
          time — shaded: the two read windows
        </Txt>

        <PointSet YM={YMA} YC={YCA} k="A" R={RFA} ret={RET_A} above={false} />
        <PointSet YM={YMB} YC={YCB} k="B" R={RFB} ret={RET_B} above />

        <Seg x1={XDIV} y1={spine(YCB)} x2={XDIV} y2={spine(YMA)} c={NORM} w={1.6} />
        <rect x={XDIV - NORMW / 2} y={Y(MID + NORMH / 2)} width={NORMW} height={NORMH} rx={0.06}
              fill={FILL} stroke={INK} strokeWidth={1.6 * PT} />
        <Txt x={XDIV} y={MID + 1.22} size={8.8} a="middle" b>SHARED NORMALIZATION</Txt>
        <Txt x={XDIV} y={MID + 0.98} size={9.6} a="middle">den = σⁿ + w Σ Dⁿ</Txt>
        {/* ⭐ THE COLLAPSED FORM. In Model IV the gain on BOTH drives of a point-set is the same
          * SCALAR (1+C_s), and a scalar factors straight out of a power sum — so the denominator
          * is a function of the two cooperation pools and a stimulus term.
          * ⛔ FALSE in Model III, where the bias is a FIELD on the drive and does not factor. */}
        <Txt x={XDIV} y={MID + 0.60} size={9} a="middle">= σⁿ + w[(1+C_A)ⁿU_A</Txt>
        <Txt x={XDIV + 0.22} y={MID + 0.38} size={9} a="middle">+ (1+C_B)ⁿU_B]</Txt>
        <Csub x={XDIV - 0.62} y={MID + 0.16} nm="A" v={side.C.A[fi]} />
        <Csub x={XDIV + 0.62} y={MID + 0.16} nm="B" v={side.C.B[fi]} />
        <Txt x={XDIV} y={MID - 0.12} size={11} a="middle" b>{`= ${side.den[fi].toFixed(2)}`}</Txt>
        <line x1={XDIV - NORMW / 2 + 0.18} y1={Y(MID - 0.38)} x2={XDIV + NORMW / 2 - 0.18}
              y2={Y(MID - 0.38)} stroke={LINE} strokeWidth={0.8 * PT} />
        {/* ⭐ THE RESULTANT MULTIPLIER. Cooperation raises the numerator AND the denominator, so
          * within ONE point-set the two largely cancel. What does NOT cancel is the OTHER
          * point-set's term: G_A falls when C_B rises. The competition lives in this ratio, and
          * the attention index is (G_cued − G_unc)/(G_cued + G_unc). */}
        <Txt x={XDIV} y={MID - 0.54} size={7.4} a="middle" b>RESULTANT MULTIPLIER</Txt>
        <Txt x={XDIV} y={MID - 0.80} size={9} a="middle">Gs = (1+C_s)ⁿ / den</Txt>
        <Gsub x={XDIV - 0.62} y={MID - 1.08} nm="A" v={(1 + side.C.A[fi]) ** M.params.nV1 / side.den[fi]} />
        <Gsub x={XDIV + 0.62} y={MID - 1.08} nm="B" v={(1 + side.C.B[fi]) ** M.params.nV1 / side.den[fi]} />
        {[spine(YMA), spine(YCA), spine(YMB), spine(YCB)].map((sp, i) => (
          <Arrow key={i} x1={XDIV} y1={MID + (sp > MID ? NORMH / 2 : -NORMH / 2)}
                 x2={XDIV} y2={sp + (sp > MID ? -0.24 : 0.24)} c={NORM} w={1.5} />
        ))}
        {([['A', RET_A, XDIV - 0.55, true, 'end'], ['B', RET_B, XDIV + 0.55, false, 'start']] as const)
          .map(([nm, ret, bx, dn, ha]) => {
            const y1 = dn ? MID + NORMH / 2 + 0.04 : MID - NORMH / 2 - 0.04;
            return (
              <g key={nm}>
{/* no label: the BOX now states the whole collapsed expression */}
                <Arrow x1={bx} y1={ret} x2={bx} y2={y1} c={COOP} w={1.6} />
              </g>
            );
          })}
        <Bias />
      </svg>

      <figcaption className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        <strong>Model IV on the real stimulus.</strong> The drive is extracted from the actual dots
        of the counter-rotating display; the receptive-field boxes hold the very dots it was
        extracted from. Read-outs: primary {M.read.primary.toFixed(4)}, colour{' '}
        {M.read.colour.toFixed(4)}, translation {M.read.translation.toFixed(4)}.
        <br />
        <strong style={{ color: '#8a4b2a' }}>
          One layout of many, and the population is what the model claims. Over the 40 layouts that
          satisfy purity, this operating point gives primary +0.4279 ± 0.6460 (median +0.8059,
          negative in 11) and translation +0.2535 ± 0.4469 (median +0.1126, negative in 14). Seed{' '}
          {M.seed} is the layout nearest the median on both, not the best — the best on translation
          is +0.9729 and the worst is −0.6249. Purity is a drive-share ≥ 80% test, and the achieved
          contamination is 10.7% ± 6.1% (A) and 8.7% ± 7.7% (B), so roughly a tenth of each
          point-set&apos;s drive still comes from the other surface.
        </strong>
        <br />
        <strong style={{ color: '#8a4b2a' }}>
          Swap survival at this operating point is 91% of the no-swap effect (population means,
          n = 40), against 82% at the previously calibrated point. Survival is set by the ratio of
          cooperative coupling to normalization weight, CoopL/normW; biasAmp sets the magnitude
          independently.
        </strong>
        <br />
        <span className="opacity-70">
          {M.source} · settle {M.stim.preMs} ms · exported {M.generated}
        </span>
      </figcaption>
    </figure>
  );
}
