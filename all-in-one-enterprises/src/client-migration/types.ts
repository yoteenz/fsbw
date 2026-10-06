/** Canonical client lifecycle — architecture P0 client migration / activation. */

export type ClientLifecycleState =
  | 'KNOWN_UNMIGRATED'
  | 'MIGRATION_IN_PROGRESS'
  | 'MIGRATION_REVIEW_REQUIRED'
  | 'INTAKE_IN_PROGRESS'
  | 'PREBUILT'
  | 'INVITED'
  | 'CLIENT_CONFIRMATION_REQUIRED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ENDED';

export type ClientReviewState = 'NOT_STARTED' | 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETE';

export type MigrationReviewAction =
  | 'CONFIRM'
  | 'EDIT'
  | 'REJECT'
  | 'MARK_STALE'
  | 'NEEDS_CLIENT_CONFIRMATION'
  | 'RECLASSIFY'
  | 'MATCH_TO_EXISTING'
  | 'CREATE_NEW_CLIENT';

export type ReviewSectionCode =
  | 'COMPANY'
  | 'PEOPLE'
  | 'VEHICLES'
  | 'ACTIVE_SERVICES'
  | 'DOCUMENTS'
  | 'WHAT_CHANGED';

export type ReviewSectionResponse = 'LOOKS_RIGHT' | 'NEEDS_UPDATE' | 'NOT_SURE';

export type WhatChangedShortcut =
  | 'BOUGHT_A_TRUCK'
  | 'SOLD_A_TRUCK'
  | 'ADDED_A_DRIVER'
  | 'REMOVED_A_DRIVER'
  | 'ADDRESS_CHANGED'
  | 'INSURANCE_CHANGED'
  | 'OWNERSHIP_CHANGED'
  | 'CONTACT_INFO_CHANGED'
  | 'NOTHING_CHANGED'
  | 'SOMETHING_ELSE';

export type WorkspaceEntitlementState =
  | 'ACTIVE'
  | 'AVAILABLE_NOT_ACTIVATED'
  | 'PENDING_SETUP'
  | 'PAUSED'
  | 'ENDED';

export type ProvenanceSource = 'STAFF_KNOWLEDGE' | 'LEGACY_SCAN' | 'CLIENT_UPLOAD' | 'EXTRACTION';

export interface ActivationConditions {
  canonicalIdentityExists: boolean;
  reviewOrIntakeComplete: boolean;
  authIdentityLinked: boolean;
  invitationCompleted: boolean;
  clientReviewedRequiredSections: boolean;
  clientConfirmedCurrentTruth: boolean;
  requiredConsentsAccepted: boolean;
  officeProvisioningSucceeded: boolean;
}

export interface ClientActivationInvite {
  id: string;
  organizationId: string;
  email: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  revokedAt?: string;
  sentByStaffId?: string;
  deliveryStatus: 'pending' | 'sent' | 'failed' | 'expired' | 'revoked';
  createdAt: string;
}

export interface ExtractedFactRecord {
  id: string;
  batchId: string;
  organizationId: string;
  documentId?: string;
  entityType: string;
  fieldKey: string;
  proposedValue: string;
  existingValue?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'CONFLICT';
  reviewAction?: MigrationReviewAction;
  sourceReference?: string;
  createdAt: string;
}

export interface ClientReportedChange {
  id: string;
  organizationId: string;
  shortcut: WhatChangedShortcut;
  note?: string;
  createdAt: string;
  reconciliation: 'STAFF_RECONCILE' | 'APPLY_WITH_HISTORY' | 'NONE';
}

export interface OfficeWorkspaceEntitlement {
  organizationId: string;
  workspaceCode: string;
  state: WorkspaceEntitlementState;
  confirmedByStaffAt?: string;
  activatedAt?: string;
}

export interface ClientReviewSection {
  organizationId: string;
  sectionCode: ReviewSectionCode;
  response: ReviewSectionResponse;
  updatedAt: string;
}

export interface ClientLifecycleEvent {
  id: string;
  organizationId: string;
  fromState?: ClientLifecycleState;
  toState: ClientLifecycleState;
  eventType: string;
  actorType: 'STAFF' | 'SYSTEM' | 'EXISTING_CLIENT' | 'NEW_CLIENT' | 'FOUNDER';
  actorId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
