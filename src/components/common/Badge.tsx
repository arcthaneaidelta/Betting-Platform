import React from 'react';
import { clsx } from 'clsx';

export type BadgeTone =
  | 'success'
  | 'warning'
  | 'error'
  | 'forest'
  | 'champagne'
  | 'neutral'
  | 'live';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}

const TONE_STYLES: Record<BadgeTone, string> = {
  success: 'bg-success-bg text-success border-success/20',
  warning: 'bg-warning-bg text-warning border-warning/25',
  error: 'bg-error-bg text-error border-error/25',
  forest: 'bg-forest-light text-forest border-forest/15',
  champagne: 'bg-champagne-soft text-champagne-dark border-champagne/30',
  neutral: 'bg-ivory text-muted-grey border-warm-border',
  live: 'bg-forest text-ivory border-forest',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  children,
  className = '',
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap',
        TONE_STYLES[tone],
        className
      )}
    >
      {tone === 'live' && (
        <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse" aria-hidden="true" />
      )}
      {children}
    </span>
  );
};

export function statusToBadgeTone(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (['approved', 'won', 'active', 'completed'].includes(s)) return 'success';
  if (['pending', 'open', 'upcoming'].includes(s)) return 'warning';
  if (['rejected', 'lost', 'suspended', 'error'].includes(s)) return 'error';
  if (s === 'live') return 'live';
  if (['cancelled', 'finished'].includes(s)) return 'neutral';
  return 'neutral';
}

