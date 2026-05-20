'use client';

import { useEffect, useRef } from 'react';

// ── Bigger aperture, high density, both fields translate in opposite directions ──
// Field 0 (green): rotates CW, translates LEFT during trans phase
// Field 1 (red):   rotates CCW, translates RIGHT during trans phase
// The `delayedField` prop selects which field is hidden until T_SOLO.
// 50% coherent / 50% non-coherent (8 random directions, fixed per dot).

const PX_PER_DEG   = 30;
const AP_R         = 4.5 * PX_PER_DEG;   // 135 px
const EXCL_R       = 1.1 * PX_PER_DEG;   // 33 px
const DOT_R        = Math.max(1, 0.04 * PX_PER_DEG);  // 1.2 px

const ROT_RAD_MS   = (81 * 0.5 * Math.PI / 180) / 1000;
const TRANS_PX_MS  = (2.26 * 0.5 * PX_PER_DEG) / 1000;
const T_TRANS_DEMO = 160;

const T_SOLO      = 750;
const T_PRETRANS  = 300;
const T_POST      = 500;
const T_BLANK     = 500;  // inter-trial blank — both fields invisible
const T_BLANK_START = T_SOLO + T_PRETRANS + T_TRANS_DEMO + T_POST;
const T_TOTAL     = T_BLANK_START + T_BLANK;
const TRANS_START = T_SOLO + T_PRETRANS;

const DOTS_PER_FIELD = 1000;

const S2 = Math.SQRT1_2;
const NC_DIRS: [number, number][] = [
  [ 1,  0], [ S2,  S2], [ 0,  1], [-S2,  S2],
  [-1,  0], [-S2, -S2], [ 0, -1], [ S2, -S2],
];

// Field 0 = green, Field 1 = red.
// Approximately equiluminant (Rec. 709 luminance ~150 for both) to avoid
// the brighter color being perceived as "in front" regardless of pixel order.
const COL: [string, string] = ['rgb(90,180,90)', 'rgb(230,110,110)'];
// Only one field translates (same in both demos). The other field keeps rotating.
const TRANSLATING_FIELD: 0 | 1 = 1;
// Coherent translation per field: field 0 → left, field 1 → right
const TRANS_SIGN: [number, number] = [-1, +1];
// Rotation per field: field 0 CW, field 1 CCW
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

// Per-frame randomized draw order eliminates any consistent z-bias between
// fields. We can no longer batch by color (a single path fill has no
// internal ordering), so every visible dot gets its own beginPath/fill.
// At ~2000 dots this is well within Canvas2D's budget on iPad Safari.
function drawDotsShuffled(
  ctx: CanvasRenderingContext2D,
  dots: Dot[],
  order: Uint16Array,
  f0Vis: boolean,
  f1Vis: boolean,
) {
  // In-place Fisher-Yates shuffle of the index buffer
  for (let i = order.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
  }
  for (let i = 0; i < order.length; i++) {
    const dot = dots[order[i]];
    const visible = dot.field === 0 ? f0Vis : f1Vis;
    if (!visible) continue;
    const px = CX + dot.x, py = CY + dot.y;
    const dx = px-CX, dy = py-CY;
    if (dx*dx + dy*dy > AP_R*AP_R) continue;
    ctx.fillStyle = COL[dot.field];
    ctx.beginPath();
    ctx.arc(px, py, DOT_R, 0, Math.PI*2);
    ctx.fill();
  }
}

interface Props {
  delayedField: 0 | 1;
}

export default function Demo({ delayedField }: Props) {
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
    const drawOrder = new Uint16Array(dots.length);
    for (let i = 0; i < drawOrder.length; i++) drawOrder[i] = i;

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

      const inBlank       = t >= T_BLANK_START;
      const delayedVis    = t >= T_SOLO && !inBlank;
      const nonDelayedVis = !inBlank;
      const f0Vis = delayedField === 0 ? delayedVis : nonDelayedVis;
      const f1Vis = delayedField === 1 ? delayedVis : nonDelayedVis;

      // Reinit all dots at the loop wrap. Both fields were invisible during
      // the preceding blank, so jumping positions doesn't show.
      if (prevT > t) {
        for (const dot of dots) {
          const d = initDot(dot.field, dot.isCoherent, dot.ncDirIdx);
          dot.x = d.x; dot.y = d.y;
        }
      }
      prevT = t;
      const inTrans = t >= TRANS_START && t < TRANS_START + T_TRANS_DEMO;

      if (dt > 0) {
        for (const dot of dots) {
          const visible = dot.field === 0 ? f0Vis : f1Vis;
          if (!visible) continue;

          if (inTrans && dot.field === TRANSLATING_FIELD) {
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
      drawDotsShuffled(ctx, dots, drawOrder, f0Vis, f1Vis);
      ctx.restore();

      drawFixation(ctx);
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [delayedField]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ display:'block', borderRadius:4, width:'100%', aspectRatio:'1' }} />;
}
