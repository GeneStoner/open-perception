'use client';

import { useEffect, useRef } from 'react';

interface Props {
  dotsPerField: 63 | 173 | 500 | 1000;
}

// ── Shared parameters (all DensityCompare_* assets) ──────────────────────────
// apertureRadius_deg=3.5, translationDuration_ms=80, delayedOnset_ms=750,
// fixationExclusionRadius_deg=1.1, fixationScaleFactor=1.0 (default)
// Fixation_Controller: outerDiam=1.8°, innerDiam=0.2°, crossThickness=0.375°
const PX_PER_DEG   = 30;
const AP_R         = 3.5 * PX_PER_DEG;   // 105 px
const EXCL_R       = 1.1 * PX_PER_DEG;   // 33 px
const DOT_R        = Math.max(1, 0.04 * PX_PER_DEG);  // 1.2 px

const ROT_RAD_MS   = (81 * 0.5 * Math.PI / 180) / 1000;
const TRANS_PX_MS  = (2.26 * 0.5 * PX_PER_DEG) / 1000;
const T_TRANS_DEMO = 80 * 4;   // 320 ms (4× actual 80 ms)

const T_SOLO      = 750;
const T_PRETRANS  = 300;
const T_POST      = 500;
const T_TOTAL     = T_SOLO + T_PRETRANS + T_TRANS_DEMO + T_POST;

const S2 = Math.SQRT1_2;
const NC_DIRS: [number, number][] = [
  [ 1,  0], [ S2,  S2], [ 0,  1], [-S2,  S2],
  [-1,  0], [-S2, -S2], [ 0, -1], [ S2, -S2],
];

// Field 0 = red (always-on), Field 1 = green (delayed, translates in cued demo)
const COL: [string, string] = ['rgb(204,51,51)', 'rgb(34,139,34)'];

const W = 260, H = 260;
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

// ── Fixation: white disc + black crosshair + white center dot ────────────────
// fixationScaleFactor=1.0: outerDiam=1.8°, crossThickness=0.375°, innerDiam=0.2°
function drawFixation(ctx: CanvasRenderingContext2D) {
  const sf      = 1.0;
  const outerR  = 1.8   / 2 * sf * PX_PER_DEG;  // 27 px
  const crossHW = 0.375 / 2 * sf * PX_PER_DEG;  // 5.6 px
  const innerR  = 0.2   / 2 * sf * PX_PER_DEG;  // 3 px

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

// Batch-draw all dots of one color for performance at high dot counts
function drawDots(ctx: CanvasRenderingContext2D, dots: Dot[], field: 0|1, f0Vis: boolean, f1Vis: boolean) {
  const visible = field === 0 ? f0Vis : f1Vis;
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

export default function DensityDemo({ dotsPerField }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Cued: field 1 (green) delayed-onset and translates
    const TRANS_FIELD = 1 as const;
    const rotSign: [number,number] = [-1, +1]; // field 0=CW, field 1=CCW
    const TRANS_START = T_SOLO + T_PRETRANS;
    const N_COHERENT  = Math.floor(dotsPerField / 2);

    const dots: Dot[] = [];
    for (let field = 0 as 0|1; field <= 1; field++) {
      for (let k = 0; k < dotsPerField; k++) {
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

      // CUED: field 0 always-on, field 1 delayed-onset (appears at T_SOLO)
      const f0Vis = true;
      const f1Vis = t >= T_SOLO;

      // At each trial wrap, reinitialize the translating field while it's hidden
      if (prevT > t && !f1Vis) {
        for (const dot of dots) {
          if (dot.field === TRANS_FIELD) {
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

          if (inTrans && dot.field === TRANS_FIELD) {
            if (dot.isCoherent) {
              dot.x += TRANS_PX_MS * dt;
            } else {
              const [dx, dy] = NC_DIRS[dot.ncDirIdx];
              dot.x += TRANS_PX_MS * dx * dt;
              dot.y += TRANS_PX_MS * dy * dt;
            }
            checkOOB(dot);
          } else {
            rotate(dot, rotSign[dot.field], dt);
          }
        }
      }

      // Render — batch by field color for performance
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.beginPath(); ctx.arc(CX, CY, AP_R, 0, Math.PI*2); ctx.clip();
      drawDots(ctx, dots, 0, f0Vis, f1Vis);
      drawDots(ctx, dots, 1, f0Vis, f1Vis);
      ctx.restore();

      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [dotsPerField]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ display:'block', borderRadius:4, width:'100%', aspectRatio:'1' }} />;
}
