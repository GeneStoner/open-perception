'use client';

import { useEffect, useRef } from 'react';

// ── Bigger aperture, high density, both fields translate in opposite directions ──
// apertureRadius_deg = 4.5  (vs. 3.5 in DensityDemo)
// dotsPerField       = 1000 (high density)
// Field 0 (red, non-delayed): rotates CW, then translates LEFT during trans phase
// Field 1 (green, delayed):   rotates CCW, then translates RIGHT during trans phase
// 50% coherent (translate in field's coherent direction)
// 50% non-coherent (random one of 8 directions, fixed per dot for stability)

const PX_PER_DEG   = 30;
const AP_R         = 4.5 * PX_PER_DEG;   // 135 px
const EXCL_R       = 1.1 * PX_PER_DEG;   // 33 px
const DOT_R        = Math.max(1, 0.04 * PX_PER_DEG);  // 1.2 px

const ROT_RAD_MS   = (81 * 0.5 * Math.PI / 180) / 1000;
const TRANS_PX_MS  = (2.26 * 0.5 * PX_PER_DEG) / 1000;
const T_TRANS_DEMO = 120;  // displayed translation duration (ms)

const T_SOLO      = 750;   // field 1 hidden for first 750 ms
const T_PRETRANS  = 300;
const T_POST      = 500;
const T_TOTAL     = T_SOLO + T_PRETRANS + T_TRANS_DEMO + T_POST;
const TRANS_START = T_SOLO + T_PRETRANS;

const DOTS_PER_FIELD = 1000;

const S2 = Math.SQRT1_2;
const NC_DIRS: [number, number][] = [
  [ 1,  0], [ S2,  S2], [ 0,  1], [-S2,  S2],
  [-1,  0], [-S2, -S2], [ 0, -1], [ S2, -S2],
];

// Field 0 = red, Field 1 = green
const COL: [string, string] = ['rgb(204,51,51)', 'rgb(34,139,34)'];
// Coherent translation direction per field: field 0 → left (-1), field 1 → right (+1)
const TRANS_SIGN: [number, number] = [-1, +1];
// Rotation direction per field: field 0 CW (-1), field 1 CCW (+1)
const ROT_SIGN: [number, number] = [-1, +1];

const W = 320, H = 320;
const CX = W / 2, CY = H / 2;

interface Dot { x: number; y: number; isCoherent: boolean; ncDirIdx: number; field: 0|1; }

function initDot(field: 0|1, isCoherent: boolean, ncDirIdx: number): Dot {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - DOT_R) * (AP_R - DOT_R);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  return { x: r * Math.cos(θ), y: r * Math.sin(θ), isCoherent, ncDirIdx, field };
}

function respawn(dot: Dot) {
  const r2min = EXCL_R * EXCL_R;
  const r2max = (AP_R - DOT_R) * (AP_R - DOT_R);
  const r     = Math.sqrt(r2min + Math.random() * (r2max - r2min));
  const θ     = Math.random() * 2 * Math.PI;
  dot.x = r * Math.cos(θ); dot.y = r * Math.sin(θ);
}

function checkOOB(dot: Dot) {
  const r2 = dot.x*dot.x + dot.y*dot.y;
  if (r2 > (AP_R-DOT_R)*(AP_R-DOT_R) || r2 < EXCL_R*EXCL_R) respawn(dot);
}

function rotate(dot: Dot, dirSign: number, dt: number) {
  const α = dirSign * ROT_RAD_MS * dt;
  const ca = Math.cos(α), sa = Math.sin(α);
  const nx = dot.x*ca + dot.y*sa;
  const ny = -dot.x*sa + dot.y*ca;
  dot.x = nx; dot.y = ny;
  checkOOB(dot);
}

function drawFixation(ctx: CanvasRenderingContext2D) {
  const sf      = 1.0;
  const outerR  = 1.8   / 2 * sf * PX_PER_DEG;
  const crossHW = 0.375 / 2 * sf * PX_PER_DEG;
  const innerR  = 0.2   / 2 * sf * PX_PER_DEG;

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

function drawDots(ctx: CanvasRenderingContext2D, dots: Dot[], field: 0|1, visible: boolean) {
  if (!visible) return;
  ctx.fillStyle = COL[field];
  ctx.beginPath();
  for (const dot of dots) {
    if (dot.field !== field) continue;
    const px = CX + dot.x, py = CY + dot.y;
    const dx = px-CX, dy = py-CY;
    if (dx*dx + dy*dy > AP_R*AP_R) continue;
    ctx.moveTo(px + DOT_R, py);
    ctx.arc(px, py, DOT_R, 0, Math.PI*2);
  }
  ctx.fill();
}

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const N_COHERENT = Math.floor(DOTS_PER_FIELD / 2);

    const dots: Dot[] = [];
    for (let field = 0 as 0|1; field <= 1; field++) {
      for (let k = 0; k < DOTS_PER_FIELD; k++) {
        const isCoherent = k < N_COHERENT;
        const ncDirIdx   = isCoherent ? 0 : (k - N_COHERENT) % 8;
        dots.push(initDot(field, isCoherent, ncDirIdx));
      }
    }

    let startTime: number|null = null;
    let lastTime:  number|null = null;
    let prevT     = T_TOTAL;
    let rafId: number;

    function frame(now: number) {
      if (!ctx) return;
      if (!startTime) startTime = now;
      const t  = (now - startTime) % T_TOTAL;
      const dt = lastTime !== null ? Math.min(now-lastTime, 32) : 0;
      lastTime = now;

      const f0Vis = true;
      const f1Vis = t >= T_SOLO;

      // At each loop wrap, while field 1 is still hidden, reinit field 1 dots
      if (prevT > t && !f1Vis) {
        for (const dot of dots) {
          if (dot.field === 1) {
            const d = initDot(dot.field, dot.isCoherent, dot.ncDirIdx);
            dot.x = d.x; dot.y = d.y;
          }
        }
      }
      prevT = t;
      const inTrans = t >= TRANS_START && t < TRANS_START + T_TRANS_DEMO;

      if (dt > 0) {
        for (const dot of dots) {
          const visible = dot.field === 0 ? f0Vis : f1Vis;
          if (!visible) continue;

          if (inTrans) {
            if (dot.isCoherent) {
              dot.x += TRANS_SIGN[dot.field] * TRANS_PX_MS * dt;
            } else {
              const [dx, dy] = NC_DIRS[dot.ncDirIdx];
              dot.x += TRANS_PX_MS * dx * dt;
              dot.y += TRANS_PX_MS * dy * dt;
            }
            checkOOB(dot);
          } else {
            rotate(dot, ROT_SIGN[dot.field], dt);
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, AP_R, 0, Math.PI*2); ctx.clip();
      drawDots(ctx, dots, 0, f0Vis);
      drawDots(ctx, dots, 1, f1Vis);
      ctx.restore();

      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <canvas ref={canvasRef} width={W} height={H} style={{ display:'block', borderRadius:4, width:'100%', maxWidth:520, aspectRatio:'1', margin:'0 auto' }} />;
}
