/** Canonical workflow orchestration types — Sprint 14 */

export type WorkflowTemplateStatus = 'draft' | 'published' | 'retired';

export type WorkflowStepType =
  | 'customer_action'
  | 'staff_action'
  | 'document_request'
  | 'document_review'
  | 'internal_review'
  | 'approval'
  | 'payment'
  | 'external_submission'
  | 'external_wait'
  | 'follow_up'
  | 'handoff'
  | 'system_action'
  | 'milestone'
  | 'completion';

export type WorkflowCompletionMethod =
  | 'automatic'
  | 'manual'
  | 'system_verified'
  | 'staff_verified'
  | 'external_confirmed';

export type WorkflowDependencyKind = 'sequential' | 'parallel' | 'conditional';

export type WorkflowInstanceStatus =
  | 'not_started'
  | 'active'
  | 'blocked'
  | 'waiting_on_customer'
  | 'waiting_internal'
  | 'waiting_external'
  | 'ready_for_review'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'paused';

export type WorkflowStepInstanceStatus =
  | 'pending'
  | 'active'
  | 'blocked'
  | 'waiting_on_customer'
  | 'waiting_internal'
  | 'waiting_external'
  | 'ready_for_review'
  | 'completed'
  | 'skipped'
  | 'cancelled';

export type StepVisibility = 'customer_visible' | 'customer_summary_only' | 'internal_only';

export type PaymentGateCondition = 'paid_in_full' | 'deposit_received' | 'payment_plan_current' | 'no_payment_gate';

export type WorkflowEventType =
  | 'SERVICE_REQUEST_CREATED'
  | 'SERVICE_REQUEST_ACCEPTED'
  | 'QUOTE_ACCEPTED'
  | 'PAYMENT_CONFIRMED'
  | 'WORKFLOW_STARTED'
  | 'STEP_ACTIVATED'
  | 'STEP_COMPLETED'
  | 'DOCUMENT_REQUESTED'
  | 'DOCUMENT_RECEIVED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'CUSTOMER_RESPONDED'
  | 'WORK_ITEM_COMPLETED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'HANDOFF_ACCEPTED'
  | 'EXTERNAL_SUBMISSION_RECORDED'
  | 'FOLLOW_UP_DUE'
  | 'RENEWAL_WINDOW_ENTERED';

export type AutomationActionType =
  | 'CREATE_WORK_ITEM'
  | 'ASSIGN_WORK'
  | 'REQUEST_DOCUMENT'
  | 'SEND_NOTIFICATION'
  | 'SCHEDULE_REMINDER'
  | 'CREATE_HANDOFF'
  | 'CREATE_APPROVAL_REQUEST'
  | 'CREATE_ESCALATION'
  | 'ACTIVATE_STEP'
  | 'COMPLETE_ELIGIBLE_SYSTEM_STEP'
  | 'UPDATE_SERVICE_REQUEST_STATUS'
  | 'RECALCULATE_ROAD_READY'
  | 'CREATE_FOLLOW_UP'
  | 'SURFACE_CUSTOMER_ACTION';

export type AutomationSafetyClass = 'low_risk' | 'medium_risk' | 'high_risk';

export type WorkflowActorType = 'customer' | 'staff' | 'system' | 'external_recorded' | 'future_integration';

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: 'eq' | 'neq' | 'exists' | 'not_exists' | 'in';
  value?: string | string[];
}

export interface DocumentRequirementDef {
  id: string;
  documentType: string;
  required: boolean;
  reuseAllowed: boolean;
  reviewRequired: boolean;
  acceptedStatuses: string[];
}

export interface WorkflowStepTemplate {
  id: string;
  phaseId: string;
  name: string;
  customerLabel: string;
  stepType: WorkflowStepType;
  completionMethod: WorkflowCompletionMethod;
  visibility: StepVisibility;
  responsibleTeamId?: string;
  documentRequirements?: string[];
  paymentGate?: PaymentGateCondition;
  weight: number;
  skipConditions?: WorkflowCondition[];
  dueBusinessDays?: number;
  reminderPolicyId?: string;
}

export interface WorkflowPhaseTemplate {
  id: string;
  name: string;
  customerLabel: string;
  sortOrder: number;
}

export interface WorkflowDependencyTemplate {
  id: string;
  fromStepId: string;
  toStepId: string;
  kind: WorkflowDependencyKind;
  conditions?: WorkflowCondition[];
}

export interface WorkflowTransitionTemplate {
  id: string;
  fromStepId: string;
  toStepId: string;
  event: WorkflowEventType;
  conditions?: WorkflowCondition[];
}

export interface WorkflowTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  status: WorkflowTemplateStatus;
  publishedAt?: string;
  publishedById?: string;
  phases: WorkflowPhaseTemplate[];
  steps: WorkflowStepTemplate[];
  dependencies: WorkflowDependencyTemplate[];
  transitions: WorkflowTransitionTemplate[];
  createdAt: string;
}

export interface WorkflowTemplate {
  id: string;
  slug: string;
  name: string;
  serviceType: string;
  division: string;
  description?: string;
  jurisdiction?: 'federal' | 'state' | 'multi_state';
  currentPublishedVersionId?: string;
  isDemo?: boolean;
}

export interface WorkflowInstance {
  id: string;
  templateVersionId: string;
  templateId: string;
  organizationId: string;
  serviceRequestId?: string;
  journeyId?: string;
  status: WorkflowInstanceStatus;
  currentPhaseId?: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  pauseReason?: string;
  pausedAt?: string;
  createdById?: string;
  version: number;
  isDemo?: boolean;
}

export interface WorkflowStepInstance {
  id: string;
  workflowInstanceId: string;
  stepTemplateId: string;
  phaseId: string;
  status: WorkflowStepInstanceStatus;
  waitingOn: 'customer' | 'all_in_one' | 'external' | 'none';
  assignedUserId?: string;
  assignedTeamId?: string;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  blockedReason?: string;
  skipReason?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  officeWorkItemId?: string;
  version: number;
}

export interface WorkflowEventRecord {
  id: string;
  workflowInstanceId: string;
  stepInstanceId?: string;
  eventType: WorkflowEventType | string;
  actorType: WorkflowActorType;
  actorId?: string;
  previousState?: string;
  newState?: string;
  trigger?: string;
  reason?: string;
  dedupeKey?: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  whenEvent: WorkflowEventType | string;
  conditions?: WorkflowCondition[];
  actions: AutomationActionDef[];
  safetyClass: AutomationSafetyClass;
  dedupeKeyTemplate?: string;
  templateId?: string;
  isDemo?: boolean;
}

export interface AutomationActionDef {
  type: AutomationActionType;
  params?: Record<string, string>;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  eventId: string;
  dedupeKey: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped_dry_run';
  startedAt: string;
  completedAt?: string;
  actionsExecuted: string[];
  error?: string;
  retryCount: number;
}

export interface AutomationException {
  id: string;
  executionId: string;
  workflowInstanceId?: string;
  message: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedById?: string;
}

export interface WorkflowReminder {
  id: string;
  workflowInstanceId: string;
  stepInstanceId?: string;
  audience: 'customer' | 'staff';
  scheduledFor: string;
  sentAt?: string;
  stoppedAt?: string;
  stopReason?: string;
  policyId?: string;
}

export interface ServiceJourney {
  id: string;
  slug: string;
  name: string;
  organizationId: string;
  templateSlug: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  workflowInstanceIds: string[];
  startedAt: string;
  completedAt?: string;
  isDemo?: boolean;
}

export interface WorkflowKillSwitch {
  allNonEssentialDisabled: boolean;
  disabledRuleIds: string[];
  disabledTemplateAutomationIds: string[];
}

export const WORKFLOW_INSTANCE_STATUS_LABELS: Record<WorkflowInstanceStatus, string> = {
  not_started: 'Not Started',
  active: 'Active',
  blocked: 'Blocked',
  waiting_on_customer: 'Waiting on Customer',
  waiting_internal: 'Waiting Internal',
  waiting_external: 'Waiting Externally',
  ready_for_review: 'Ready for Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
  paused: 'Paused',
};
