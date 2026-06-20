import React from 'react';

interface RedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit';
}

export function RedButton({
  children,
  onClick,
  className = '',
  fullWidth = false,
  size = 'md',
  type = 'button',
}: RedButtonProps) {
  const sizes = {
    sm: 'px-5 py-2.5 text-xs',
    md: 'px-7 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        bg-brand-red text-white
        font-futura tracking-[0.12em] uppercase
        rounded-lg
        transition-all duration-200
        hover:bg-brand-red-hover hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
      style={{
        fontFamily: '"Futura PT Medium"',
        letterSpacing: '0.12em',
      }}
    >
      {children}
    </button>
  );
}

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GhostButton({
  children,
  onClick,
  className = '',
  fullWidth = false,
  size = 'md',
}: GhostButtonProps) {
  const sizes = {
    sm: 'px-5 py-2.5 text-xs',
    md: 'px-7 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        bg-transparent text-brand-charcoal
        font-futura tracking-[0.12em] uppercase
        rounded-lg
        border border-brand-charcoal/30
        transition-all duration-200
        hover:border-brand-charcoal/60 hover:scale-[1.02]
        active:scale-[0.98]
        ${className}
      `}
      style={{
        fontFamily: '"Futura PT Medium"',
        letterSpacing: '0.12em',
      }}
    >
      {children}
    </button>
  );
}
