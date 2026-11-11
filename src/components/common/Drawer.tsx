import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  side?: 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  side = 'right',
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const positionClasses =
    side === 'bottom'
      ? 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-card-lg border-t'
      : side === 'left'
      ? 'inset-y-0 left-0 w-full max-w-xs border-r'
      : 'inset-y-0 right-0 w-full max-w-lg border-l';

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-forest-dark/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`fixed z-10 flex flex-col border-warm-border bg-soft-white shadow-elevated ${positionClasses}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-warm-border px-5 py-4">
          <div>
            <h2 className="font-heading text-base font-semibold text-charcoal">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-grey">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-9 w-9 items-center justify-center rounded-btn text-muted-grey hover:bg-ivory hover:text-charcoal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="border-t border-warm-border bg-ivory/60 px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
};

