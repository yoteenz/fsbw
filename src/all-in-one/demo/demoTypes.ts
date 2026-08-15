import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import type { AioNotification, NotificationPreference } from '../notifications/notificationTypes';
import type { RenewalRecord } from '../renewals/renewalTypes';
import type { VaultDocument } from '../vault/vaultTypes';
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
  DriverPlaceholder,
  PowerUnit,
  RoadReadyHistoryEvent,
  RoadReadyItem,
  RoadReadyProfile,
  RoadReadyVerificationEvent,
  Trailer,
} from '../road-ready/roadReadyTypes';

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
  status: 'available' | 'busy' | 'away';
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
  authorId: string;
  authorInitials: string;
  body: string;
  createdAt: string;
  visibility: 'internal';
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

export interface DemoStore {
  version: 10;
  requestCounter: number;
  portalClientId?: string;
  shipperPortalOrgId?: string;
  /** Demo default org for carrier brokerage portal (Heartland Freight). */
  brokeragePortalClientId?: string;
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  servicePlan: ServicePlanItem[];
  clients: Client[];
  requests: ServiceRequest[];
  documents: VaultDocument[];
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
