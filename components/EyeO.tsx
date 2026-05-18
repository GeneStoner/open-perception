'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * EyeO — alternates between a plain "O" and an eye.
 *
 * Normal cycle (every 50 s):
 *   fast-close → eye appears → fast-open → lazy blink × 2 → stare 5 s
 *   → fast-close → plain O → fast-open → repeat
 *
 * triggerCycle() (called on panel slam) runs the reveal sequence immediately,
 * cancelling whatever was pending, then resumes the normal 50 s cadence.
 */
export interface EyeOHandle { triggerCycle: () => void; }

const EyeO = forwardRef<EyeOHandle, { size?: string; verticalAlign?: string }>(function EyeO(
  { size = '0.82em', verticalAlign = '-0.10em' },
  ref,
) {
  const [showEye, setShowEye] = useState(false);
  const [lidH,    setLidH]    = useState(0);
  const [lazyLid, setLazyLid] = useState(false);

  const mounted   = useRef(true);
  const activeIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cancel all pending timers
  function cancelAll() {
    activeIds.current.forEach(clearTimeout);
    activeIds.current = [];
  }

  function later(fn: () => void, ms: number) {
    const t = setTimeout(() => { if (mounted.current) fn(); }, ms);
    activeIds.current.push(t);
  }

  // Timing constants
  const FC = 320;
  const FO = 370;
  const LC = 530;
  const LO = 580;

  function lazyBlink(done: () => void) {
    setLazyLid(true);
    setLidH(100);
    later(() => {
      setLidH(0);
      later(done, LO);
    }, LC);
  }

  // Run the reveal sequence once, then schedule the next one after 50 s
  function runReveal() {
    setLazyLid(false);
    setLidH(100);
    later(() => {
      setShowEye(true);
      setLidH(0);
      later(() => {
        lazyBlink(() => {
          later(() => {
            lazyBlink(() => {
              later(() => {
                setLazyLid(false);
                setLidH(100);
                later(() => {
                  setShowEye(false);
                  setLidH(0);
                  // wait 50 s, then reveal again
                  later(runReveal, 50000);
                }, FC);
              }, 5000);
            });
          }, 700);
        });
      }, FO + 200);
    }, FC);
  }

  useImperativeHandle(ref, () => ({
    triggerCycle() {
      if (!mounted.current) return;
      cancelAll();
      runReveal();
    },
  }));

  useEffect(() => {
    mounted.current = true;
    // First reveal after 50 s idle
    later(runReveal, 50000);
    return () => {
      mounted.current = false;
      cancelAll();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeDur = lazyLid ? '0.48s' : '0.28s';
  const openDur  = lazyLid ? '0.52s' : '0.32s';

  return (
    <svg
      viewBox="0 0 100 100"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        verticalAlign,
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

      {/* eye contents */}
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

      {/* eyelid */}
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

      {/* outer ring */}
      <circle cx="50" cy="50" r="44"
        fill="none" stroke="white" strokeWidth="19"
      />
    </svg>
  );
});

export default EyeO;
