/**
 * Studio World Hero Icon Library™ — animated collectible wrapper.
 */

import { useId } from 'react';
import { HERO_SCULPTURE_MAP } from './StudioWorldHeroIconSculptures';
import type { StudioWorldHeroIconId } from './studioWorldHeroIconTypes';
import { orbIconIdToHeroIconId } from './studioWorldHeroIconTypes';

export type StudioWorldHeroIconProps = {
  iconId: StudioWorldHeroIconId;
  size?: number;
  className?: string;
  /** Pressed / navigating — energy pulse + bloom */
  selected?: boolean;
};

export function StudioWorldHeroIcon({
  iconId,
  size = 28,
  className = '',
  selected = false,
}: StudioWorldHeroIconProps) {
  const uid = useId().replace(/:/g, '');
  const Sculpture = HERO_SCULPTURE_MAP[iconId] ?? HERO_SCULPTURE_MAP.dormant;

  return (
    <span
      className={`sw-hero-icon${selected ? ' sw-hero-icon--selected' : ''}${className ? ` ${className}` : ''}`}
      data-hero-icon={iconId}
    >
      <span className="sw-hero-icon__caustic" aria-hidden />
      <span className="sw-hero-icon__bloom" aria-hidden />
      <Sculpture size={size} uid={uid} className="sw-hero-icon__sculpture" />
    </span>
  );
}

/** Bridge for legacy Orb radial `iconId` strings. */
export function StudioWorldHeroIconFromOrb({
  orbIconId,
  size,
  className,
  selected,
}: {
  orbIconId: string;
  size?: number;
  className?: string;
  selected?: boolean;
}) {
  return (
    <StudioWorldHeroIcon
      iconId={orbIconIdToHeroIconId(orbIconId)}
      size={size}
      className={className}
      selected={selected}
    />
  );
}
