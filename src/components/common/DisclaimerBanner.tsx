import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
  dark?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  compact = false,
  dark = false,
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-center text-[11px] ${
        compact ? 'py-2 px-3' : 'py-2.5 px-4'
      } ${
        dark
          ? 'border-t border-soft-white/10 bg-forest-dark text-sage-muted'
          : 'border-t border-warm-border bg-ivory/80 text-muted-grey'
      }`}
    >
      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-champagne" />
      <span>
        Interactive product prototype. All users, events, odds, balances and transactions are simulated.
      </span>
    </div>
  );
};

