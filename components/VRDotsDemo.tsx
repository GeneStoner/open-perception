'use client';

import { useEffect, useRef } from 'react';

export type SwapType = 'none' | 'cm';

interface Props {
  cued:     boolean;
  swapType: SwapType;
}

// ── Parameters from Exp_StonerBlanc_Replication.asset ────────────────────────
// apertureRadius_deg=2.0, dotsPerField=63, translationDuration_ms=44,
// fixationExclusionRadius_deg=0.396, fixationScaleFactor=0.222
const PX_PER_DEG   = 52;
const AP_R         = 2.0   * PX_PER_DEG;  // aperture radius (px)
const EXCL_R       = 0.396 * PX_PER_DEG;  // fixation exclusion radius (px)
const DOT_R        = Math.max(1.5, 0.04 * PX_PER_DEG);  // dot radius (px)

// Demo: half rotation speed, 4× translation duration
const ROT_RAD_MS   = (81 * 0.5 * Math.PI / 180) / 1000; // rad/ms
const TRANS_PX_MS  = (2.26 * 0.5 * PX_PER_DEG) / 1000;  // px/ms
const T_TRANS_DEMO = 44 * 4;   // 176 ms (4× actual 44 ms)

// Trial timing (ms)
const T_SOLO    = 750;
const T_PRETRANS = 300;
const T_POST    = 500;
const T_TOTAL   = T_SOLO + T_PRETRANS + T_TRANS_DEMO + T_POST;

// Dots: 63/field, split into coherent (MK_LIN) and NC (MK_NC) subfields
const N_PER_FIELD = 63;
const N_COHERENT  = Math.floor(N_PER_FIELD / 2);  // 31 coherent, 32 NC

// 8 balanced NC directions (StepTranslationBalanced in Unity)
const S2 = Math.SQRT1_2;
const NC_DIRS: [number, number][] = [
  [ 1,  0], [ S2,  S2], [ 0,  1], [-S2,  S2],
  [-1,  0], [-S2, -S2], [ 0, -1], [ S2, -S2],
];

// Field colors
const COL: [string, string] = ['rgb(204,51,51)', 'rgb(34,139,34)'];

const W = 280, H = 280;
const CX = W / 2, CY = H / 2;

interface Dot {
  x: number; y: number;   // position from centre (px)
  field:       0 | 1;
  isCoherent:  boolean;
  ncDirIdx:    number;    // k % 8 within NC subfield
}

function initDot(field: 0 | 1, isCoherent: boolean, ncDirIdx: number): Dot {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - DOT_R) * (AP_R - DOT_R);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  return { x: r * Math.cos(θ), y: r * Math.sin(θ), field, isCoherent, ncDirIdx };
}

function respawn(dot: Dot) {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - DOT_R) * (AP_R - DOT_R);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  dot.x = r * Math.cos(θ);
  dot.y = r * Math.sin(θ);
}

function checkOOB(dot: Dot) {
  const r2 = dot.x * dot.x + dot.y * dot.y;
  if (r2 > (AP_R - DOT_R) * (AP_R - DOT_R) || r2 < EXCL_R * EXCL_R) respawn(dot);
}

// CW rotation in screen coords (Y-down): x'=x·cos α+y·sin α, y'=−x·sin α+y·cos α
function rotate(dot: Dot, dirSign: number, dt: number) {
  const α  = dirSign * ROT_RAD_MS * dt;  // dirSign: -1=CW, +1=CCW
  const ca = Math.cos(α), sa = Math.sin(α);
  const nx = dot.x * ca + dot.y * sa;
  const ny = -dot.x * sa + dot.y * ca;
  dot.x = nx; dot.y = ny;
  checkOOB(dot);
}

// ── Fixation: white disc + black crosshair + white dot (StonerBlanc_Replication.asset)
// fixationScaleFactor=0.222; outerDiam=1.8°, innerDiam=0.2°, crossThickness=0.375°
function drawFixation(ctx: CanvasRenderingContext2D) {
  const sf      = 0.222;
  const outerR  = 1.8 / 2 * sf * PX_PER_DEG;
  const crossHW = 0.375 / 2 * sf * PX_PER_DEG;
  const innerR  = 0.2  / 2 * sf * PX_PER_DEG;

  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, Math.max(3, outerR), 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, Math.max(3, outerR), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillRect(CX - Math.max(3, outerR), CY - Math.max(1, crossHW), Math.max(3, outerR) * 2, Math.max(1, crossHW) * 2);
  ctx.fillRect(CX - Math.max(1, crossHW), CY - Math.max(3, outerR), Math.max(1, crossHW) * 2, Math.max(3, outerR) * 2);
  ctx.restore();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, Math.max(1.5, innerR), 0, Math.PI * 2); ctx.fill();
}

export default function VRDotsDemo({ cued, swapType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Field 1 (green) always translates.
    // CUED:   field 0 always-on, field 1 delayed → translating field is cued.
    // UNCUED: field 1 always-on, field 0 delayed → translating field is uncued.
    const TRANS_FIELD    = 1 as const;  // field that translates
    const COMPETING_FIELD = 0 as const; // field that keeps rotating

    const motionSwap = swapType === 'cm';
    const colorSwap  = swapType === 'cm';

    // Field 0: CW (dirSign=-1), Field 1: CCW (dirSign=+1) — normal rotation
    const rotSign: [number, number] = [-1, +1];

    const TRANS_START = T_SOLO + T_PRETRANS;

    // Initialise dots for both fields
    const dots: Dot[] = [];
    for (let field = 0 as 0 | 1; field <= 1; field++) {
      for (let k = 0; k < N_PER_FIELD; k++) {
        const isCoherent = k < N_COHERENT;
        const ncDirIdx   = isCoherent ? 0 : (k - N_COHERENT) % 8;
        dots.push(initDot(field, isCoherent, ncDirIdx));
      }
    }

    let startTime: number | null = null;
    let lastTime:  number | null = null;
    let prevT     = T_TOTAL;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t  = (now - startTime) % T_TOTAL;
      const dt = lastTime !== null ? Math.min(now - lastTime, 32) : 0;
      lastTime = now;

      // Field visibility
      // CUED:   field 0 always visible, field 1 appears at T_SOLO (delayed = cue)
      // UNCUED: field 1 always visible, field 0 appears at T_SOLO (delayed = cue)
      const f0Vis = cued  ? true       : t >= T_SOLO;
      const f1Vis = cued  ? t >= T_SOLO : true;

      const inTrans = t >= TRANS_START && t < TRANS_START + T_TRANS_DEMO;

      // Reinitialize translating field at trial wrap while it's hidden
      if (prevT > t && !f1Vis) {
        for (const dot of dots) {
          if (dot.field === TRANS_FIELD) {
            const d = initDot(dot.field, dot.isCoherent, dot.ncDirIdx);
            dot.x = d.x; dot.y = d.y;
          }
        }
      }
      prevT = t;

      if (dt > 0) {
        for (const dot of dots) {
          const visible = dot.field === 0 ? f0Vis : f1Vis;
          if (!visible) continue;

          if (inTrans && dot.field === TRANS_FIELD) {
            // ── Translating field: NO rotation, translate instead ─────────
            if (dot.isCoherent) {
              // MK_LIN: coherent translation rightward
              dot.x += TRANS_PX_MS * dt;
            } else {
              // MK_NC: balanced 8-direction (StepTranslationBalanced)
              const [dx, dy] = NC_DIRS[dot.ncDirIdx];
              dot.x += TRANS_PX_MS * dx * dt;
              dot.y += TRANS_PX_MS * dy * dt;
            }
            checkOOB(dot);

          } else {
            // ── Rotating field (or outside translation window) ────────────
            const baseSign = rotSign[dot.field];
            const effSign  = (motionSwap && t >= TRANS_START) ? -baseSign : baseSign;
            rotate(dot, effSign, dt);
          }
        }
      }

      // ── Render ─────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, AP_R, 0, Math.PI * 2); ctx.clip();

      for (const dot of dots) {
        const visible = dot.field === 0 ? f0Vis : f1Vis;
        if (!visible) continue;
        const px = CX + dot.x, py = CY + dot.y;
        const dx = px - CX, dy = py - CY;
        if (dx * dx + dy * dy > AP_R * AP_R) continue;

        const dispField = (colorSwap && inTrans)
          ? (dot.field === 0 ? 1 : 0) as 0 | 1
          : dot.field;
        ctx.fillStyle = COL[dispField];
        ctx.beginPath(); ctx.arc(px, py, DOT_R, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();
      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [cued, swapType]);

  return (
    <canvas ref={canvasRef} width={W} height={H}
      style={{ display: 'block', borderRadius: 4, width: '100%', aspectRatio: '1' }} />
  );
}
