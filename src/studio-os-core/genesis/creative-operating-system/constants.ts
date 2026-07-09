export const XCOS_SUBSYSTEM_NAME = 'Creative Operating System™';
export const XCOS_SUBSYSTEM_VERSION = '1.0.0';

export const XCOS_ROOM_PATHS = [
  'creative-operating-system',
  'executive-creative-board',
  'creative-council',
  'creative-memory',
  'creative-evolution',
  'creative-economy',
  'creative-assets',
  'creative-governance',
] as const;

export type XcosRoomPath = (typeof XCOS_ROOM_PATHS)[number];

export const XCOS_ROOM_PATH_LABELS: Record<XcosRoomPath, string> = {
  'creative-operating-system': 'Creative Organization Arrival',
  'executive-creative-board': 'Executive Creative Board™',
  'creative-council': 'Creative Council™',
  'creative-memory': 'Creative Memory™',
  'creative-evolution': 'Creative Evolution Engine™',
  'creative-economy': 'Creative Economy™',
  'creative-assets': 'Creative Assets Registry™',
  'creative-governance': 'Creative Governance™',
};

export const XCOS_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XcosDemoBrandId = (typeof XCOS_DEMO_BRAND_IDS)[number];

export const XCOS_DEMO_BRAND_LABELS: Record<XcosDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XCOS_EXECUTIVE_IDS = [
  'chief-creative-officer',
  'executive-producer',
  'creative-strategist',
  'narrative-director',
  'brand-director',
  'audience-director',
  'experience-director',
  'production-director',
  'performance-director',
  'knowledge-director',
] as const;

export type XcosExecutiveId = (typeof XCOS_EXECUTIVE_IDS)[number];

export const XCOS_EXECUTIVE_LABELS: Record<XcosExecutiveId, string> = {
  'chief-creative-officer': 'Chief Creative Officer™',
  'executive-producer': 'Executive Producer™',
  'creative-strategist': 'Creative Strategist™',
  'narrative-director': 'Narrative Director™',
  'brand-director': 'Brand Director™',
  'audience-director': 'Audience Director™',
  'experience-director': 'Experience Director™',
  'production-director': 'Production Director™',
  'performance-director': 'Performance Director™',
  'knowledge-director': 'Knowledge Director™',
};

export const XCOS_ORG_STATES = [
  'listening',
  'opportunity-detected',
  'council-convened',
  'founder-decision-pending',
  'production-authorized',
  'production-active',
  'publishing-active',
  'performance-review',
  'learning-cycle',
  'economy-update',
  'evolved',
] as const;

export type XcosOrgState = (typeof XCOS_ORG_STATES)[number];

export const XCOS_ORG_STATE_LABELS: Record<XcosOrgState, string> = {
  listening: 'Listening',
  'opportunity-detected': 'Opportunity Detected',
  'council-convened': 'Council Convened',
  'founder-decision-pending': 'Founder Decision Pending',
  'production-authorized': 'Production Authorized',
  'production-active': 'Production Active',
  'publishing-active': 'Publishing Active',
  'performance-review': 'Performance Review',
  'learning-cycle': 'Learning Cycle',
  'economy-update': 'Economy Update',
  evolved: 'Evolved',
};

export const XCOS_MEMORY_TYPES = [
  'decision',
  'reasoning',
  'approval',
  'rejection',
  'performance',
  'audience-reaction',
  'lesson-learned',
  'visual-discovery',
  'narrative-discovery',
  'production-discovery',
  'brand-discovery',
  'board-meeting',
  'reusable-asset',
] as const;

export type XcosMemoryType = (typeof XCOS_MEMORY_TYPES)[number];

export const XCOS_ECONOMY_ASSET_TYPES = [
  'visual-system',
  'narrative-template',
  'production-blueprint',
  'motion-system',
  'music-theme',
  'character',
  'virtual-set',
  'transition',
  'knowledge-module',
  'prompt-asset',
  'proof-framework',
  'distribution-package',
] as const;

export type XcosEconomyAssetType = (typeof XCOS_ECONOMY_ASSET_TYPES)[number];

export const XCOS_EVOLUTION_TARGETS = [
  'narrative-intelligence',
  'production-genome',
  'brand-intelligence',
  'audience-intelligence',
  'decision-dna',
  'taste-genome',
  'creative-patterns',
] as const;

export type XcosEvolutionTarget = (typeof XCOS_EVOLUTION_TARGETS)[number];

export const XCOS_CONSUMER_SYSTEMS = [
  'studio-intelligence-layer',
  'studio-production-system',
  'narrative-intelligence',
  'brand-discovery-engine',
  'institute-of-knowledge',
  'executive-headquarters',
  'mission-control',
  'company-genome',
  'studio-foundry',
  'orb',
] as const;

export type XcosConsumerSystem = (typeof XCOS_CONSUMER_SYSTEMS)[number];

export const XCOS_FOUNDER_DECISIONS = ['approved', 'rejected', 'revision', 'hold'] as const;
export type XcosFounderDecision = (typeof XCOS_FOUNDER_DECISIONS)[number];
