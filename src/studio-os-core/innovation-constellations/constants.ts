/** Innovation Constellations™ — living knowledge universe */

export const INNOVATION_CONSTELLATIONS_VERSION = '1.0.0';
export const INNOVATION_CONSTELLATIONS_STORAGE_KEY = 'studioOsInnovationConstellations_v1';
export const STUDIO_OS_INNOVATION_CONSTELLATIONS_UPDATED = 'studio-os-innovation-constellations-updated';

export const INNOVATION_CONSTELLATIONS_ACCENT = '#6eb5ff';

export const CELESTIAL_LEVELS = ['star', 'sun', 'solar-system', 'constellation', 'galaxy', 'universe'] as const;

export const CELESTIAL_LEVEL_LABELS: Record<(typeof CELESTIAL_LEVELS)[number], string> = {
  star: 'Star™',
  sun: 'Sun™',
  'solar-system': 'Solar System™',
  constellation: 'Constellation™',
  galaxy: 'Galaxy™',
  universe: 'Universe™',
};

export const STAR_INFLUENCE_TIERS = [
  'blue-star',
  'white-star',
  'gold-star',
  'red-giant',
  'constellation-anchor',
] as const;

export const STAR_INFLUENCE_LABELS: Record<(typeof STAR_INFLUENCE_TIERS)[number], string> = {
  'blue-star': 'Blue Star™ — Emerging',
  'white-star': 'White Star™ — Growing adoption',
  'gold-star': 'Gold Star™ — Industry standard',
  'red-giant': 'Red Giant™ — Historic breakthrough',
  'constellation-anchor': 'Constellation Anchor™ — Category foundation',
};

export const GALAXY_IDS = [
  'retail',
  'healthcare',
  'hospitality',
  'education',
  'beauty',
  'technology',
  'creator-economy',
] as const;

export const GALAXY_LABELS: Record<(typeof GALAXY_IDS)[number], string> = {
  retail: 'Retail Galaxy™',
  healthcare: 'Healthcare Galaxy™',
  hospitality: 'Hospitality Galaxy™',
  education: 'Education Galaxy™',
  beauty: 'Beauty Galaxy™',
  technology: 'Technology Galaxy™',
  'creator-economy': 'Creator Economy Galaxy™',
};

export const CONSTELLATION_IDS = [
  'luxury-beauty',
  'hair-industry',
  'customer-experience',
  'marketing',
  'automation',
  'commerce',
  'ai-operations',
] as const;

export const CONSTELLATION_LABELS: Record<(typeof CONSTELLATION_IDS)[number], string> = {
  'luxury-beauty': 'Luxury Beauty™',
  'hair-industry': 'Hair Industry™',
  'customer-experience': 'Customer Experience™',
  marketing: 'Marketing™',
  automation: 'Automation™',
  commerce: 'Commerce™',
  'ai-operations': 'AI Operations™',
};
