import type { ReactNode } from 'react';
import {
  DESKTOP_FLOATING_NAV_FLOOR_ICON_URL,
  DESKTOP_FLOATING_NAV_ROOM_ICON_URL,
} from '../../../constants/desktopFloatingNav';
import './FloatingNavTrigger.css';

export type FloatingNavTriggerKind = 'floors' | 'rooms';

type Props = {
  kind: FloatingNavTriggerKind;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function FloatingNavTriggerIcon({ kind }: { kind: FloatingNavTriggerKind }) {
  const src =
    kind === 'floors' ? DESKTOP_FLOATING_NAV_FLOOR_ICON_URL : DESKTOP_FLOATING_NAV_ROOM_ICON_URL;
  const alt = kind === 'floors' ? '' : '';

  return (
    <img
      className="floating-nav-trigger__glyph"
      src={src}
      alt={alt}
      aria-hidden
      draggable={false}
    />
  );
}

export function FloatingNavTrigger({ kind, isActive, label, onClick }: Props) {
  const caption = kind === 'floors' ? 'elevator' : 'rooms';

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
      <span className="floating-nav-trigger__inner">
        <FloatingNavTriggerIcon kind={kind} />
        <span className="floating-nav-trigger__caption" aria-hidden>
          {caption}
        </span>
      </span>
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
