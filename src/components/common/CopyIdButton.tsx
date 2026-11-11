import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyIdButtonProps {
  value: string;
  className?: string;
}

export const CopyIdButton: React.FC<CopyIdButtonProps> = ({ value, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${value}`}
      className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-mono text-xs text-charcoal transition-colors hover:bg-ivory ${className}`}
    >
      <span className="tabular-nums">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3 text-muted-grey" />
      )}
    </button>
  );
};

