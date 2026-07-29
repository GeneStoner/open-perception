/**
 * HCPSFlow — the hypercolumn / point-set model, left to right.
 *
 * Inline SVG so it scales crisply, picks up the site's CSS variables, and needs no asset
 * pipeline.
 *
 * Every model number in this drawing comes from HCPS_DEFAULTS, which is GENERATED from
 * pointset/hcps_op.m by hcps_export_params.m. Do not retype them here. This figure spent a
 * day showing sigma 0.60 deg / 64 point-sets / tauE 30 ms after that operating point had
 * been withdrawn, precisely because the numbers had been hand-written into the SVG.
 */

import { HCPS_DEFAULTS as D } from '@/lib/hcpsDefaults';

const MOTION = '#3a6fd8';   // matches --accent
const COLOUR = '#8d5bbf';
const POOL   = '#c4831f';
const RED    = '#c0392b';
const GREEN  = '#2e8b57';

/* one 8-direction rosette of little arrowheads */
function Rosette({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, k) => {
        const a = (k * Math.PI) / 4;
        const x = cx + r * Math.cos(a);
        const y = cy - r * Math.sin(a);
        const deg = -(a * 180) / Math.PI;
        return (
          <polygon
            key={k}
            points="0,-3.6 8,0 0,3.6"
            transform={`translate(${x},${y}) rotate(${deg})`}
            fill={k === 0 || k === 6 ? MOTION : 'var(--text-muted)'}
            opacity={k === 0 || k === 6 ? 1 : 0.55}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={2.5} fill="var(--text-muted)" />
    </g>
  );
}

export default function HCPSFlow() {
  const panel = {
    fill: 'var(--surface)',
    stroke: 'var(--border)',
    strokeWidth: 1.5,
    rx: 10,
  } as const;
  const head = {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.6,
    fill: 'var(--text-muted)',
  } as const;
  const body = { fontSize: 12.5, fill: 'var(--text-primary)' } as const;
  const small = { fontSize: 11, fill: 'var(--text-secondary)' } as const;
  const tiny = { fontSize: 10, fill: 'var(--text-muted)' } as const;

  /* Deterministic uniform dots in a SQUARE aperture — the model seeds and wraps in a square
     (ps_stimulus initShape/wrapMode = 'square'), which is what makes the field stationary.
     A plain LCG, not a golden-angle spiral: the spiral read as swirl. */
  const AP = { x: 56, y: 90, w: 120, h: 120 };
  const dots = (() => {
    let s = 20260725 >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    return Array.from({ length: 54 }, (_, i) => ({
      x: AP.x + 3 + rnd() * (AP.w - 6),
      y: AP.y + 3 + rnd() * (AP.h - 6),
      a: i % 2 === 0,
    }));
  })();

  /* The colour hypercolumn is a circular hue variable with RED at 0 and GREEN opposite it
     (stim hueA = 0, hueB = pi). The stimulus has only TWO chromatic primaries, and additive
     red + green is YELLOW, so every intermediate channel is a red–green mixture and BOTH arcs
     run red → yellow → green. The circle is mirror-symmetric about the red–green axis: there
     is no blue or magenta anywhere in this colour space. Channels 1 and 5 are the surfaces. */
  const HUES = [
    '#cf3b2f', // 0°   red      — field A
    '#dd7a22', // 45°  orange
    '#d9c31e', // 90°  yellow   (equal mixture)
    '#93b62b', // 135° yellow-green
    '#2f8f5b', // 180° green    — field B
    '#93b62b', // 225° yellow-green  (mirror)
    '#d9c31e', // 270° yellow        (mirror)
    '#dd7a22', // 315° orange        (mirror)
  ];

  return (
    <svg
      viewBox="0 0 1240 660"
      className="w-full h-auto"
      role="img"
      aria-label={`The hypercolumn / point-set model, flowing left to right: the transparent dot-field stimulus feeds a lattice of ${D.nPointSets} V1 point-sets; each point-set contains a motion hypercolumn and a colour hypercolumn sharing one cooperative pool that carries the attentional bias; MT and V4 pool the V1 maps; three read-outs give the attention index.`}
    >
      <defs>
        <marker id="hcps-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill="var(--text-muted)" />
        </marker>
        <marker id="hcps-arrow-pool" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={POOL} />
        </marker>
        <marker id="hcps-arrow-motion" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={MOTION} />
        </marker>
        <marker id="hcps-arrow-colour" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 z" fill={COLOUR} />
        </marker>
      </defs>

      {/* ══════════ A · STIMULUS ══════════ */}
      <text x={116} y={38} textAnchor="middle" style={head}>STIMULUS</text>
      <rect x={26} y={56} width={180} height={188} {...panel} />
      <rect x={AP.x} y={AP.y} width={AP.w} height={AP.h} fill="var(--background)"
            stroke="var(--border)" strokeDasharray="3 3" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.4} fill={d.a ? RED : GREEN} opacity={0.85} />
      ))}
      <line x1={78} y1={132} x2={78} y2={104} stroke={RED} strokeWidth={2.4} markerEnd="url(#hcps-arrow)" />
      <line x1={154} y1={168} x2={154} y2={196} stroke={GREEN} strokeWidth={2.4} markerEnd="url(#hcps-arrow)" />
      <text x={116} y={262} textAnchor="middle" style={small}>two transparent fields</text>
      <text x={116} y={278} textAnchor="middle" style={tiny}>square aperture · {D.transCoh * 100}% coherent</text>
      <text x={116} y={292} textAnchor="middle" style={tiny}>brief rightward probe, {D.probeDegPerSec}°/s</text>

      <line x1={214} y1={150} x2={256} y2={150} stroke="var(--text-muted)" strokeWidth={1.6} markerEnd="url(#hcps-arrow)" />

      {/* ══════════ B · V1 POINT-SET LATTICE ══════════ */}
      <text x={392} y={38} textAnchor="middle" style={head}>V1 · {D.nPointSets} POINT-SETS</text>
      <rect x={266} y={56} width={252} height={188} {...panel} />
      {Array.from({ length: D.v1grid }, (_, r) =>
        Array.from({ length: D.v1grid }, (_, c) => {
          /* the lattice is drawn at its true size: v1grid x v1grid, evenly inset in the panel */
          const x = 280 + c * (224 / (D.v1grid - 1));
          const y = 68 + r * (164 / (D.v1grid - 1));
          const mid = (D.v1grid - 1) / 2;
          const on = r === mid && c === mid;
          return (
            <circle
              key={`${r}-${c}`}
              cx={x} cy={y} r={on ? 7 : 5.4}
              fill={on ? 'var(--accent-dim)' : 'var(--background)'}
              stroke={on ? POOL : 'var(--border)'}
              strokeWidth={on ? 2 : 1}
            />
          );
        }),
      )}
      <circle cx={392} cy={150} r={15} fill="none" stroke={POOL} strokeDasharray="3 3" opacity={0.8} />
      <text x={392} y={262} textAnchor="middle" style={small}>σ = {D.sigDeg}°, spacing {D.sigFrac}σ</text>
      <text x={392} y={278} textAnchor="middle" style={tiny}>{D.fieldDeg}° field · one point-set per RF</text>
      <text x={392} y={292} textAnchor="middle" style={tiny}>gain is anchored to PLACE, not to the surface</text>

      <line x1={526} y1={150} x2={568} y2={150} stroke="var(--text-muted)" strokeWidth={1.6} markerEnd="url(#hcps-arrow)" />

      {/* ══════════ C · MT / V4 ══════════ */}
      <text x={700} y={38} textAnchor="middle" style={head}>MT / V4</text>
      <rect x={578} y={62} width={244} height={80} rx={8} fill="var(--accent-dim)" stroke={MOTION} strokeWidth={1.4} />
      <text x={700} y={88} textAnchor="middle" style={{ ...body, fontWeight: 700, fill: MOTION }}>MT · motion</text>
      <text x={700} y={107} textAnchor="middle" style={small}>Gaussian pool of the</text>
      <text x={700} y={123} textAnchor="middle" style={small}>V1 motion map</text>

      <rect x={578} y={158} width={244} height={80} rx={8} fill="#f2ebf8" stroke={COLOUR} strokeWidth={1.4} />
      <text x={700} y={184} textAnchor="middle" style={{ ...body, fontWeight: 700, fill: COLOUR }}>V4 · colour</text>
      <text x={700} y={203} textAnchor="middle" style={small}>Gaussian pool of the</text>
      <text x={700} y={219} textAnchor="middle" style={small}>V1 colour map</text>
      <text x={700} y={262} textAnchor="middle" style={small}>feed-forward read-out</text>
      <text x={700} y={278} textAnchor="middle" style={tiny}>independent Poisson noise enters HERE</text>
      <text x={700} y={292} textAnchor="middle" style={tiny}>(the model is deterministic upstream)</text>

      <line x1={830} y1={150} x2={872} y2={150} stroke="var(--text-muted)" strokeWidth={1.6} markerEnd="url(#hcps-arrow)" />

      {/* ══════════ D · READ-OUTS ══════════ */}
      <text x={1055} y={38} textAnchor="middle" style={head}>READ-OUTS</text>
      <rect x={882} y={56} width={332} height={188} {...panel} />
      <circle cx={906} cy={90} r={4} fill={MOTION} />
      <text x={920} y={94} style={{ ...body, fontWeight: 600 }}>primary</text>
      <text x={920} y={110} style={tiny}>MT “down” cell — the attended surface</text>
      <circle cx={906} cy={136} r={4} fill={COLOUR} />
      <text x={920} y={140} style={{ ...body, fontWeight: 600 }}>colour transfer</text>
      <text x={920} y={156} style={tiny}>V4 “green” cell — a feature never cued</text>
      <circle cx={906} cy={182} r={4} fill={POOL} />
      <text x={920} y={186} style={{ ...body, fontWeight: 600 }}>translation</text>
      <text x={920} y={202} style={tiny}>MT “right” cell — the probe direction</text>
      <line x1={900} y1={216} x2={1196} y2={216} stroke="var(--border)" />
      <text x={1048} y={234} textAnchor="middle" style={{ ...small, fontStyle: 'italic' }}>
        AI = (cued − uncued) / (cued + uncued)
      </text>
      <text x={1048} y={262} textAnchor="middle" style={small}>two measures, same model</text>
      <text x={1048} y={278} textAnchor="middle" style={tiny}>noise-free AI · Poisson d′ ratio</text>

      {/* ══════════ zoom connector ══════════ */}
      <path d="M 340 244 L 300 330" stroke={POOL} strokeWidth={1.2} strokeDasharray="4 3" fill="none" />
      <path d="M 416 244 L 900 330" stroke={POOL} strokeWidth={1.2} strokeDasharray="4 3" fill="none" />

      {/* ══════════ E · INSIDE ONE POINT-SET ══════════ */}
      <rect x={296} y={330} width={606} height={286} rx={12} fill="var(--surface-raised)" stroke={POOL} strokeWidth={1.8} />
      <text x={320} y={358} style={{ ...head, fill: POOL }}>INSIDE ONE POINT-SET</text>

      {/* motion hypercolumn */}
      <rect x={322} y={378} width={168} height={104} rx={8} fill="var(--surface)" stroke={MOTION} strokeWidth={1.2} />
      <text x={406} y={398} textAnchor="middle" style={{ ...small, fontWeight: 700, fill: MOTION }}>motion hypercolumn</text>
      <Rosette cx={406} cy={442} r={26} />
      <text x={406} y={498} textAnchor="middle" style={tiny}>8 directions, von Mises κ = 2</text>

      {/* colour hypercolumn */}
      <rect x={322} y={506} width={168} height={86} rx={8} fill="var(--surface)" stroke={COLOUR} strokeWidth={1.2} />
      <text x={406} y={526} textAnchor="middle" style={{ ...small, fontWeight: 700, fill: COLOUR }}>colour hypercolumn</text>
      {HUES.map((c, i) => (
        <rect key={i} x={340 + i * 16} y={538} width={15} height={22} rx={2} fill={c}
              stroke={i === 0 || i === 4 ? 'var(--text-primary)' : 'none'} strokeWidth={i === 0 || i === 4 ? 1.4 : 0} />
      ))}
      <text x={347} y={572} textAnchor="middle" style={{ ...tiny, fontSize: 8.5 }}>A</text>
      <text x={411} y={572} textAnchor="middle" style={{ ...tiny, fontSize: 8.5 }}>B</text>
      <text x={406} y={586} textAnchor="middle" style={tiny}>red ↔ green; mixtures are yellow</text>

      {/* the shared cooperative pool */}
      <circle cx={614} cy={470} r={44} fill="var(--background)" stroke={POOL} strokeWidth={2.4} />
      <text x={614} y={466} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: POOL }}>E</text>
      <text x={614} y={486} textAnchor="middle" style={tiny}>shared pool</text>
      <text x={614} y={534} textAnchor="middle" style={small}>τ_E = {D.tauE_ms} ms</text>

      {/* both hypercolumns feed the pool */}
      <line x1={490} y1={442} x2={566} y2={462} stroke={MOTION} strokeWidth={1.6} markerEnd="url(#hcps-arrow-motion)" />
      <line x1={490} y1={548} x2={572} y2={500} stroke={COLOUR} strokeWidth={1.6} markerEnd="url(#hcps-arrow-colour)" />

      {/* attentional bias enters the pool */}
      <line x1={614} y1={390} x2={614} y2={422} stroke={POOL} strokeWidth={2.2} markerEnd="url(#hcps-arrow-pool)" />
      <text x={614} y={382} textAnchor="middle" style={{ ...small, fontWeight: 700, fill: POOL }}>attentional bias</text>
      <text x={614} y={366} textAnchor="middle" style={tiny}>direction- and hue-specific, into the POOL</text>

      {/* pool returns a shared gain */}
      <path d="M 614 514 Q 614 570 500 570" stroke={POOL} strokeWidth={1.8} fill="none" markerEnd="url(#hcps-arrow-pool)" />
      <text x={640} y={578} style={{ ...small, fill: POOL }}>shared gain (1 + CoopL·E) → every channel here</text>

      {/* normalization */}
      <rect x={702} y={392} width={178} height={140} rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.2} />
      <text x={791} y={412} textAnchor="middle" style={{ ...small, fontWeight: 700 }}>divisive normalization</text>
      <text x={791} y={432} textAnchor="middle" style={{ ...tiny, fontWeight: 700 }}>WITHIN attribute</text>
      <text x={791} y={446} textAnchor="middle" style={tiny}>motion pool ≠ colour pool</text>
      <text x={791} y={466} textAnchor="middle" style={{ ...tiny, fontWeight: 700 }}>LOCAL in space</text>
      <text x={791} y={480} textAnchor="middle" style={tiny}>σ = {D.normSigSpac} RF spacings ({D.normSigRF}σ)</text>
      {/* The featural extent is now an explicit parameter, and it is load-bearing: narrowing it
          makes each channel's denominator track its own numerator, which divides the pooled
          gain back out and costs 40–66% of the effect. */}
      <text x={791} y={500} textAnchor="middle" style={{ ...tiny, fontWeight: 700 }}>FLAT across channels</text>
      <text x={791} y={514} textAnchor="middle" style={tiny}>one denominator per point-set</text>
      <text x={791} y={528} textAnchor="middle" style={{ ...tiny, fontStyle: 'italic' }}>R = D² / (σ² + N)</text>
      <line x1={660} y1={450} x2={694} y2={450} stroke="var(--text-muted)" strokeWidth={1.4} markerEnd="url(#hcps-arrow)" />

      <text x={791} y={532} textAnchor="middle" style={{ ...tiny, fontWeight: 700 }}>two pools, not one</text>
      <text x={791} y={548} textAnchor="middle" style={tiny}>E — per point-set, ACROSS attributes</text>
      <text x={791} y={564} textAnchor="middle" style={tiny}>norm — within attribute, ACROSS space</text>
    </svg>
  );
}
