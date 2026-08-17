import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import type { AioNotification, NotificationPreference } from '../notifications/notificationTypes';
import type { RenewalRecord } from '../renewals/renewalTypes';
import type { VaultDocument, ClientMigrationStatus } from '../vault/vaultTypes';
import type { ArchiveMigrationBatch, ArchiveMigrationBatchFile } from '../vault/archiveMigrationTypes';
import type { DeadlineSource, DeadlineType, DeadlineVerification } from '../calendar/calendarTypes';
import type {
  BrokerContact,
  DispatchBillingConfig,
  DispatchBillingEvent,
  DispatchCounters,
  DispatchEnrollment,
  Load,
  TruckDispatchProfile,
} from '../dispatch/dispatchTypes';
import type {
  DebtorAccount,
  FactoringCounters,
  FactoringIssue,
  FactoringProfile,
  FactoringProvider,
  FactoringSubmission,
  FreightInvoice,
} from '../factoring/factoringTypes';
import type {
  BillingCounters,
  BillingInvoice,
  BillingStatus,
  CreditRecord,
  PaymentRecord,
  Quote,
  Receipt,
  ServicePricingConfig,
} from '../billing/billingTypes';
import type {
  BrokerageAccessorial,
  BrokerageCapabilityState,
  BrokerageCounters,
  BrokerageFreightQuote,
  BrokerageIssue,
  BrokerageLoadFinancials,
  BrokerageRateConfirmation,
  BrokerageShipperInvoice,
  CarrierNetworkProfile,
  CarrierOffer,
  CarrierPayable,
  CoverageHistoryEvent,
  ShipperProfile,
  ShipmentRequest,
} from '../brokerage/brokerageTypes';
import type {
  CertificateHolder,
  InsuranceCapabilityState,
  InsuranceCertificate,
  InsuranceCounters,
  InsuranceIssue,
  InsurancePartner,
  InsurancePartnerHandoff,
  InsurancePolicy,
  InsurancePolicyCoverage,
  InsurancePolicyVehicle,
  InsuranceQuoteRecord,
  InsuranceRequest,
} from '../insurance/insuranceTypes';
import type {
  DriverPlaceholder,
  PowerUnit,
  RoadReadyHistoryEvent,
  RoadReadyItem,
  RoadReadyProfile,
  RoadReadyVerificationEvent,
  Trailer,
} from '../road-ready/roadReadyTypes';
import type {
  OfficeApprovalRequest,
  OfficeAssignmentRecord,
  OfficeDashboardPreferences,
  OfficeEscalation,
  OfficeHandoff,
  OfficeSavedView,
  OfficeStaffRole,
  OfficeTeam,
  OfficeWorkComment,
  OfficeWorkItem,
  InternalNoteType,
} from '../office-core/officeWorkTypes';
import type {
  AutomationException,
  AutomationExecution,
  AutomationRule,
  DocumentRequirementDef,
  ServiceJourney,
  WorkflowEventRecord,
  WorkflowInstance,
  WorkflowKillSwitch,
  WorkflowReminder,
  WorkflowStepInstance,
  WorkflowTemplate,
  WorkflowTemplateVersion,
} from '../workflow/workflowTypes';
import type {
  CrmActivity,
  CrmConversionRecord,
  CrmFollowUp,
  CrmLead,
  CrmLeadSource,
  CrmLostReason,
  CrmOpportunity,
  CrmPipeline,
  CrmPipelineStage,
  CrmReferral,
  CrmServiceInterest,
  CrmSettings,
} from '../crm/crmTypes';
import type {
  CommAttachment,
  CommConsentRecord,
  CommContextLink,
  CommConversation,
  CommDelivery,
  CommMessage,
  CommParticipant,
  CommPhoneLog,
  CommPreference,
  CommReadState,
  CommRoutingRule,
  CommSettings,
  CommSuppression,
  CommTemplate,
} from '../communications/communicationTypes';
import type {
  Appointment,
  AppointmentAvailabilityRule,
  AppointmentReminder,
  AppointmentSettings,
  AppointmentSlotHold,
  AppointmentStatusHistory,
  AppointmentType,
} from '../appointments/appointmentTypes';
import type {
  CarrierExternalVerification,
  IntegrationAuditEvent,
  IntegrationConnection,
  IntegrationConsent,
  IntegrationCredentialReference,
  IntegrationExternalIdentifier,
  IntegrationHealthRecord,
  IntegrationMapping,
  IntegrationOAuthState,
  IntegrationOperation,
  IntegrationOperationAttempt,
  IntegrationProvider,
  IntegrationReconciliationIssue,
  IntegrationResearchRecord,
  IntegrationSyncCursor,
  IntegrationSyncJob,
  IntegrationWebhookEvent,
  LoadBoardCandidate,
  StateCapabilityEntry,
} from '../integrations/integrationTypes';
import type {
  BackupStatusRecord,
  DataRetentionPolicy,
  PrivacyRequest,
  SecurityAuditEvent,
  SecurityFinding,
  SecurityIncident,
  SecuritySession,
  SecuritySettings,
  SignedDownloadGrant,
  VendorSecurityRecord,
} from '../security/securityTypes';

export type Visibility = 'internal' | 'customer';

export type ClientType = 'owner_operator' | 'carrier' | 'fleet' | 'shipper';
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskStatus = 'open' | 'in_progress' | 'waiting' | 'complete';
export type DeadlineSeverity = 'upcoming' | 'due_soon' | 'due_today' | 'overdue' | 'complete';

export type ActivityKind =
  | 'REQUEST_CREATED'
  | 'REQUEST_ASSIGNED'
  | 'REQUEST_STATUS_CHANGED'
  | 'DOCUMENT_REQUESTED'
  | 'DOCUMENT_RECEIVED'
  | 'TASK_CREATED'
  | 'TASK_COMPLETED'
  | 'MESSAGE_SENT'
  | 'LOAD_STATUS_CHANGED'
  | 'FACTORING_STATUS_CHANGED'
  | 'BROKERAGE_STATUS_CHANGED'
  | 'INSURANCE_REQUEST_SUBMITTED'
  | 'INSURANCE_REQUEST_STATUS_CHANGED'
  | 'INSURANCE_POLICY_CREATED'
  | 'INSURANCE_POLICY_UPDATED'
  | 'INSURANCE_QUOTE_RECORDED'
  | 'INSURANCE_COI_REQUESTED'
  | 'NOTE_ADDED'
  | 'ROADMAP_GENERATED'
  | 'INTAKE_COMPLETED'
  | 'ROAD_READY_UPDATED'
  | 'ROAD_READY_VERIFIED'
  | 'ROAD_READY_PROFILE_CHANGED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_SUPERSEDED'
  | 'RENEWAL_CREATED'
  | 'RENEWAL_COMPLETED'
  | 'NOTIFICATION_GENERATED'
  | 'QUOTE_CREATED'
  | 'QUOTE_SENT'
  | 'QUOTE_VIEWED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'QUOTE_REVISED'
  | 'INVOICE_CREATED'
  | 'INVOICE_ISSUED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'CREDIT_APPLIED'
  | 'INVOICE_VOIDED'
  | 'REFUND_REQUESTED'
  | 'REFUND_SUCCEEDED'
  | 'RECEIPT_CREATED'
  | 'DISPATCH_ENROLLMENT_CREATED'
  | 'DISPATCH_ENROLLMENT_ACTIVATED'
  | 'TRUCK_AVAILABILITY_CHANGED'
  | 'LOAD_CREATED'
  | 'LOAD_OFFERED'
  | 'LOAD_ACCEPTED'
  | 'LOAD_DECLINED'
  | 'LOAD_BOOKED'
  | 'LOAD_RATE_REVISED'
  | 'LOAD_DOCUMENT_UPLOADED'
  | 'LOAD_COMPLETED'
  | 'FACTORING_HANDOFF_READY'
  | 'DISPATCH_BILLING_EVENT_CREATED'
  | 'FACTORING_ENROLLMENT_CREATED'
  | 'FACTORING_PROFILE_UPDATED'
  | 'FREIGHT_INVOICE_CREATED'
  | 'FREIGHT_INVOICE_UPDATED'
  | 'FACTORING_SUBMISSION_CREATED'
  | 'FACTORING_PACKAGE_COMPLETED'
  | 'FACTORING_SUBMITTED'
  | 'FACTORING_STATUS_CHANGED'
  | 'FACTORING_APPROVED'
  | 'FACTORING_DECLINED'
  | 'FACTORING_FUNDING_REPORTED'
  | 'FACTORING_ISSUE_CREATED'
  | 'FACTORING_ISSUE_RESOLVED'
  | 'FACTORING_PROVIDER_CHANGED'
  | 'SHIPMENT_REQUEST_SUBMITTED'
  | 'BROKERAGE_QUOTE_AVAILABLE'
  | 'BROKERAGE_QUOTE_ACCEPTED'
  | 'BROKERAGE_LOAD_NEEDS_COVERAGE'
  | 'CARRIER_OFFER_SENT'
  | 'CARRIER_OFFER_ACCEPTED'
  | 'CARRIER_OFFER_DECLINED'
  | 'BROKERAGE_LOAD_BOOKED'
  | 'BROKERAGE_POD_NEEDED'
  | 'BROKERAGE_POD_RECEIVED'
  | 'BROKERAGE_READY_TO_BILL'
  | 'SHIPPER_INVOICE_ISSUED'
  | 'CARRIER_PAYABLE_READY'
  | 'SHIPPER_INVOICE_CREATED';

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  status: 'available' | 'busy' | 'away' | 'out';
  officeRole?: OfficeStaffRole;
  teamIds?: string[];
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  clientType: ClientType;
  primaryState: string;
  accountStatus: 'active' | 'pending' | 'inactive';
  assignedStaffId?: string;
  roadmapProgress: number;
  customerSince: string;
  services: string[];
  activeRequestCount: number;
  documentsNeededCount: number;
  lastActivityAt: string;
  /** Physical archive digitization progress */
  archiveMigrationStatus?: ClientMigrationStatus;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

export type RequestStatus =
  | 'new_request'
  | 'information_needed'
  | 'documents_needed'
  | 'under_review'
  | 'in_progress'
  | 'submitted'
  | 'awaiting_agency'
  | 'approved'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  requestNumber: string;
  clientId: string;
  services: { slug: string; title: string; division: string }[];
  division: string;
  status: RequestStatus;
  statusLabel: string;
  workflowStep: string;
  priority: Priority;
  assignedStaffId?: string;
  createdAt: string;
  targetDate?: string;
  nextStep: string;
  businessName?: string;
  contactName?: string;
  contactEmail?: string;
  customerNotes?: string;
  roadmapSummary?: string;
  timeline: TimelineStep[];
  documentIds: string[];
  relatedRoadmapItems?: string[];
  taskIds: string[];
  isDemo?: boolean;
  billingStatus?: BillingStatus;
}

/** @deprecated use VaultDocument */
export type DocumentMetadata = VaultDocument;

export interface Deadline {
  id: string;
  label: string;
  clientId: string;
  organizationId?: string;
  requestId?: string;
  roadReadyItemId?: string;
  documentId?: string;
  renewalId?: string;
  vehicleId?: string;
  deadlineType?: DeadlineType;
  source?: DeadlineSource | 'road_ready' | 'manual' | 'service_request';
  deadlineVerification?: DeadlineVerification;
  verified?: boolean;
  dueDate: string;
  severity: DeadlineSeverity;
  category: string;
  complete: boolean;
}

export interface InternalNote {
  id: string;
  clientId: string;
  requestId?: string;
  loadId?: string;
  authorId: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  visibility: 'internal';
  noteType?: InternalNoteType;
  pinned?: boolean;
  entityType?: string;
  entityId?: string;
}

export interface Message {
  id: string;
  clientId: string;
  requestId?: string;
  loadId?: string;
  division?: string;
  from: 'staff' | 'customer';
  authorName: string;
  body: string;
  createdAt: string;
  visibility: Visibility;
  read: boolean;
}

export interface Task {
  id: string;
  title: string;
  clientId?: string;
  requestId?: string;
  assignedStaffId?: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
  clientId?: string;
  requestId?: string;
  staffId?: string;
  createdAt: string;
  visibility: Visibility;
}

/** @deprecated use AioNotification */
export type Notification = AioNotification;

export type { FactoringSubmission } from '../factoring/factoringTypes';

/** @deprecated legacy mock status labels */
export type LegacyFactoringStatus =
  | 'inquiry'
  | 'information_needed'
  | 'invoice_review'
  | 'documents_needed'
  | 'partner_review'
  | 'approved'
  | 'funding_processing'
  | 'funded'
  | 'closed';

export type BrokerageStatus =
  | 'quote_requested'
  | 'reviewing'
  | 'quote_prepared'
  | 'awaiting_shipper'
  | 'booked'
  | 'carrier_assignment'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'documents_pending'
  | 'closed';

export interface BrokerageQuote {
  id: string;
  clientId: string;
  requestId?: string;
  shipperName: string;
  origin: string;
  destination: string;
  commodity: string;
  weight: string;
  equipment: string;
  status: BrokerageStatus;
  createdAt: string;
}

export interface BrokerageShipment extends BrokerageQuote {
  shipmentNumber: string;
  carrier?: string;
  rate?: number;
  pickup: string;
  delivery: string;
  hasBol: boolean;
  hasPod: boolean;
}

export interface Invoice extends BillingInvoice {}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'operations' | 'driver' | 'accounting' | 'viewer';
  status: 'active' | 'invited' | 'inactive';
  lastActivityAt?: string;
}

import type { DataSystemStatus } from '../data/dataHealth';
import type {
  BookkeepingCounters,
  BookkeepingCycle,
  BookkeepingLead,
  BookkeepingReport,
  BookkeepingSubscription,
  BooksRescueEngagement,
} from '../bookkeeping/bookkeepingTypes';
import type {
  BookkeepingException,
  BookkeepingPeriod,
  BookkeepingTransaction,
  CustomerClarification,
  FinancialAccount,
  FinancialConnection,
} from '../bookkeeping/autopilot/autopilotTypes';

export interface DemoStore {
  version: 23;
  requestCounter: number;
  portalClientId?: string;
  shipperPortalOrgId?: string;
  /** Demo default org for carrier brokerage portal (Heartland Freight). */
  brokeragePortalClientId?: string;
  /** Current portal member role for command-center authorization demo. */
  portalMemberRole?: 'owner' | 'admin' | 'operations' | 'driver' | 'accounting' | 'viewer';
  /** Organization team members for portal team view. */
  organizationMembers?: OrganizationMember[];
  /** Current office staff identity for Office 2.0 demo. */
  officeStaffId?: string;
  /** Current office staff role override for authorization demo. */
  officeStaffRole?: OfficeStaffRole;
  /** Office work items — references canonical domain records. */
  officeWorkItems?: OfficeWorkItem[];
  officeTeams?: OfficeTeam[];
  officeAssignmentHistory?: OfficeAssignmentRecord[];
  officeHandoffs?: OfficeHandoff[];
  officeApprovals?: OfficeApprovalRequest[];
  officeEscalations?: OfficeEscalation[];
  officeWorkComments?: OfficeWorkComment[];
  officeSavedViews?: OfficeSavedView[];
  officeDashboardPreferences?: OfficeDashboardPreferences[];
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  servicePlan: ServicePlanItem[];
  clients: Client[];
  requests: ServiceRequest[];
  documents: VaultDocument[];
  archiveMigrationBatches?: ArchiveMigrationBatch[];
  archiveMigrationBatchFiles?: ArchiveMigrationBatchFile[];
  renewals: RenewalRecord[];
  notes: InternalNote[];
  messages: Message[];
  tasks: Task[];
  deadlines: Deadline[];
  activity: ActivityEvent[];
  staff: StaffMember[];
  loads: Load[];
  dispatchEnrollments: DispatchEnrollment[];
  truckProfiles: TruckDispatchProfile[];
  brokerContacts: BrokerContact[];
  dispatchBillingConfigs: DispatchBillingConfig[];
  dispatchBillingEvents: DispatchBillingEvent[];
  dispatchCounters: DispatchCounters;
  factoringProviders: FactoringProvider[];
  factoringProfiles: FactoringProfile[];
  debtorAccounts: DebtorAccount[];
  freightInvoices: FreightInvoice[];
  factoringSubmissions: FactoringSubmission[];
  factoringIssues: FactoringIssue[];
  factoringCounters: FactoringCounters;
  brokerageCapability: BrokerageCapabilityState;
  shipperProfiles: ShipperProfile[];
  shipmentRequests: ShipmentRequest[];
  brokerageFreightQuotes: BrokerageFreightQuote[];
  carrierNetworkProfiles: CarrierNetworkProfile[];
  carrierOffers: CarrierOffer[];
  brokerageRateConfirmations: BrokerageRateConfirmation[];
  brokerageLoadFinancials: BrokerageLoadFinancials[];
  brokerageAccessorials: BrokerageAccessorial[];
  brokerageShipperInvoices: BrokerageShipperInvoice[];
  carrierPayables: CarrierPayable[];
  brokerageIssues: BrokerageIssue[];
  coverageHistory: CoverageHistoryEvent[];
  brokerageCounters: BrokerageCounters;
  insuranceCapability: InsuranceCapabilityState;
  insurancePartners: InsurancePartner[];
  insurancePolicies: InsurancePolicy[];
  insurancePolicyCoverages: InsurancePolicyCoverage[];
  insurancePolicyVehicles: InsurancePolicyVehicle[];
  insuranceRequests: InsuranceRequest[];
  insurancePartnerHandoffs: InsurancePartnerHandoff[];
  insuranceQuoteRecords: InsuranceQuoteRecord[];
  insuranceCertificateHolders: CertificateHolder[];
  insuranceCertificates: InsuranceCertificate[];
  insuranceIssues: InsuranceIssue[];
  insuranceCounters: InsuranceCounters;
  /** @deprecated legacy Sprint 03 mock — use brokerageFreightQuotes */
  brokerageQuotes: BrokerageQuote[];
  /** @deprecated legacy Sprint 03 mock — use canonical loads with sourceType brokerage */
  shipments: BrokerageShipment[];
  quotes: Quote[];
  invoices: BillingInvoice[];
  payments: PaymentRecord[];
  receipts: Receipt[];
  credits: CreditRecord[];
  servicePricing: ServicePricingConfig[];
  billingCounters: BillingCounters;
  notifications: AioNotification[];
  notificationPreferences: NotificationPreference[];
  roadReadyProfiles: RoadReadyProfile[];
  roadReadyItems: RoadReadyItem[];
  roadReadyHistory: RoadReadyHistoryEvent[];
  roadReadyVerifications: RoadReadyVerificationEvent[];
  powerUnits: PowerUnit[];
  trailers: Trailer[];
  drivers: DriverPlaceholder[];
  expirationEvaluatorLastRun?: string;
  billingEvaluatorLastRun?: string;
  /** Sprint 14 — workflow orchestration */
  workflowTemplates?: WorkflowTemplate[];
  workflowTemplateVersions?: WorkflowTemplateVersion[];
  documentRequirementDefs?: DocumentRequirementDef[];
  workflowInstances?: WorkflowInstance[];
  workflowStepInstances?: WorkflowStepInstance[];
  workflowEvents?: WorkflowEventRecord[];
  automationRules?: AutomationRule[];
  automationExecutions?: AutomationExecution[];
  automationExceptions?: AutomationException[];
  workflowReminders?: WorkflowReminder[];
  serviceJourneys?: ServiceJourney[];
  workflowKillSwitch?: WorkflowKillSwitch;
  /** Sprint 15 — CRM */
  crmLeadSources?: CrmLeadSource[];
  crmPipelines?: CrmPipeline[];
  crmPipelineStages?: CrmPipelineStage[];
  crmLostReasons?: CrmLostReason[];
  crmLeads?: CrmLead[];
  crmServiceInterests?: CrmServiceInterest[];
  crmOpportunities?: CrmOpportunity[];
  crmActivities?: CrmActivity[];
  crmFollowUps?: CrmFollowUp[];
  crmReferrals?: CrmReferral[];
  crmConversionRecords?: CrmConversionRecord[];
  crmSettings?: CrmSettings;
  /** Sprint 16 — Communications */
  commSettings?: CommSettings;
  commTemplates?: CommTemplate[];
  commRoutingRules?: CommRoutingRule[];
  commConversations?: CommConversation[];
  commContextLinks?: CommContextLink[];
  commParticipants?: CommParticipant[];
  commMessages?: CommMessage[];
  commDeliveries?: CommDelivery[];
  commAttachments?: CommAttachment[];
  commPreferences?: CommPreference[];
  commConsentRecords?: CommConsentRecord[];
  commSuppressions?: CommSuppression[];
  commReadStates?: CommReadState[];
  commPhoneLogs?: CommPhoneLog[];
  /** Sprint 16 — Appointments */
  appointmentSettings?: AppointmentSettings;
  appointmentTypes?: AppointmentType[];
  appointmentAvailability?: AppointmentAvailabilityRule[];
  appointments?: Appointment[];
  appointmentStatusHistory?: AppointmentStatusHistory[];
  appointmentReminders?: AppointmentReminder[];
  appointmentSlotHolds?: AppointmentSlotHold[];
  /** Sprint 17 — Management intelligence preferences (demo) */
  managementPreferences?: {
    defaultPeriodId: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    pinnedReportIds: string[];
    financialDateBasis: 'payment_date' | 'invoice_date' | 'service_completion' | 'created_at';
  };
  managementSavedReports?: { id: string; name: string; reportId: string; periodId: string; savedAt: string }[];
  managementAttentionAcks?: string[];
  /** Sprint 18 — Integration platform */
  integrationProviders?: IntegrationProvider[];
  integrationConnections?: IntegrationConnection[];
  integrationCredentialRefs?: IntegrationCredentialReference[];
  integrationExternalIds?: IntegrationExternalIdentifier[];
  integrationOperations?: IntegrationOperation[];
  integrationOperationAttempts?: IntegrationOperationAttempt[];
  integrationWebhookEvents?: IntegrationWebhookEvent[];
  integrationSyncJobs?: IntegrationSyncJob[];
  integrationSyncCursors?: IntegrationSyncCursor[];
  integrationReconciliationIssues?: IntegrationReconciliationIssue[];
  integrationConsents?: IntegrationConsent[];
  integrationHealthRecords?: IntegrationHealthRecord[];
  integrationAuditEvents?: IntegrationAuditEvent[];
  integrationMappings?: IntegrationMapping[];
  integrationResearchRecords?: IntegrationResearchRecord[];
  carrierExternalVerifications?: CarrierExternalVerification[];
  loadBoardCandidates?: LoadBoardCandidate[];
  integrationOAuthStates?: IntegrationOAuthState[];
  stateCapabilityMatrix?: StateCapabilityEntry[];
  /** Sprint 19 — Security, privacy, audit, resilience */
  securitySettings?: SecuritySettings;
  securitySessions?: SecuritySession[];
  securityFindings?: SecurityFinding[];
  securityAuditEvents?: SecurityAuditEvent[];
  privacyRequests?: PrivacyRequest[];
  securityIncidents?: SecurityIncident[];
  vendorSecurityRecords?: VendorSecurityRecord[];
  dataRetentionPolicies?: DataRetentionPolicy[];
  backupStatus?: BackupStatusRecord;
  signedDownloadGrants?: SignedDownloadGrant[];
  /** Revoked permissions per staff id (subtracted from role bundle) */
  staffPermissionOverrides?: Record<string, string[]>;
  /** Refinement 04 — Bookkeeping */
  bookkeepingSubscriptions?: BookkeepingSubscription[];
  bookkeepingCycles?: BookkeepingCycle[];
  bookkeepingReports?: BookkeepingReport[];
  booksRescueEngagements?: BooksRescueEngagement[];
  bookkeepingLeads?: BookkeepingLead[];
  bookkeepingCounters?: BookkeepingCounters;
  /** Refinement 04A — Bookkeeping Autopilot */
  financialConnections?: FinancialConnection[];
  financialAccounts?: FinancialAccount[];
  bookkeepingTransactions?: BookkeepingTransaction[];
  bookkeepingPeriods?: BookkeepingPeriod[];
  bookkeepingExceptions?: BookkeepingException[];
  customerClarifications?: CustomerClarification[];
  /** Sprint 20 — data system snapshot for health center */
  dataSystem?: Pick<DataSystemStatus, 'demoSchemaVersion' | 'seedVersion' | 'dataModeLabel'>;
}

export interface OfficeMetrics {
  newRequests: number;
  inProgress: number;
  waitingOnClient: number;
  deadlinesThisWeek: number;
  documentsNeeded: number;
  activeDispatchLoads: number;
  factoringReviews: number;
  brokerageQuotes: number;
}
