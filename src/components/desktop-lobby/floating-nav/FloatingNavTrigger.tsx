import type { ReactNode } from 'react';
import './FloatingNavTrigger.css';

export type FloatingNavTriggerKind = 'floors' | 'rooms';

type Props = {
  kind: FloatingNavTriggerKind;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function ElevatorGlyph() {
  return (
    <svg className="floating-nav-trigger__glyph" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="elev-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="42%" stopColor="#d8d8d8" />
          <stop offset="100%" stopColor="#a8a8a8" />
        </linearGradient>
        <linearGradient id="elev-red" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#EB1C24" stopOpacity="0.95" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect x="9" y="4" width="14" height="24" rx="2.5" fill="url(#elev-chrome)" stroke="rgba(255,255,255,0.9)" strokeWidth="0.75" />
      <rect x="11" y="7" width="10" height="8" rx="1" fill="rgba(255,255,255,0.55)" />
      <rect x="11" y="17" width="10" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
      <path d="M16 10 L13.5 13 H18.5 Z" fill="#EB1C24" opacity="0.9" />
      <path d="M16 22 L18.5 19 H13.5 Z" fill="#c0c0c0" opacity="0.85" />
      <rect x="9" y="4" width="14" height="24" rx="2.5" fill="url(#elev-red)" opacity="0.22" />
    </svg>
  );
}

function DestinationGlyph() {
  return (
    <svg className="floating-nav-trigger__glyph" viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="dest-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d4d4d4" />
          <stop offset="100%" stopColor="#b0b0b0" />
        </linearGradient>
        <linearGradient id="dest-red" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="55%" stopColor="#EB1C24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M6 24 V10 L16 5 L26 10 V24 H6 Z"
        fill="url(#dest-chrome)"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path d="M11 24 V15 H15 V24 M17 24 V12 H21 V24" fill="rgba(255,255,255,0.45)" />
      <circle cx="16" cy="11" r="2.25" fill="#EB1C24" opacity="0.92" />
      <path d="M6 24 V10 L16 5 L26 10 V24 H6 Z" fill="url(#dest-red)" opacity="0.18" />
    </svg>
  );
}

export function FloatingNavTrigger({ kind, isActive, label, onClick }: Props) {
  return (
    <button
      type="button"
      className={[
        'floating-nav-trigger',
        `floating-nav-trigger--${kind}`,
        isActive ? 'floating-nav-trigger--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={label}
      aria-expanded={isActive}
    >
      <span className="floating-nav-trigger__chrome-cap" aria-hidden />
      <span className="floating-nav-trigger__crystal" aria-hidden />
      <span className="floating-nav-trigger__foil" aria-hidden />
      {kind === 'floors' ? <ElevatorGlyph /> : <DestinationGlyph />}
    </button>
  );
}

export function FloatingNavBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="floating-nav-backdrop"
      onClick={onClose}
      aria-label="Close navigation"
    />
  );
}

export type FloatingNavDrawerShellProps = {
  isOpen: boolean;
  anchor: 'bottom-right' | 'bottom-left';
  embedded?: boolean;
  children: ReactNode;
  className?: string;
};

export function FloatingNavDrawerShell({
  isOpen,
  anchor,
  embedded = false,
  children,
  className = '',
}: FloatingNavDrawerShellProps) {
  if (embedded) {
    return (
      <div className={`floating-nav-drawer floating-nav-drawer--embedded floating-nav-drawer--${anchor} ${className}`.trim()}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={[
        'floating-nav-drawer',
        `floating-nav-drawer--${anchor}`,
        isOpen ? 'floating-nav-drawer--open' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!isOpen}
    >
      {children}
    </div>
  );
}
