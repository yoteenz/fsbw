/**
 * Studio World Hero Icon — Foundry-backed.
 * UI consumes manufactured assets by slug; no hardcoded sculpture art.
 */
import { FoundryHeroIconFromId, FoundryHeroIconFromOrb } from '../foundry/FoundryHeroIcon';
import type { StudioWorldHeroIconId } from './studioWorldHeroIconTypes';

export type StudioWorldHeroIconProps = {
  iconId: StudioWorldHeroIconId;
  className?: string;
  size?: number;
  selected?: boolean;
  /** When true, queue Foundry generation for missing assets (admin contexts). */
  autoQueue?: boolean;
};

export function StudioWorldHeroIcon({
  iconId,
  className,
  size,
  selected,
  autoQueue = false,
}: StudioWorldHeroIconProps) {
  return (
    <FoundryHeroIconFromId
      iconId={iconId}
      size={size}
      className={className}
      selected={selected}
      autoQueue={autoQueue}
    />
  );
}

/** Bridge: Orb radial iconId → Foundry hero icon. */
export function StudioWorldHeroIconFromOrb({
  orbIconId,
  className,
  size,
  selected,
  autoQueue,
}: {
  orbIconId: string;
  className?: string;
  size?: number;
  selected?: boolean;
  autoQueue?: boolean;
}) {
  return (
    <FoundryHeroIconFromOrb
      iconId={orbIconId}
      size={size}
      className={className}
      selected={selected}
      autoQueue={autoQueue}
    />
  );
}
