'use client';

/**
 * PeekabooVariants — alternate content for 1-in-5 panel lifts.
 * Each variant receives `phase` so it can animate in sync with the panel.
 * All variants are sized to fill the panel (position:absolute, 100%×100%).
 */

import { useEffect, useRef } from 'react';

type Phase = 'idle' | 'opening' | 'holding' | 'closing';

// ── Shared styles ─────────────────────────────────────────────────────────────
const FILL: React.CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden',
};

// ── Variant 0: Magritte-style clouds ─────────────────────────────────────────
export function VariantClouds({ phase }: { phase: Phase }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || phase === 'idle') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 80;
    const W = canvas.width, H = canvas.height;

    type Puff = { cx: number; cy: number; rx: number; ry: number };
    type Cloud = { puffs: Puff[]; x: number; speed: number; scale: number };

    function makePuffs(scale: number): Puff[] {
      const s = scale;
      return [
        { cx:  0,      cy:  0,    rx: 28*s, ry: 22*s },
        { cx:  24*s,   cy: -10*s, rx: 22*s, ry: 18*s },
        { cx: -20*s,   cy: -8*s,  rx: 18*s, ry: 15*s },
        { cx:  44*s,   cy:  4*s,  rx: 16*s, ry: 13*s },
        { cx: -38*s,   cy:  4*s,  rx: 14*s, ry: 11*s },
        { cx:  10*s,   cy: -20*s, rx: 14*s, ry: 12*s },
      ];
    }

    const clouds: Cloud[] = [
      { x: W * 0.15, speed: 0.18, scale: 0.9,  puffs: makePuffs(0.9)  },
      { x: W * 0.55, speed: 0.12, scale: 1.1,  puffs: makePuffs(1.1)  },
      { x: W * 0.85, speed: 0.22, scale: 0.65, puffs: makePuffs(0.65) },
      { x: W * -0.1, speed: 0.15, scale: 0.8,  puffs: makePuffs(0.8)  },
    ];

    function drawCloud(cloud: Cloud) {
      const { x, puffs } = cloud;
      const cy = H * 0.5;
      puffs.forEach(p => {
        // Shadow layer
        const shadowGrad = ctx!.createRadialGradient(
          x + p.cx, cy + p.cy + p.ry * 0.3, p.rx * 0.1,
          x + p.cx, cy + p.cy + p.ry * 0.6, p.rx * 1.1
        );
        shadowGrad.addColorStop(0, 'rgba(200,210,220,0.0)');
        shadowGrad.addColorStop(1, 'rgba(160,175,195,0.35)');
        ctx!.beginPath();
        ctx!.ellipse(x + p.cx, cy + p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx!.fillStyle = shadowGrad;
        ctx!.fill();

        // Main body
        const mainGrad = ctx!.createRadialGradient(
          x + p.cx, cy + p.cy - p.ry * 0.3, p.rx * 0.05,
          x + p.cx, cy + p.cy, p.rx
        );
        mainGrad.addColorStop(0,   'rgba(255,255,255,1)');
        mainGrad.addColorStop(0.5, 'rgba(248,250,252,0.97)');
        mainGrad.addColorStop(1,   'rgba(220,230,240,0.85)');
        ctx!.beginPath();
        ctx!.ellipse(x + p.cx, cy + p.cy, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx!.fillStyle = mainGrad;
        ctx!.fill();
      });
    }

    let running = true;
    function frame() {
      if (!running) return;

      // Magritte sky gradient — vivid cobalt
      const sky = ctx!.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0,   '#1a5fb4');
      sky.addColorStop(0.5, '#3584e4');
      sky.addColorStop(1,   '#62a0ea');
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, W, H);

      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x - 80 * c.scale > W) c.x = -80 * c.scale;
        drawCloud(c);
      });

      raf.current = requestAnimationFrame(frame);
    }
    frame();
    return () => { running = false; cancelAnimationFrame(raf.current); };
  }, [phase]);

  if (phase === 'idle') return null;
  return (
    <div style={FILL}>
      <canvas ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Variant 1: First-person glasses POV ──────────────────────────────────────
// Swap /assets/eyeglasses-pov.mp4 for real footage when available.
// Falls back to a canvas simulation: a gently drifting outdoor scene
// seen through round glasses with the frame and nose visible.
export function VariantEyeglasses({ phase }: { phase: Phase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf       = useRef<number>(0);
  const t0        = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === 'idle') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 80;
    const W = canvas.width, H = canvas.height;
    t0.current = Date.now();

    let running = true;
    function frame() {
      if (!running) return;
      const t = (Date.now() - t0.current) / 1000;

      // Gentle sway — like someone breathing/walking
      const swayX = Math.sin(t * 0.7)  * 2;
      const swayY = Math.sin(t * 1.1)  * 1.2;

      // Sky gradient (outdoor scene)
      const sky = ctx!.createLinearGradient(0, 0, 0, H * 0.7);
      sky.addColorStop(0, '#3584e4');
      sky.addColorStop(1, '#7bc8f6');
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, W, H);

      // Ground
      ctx!.fillStyle = '#7aab5a';
      ctx!.fillRect(0, H * 0.6, W, H * 0.4);

      // A few cloud puffs in the background
      [[0.2, 0.25], [0.6, 0.18], [0.85, 0.3]].forEach(([fx, fy]) => {
        const cx = W * fx + swayX * 0.5;
        const cy = H * fy + swayY * 0.3;
        const r  = H * 0.18;
        const g  = ctx!.createRadialGradient(cx, cy - r * 0.3, r * 0.05, cx, cy, r);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(1, 'rgba(220,235,250,0.6)');
        ctx!.beginPath(); ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fillStyle = g; ctx!.fill();
      });

      // Vignette to simulate lens edges
      const vig = ctx!.createRadialGradient(W/2 + swayX, H/2 + swayY, W * 0.25, W/2 + swayX, H/2 + swayY, W * 0.7);
      vig.addColorStop(0,   'rgba(0,0,0,0)');
      vig.addColorStop(0.7, 'rgba(0,0,0,0.15)');
      vig.addColorStop(1,   'rgba(0,0,0,0.85)');
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, W, H);

      // Glasses frame overlay
      ctx!.save();
      ctx!.translate(swayX * 0.3, swayY * 0.3);
      const fw = W * 0.48; const fh = H * 0.82;
      const lx = W * 0.25; const rx = W * 0.75; const fy = H * 0.46;
      // frame color
      const fc = '#2a2018';
      ctx!.strokeStyle = fc; ctx!.lineWidth = Math.max(2, H * 0.05);
      // left lens
      ctx!.beginPath(); ctx!.ellipse(lx, fy, fw/2 - 2, fh/2 - 2, 0, 0, Math.PI*2);
      ctx!.stroke();
      // right lens
      ctx!.beginPath(); ctx!.ellipse(rx, fy, fw/2 - 2, fh/2 - 2, 0, 0, Math.PI*2);
      ctx!.stroke();
      // bridge
      ctx!.beginPath();
      ctx!.moveTo(lx + fw/2 - 2, fy - fh*0.08);
      ctx!.quadraticCurveTo(W/2, fy - fh*0.25, rx - fw/2 + 2, fy - fh*0.08);
      ctx!.stroke();
      // nose (bottom of panel)
      ctx!.strokeStyle = '#b0a090'; ctx!.lineWidth = 1.5; ctx!.globalAlpha = 0.4;
      ctx!.beginPath();
      ctx!.moveTo(W/2 - W*0.04, H); ctx!.quadraticCurveTo(W/2, H*0.78, W/2 + W*0.04, H);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
      ctx!.restore();

      raf.current = requestAnimationFrame(frame);
    }
    frame();
    return () => { running = false; cancelAnimationFrame(raf.current); };
  }, [phase]);

  if (phase === 'idle') return null;
  return (
    <div style={FILL}>
      {/* Replace canvas with <video> once eyeglasses-pov.mp4 is available */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Variant 2: Quote display ───────────────────────────────────────────────────
const QUOTES = [
  { text: 'Perception is unconscious inference.', attr: '— Helmholtz' },
  { text: 'Attention is the rarest form of generosity.', attr: '— Simone Weil' },
  { text: 'The eye is not a camera.', attr: '— Marr' },
  { text: 'Perception itself is a kind of controlled hallucination.', attr: '— Anil Seth' },
];
let quoteIndex = 0;

export function VariantQuote({ phase }: { phase: Phase }) {
  if (phase === 'idle') return null;
  const q = QUOTES[quoteIndex % QUOTES.length];
  quoteIndex++;
  return (
    <div style={{
      ...FILL, flexDirection: 'column', gap: 4,
      background: '#0a0a0a',
      animation: 'op-fadein 0.6s ease',
    }}>
      <style>{`@keyframes op-fadein { from { opacity:0 } to { opacity:1 } }`}</style>
      <span style={{ color: '#e8e4dc', fontSize: '0.82em', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.3 }}>
        &ldquo;{q.text}&rdquo;
      </span>
      <span style={{ color: '#888', fontSize: '0.62em', marginTop: 2 }}>{q.attr}</span>
    </div>
  );
}

// ── Variant 3: "Predict this!" ────────────────────────────────────────────────
export function VariantPredictThis({ phase }: { phase: Phase }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  const t0  = useRef(Date.now());

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || phase === 'idle') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = canvas.offsetWidth  || 500;
    canvas.height = canvas.offsetHeight || 80;
    const W = canvas.width, H = canvas.height;
    t0.current = Date.now();

    // Random dots flying in every direction
    const dots = Array.from({ length: 60 }, () => ({
      x: W / 2, y: H / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      r: 2 + Math.random() * 3,
    }));

    let running = true;
    function frame() {
      if (!running) return;
      const elapsed = Date.now() - t0.current;
      ctx!.fillStyle = '#0a0a0a';
      ctx!.fillRect(0, 0, W, H);

      if (elapsed < 1800) {
        // Show quote
        ctx!.fillStyle = '#e8e4dc';
        ctx!.font = `italic ${Math.min(H * 0.28, 15)}px serif`;
        ctx!.textAlign = 'center';
        ctx!.fillText('"We are prediction machines!? Predict this!"', W / 2, H * 0.45);
        ctx!.fillStyle = '#888';
        ctx!.font = `${Math.min(H * 0.18, 10)}px sans-serif`;
        ctx!.fillText('— Gene Stoner', W / 2, H * 0.72);
      } else {
        // Chaos
        dots.forEach(d => {
          d.x += d.vx; d.y += d.vy;
          ctx!.beginPath();
          ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx!.fillStyle = `hsl(${(d.x / W) * 360},70%,70%)`;
          ctx!.fill();
        });
      }
      raf.current = requestAnimationFrame(frame);
    }
    frame();
    return () => { running = false; cancelAnimationFrame(raf.current); };
  }, [phase]);

  if (phase === 'idle') return null;
  return (
    <div style={FILL}>
      <canvas ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Variant 4: Camera flash ───────────────────────────────────────────────────
export function VariantCamera({ phase }: { phase: Phase }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'holding') return;
    // Flash after 1.8s into the hold
    const tid = setTimeout(() => {
      if (!ref.current) return;
      ref.current.style.background = 'white';
      ref.current.style.transition = 'background 0.08s';
      setTimeout(() => {
        if (ref.current) ref.current.style.background = '#0a0a0a';
      }, 120);
    }, 1800);
    return () => clearTimeout(tid);
  }, [phase]);

  if (phase === 'idle') return null;
  return (
    <div ref={ref} style={{ ...FILL, background: '#0a0a0a', flexDirection: 'column', gap: 6 }}>
      {/* Camera SVG */}
      <svg viewBox="0 0 80 56" width="25%" style={{ opacity: 0.85 }}>
        <rect x="4"  y="12" width="72" height="40" rx="5" fill="none" stroke="#e8e4dc" strokeWidth="3" />
        <rect x="28" y="4"  width="24" height="12" rx="3" fill="none" stroke="#e8e4dc" strokeWidth="2.5" />
        <circle cx="40" cy="33" r="13" fill="none" stroke="#e8e4dc" strokeWidth="2.5" />
        <circle cx="40" cy="33" r="7"  fill="none" stroke="#e8e4dc" strokeWidth="2" />
        <circle cx="40" cy="33" r="2"  fill="#e8e4dc" />
        <circle cx="63" cy="18" r="3"  fill="#e8d4a0" />
      </svg>
      <span style={{ color: '#666', fontSize: '0.55em', letterSpacing: '0.1em' }}>YOU ARE BEING OBSERVED</span>
    </div>
  );
}

// ── Variant registry ──────────────────────────────────────────────────────────
export const VARIANTS = [
  VariantClouds,
  VariantEyeglasses,
  VariantQuote,
  VariantPredictThis,
  VariantCamera,
];
