'use client';

import { useEffect, useRef } from 'react';

// Four modes illustrating the progression from noise to 3D cylinder:
//   random      — incoherent, no structure
//   single      — one coherently rotating field
//   transparent — two counter-rotating fields (transparent motion)
//   cylinder    — same two fields with sinusoidal speed profile → kinetic depth

export type CylMode = 'random' | 'single' | 'transparent' | 'cylinder';

const PX_PER_DEG = 30;
const AP_R       = 4.5 * PX_PER_DEG;       // 135 px aperture radius
const ROT_RAD_MS = (81 * Math.PI / 180) / 1000;
const CYL_V_MAX  = AP_R * ROT_RAD_MS * 1.8; // max cylinder surface speed

const N  = 280;
const DR = Math.max(1.5, 0.04 * PX_PER_DEG);

const COL: [string, string] = ['rgb(90,180,90)', 'rgb(230,110,110)'];

const W = 260, H = 260, CX = W / 2, CY = H / 2;

interface Dot { x: number; y: number; vx: number; vy: number; field: 0|1; }

function randInAperture(): { x: number; y: number } {
  for (;;) {
    const x = (Math.random() * 2 - 1) * AP_R;
    const y = (Math.random() * 2 - 1) * AP_R;
    if (x*x + y*y < AP_R*AP_R) return { x, y };
  }
}

function rotDot(dot: Dot, sign: number, dt: number) {
  const a  = sign * ROT_RAD_MS * dt;
  const ca = Math.cos(a), sa = Math.sin(a);
  const nx = dot.x*ca + dot.y*sa;
  const ny = -dot.x*sa + dot.y*ca;
  dot.x = nx; dot.y = ny;
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const outerR  = 1.8/2 * PX_PER_DEG;
  const crossHW = 0.375/2 * PX_PER_DEG;
  const innerR  = Math.max(crossHW, 0.2/2 * PX_PER_DEG);
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI*2); ctx.clip();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, outerR, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillRect(CX-outerR, CY-crossHW, outerR*2, crossHW*2);
  ctx.fillRect(CX-crossHW, CY-outerR, crossHW*2, outerR*2);
  ctx.restore();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(CX, CY, innerR, 0, Math.PI*2); ctx.fill();
}

export default function RotatingCylinderDemo({ mode }: { mode: CylMode }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dots: Dot[] = Array.from({ length: N }, (_, i) => {
      const { x, y } = randInAperture();
      const θ = Math.random() * 2 * Math.PI;
      const spd = (0.5 + Math.random() * 0.5) * AP_R * ROT_RAD_MS;
      return { x, y, vx: Math.cos(θ)*spd, vy: Math.sin(θ)*spd, field: i < N/2 ? 0 : 1 };
    });

    let lastT: number|null = null, rafId: number;

    function frame(now: number) {
      const dt = lastT !== null ? Math.min(now - lastT, 32) : 0;
      lastT = now;

      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = '#0a0a0a'; ctx!.fillRect(0, 0, W, H);
      ctx!.save();
      ctx!.beginPath(); ctx!.arc(CX, CY, AP_R, 0, Math.PI*2); ctx!.clip();

      for (const dot of dots) {
        if (mode === 'random') {
          dot.x += dot.vx * dt;
          dot.y += dot.vy * dt;
          if (dot.x*dot.x + dot.y*dot.y > AP_R*AP_R) {
            const p = randInAperture(); dot.x = p.x; dot.y = p.y;
          }
        } else if (mode === 'single') {
          rotDot(dot, -1, dt);  // all CCW
        } else if (mode === 'transparent') {
          rotDot(dot, dot.field === 0 ? -1 : +1, dt);
        } else {
          // cylinder: sinusoidal speed profile — slower at edges, faster at centre
          const sign  = dot.field === 0 ? +1 : -1;
          const speed = CYL_V_MAX * Math.sqrt(Math.max(0, 1 - (dot.x / AP_R) ** 2));
          dot.x += sign * speed * dt;
          // wrap horizontally; respawn if new position outside aperture circle
          if (Math.abs(dot.x) > AP_R) {
            dot.x = -sign * (AP_R - 1);  // enter from opposite edge
            if (dot.x*dot.x + dot.y*dot.y > AP_R*AP_R) {
              const p = randInAperture(); dot.x = p.x; dot.y = p.y;
            }
          }
        }

        const px = CX + dot.x, py = CY + dot.y;
        ctx!.fillStyle = COL[dot.field];
        ctx!.beginPath(); ctx!.arc(px, py, DR, 0, Math.PI*2); ctx!.fill();
      }

      ctx!.restore();
      drawFixation(ctx!);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [mode]);

  return (
    <canvas ref={ref} width={W} height={H}
      style={{ display:'block', borderRadius:4, width:'min(100%,260px)', aspectRatio:'1', margin:'0 auto' }} />
  );
}
