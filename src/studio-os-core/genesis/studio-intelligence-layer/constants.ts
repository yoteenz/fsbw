export const XSIL_SUBSYSTEM_NAME = 'Studio Intelligence Layer™';
export const XSIL_SUBSYSTEM_VERSION = '1.0.0';

export const XSIL_ROOM_PATHS = [
  'studio-intelligence-layer',
  'intelligence',
  'company-operating-manual',
  'decision-dna',
  'taste-genome',
  'canon-engine',
  'experience-compiler',
  'audience-dna',
  'product-dna',
  'creative-genome',
  'decision-dna-playground',
  'audience-dna-playground',
  'brand-dna-playground',
  'experience-playground',
  'creative-genome-explorer',
  'canon-review-workspace',
] as const;

export type XsilRoomPath = (typeof XSIL_ROOM_PATHS)[number];

export const XSIL_ROOM_PATH_LABELS: Record<XsilRoomPath, string> = {
  'studio-intelligence-layer': 'Intelligence Arrival',
  intelligence: 'Executive Intelligence Overview',
  'company-operating-manual': 'Company Operating Manual™',
  'decision-dna': 'Decision DNA™',
  'taste-genome': 'Taste Genome™',
  'canon-engine': 'Canon Engine™',
  'experience-compiler': 'Experience Compiler™',
  'audience-dna': 'Audience DNA™',
  'product-dna': 'Product DNA™',
  'creative-genome': 'Creative Genome™',
  'decision-dna-playground': 'Decision DNA Playground™',
  'audience-dna-playground': 'Audience DNA Playground™',
  'brand-dna-playground': 'Brand DNA Playground™',
  'experience-playground': 'Experience Playground™',
  'creative-genome-explorer': 'Creative Genome Explorer™',
  'canon-review-workspace': 'Canon Review Workspace™',
};

export const XSIL_DEMO_COMPANY_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XsilDemoCompanyId = (typeof XSIL_DEMO_COMPANY_IDS)[number];

export const XSIL_DEMO_COMPANY_LABELS: Record<XsilDemoCompanyId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XSIL_CANON_CLASSES = [
  'temporary',
  'experiment',
  'company-canon',
  'brand-canon',
  'knowledge-canon',
  'genesis-amendment',
  'prompt-library-asset',
  'experience-dna',
  'platform-pattern',
  'archive',
] as const;

export type XsilCanonClass = (typeof XSIL_CANON_CLASSES)[number];

export const XSIL_CONSUMER_SYSTEMS = [
  'orb',
  'mission-engine',
  'content-engine',
  'experience-runtime',
  'studio-foundry',
  'brand-discovery',
  'company-genome',
  'institute-of-knowledge',
] as const;

export type XsilConsumerSystem = (typeof XSIL_CONSUMER_SYSTEMS)[number];

export const XSIL_FOUNDATION_TRAITS = [
  'versioned',
  'searchable',
  'connected',
  'explainable',
  'auditable',
  'composable',
  'reusable',
  'platform-agnostic',
  'founder-reviewable',
] as const;
