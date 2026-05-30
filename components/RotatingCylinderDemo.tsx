'use client';

import { useEffect, useRef } from 'react';

// Four modes: random → single translating → two opposing → rotating cylinder
// All dots white, fill the full square, no circular aperture.
// Cylinder uses a sinusoidal speed profile (max at centre, zero at edges)
// producing the kinetic depth / structure-from-motion percept.

export type CylMode = 'random' | 'single' | 'transparent' | 'cylinder' | 'transition';

const W = 300, H = 300, CX = W / 2, CY = H / 2;

const N            = 380;
const DOT_R        = 1.8;
const TRANS_PX_MS  = 0.18;
const RAND_SPEED   = TRANS_PX_MS;
const CYL_V_MAX    = TRANS_PX_MS;
const COL          = 'rgb(210,210,210)';

// Transition: 52s cycle (13s per state).
// Each state: 55% hold (stable percept) then 45% smoothstep blend to next.
// ~7s stable, ~6s morphing.
const CYCLE_MS   = 52000;
const HOLD_FRAC  = 0.55;
const LERP_RATE  = 0.015; // fast enough to track the smoothly-moving target

// Returns a phase in [0,4] that has long flat plateaus + smooth transitions
function smoothedPhase(raw: number): number {
  const state = Math.floor(raw);
  const frac  = raw - state;
  let t: number;
  if (frac < HOLD_FRAC) {
    t = 0;
  } else {
    const s = (frac - HOLD_FRAC) / (1 - HOLD_FRAC); // 0→1
    t = s * s * (3 - 2 * s);                          // smoothstep
  }
  return state + t;
}

interface Dot {
  x: number; y: number;
  vx: number; vy: number;       // current (actual) velocity
  rvx: number; rvy: number;     // assigned random velocity (state 0 target)
  field: 0|1;
}

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
      const rvx = Math.cos(θ) * RAND_SPEED;
      const rvy = Math.sin(θ) * RAND_SPEED;
      return { x, y, vx: rvx, vy: rvy, rvx, rvy, field: i < N / 2 ? 0 : 1 };
    });

    let lastT: number | null = null, startT: number | null = null, rafId: number;

    function frame(now: number) {
      if (!startT) startT = now;
      const dt = lastT !== null ? Math.min(now - lastT, 32) : 0;
      lastT = now;

      ctx!.fillStyle = '#0a0a0a'; ctx!.fillRect(0, 0, W, H);

      const rawPhase = mode === 'transition'
        ? ((now - startT) % CYCLE_MS) / CYCLE_MS * 4
        : 0;
      const sp = mode === 'transition' ? smoothedPhase(rawPhase) : 0;

      // Target velocity for a given state index
      function stateTarget(s: number, dot: Dot): { vx: number; vy: number } {
        const si = ((Math.round(s)) % 4 + 4) % 4;
        if (si === 0) return { vx: dot.rvx, vy: dot.rvy };
        if (si === 1) return { vx: TRANS_PX_MS, vy: 0 };
        if (si === 2) return { vx: (dot.field === 0 ? +1 : -1) * TRANS_PX_MS, vy: 0 };
        const speed = CYL_V_MAX * Math.sqrt(Math.max(0, 1 - (dot.x / CX) ** 2));
        return { vx: (dot.field === 0 ? +1 : -1) * speed, vy: 0 };
      }

      for (const dot of dots) {
        if (mode === 'transition') {
          // Blend between current and next state targets using smoothed phase
          const stA  = Math.floor(sp) % 4;
          const stB  = (stA + 1) % 4;
          const blend = sp - Math.floor(sp);
          const tA = stateTarget(stA, dot);
          const tB = stateTarget(stB, dot);
          const tvx = tA.vx * (1 - blend) + tB.vx * blend;
          const tvy = tA.vy * (1 - blend) + tB.vy * blend;
          dot.vx += (tvx - dot.vx) * LERP_RATE * dt;
          dot.vy += (tvy - dot.vy) * LERP_RATE * dt;
          dot.x += dot.vx * dt;
          dot.y += dot.vy * dt;
        } else if (mode === 'random') {
          dot.x += dot.rvx * dt;
          dot.y += dot.rvy * dt;
        } else if (mode === 'single') {
          dot.x += TRANS_PX_MS * dt;
        } else if (mode === 'transparent') {
          dot.x += (dot.field === 0 ? +1 : -1) * TRANS_PX_MS * dt;
        } else {
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
