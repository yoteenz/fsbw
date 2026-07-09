/** Genesis Universal Decision Architecture™ — infrastructure constants */

export const DECISION_ENGINE_SUBSYSTEM_VERSION = '1.0.0';
export const DECISION_ENGINE_SUBSYSTEM_NAME = 'Universal Decision Architecture™';

/** Canonical decision types from Genesis Sprint 5 */
export const CANONICAL_DECISION_TYPES = [
  'decision',
  'recommendation',
  'suggestion',
  'priority',
  'mission',
  'goal',
  'strategy',
  'automation',
  'delegation',
  'approval',
  'escalation',
  'review',
  'observation',
  'prediction',
  'risk',
  'opportunity',
  'constraint',
  'intent',
  'context',
  'confidence',
  'evidence',
  'tradeoff',
] as const;

export type CanonicalDecisionTypeId = (typeof CANONICAL_DECISION_TYPES)[number];

export const DECISION_STATUSES = [
  'proposed',
  'recommended',
  'selected',
  'approved',
  'rejected',
  'executed',
  'superseded',
  'archived',
] as const;

export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export const REVIEW_STATUSES = [
  'not_required',
  'pending',
  'in_review',
  'approved',
  'rejected',
  'returned',
  'deferred',
] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CONFIDENCE_LEVELS = ['low', 'medium', 'high', 'verified'] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CONTEXT_SCOPES = [
  'personal',
  'workspace',
  'company',
  'institution',
  'marketplace',
  'canon',
  'civilization',
] as const;

export type ContextScope = (typeof CONTEXT_SCOPES)[number];

export const CONTEXT_TIMEFRAMES = [
  'immediate',
  'near-term',
  'strategic',
  'historical',
  'continuous',
] as const;

export type ContextTimeframe = (typeof CONTEXT_TIMEFRAMES)[number];

export const REVIEW_THRESHOLDS = [
  'human-review',
  'founder-approval',
  'council-review',
  'constitutional-review',
] as const;

export type ReviewThreshold = (typeof REVIEW_THRESHOLDS)[number];

export const DECISION_VISIBILITY_LEVELS = [
  'private',
  'participant-visible',
  'workspace-visible',
  'institution-visible',
  'founder-visible',
  'public',
  'canonical',
] as const;

export type DecisionVisibility = (typeof DECISION_VISIBILITY_LEVELS)[number];

export const DECISION_AUDIT_LEVELS = [
  'none',
  'trace',
  'event',
  'decision-record',
  'review-record',
  'canonical-history',
] as const;

export type DecisionAuditLevel = (typeof DECISION_AUDIT_LEVELS)[number];

export const PRIORITY_LEVELS = ['low', 'normal', 'high', 'critical'] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];
