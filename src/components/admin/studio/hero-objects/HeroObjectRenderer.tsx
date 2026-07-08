/**
 * Hero Object Renderer™ — living museum artifact in the Orb acrylic tile.
 * Foundry asset when ready; sculptural SVG fallback with full living motion.
 */

import { useId } from 'react';
import { useFoundryAsset } from '../../../../hooks/useFoundryAsset';
import { FoundryAssetPreview } from '../foundry/FoundryAssetPreview';
import {
  foundrySlugFromContextAction,
  foundrySlugFromHeroObjectId,
} from '../../../../studio-os-core/hero-objects/orb-actions';
import {
  HeroObjectSculpture,
  HERO_OBJECT_ORB_SCULPTURE_PX,
} from './HeroObjectSculptures';

export type HeroObjectRendererProps = {
  heroObjectId?: string;
  contextActionId?: string;
  contextActionHeroObjectId?: string;
  size?: number;
  className?: string;
  selected?: boolean;
  autoQueue?: boolean;
};

export function HeroObjectRenderer({
  heroObjectId,
  contextActionId,
  contextActionHeroObjectId,
  size = HERO_OBJECT_ORB_SCULPTURE_PX,
  className = '',
  selected = false,
  autoQueue = false,
}: HeroObjectRendererProps) {
  const uid = useId().replace(/:/g, '');
  const sculptureId =
    heroObjectId ?? contextActionHeroObjectId ?? contextActionId ?? 'hero-object-vault';
  const slug = heroObjectId
    ? foundrySlugFromHeroObjectId(heroObjectId)
    : foundrySlugFromContextAction(contextActionId ?? '', contextActionHeroObjectId);

  const { asset } = useFoundryAsset(slug, {
    autoQueue,
    usedBy: `HeroObject:${sculptureId}`,
  });

  const useFoundryImage = asset.status === 'ready' && (asset.transparentUrl ?? asset.previewUrl);

  return (
    <span
      className={`ho-object sw-hero-icon${selected ? ' sw-hero-icon--selected' : ''}${className ? ` ${className}` : ''}`}
      data-hero-object-id={heroObjectId}
      data-foundry-slug={slug}
      data-foundry-status={asset.status}
    >
      <span className="sw-hero-icon__caustic ho-object__caustic" aria-hidden />
      <span className="sw-hero-icon__bloom ho-object__bloom" aria-hidden />
      <span className="ho-object__energy-ring" aria-hidden />
      <span className="sw-hero-icon__sculpture ho-object__sculpture">
        {useFoundryImage ? (
          <FoundryAssetPreview
            asset={asset}
            size={size}
            selected={selected}
            className="foundry-hero-icon__preview"
          />
        ) : (
          <HeroObjectSculpture heroObjectId={sculptureId} size={size} selected={selected} />
        )}
      </span>
      <span className="ho-object__particle-drift" aria-hidden style={{ ['--ho-uid' as string]: uid }} />
    </span>
  );
}
