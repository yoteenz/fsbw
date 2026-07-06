/** Milestone 139 — State Engine™ V1.0 */

export const STATE_ENGINE_STORAGE_KEY = 'studioOsStateEngine_v1';
export const STATE_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_STATE_ENGINE_UPDATED = 'studio-os-state-engine-updated';

export const STATE_ENGINE_ACCENT = '#0369A1';

export const STATE_ENGINE_PHILOSOPHY = [
  'Everything inside Studio OS should have a clearly defined state — nothing exists in an undefined condition.',
  'Every transition is intentional, traceable, and predictable — never bypass organizational policies.',
  'Complete lifecycle history preserved — nothing loses its history.',
  'Consistency creates confidence. Confidence creates trust.',
] as const;

export const LIFECYCLE_STATES = [
  'draft',
  'pending',
  'scheduled',
  'waiting',
  'review',
  'approved',
  'rejected',
  'published',
  'active',
  'paused',
  'completed',
  'archived',
  'deleted',
  'failed',
  'cancelled',
  'expired',
  'hidden',
  'locked',
  'deprecated',
] as const;

export const STATE_OBJECT_TYPES = [
  'documents',
  'knowledge-products',
  'profession-brains',
  'departments',
  'projects',
  'customers',
  'employees',
  'marketplace-listings',
  'academy-courses',
  'automation-workflows',
  'command-dock-tasks',
  'assets',
  'announcements',
  'policies',
  'plugins',
] as const;

export const TRANSITION_REQUIREMENTS = [
  'allowed-transitions',
  'required-approvals',
  'required-permissions',
  'policies',
  'automation-triggers',
  'notifications',
  'audit-history',
  'dependencies',
] as const;

export const HISTORY_TRACKED_FIELDS = [
  'previous-state',
  'current-state',
  'reason',
  'user',
  'date',
  'approval-chain',
  'automation-trigger',
  'comments',
] as const;
