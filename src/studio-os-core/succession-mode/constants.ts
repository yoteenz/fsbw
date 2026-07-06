/** Milestone 98 — Succession Mode™ V1.0 */

export const SUCCESSION_MODE_STORAGE_KEY = 'studioOsSuccessionMode_v1';
export const SUCCESSION_MODE_VERSION = '1.0.0';
export const STUDIO_OS_SUCCESSION_MODE_UPDATED = 'studio-os-succession-mode-updated';

export const SUCCESSION_MODE_PHILOSOPHY = [
  'A healthy organization should never depend entirely on one person\'s memory.',
  'Succession planning is not about replacing founders — it is about preserving everything they have built.',
  'The greatest business risk is not competition — it is irreplaceable knowledge.',
  'Succession Mode ensures expertise, leadership, and organizational intelligence continue serving future generations.',
] as const;

export const SUCCESSION_READINESS_DIMENSIONS = [
  'knowledge-preservation',
  'employee-readiness',
  'documentation',
  'profession-brain-coverage',
  'automation',
  'department-independence',
  'leadership-delegation',
  'customer-continuity',
  'critical-process-coverage',
] as const;

export const KNOWLEDGE_DEPENDENCY_TYPES = [
  'founder-only',
  'manager-only',
  'employee-only',
  'vendor-only',
  'uncaptured',
] as const;

export const SUCCESSION_RECOMMENDATION_TYPES = [
  'preserve-knowledge',
  'document-process',
  'cross-train',
  'missing-sop',
  'automation',
  'delegate-leadership',
  'institute-training',
] as const;

export const READINESS_STATUS_LEVELS = ['strong', 'developing', 'vulnerable', 'critical'] as const;
