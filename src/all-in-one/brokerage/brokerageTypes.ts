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
  | 'under_review'
  | 'quote_pending'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'converted_to_load';

export interface ShipmentRequest {
  id: string;
  requestNumber: string;
  shipperOrganizationId: string;
  status: ShipmentRequestStatus;
  pickupCompany?: string;
  pickupCity: string;
  pickupState: string;
  pickupDate: string;
  pickupTimeStart?: string;
  pickupTimeEnd?: string;
  deliveryCompany?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryDate: string;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  equipmentType: string;
  commodity?: string;
  weight?: string;
  pieces?: string;
  temperatureRequirements?: string;
  hazmatSelfReported?: boolean;
  specialInstructions?: string;
  referenceNumbers?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  documentIds: string[];
  assignedBrokerStaffId?: string;
  convertedLoadId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
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
