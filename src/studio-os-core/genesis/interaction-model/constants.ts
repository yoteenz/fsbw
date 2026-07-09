/** Genesis Universal Interaction Model™ — infrastructure constants */

export const INTERACTION_MODEL_SUBSYSTEM_VERSION = '1.0.0';
export const INTERACTION_MODEL_SUBSYSTEM_NAME = 'Universal Interaction Model™';

/** Canonical interaction primitives from Genesis Sprint 4 */
export const CANONICAL_INTERACTION_TYPES = [
  'interaction',
  'conversation',
  'request',
  'response',
  'command',
  'recommendation',
  'notification',
  'executive-advisory',
  'briefing',
  'decision',
  'approval',
  'review',
  'validation',
  'promotion',
  'deprecation',
  'publication',
  'learning',
  'teaching',
  'knowledge-update',
  'memory-update',
  'mission',
  'workflow',
  'automation',
  'status-change',
  'synchronization',
  'compilation',
  'simulation',
  'relationship-update',
] as const;

export type CanonicalInteractionTypeId = (typeof CANONICAL_INTERACTION_TYPES)[number];

/** Event model categories */
export const EVENT_CATEGORIES = [
  'domain',
  'system',
  'user',
  'ai',
  'knowledge',
  'marketplace',
  'company',
  'mission',
  'learning',
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number];

export const INTERACTION_STATUSES = [
  'requested',
  'accepted',
  'in_progress',
  'completed',
  'failed',
  'recovered',
  'cancelled',
  'archived',
] as const;

export type InteractionStatus = (typeof INTERACTION_STATUSES)[number];

export const INTERACTION_PRIORITIES = ['low', 'normal', 'high', 'critical'] as const;

export type InteractionPriority = (typeof INTERACTION_PRIORITIES)[number];

export const INTERACTION_VISIBILITY_LEVELS = [
  'private',
  'participant-visible',
  'workspace-visible',
  'institution-visible',
  'founder-visible',
  'public',
  'canonical',
] as const;

export type InteractionVisibility = (typeof INTERACTION_VISIBILITY_LEVELS)[number];

export const RETRY_STRATEGIES = [
  'none',
  'retry',
  'request_clarification',
  'human_review',
  'rollback',
  'archive_and_supersede',
  'manual_resolution',
  'defer',
  'reroute',
] as const;

export type RetryStrategy = (typeof RETRY_STRATEGIES)[number];

export const WORKFLOW_STEP_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
] as const;

export type WorkflowStepStatus = (typeof WORKFLOW_STEP_STATUSES)[number];

export const AUDIT_LEVELS = [
  'none',
  'trace',
  'event',
  'decision-record',
  'review-record',
  'canonical-history',
] as const;

export type AuditLevel = (typeof AUDIT_LEVELS)[number];
