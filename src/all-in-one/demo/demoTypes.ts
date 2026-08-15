import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';

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
  | 'INTAKE_COMPLETED';

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
}

export interface DocumentMetadata {
  id: string;
  name: string;
  category: string;
  clientId: string;
  requestId?: string;
  loadId?: string;
  status: 'requested' | 'received' | 'under_review' | 'accepted' | 'rejected' | 'expired' | 'expiring_soon';
  visibility: Visibility;
  requestedAt?: string;
  receivedAt?: string;
  expirationDate?: string;
  verifiedBy?: string;
  relatedVehicle?: string;
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

export interface Deadline {
  id: string;
  label: string;
  clientId: string;
  requestId?: string;
  dueDate: string;
  severity: DeadlineSeverity;
  category: string;
  complete: boolean;
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

export interface Notification {
  id: string;
  title: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export type LoadStatus =
  | 'available'
  | 'offered'
  | 'booked'
  | 'at_pickup'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'documents_pending'
  | 'closed';

export interface DispatchLoad {
  id: string;
  loadNumber: string;
  clientId: string;
  carrierName: string;
  truck: string;
  driverPlaceholder?: string;
  broker?: string;
  origin: string;
  destination: string;
  pickup: string;
  delivery: string;
  miles: number;
  rate: number;
  status: LoadStatus;
  equipment: string;
  hasRateCon: boolean;
  hasBol: boolean;
  hasPod: boolean;
  hasInvoice: boolean;
  factoringEligible: boolean;
  notes?: string;
}

export type FactoringStatus =
  | 'inquiry'
  | 'information_needed'
  | 'invoice_review'
  | 'documents_needed'
  | 'partner_review'
  | 'approved'
  | 'funding_processing'
  | 'funded'
  | 'closed';

export interface FactoringSubmission {
  id: string;
  clientId: string;
  loadId?: string;
  requestId?: string;
  carrierName: string;
  debtorName: string;
  invoiceAmount: number;
  status: FactoringStatus;
  statusLabel: string;
  documentIds: string[];
  eligibilityStatus: string;
  partnerStatus: string;
  estimatedFee: number;
  estimatedNet: number;
  createdAt: string;
}

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

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  requestId?: string;
  service: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'past_due' | 'void';
  issuedAt: string;
  dueAt: string;
}

export interface DemoStore {
  version: 3;
  requestCounter: number;
  portalClientId?: string;
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  servicePlan: ServicePlanItem[];
  clients: Client[];
  requests: ServiceRequest[];
  documents: DocumentMetadata[];
  notes: InternalNote[];
  messages: Message[];
  tasks: Task[];
  deadlines: Deadline[];
  activity: ActivityEvent[];
  staff: StaffMember[];
  loads: DispatchLoad[];
  factoringSubmissions: FactoringSubmission[];
  brokerageQuotes: BrokerageQuote[];
  shipments: BrokerageShipment[];
  invoices: Invoice[];
  notifications: Notification[];
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
