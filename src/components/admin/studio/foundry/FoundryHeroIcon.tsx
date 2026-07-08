/**
 * Foundry Hero Icon — Orb / UI consumption layer.
 * Resolves manufactured assets by slug; never renders hardcoded sculpture art.
 */

import { FoundryAssetPreview } from './FoundryAssetPreview';
import { useFoundryAsset } from '../../../../hooks/useFoundryAsset';
import {
  foundrySlugFromHeroIconId,
  foundrySlugFromOrbIconId,
} from '../../../../studio/foundry';

export type FoundryHeroIconProps = {
  slug: string;
  size?: number;
  className?: string;
  selected?: boolean;
  autoQueue?: boolean;
  usedBy?: string;
};

export function FoundryHeroIcon({
  slug,
  size = 28,
  className = '',
  selected = false,
  autoQueue = false,
  usedBy,
}: FoundryHeroIconProps) {
  const { asset } = useFoundryAsset(slug, { autoQueue, usedBy: usedBy ?? `FoundryHeroIcon:${slug}` });

  return (
    <span
      className={`sw-hero-icon foundry-hero-icon${selected ? ' sw-hero-icon--selected' : ''}${className ? ` ${className}` : ''}`}
      data-foundry-slug={slug}
      data-foundry-status={asset.status}
    >
      <span className="sw-hero-icon__caustic" aria-hidden />
      <span className="sw-hero-icon__bloom" aria-hidden />
      <FoundryAssetPreview
        asset={asset}
        size={size}
        selected={selected}
        className="sw-hero-icon__sculpture foundry-hero-icon__preview"
      />
    </span>
  );
}

/** Bridge: legacy hero icon id → Foundry slug. */
export function FoundryHeroIconFromId({
  iconId,
  size,
  className,
  selected,
  autoQueue,
}: {
  iconId: string;
  size?: number;
  className?: string;
  selected?: boolean;
  autoQueue?: boolean;
}) {
  return (
    <FoundryHeroIcon
      slug={foundrySlugFromHeroIconId(iconId)}
      size={size}
      className={className}
      selected={selected}
      autoQueue={autoQueue}
      usedBy={`HeroIcon:${iconId}`}
    />
  );
}

/** Bridge: legacy Orb radial iconId → Foundry slug. */
export function FoundryHeroIconFromOrb({
  iconId,
  size,
  className,
  selected,
  autoQueue,
}: {
  iconId: string;
  size?: number;
  className?: string;
  selected?: boolean;
  autoQueue?: boolean;
}) {
  return (
    <FoundryHeroIcon
      slug={foundrySlugFromOrbIconId(iconId)}
      size={size}
      className={className}
      selected={selected}
      autoQueue={autoQueue}
      usedBy={`OrbRadial:${iconId}`}
    />
  );
}
