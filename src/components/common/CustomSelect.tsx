import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  className = '',
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      setHighlighted(Math.max(0, options.findIndex((o) => o.value === value)));
      return;
    }
    if (!open) return;

    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      onChange(options[highlighted].value);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-charcoal">
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-btn border border-warm-border bg-soft-white px-3.5 text-left text-sm text-charcoal transition-colors hover:border-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      >
        <span className={selectedOption ? 'truncate text-charcoal' : 'truncate text-muted-grey'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 shrink-0 text-muted-grey transition-transform duration-150',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-card border border-warm-border bg-soft-white py-1 shadow-card"
        >
          {options.map((opt, idx) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={clsx(
                  'flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-forest-light font-medium text-forest'
                    : highlighted === idx
                    ? 'bg-ivory text-charcoal'
                    : 'text-charcoal'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0 text-forest" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

