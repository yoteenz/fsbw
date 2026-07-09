import { XBD_PLAYGROUND_ASSET_LABELS, type XbdPlaygroundAssetType } from '../constants';
import type { XbdBrandDnaRecord, XbdPlaygroundAsset } from '../types';

/** Brand DNA Playground — same asset type, different Brand DNA expression */
export function buildPlaygroundAsset(
  brand: XbdBrandDnaRecord,
  assetType: XbdPlaygroundAssetType
): XbdPlaygroundAsset {
  const label = XBD_PLAYGROUND_ASSET_LABELS[assetType];
  const voice = brand.writingVoice.sampleLine;

  const templates: Record<XbdPlaygroundAssetType, Omit<XbdPlaygroundAsset, 'assetType'>> = {
    packaging: {
      headline: `${brand.brandName} · ${label}`,
      body: brand.packagingStyle,
      visualCue: brand.materials.slice(0, 3).join(' · '),
      colorAccent: brand.colorSystem.primary,
    },
    'campaign-card': {
      headline: brand.positioning,
      body: `${brand.emotionalTerritory.join(' · ')} — ${brand.contentStyle}`,
      visualCue: brand.photographyStyle,
      colorAccent: brand.colorSystem.accent,
    },
    'website-hero': {
      headline: voice,
      body: brand.mission,
      visualCue: `${brand.visualPersonality.slice(0, 2).join(' + ')} · ${brand.typography.displayFont}`,
      colorAccent: brand.colorSystem.primary,
    },
    'headquarters-room': {
      headline: `${brand.brandName} Headquarters`,
      body: `Materials: ${brand.materials.slice(0, 4).join(', ')}`,
      visualCue: brand.emotionalTerritory.join(' · '),
      colorAccent: brand.colorSystem.secondary,
    },
    'orb-message': {
      headline: 'Orb™',
      body: voice,
      visualCue: brand.writingVoice.tone,
      colorAccent: brand.colorSystem.primary,
    },
    'social-post': {
      headline: brand.brandPhilosophy,
      body: brand.contentStyle,
      visualCue: brand.photographyStyle,
      colorAccent: brand.colorSystem.accent,
    },
    'product-page': {
      headline: brand.audienceProfile.primaryAudience,
      body: brand.audienceProfile.customerDesire,
      visualCue: brand.packagingStyle,
      colorAccent: brand.colorSystem.primary,
    },
  };

  return { assetType, ...templates[assetType] };
}
