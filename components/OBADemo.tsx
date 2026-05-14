'use client';

import { useEffect, useRef } from 'react';

// ── timing (ms, half-speed: all real durations × 2) ─────────────────────────
const T_PRE   = 1500;   // Field B appears    — 750ms real
const T_TRANS = 2100;   // translation starts — 1050ms real
const T_END   = 2300;   // translation ends   — 100ms real shown as 200ms
const T_LOOP  = 3600;   // Field B cycle length (Field A runs continuously)

// ── physics ──────────────────────────────────────────────────────────────────
const ROT_RAD_MS   = (81 * Math.PI / 180) / 1000 * 0.5; // 81°/s at half speed
const TRANS_PX_MS  = 0.09;   // px/ms at half speed
const COHERENT_DIR = 0;      // radians — rightward

// ── stimulus geometry ────────────────────────────────────────────────────────
const N  = 126;
const R  = 148;
const DR = 2.5;

const RED   = '#cc3333';
const GREEN = '#228b22';

function initDots(r: Float32Array, theta: Float32Array) {
  let c = 0;
  while (c < N) {
    const x = (Math.random() * 2 - 1) * R;
    const y = (Math.random() * 2 - 1) * R;
    if (x * x + y * y <= R * R) {
      r[c]     = Math.sqrt(x * x + y * y);
      theta[c] = Math.atan2(y, x);
      c++;
    }
  }
}

function respawnB(
  i: number,
  Br: Float32Array, Btheta: Float32Array,
  Btx: Float32Array, Bty: Float32Array,
  Bvx: Float32Array, Bvy: Float32Array,
) {
  const s  = Math.sqrt(Bvx[i] * Bvx[i] + Bvy[i] * Bvy[i]);
  const ux = -Bvx[i] / s;
  const uy = -Bvy[i] / s;
  for (let a = 0; a < 500; a++) {
    const x = (Math.random() * 2 - 1) * R;
    const y = (Math.random() * 2 - 1) * R;
    if (x * x + y * y <= R * R && x * ux + y * uy >= 0) {
      Br[i]     = Math.sqrt(x * x + y * y);
      Btheta[i] = Math.atan2(y, x);
      Btx[i]    = 0;
      Bty[i]    = 0;
      return;
    }
  }
}

export default function OBADemo() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;

    // Field A: red, CW — runs forever, never reset
    const Ar     = new Float32Array(N);
    const Atheta = new Float32Array(N);
    initDots(Ar, Atheta);

    // Field B: green, CCW — cycles every T_LOOP ms
    const Br     = new Float32Array(N);
    const Btheta = new Float32Array(N);
    const Bvx    = new Float32Array(N);
    const Bvy    = new Float32Array(N);
    const Btx    = new Float32Array(N);
    const Bty    = new Float32Array(N);

    function resetB() {
      initDots(Br, Btheta);
      Btx.fill(0);
      Bty.fill(0);
      for (let i = 0; i < N; i++) {
        const a = i % 2 === 0 ? COHERENT_DIR : Math.random() * Math.PI * 2;
        Bvx[i] = TRANS_PX_MS * Math.cos(a);
        Bvy[i] = TRANS_PX_MS * Math.sin(a);
      }
    }
    resetB();

    let t0: number | null = null;
    let lastLoopIdx = 0;
    let transEnded  = false;
    let prevT       = 0;
    let raf: number;

    function frame(ts: number) {
      if (t0 === null) t0 = ts;
      const rawMs   = ts - t0;
      const loopIdx = Math.floor(rawMs / T_LOOP);
      const t       = rawMs % T_LOOP;
      const dt      = Math.min(t >= prevT ? t - prevT : T_LOOP - prevT + t, 50);

      // New Field B cycle — reset B only, Field A continues uninterrupted
      if (loopIdx !== lastLoopIdx) {
        lastLoopIdx = loopIdx;
        transEnded  = false;
        resetB();
      }
      prevT = t;

      const inTrans = t >= T_TRANS && t < T_END;

      // Fold translation offset into polar coords once, at T_END
      if (!transEnded && t >= T_END) {
        transEnded = true;
        for (let i = 0; i < N; i++) {
          const x   = Br[i] * Math.cos(Btheta[i]) + Btx[i];
          const y   = Br[i] * Math.sin(Btheta[i]) + Bty[i];
          Br[i]     = Math.sqrt(x * x + y * y);
          Btheta[i] = Math.atan2(y, x);
          Btx[i]    = 0;
          Bty[i]    = 0;
        }
      }

      // ── clear + clip ─────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, 320, 320);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.clip();

      // ── Field A: CW rotation, always ─────────────────────────────────────────
      for (let i = 0; i < N; i++) Atheta[i] -= ROT_RAD_MS * dt;

      // ── Field B: CCW rotation + translation cycle ─────────────────────────────
      if (t >= T_PRE) {
        if (inTrans) {
          for (let i = 0; i < N; i++) {
            Btx[i] += Bvx[i] * dt;
            Bty[i] += Bvy[i] * dt;
            const x = Br[i] * Math.cos(Btheta[i]) + Btx[i];
            const y = Br[i] * Math.sin(Btheta[i]) + Bty[i];
            if (x * x + y * y > R * R) {
              respawnB(i, Br, Btheta, Btx, Bty, Bvx, Bvy);
            }
          }
        } else {
          for (let i = 0; i < N; i++) Btheta[i] += ROT_RAD_MS * dt;
        }
      }

      // ── draw Field A (red) ───────────────────────────────────────────────────
      ctx.fillStyle = RED;
      for (let i = 0; i < N; i++) {
        ctx.beginPath();
        ctx.arc(
          cx + Ar[i] * Math.cos(Atheta[i]),
          cy + Ar[i] * Math.sin(Atheta[i]),
          DR, 0, Math.PI * 2,
        );
        ctx.fill();
      }

      // ── draw Field B (green, delayed onset) ──────────────────────────────────
      if (t >= T_PRE) {
        ctx.fillStyle = GREEN;
        for (let i = 0; i < N; i++) {
          const ox = inTrans ? Btx[i] : 0;
          const oy = inTrans ? Bty[i] : 0;
          ctx.beginPath();
          ctx.arc(
            cx + Br[i] * Math.cos(Btheta[i]) + ox,
            cy + Br[i] * Math.sin(Btheta[i]) + oy,
            DR, 0, Math.PI * 2,
          );
          ctx.fill();
        }
      }

      // ── fixation point (bull's-eye + crosshair) ──────────────────────────────
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.fillStyle   = 'rgba(255,255,255,0.85)';
      ctx.lineWidth   = 1;
      // outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.stroke();
      // center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // crosshair lines
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy); ctx.lineTo(cx - 6, cy);
      ctx.moveTo(cx + 6, cy); ctx.lineTo(cx + 9, cy);
      ctx.moveTo(cx, cy - 9); ctx.lineTo(cx, cy - 6);
      ctx.moveTo(cx, cy + 6); ctx.lineTo(cx, cy + 9);
      ctx.stroke();

      ctx.restore();
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={320}
      height={320}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  );
}
