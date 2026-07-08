/** Collaborative Innovation Network™ — permanent innovation economy layer */

export const COLLABORATIVE_INNOVATION_NETWORK_VERSION = '1.0.0';
export const COLLABORATIVE_INNOVATION_NETWORK_STORAGE_KEY = 'studioOsCollaborativeInnovationNetwork_v1';
export const STUDIO_OS_COLLABORATIVE_INNOVATION_NETWORK_UPDATED = 'studio-os-collaborative-innovation-network-updated';

export const COLLABORATIVE_INNOVATION_NETWORK_ACCENT = '#7c5cff';

export const CONTRIBUTION_DOMAINS = [
  'architecture',
  'creative-direction',
  'automation',
  'programming',
  'systems',
  'brand-strategy',
  'animation',
  'lighting',
  'storytelling',
  'operations',
] as const;

export const CONTRIBUTION_DOMAIN_LABELS: Record<(typeof CONTRIBUTION_DOMAINS)[number], string> = {
  architecture: 'Architecture',
  'creative-direction': 'Creative Direction',
  automation: 'Automation',
  programming: 'Programming',
  systems: 'Systems',
  'brand-strategy': 'Brand Strategy',
  animation: 'Animation',
  lighting: 'Lighting',
  storytelling: 'Storytelling',
  operations: 'Operations',
};

export const PUBLICATION_VISIBILITY_OPTIONS = [
  'private',
  'company-only',
  'invite-only',
  'marketplace',
  'open-source',
  'licensed',
] as const;

export const PUBLICATION_VISIBILITY_LABELS: Record<(typeof PUBLICATION_VISIBILITY_OPTIONS)[number], string> = {
  private: 'Private',
  'company-only': 'Company Only',
  'invite-only': 'Invite Only',
  marketplace: 'Marketplace',
  'open-source': 'Open Source',
  licensed: 'Licensed',
};

export const JOINT_MARKETPLACE_ASSET_TYPES = [
  'joint-headquarters',
  'joint-blueprints',
  'joint-departments',
  'joint-workflows',
  'joint-ai-systems',
  'joint-genome-presets',
  'joint-expeditions',
  'joint-innovation-packs',
] as const;

export const JOINT_MARKETPLACE_ASSET_LABELS: Record<(typeof JOINT_MARKETPLACE_ASSET_TYPES)[number], string> = {
  'joint-headquarters': 'Joint Headquarters™',
  'joint-blueprints': 'Joint Blueprints™',
  'joint-departments': 'Joint Departments™',
  'joint-workflows': 'Joint Workflows™',
  'joint-ai-systems': 'Joint AI Systems™',
  'joint-genome-presets': 'Joint Genome Presets™',
  'joint-expeditions': 'Joint Expeditions™',
  'joint-innovation-packs': 'Joint Innovation Packs™',
};

export const GENOME_LAYERS = [
  'company-genome',
  'creative-genome',
  'experience-genome',
  'innovation-profile',
  'blueprint-library',
  'creative-portfolio',
] as const;

export const GENOME_LAYER_LABELS: Record<(typeof GENOME_LAYERS)[number], string> = {
  'company-genome': 'Company Genome™',
  'creative-genome': 'Creative Genome™',
  'experience-genome': 'Experience Genome™',
  'innovation-profile': 'Innovation Profile™',
  'blueprint-library': 'Blueprint Library™',
  'creative-portfolio': 'Creative Portfolio™',
};
