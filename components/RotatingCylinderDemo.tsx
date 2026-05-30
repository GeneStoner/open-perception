'use client';

import { useEffect, useRef } from 'react';

// Four modes: random → single translating → two opposing → rotating cylinder
// All dots white, fill the full square, no circular aperture.
// Cylinder uses a sinusoidal speed profile (max at centre, zero at edges)
// producing the kinetic depth / structure-from-motion percept.

export type CylMode = 'random' | 'single' | 'transparent' | 'cylinder';

const W = 300, H = 300, CX = W / 2, CY = H / 2;

const N            = 380;                // total dots
const DOT_R        = 1.8;               // dot radius (px)
const TRANS_PX_MS  = 0.18;             // translation speed (px/ms)
const RAND_SPEED   = TRANS_PX_MS;
const CYL_V_MAX    = TRANS_PX_MS;      // max speed at cylinder centre
const COL          = 'rgb(210,210,210)';

interface Dot { x: number; y: number; vx: number; vy: number; field: 0|1; }

function randPos(): { x: number; y: number } {
  return {
    x: (Math.random() * 2 - 1) * CX,
    y: (Math.random() * 2 - 1) * CY,
  };
}

function wrapRect(dot: Dot) {
  if (dot.x >  CX) dot.x -= W;
  if (dot.x < -CX) dot.x += W;
  if (dot.y >  CY) dot.y -= H;
  if (dot.y < -CY) dot.y += H;
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const pxDeg   = 30;
  const outerR  = 1.8 / 2 * pxDeg;
  const crossHW = 0.375 / 2 * pxDeg;
  const innerR  = Math.max(crossHW, 0.2 / 2 * pxDeg);
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillRect(CX - outerR, CY - crossHW, outerR * 2, crossHW * 2);
  ctx.fillRect(CX - crossHW, CY - outerR, crossHW * 2, outerR * 2);
  ctx.restore();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, innerR, 0, Math.PI * 2); ctx.fill();
}

export default function RotatingCylinderDemo({ mode }: { mode: CylMode }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots: Dot[] = Array.from({ length: N }, (_, i) => {
      const { x, y } = randPos();
      const θ = Math.random() * 2 * Math.PI;
      return {
        x, y,
        vx: Math.cos(θ) * RAND_SPEED,
        vy: Math.sin(θ) * RAND_SPEED,
        field: i < N / 2 ? 0 : 1,
      };
    });

    let lastT: number | null = null, rafId: number;

    function frame(now: number) {
      const dt = lastT !== null ? Math.min(now - lastT, 32) : 0;
      lastT = now;

      ctx!.fillStyle = '#0a0a0a'; ctx!.fillRect(0, 0, W, H);

      for (const dot of dots) {
        if (mode === 'random') {
          dot.x += dot.vx * dt;
          dot.y += dot.vy * dt;
        } else if (mode === 'single') {
          dot.x += TRANS_PX_MS * dt;
        } else if (mode === 'transparent') {
          dot.x += (dot.field === 0 ? +1 : -1) * TRANS_PX_MS * dt;
        } else {
          // cylinder: sinusoidal speed — fastest at centre, zero at edges
          const sign  = dot.field === 0 ? +1 : -1;
          const speed = CYL_V_MAX * Math.sqrt(Math.max(0, 1 - (dot.x / CX) ** 2));
          dot.x += sign * speed * dt;
        }
        wrapRect(dot);

        ctx!.fillStyle = COL;
        ctx!.beginPath();
        ctx!.arc(CX + dot.x, CY + dot.y, DOT_R, 0, Math.PI * 2);
        ctx!.fill();
      }

      drawFixation(ctx!);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [mode]);

  return (
    <canvas ref={ref} width={W} height={H}
      style={{ display: 'block', borderRadius: 4, width: 'min(100%, 300px)', aspectRatio: '1', margin: '0 auto' }} />
  );
}
