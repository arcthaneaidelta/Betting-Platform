import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  trend,
  trendPositive = true,
  icon: Icon,
  accent = false,
  className = '',
}) => {
  return (
    <div
      className={clsx(
        'rounded-card border p-5 transition-all duration-200 hover:shadow-card',
        accent
          ? 'border-forest bg-forest text-ivory'
          : 'border-warm-border bg-soft-white text-charcoal hover:border-sage/50',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={clsx(
            'text-xs font-medium uppercase tracking-wider',
            accent ? 'text-champagne' : 'text-muted-grey'
          )}
        >
          {label}
        </p>
        {Icon && (
          <div
            className={clsx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-btn',
              accent ? 'bg-soft-white/10 text-champagne' : 'bg-forest-light text-forest'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p className="font-heading text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
              accent
                ? 'text-champagne'
                : trendPositive
                ? 'text-success'
                : 'text-error'
            )}
          >
            {trendPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {sublabel && (
        <p
          className={clsx(
            'mt-1.5 text-xs',
            accent ? 'text-sage-muted' : 'text-muted-grey'
          )}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
};

