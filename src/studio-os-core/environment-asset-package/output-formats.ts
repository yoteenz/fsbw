import type { EnvironmentOutputFormatId, EnvironmentOutputRecord } from './types';

export type EnvironmentOutputFormatSpec = {
  id: EnvironmentOutputFormatId;
  label: string;
  aspectRatio: string;
  /** Core responsive outputs generated from one approved variant. */
  tier: 'core' | 'extended' | 'future';
  lazyDefault: boolean;
};

/** Canonical output formats — desktop/mobile/tablet are outputs, not separate designs. */
export const ENVIRONMENT_OUTPUT_FORMATS: EnvironmentOutputFormatSpec[] = [
  { id: 'desktop-21-9', label: 'Desktop', aspectRatio: '21:9', tier: 'core', lazyDefault: false },
  { id: 'mobile-9-16', label: 'Mobile', aspectRatio: '9:16', tier: 'core', lazyDefault: false },
  { id: 'tablet-4-3', label: 'Tablet', aspectRatio: '4:3', tier: 'core', lazyDefault: true },
  { id: 'hero-landscape', label: 'Hero Landscape', aspectRatio: '16:9', tier: 'core', lazyDefault: true },
  { id: 'hero-portrait', label: 'Hero Portrait', aspectRatio: '9:16', tier: 'core', lazyDefault: true },
  { id: 'thumbnail-square', label: 'Square Thumbnail', aspectRatio: '1:1', tier: 'core', lazyDefault: false },
  { id: 'thumbnail-wide', label: 'Wide Thumbnail', aspectRatio: '16:9', tier: 'core', lazyDefault: true },
  { id: 'preview-card', label: 'Preview Card', aspectRatio: '4:3', tier: 'core', lazyDefault: false },
  { id: 'studio-preview', label: 'Studio Preview', aspectRatio: '16:9', tier: 'core', lazyDefault: true },
  { id: 'depth-map', label: 'Depth Map', aspectRatio: 'match-source', tier: 'future', lazyDefault: true },
  { id: 'mask', label: 'Mask', aspectRatio: 'match-source', tier: 'future', lazyDefault: true },
  { id: 'vision-pro', label: 'Vision Pro', aspectRatio: 'stereo', tier: 'future', lazyDefault: true },
  { id: 'apple-tv', label: 'Apple TV', aspectRatio: '16:9', tier: 'future', lazyDefault: true },
  { id: 'desktop-ultra-wide', label: 'Desktop Ultra Wide', aspectRatio: '32:9', tier: 'future', lazyDefault: true },
  { id: 'social-story', label: 'Social Story', aspectRatio: '9:16', tier: 'future', lazyDefault: true },
  { id: 'marketplace-card', label: 'Marketplace Card', aspectRatio: '4:3', tier: 'future', lazyDefault: true },
  { id: 'animated-preview', label: 'Animated Preview', aspectRatio: '16:9', tier: 'future', lazyDefault: true },
];

export const CORE_ENVIRONMENT_OUTPUT_FORMATS = ENVIRONMENT_OUTPUT_FORMATS.filter((f) => f.tier === 'core');

export function buildPendingOutputs(lazy = true): EnvironmentOutputRecord[] {
  return ENVIRONMENT_OUTPUT_FORMATS.map((spec) => ({
    formatId: spec.id,
    aspectRatio: spec.aspectRatio,
    status: 'pending',
    url: null,
    width: null,
    height: null,
    byteSize: null,
    generatedAt: null,
    provider: null,
    lazy: lazy ? spec.lazyDefault : false,
  }));
}

export function outputFormatSpec(id: EnvironmentOutputFormatId) {
  return ENVIRONMENT_OUTPUT_FORMATS.find((f) => f.id === id);
}
