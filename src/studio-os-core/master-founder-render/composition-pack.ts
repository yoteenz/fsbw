import type {
  BlueprintCompositionMetadata,
  CompositionPack,
  CompositionProfile,
  CompositionProfileId,
  DeviceProfileId,
} from './contract';
import { MASTER_FOUNDER_RENDER_VERSION } from './contract';

function profile(
  profileId: CompositionProfileId,
  displayName: string,
  deviceProfile: DeviceProfileId,
  sourceMaster: 'landscape' | 'portrait',
  aspectRatio: string,
  focusPriority: CompositionProfile['focusPriority'],
  cropStrategy: CompositionProfile['cropStrategy'],
  fieldOfViewDeg: number,
  focalLengthMm: number
): CompositionProfile {
  return {
    profileId,
    displayName,
    deviceProfile,
    sourceMaster,
    aspectRatio,
    fieldOfViewDeg,
    focalLengthMm,
    safeAreaInsets: { top: 0.05, right: 0.05, bottom: 0.08, left: 0.05 },
    focusPriority,
    cropStrategy,
    requiresNewGeneration: false,
  };
}

/** Default Composition Pack™ — every room receives these profiles from master renders. */
export const DEFAULT_COMPOSITION_PROFILES: CompositionProfile[] = [
  profile('desktop-hero', 'Desktop Hero', 'desktop', 'landscape', '21:9', 'room-wide', 'center-weighted', 90, 24),
  profile('desktop-wide', 'Desktop Wide', 'desktop', 'landscape', '21:9', 'room-wide', 'balanced', 100, 20),
  profile('desktop-detail', 'Desktop Detail', 'desktop', 'landscape', '21:9', 'hero-landmark', 'hero-priority', 55, 50),
  profile('tablet-landscape', 'Tablet Landscape', 'tablet', 'landscape', '16:9', 'room-wide', 'balanced', 75, 28),
  profile('tablet-portrait', 'Tablet Portrait', 'tablet', 'portrait', '9:16', 'balanced', 'balanced', 65, 35),
  profile('mobile-hero', 'Mobile Hero', 'mobile', 'portrait', '9:16', 'reception-desk', 'hero-priority', 60, 35),
  profile('mobile-tight', 'Mobile Tight', 'mobile', 'portrait', '9:16', 'brand-wall', 'tight-mobile', 45, 50),
  profile('instagram-story', 'Instagram Story', 'marketing', 'portrait', '9:16', 'marketing-dramatic', 'brand-priority', 50, 40),
  profile('tiktok', 'TikTok', 'marketing', 'portrait', '9:16', 'hero-landmark', 'hero-priority', 55, 38),
  profile('marketplace-thumbnail', 'Marketplace Thumbnail', 'marketplace', 'landscape', '16:9', 'marketing-dramatic', 'hero-priority', 70, 30),
  profile('presentation', 'Presentation', 'presentation', 'landscape', '16:9', 'room-wide', 'center-weighted', 85, 24),
  profile('construction', 'Construction', 'construction', 'landscape', '21:9', 'room-wide', 'center-weighted', 95, 22),
  profile('blueprint-overlay', 'Blueprint Overlay', 'review', 'landscape', '21:9', 'room-wide', 'center-weighted', 100, 18),
  profile('review-mode', 'Review Mode', 'review', 'landscape', '21:9', 'room-wide', 'balanced', 90, 24),
];

export function buildDefaultCompositionPack(input: {
  packId: string;
  masterLandscapeRenderId: string;
  masterPortraitRenderId?: string | null;
  locked?: boolean;
  revision?: number;
}): CompositionPack {
  return {
    packVersion: MASTER_FOUNDER_RENDER_VERSION,
    packId: input.packId,
    masterLandscapeRenderId: input.masterLandscapeRenderId,
    masterPortraitRenderId: input.masterPortraitRenderId ?? null,
    profiles: [...DEFAULT_COMPOSITION_PROFILES],
    locked: input.locked ?? false,
    revision: input.revision ?? 1,
  };
}

export function lockCompositionPack(pack: CompositionPack): CompositionPack {
  return { ...pack, locked: true };
}

export function getCompositionProfile(
  pack: CompositionPack,
  profileId: CompositionProfileId
): CompositionProfile | undefined {
  return pack.profiles.find((p) => p.profileId === profileId);
}

export function listProfilesForDevice(pack: CompositionPack, device: DeviceProfileId): CompositionProfile[] {
  return pack.profiles.filter((p) => p.deviceProfile === device);
}

/** Future devices add profiles — zero new room generations. */
export function appendCompositionProfile(
  pack: CompositionPack,
  profile: CompositionProfile
): CompositionPack {
  if (pack.locked) {
    throw new Error('Cannot append composition profile — pack is locked after founder approval.');
  }
  return { ...pack, profiles: [...pack.profiles, profile] };
}

export function resolveSmartCompositionGuidance(
  metadata: BlueprintCompositionMetadata,
  targetDevice: DeviceProfileId
): CompositionProfileId {
  const hero = metadata.heroObjects[0];
  if (targetDevice === 'mobile') {
    if (metadata.heroObjects.some((h) => h.role === 'reception-desk')) return 'mobile-hero';
    if (metadata.heroObjects.some((h) => h.role === 'brand-wall')) return 'mobile-tight';
    return 'mobile-hero';
  }
  if (targetDevice === 'tablet') {
    return metadata.recommendedComposition === 'tablet-portrait' ? 'tablet-portrait' : 'tablet-landscape';
  }
  if (targetDevice === 'marketing') {
    return hero?.role === 'hero-landmark' ? 'tiktok' : 'instagram-story';
  }
  if (targetDevice === 'marketplace') return 'marketplace-thumbnail';
  if (targetDevice === 'construction') return 'construction';
  return metadata.recommendedComposition ?? 'desktop-hero';
}
