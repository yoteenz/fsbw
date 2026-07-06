/** Milestone 135 — Permission Engine™ V1.0 */

export const PERMISSION_ENGINE_STORAGE_KEY = 'studioOsPermissionEngine_v1';
export const PERMISSION_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_PERMISSION_ENGINE_UPDATED = 'studio-os-permission-engine-updated';

export const PERMISSION_ENGINE_ACCENT = '#BE123C';

export const PERMISSION_ENGINE_PHILOSOPHY = [
  'Permissions describe capabilities — not job titles. Compose access based on what people can do.',
  'Organizations customize every role from modular capability profiles.',
  'Contextual permissions adapt to organization, department, project, workspace, and approval state.',
  'Security feels intuitive. Power is intentional. Trust is earned.',
] as const;

export const CAPABILITY_VERBS = [
  'view',
  'create',
  'edit',
  'delete',
  'approve',
  'reject',
  'publish',
  'archive',
  'restore',
  'train-profession-brain',
  'manage-concierges',
  'configure-automations',
  'install-packs',
  'export-data',
  'view-financials',
  'manage-users',
  'change-policies',
  'access-legacy-vault',
] as const;

export const ROLE_PROFILES = [
  'founder',
  'executive',
  'manager',
  'marketing',
  'finance',
  'operations',
  'customer-support',
  'hr',
  'developer',
  'contractor',
  'guest',
] as const;

export const CONTEXT_DIMENSIONS = [
  'organization',
  'department',
  'project',
  'workspace',
  'feature',
  'approval-state',
  'business-hours',
  'location',
  'temporary-delegation',
  'emergency-mode',
] as const;

export const APPROVAL_CHAIN_STEPS = ['employee', 'manager', 'executive', 'founder'] as const;

export const AUDIT_HISTORY_MAX = 100;

export const DELEGATION_MAX_DAYS = 14;
