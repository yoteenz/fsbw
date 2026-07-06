/** Milestone 122 — Studio Intelligence™ Architecture V1.0 */

export const STUDIO_INTELLIGENCE_ARCHITECTURE_STORAGE_KEY = 'studioOsStudioIntelligenceArchitecture_v1';
export const STUDIO_INTELLIGENCE_ARCHITECTURE_VERSION = '1.0.0';
export const STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED =
  'studio-os-studio-intelligence-architecture-updated';

export const STUDIO_INTELLIGENCE_ARCHITECTURE_ACCENT = '#4338CA';

export const STUDIO_INTELLIGENCE_PHILOSOPHY = [
  'The model is not the intelligence — the organization is the intelligence.',
  'Studio Intelligence™ is the layer above AI models — Studio OS owns organizational knowledge; models help reason, write, summarize, and execute.',
  'Separate knowledge from reasoning — knowledge lives inside Studio OS; reasoning may come from multiple models.',
  'Studio OS should remain valuable even if every AI vendor changes — the moat is preserved expertise, identity, memory, decisions, relationships, and history.',
] as const;

/** Systems unified by Studio Intelligence™ Architecture */
export const INTELLIGENCE_STACK_SYSTEMS = [
  'profession-brain',
  'organization-genome',
  'memory-engine',
  'knowledge-fabric',
  'executive-council',
  'relationship-memory',
  'legacy-vault',
  'operating-manual',
  'world-knowledge-engine',
  'organizational-consciousness',
] as const;

export const INTELLIGENCE_STACK_LABELS: Record<(typeof INTELLIGENCE_STACK_SYSTEMS)[number], string> = {
  'profession-brain': 'Profession Brain™',
  'organization-genome': 'Organization Genome™',
  'memory-engine': 'Memory Engine™',
  'knowledge-fabric': 'Knowledge Fabric™',
  'executive-council': 'Executive Council™',
  'relationship-memory': 'Relationship Memory™',
  'legacy-vault': 'Legacy Vault™',
  'operating-manual': 'Operating Manual™',
  'world-knowledge-engine': 'World Knowledge Engine™',
  'organizational-consciousness': 'Organizational Consciousness™',
};

/** Knowledge Fabric™ node categories — interconnected intelligence layer */
export const KNOWLEDGE_FABRIC_NODE_TYPES = [
  'people',
  'organizations',
  'departments',
  'customers',
  'documents',
  'projects',
  'meetings',
  'decisions',
  'sops',
  'policies',
  'profession-brains',
  'organization-genomes',
  'memory-engine',
  'legacy-vault',
  'studio-institute',
  'operating-manual',
  'world-knowledge-engine',
  'knowledge-commerce',
] as const;

export const KNOWLEDGE_FABRIC_NODE_LABELS: Record<(typeof KNOWLEDGE_FABRIC_NODE_TYPES)[number], string> = {
  people: 'People',
  organizations: 'Organizations',
  departments: 'Departments',
  customers: 'Customers',
  documents: 'Documents',
  projects: 'Projects',
  meetings: 'Meetings',
  decisions: 'Decisions',
  sops: 'SOPs',
  policies: 'Policies',
  'profession-brains': 'Profession Brains™',
  'organization-genomes': 'Organization Genomes™',
  'memory-engine': 'Memory Engine™',
  'legacy-vault': 'Legacy Vault™',
  'studio-institute': 'Studio Institute™',
  'operating-manual': 'Operating Manual™',
  'world-knowledge-engine': 'World Knowledge Engine™',
  'knowledge-commerce': 'Knowledge Commerce™',
};

/** Trusted context assembled before any AI response */
export const CONTEXT_ENGINE_SOURCES = [
  'active-organization',
  'profession-brain',
  'organization-genome',
  'relevant-memories',
  'relevant-documents',
  'relevant-policies',
  'customer-history',
  'current-timeline',
  'knowledge-confidence',
  'professional-trust-framework',
] as const;

export const CONTEXT_ENGINE_SOURCE_LABELS: Record<(typeof CONTEXT_ENGINE_SOURCES)[number], string> = {
  'active-organization': 'Active Organization',
  'profession-brain': 'Profession Brain™',
  'organization-genome': 'Organization Genome™',
  'relevant-memories': 'Relevant Memories',
  'relevant-documents': 'Relevant Documents',
  'relevant-policies': 'Relevant Policies',
  'customer-history': 'Relevant Customer History',
  'current-timeline': 'Current Timeline',
  'knowledge-confidence': 'Knowledge Confidence™',
  'professional-trust-framework': 'Professional Trust Framework™',
};

/** Durable intelligence layer pipeline — no feature calls third-party AI directly */
export const INTELLIGENCE_LAYER_STEPS = [
  'retrieve-context',
  'rank-relevance',
  'check-trust',
  'apply-professional-scope',
  'consult-organization-memory',
  'prepare-prompts',
  'receive-model-outputs',
  'validate-outputs',
  'store-learning',
  'update-memory',
  'route-decisions',
] as const;

export const INTELLIGENCE_LAYER_STEP_LABELS: Record<(typeof INTELLIGENCE_LAYER_STEPS)[number], string> = {
  'retrieve-context': 'Retrieve Context',
  'rank-relevance': 'Rank Relevance',
  'check-trust': 'Check Trust',
  'apply-professional-scope': 'Apply Professional Scope',
  'consult-organization-memory': 'Consult Organization Memory',
  'prepare-prompts': 'Prepare Prompts',
  'receive-model-outputs': 'Receive Model Outputs',
  'validate-outputs': 'Validate Outputs',
  'store-learning': 'Store Learning',
  'update-memory': 'Update Memory',
  'route-decisions': 'Route Decisions',
};

/** Model-agnostic reasoning engines — Studio OS uses models but is not defined by them */
export const MODEL_GATEWAY_PROVIDERS = [
  'openai',
  'anthropic',
  'google',
  'xai',
  'local-fallback',
] as const;

export const MODEL_GATEWAY_PROVIDER_LABELS: Record<(typeof MODEL_GATEWAY_PROVIDERS)[number], string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  xai: 'xAI',
  'local-fallback': 'Local / Fallback',
};
