/**
 * HighDensSwapResults — N vs MC at Peak (500) and UltraHigh (1000) dots/field
 * DensityCompare_Peak_ColorMotionSwap_v1 (session 260423_1053)
 * DensityCompare_UltraHigh_ColorMotionSwap_v1 (session 260502_1304)
 * All: Ap 3.5° radius, 80 ms, n=256 per arm
 */

import ContentBlurb from '@/components/ContentBlurb';

// Four conditions: [density label, swap, cued%, uncued%, cuedCI, uncuedCI, delta, sig, p]
const CONDITIONS = [
  { id: 'peak-n',    density: 'Peak',      swap: 'N',  densitySub: '500 dots/field',
    cued: 64.8, uncued: 26.2, cuedCI: 5.9, uncuedCI: 5.4, delta: 38.7, sig: '***', p: '< .001' },
  { id: 'peak-mc',   density: 'Peak',      swap: 'MC', densitySub: '500 dots/field',
    cued: 50.8, uncued: 34.0, cuedCI: 6.1, uncuedCI: 5.8, delta: 16.8, sig: '***', p: '< .001' },
  { id: 'ultra-n',   density: 'UltraHigh', swap: 'N',  densitySub: '1000 dots/field',
    cued: 52.7, uncued: 25.4, cuedCI: 6.1, uncuedCI: 5.3, delta: 27.3, sig: '***', p: '< .001' },
  { id: 'ultra-mc',  density: 'UltraHigh', swap: 'MC', densitySub: '1000 dots/field',
    cued: 37.9, uncued: 37.1, cuedCI: 6.0, uncuedCI: 5.9, delta:  0.8, sig: 'n.s.', p: '= .854' },
] as const;

// SVG layout
const SVG_W = 540, SVG_H = 330;
const ML = 52, MR = 20, MT = 50, MB = 96;
const PLOT_W = SVG_W - ML - MR;  // 468
const PLOT_H = SVG_H - MT - MB;  // 184
const Y_MAX = 80, Y_MIN = 0;
const PX_PC = PLOT_H / (Y_MAX - Y_MIN);
const CHANCE = 12.5;

// 4 groups — wider gap between index 1 and 2 (between density groups)
// Positions of group left edges (in plot coords)
const INNER_GAP = 14;   // gap within a density pair
const OUTER_GAP = 36;   // gap between density pairs
const BAR_W = 22, BAR_GAP = 6;
const PAIR_W = BAR_W * 2 + BAR_GAP;  // 50

// Manual x positions (left edge of each bar pair)
const GROUP_STARTS = [
  0,
  PAIR_W + INNER_GAP,
  PAIR_W * 2 + INNER_GAP + OUTER_GAP,
  PAIR_W * 3 + INNER_GAP * 2 + OUTER_GAP,
];
const TOTAL_W = PAIR_W * 4 + INNER_GAP * 2 + OUTER_GAP;
const X_SCALE = PLOT_W / TOTAL_W;

function gx(i: number) { return ML + GROUP_STARTS[i] * X_SCALE; }
function cx(i: number) { return gx(i); }
function ux(i: number) { return gx(i) + BAR_W * X_SCALE + BAR_GAP * X_SCALE; }
function barW()        { return BAR_W * X_SCALE; }
function yPx(pct: number) { return MT + (Y_MAX - pct) * PX_PC; }

// Density group label x-centres
const peakCentre     = (gx(0) + gx(1) + barW() * 2 + BAR_GAP * X_SCALE) / 2;
const ultraCentre    = (gx(2) + gx(3) + barW() * 2 + BAR_GAP * X_SCALE) / 2;
const sepX           = (gx(1) + barW() + gx(2)) / 2;

const COL_CUED   = '#4a90d9';
const COL_UNCUED = '#f5a623';

function Chart() {
  const yTicks = [0, 25, 50, 75];
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%"
      style={{ maxWidth: SVG_W, display: 'block', fontFamily: 'inherit' }}>

      {/* Density group background shading */}
      <rect x={ML} y={MT} width={sepX - ML - 6} height={PLOT_H}
        fill="#f5f3ef" rx={3} />
      <rect x={sepX + 6} y={MT} width={ML + PLOT_W - sepX - 6} height={PLOT_H}
        fill="#f0eef0" rx={3} />

      {/* Gridlines + y-axis */}
      {yTicks.map(pct => (
        <g key={pct}>
          <line x1={ML} y1={yPx(pct)} x2={ML+PLOT_W} y2={yPx(pct)}
            stroke="#ddd9d2" strokeWidth={pct===0?1.5:1}
            strokeDasharray={pct===0?undefined:'3 3'} />
          <text x={ML-6} y={yPx(pct)} textAnchor="end" dominantBaseline="middle"
            fontSize={10} fill="#4a4a62">{pct}</text>
        </g>
      ))}

      {/* Chance line */}
      <line x1={ML} y1={yPx(CHANCE)} x2={ML+PLOT_W} y2={yPx(CHANCE)}
        stroke="#9a97a0" strokeWidth={1} strokeDasharray="4 3" />
      <text x={ML+PLOT_W+4} y={yPx(CHANCE)} dominantBaseline="middle"
        fontSize={8.5} fill="#9a97a0">chance</text>

      {/* Y-axis label */}
      <text transform={`translate(${12},${MT+PLOT_H/2}) rotate(-90)`}
        textAnchor="middle" fontSize={10} fill="#4a4a62">% Correct</text>

      {/* Density group labels (top) */}
      <text x={peakCentre} y={MT-18} textAnchor="middle" fontSize={11}
        fontWeight="600" fill="#1e1e2a">Peak</text>
      <text x={peakCentre} y={MT-6} textAnchor="middle" fontSize={9} fill="#4a4a62">500 dots/field</text>
      <text x={ultraCentre} y={MT-18} textAnchor="middle" fontSize={11}
        fontWeight="600" fill="#1e1e2a">UltraHigh</text>
      <text x={ultraCentre} y={MT-6} textAnchor="middle" fontSize={9} fill="#4a4a62">1000 dots/field</text>

      {/* Separator */}
      <line x1={sepX} y1={MT-26} x2={sepX} y2={MT+PLOT_H}
        stroke="#ddd9d2" strokeWidth={1.5} strokeDasharray="4 3" />

      {/* Bars */}
      {CONDITIONS.map((cond, i) => {
        const cxPos = cx(i), uxPos = ux(i);
        const bw    = barW();
        const cyPos = yPx(cond.cued), uyPos = yPx(cond.uncued);
        const cbh   = cond.cued * PX_PC, ubh = cond.uncued * PX_PC;
        const cEH   = cond.cuedCI * PX_PC, uEH = cond.uncuedCI * PX_PC;
        const bracketY = Math.min(cyPos, uyPos) - 8 - 6;

        const dimmed = cond.sig === 'n.s.';

        return (
          <g key={cond.id}>
            {/* Bars */}
            <rect x={cxPos} y={cyPos} width={bw} height={cbh}
              fill={COL_CUED} opacity={dimmed ? 0.45 : 0.85} rx={1} />
            <rect x={uxPos} y={uyPos} width={bw} height={ubh}
              fill={COL_UNCUED} opacity={dimmed ? 0.45 : 0.85} rx={1} />

            {/* Error bars — CUED */}
            <line x1={cxPos+bw/2} y1={cyPos-cEH} x2={cxPos+bw/2} y2={cyPos+cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            <line x1={cxPos+bw/2-3} y1={cyPos-cEH} x2={cxPos+bw/2+3} y2={cyPos-cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            <line x1={cxPos+bw/2-3} y1={cyPos+cEH} x2={cxPos+bw/2+3} y2={cyPos+cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            {/* Error bars — UNCUED */}
            <line x1={uxPos+bw/2} y1={uyPos-uEH} x2={uxPos+bw/2} y2={uyPos+uEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            <line x1={uxPos+bw/2-3} y1={uyPos-uEH} x2={uxPos+bw/2+3} y2={uyPos-uEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            <line x1={uxPos+bw/2-3} y1={uyPos+uEH} x2={uxPos+bw/2+3} y2={uyPos+uEH} stroke="#1e1e2a" strokeWidth={1.5}/>

            {/* Significance bracket */}
            <line x1={cxPos+bw/2} y1={bracketY+6} x2={cxPos+bw/2} y2={bracketY} stroke="#4a4a62" strokeWidth={1.5}/>
            <line x1={cxPos+bw/2} y1={bracketY}   x2={uxPos+bw/2} y2={bracketY} stroke="#4a4a62" strokeWidth={1.5}/>
            <line x1={uxPos+bw/2} y1={bracketY}   x2={uxPos+bw/2} y2={bracketY+6} stroke="#4a4a62" strokeWidth={1.5}/>
            <text x={(cxPos+uxPos+bw)/2} y={bracketY-3}
              textAnchor="middle" fontSize={10}
              fill={dimmed ? '#9a97a0' : '#1e1e2a'}
              fontWeight={dimmed ? '400' : '600'}>
              {cond.sig}
            </text>

            {/* Swap label and delta */}
            <text x={(cxPos+uxPos+bw)/2} y={MT+PLOT_H+14}
              textAnchor="middle" fontSize={12} fontWeight="600" fill="#1e1e2a">{cond.swap}</text>
            <text x={(cxPos+uxPos+bw)/2} y={MT+PLOT_H+28}
              textAnchor="middle" fontSize={9} fill="#4a4a62">
              {`Δ = ${cond.delta>0?'+':''}${cond.delta.toFixed(1)} pp`}
            </text>
            <text x={(cxPos+uxPos+bw)/2} y={MT+PLOT_H+41}
              textAnchor="middle" fontSize={9} fill={dimmed?'#9a97a0':'#4a4a62'}>
              {`p ${cond.p}`}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={ML+4} y={MT+4} width={12} height={12} fill={COL_CUED} opacity={0.85} rx={1}/>
      <text x={ML+20} y={MT+11} fontSize={10} fill="#1e1e2a" dominantBaseline="middle">Cued</text>
      <rect x={ML+68} y={MT+4} width={12} height={12} fill={COL_UNCUED} opacity={0.85} rx={1}/>
      <text x={ML+84} y={MT+11} fontSize={10} fill="#1e1e2a" dominantBaseline="middle">Uncued</text>
    </svg>
  );
}

export default function HighDensSwapResults() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Chart />
      </div>
      <ContentBlurb file="collab-highdensswap-caption.md"
        className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );
}
