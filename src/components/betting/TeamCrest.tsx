import React from 'react';

interface TeamCrestProps {
  shortName: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeamCrest: React.FC<TeamCrestProps> = ({
  shortName,
  color = '#203B32',
  size = 'md',
}) => {
  const dims =
    size === 'sm'
      ? 'h-8 w-8 text-[10px]'
      : size === 'lg'
      ? 'h-12 w-12 text-xs'
      : 'h-9 w-9 text-[11px]';

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-btn border border-warm-border font-heading font-semibold tracking-wider text-soft-white shadow-subtle ${dims}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      <span className="relative z-10">{shortName.slice(0, 3)}</span>
      <span
        className="absolute inset-x-1.5 bottom-1 h-[1.5px] rounded-full opacity-75"
        style={{ backgroundColor: '#C6AD83' }}
      />
    </div>
  );
};

