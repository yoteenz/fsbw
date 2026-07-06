/** Milestone 97 — Company Health Index™ V1.0 */

export const COMPANY_HEALTH_INDEX_STORAGE_KEY = 'studioOsCompanyHealthIndex_v1';
export const COMPANY_HEALTH_INDEX_VERSION = '1.0.0';
export const STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED = 'studio-os-company-health-index-updated';

export const COMPANY_HEALTH_PHILOSOPHY = [
  'Revenue alone should never define organizational success.',
  'Studio OS helps organizations become healthier — not simply larger.',
  'Identify weak areas before they become business problems — proactive leadership, not reactive management.',
  'One Executive Health Score summarizes overall condition — drill into every category.',
] as const;

export const HEALTH_CATEGORIES = [
  'leadership',
  'operations',
  'marketing',
  'customer-experience',
  'knowledge-preservation',
  'documentation',
  'automation',
  'employee-readiness',
  'financial-health',
  'growth',
  'innovation',
  'succession-readiness',
] as const;

export const HEALTH_STATUS_LEVELS = ['excellent', 'healthy', 'watch', 'at-risk', 'critical'] as const;

export const WEAK_AREA_THRESHOLD = 60;
export const CRITICAL_AREA_THRESHOLD = 45;
