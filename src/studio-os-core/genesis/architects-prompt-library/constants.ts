export const APL_SUBSYSTEM_NAME = "The Architect's Prompt Library™";
export const APL_SUBSYSTEM_VERSION = '1.0.0';

/** Institute of Knowledge™ wing room destinations */
export const APL_ROOM_PATHS = [
  'prompt-library',
  'prompt-registry',
  'prompt-collections',
  'prompt-models',
  'prompt-history',
  'prompt-relationships',
  'prompt-search',
  'prompt-quality',
  'prompt-validation',
  'prompt-analytics',
  'prompt-recommendations',
  'prompt-executions',
  'prompt-archives',
] as const;

export type AplRoomPath = (typeof APL_ROOM_PATHS)[number];

export const APL_ROOM_PATH_LABELS: Record<AplRoomPath, string> = {
  'prompt-library': "Architect's Prompt Library™",
  'prompt-registry': 'Prompt Registry™',
  'prompt-collections': 'Prompt Collections™',
  'prompt-models': 'Prompt Model Intelligence™',
  'prompt-history': 'Prompt Versioning & Lineage™',
  'prompt-relationships': 'Prompt Relationships & Dependencies™',
  'prompt-search': 'Prompt Search™',
  'prompt-quality': 'Prompt Quality™',
  'prompt-validation': 'Prompt Validation & Canonization™',
  'prompt-analytics': 'Prompt Analytics™',
  'prompt-recommendations': 'Prompt Recommendations™',
  'prompt-executions': 'Prompt Execution History™',
  'prompt-archives': 'Prompt Archives™',
};

export const APL_PROMPT_CATEGORIES = [
  'architecture',
  'implementation',
  'research',
  'creative',
  'marketing',
  'engineering',
  'validation',
  'business',
  'academy',
  'simulation',
  'automation',
  'system-review',
  'platform-evolution',
  'design',
  'product',
  'operations',
  'education',
  'testing',
  'knowledge',
  'founder-experience',
] as const;

export type AplPromptCategory = (typeof APL_PROMPT_CATEGORIES)[number];

export const APL_PROMPT_CATEGORY_LABELS: Record<AplPromptCategory, string> = {
  architecture: 'Architecture',
  implementation: 'Implementation',
  research: 'Research',
  creative: 'Creative Direction',
  marketing: 'Marketing',
  engineering: 'Engineering',
  validation: 'Validation',
  business: 'Business',
  academy: 'Academy',
  simulation: 'Simulation',
  automation: 'Automation',
  'system-review': 'System Review',
  'platform-evolution': 'Platform Evolution',
  design: 'Design',
  product: 'Product',
  operations: 'Operations',
  education: 'Education',
  testing: 'Testing',
  knowledge: 'Knowledge',
  'founder-experience': 'Founder Experience',
};

export const APL_LIFECYCLE_STAGES = [
  'draft',
  'review',
  'execution',
  'output-review',
  'founder-approval',
  'genesis-updated',
  'canonized',
  'archived',
] as const;

export type AplLifecycleStage = (typeof APL_LIFECYCLE_STAGES)[number];

export const APL_RELATIONSHIP_TYPES = [
  'derives-from',
  'implements',
  'validates',
  'expands',
  'refines',
  'supersedes',
  'conflicts-with',
  'depends-on',
  'produces',
  'follows-up',
  'reviewed-by',
  'canonizes-through',
] as const;

export type AplRelationshipType = (typeof APL_RELATIONSHIP_TYPES)[number];

export const APL_SUPPORTED_MODELS = [
  'claude-opus',
  'claude-sonnet',
  'gpt-4o',
  'gpt-4.1',
  'gemini-pro',
  'composer',
  'cursor-agent',
] as const;

export type AplSupportedModel = (typeof APL_SUPPORTED_MODELS)[number];

export const APL_QUALITY_DIMENSIONS = [
  'architectural-quality',
  'implementation-quality',
  'output-consistency',
  'reusability',
  'platform-value',
  'business-value',
  'founder-value',
  'knowledge-value',
] as const;

export type AplQualityDimension = (typeof APL_QUALITY_DIMENSIONS)[number];
