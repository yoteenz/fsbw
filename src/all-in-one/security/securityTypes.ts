/** Sprint 19 — Security, privacy, audit, and resilience domain types (debug architecture). */

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export type SecurityControlStatus =
  | 'IMPLEMENTED'
  | 'PARTIAL'
  | 'PLANNED'
  | 'NOT_APPLICABLE'
  | 'BLOCKED';

export type SecurityControlCategory =
  | 'IDENTITY'
  | 'SESSION'
  | 'AUTHORIZATION'
  | 'DATA'
  | 'DATABASE'
  | 'STORAGE'
  | 'API'
  | 'INTEGRATIONS'
  | 'COMMUNICATIONS'
  | 'FINANCIAL'
  | 'AUDIT'
  | 'PRIVACY'
  | 'BACKUP'
  | 'RECOVERY'
  | 'BROWSER'
  | 'DEPENDENCIES'
  | 'OPERATIONS';

export interface SecurityControl {
  id: string;
  category: SecurityControlCategory;
  name: string;
  description: string;
  risk: string;
  status: SecurityControlStatus;
  implementation: string;
  verificationMethod: string;
  owner: string;
  lastVerifiedAt?: string;
  notes?: string;
}

export type SecurityFindingSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityFindingStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'MITIGATED'
  | 'ACCEPTED_RISK'
  | 'FALSE_POSITIVE'
  | 'CLOSED';

export interface SecurityFinding {
  id: string;
  controlId?: string;
  severity: SecurityFindingSeverity;
  category: SecurityControlCategory | string;
  title: string;
  description: string;
  detectedAt: string;
  status: SecurityFindingStatus;
  owner?: string;
  resolution?: string;
  verifiedAt?: string;
  isDemo?: boolean;
}

export type SecurityAuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'MFA_CHANGE'
  | 'SESSION_REVOKED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_SENSITIVE_UPDATE'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  | 'FINANCIAL_RECORD_CHANGED'
  | 'REFUND_REQUESTED'
  | 'REFUND_COMPLETED'
  | 'DISCOUNT_OVERRIDE'
  | 'EXPORT_CREATED'
  | 'INTEGRATION_CONNECTED'
  | 'INTEGRATION_CREDENTIAL_CHANGED'
  | 'EXTERNAL_DATA_SHARED'
  | 'EXTERNAL_ACTION_CONFIRMED'
  | 'SECURITY_SETTING_CHANGED'
  | 'DATA_RETENTION_ACTION'
  | 'PRIVACY_REQUEST_ACTION'
  | 'BACKUP_RESTORE'
  | 'ADMIN_OVERRIDE'
  | 'INCIDENT_ACTION'
  | 'DEMO_RESET_BLOCKED'
  | 'UPLOAD_REJECTED'
  | 'INCIDENT_ACTION';

export type SecurityAuditResult = 'SUCCESS' | 'FAILURE' | 'DENIED';

export interface SecurityAuditEvent {
  id: string;
  eventType: SecurityAuditEventType;
  timestamp: string;
  actorId?: string;
  actorLabel?: string;
  actorRole?: string;
  organizationId?: string;
  entityType?: string;
  entityId?: string;
  action: string;
  result: SecurityAuditResult;
  correlationId?: string;
  severity?: SecurityFindingSeverity;
  metadata?: Record<string, string | number | boolean | null>;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
  isDemo?: boolean;
}

export interface SecuritySession {
  id: string;
  principalType: 'customer' | 'staff';
  principalId: string;
  principalLabel: string;
  userAgentApprox?: string;
  deviceLabel?: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt?: string;
  isCurrent?: boolean;
  revokedAt?: string;
}

export type PrivacyRequestType =
  | 'ACCESS'
  | 'EXPORT'
  | 'CORRECTION'
  | 'DELETION'
  | 'RESTRICTION'
  | 'OTHER';

export type PrivacyRequestStatus =
  | 'SUBMITTED'
  | 'IDENTITY_VERIFICATION_REQUIRED'
  | 'UNDER_REVIEW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DENIED_WITH_REASON'
  | 'CANCELLED';

export interface PrivacyRequest {
  id: string;
  organizationId: string;
  requesterLabel: string;
  requestType: PrivacyRequestType;
  status: PrivacyRequestStatus;
  submittedAt: string;
  updatedAt: string;
  reviewNotes?: string;
  denialReason?: string;
  isDemo?: boolean;
}

export type IncidentSeverity = 'SEV-4' | 'SEV-3' | 'SEV-2' | 'SEV-1';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'CONTAINED'
  | 'RECOVERING'
  | 'RESOLVED'
  | 'POSTMORTEM';

export type IncidentCategory =
  | 'ACCOUNT_COMPROMISE'
  | 'CREDENTIAL_EXPOSURE'
  | 'UNAUTHORIZED_ACCESS'
  | 'DATA_EXPOSURE'
  | 'MALWARE'
  | 'PROVIDER_COMPROMISE'
  | 'PAYMENT_SECURITY_EVENT'
  | 'DATA_LOSS'
  | 'AVAILABILITY_OUTAGE'
  | 'OTHER';

export interface SecurityIncident {
  id: string;
  severity: IncidentSeverity;
  category: IncidentCategory;
  title: string;
  summary: string;
  detectedAt: string;
  status: IncidentStatus;
  owner?: string;
  affectedSystems?: string[];
  containment?: string;
  resolution?: string;
  postmortemRequired?: boolean;
  isDemo?: boolean;
}

export type VendorReviewStatus =
  | 'NOT_REVIEWED'
  | 'REVIEW_REQUIRED'
  | 'REVIEWED'
  | 'CONDITIONAL'
  | 'REJECTED';

export interface VendorSecurityRecord {
  id: string;
  name: string;
  purpose: string;
  dataCategories: DataClassification[];
  accessLevel: string;
  environment: 'DEMO' | 'SANDBOX' | 'PRODUCTION';
  contractStatus: 'NONE' | 'PENDING' | 'ACTIVE' | 'EXPIRED';
  securityReviewStatus: VendorReviewStatus;
  lastReviewedAt?: string;
  notes?: string;
}

export type BackupStatusState =
  | 'NOT_CONFIGURED'
  | 'CONFIGURED'
  | 'HEALTHY'
  | 'FAILED'
  | 'RESTORE_TEST_DUE';

export interface BackupStatusRecord {
  database: BackupStatusState;
  objectStorage: BackupStatusState;
  configuration: BackupStatusState;
  auditRecords: BackupStatusState;
  lastCheckedAt: string;
  targetRpo?: string;
  targetRto?: string;
  notes?: string;
}

export type ProductionReadinessState =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'READY'
  | 'NOT_APPLICABLE';

export interface ProductionReadinessItem {
  id: string;
  category: string;
  title: string;
  description: string;
  state: ProductionReadinessState;
  blocking: boolean;
  notes?: string;
}

export type MfaPolicy = 'OPTIONAL' | 'REQUIRED_FOR_ADMIN' | 'REQUIRED_FOR_PRIVILEGED_ROLES' | 'REQUIRED_FOR_ALL_STAFF';

export interface SecuritySettings {
  sessionIdleMinutes: number;
  sessionAbsoluteHours: number;
  mfaPolicy: MfaPolicy;
  loginRateLimitPerHour: number;
  maxUploadBytes: number;
  auditRetentionDays: number;
  exportRequiresStepUp: boolean;
  demoModeActive: boolean;
  environmentLabel: 'DEBUG' | 'DEMO' | 'PRODUCTION';
}

export type FileScanStatus =
  | 'UPLOADED'
  | 'QUARANTINED'
  | 'SCANNING'
  | 'SAFE'
  | 'REJECTED'
  | 'SCAN_FAILED';

export interface SignedDownloadGrant {
  documentId: string;
  organizationId: string;
  token: string;
  expiresAt: string;
  usedAt?: string;
}

export interface DataRetentionPolicy {
  id: string;
  dataCategory: string;
  classification: DataClassification;
  retentionPeriod: string;
  trigger: string;
  disposition: string;
  legalBasis: string;
  reviewRequired: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'TBD';
}

export interface FieldClassification {
  field: string;
  category: string;
  classification: DataClassification;
  notes?: string;
}

export type AioRuntimeEnvironment = 'debug' | 'demo' | 'production';

export interface ProductionGateResult {
  status: 'READY' | 'BLOCKED';
  blockers: string[];
  warnings: string[];
}
