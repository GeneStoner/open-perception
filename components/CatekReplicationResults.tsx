/**
 * CatekReplicationResults
 * Bar chart + factor analysis for SubfieldSwap_CatekExact_NMoCol_v1
 * 5 sessions, n=640/condition (320 CUED + 320 UNCUED each)
 * Style: Catek et al. (2022) Fig 3 — absolute accuracy bars, CUED/UNCUED side by side
 */

// ── Data ──────────────────────────────────────────────────────────────────────
const CONDITIONS = [
  { id: 'N',  label: 'No Swap',     cued: 64.4, uncued: 54.4, cuedCI: 5.25, uncuedCI: 5.46, delta: 10.0, sig: '*',   p: '= .010' },
  { id: 'M',  label: 'Motion Swap', cued: 64.4, uncued: 49.1, cuedCI: 5.25, uncuedCI: 5.48, delta: 15.3, sig: '***', p: '< .001' },
  { id: 'C',  label: 'Color Swap',  cued: 68.4, uncued: 50.9, cuedCI: 5.09, uncuedCI: 5.48, delta: 17.5, sig: '***', p: '< .001' },
  { id: 'MC', label: 'M+C Swap',    cued: 66.9, uncued: 52.2, cuedCI: 5.16, uncuedCI: 5.47, delta: 14.7, sig: '***', p: '< .001' },
] as const;

const GLM_ROWS = [
  { term: 'F1: onset dot cue',     effect: +14.4, ciLo: +10.6, ciHi: +18.2, p: '< .001', sig: '***' },
  { term: 'F2: color identity',     effect:  -1.7, ciLo:  -5.5, ciHi:  +2.1, p: '.372',   sig: 'n.s.' },
  { term: 'F3: competing rotation', effect:  -0.6, ciLo:  -4.4, ciHi:  +3.2, p: '.746',   sig: 'n.s.' },
  { term: 'F1 × F2',               effect:  -1.6, ciLo:  -5.3, ciHi:  +2.2, p: '.417',   sig: 'n.s.' },
  { term: 'F1 × F3',               effect:  +1.4, ciLo:  -2.4, ciHi:  +5.2, p: '.465',   sig: 'n.s.' },
  { term: 'F2 × F3',               effect:  +1.3, ciLo:  -2.5, ciHi:  +5.0, p: '.516',   sig: 'n.s.' },
  { term: 'F1 × F2 × F3',          effect:  -2.0, ciLo:  -5.8, ciHi:  +1.8, p: '.292',   sig: 'n.s.' },
] as const;

import ContentBlurb from '@/components/ContentBlurb';

// ── SVG chart constants ───────────────────────────────────────────────────────
const SVG_W     = 520;
const SVG_H     = 310;
const ML        = 52;   // left margin
const MR        = 16;
const MT        = 36;   // top margin (room for sig brackets)
const MB        = 72;   // bottom margin (condition labels)
const PLOT_W    = SVG_W - ML - MR;   // 452
const PLOT_H    = SVG_H - MT - MB;   // 202
const Y_MIN     = 0;
const Y_MAX     = 85;
const PX_PER_PC = PLOT_H / (Y_MAX - Y_MIN);   // px per percentage point

const CHANCE    = 12.5;
const N_GROUPS  = CONDITIONS.length;
const GROUP_W   = PLOT_W / N_GROUPS;   // 113
const BAR_W     = 24;
const BAR_GAP   = 7;
const PAIR_W    = BAR_W * 2 + BAR_GAP;   // 55
const BAR_OFFSET = (GROUP_W - PAIR_W) / 2;   // centering offset

const COL_CUED   = '#4a90d9';   // blue
const COL_UNCUED = '#f5a623';   // orange

function yPx(pct: number) {
  return MT + (Y_MAX - pct) * PX_PER_PC;
}

function groupX(i: number) {
  return ML + i * GROUP_W;
}

function cuedX(i: number) {
  return groupX(i) + BAR_OFFSET;
}

function uncuedX(i: number) {
  return cuedX(i) + BAR_W + BAR_GAP;
}

// ── Chart component ───────────────────────────────────────────────────────────
function BarChart() {
  const yTicks = [0, 25, 50, 75];
  const sigTopMargin = 8;
  const bracketH = 6;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', fontFamily: 'inherit' }}
      aria-label="Catek replication bar chart — accuracy by condition and cue"
    >
      {/* ── Y-axis ticks and gridlines ── */}
      {yTicks.map(pct => (
        <g key={pct}>
          <line
            x1={ML} y1={yPx(pct)} x2={ML + PLOT_W} y2={yPx(pct)}
            stroke="#ddd9d2" strokeWidth={pct === 0 ? 1.5 : 1} strokeDasharray={pct === 0 ? undefined : '3 3'}
          />
          <text x={ML - 6} y={yPx(pct)} textAnchor="end" dominantBaseline="middle"
            fontSize={10} fill="#4a4a62">{pct}</text>
        </g>
      ))}

      {/* Chance level */}
      <line
        x1={ML} y1={yPx(CHANCE)} x2={ML + PLOT_W} y2={yPx(CHANCE)}
        stroke="#9a97a0" strokeWidth={1} strokeDasharray="4 3"
      />
      <text x={ML + PLOT_W + 4} y={yPx(CHANCE)} dominantBaseline="middle"
        fontSize={8.5} fill="#9a97a0">chance</text>

      {/* Y-axis label */}
      <text
        transform={`translate(${12},${MT + PLOT_H / 2}) rotate(-90)`}
        textAnchor="middle" fontSize={10} fill="#4a4a62"
      >
        % Correct
      </text>

      {/* ── Bars ── */}
      {CONDITIONS.map((cond, i) => {
        const cx    = cuedX(i);
        const ux    = uncuedX(i);
        const cy    = yPx(cond.cued);
        const uy    = yPx(cond.uncued);
        const cbh   = cond.cued   * PX_PER_PC;
        const ubh   = cond.uncued * PX_PER_PC;
        const cErrH = cond.cuedCI   * PX_PER_PC;
        const uErrH = cond.uncuedCI * PX_PER_PC;
        const topY  = Math.min(cy, uy) - sigTopMargin - bracketH;

        return (
          <g key={cond.id}>
            {/* CUED bar */}
            <rect x={cx} y={cy} width={BAR_W} height={cbh} fill={COL_CUED} opacity={0.85} rx={1} />
            {/* UNCUED bar */}
            <rect x={ux} y={uy} width={BAR_W} height={ubh} fill={COL_UNCUED} opacity={0.7} rx={1} />

            {/* Error bars */}
            {/* CUED */}
            <line x1={cx + BAR_W / 2} y1={cy - cErrH} x2={cx + BAR_W / 2} y2={cy + cErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />
            <line x1={cx + BAR_W / 2 - 3} y1={cy - cErrH} x2={cx + BAR_W / 2 + 3} y2={cy - cErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />
            <line x1={cx + BAR_W / 2 - 3} y1={cy + cErrH} x2={cx + BAR_W / 2 + 3} y2={cy + cErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />
            {/* UNCUED */}
            <line x1={ux + BAR_W / 2} y1={uy - uErrH} x2={ux + BAR_W / 2} y2={uy + uErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />
            <line x1={ux + BAR_W / 2 - 3} y1={uy - uErrH} x2={ux + BAR_W / 2 + 3} y2={uy - uErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />
            <line x1={ux + BAR_W / 2 - 3} y1={uy + uErrH} x2={ux + BAR_W / 2 + 3} y2={uy + uErrH}
              stroke="#1e1e2a" strokeWidth={1.5} />

            {/* Significance bracket */}
            <line x1={cx + BAR_W / 2} y1={topY + bracketH} x2={cx + BAR_W / 2} y2={topY}
              stroke="#4a4a62" strokeWidth={1.5} />
            <line x1={cx + BAR_W / 2} y1={topY} x2={ux + BAR_W / 2} y2={topY}
              stroke="#4a4a62" strokeWidth={1.5} />
            <line x1={ux + BAR_W / 2} y1={topY} x2={ux + BAR_W / 2} y2={topY + bracketH}
              stroke="#4a4a62" strokeWidth={1.5} />
            <text
              x={(cx + ux + BAR_W) / 2} y={topY - 3}
              textAnchor="middle" fontSize={10}
              fill="#1e1e2a"
              fontWeight="600"
            >
              {cond.sig}
            </text>

            {/* Condition label */}
            <text
              x={groupX(i) + GROUP_W / 2}
              y={MT + PLOT_H + 14}
              textAnchor="middle" fontSize={11} fill="#1e1e2a"
            >
              {cond.label}
            </text>
            <text
              x={groupX(i) + GROUP_W / 2}
              y={MT + PLOT_H + 28}
              textAnchor="middle" fontSize={9} fill="#4a4a62"
            >
              {`Δ = ${cond.delta > 0 ? '+' : ''}${cond.delta.toFixed(1)} pp  (p ${cond.p})`}
            </text>
          </g>
        );
      })}

      {/* ── Legend ── */}
      <rect x={ML + 4} y={MT + 4} width={12} height={12} fill={COL_CUED} opacity={0.85} rx={1} />
      <text x={ML + 20} y={MT + 11} fontSize={10} fill="#1e1e2a" dominantBaseline="middle">Cued (delayed onset)</text>
      <rect x={ML + 130} y={MT + 4} width={12} height={12} fill={COL_UNCUED} opacity={0.7} rx={1} />
      <text x={ML + 146} y={MT + 11} fontSize={10} fill="#1e1e2a" dominantBaseline="middle">Uncued</text>
    </svg>
  );
}

// ── Factor analysis table ─────────────────────────────────────────────────────
function FactorTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse" style={{ color: 'var(--text-secondary)' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>Term</th>
            <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-primary)' }}>Effect (pp)</th>
            <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-primary)' }}>95% CI</th>
            <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-primary)' }}>p</th>
            <th className="text-right py-2 pl-3 font-medium" style={{ color: 'var(--text-primary)' }}></th>
          </tr>
        </thead>
        <tbody>
          {GLM_ROWS.map((row, i) => (
            <tr key={row.term} style={{ borderBottom: i < GLM_ROWS.length - 1 ? '1px solid var(--border)' : undefined }}>
              <td className="py-1.5 pr-4 font-mono" style={{ color: row.sig === 'n.s.' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                {row.term}
              </td>
              <td className="text-right py-1.5 px-3 tabular-nums" style={{ color: row.sig !== 'n.s.' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {row.effect > 0 ? '+' : ''}{row.effect.toFixed(1)}
              </td>
              <td className="text-right py-1.5 px-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                [{row.ciLo > 0 ? '+' : ''}{row.ciLo.toFixed(1)}, {row.ciHi > 0 ? '+' : ''}{row.ciHi.toFixed(1)}]
              </td>
              <td className="text-right py-1.5 px-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {row.p}
              </td>
              <td className="text-right py-1.5 pl-3 font-semibold" style={{ color: row.sig !== 'n.s.' ? '#4a90d9' : 'var(--text-muted)' }}>
                {row.sig}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function CatekReplicationResults() {
  return (
    <div className="space-y-8">

      {/* Caption */}
      <ContentBlurb file="collab-catek-results-caption.md" className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }} />

      {/* Bar chart */}
      <div
        className="rounded-lg border p-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <BarChart />
      </div>

      {/* Factor analysis */}
      <div className="space-y-3">
        <ContentBlurb file="collab-factor-analysis-heading.md"
          className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} />
        <ContentBlurb file="collab-catek-factor-intro.md" className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }} />
        <div
          className="rounded-lg border p-4"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <FactorTable />
        </div>
        <ContentBlurb file="collab-catek-factor-conclusion.md" className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }} />
      </div>

    </div>
  );
}
