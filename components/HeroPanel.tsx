'use client';

import { useEffect, useRef, useState } from 'react';
import EyeO, { type EyeOHandle } from '@/components/EyeO';

// Unlock browser audio on first user interaction so the creak always plays
function unlockAudio() {
  const silent = new Audio();
  silent.play().catch(() => {});
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown',     unlockAudio);
}

// ── master switch ─────────────────────────────────────────────────────────
const REVEAL_ENABLED = true;
// Keyboard trigger: Option + Shift + O (always works)
// Spontaneous: 15% of visits, max once per 24 hours per browser
const PROBABILITY  = 0.15;
const COOLDOWN_MS  = 24 * 60 * 60 * 1000;
const COOLDOWN_KEY = 'op_reveal';

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
  const [phase, setPhase] = useState<Phase>('idle');
  const videoRef          = useRef<HTMLVideoElement>(null);
  const panelRef          = useRef<HTMLDivElement>(null);
  const eyeRef            = useRef<EyeOHandle>(null);
  const runningRef        = useRef(false);

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

  // Preload audio + register unlock listeners
  useEffect(() => {
    const creak = new Audio(SND_CREAK_OPEN);
    const slam  = new Audio(SND_DOOR_SLAM);
    creak.preload = 'auto';
    slam.preload  = 'auto';
    creak.load();
    slam.load();
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown',     unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown',     unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!REVEAL_ENABLED) return;

    const tids: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) =>
      tids.push(setTimeout(fn, ms));

    function runReveal() {
      // Fresh elements each time — files are in browser cache after first load
      const creakAudio = new Audio(SND_CREAK_OPEN);
      const slamAudio  = new Audio(SND_DOOR_SLAM);

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

    // ── spontaneous trigger (15%, once per 24h) ───────────────────────────
    const last = localStorage.getItem(COOLDOWN_KEY);
    const eligible = !last || Date.now() - Number(last) > COOLDOWN_MS;
    if (eligible && Math.random() < PROBABILITY) {
      const wait = 3000 + Math.random() * 4000; // 3–7s after page load
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
    <div style={{ position: 'relative', display: 'inline-flex' }}>

      {/* Video: absolutely fills the panel area, rendered below (DOM first) */}
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
        }}
      />

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
            fontSize:      '3.9rem',
            fontWeight:    600,
            letterSpacing: '-0.02em',
            lineHeight:    1,
            display:       'flex',
            alignItems:    'center',
          }}
        >
          <EyeO ref={eyeRef} />
          <span>pen Perception</span>
        </span>
      </div>

    </div>
  );
}
