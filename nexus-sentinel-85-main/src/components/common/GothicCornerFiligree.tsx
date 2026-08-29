import React from 'react';

interface GothicCornerFiligreeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  opacity?: string;
  variant?: 'arch' | 'relic' | 'runic';
}

export const GothicCornerFiligree: React.FC<GothicCornerFiligreeProps> = ({ 
  className = '',
  size = 'md',
  opacity = 'text-purple-400/80',
  variant = 'arch'
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const sz = sizeMap[size];

  return (
    <div className={`pointer-events-none z-10 ${className}`}>
      {/* Top Left */}
      <svg 
        className={`absolute top-1 left-1 ${sz} ${opacity}`} 
        viewBox="0 0 40 40" 
        fill="none"
      >
        <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 38V14C6 9.58172 9.58172 6 14 6H38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
        <path d="M2 2L14 14" stroke="currentColor" strokeWidth="1" />
        <path d="M2 14C8 14 14 8 14 2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.7" />
        <circle cx="2" cy="2" r="1.75" fill="currentColor" />
        <circle cx="14" cy="14" r="1.5" fill="currentColor" />
        <polygon points="8,8 10,6 8,4 6,6" fill="currentColor" opacity="0.85" />
        <path d="M18 2L2 18" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M8 2V8H2" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Top Right */}
      <svg 
        className={`absolute top-1 right-1 ${sz} ${opacity}`} 
        viewBox="0 0 40 40" 
        fill="none"
      >
        <path d="M38 38V12C38 6.47715 33.5228 2 28 2H2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M34 38V14C34 9.58172 30.4183 6 26 6H2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
        <path d="M38 2L26 14" stroke="currentColor" strokeWidth="1" />
        <path d="M38 14C32 14 26 8 26 2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.7" />
        <circle cx="38" cy="2" r="1.75" fill="currentColor" />
        <circle cx="26" cy="14" r="1.5" fill="currentColor" />
        <polygon points="32,8 34,6 32,4 30,6" fill="currentColor" opacity="0.85" />
        <path d="M22 2L38 18" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M32 2V8H38" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Bottom Left */}
      <svg 
        className={`absolute bottom-1 left-1 ${sz} ${opacity}`} 
        viewBox="0 0 40 40" 
        fill="none"
      >
        <path d="M2 2V28C2 33.5228 6.47715 38 12 38H38" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 2V26C6 30.4183 9.58172 34 14 34H38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
        <path d="M2 38L14 26" stroke="currentColor" strokeWidth="1" />
        <path d="M2 26C8 26 14 32 14 38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.7" />
        <circle cx="2" cy="38" r="1.75" fill="currentColor" />
        <circle cx="14" cy="26" r="1.5" fill="currentColor" />
        <polygon points="8,32 10,34 8,36 6,34" fill="currentColor" opacity="0.85" />
        <path d="M18 38L2 22" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M8 38V32H2" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Bottom Right */}
      <svg 
        className={`absolute bottom-1 right-1 ${sz} ${opacity}`} 
        viewBox="0 0 40 40" 
        fill="none"
      >
        <path d="M38 2V28C38 33.5228 33.5228 38 28 38H2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M34 2V26C34 30.4183 30.4183 34 26 34H2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
        <path d="M38 38L26 26" stroke="currentColor" strokeWidth="1" />
        <path d="M38 26C32 26 26 32 26 38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.7" />
        <circle cx="38" cy="38" r="1.75" fill="currentColor" />
        <circle cx="26" cy="26" r="1.5" fill="currentColor" />
        <polygon points="32,32 34,34 32,36 30,34" fill="currentColor" opacity="0.85" />
        <path d="M22 38L38 22" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M32 38V32H38" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
};
