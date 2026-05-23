'use client';

import { useEffect, useRef } from 'react';

// Two counter-rotating dot fields. No delayed onset, no translation.
// If `swap` is true, every SWAP_INTERVAL_MS half of each field's dots flip
// both color and rotation direction (position preserved).

const PX_PER_DEG = 30;
const AP_DEG     = 4.5;
const AP_R       = AP_DEG * PX_PER_DEG;           // 135 px
const EXCL_R     = 1.1 * PX_PER_DEG;              // 33 px
const ROT_RAD_MS = (81 * Math.PI / 180) / 1000;   // experimental 81 °/s

const DEFAULT_DOT_RADIUS_DEG  = 0.04;
const DEFAULT_DENSITY         = 13;               // dots/°² (= exp. 500 condition)
const APERTURE_AREA_DEG2      = Math.PI * AP_DEG * AP_DEG;

// Equiluminant green / red
const COL: [string, string]      = ['rgb(90,180,90)', 'rgb(230,110,110)'];
const ROT_SIGN: [number, number] = [-1, +1];      // field 0 CW, field 1 CCW

const SWAP_INTERVAL_MS = 500;

const W = 320, H = 320;
const CX = W / 2, CY = H / 2;

interface Dot { x: number; y: number; field: 0|1; }

function initDot(field: 0|1, dotR: number): Dot {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - dotR) * (AP_R - dotR);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  return { x: r * Math.cos(θ), y: r * Math.sin(θ), field };
}

function rotate(dot: Dot, dirSign: number, dt: number) {
  const α  = dirSign * ROT_RAD_MS * dt;
  const ca = Math.cos(α), sa = Math.sin(α);
  const nx = dot.x*ca + dot.y*sa;
  const ny = -dot.x*sa + dot.y*ca;
  dot.x = nx; dot.y = ny;
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

function drawDotsShuffled(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  order: Uint16Array,
  dotR: number,
) {
  // In-place Fisher-Yates shuffle so neither field has a consistent z-bias
  for (let i = order.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  for (let i = 0; i < order.length; i++) {
    const dot = dots[order[i]];
    const px = CX + dot.x, py = CY + dot.y;
    const dx = px-CX, dy = py-CY;
    if (dx*dx + dy*dy > AP_R*AP_R) continue;
    ctx.fillStyle = COL[dot.field];
    ctx.beginPath();
    ctx.arc(px, py, dotR, 0, Math.PI*2);
    ctx.fill();
  }
}

// Symmetric exchange: capture each field's roster first, then flip the
// chosen fraction of each. (Doing them sequentially would draw from the
// post-flip field 1, breaking symmetry.) At swapFraction = 1 every dot
// flips simultaneously and the two fields completely exchange identities
// with positions preserved.
function performSwap(dots: Dot[], swapFraction: number) {
  const f0: number[] = [];
  const f1: number[] = [];
  for (let i = 0; i < dots.length; i++) {
    (dots[i].field === 0 ? f0 : f1).push(i);
  }
  for (let i = f0.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = f0[i]; f0[i] = f0[j]; f0[j] = t;
  }
  for (let i = f1.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = f1[i]; f1[i] = f1[j]; f1[j] = t;
  }
  const h0 = Math.floor(f0.length * swapFraction);
  const h1 = Math.floor(f1.length * swapFraction);
  for (let i = 0; i < h0; i++) dots[f0[i]].field = 1;
  for (let i = 0; i < h1; i++) dots[f1[i]].field = 0;
}

interface Props {
  swap?: boolean;
  density?: number;
  dotRadiusDeg?: number;
  // Fraction of each field's dots that flip at each swap event. Default 0.5
  // (symmetric half-exchange). 1.0 = both fields completely exchange identities.
  swapFraction?: number;
  // Time between swap events in ms. Default 500.
  swapIntervalMs?: number;
}

export default function Demo({
  swap = false,
  density = DEFAULT_DENSITY,
  dotRadiusDeg = DEFAULT_DOT_RADIUS_DEG,
  swapFraction = 0.5,
  swapIntervalMs = SWAP_INTERVAL_MS,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dotsPerField = Math.round(density * APERTURE_AREA_DEG2);
    const dotR = Math.max(1, dotRadiusDeg * PX_PER_DEG);

    const dots: Dot[] = [];
    for (let field = 0 as 0|1; field <= 1; field++) {
      for (let k = 0; k < dotsPerField; k++) {
        dots.push(initDot(field, dotR));
      }
    }
    const drawOrder = new Uint16Array(dots.length);
    for (let i = 0; i < drawOrder.length; i++) drawOrder[i] = i;

    let startTime: number | null = null;
    let lastTime:  number | null = null;
    let lastSwapCycle = 0;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t  = now - startTime;
      const dt = lastTime !== null ? Math.min(now - lastTime, 32) : 0;
      lastTime = now;

      if (swap) {
        const cycle = Math.floor(t / swapIntervalMs);
        if (cycle > lastSwapCycle) {
          performSwap(dots, swapFraction);
          lastSwapCycle = cycle;
        }
      }

      if (dt > 0) {
        for (const dot of dots) {
          rotate(dot, ROT_SIGN[dot.field], dt);
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, AP_R, 0, Math.PI*2); ctx.clip();
      drawDotsShuffled(ctx, dots, drawOrder, dotR);
      ctx.restore();

      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [swap, density, dotRadiusDeg, swapFraction, swapIntervalMs]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block', borderRadius: 4, width: '100%', aspectRatio: '1' }} />;
}
