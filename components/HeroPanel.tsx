'use client';

import { useEffect, useRef, useState } from 'react';
import EyeO, { type EyeOHandle } from '@/components/EyeO';
import { VARIANTS } from '@/components/PeekabooVariants';

// Unlock browser audio context on first user interaction (no audible sound)
function unlockAudio() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    ctx.resume().catch(() => {});
  } catch { /* ignore */ }
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown',     unlockAudio);
}

// ── master switch ─────────────────────────────────────────────────────────
const REVEAL_ENABLED = true;
// Keyboard trigger: Option + Shift + O (always works)
// Spontaneous: 20% of visits, max once per 24 hours per browser, never on first session
const PROBABILITY    = 0.20;
const COOLDOWN_MS    = 24 * 60 * 60 * 1000;
const COOLDOWN_KEY   = 'op_reveal';
const FIRST_VISIT_KEY = 'op_visited';

// ── audio file paths ──────────────────────────────────────────────────────
const SND_CREAK_OPEN  = '/assets/creak-open.mp3';  // 4.6s slow creak
const SND_DOOR_SLAM   = '/assets/door-slam.mp3';   // 1.8s slam (trimmed)

// ── timing (ms) ───────────────────────────────────────────────────────────
const OPEN_DUR   = 4600;   // matches creak-open.mp3
const HOLD_DUR   = 3000;   // eyes visible (tweak after viewing movie)
const CLOSE_DUR  = 1000;   // panel reaches shut at slam impact (~1.0s into file)

// ── component ─────────────────────────────────────────────────────────────

type Phase = 'idle' | 'opening' | 'holding' | 'closing';

export default function HeroPanel() {
  const [phase,        setPhase]        = useState<Phase>('idle');
  const [variantIndex, setVariantIndex] = useState<number | null>(null);
  const videoRef          = useRef<HTMLVideoElement>(null);
  const panelRef          = useRef<HTMLDivElement>(null);
  const eyeRef            = useRef<EyeOHandle>(null);
  const runningRef        = useRef(false);
  const creakRef          = useRef<HTMLAudioElement | null>(null);
  const slamRef           = useRef<HTMLAudioElement | null>(null);

  // Directly control video visibility so it's never waiting on React's render cycle
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (phase !== 'idle') {
      v.style.opacity    = '1';
      v.style.transition = 'opacity 0.3s ease';
      v.play().catch(() => {});
    } else {
      v.style.opacity    = '0';
      v.style.transition = 'opacity 0.5s ease';
      v.pause();
      v.currentTime = 0;
    }
  }, [phase]);

  // Preload audio into refs + register unlock listeners
  useEffect(() => {
    const creak = new Audio(SND_CREAK_OPEN);
    const slam  = new Audio(SND_DOOR_SLAM);
    creak.preload = 'auto';
    slam.preload  = 'auto';
    creak.load();
    slam.load();
    creakRef.current = creak;
    slamRef.current  = slam;
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown',     unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown',     unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!REVEAL_ENABLED) return;
    // Respect OS-level reduced-motion preference — skip the panel lift entirely
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tids: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) =>
      tids.push(setTimeout(fn, ms));

    function runReveal() {
      // TESTING: always show a variant, cycling through them
      // TODO: restore to Math.random() < 0.2 after testing
      setVariantIndex(prev => ((prev ?? -1) + 1) % VARIANTS.length);

      // Reuse preloaded audio — avoids download delay on first keyboard trigger
      const creakAudio = creakRef.current ?? new Audio(SND_CREAK_OPEN);
      const slamAudio  = slamRef.current  ?? new Audio(SND_DOOR_SLAM);
      creakAudio.currentTime = 0;
      slamAudio.currentTime  = 0;

      creakAudio.play().catch(() => {});
      setPhase('opening');

      later(() => setPhase('holding'), OPEN_DUR);

      later(() => {
        slamAudio.play().catch(() => {});
        setPhase('closing');
        later(() => eyeRef.current?.triggerCycle(), CLOSE_DUR);
      }, OPEN_DUR + HOLD_DUR);

      later(() => {
        setPhase('idle');
        runningRef.current = false;
      }, OPEN_DUR + HOLD_DUR + CLOSE_DUR);
    }

    // ── keyboard trigger (always available) ──────────────────────────────
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.shiftKey && e.code === 'KeyO') {
        if (runningRef.current) return;
        runningRef.current = true;
        runReveal();
      }
    }
    window.addEventListener('keydown', onKey);

    // ── spontaneous trigger (20%, once per 24h, never on first session) ────
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
    localStorage.setItem(FIRST_VISIT_KEY, '1');   // mark visited from now on
    const last     = localStorage.getItem(COOLDOWN_KEY);
    const eligible = !isFirstVisit && (!last || Date.now() - Number(last) > COOLDOWN_MS);
    if (eligible && Math.random() < PROBABILITY) {
      const wait = 1000 + Math.random() * 2000; // 1–3s after page load
      const tid = setTimeout(() => {
        if (runningRef.current) return;
        runningRef.current = true;
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        runReveal();
      }, wait);
      tids.push(tid);
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      tids.forEach(clearTimeout);
    };
  }, []);

  const isOpen = phase === 'opening' || phase === 'holding';

  const panelTransform = isOpen
    ? 'perspective(700px) rotateX(78deg)'
    : 'perspective(700px) rotateX(0deg)';

  const panelTransition = (() => {
    if (phase === 'opening') return `transform ${OPEN_DUR}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    if (phase === 'closing') return `transform ${CLOSE_DUR}ms cubic-bezier(0.4, 0, 1, 1)`; // ease-in: accelerates into slam
    return 'none';
  })();

  return (
    // position: relative + inline-flex: sized by panel content only.
    // Video is position:absolute (out of flow) so it doesn't affect panel size.
    <div style={{ position: 'relative', display: 'inline-flex' }} aria-hidden="true">

      {/* Video: shown only when no variant is active */}
      <video
        ref={videoRef}
        src="/assets/eyes.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          position:       'absolute',
          top:            0,
          left:           0,
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'center center',
          opacity:        0,   // controlled directly via useEffect
          pointerEvents:  'none',
          display:        variantIndex !== null ? 'none' : 'block',
        }}
      />

      {/* Variant content: shown instead of video when variantIndex is set */}
      {variantIndex !== null && (() => {
        const V = VARIANTS[variantIndex % VARIANTS.length];
        return <V phase={phase} />;
      })()}

      {/* Panel: in-flow (defines container size), rotates on hinge at top */}
      <div
        ref={panelRef}
        style={{
          position:        'relative',   // creates stacking context above video
          background:      '#000',
          padding:         '10px 28px',
          display:         'inline-flex',
          alignItems:      'center',
          transformOrigin: 'top center',
          transform:       panelTransform,
          transition:      panelTransition,
          boxShadow:       isOpen
            ? '0 32px 64px rgba(0,0,0,0.7)'
            : '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <span
          style={{
            color:         'white',
            fontSize:      'clamp(1.8rem, 9vw, 3.9rem)',
            fontWeight:    600,
            letterSpacing: '-0.02em',
            lineHeight:    1,
            display:       'flex',
            alignItems:    'center',
            flexWrap:      'nowrap',
            whiteSpace:    'nowrap',
          }}
        >
          <span>Open Percepti</span>
          <EyeO ref={eyeRef} size="0.82em" />
          <span>n</span>
        </span>
      </div>

    </div>
  );
}
