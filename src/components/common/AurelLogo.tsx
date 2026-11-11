import React from 'react';

interface AurelLogoProps {
  variant?: 'dark' | 'light';
  compact?: boolean;
  className?: string;
}

export const AurelLogo: React.FC<AurelLogoProps> = ({
  variant = 'dark',
  compact = false,
  className = '',
}) => {
  const strokeColor = variant === 'light' ? '#F6F5F0' : '#203B32';
  const accentColor = '#C6AD83';
  const textColor = variant === 'light' ? 'text-ivory' : 'text-forest';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="8"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeOpacity="0.35"
        />
        <path
          d="M18 7L27.5 27H23.2L18 15.6L12.8 27H8.5L18 7Z"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M14 22.5H22"
          stroke={accentColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="18" cy="11.2" r="1.35" fill={accentColor} />
      </svg>
      {!compact && (
        <span
          className={`font-heading text-lg font-semibold tracking-[0.18em] ${textColor}`}
        >
          AUREL
        </span>
      )}
    </div>
  );
};

