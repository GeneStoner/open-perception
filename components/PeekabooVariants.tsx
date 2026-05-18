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

// ── Variant 0: Drifting clouds ────────────────────────────────────────────────
export function VariantClouds({ phase }: { phase: Phase }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth || 500;
    const H = canvas.offsetHeight || 80;
    canvas.width = W; canvas.height = H;

    // Simple cloud blobs
    type Cloud = { x: number; y: number; r: number; speed: number };
    const clouds: Cloud[] = Array.from({ length: 6 }, (_, i) => ({
      x: (i / 6) * W * 1.4 - W * 0.2,
      y: H * 0.2 + Math.random() * H * 0.6,
      r: 12 + Math.random() * 20,
      speed: 0.15 + Math.random() * 0.2,
    }));

    function drawCloud(x: number, y: number, r: number) {
      ctx!.beginPath();
      ctx!.arc(x,       y,       r,       0, Math.PI * 2);
      ctx!.arc(x + r,   y - r * 0.4, r * 0.75, 0, Math.PI * 2);
      ctx!.arc(x - r,   y - r * 0.3, r * 0.6,  0, Math.PI * 2);
      ctx!.arc(x + r * 1.6, y,   r * 0.5,  0, Math.PI * 2);
      ctx!.fill();
    }

    let visible = phase !== 'idle';
    function frame() {
      if (!visible) return;
      ctx!.fillStyle = '#b8d4e8';
      ctx!.fillRect(0, 0, W, H);
      ctx!.fillStyle = 'rgba(255,255,255,0.92)';
      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x - c.r * 2 > W) c.x = -c.r * 2;
        drawCloud(c.x, c.y, c.r);
      });
      raf.current = requestAnimationFrame(frame);
    }

    if (phase !== 'idle') { visible = true; frame(); }
    return () => { visible = false; cancelAnimationFrame(raf.current); };
  }, [phase]);

  if (phase === 'idle') return null;
  return (
    <div style={FILL}>
      <canvas ref={ref} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ── Variant 1: First-person eyeglasses POV ───────────────────────────────────
export function VariantEyeglasses({ phase }: { phase: Phase }) {
  if (phase === 'idle') return null;
  return (
    <div style={{ ...FILL, background: 'linear-gradient(160deg,#e8e4dc 0%,#d4cfc7 100%)' }}>
      <svg viewBox="0 0 500 80" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        {/* soft blurred world beyond the lenses */}
        <defs>
          <radialGradient id="lens-l" cx="35%" cy="50%">
            <stop offset="0%" stopColor="#f0ede8" />
            <stop offset="70%" stopColor="#ddd8d0" />
            <stop offset="100%" stopColor="#c8c2ba" />
          </radialGradient>
          <radialGradient id="lens-r" cx="65%" cy="50%">
            <stop offset="0%" stopColor="#f0ede8" />
            <stop offset="70%" stopColor="#ddd8d0" />
            <stop offset="100%" stopColor="#c8c2ba" />
          </radialGradient>
          <filter id="blur-lens">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>
        {/* left lens fill */}
        <ellipse cx="170" cy="40" rx="108" ry="34" fill="url(#lens-l)" filter="url(#blur-lens)" opacity="0.6" />
        {/* right lens fill */}
        <ellipse cx="330" cy="40" rx="108" ry="34" fill="url(#lens-r)" filter="url(#blur-lens)" opacity="0.6" />
        {/* frame strokes */}
        <ellipse cx="170" cy="40" rx="108" ry="34" fill="none" stroke="#4a3f35" strokeWidth="3.5" />
        <ellipse cx="330" cy="40" rx="108" ry="34" fill="none" stroke="#4a3f35" strokeWidth="3.5" />
        {/* bridge */}
        <path d="M 278 38 Q 250 32 222 38" fill="none" stroke="#4a3f35" strokeWidth="3" />
        {/* temples (arms going off-screen) */}
        <line x1="62" y1="18" x2="0"   y2="10" stroke="#4a3f35" strokeWidth="3" strokeLinecap="round" />
        <line x1="438" y1="18" x2="500" y2="10" stroke="#4a3f35" strokeWidth="3" strokeLinecap="round" />
        {/* nose bridge suggestion at bottom */}
        <path d="M 235 78 Q 250 68 265 78" fill="none" stroke="#b0a898" strokeWidth="2" opacity="0.5" />
        {/* lens highlight */}
        <ellipse cx="140" cy="28" rx="22" ry="8" fill="white" opacity="0.18" transform="rotate(-15,140,28)" />
        <ellipse cx="300" cy="28" rx="22" ry="8" fill="white" opacity="0.18" transform="rotate(-15,300,28)" />
      </svg>
    </div>
  );
}

// ── Variant 2: Quote display ───────────────────────────────────────────────────
const QUOTES = [
  { text: 'Perception is unconscious inference.', attr: '— Helmholtz' },
  { text: 'Attention is the rarest form of generosity.', attr: '— Simone Weil' },
  { text: 'The eye is not a camera.', attr: '— Marr' },
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
