/** Milestone 94 — Professional Trust Framework™ V1.0 */

export const PROFESSIONAL_TRUST_STORAGE_KEY = 'studioOsProfessionalTrust_v1';
export const PROFESSIONAL_TRUST_VERSION = '1.0.0';
export const STUDIO_OS_PROFESSIONAL_TRUST_UPDATED = 'studio-os-professional-trust-updated';

export const PROFESSIONAL_TRUST_PHILOSOPHY = [
  'Studio OS preserves and amplifies professional expertise — it does not replace licensed professionals.',
  'Digital Concierges educate · prepare · organize · recommend · assist — never misrepresent authority.',
  'Every Profession Brain must understand what it knows and what requires professional review.',
  'Trust is built through responsible guidance — not pretending to know everything.',
] as const;

export const REGULATED_PROFESSIONS = [
  'law',
  'medicine',
  'taxes',
  'accounting',
  'financial-planning',
  'engineering',
  'architecture',
  'mental-health',
  'insurance',
  'construction',
  'food-safety',
  'compliance',
  'healthcare',
] as const;

export const REGULATED_INDUSTRY_IDS = [
  'law-firm',
  'medical',
  'dental',
  'financial-services',
  'insurance',
  'construction',
  'restaurant',
] as const;

export const CONFIDENCE_LEVELS = ['low', 'moderate', 'high', 'very-high'] as const;

export const REVIEW_STATUSES = [
  'none',
  'recommended',
  'required-before-submission',
  'required-before-action',
  'licensed-only',
] as const;

export const ESCALATION_ACTIONS = [
  'schedule-consultation',
  'request-review',
  'assign-licensed-professional',
  'book-appointment',
  'prepare-documents-before-review',
] as const;

export const CONCIERGE_TRUST_BEHAVIORS = [
  'Educate without overstepping',
  'Prepare documentation for human review',
  'Recommend licensed professionals naturally',
  'Communicate confidence transparently',
  'Never misrepresent authority',
] as const;
