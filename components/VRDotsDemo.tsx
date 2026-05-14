'use client';

import { useEffect, useRef } from 'react';

export type SwapType = 'none' | 'cm';

interface Props {
  cued:     boolean;
  swapType: SwapType;
}

// ── Exact parameters from Exp_StonerBlanc_Ap35_80ms.asset ───────────────────
const PX_PER_DEG  = 30;
const AP_R        = 3.5   * PX_PER_DEG;   // 105 px  — aperture radius
const EXCL_R      = 0.396 * PX_PER_DEG;   // 11.9 px — fixation exclusion radius
const DOT_R       = Math.max(1.5, 0.08 * PX_PER_DEG * 0.5);  // ~1.2 px, min 1.5

// ── Demo speed: half actual speed, 4× translation duration ──────────────────
const ROT_DEG_S   = 81   * 0.5;           // 40.5°/s (half actual)
const TRANS_DEG_S = 2.26 * 0.5;           // 1.13°/s (half actual)
const T_TRANS     = 80   * 4;             // 320 ms  (4× actual)

// ── Trial timing (actual values, ms) ────────────────────────────────────────
const T_SOLO      = 750;   // cued: solo field-A rotation before field-B appears
const T_PRETRANS  = 300;   // dual-rotation before translation
const T_POST      = 600;   // post-translation
// Total for cued: 750 + 300 + 320 + 600 = 1970 ms
// Total for uncued: 300 + 320 + 600 = 1220 ms (padded below)

// ── Dots ─────────────────────────────────────────────────────────────────────
// Each field: 192 dots, 50% coherent (translate) + 50% noise (rotate only)
const N_PER_FIELD = 192;
const N_COHERENT  = N_PER_FIELD / 2;   // 96 coherent per field

// Field colors (exact from asset)
const COL: [string, string] = ['rgb(204,51,51)', 'rgb(34,139,34)'];

// Canvas
const W = 280;
const H = 280;
const CX = W / 2;
const CY = H / 2;

// Translation direction: rightward (angle 0)
const TRANS_VX = (TRANS_DEG_S * PX_PER_DEG) / 1000;  // px/ms
const TRANS_VY = 0;

// ── Rotation: Field 0 = CW (sign −1), Field 1 = CCW (sign +1) ───────────────
const ROT_SIGN: [number, number] = [-1, +1];
const ROT_RAD_MS = (ROT_DEG_S * Math.PI / 180) / 1000;  // rad/ms

interface Dot {
  r:          number;
  theta:      number;
  field:      0 | 1;
  isCoherent: boolean;
  tx:         number;
  ty:         number;
}

function randomAnnular(field: 0 | 1, isCoherent: boolean): Dot {
  const rMin2 = EXCL_R * EXCL_R;
  const rMax2 = (AP_R - DOT_R) * (AP_R - DOT_R);
  const r     = Math.sqrt(rMin2 + Math.random() * (rMax2 - rMin2));
  const theta = Math.random() * 2 * Math.PI;
  return { r, theta, field, isCoherent, tx: 0, ty: 0 };
}

// Respawn on the left side of the aperture (opposite rightward translation)
function respawnFromLeft(dot: Dot) {
  for (let i = 0; i < 20; i++) {
    const r     = EXCL_R + Math.random() * (AP_R - EXCL_R - DOT_R);
    const theta = Math.PI / 2 + Math.random() * Math.PI;  // π/2 .. 3π/2 = left half
    const x     = r * Math.cos(theta);
    const y     = r * Math.sin(theta);
    if (x * x + y * y >= EXCL_R * EXCL_R) {
      dot.r = r; dot.theta = theta; dot.tx = 0; dot.ty = 0;
      return;
    }
  }
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const sf       = 0.222;
  const rInner   = Math.max(2,   0.079 * PX_PER_DEG * sf);
  const rOuter   = Math.max(3.5, (0.079 + 0.119) * PX_PER_DEG * sf);
  const armLen   = Math.max(6,   0.396 * PX_PER_DEG * sf);
  const armThk   = Math.max(0.6, 0.048 * PX_PER_DEG * sf);
  const dotR     = Math.max(1.5, 0.059 * PX_PER_DEG * sf);

  // Ring (filled annulus)
  ctx.beginPath();
  ctx.arc(CX, CY, rOuter, 0, Math.PI * 2);
  ctx.arc(CX, CY, rInner, 0, Math.PI * 2, true);
  ctx.fillStyle = 'white';
  ctx.fill('evenodd');

  // Crosshairs (black)
  ctx.fillStyle = 'black';
  ctx.fillRect(CX - armLen, CY - armThk / 2, armLen * 2, armThk);
  ctx.fillRect(CX - armThk / 2, CY - armLen, armThk, armLen * 2);

  // Centre dot (white)
  ctx.beginPath();
  ctx.arc(CX, CY, dotR, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
}

export default function VRDotsDemo({ cued, swapType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Field 1 (green/CCW) is always the translating field.
    // Cued:   Field 0 appears at t=0, Field 1 appears at t=T_SOLO (delayed onset = cue).
    // Uncued: both fields appear at t=0, no solo phase.
    const translatingField = 1 as const;

    // Trial timing
    const TRANS_START = cued ? T_SOLO + T_PRETRANS : T_PRETRANS;
    const T_TOTAL     = TRANS_START + T_TRANS + T_POST;

    // Initialise dots for both fields
    const dots: Dot[] = [
      ...Array.from({ length: N_PER_FIELD }, (_, i) =>
        randomAnnular(0, i < N_COHERENT)),
      ...Array.from({ length: N_PER_FIELD }, (_, i) =>
        randomAnnular(1, i < N_COHERENT)),
    ];

    let startTime: number | null = null;
    let lastTime:  number | null = null;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t  = (now - startTime) % T_TOTAL;
      const dt = lastTime !== null ? Math.min(now - lastTime, 32) : 0;
      lastTime = now;

      // ── Visibility ────────────────────────────────────────────────────────
      // Cued:   Field 0 from t=0, Field 1 from t=T_SOLO (delayed onset = cue)
      // Uncued: both fields present from t=0, no solo phase
      const f0Visible = true;
      const f1Visible = !cued || t >= T_SOLO;

      // ── Translation window ────────────────────────────────────────────────
      const inTrans = t >= TRANS_START && t < TRANS_START + T_TRANS;
      const swapOn  = inTrans && swapType === 'cm';

      // ── Update dots ───────────────────────────────────────────────────────
      if (dt > 0) {
        for (const dot of dots) {
          const visible = dot.field === 0 ? f0Visible : f1Visible;
          if (!visible) continue;

          // Rotation (always, effective direction may swap on CM swap)
          const effSign = (swapOn && dot.field === translatingField)
            ? -ROT_SIGN[dot.field]   // motion swap: reverse rotation
            : ROT_SIGN[dot.field];
          dot.theta += effSign * ROT_RAD_MS * dt;

          // Translation (only coherent dots in the translating field, during window)
          if (inTrans && dot.field === translatingField && dot.isCoherent) {
            dot.tx += TRANS_VX * dt;
            dot.ty += TRANS_VY * dt;

            // Check if dot has exited aperture; if so respawn from opposite edge
            const px = dot.r * Math.cos(dot.theta) + dot.tx;
            const py = dot.r * Math.sin(dot.theta) + dot.ty;
            if (px * px + py * py > AP_R * AP_R) {
              respawnFromLeft(dot);
            }
          } else if (!inTrans && (dot.tx !== 0 || dot.ty !== 0)) {
            // Absorb translation offset into base polar position so there's no snap-back
            const nx = dot.r * Math.cos(dot.theta) + dot.tx;
            const ny = dot.r * Math.sin(dot.theta) + dot.ty;
            const nr = Math.sqrt(nx * nx + ny * ny);
            // If within aperture, update base position; otherwise respawn
            if (nr >= EXCL_R && nr <= AP_R - DOT_R) {
              dot.r     = nr;
              dot.theta = Math.atan2(ny, nx);
            } else {
              Object.assign(dot, randomAnnular(dot.field, dot.isCoherent));
            }
            dot.tx = 0;
            dot.ty = 0;
          }
        }
      }

      // ── Render ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, AP_R, 0, Math.PI * 2);
      ctx.clip();

      for (const dot of dots) {
        const visible = dot.field === 0 ? f0Visible : f1Visible;
        if (!visible) continue;

        const x = CX + dot.r * Math.cos(dot.theta) + dot.tx;
        const y = CY + dot.r * Math.sin(dot.theta) + dot.ty;
        const dx = x - CX; const dy = y - CY;
        if (dx * dx + dy * dy > AP_R * AP_R) continue;

        // Color: swap fields during CM swap
        const dispField = (swapOn && swapType === 'cm')
          ? (dot.field === 0 ? 1 : 0) as 0 | 1
          : dot.field;
        ctx.fillStyle = COL[dispField];
        ctx.beginPath();
        ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      drawFixation(ctx);

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [cued, swapType]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ display: 'block', borderRadius: 4 }}
    />
  );
}
