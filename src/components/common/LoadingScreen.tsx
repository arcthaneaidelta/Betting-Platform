import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const MESSAGES = [
  'Preparing your experience...',
  'Loading live match center...',
  'Organizing your dashboard...',
  'Almost ready...',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      const quickTimer = setTimeout(() => {
        setExiting(true);
        setTimeout(onComplete, 120);
      }, 450);
      return () => clearTimeout(quickTimer);
    }

    const t1 = setTimeout(() => {
      setProgress(42);
      setMsgIndex(1);
    }, 450);
    const t2 = setTimeout(() => {
      setProgress(76);
      setMsgIndex(2);
    }, 980);
    const t3 = setTimeout(() => {
      setProgress(100);
      setMsgIndex(3);
    }, 1480);
    const t4 = setTimeout(() => {
      setExiting(true);
    }, 1820);
    const t5 = setTimeout(() => {
      onComplete();
    }, 2220);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="aurel-loader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-forest-dark text-ivory"
          role="status"
          aria-live="polite"
          aria-label="Loading AUREL Platform"
        >
          {/* Subtle ambient radial light */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(198, 173, 131, 0.11) 0%, rgba(32, 59, 50, 0.35) 38%, rgba(25, 42, 37, 0.96) 75%)',
            }}
          />

          {/* Very faint stadium-inspired architectural SVG geometry */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
            viewBox="0 0 1200 800"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <ellipse cx="600" cy="400" rx="520" ry="280" stroke="#F6F5F0" strokeWidth="1" />
            <ellipse cx="600" cy="400" rx="410" ry="215" stroke="#C6AD83" strokeWidth="1" />
            <ellipse cx="600" cy="400" rx="290" ry="145" stroke="#F6F5F0" strokeWidth="1" />
            <line x1="600" y1="120" x2="600" y2="680" stroke="#F6F5F0" strokeWidth="1" />
            <circle cx="600" cy="400" r="68" stroke="#C6AD83" strokeWidth="1" />
          </svg>

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
            {/* Brand Symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5"
            >
              <svg
                width="54"
                height="54"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="32"
                  height="32"
                  rx="8"
                  stroke="#F6F5F0"
                  strokeWidth="1.2"
                  strokeOpacity="0.28"
                />
                <path
                  d="M18 7L27.5 27H23.2L18 15.6L12.8 27H8.5L18 7Z"
                  stroke="#F6F5F0"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 22.5H22"
                  stroke="#C6AD83"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="18" cy="11.2" r="1.4" fill="#C6AD83" />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-heading text-3xl font-semibold tracking-[0.28em] text-ivory sm:text-4xl">
                AUREL
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.34 }}
              className="mt-2.5 text-[11px] font-medium tracking-[0.24em] text-champagne"
            >
              THE GAME, REIMAGINED.
            </motion.p>

            {/* Thin animated progress indicator */}
            <div className="mt-8 w-52 overflow-hidden rounded-full bg-soft-white/10 h-[2px]">
              <div
                className="h-full rounded-full bg-champagne transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Rotating initialization status */}
            <p className="mt-4 h-5 text-xs font-normal tracking-wide text-sage-muted">
              {MESSAGES[msgIndex]}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
