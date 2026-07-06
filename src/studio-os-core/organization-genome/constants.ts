/** Milestone 95 — Organization Genome™ V1.0 */

export const ORGANIZATION_GENOME_STORAGE_KEY = 'studioOsOrganizationGenome_v1';
export const ORGANIZATION_GENOME_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATION_GENOME_UPDATED = 'studio-os-organization-genome-updated';

export const ORGANIZATION_GENOME_PHILOSOPHY = [
  'Profession Brain™ teaches the AI what the organization knows.',
  'Organization Genome™ teaches the AI who the organization is.',
  'Both are required for Studio OS to behave like a true extension of the business.',
  'The Genome evolves with the organization — it is the permanent identity layer.',
] as const;

export const GENOME_IDENTITY_LAYERS = [
  'brand-personality',
  'tone-of-voice',
  'communication-style',
  'leadership-philosophy',
  'core-values',
  'customer-experience',
  'approval-preferences',
  'risk-tolerance',
  'decision-principles',
  'design-philosophy',
  'brand-vocabulary',
  'internal-terminology',
  'mission-vision',
  'long-term-objectives',
] as const;

export const AI_CONSULTATION_CONTEXTS = [
  'email',
  'workflow',
  'proposal',
  'presentation',
  'automation',
  'concierge-response',
  'marketing-campaign',
  'customer-interaction',
  'document',
  'general',
] as const;

export const GENOME_RISK_LEVELS = ['conservative', 'balanced', 'bold', 'experimental'] as const;

export const GENOME_APPROVAL_STYLES = [
  'founder-final',
  'delegated-with-review',
  'team-consensus',
  'autonomous-with-escalation',
] as const;

export const GENOME_COMMUNICATION_STYLES = [
  'executive-direct',
  'warm-professional',
  'technical-precise',
  'story-driven',
  'educational',
] as const;
