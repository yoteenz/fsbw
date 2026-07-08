/** Innovation Expeditions™ — guided knowledge network */

export const INNOVATION_EXPEDITIONS_VERSION = '1.0.0';
export const INNOVATION_EXPEDITIONS_STORAGE_KEY = 'studioOsInnovationExpeditions_v1';
export const STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED = 'studio-os-innovation-expeditions-updated';

export const INNOVATION_EXPEDITIONS_ACCENT = '#e8c878';

export const EXPEDITION_TYPES = [
  'industry',
  'innovation',
  'founder',
  'company',
  'blueprint',
  'community',
] as const;

export const EXPEDITION_TYPE_LABELS: Record<(typeof EXPEDITION_TYPES)[number], string> = {
  industry: 'Industry Expeditions™',
  innovation: 'Innovation Expeditions™',
  founder: 'Founder Expeditions™',
  company: 'Company Expeditions™',
  blueprint: 'Blueprint Expeditions™',
  community: 'Community Expeditions™',
};

export const EXPEDITION_PATH_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
  'founder',
  'enterprise',
  'creative',
  'operations',
  'strategy',
] as const;

export const EXPEDITION_PATH_LABELS: Record<(typeof EXPEDITION_PATH_LEVELS)[number], string> = {
  beginner: 'Beginner™',
  intermediate: 'Intermediate™',
  advanced: 'Advanced™',
  founder: 'Founder™',
  enterprise: 'Enterprise™',
  creative: 'Creative™',
  operations: 'Operations™',
  strategy: 'Strategy™',
};

export const LIVE_EVENT_TYPES = [
  'founder-talk',
  'architecture-review',
  'marketplace-spotlight',
  'innovation-tour',
  'community-build',
  'museum-night',
] as const;

export const LIVE_EVENT_LABELS: Record<(typeof LIVE_EVENT_TYPES)[number], string> = {
  'founder-talk': 'Founder Talks™',
  'architecture-review': 'Architecture Reviews™',
  'marketplace-spotlight': 'Marketplace Spotlights™',
  'innovation-tour': 'Innovation Tours™',
  'community-build': 'Community Build Sessions™',
  'museum-night': 'Museum Nights™',
};

export const REWARD_KINDS = [
  'knowledge',
  'blueprint',
  'collectible',
  'artifact',
  'certificate',
  'creative-equity',
  'district',
  'headquarters',
  'orb-personality',
] as const;
