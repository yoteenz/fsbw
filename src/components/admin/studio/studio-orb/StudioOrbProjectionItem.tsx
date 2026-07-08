import type { CSSProperties, ReactNode } from 'react';
import { orbProjectionLabelStyle } from './studioOrbTheme';

type Props = {
  label: string;
  icon: ReactNode;
  index: number;
  style: CSSProperties;
  onClick: () => void;
  dismissing?: boolean;
  selected?: boolean;
};

/**
 * Orb Projection™ — floating optical acrylic navigation tile.
 * Carved from a single block of optical crystal — not a mobile app shortcut.
 */
export function StudioOrbProjectionItem({
  label,
  icon,
  index,
  style,
  onClick,
  dismissing,
  selected,
}: Props) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`studio-orb-projection pointer-events-auto fixed flex flex-col items-center${
        dismissing ? ' is-dismissing' : ''
      }${selected ? ' is-selected' : ''}`}
      style={{
        ...style,
        animationDelay: `${index * 55 + 80}ms`,
      }}
      onClick={onClick}
    >
      <span className="studio-orb-projection__float-shadow" aria-hidden />
      <span className="studio-orb-projection__beam" aria-hidden />
      <span className="studio-orb-projection__glass">
        <span className="studio-orb-projection__refraction-edge" aria-hidden />
        <span className="studio-orb-projection__chrome-edge" aria-hidden />
        <span className="studio-orb-projection__frost" aria-hidden />
        <span className="studio-orb-projection__depth" aria-hidden />
        <span className="studio-orb-projection__reflection" aria-hidden />
        <span className="studio-orb-projection__icon-wrap">{icon}</span>
        <span className="studio-orb-projection__glow" aria-hidden />
        <span className="studio-orb-projection__caustic" aria-hidden />
        <span className="studio-orb-projection__particles" aria-hidden />
        <span className="studio-orb-projection__selection-bloom" aria-hidden />
      </span>
      <span
        className="studio-orb-projection__label"
        style={{ ...orbProjectionLabelStyle, animationDelay: `${index * 55 + 280}ms` }}
      >
        {label}
      </span>
    </button>
  );
}
