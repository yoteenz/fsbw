import type { FscsShotId, FscsShotTemplate } from '../utilities/types';

function shot(
  id: FscsShotId,
  label: string,
  template: Omit<FscsShotTemplate, 'id' | 'label'>,
): FscsShotTemplate {
  return { id, label, ...template };
}

/** Reusable shot library — cinematic grammar for Frontal Slayer */
export const FSCS_SHOT_LIBRARY: Record<FscsShotId, FscsShotTemplate> = {
  'opening-establishing': shot('opening-establishing', 'Opening Establishing', {
    recommendedCamera: 'architectural-reveal',
    durationMs: 5200,
    holdMs: 1200,
    transition: 'morning-glow',
  }),
  'lifestyle-coverage': shot('lifestyle-coverage', 'Lifestyle Coverage', {
    recommendedCamera: 'side-tracking',
    durationMs: 3800,
    holdMs: 800,
    transition: 'soft-blur',
  }),
  'environmental-insert': shot('environmental-insert', 'Environmental Insert', {
    recommendedCamera: 'macro-detail',
    durationMs: 2200,
    holdMs: 600,
    transition: 'elegant-cut',
  }),
  'product-hero': shot('product-hero', 'Product Hero', {
    recommendedCamera: 'hero-product',
    durationMs: 3200,
    holdMs: 1400,
    transition: 'light-sweep',
  }),
  'character-reveal': shot('character-reveal', 'Character Reveal', {
    recommendedCamera: 'slow-push',
    durationMs: 3600,
    holdMs: 1000,
    transition: 'luxury-dissolve',
  }),
  'walking-sequence': shot('walking-sequence', 'Walking Sequence', {
    recommendedCamera: 'rear-follow',
    durationMs: 4200,
    holdMs: 400,
    transition: 'invisible-match-cut',
  }),
  'storefront-reveal': shot('storefront-reveal', 'Storefront Reveal', {
    recommendedCamera: 'drone-push',
    durationMs: 4800,
    holdMs: 1200,
    transition: 'architectural-reveal',
  }),
  'interior-reveal': shot('interior-reveal', 'Interior Reveal', {
    recommendedCamera: 'reveal',
    durationMs: 4000,
    holdMs: 900,
    transition: 'glass-reflection',
  }),
  'closing-hero': shot('closing-hero', 'Closing Hero', {
    recommendedCamera: 'static-luxury',
    durationMs: 3000,
    holdMs: 1600,
    transition: 'crystal-fade',
  }),
  'logo-ending': shot('logo-ending', 'Logo Ending', {
    recommendedCamera: 'static-luxury',
    durationMs: 2800,
    holdMs: 2000,
    transition: 'luxury-dissolve',
  }),
};

export function resolveShotTemplate(id: FscsShotId): FscsShotTemplate {
  return FSCS_SHOT_LIBRARY[id];
}
