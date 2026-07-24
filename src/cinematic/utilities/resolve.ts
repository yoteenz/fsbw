export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

import type {
  FscsCameraId,
  FscsSceneTemplateId,
  FscsTimelineId,
  FscsTransitionId,
} from './types';

const ALIASES: Record<string, string> = {
  'drone push': 'drone-push',
  'slow push': 'slow-push',
  'side tracking': 'side-tracking',
  'rear follow': 'rear-follow',
  'front tracking': 'front-tracking',
  orbit: 'orbit',
  pedestal: 'pedestal',
  reveal: 'reveal',
  'static luxury': 'static-luxury',
  'macro detail': 'macro-detail',
  'hero product': 'hero-product',
  'architectural reveal': 'architectural-reveal',
  'crystal fade': 'crystal-fade',
  'luxury dissolve': 'luxury-dissolve',
  'light sweep': 'light-sweep',
  'glass reflection': 'glass-reflection',
  'soft blur': 'soft-blur',
  'morning glow': 'morning-glow',
  'elegant cut': 'elegant-cut',
  'invisible match cut': 'invisible-match-cut',
  '30 second commercial': 'commercial-30',
  '60 second commercial': 'commercial-60',
  '90 second brand film': 'brand-film-90',
  'launch campaign': 'launch-campaign',
  'social reel': 'social-reel',
  'product reveal': 'product-reveal',
  documentary: 'documentary',
  'founder story': 'founder-story',
  'luxury arrival': 'luxury-arrival',
  'morning routine': 'morning-routine',
  'shopping district': 'shopping-district',
  'showroom walkthrough': 'showroom-walkthrough',
  'founder introduction': 'founder-introduction',
  'customer story': 'customer-story',
  'transformation reveal': 'transformation-reveal',
  'product spotlight': 'product-spotlight',
  'membership reveal': 'membership-reveal',
  'campaign ending': 'campaign-ending',
};

export function resolveFscsId<T extends string>(id: string, fallback: T): T {
  const key = id.trim().toLowerCase();
  if (!key) return fallback;
  return (ALIASES[key] ?? key.replace(/\s+/g, '-')) as T;
}

export function resolveCameraId(id: string): FscsCameraId {
  return resolveFscsId(id, 'slow-push');
}

export function resolveTransitionId(id: string): FscsTransitionId {
  return resolveFscsId(id, 'luxury-dissolve');
}

export function resolveTimelineId(id: string): FscsTimelineId {
  return resolveFscsId(id, 'commercial-60');
}

export function resolveSceneTemplateId(id: string): FscsSceneTemplateId {
  return resolveFscsId(id, 'luxury-arrival');
}
