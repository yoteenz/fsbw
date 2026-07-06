/** Milestone 124 — Studio Foundation Models™ & Profession Models™ V1.0 */

export const STUDIO_FOUNDATION_MODELS_STORAGE_KEY = 'studioOsStudioFoundationModels_v1';
export const STUDIO_FOUNDATION_MODELS_VERSION = '1.0.0';
export const STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED = 'studio-os-studio-foundation-models-updated';

export const STUDIO_FOUNDATION_MODELS_ACCENT = '#7C3AED';

export const STUDIO_MODELS_PHILOSOPHY = [
  'Studio OS should not compete with general AI companies — it builds specialized intelligence for organizations.',
  'General models know the world. Studio Models™ know how organizations operate.',
  'Begin model-agnostic · become model-resilient · become model-independent where possible.',
  'Third-party models are the bridge. Studio Models™ are the destination. Own the Intelligence Layer.',
] as const;

/** Long-term roadmap phases */
export const ROADMAP_PHASES = [
  'model-agnostic',
  'model-resilient',
  'model-independent',
  'studio-owned',
] as const;

export const ROADMAP_PHASE_LABELS: Record<(typeof ROADMAP_PHASES)[number], string> = {
  'model-agnostic': 'Model-Agnostic (Now)',
  'model-resilient': 'Model-Resilient',
  'model-independent': 'Model-Independent',
  'studio-owned': 'Studio-Owned Intelligence',
};

/** Studio Foundation Models™ capabilities */
export const FOUNDATION_MODEL_CAPABILITIES = [
  'organizational-memory',
  'business-workflows',
  'professional-expertise',
  'department-operations',
  'executive-reasoning',
  'customer-experience',
  'knowledge-preservation',
  'legacy',
] as const;

export const FOUNDATION_MODEL_CAPABILITY_LABELS: Record<
  (typeof FOUNDATION_MODEL_CAPABILITIES)[number],
  string
> = {
  'organizational-memory': 'Organizational Memory',
  'business-workflows': 'Business Workflows',
  'professional-expertise': 'Professional Expertise',
  'department-operations': 'Department Operations',
  'executive-reasoning': 'Executive Reasoning',
  'customer-experience': 'Customer Experience',
  'knowledge-preservation': 'Knowledge Preservation',
  legacy: 'Legacy',
};

/** Profession Models™ catalog */
export const PROFESSION_MODEL_IDS = [
  'studio-tax',
  'studio-legal-intake',
  'studio-medical-office',
  'studio-hair',
  'studio-construction',
  'studio-contractor',
  'studio-marketing',
  'studio-finance',
  'studio-customer-experience',
  'studio-operations',
  'studio-restaurant',
  'studio-real-estate',
  'studio-education',
] as const;

export const PROFESSION_MODEL_LABELS: Record<(typeof PROFESSION_MODEL_IDS)[number], string> = {
  'studio-tax': 'Studio Tax™',
  'studio-legal-intake': 'Studio Legal Intake™',
  'studio-medical-office': 'Studio Medical Office™',
  'studio-hair': 'Studio Hair™',
  'studio-construction': 'Studio Construction™',
  'studio-contractor': 'Studio Contractor™',
  'studio-marketing': 'Studio Marketing™',
  'studio-finance': 'Studio Finance™',
  'studio-customer-experience': 'Studio Customer Experience™',
  'studio-operations': 'Studio Operations™',
  'studio-restaurant': 'Studio Restaurant™',
  'studio-real-estate': 'Studio Real Estate™',
  'studio-education': 'Studio Education™',
};

/** Training sources — never private org data without explicit consent */
export const TRAINING_SOURCES = [
  'approved-profession-brain',
  'public-professional-knowledge',
  'licensed-datasets',
  'organization-approved-training',
  'studio-institute-materials',
  'operating-manuals',
  'anonymized-patterns-consent',
] as const;

export const TRAINING_SOURCE_LABELS: Record<(typeof TRAINING_SOURCES)[number], string> = {
  'approved-profession-brain': 'Approved Profession Brain™ Data',
  'public-professional-knowledge': 'Publicly Available Professional Knowledge',
  'licensed-datasets': 'Licensed Datasets',
  'organization-approved-training': 'Organization-Approved Training Data',
  'studio-institute-materials': 'Studio Institute™ Materials',
  'operating-manuals': 'Operating Manuals',
  'anonymized-patterns-consent': 'Anonymized Patterns (Explicit Consent Only)',
};

/** Hybrid intelligence layers */
export const HYBRID_INTELLIGENCE_LAYERS = [
  'studio-profession-model',
  'external-model',
  'knowledge-fabric',
  'professional-trust-framework',
] as const;

export const HYBRID_LAYER_LABELS: Record<(typeof HYBRID_INTELLIGENCE_LAYERS)[number], string> = {
  'studio-profession-model': 'Studio Profession Model™',
  'external-model': 'External Model (Language Drafting)',
  'knowledge-fabric': 'Knowledge Fabric™ (Org Context)',
  'professional-trust-framework': 'Professional Trust Framework™ (Scope Validation)',
};

/** Enterprise + private deployment modes */
export const ENTERPRISE_DEPLOYMENT_MODES = [
  'private-studio-models',
  'industry-specific',
  'offline-enterprise',
  'regulated-industry',
  'customer-owned-instances',
  'secure-local-inference',
] as const;

export const ENTERPRISE_DEPLOYMENT_LABELS: Record<(typeof ENTERPRISE_DEPLOYMENT_MODES)[number], string> = {
  'private-studio-models': 'Private Studio Models™',
  'industry-specific': 'Industry-Specific Deployments',
  'offline-enterprise': 'Offline Enterprise Models',
  'regulated-industry': 'Regulated-Industry Models',
  'customer-owned-instances': 'Customer-Owned Model Instances',
  'secure-local-inference': 'Secure Local Inference',
};

/** Moat sources — organizational expertise compounds */
export const MOAT_SOURCES = [
  'blueprint',
  'profession-brain',
  'corrections',
  'workflows',
  'lessons',
  'simulations',
  'decisions',
  'legacy-vault',
] as const;

export const MOAT_SOURCE_LABELS: Record<(typeof MOAT_SOURCES)[number], string> = {
  blueprint: 'Every Blueprint',
  'profession-brain': 'Every Profession Brain™',
  corrections: 'Every Correction',
  workflows: 'Every Workflow',
  lessons: 'Every Lesson',
  simulations: 'Every Simulation',
  decisions: 'Every Decision',
  'legacy-vault': 'Every Legacy Vault™ Entry',
};
