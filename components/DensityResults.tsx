/**
 * DensityResults — bar chart for the dot-density parametric series
 * DensityCompare_VRDots/HighDens/Peak/UltraHigh (all Ap 3.5° radius, 80 ms, N=no swap)
 * n=256 per arm, single observer G.S.
 */

import ContentBlurb from '@/components/ContentBlurb';

const CONDITIONS = [
  { id: 'vrdots',     label: 'VRDots',    sub: '63 dots/field',   rho: '1.8/°²',
    cued: 60.5, uncued: 25.8, cuedCI: 6.0, uncuedCI: 5.4, delta: 34.8, sig: '***', p: '< .001' },
  { id: 'highdens',   label: 'HighDens',  sub: '173 dots/field',  rho: '5.0/°²',
    cued: 58.6, uncued: 25.0, cuedCI: 6.0, uncuedCI: 5.3, delta: 33.6, sig: '***', p: '< .001' },
  { id: 'peak',       label: 'Peak',      sub: '500 dots/field',  rho: '14/°²',
    cued: 63.3, uncued: 28.5, cuedCI: 5.9, uncuedCI: 5.5, delta: 34.8, sig: '***', p: '< .001' },
  { id: 'ultrahigh',  label: 'UltraHigh', sub: '1000 dots/field', rho: '29/°²',
    cued: 53.1, uncued: 28.1, cuedCI: 6.1, uncuedCI: 5.5, delta: 25.0, sig: '***', p: '< .001' },
] as const;

// SVG layout
const SVG_W = 520, SVG_H = 310;
const ML = 52, MR = 16, MT = 36, MB = 80;
const PLOT_W = SVG_W - ML - MR;
const PLOT_H = SVG_H - MT - MB;
const Y_MAX = 80, Y_MIN = 0;
const PX_PC = PLOT_H / (Y_MAX - Y_MIN);

const CHANCE = 12.5;
const GROUP_W = PLOT_W / CONDITIONS.length;
const BAR_W = 24, BAR_GAP = 7;
const BAR_OFFSET = (GROUP_W - (BAR_W * 2 + BAR_GAP)) / 2;

const COL_CUED   = '#4a90d9';
const COL_UNCUED = '#f5a623';

function yPx(pct: number) { return MT + (Y_MAX - pct) * PX_PC; }
function gx(i: number)    { return ML + i * GROUP_W; }
function cx(i: number)    { return gx(i) + BAR_OFFSET; }
function ux(i: number)    { return cx(i) + BAR_W + BAR_GAP; }

function Chart() {
  const yTicks = [0, 25, 50, 75];
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%"
      style={{ maxWidth: SVG_W, display: 'block', fontFamily: 'inherit' }}>

      {/* Gridlines + y-axis labels */}
      {yTicks.map(pct => (
        <g key={pct}>
          <line x1={ML} y1={yPx(pct)} x2={ML + PLOT_W} y2={yPx(pct)}
            stroke="#ddd9d2" strokeWidth={pct === 0 ? 1.5 : 1}
            strokeDasharray={pct === 0 ? undefined : '3 3'} />
          <text x={ML - 6} y={yPx(pct)} textAnchor="end" dominantBaseline="middle"
            fontSize={10} fill="#4a4a62">{pct}</text>
        </g>
      ))}

      {/* Chance line */}
      <line x1={ML} y1={yPx(CHANCE)} x2={ML + PLOT_W} y2={yPx(CHANCE)}
        stroke="#9a97a0" strokeWidth={1} strokeDasharray="4 3" />
      <text x={ML + PLOT_W + 4} y={yPx(CHANCE)} dominantBaseline="middle"
        fontSize={8.5} fill="#9a97a0">chance</text>

      {/* Y-axis label */}
      <text transform={`translate(${12},${MT + PLOT_H / 2}) rotate(-90)`}
        textAnchor="middle" fontSize={10} fill="#4a4a62">% Correct</text>

      {/* Bars */}
      {CONDITIONS.map((cond, i) => {
        const cxPos = cx(i), uxPos = ux(i);
        const cyPos = yPx(cond.cued), uyPos = yPx(cond.uncued);
        const cbh = cond.cued * PX_PC, ubh = cond.uncued * PX_PC;
        const cEH = cond.cuedCI * PX_PC, uEH = cond.uncuedCI * PX_PC;
        const bracketY = Math.min(cyPos, uyPos) - 8 - 6;

        return (
          <g key={cond.id}>
            {/* Bars */}
            <rect x={cxPos} y={cyPos} width={BAR_W} height={cbh}
              fill={COL_CUED} opacity={0.85} rx={1} />
            <rect x={uxPos} y={uyPos} width={BAR_W} height={ubh}
              fill={COL_UNCUED} opacity={0.85} rx={1} />

            {/* Error bars — CUED */}
            {[[-3, 3]].map(() => <>
              <line key="cv" x1={cxPos+BAR_W/2} y1={cyPos-cEH} x2={cxPos+BAR_W/2} y2={cyPos+cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
              <line key="ct" x1={cxPos+BAR_W/2-3} y1={cyPos-cEH} x2={cxPos+BAR_W/2+3} y2={cyPos-cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
              <line key="cb" x1={cxPos+BAR_W/2-3} y1={cyPos+cEH} x2={cxPos+BAR_W/2+3} y2={cyPos+cEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            </>)}
            {/* Error bars — UNCUED */}
            {[[-3, 3]].map(() => <>
              <line key="uv" x1={uxPos+BAR_W/2} y1={uyPos-uEH} x2={uxPos+BAR_W/2} y2={uyPos+uEH} stroke="#1e1e2a" strokeWidth={1.5}/>
              <line key="ut" x1={uxPos+BAR_W/2-3} y1={uyPos-uEH} x2={uxPos+BAR_W/2+3} y2={uyPos-uEH} stroke="#1e1e2a" strokeWidth={1.5}/>
              <line key="ub" x1={uxPos+BAR_W/2-3} y1={uyPos+uEH} x2={uxPos+BAR_W/2+3} y2={uyPos+uEH} stroke="#1e1e2a" strokeWidth={1.5}/>
            </>)}

            {/* Significance bracket */}
            <line x1={cxPos+BAR_W/2} y1={bracketY+6} x2={cxPos+BAR_W/2} y2={bracketY} stroke="#4a4a62" strokeWidth={1.5}/>
            <line x1={cxPos+BAR_W/2} y1={bracketY}   x2={uxPos+BAR_W/2} y2={bracketY} stroke="#4a4a62" strokeWidth={1.5}/>
            <line x1={uxPos+BAR_W/2} y1={bracketY}   x2={uxPos+BAR_W/2} y2={bracketY+6} stroke="#4a4a62" strokeWidth={1.5}/>
            <text x={(cxPos+uxPos+BAR_W)/2} y={bracketY-3}
              textAnchor="middle" fontSize={10} fill="#1e1e2a" fontWeight="600">
              {cond.sig}
            </text>

            {/* Condition labels */}
            <text x={gx(i)+GROUP_W/2} y={MT+PLOT_H+14}
              textAnchor="middle" fontSize={11} fill="#1e1e2a">{cond.label}</text>
            <text x={gx(i)+GROUP_W/2} y={MT+PLOT_H+27}
              textAnchor="middle" fontSize={9} fill="#4a4a62">{cond.sub}</text>
            <text x={gx(i)+GROUP_W/2} y={MT+PLOT_H+40}
              textAnchor="middle" fontSize={9} fill="#4a4a62">
              {`Δ = +${cond.delta.toFixed(1)} pp  (p ${cond.p})`}
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

export default function DensityResults() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <Chart />
      </div>
      <ContentBlurb file="collab-density-chart-caption.md"
        className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );
}
