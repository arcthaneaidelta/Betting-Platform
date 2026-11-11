import React, { useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0 bg-forest-dark/55 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-card-lg border border-warm-border bg-soft-white shadow-elevated ${SIZE_CLASSES[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-warm-border px-6 py-4">
          <div>
            <h2 id="modal-title" className="font-heading text-lg font-semibold text-charcoal">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-grey">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-muted-grey transition-colors hover:bg-ivory hover:text-charcoal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-warm-border bg-ivory/50 px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger' | 'warning';
  details?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  details,
  children,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            tone === 'danger'
              ? 'bg-error-bg text-error'
              : tone === 'warning'
              ? 'bg-warning-bg text-warning'
              : 'bg-forest-light text-forest'
          }`}
        >
          {tone === 'primary' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 text-sm text-charcoal">
          <p className="leading-relaxed text-muted-grey">{description}</p>
          {details && details.length > 0 && (
            <dl className="mt-4 space-y-2 rounded-card border border-warm-border bg-ivory/60 p-3.5 text-xs">
              {details.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-grey">{d.label}</dt>
                  <dd className="font-medium text-charcoal tabular-nums">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </Modal>
  );
};

