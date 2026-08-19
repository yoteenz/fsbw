import type { CurrencyCode } from '../billing/money';
import type { AccessorialType, LoadOperationalStatus } from '../dispatch/dispatchTypes';

export type BrokerageCapability = 'disabled' | 'demo' | 'prelaunch' | 'active';

export type BrokerageReadinessItemStatus = 'missing' | 'pending' | 'complete' | 'not_applicable';

export interface BrokerageReadinessItem {
  key: string;
  label: string;
  status: BrokerageReadinessItemStatus;
  notes?: string;
}

export interface BrokerageCapabilityState {
  capability: BrokerageCapability;
  readinessItems: BrokerageReadinessItem[];
  updatedAt: string;
  updatedByStaffId?: string;
}

export type ShipperStatus = 'lead' | 'onboarding' | 'active' | 'paused' | 'inactive';
export type AgreementStatus = 'not_required' | 'pending' | 'sent' | 'accepted' | 'expired' | 'terminated';

export interface ShipperProfile {
  id: string;
  organizationId: string;
  legalName: string;
  dba?: string;
  primaryContactName: string;
  primaryPhone?: string;
  primaryEmail: string;
  billingContactName?: string;
  billingEmail?: string;
  businessAddress?: string;
  billingAddress?: string;
  preferredFreightTypes?: string[];
  preferredEquipment?: string[];
  typicalLanes?: string;
  specialInstructions?: string;
  paymentTermsNote?: string;
  status: ShipperStatus;
  agreementStatus: AgreementStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentRequestStatus =
  | 'draft'
  | 'submitted'
  | 'info_required'
  | 'under_review'
  | 'quote_pending'
  | 'quote_preparation'
  | 'quoted'
  | 'quote_sent'
  | 'awaiting_shipper_approval'
  | 'accepted'
  | 'approved'
  | 'declined'
  | 'expired'
  | 'cancelled'
  | 'converted_to_load';

export type LoadFullPartial = 'full' | 'partial';

export interface ShipmentRequest {
  id: string;
  requestNumber: string;
  shipperOrganizationId: string;
  status: ShipmentRequestStatus;
  pickupCompany?: string;
  pickupAddress?: string;
  pickupCity: string;
  pickupState: string;
  pickupZip?: string;
  pickupDate: string;
  pickupTimeStart?: string;
  pickupTimeEnd?: string;
  pickupAppointmentType?: 'fcfs' | 'appointment' | 'unknown';
  pickupContactName?: string;
  pickupContactPhone?: string;
  deliveryCompany?: string;
  deliveryAddress?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip?: string;
  deliveryDate: string;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  deliveryAppointmentType?: 'fcfs' | 'appointment' | 'unknown';
  deliveryContactName?: string;
  deliveryContactPhone?: string;
  equipmentType: string;
  trailerLengthFt?: number;
  fullPartial?: LoadFullPartial;
  commodity?: string;
  weight?: string;
  pieces?: string;
  palletCount?: number;
  temperatureRequirements?: string;
  hazmatSelfReported?: boolean;
  specialHandling?: string;
  specialInstructions?: string;
  referenceNumbers?: string;
  shipperReference?: string;
  poNumber?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  documentIds: string[];
  assignedBrokerStaffId?: string;
  convertedLoadId?: string;
  templateId?: string;
  openInfoRequestId?: string;
  priority?: 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ShipmentRequestTemplate {
  id: string;
  shipperOrganizationId: string;
  label: string;
  snapshot: Partial<Omit<ShipmentRequest, 'id' | 'requestNumber' | 'status' | 'createdAt' | 'updatedAt' | 'version'>>;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerageInfoRequest {
  id: string;
  shipmentRequestId: string;
  missingFields: string[];
  message: string;
  status: 'open' | 'resolved';
  createdByStaffId: string;
  createdAt: string;
  resolvedAt?: string;
}

export type BrokerageAuditEntityType = 'shipment_request' | 'quote' | 'load';

export interface BrokerageAuditEvent {
  id: string;
  entityType: BrokerageAuditEntityType;
  entityId: string;
  action: string;
  actorType: 'shipper' | 'staff' | 'system';
  actorId?: string;
  note?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export type LoadDistributionStrategy =
  | 'hold'
  | 'publish_load_board'
  | 'private_invite'
  | 'matched_carriers';

export interface BrokerageQuotePricingDraft {
  shipperRateMinor: number;
  targetCarrierRateMinor: number;
  estimatedMarginMinor: number;
  estimatedMarginPercent: number | null;
  termsNote?: string;
  validUntil?: string;
}

export interface BrokerageQuotePricingDraftRecord extends BrokerageQuotePricingDraft {
  quoteId: string;
  requestId: string;
}

export type BrokerageQuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'revised'
  | 'converted';

export interface BrokerageQuoteRevision {
  id: string;
  quoteId: string;
  version: number;
  freightChargeMinor: number;
  accessorialNotes?: string;
  expiresAt?: string;
  preparedByStaffId?: string;
  createdAt: string;
}

export interface BrokerageFreightQuote {
  id: string;
  quoteNumber: string;
  shipmentRequestId: string;
  shipperOrganizationId: string;
  status: BrokerageQuoteStatus;
  freightChargeMinor: number;
  currency: CurrencyCode;
  accessorialNotes?: string;
  expiresAt?: string;
  currentRevision: number;
  revisions: BrokerageQuoteRevision[];
  acceptedRevisionId?: string;
  convertedLoadId?: string;
  preparedByStaffId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type CarrierNetworkStatus =
  | 'prospect'
  | 'onboarding'
  | 'approved_internal'
  | 'active'
  | 'hold'
  | 'do_not_use'
  | 'inactive';

export type VerificationLevel = 'self_reported' | 'document_reviewed' | 'staff_verified' | 'external_verified_future';

export interface CarrierNetworkProfile {
  id: string;
  organizationId?: string;
  legalName: string;
  dba?: string;
  usdot?: string;
  mcNumber?: string;
  primaryContactName?: string;
  dispatchContactName?: string;
  phone?: string;
  email?: string;
  equipmentTypes: string[];
  serviceRegions?: string[];
  preferredLanes?: string;
  authorityVerification: VerificationLevel;
  insuranceVerification: VerificationLevel;
  w9Status: 'missing' | 'received' | 'verified';
  agreementStatus: AgreementStatus;
  status: CarrierNetworkStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CarrierOfferStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'expired'
  | 'revised';

export interface CarrierOfferRevision {
  id: string;
  offerId: string;
  version: number;
  carrierPayMinor: number;
  createdAt: string;
  createdByStaffId?: string;
}

export interface CarrierOffer {
  id: string;
  loadId: string;
  carrierNetworkProfileId: string;
  carrierOrganizationId?: string;
  status: CarrierOfferStatus;
  carrierPayMinor: number;
  currency: CurrencyCode;
  currentRevision: number;
  revisions: CarrierOfferRevision[];
  specialInstructions?: string;
  sentAt?: string;
  respondedAt?: string;
  createdByStaffId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type RateConfirmationStatus = 'not_sent' | 'sent' | 'accepted' | 'declined' | 'expired';

export interface BrokerageRateConfirmation {
  id: string;
  loadId: string;
  carrierOfferId: string;
  status: RateConfirmationStatus;
  templateLabel: string;
  carrierPayMinor: number;
  sentAt?: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BrokerageCoverageStatus =
  | 'not_applicable'
  | 'needs_coverage'
  | 'carrier_contacted'
  | 'rate_negotiation'
  | 'carrier_offered'
  | 'carrier_accepted'
  | 'booked';

export interface CoverageHistoryEvent {
  id: string;
  loadId: string;
  kind: 'contacted' | 'offer_sent' | 'declined' | 'accepted' | 'fall_off' | 'note';
  carrierNetworkProfileId?: string;
  carrierOfferId?: string;
  summary: string;
  actorStaffId?: string;
  createdAt: string;
}

export interface BrokerageLoadFinancials {
  loadId: string;
  shipperChargeMinor: number;
  carrierLinehaulMinor: number;
  carrierFuelSurchargeMinor: number;
  carrierAccessorialMinor: number;
  totalCarrierPayMinor: number;
  confirmedShipperChargeMinor: number;
  confirmedCarrierPayMinor: number;
  currency: CurrencyCode;
  version: number;
  updatedAt: string;
}

export type BrokerageAccessorialSide = 'shipper' | 'carrier';
export type BrokerageAccessorialStatus =
  | 'reported'
  | 'documentation_needed'
  | 'requested'
  | 'approved'
  | 'denied'
  | 'billed_future'
  | 'paid_future';

export interface BrokerageAccessorial {
  id: string;
  loadId: string;
  side: BrokerageAccessorialSide;
  type: AccessorialType;
  amountMinor: number;
  status: BrokerageAccessorialStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BrokerageShipperInvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'past_due'
  | 'disputed'
  | 'void';

export interface BrokerageShipperInvoice {
  id: string;
  organizationId: string;
  loadId: string;
  shipperOrganizationId: string;
  invoiceNumber: string;
  baseFreightChargeMinor: number;
  accessorialsMinor: number;
  adjustmentsMinor: number;
  totalMinor: number;
  paidAmountMinor: number;
  balanceMinor: number;
  currency: CurrencyCode;
  status: BrokerageShipperInvoiceStatus;
  invoiceDate: string;
  dueDate?: string;
  podDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type CarrierPayableStatus =
  | 'pending_documents'
  | 'pending_approval'
  | 'approved'
  | 'scheduled_future'
  | 'paid_future'
  | 'disputed'
  | 'hold'
  | 'cancelled';

export interface CarrierPayable {
  id: string;
  loadId: string;
  carrierNetworkProfileId: string;
  carrierOrganizationId?: string;
  confirmedAmountMinor: number;
  accessorialAmountMinor: number;
  deductionsMinor: number;
  totalPayableMinor: number;
  currency: CurrencyCode;
  status: CarrierPayableStatus;
  paymentTermsNote?: string;
  eligibleAt?: string;
  paidAt?: string;
  externalReference?: string;
  factoringAssignmentOnFile?: boolean;
  paymentDestinationProtected?: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type BrokerageIssueType =
  | 'carrier_fell_off'
  | 'pickup_delay'
  | 'delivery_delay'
  | 'facility_issue'
  | 'rate_dispute'
  | 'carrier_issue'
  | 'shipper_issue'
  | 'cargo_issue'
  | 'pod_issue'
  | 'accessorial_dispute'
  | 'payment_issue'
  | 'other';

export type BrokerageIssueSeverity = 'normal' | 'attention' | 'urgent';
export type BrokerageIssueStatus = 'open' | 'monitoring' | 'resolved';

export interface BrokerageIssue {
  id: string;
  loadId: string;
  type: BrokerageIssueType;
  severity: BrokerageIssueSeverity;
  status: BrokerageIssueStatus;
  summary: string;
  customerVisible?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerageCounters {
  shipmentRequest: number;
  freightQuote: number;
  shipperInvoice: number;
}

/** Metadata on canonical Load — stored separately for clarity */
export interface BrokerageLoadLink {
  loadId: string;
  shipperOrganizationId: string;
  shipmentRequestId?: string;
  brokerageQuoteId?: string;
  coverageStatus: BrokerageCoverageStatus;
  assignedBrokerStaffId?: string;
  carrierNetworkProfileId?: string;
  carrierOrganizationId?: string;
  activeCarrierOfferId?: string;
  rateConfirmationId?: string;
  brokerageOperationalStatus?: LoadOperationalStatus;
}
