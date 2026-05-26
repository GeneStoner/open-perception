'use client';

import { useEffect, useRef } from 'react';

// Trial-based demo: Stoner & Blanc field-membership swap, no delayed onset.
//
// Pre-trans:  both fields rotating normally (green CW, red CCW)
// Trans onset: every dot flips field membership (color + direction swap).
//   Dots now in field 1 (originally green CW, now red CCW) begin
//   50%-coherent rightward translation.
// Trans end:  translation stops. All dots rotate per their current
//   (swapped) field — green CW, red CCW — restoring counter-rotation
//   with the same color-direction pairing as pre-swap. The underlying
//   dot membership has changed but the surface pattern is preserved.
// Blank: reinit, loop.

const PX_PER_DEG   = 30;
const AP_DEG       = 4.5;
const AP_R         = AP_DEG * PX_PER_DEG;
const EXCL_R       = 1.1 * PX_PER_DEG;
const ROT_RAD_MS   = (81 * Math.PI / 180) / 1000;
const TRANS_PX_MS  = (2.26 * PX_PER_DEG) / 1000;

const APERTURE_AREA_DEG2 = Math.PI * AP_DEG * AP_DEG;

const COL: [string, string]      = ['rgb(90,180,90)', 'rgb(230,110,110)'];
const ROT_SIGN: [number, number] = [-1, +1];
const TRANS_SIGN: [number, number] = [-1, +1];

const TRANSLATING_FIELD: 0 | 1 = 1;

const T_ROTATE      = 1050;
const T_TRANS        = 240;
const T_POST         = 500;
const T_BLANK        = 500;
const TRANS_START    = T_ROTATE;
const TRANS_END      = T_ROTATE + T_TRANS;
const T_BLANK_START  = TRANS_END + T_POST;
const T_TOTAL        = T_BLANK_START + T_BLANK;

const S2 = Math.SQRT1_2;
const NC_DIRS: [number, number][] = [
  [ 1,  0], [ S2,  S2], [ 0,  1], [-S2,  S2],
  [-1,  0], [-S2, -S2], [ 0, -1], [ S2, -S2],
];

const W = 320, H = 320;
const CX = W / 2, CY = H / 2;

interface Dot {
  x: number; y: number;
  field: 0|1;
  originalField: 0|1;
  isCoherent: boolean;
  ncDirIdx: number;
}

function initDot(field: 0|1, isCoherent: boolean, ncDirIdx: number, dotR: number): Dot {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - dotR) * (AP_R - dotR);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  return { x: r * Math.cos(θ), y: r * Math.sin(θ), field, originalField: field, isCoherent, ncDirIdx };
}

function respawn(dot: Dot, dotR: number) {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - dotR) * (AP_R - dotR);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  dot.x = r * Math.cos(θ); dot.y = r * Math.sin(θ);
}

function checkOOB(dot: Dot, dotR: number) {
  const r2 = dot.x*dot.x + dot.y*dot.y;
  if (r2 > (AP_R-dotR)*(AP_R-dotR) || r2 < EXCL_R*EXCL_R) respawn(dot, dotR);
}

function rotate(dot: Dot, dirSign: number, dt: number, dotR: number) {
  const α  = dirSign * ROT_RAD_MS * dt;
  const ca = Math.cos(α), sa = Math.sin(α);
  const nx = dot.x*ca + dot.y*sa;
  const ny = -dot.x*sa + dot.y*ca;
  dot.x = nx; dot.y = ny;
  checkOOB(dot, dotR);
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const outerR  = 1.8   / 2 * PX_PER_DEG;
  const crossHW = 0.375 / 2 * PX_PER_DEG;
  const innerR  = 0.2   / 2 * PX_PER_DEG;
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI*2); ctx.clip();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillRect(CX-outerR, CY-crossHW, outerR*2, crossHW*2);
  ctx.fillRect(CX-crossHW, CY-outerR, crossHW*2, outerR*2);
  ctx.restore();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, Math.max(innerR, crossHW), 0, Math.PI*2); ctx.fill();
}

interface Props {
  density?: number;
  dotRadiusDeg?: number;
  // When true, every dot flips field membership at trans onset (S&B swap).
  // When false, no swap — just normal translation. Default true.
  fieldSwap?: boolean;
}

export default function TransSwapDemo({
  density = 5,
  dotRadiusDeg = 0.04,
  fieldSwap = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dotsPerField = Math.round(density * APERTURE_AREA_DEG2);
    const N_COHERENT   = Math.floor(dotsPerField * 0.5);
    const dotR         = Math.max(1, dotRadiusDeg * PX_PER_DEG);

    const dots: Dot[] = [];
    for (let field = 0 as 0|1; field <= 1; field++) {
      for (let k = 0; k < dotsPerField; k++) {
        const isCoherent = k < N_COHERENT;
        const ncDirIdx   = isCoherent ? 0 : (k - N_COHERENT) % 8;
        dots.push(initDot(field, isCoherent, ncDirIdx, dotR));
      }
    }
    const drawOrder = new Uint16Array(dots.length);
    for (let i = 0; i < drawOrder.length; i++) drawOrder[i] = i;

    let startTime: number | null = null;
    let lastTime:  number | null = null;
    let prevT      = T_TOTAL;
    let swapped    = false;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t  = (now - startTime) % T_TOTAL;
      const dt = lastTime !== null ? Math.min(now - lastTime, 32) : 0;
      lastTime = now;

      const inTrans = t >= TRANS_START && t < TRANS_END;
      const inPost  = t >= TRANS_END && t < T_BLANK_START;
      const inBlank = t >= T_BLANK_START;
      const pastTransOnset = t >= TRANS_START && !inBlank;

      // Reinit at loop wrap (during blank)
      if (prevT > t) {
        swapped = false;
        for (const dot of dots) {
          dot.field = dot.originalField;
          const d = initDot(dot.originalField, dot.isCoherent, dot.ncDirIdx, dotR);
          dot.x = d.x; dot.y = d.y;
        }
      }
      prevT = t;

      // Field-membership swap at trans onset (once per trial, if enabled)
      if (fieldSwap && pastTransOnset && !swapped) {
        for (const dot of dots) {
          dot.field = (1 - dot.field) as 0|1;
        }
        swapped = true;
      }

      // Update positions
      if (dt > 0 && !inBlank) {
        for (const dot of dots) {
          if (inTrans && dot.field === TRANSLATING_FIELD) {
            // 50%-coherent translation
            if (dot.isCoherent) {
              dot.x += TRANS_SIGN[TRANSLATING_FIELD] * TRANS_PX_MS * dt;
            } else {
              const [dx, dy] = NC_DIRS[dot.ncDirIdx];
              dot.x += TRANS_PX_MS * dx * dt;
              dot.y += TRANS_PX_MS * dy * dt;
            }
            checkOOB(dot, dotR);
          } else {
            rotate(dot, ROT_SIGN[dot.field], dt, dotR);
          }
        }
      }

      // Render
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

      if (!inBlank) {
        ctx.save();
        ctx.beginPath(); ctx.arc(CX, CY, AP_R, 0, Math.PI*2); ctx.clip();

        // Per-frame Fisher-Yates shuffle
        for (let i = drawOrder.length - 1; i > 0; i--) {
          const j = (Math.random() * (i + 1)) | 0;
          const tmp = drawOrder[i]; drawOrder[i] = drawOrder[j]; drawOrder[j] = tmp;
        }
        for (let i = 0; i < drawOrder.length; i++) {
          const dot = dots[drawOrder[i]];
          const px = CX + dot.x, py = CY + dot.y;
          const dx = px - CX, dy = py - CY;
          if (dx*dx + dy*dy > AP_R*AP_R) continue;
          ctx.fillStyle = COL[dot.field];
          ctx.beginPath();
          ctx.arc(px, py, dotR, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }

      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [density, dotRadiusDeg, fieldSwap]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', borderRadius: 4, width: '100%', aspectRatio: '1' }} />;
}
