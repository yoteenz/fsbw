/** Milestone 134 — Policy Engine™ V1.0 */

export const POLICY_ENGINE_STORAGE_KEY = 'studioOsPolicyEngine_v1';
export const POLICY_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_POLICY_ENGINE_UPDATED = 'studio-os-policy-engine-updated';

export const POLICY_ENGINE_ACCENT = '#0D9488';

export const POLICY_ENGINE_PHILOSOPHY = [
  'Organizations define policies once — every Concierge, automation, workflow, and department follows automatically.',
  'Rules should never be duplicated throughout the platform.',
  'Lower-level policies may extend but never violate higher-level rules.',
  'Policies become organizational law — every system follows them automatically.',
] as const;

export const POLICY_CATEGORIES = [
  'approval',
  'ai-usage',
  'professional-trust',
  'marketplace',
  'privacy',
  'automation-limits',
  'knowledge-sharing',
  'content-publishing',
  'employee-permissions',
  'department-standards',
  'security',
  'brand-guidelines',
  'organization-preferences',
  'notification',
  'compliance',
  'future',
] as const;

export const POLICY_LEVELS = ['platform', 'organization', 'department', 'team', 'individual'] as const;

export const POLICY_STATUSES = ['active', 'draft', 'deprecated', 'pending-approval'] as const;

export const ENFORCEMENT_ACTIONS = ['allow', 'pause', 'block', 'require-approval'] as const;

export const ENFORCEMENT_HISTORY_MAX = 100;

export const SIMULATION_HISTORY_MAX = 40;
