import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAurelStore } from '@/store/useAurelStore';
import { ToastType } from '@/types';

const TOAST_STYLES: Record<
  ToastType,
  { icon: React.FC<{ className?: string }>; border: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    border: 'border-l-4 border-l-success',
    iconColor: 'text-success',
  },
  error: {
    icon: AlertCircle,
    border: 'border-l-4 border-l-error',
    iconColor: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-l-4 border-l-warning',
    iconColor: 'text-warning',
  },
  info: {
    icon: Info,
    border: 'border-l-4 border-l-forest',
    iconColor: 'text-forest',
  },
};

export const ToastContainer: React.FC = () => {
  const toasts = useAurelStore((s) => s.toasts);
  const dismissToast = useAurelStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const cfg = TOAST_STYLES[toast.type];
        const Icon = cfg.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-card border border-warm-border bg-soft-white p-3.5 shadow-elevated transition-all ${cfg.border}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.iconColor}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-charcoal">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-grey">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-muted-grey hover:bg-ivory hover:text-charcoal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

