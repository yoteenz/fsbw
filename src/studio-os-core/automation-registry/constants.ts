/** Milestone 132 — Automation Registry™ V1.0 */

export const AUTOMATION_REGISTRY_STORAGE_KEY = 'studioOsAutomationRegistry_v1';
export const AUTOMATION_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_AUTOMATION_REGISTRY_UPDATED = 'studio-os-automation-registry-updated';

export const AUTOMATION_REGISTRY_ACCENT = '#16A34A';

export const AUTOMATION_REGISTRY_PHILOSOPHY = [
  'Automations should never become hidden logic — every automation visible, searchable, auditable, manageable.',
  'Nothing executes without registration in the Automation Registry™.',
  'Organizations always understand what is automated, why, who approved it, and how it performed.',
  'Automation builds trust — not uncertainty.',
] as const;

export const AUTOMATION_CATEGORIES = [
  'command-dock',
  'workflow',
  'email',
  'calendar',
  'marketplace',
  'studio-institute',
  'knowledge-commerce',
  'organization-pulse',
  'executive-council',
  'documentation',
  'content-scheduling',
  'customer-followup',
  'approval-chain',
  'notification',
  'legacy-vault',
  'future',
] as const;

export const AUTOMATION_STATUSES = ['active', 'paused', 'failed', 'pending-approval'] as const;

export const AUTOMATION_RISK_LEVELS = ['low', 'medium', 'high'] as const;

export const EXECUTION_HISTORY_MAX = 150;
