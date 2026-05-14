'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * EyeO — alternates between a plain "O" and an eye.
 *
 * Cycle:
 *   Plain O (50 s)
 *   → fast-close → eye appears → fast-open
 *   → lazy blink × 2
 *   → stare 5 s
 *   → fast-close → plain O → fast-open
 *   → repeat
 */
export default function EyeO({ size = '0.82em' }: { size?: string }) {
  const [showEye,  setShowEye]  = useState(false);
  const [lidH,     setLidH]     = useState(0);      // 0 = open, 100 = closed
  const [lazyLid,  setLazyLid]  = useState(false);  // true → slow blink transitions

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const tids: ReturnType<typeof setTimeout>[] = [];

    function later(fn: () => void, ms: number) {
      const t = setTimeout(() => { if (mounted.current) fn(); }, ms);
      tids.push(t);
    }

    // Timing constants
    const FC = 320;   // fast close wait (280 ms anim + buffer)
    const FO = 370;   // fast open wait  (320 ms anim + buffer)
    const LC = 530;   // lazy close wait (480 ms anim + buffer)
    const LO = 580;   // lazy open wait  (520 ms anim + buffer)

    function lazyBlink(done: () => void) {
      setLazyLid(true);
      setLidH(100);
      later(() => {
        setLidH(0);
        later(done, LO);
      }, LC);
    }

    function cycle() {
      // ── Phase A: plain O for 50 s ─────────────────────────────────────────
      later(() => {
        // fast-close over plain O
        setLazyLid(false);
        setLidH(100);
        later(() => {
          setShowEye(true);    // swap to eye while lid is shut
          setLidH(0);          // fast-open to reveal eye

          // small pause so eye is seen before first blink
          later(() => {
            // lazy blink 1
            lazyBlink(() => {
              // pause between blinks
              later(() => {
                // lazy blink 2
                lazyBlink(() => {
                  // 5-second stare
                  later(() => {
                    // fast-close over eye
                    setLazyLid(false);
                    setLidH(100);
                    later(() => {
                      setShowEye(false);  // swap back to plain O
                      setLidH(0);         // fast-open to reveal O
                      later(cycle, FO);   // restart
                    }, FC);
                  }, 5000);
                });
              }, 700);
            });
          }, FO + 200);

        }, FC);
      }, 50000);
    }

    cycle();

    return () => {
      mounted.current = false;
      tids.forEach(clearTimeout);
    };
  }, []);

  const closeDur = lazyLid ? '0.48s' : '0.28s';
  const openDur  = lazyLid ? '0.52s' : '0.32s';

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        verticalAlign: '-0.10em',
        overflow: 'visible',
      }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="eye-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>

        <radialGradient id="iris-grad" cx="42%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#b8e4f9" />
          <stop offset="45%"  stopColor="#4ab0e8" />
          <stop offset="100%" stopColor="#1a6fa8" />
        </radialGradient>

        <radialGradient id="pupil-grad" cx="45%" cy="40%" r="65%">
          <stop offset="0%"   stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      {/* ── eye contents ─────────────────────────────────────────────────────── */}
      <g clipPath="url(#eye-clip)" style={{ opacity: showEye ? 1 : 0 }}>
        <ellipse cx="50" cy="50" rx="44" ry="44" fill="#efe9dc" />
        <circle cx="50" cy="50" r="22" fill="url(#iris-grad)" />
        {Array.from({ length: 10 }, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return (
            <line key={k}
              x1={50 + 11 * Math.cos(a)} y1={50 + 11 * Math.sin(a)}
              x2={50 + 21 * Math.cos(a)} y2={50 + 21 * Math.sin(a)}
              stroke="#0d4a72" strokeWidth="0.8" opacity="0.45"
            />
          );
        })}
        <circle cx="50" cy="50" r="12" fill="url(#pupil-grad)" />
        <circle cx="56" cy="43" r="3.8" fill="white" opacity="0.85" />
        <circle cx="45" cy="47" r="1.8" fill="white" opacity="0.4"  />
        <ellipse cx="50" cy="88" rx="44" ry="14" fill="#c8b89a" opacity="0.35" />
      </g>

      {/* ── eyelid ───────────────────────────────────────────────────────────── */}
      <g clipPath="url(#eye-clip)">
        <rect
          x="6" y="6" width="88" height="92"
          fill="#000"
          style={{
            transformBox:    'fill-box',
            transformOrigin: 'top',
            transform:  `scaleY(${lidH / 100})`,
            transition: lidH > 0
              ? `transform ${closeDur} ease-in`
              : `transform ${openDur} ease-out`,
          }}
        />
      </g>

      {/* ── outer ring (the "O" stroke) ──────────────────────────────────────── */}
      <circle cx="50" cy="50" r="44"
        fill="none" stroke="white" strokeWidth="19"
      />
    </svg>
  );
}
