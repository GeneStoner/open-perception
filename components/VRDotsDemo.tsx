'use client';

import { useEffect, useRef } from 'react';

export type SwapType = 'none' | 'cm';

interface Props {
  cued:     boolean;
  swapType: SwapType;
}

// ── Exact parameters from Exp_StonerBlanc_Ap35_80ms.asset ───────────────────
const PX_PER_DEG     = 30;              // rendering scale
const AP_R           = 3.5 * PX_PER_DEG;   // 105 px aperture radius
const EXCL_R         = 1.1 * PX_PER_DEG;   // 33 px exclusion zone
const DOT_R          = 0.08 * PX_PER_DEG * 0.5;  // ~1.2 px dot radius
const ROT_DEG_S      = 81;             // deg/sec rotation speed
const TRANS_DEG_S    = 2.26;           // deg/sec translation speed
const N_DOTS         = 192;            // dots per field (Ap3.5°)

// Demo timing: translation slowed 5× so viewers can see the event
// (actual = 80 ms; demo = 400 ms)
const DEMO_SCALE     = 5;
const T_DELAYED      = 750;            // ms onset delay (cued condition)
const T_PRETRANS     = 300;            // ms pre-translation rotation
const T_TRANS        = 80 * DEMO_SCALE;    // 400 ms demo (80 ms actual)
const T_POSTTRANS    = 600;
const T_TOTAL        = T_DELAYED + T_PRETRANS + T_TRANS + T_POSTTRANS;

// Swap: entire translation window (CM = color + motion simultaneously)
const SWAP_START     = T_DELAYED + T_PRETRANS;
const SWAP_END       = SWAP_START + T_TRANS;

// Colors: exact from asset
const COL_RED   = 'rgb(204,51,51)';    // {r:0.8, g:0.2, b:0.2}
const COL_GREEN = 'rgb(34,139,34)';    // {r:0.133, g:0.545, b:0.133}
const FIELD_COLS: [string, string] = [COL_RED, COL_GREEN];

// Canvas
const W = 280;
const H = 280;
const CX = W / 2;
const CY = H / 2;

interface Dot {
  r:     number;  // radial distance from centre (px)
  theta: number;  // current angle (rad)
  field: 0 | 1;
  // Translation offset accumulator for the translating field
  tx: number;
  ty: number;
}

function randomAnnularDot(field: 0 | 1): Dot {
  // Uniform random in annular region between EXCL_R and AP_R
  const rMin2 = EXCL_R * EXCL_R;
  const rMax2 = AP_R   * AP_R;
  const r     = Math.sqrt(rMin2 + Math.random() * (rMax2 - rMin2));
  const theta = Math.random() * 2 * Math.PI;
  return { r, theta, field, tx: 0, ty: 0 };
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const scale = 0.222;
  const dotR  = 0.059 * PX_PER_DEG * scale;  // ~0.4 px — scale up to min 2
  const rInner = 0.079 * PX_PER_DEG * scale;
  const rOuter = (0.079 + 0.119) * PX_PER_DEG * scale;
  const armLen = 0.396 * PX_PER_DEG * scale;
  const armThk = Math.max(0.5, 0.048 * PX_PER_DEG * scale);

  const visMin  = 2.5;  // minimum pixel sizes for visibility in demo
  const vDotR   = Math.max(visMin * 0.6, dotR);
  const vRInner = Math.max(visMin * 0.8, rInner);
  const vROuter = Math.max(visMin * 1.8, rOuter);
  const vArm    = Math.max(visMin * 3, armLen);

  ctx.strokeStyle = 'white';
  ctx.fillStyle   = 'white';
  ctx.lineWidth   = armThk;

  // Ring
  ctx.beginPath();
  ctx.arc(CX, CY, vROuter, 0, Math.PI * 2);
  ctx.arc(CX, CY, vRInner, 0, Math.PI * 2, true);
  ctx.fillStyle = 'white';
  ctx.fill('evenodd');

  // Crosshairs (black, drawn before center dot)
  ctx.fillStyle = 'black';
  ctx.fillRect(CX - vArm, CY - armThk / 2, vArm * 2, armThk);
  ctx.fillRect(CX - armThk / 2, CY - vArm, armThk, vArm * 2);

  // Center dot (white, covers crosshair intersection)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(CX, CY, vDotR, 0, Math.PI * 2);
  ctx.fill();
}

export default function VRDotsDemo({ cued, swapType }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Field A = red, rotates CW  (sign = −1)
    // Field B = green, rotates CCW (sign = +1)
    const rotSign: [number, number] = [-1, +1];

    // Translation direction for Field B: rightward
    const transDX = TRANS_DEG_S * PX_PER_DEG / 1000;  // px/ms
    const transDY = 0;

    // Initialise dots for both fields
    const dots: Dot[] = Array.from({ length: N_DOTS * 2 }, (_, i) =>
      randomAnnularDot((i < N_DOTS ? 0 : 1) as 0 | 1),
    );

    let startTime: number | null = null;
    let lastTime:  number | null = null;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t   = (now - startTime) % T_TOTAL;  // cyclic
      const dt  = lastTime !== null ? Math.min(now - lastTime, 32) : 0;
      lastTime  = now;

      // ── Phase logic ───────────────────────────────────────────────────────
      // Field A always rotating from t=0
      // Field B: rotating from t=0 (uncued) or t=T_DELAYED (cued)
      const fieldAActive = true;
      const fieldBActive = cued ? t >= T_DELAYED : true;

      const inTrans  = t >= SWAP_START && t < SWAP_END;
      const swapOn   = inTrans && swapType === 'cm';

      // ── Update ────────────────────────────────────────────────────────────
      const rotRad = (ROT_DEG_S * Math.PI / 180) / 1000;  // rad/ms

      for (const dot of dots) {
        const active = dot.field === 0 ? fieldAActive : fieldBActive;
        if (!active || dt === 0) continue;

        // Rotation (always during active period)
        const effRotSign = (swapOn && swapType === 'cm')
          ? -rotSign[dot.field]   // motion swap: reverse rotation direction
          : rotSign[dot.field];
        dot.theta += effRotSign * rotRad * dt;

        // Translation (Field B only, during trans window)
        if (dot.field === 1 && inTrans) {
          dot.tx += transDX * dt;
          dot.ty += transDY * dt;
        }

        // Reset translation offset after trans window ends
        if (!inTrans && (dot.tx !== 0 || dot.ty !== 0)) {
          dot.tx = 0;
          dot.ty = 0;
        }
      }

      // ── Render ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      // Clip to aperture
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, AP_R, 0, Math.PI * 2);
      ctx.clip();

      for (const dot of dots) {
        const active = dot.field === 0 ? fieldAActive : fieldBActive;
        if (!active) continue;

        const x = CX + dot.r * Math.cos(dot.theta) + dot.tx;
        const y = CY + dot.r * Math.sin(dot.theta) + dot.ty;

        // Skip dots outside aperture (translation may push some out)
        const dx = x - CX; const dy = y - CY;
        if (dx * dx + dy * dy > AP_R * AP_R) continue;

        let col: string;
        if (swapOn && swapType === 'cm') {
          // Color swap: fields exchange colors
          col = FIELD_COLS[dot.field === 0 ? 1 : 0];
        } else {
          col = FIELD_COLS[dot.field];
        }

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.2, DOT_R), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Fixation (always on top)
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
