import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-warm-border bg-soft-white/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest-light text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-heading text-base font-semibold text-charcoal">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-grey">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

