import type { FscsSceneTemplate, FscsSceneTemplateId } from '../utilities/types';

function scene(
  id: FscsSceneTemplateId,
  label: string,
  template: Omit<FscsSceneTemplate, 'id' | 'label'>,
): FscsSceneTemplate {
  return { id, label, ...template };
}

/** Reusable scene templates — cinematic building blocks */
export const FSCS_SCENE_TEMPLATES: Record<FscsSceneTemplateId, FscsSceneTemplate> = {
  'luxury-arrival': scene('luxury-arrival', 'Luxury Arrival', {
    shots: ['opening-establishing', 'storefront-reveal', 'interior-reveal'],
    camera: 'architectural-reveal',
    transition: 'morning-glow',
    rhythmHoldMs: 1200,
    silenceBeforeRevealMs: 800,
  }),
  'morning-routine': scene('morning-routine', 'Morning Routine', {
    shots: ['environmental-insert', 'lifestyle-coverage', 'character-reveal'],
    camera: 'slow-push',
    transition: 'morning-glow',
    rhythmHoldMs: 900,
    silenceBeforeRevealMs: 600,
  }),
  'shopping-district': scene('shopping-district', 'Shopping District', {
    shots: ['opening-establishing', 'walking-sequence', 'storefront-reveal'],
    camera: 'side-tracking',
    transition: 'soft-blur',
    rhythmHoldMs: 700,
    silenceBeforeRevealMs: 500,
  }),
  'showroom-walkthrough': scene('showroom-walkthrough', 'Showroom Walkthrough', {
    shots: ['interior-reveal', 'product-hero', 'lifestyle-coverage'],
    camera: 'rear-follow',
    transition: 'glass-reflection',
    rhythmHoldMs: 1000,
    silenceBeforeRevealMs: 600,
  }),
  'founder-introduction': scene('founder-introduction', 'Founder Introduction', {
    shots: ['character-reveal', 'environmental-insert', 'closing-hero'],
    camera: 'slow-push',
    transition: 'luxury-dissolve',
    rhythmHoldMs: 1400,
    silenceBeforeRevealMs: 700,
  }),
  'customer-story': scene('customer-story', 'Customer Story', {
    shots: ['lifestyle-coverage', 'character-reveal', 'closing-hero'],
    camera: 'front-tracking',
    transition: 'luxury-dissolve',
    rhythmHoldMs: 1100,
    silenceBeforeRevealMs: 600,
  }),
  'transformation-reveal': scene('transformation-reveal', 'Transformation Reveal', {
    shots: ['product-hero', 'character-reveal', 'closing-hero'],
    camera: 'hero-product',
    transition: 'light-sweep',
    rhythmHoldMs: 1400,
    silenceBeforeRevealMs: 800,
  }),
  'product-spotlight': scene('product-spotlight', 'Product Spotlight', {
    shots: ['environmental-insert', 'product-hero', 'closing-hero'],
    camera: 'hero-product',
    transition: 'light-sweep',
    rhythmHoldMs: 1200,
    silenceBeforeRevealMs: 500,
  }),
  'membership-reveal': scene('membership-reveal', 'Membership Reveal', {
    shots: ['interior-reveal', 'product-hero', 'character-reveal'],
    camera: 'orbit',
    transition: 'crystal-fade',
    rhythmHoldMs: 1300,
    silenceBeforeRevealMs: 700,
  }),
  'campaign-ending': scene('campaign-ending', 'Campaign Ending', {
    shots: ['closing-hero', 'logo-ending'],
    camera: 'static-luxury',
    transition: 'luxury-dissolve',
    rhythmHoldMs: 1600,
    silenceBeforeRevealMs: 400,
  }),
};

export function resolveSceneTemplate(id: FscsSceneTemplateId): FscsSceneTemplate {
  return FSCS_SCENE_TEMPLATES[id];
}

export { FSCS_SHOT_LIBRARY, resolveShotTemplate } from './shotLibrary';
