import type { Priority } from '../demo/demoTypes';

/** Canonical staff role bundles for Office authorization demo. */
export type OfficeStaffRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'permitting_specialist'
  | 'road_ready_specialist'
  | 'insurance_coordinator'
  | 'dispatcher'
  | 'factoring_coordinator'
  | 'broker'
  | 'billing_specialist'
  | 'customer_support'
  | 'viewer';

export type OfficeDivision =
  | 'permitting_compliance'
  | 'road_ready'
  | 'insurance'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'billing'
  | 'customer_support'
  | 'management';

export type OfficeWorkStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'waiting_on_customer'
  | 'waiting_externally'
  | 'waiting_internal'
  | 'ready_for_review'
  | 'completed'
  | 'cancelled';

export type OfficeWaitingOn =
  | 'customer'
  | 'all_in_one'
  | 'external_provider'
  | 'government'
  | 'carrier'
  | 'shipper'
  | 'insurance_partner'
  | 'factoring_provider'
  | 'other'
  | 'none';

export type OfficeWorkSourceDomain =
  | 'service_request'
  | 'road_ready'
  | 'document'
  | 'renewal'
  | 'insurance'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'quote'
  | 'invoice'
  | 'payment'
  | 'message'
  | 'calendar'
  | 'manual';

export type OfficeWorkType =
  | 'review'
  | 'follow_up'
  | 'assignment'
  | 'approval'
  | 'document_review'
  | 'customer_response'
  | 'submission'
  | 'verification'
  | 'billing'
  | 'handoff'
  | 'escalation'
  | 'general';

export type OfficeQueueId =
  | 'new_service_requests'
  | 'missing_documents'
  | 'document_review'
  | 'renewals'
  | 'insurance_requests'
  | 'dispatch_actions'
  | 'factoring_submissions'
  | 'brokerage_coverage'
  | 'billing_issues'
  | 'customer_replies'
  | 'approvals'
  | 'unassigned'
  | 'customers_waiting_on_us'
  | 'waiting_on_customer'
  | 'waiting_externally';

export interface OfficeTeam {
  id: string;
  name: string;
  division: OfficeDivision;
}

export interface OfficeWorkItem {
  id: string;
  sourceDomain: OfficeWorkSourceDomain;
  sourceEntityType: string;
  sourceEntityId: string;
  organizationId: string;
  title: string;
  description?: string;
  workType: OfficeWorkType;
  division: OfficeDivision;
  queueId?: OfficeQueueId;
  priority: Priority;
  status: OfficeWorkStatus;
  statusLabel: string;
  assignedUserId?: string;
  assignedTeamId?: string;
  dueAt?: string;
  waitingOn: OfficeWaitingOn;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  staleAfterDays?: number;
  version: number;
  isDemo?: boolean;
}

export interface OfficeAssignmentRecord {
  id: string;
  workItemId: string;
  assignedUserId?: string;
  assignedTeamId?: string;
  assignedById: string;
  assignedAt: string;
  reassignedFromUserId?: string;
  reason?: string;
}

export type OfficeHandoffStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined';

export interface OfficeHandoff {
  id: string;
  fromTeamId: string;
  toTeamId: string;
  organizationId: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  reason: string;
  summary: string;
  priority: Priority;
  dueAt?: string;
  assignedUserId?: string;
  status: OfficeHandoffStatus;
  createdById: string;
  acceptedById?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  notes?: string;
}

export type OfficeApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';

export interface OfficeApprovalRequest {
  id: string;
  sourceEntityType: string;
  sourceEntityId: string;
  organizationId?: string;
  actionType: string;
  title: string;
  reason: string;
  requestedById: string;
  requestedAt: string;
  reviewedById?: string;
  reviewedAt?: string;
  status: OfficeApprovalStatus;
  decisionNote?: string;
}

export type OfficeEscalationLevel = 'attention' | 'high' | 'critical';

export interface OfficeEscalation {
  id: string;
  sourceDomain: OfficeWorkSourceDomain;
  sourceEntityType: string;
  sourceEntityId: string;
  organizationId: string;
  reason: string;
  level: OfficeEscalationLevel;
  ownerId?: string;
  createdById: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolution?: string;
  workItemId?: string;
}

export type InternalNoteType =
  | 'general'
  | 'follow_up'
  | 'risk_review'
  | 'billing'
  | 'operations'
  | 'customer_preference'
  | 'handoff';

export interface OfficeWorkComment {
  id: string;
  workItemId: string;
  authorId: string;
  body: string;
  createdAt: string;
  mentionUserIds?: string[];
  mentionTeamIds?: string[];
}

export interface OfficeSavedView {
  id: string;
  staffId: string;
  name: string;
  filters: Record<string, string>;
}

export interface OfficeDashboardPreferences {
  staffId: string;
  showDispatchSummary: boolean;
  showInsuranceQueue: boolean;
  showBillingQueue: boolean;
  defaultMyWorkFilter?: string;
}

export interface OfficeStaffContext {
  staffId: string;
  staffName: string;
  role: OfficeStaffRole;
  teamIds: string[];
  permissions: OfficePermission[];
  isManager: boolean;
}

export type OfficePermission =
  | 'clients.read'
  | 'clients.manage'
  | 'work.read'
  | 'work.manage'
  | 'work.assign'
  | 'approvals.read'
  | 'approvals.review'
  | 'escalations.read'
  | 'escalations.manage'
  | 'internal_notes.read'
  | 'internal_notes.create'
  | 'team.read'
  | 'team.manage'
  | 'billing.read'
  | 'billing.manage'
  | 'brokerage_finance.read'
  | 'factoring_finance.read'
  | 'audit.read'
  | 'workload.read';

export interface OfficeAttentionItem {
  id: string;
  dedupeKey: string;
  category: string;
  priority: Priority;
  title: string;
  explanation: string;
  statusLabel: string;
  organizationId?: string;
  organizationName?: string;
  ctaLabel: string;
  ctaHref: string;
  affectedAreas: string[];
  entityType?: string;
  entityId?: string;
  waitingOn?: OfficeWaitingOn;
}

export interface OfficeNextAction {
  priority: Priority;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  workItemId?: string;
  organizationName?: string;
  reason: string;
}

export interface OfficeQueueSummary {
  id: OfficeQueueId;
  label: string;
  count: number;
  href: string;
  division?: OfficeDivision;
  scope: 'personal' | 'team' | 'company';
}

export interface OfficeCommandCenterView {
  context: OfficeStaffContext;
  greeting: string;
  assignedCount: number;
  dueTodayCount: number;
  customersWaitingOnUsCount: number;
  nextAction?: OfficeNextAction;
  attentionItems: OfficeAttentionItem[];
  dueToday: OfficeWorkItemView[];
  overdue: OfficeWorkItemView[];
  unassignedCount: number;
  approvalsPendingCount: number;
  escalationsActiveCount: number;
  queues: OfficeQueueSummary[];
  roleModules: OfficeRoleModule[];
  managerSummary?: OfficeManagerSummary;
  bottlenecks: OfficeBottleneck[];
  allCaughtUp: boolean;
  loadingErrors: Partial<Record<string, string>>;
}

export interface OfficeWorkItemView extends OfficeWorkItem {
  organizationName: string;
  assignedStaffName?: string;
  ageDays: number;
  isOverdue: boolean;
  isStale: boolean;
  ctaHref: string;
}

export interface OfficeRoleModule {
  id: string;
  title: string;
  items: { label: string; value: number | string; href: string }[];
}

export interface OfficeManagerSummary {
  customersActive: number;
  openServiceRequests: number;
  customersWaitingOnUs: number;
  waitingOnCustomer: number;
  waitingExternally: number;
  overdueWork: number;
  unassignedWork: number;
  escalations: number;
  approvals: number;
}

export interface OfficeBottleneck {
  label: string;
  count: number;
  href: string;
}

export interface Client360View {
  organizationId: string;
  companyName: string;
  dba?: string;
  customerSince: string;
  primaryContact: string;
  phone?: string;
  email: string;
  organizationType: string;
  usdot?: string;
  mc?: string;
  roadReadyProgress: number;
  accountStatus: string;
  operationalStatus: string;
  operationalStatusLabel: string;
  assignedStaffName?: string;
  activeServices: { name: string; status: string }[];
  nextStaffAction?: OfficeNextAction;
  customerWaitingOn: OfficeWorkItemView[];
  allInOneWaitingOn: OfficeWorkItemView[];
  activeRequests: number;
  upcomingDeadlines: { label: string; dueDate: string }[];
  openDocumentRequests: number;
  billingStatus: string;
  recentCommunication: { author: string; body: string; createdAt: string }[];
  pinnedNotes: { body: string; authorInitials: string; noteType: InternalNoteType }[];
  timeline: { title: string; createdAt: string; kind: string }[];
  tabs: Client360Tab[];
}

export type Client360Tab =
  | 'overview'
  | 'services'
  | 'road_ready'
  | 'fleet'
  | 'documents'
  | 'insurance'
  | 'operations'
  | 'factoring'
  | 'brokerage'
  | 'billing'
  | 'messages'
  | 'activity'
  | 'internal_notes';

export const OFFICE_WORK_STATUS_LABELS: Record<OfficeWorkStatus, string> = {
  new: 'New',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting_on_customer: 'Waiting on Customer',
  waiting_externally: 'Waiting Externally',
  waiting_internal: 'Waiting Internal',
  ready_for_review: 'Ready for Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const OFFICE_WAITING_ON_LABELS: Record<OfficeWaitingOn, string> = {
  customer: 'Customer',
  all_in_one: 'All In One',
  external_provider: 'External Provider',
  government: 'Government',
  carrier: 'Carrier',
  shipper: 'Shipper',
  insurance_partner: 'Insurance Partner',
  factoring_provider: 'Factoring Provider',
  other: 'Other',
  none: '—',
};

export const STALE_WORK_DAYS = 5;
