/** Sprint 18 — canonical Integration domain types */

export type IntegrationEnvironment = 'DEMO' | 'SANDBOX' | 'PRODUCTION';

export type IntegrationProviderCategory =
  | 'REGULATORY'
  | 'GOVERNMENT_DATA'
  | 'PAYMENTS'
  | 'MESSAGING'
  | 'MAPS_ROUTING'
  | 'ADDRESS_VALIDATION'
  | 'BUSINESS_VERIFICATION'
  | 'IDENTITY_VERIFICATION'
  | 'FACTORING'
  | 'INSURANCE'
  | 'LOAD_BOARD'
  | 'DISPATCH'
  | 'ELD_TELEMATICS'
  | 'ACCOUNTING'
  | 'DOCUMENT_SIGNATURE'
  | 'CALENDAR'
  | 'STORAGE'
  | 'OTHER';

export type IntegrationCapability =
  | 'READ'
  | 'WRITE'
  | 'SEARCH'
  | 'VERIFY'
  | 'SYNC'
  | 'WEBHOOK'
  | 'PAYMENT'
  | 'MESSAGING'
  | 'ROUTING'
  | 'DOCUMENT'
  | 'CALENDAR'
  | 'FINANCIAL'
  | 'TELEMATICS'
  | 'REGULATORY';

export type IntegrationConnectionStatus =
  | 'NOT_CONFIGURED'
  | 'CONFIGURING'
  | 'CONNECTED'
  | 'DEGRADED'
  | 'AUTHORIZATION_REQUIRED'
  | 'REAUTHORIZATION_REQUIRED'
  | 'DISABLED'
  | 'ERROR';

export type IntegrationHealthState = 'HEALTHY' | 'DEGRADED' | 'ACTION_REQUIRED' | 'OFFLINE' | 'UNKNOWN';

export type IntegrationOperationStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED'
  | 'REQUIRES_MANUAL_ACTION';

export type ConnectionTestResult =
  | 'SUCCESS'
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_MISSING'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'CONFIGURATION_INVALID'
  | 'UNKNOWN_FAILURE';

export type IntegrationWebhookStatus = 'RECEIVED' | 'VERIFIED' | 'PROCESSING' | 'PROCESSED' | 'REJECTED' | 'DUPLICATE';

export type IntegrationSyncDirection = 'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL' | 'MANUAL_REVIEW';

export type IntegrationSyncType = 'FULL_SYNC' | 'INCREMENTAL_SYNC' | 'MANUAL_SYNC' | 'WEBHOOK_ASSISTED_SYNC' | 'RECONCILIATION_SYNC';

export type ReconciliationIssueType =
  | 'MISSING_EXTERNAL_RECORD'
  | 'MISSING_INTERNAL_RECORD'
  | 'STATUS_MISMATCH'
  | 'AMOUNT_MISMATCH'
  | 'IDENTIFIER_MISMATCH'
  | 'DUPLICATE_EXTERNAL_RECORD'
  | 'STALE_DATA';

export type ReconciliationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ExternalDataSourceBadge =
  | 'FMCSA_DATA'
  | 'PROVIDER_DATA'
  | 'CUSTOMER_PROVIDED'
  | 'ALL_IN_ONE_VERIFIED'
  | 'DEMO_DATA';

export type ExternalDataFreshness = 'CURRENT' | 'STALE' | 'UNKNOWN';

export type ProviderRequirementState =
  | 'AVAILABLE'
  | 'RESEARCH_REQUIRED'
  | 'COMMERCIAL_AGREEMENT_REQUIRED'
  | 'LICENSE_AUTHORITY_REVIEW_REQUIRED'
  | 'CUSTOMER_AUTHORIZATION_REQUIRED'
  | 'API_ACCESS_REQUIRED'
  | 'MANUAL_ONLY'
  | 'NOT_SUPPORTED';

export type ProviderLifecycle = 'ACTIVE' | 'DEPRECATED' | 'SUNSETTING' | 'DISABLED';

export type OAuthFlowStatus = 'STARTED' | 'REDIRECTED' | 'CALLBACK_RECEIVED' | 'CONNECTED' | 'FAILED' | 'EXPIRED';

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type IntegrationAuditAction =
  | 'CONNECTION_CREATED'
  | 'CONNECTION_VERIFIED'
  | 'CONNECTION_DISABLED'
  | 'CREDENTIAL_UPDATED'
  | 'AUTHORIZATION_GRANTED'
  | 'AUTHORIZATION_REVOKED'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'EXTERNAL_ACTION_REQUESTED'
  | 'EXTERNAL_ACTION_COMPLETED'
  | 'EXTERNAL_ACTION_FAILED'
  | 'WEBHOOK_RECEIVED'
  | 'WEBHOOK_REJECTED'
  | 'RECONCILIATION_CREATED'
  | 'RECONCILIATION_RESOLVED';

export interface IntegrationProvider {
  id: string;
  slug: string;
  name: string;
  category: IntegrationProviderCategory;
  description: string;
  supportedCapabilities: IntegrationCapability[];
  supportedEnvironments: IntegrationEnvironment[];
  lifecycle: ProviderLifecycle;
  requirementState: ProviderRequirementState;
  authTypes: ('api_key' | 'oauth2' | 'manual' | 'none')[];
  version: string;
  officialSourceUrl?: string;
  researchNotes?: string;
}

export interface IntegrationCredentialReference {
  id: string;
  connectionId: string;
  secretProvider: 'env' | 'platform_vault' | 'demo';
  referenceKey: string;
  authType: 'api_key' | 'oauth2' | 'manual' | 'none';
  status: 'configured' | 'missing' | 'expired' | 'revoked';
  expiresAt?: string;
  lastRotatedAt?: string;
  maskedHint?: string;
}

export interface IntegrationConnection {
  id: string;
  providerId: string;
  name: string;
  environment: IntegrationEnvironment;
  status: IntegrationConnectionStatus;
  health: IntegrationHealthState;
  enabledCapabilities: IntegrationCapability[];
  credentialReferenceId?: string;
  configurationOwnerStaffId?: string;
  webhookEnabled: boolean;
  webhookUrl?: string;
  lastSuccessfulOperationAt?: string;
  lastSyncAt?: string;
  lastVerifiedAt?: string;
  circuitBreakerState: CircuitBreakerState;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationExternalIdentifier {
  id: string;
  providerId: string;
  connectionId: string;
  entityType: string;
  entityId: string;
  externalId: string;
  externalType: string;
  createdAt: string;
  lastVerifiedAt?: string;
}

export interface ExternalDataProvenance {
  source: ExternalDataSourceBadge;
  fetchedAt: string;
  externalRecordId?: string;
  verificationStatus: 'unverified' | 'confirmed' | 'disputed' | 'demo';
  confidence?: 'high' | 'medium' | 'low';
  rawSnapshotRef?: string;
  freshness: ExternalDataFreshness;
  providerStatusRaw?: string;
}

export interface IntegrationOperation {
  id: string;
  connectionId: string;
  providerId: string;
  capability: IntegrationCapability;
  operationType: string;
  entityType?: string;
  entityId?: string;
  status: IntegrationOperationStatus;
  idempotencyKey: string;
  correlationId: string;
  startedAt: string;
  completedAt?: string;
  attemptCount: number;
  safeError?: string;
  resultSummary?: string;
}

export interface IntegrationOperationAttempt {
  id: string;
  operationId: string;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  httpStatus?: number;
  retryEligible: boolean;
  safeError?: string;
}

export interface IntegrationWebhookEvent {
  id: string;
  providerId: string;
  connectionId: string;
  externalEventId: string;
  eventType: string;
  receivedAt: string;
  verifiedAt?: string;
  processedAt?: string;
  status: IntegrationWebhookStatus;
  attemptCount: number;
  payloadReference?: string;
  safeSummary?: string;
}

export interface IntegrationSyncJob {
  id: string;
  connectionId: string;
  syncType: IntegrationSyncType;
  direction: IntegrationSyncDirection;
  entityType: string;
  status: IntegrationOperationStatus;
  startedAt: string;
  completedAt?: string;
  recordsProcessed: number;
  recordsFailed: number;
  cursorId?: string;
}

export interface IntegrationSyncCursor {
  id: string;
  connectionId: string;
  entityType: string;
  lastSyncedAt?: string;
  providerCursor?: string;
  pageToken?: string;
  updatedSince?: string;
}

export interface IntegrationReconciliationIssue {
  id: string;
  providerId: string;
  connectionId: string;
  issueType: ReconciliationIssueType;
  severity: ReconciliationSeverity;
  entityType: string;
  entityId: string;
  expectedValue: string;
  externalValue: string;
  status: 'open' | 'resolved' | 'ignored';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface IntegrationConsent {
  id: string;
  organizationId: string;
  contactId?: string;
  providerId: string;
  connectionId?: string;
  purpose: string;
  scope: string[];
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  evidenceRef?: string;
}

export interface IntegrationHealthRecord {
  id: string;
  connectionId: string;
  state: IntegrationHealthState;
  evaluatedAt: string;
  reason?: string;
  recentSuccessCount: number;
  recentFailureCount: number;
}

export interface IntegrationAuditEvent {
  id: string;
  action: IntegrationAuditAction;
  connectionId?: string;
  providerId?: string;
  staffId?: string;
  organizationId?: string;
  safeDetail?: string;
  createdAt: string;
}

export interface IntegrationMapping {
  id: string;
  connectionId: string;
  internalType: string;
  internalId: string;
  externalType: string;
  externalField: string;
  mappingVersion: string;
}

export interface IntegrationResearchRecord {
  id: string;
  providerSlug: string;
  category: IntegrationProviderCategory;
  officialSource?: string;
  apiVerified: boolean;
  sandboxVerified: boolean;
  commercialAgreementRequired: boolean;
  licensingConcerns?: string;
  authentication?: string;
  webhooksSupported: boolean;
  rateLimits?: string;
  dataScope?: string;
  lastResearchedAt: string;
  researchNotes: string;
}

export interface CarrierExternalVerification {
  id: string;
  organizationId: string;
  carrierId?: string;
  source: ExternalDataSourceBadge;
  identifierType: 'USDOT' | 'MC' | 'OTHER';
  identifier: string;
  verificationStatus: 'record_found' | 'not_found' | 'error' | 'demo';
  checkedAt: string;
  externalStatus?: string;
  legalName?: string;
  operatingStatus?: string;
  authorityStatus?: string;
  boc3Status?: string;
  insuranceStatus?: string;
  snapshotReference?: string;
  provenance: ExternalDataProvenance;
  operationId?: string;
}

export interface LoadBoardCandidate {
  id: string;
  connectionId: string;
  providerId: string;
  externalLoadId: string;
  origin: string;
  destination: string;
  pickupDate?: string;
  deliveryDate?: string;
  rateMinor?: number;
  commodity?: string;
  equipment?: string;
  miles?: number;
  contact?: string;
  importedLoadId?: string;
  searchedAt: string;
  isDemo: boolean;
}

export interface IntegrationOAuthState {
  id: string;
  connectionId: string;
  stateToken: string;
  pkceVerifier?: string;
  status: OAuthFlowStatus;
  createdAt: string;
  expiresAt: string;
}

export interface StateCapabilityEntry {
  stateCode: string;
  service: string;
  fulfillmentMethod: 'INTERNAL_MANUAL' | 'EXTERNAL_PORTAL' | 'PARTNER' | 'OFFICIAL_API' | 'THIRD_PARTY_API' | 'CUSTOMER_SELF_SERVICE' | 'HYBRID';
  providerId?: string;
  manualPortalUrl?: string;
  automationSupported: boolean;
  customerAuthorizationRequired: boolean;
  partnerRequired: boolean;
}

export interface IntegrationStoreSlice {
  integrationProviders: IntegrationProvider[];
  integrationConnections: IntegrationConnection[];
  integrationCredentialRefs: IntegrationCredentialReference[];
  integrationExternalIds: IntegrationExternalIdentifier[];
  integrationOperations: IntegrationOperation[];
  integrationOperationAttempts: IntegrationOperationAttempt[];
  integrationWebhookEvents: IntegrationWebhookEvent[];
  integrationSyncJobs: IntegrationSyncJob[];
  integrationSyncCursors: IntegrationSyncCursor[];
  integrationReconciliationIssues: IntegrationReconciliationIssue[];
  integrationConsents: IntegrationConsent[];
  integrationHealthRecords: IntegrationHealthRecord[];
  integrationAuditEvents: IntegrationAuditEvent[];
  integrationMappings: IntegrationMapping[];
  integrationResearchRecords: IntegrationResearchRecord[];
  carrierExternalVerifications: CarrierExternalVerification[];
  loadBoardCandidates: LoadBoardCandidate[];
  integrationOAuthStates: IntegrationOAuthState[];
  stateCapabilityMatrix: StateCapabilityEntry[];
}
