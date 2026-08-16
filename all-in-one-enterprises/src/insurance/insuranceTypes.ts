/** All In One Insurance domain — assistance/referral/partner; not carrier/underwriter. */

export type InsuranceOperatingMode = 'assistance' | 'referral' | 'partner' | 'direct_future';

export type InsuranceCapability = 'demo' | 'assistance' | 'partner' | 'direct_disabled';

export type InsuranceReadinessItemStatus = 'missing' | 'pending' | 'complete' | 'not_applicable';

export interface InsuranceReadinessItem {
  key: string;
  label: string;
  status: InsuranceReadinessItemStatus;
  notes?: string;
}

export interface InsuranceCapabilityState {
  capability: InsuranceCapability;
  operatingMode: InsuranceOperatingMode;
  readinessItems: InsuranceReadinessItem[];
  updatedAt: string;
  updatedByStaffId?: string;
}

export type InsuranceVerificationState =
  | 'customer_reported'
  | 'document_supported'
  | 'staff_reviewed'
  | 'partner_confirmed_future';

export type InsurancePolicyStatus =
  | 'pending'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'cancelled'
  | 'replaced'
  | 'unknown';

export type InsurancePolicySource =
  | 'customer_intake'
  | 'staff_entry'
  | 'partner_reported'
  | 'document_import';

export type CoverageType =
  | 'auto_liability'
  | 'cargo'
  | 'physical_damage'
  | 'general_liability'
  | 'bobtail'
  | 'trailer_interchange'
  | 'workers_comp'
  | 'occupational_accident'
  | 'umbrella'
  | 'other';

export interface InsurancePolicy {
  id: string;
  organizationId: string;
  policyType: string;
  carrierName: string;
  agencyName?: string;
  producerName?: string;
  policyNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  status: InsurancePolicyStatus;
  verificationState: InsuranceVerificationState;
  source: InsurancePolicySource;
  replacedByPolicyId?: string;
  replacesPolicyId?: string;
  documentIds: string[];
  namedInsured?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface InsurancePolicyCoverage {
  id: string;
  policyId: string;
  coverageType: CoverageType;
  limitMinor?: number;
  deductibleMinor?: number;
  status: 'active' | 'pending' | 'expired' | 'unknown';
  notes?: string;
  verificationState: InsuranceVerificationState;
}

export interface InsurancePolicyVehicle {
  id: string;
  policyId: string;
  powerUnitId: string;
  organizationId: string;
}

export type InsuranceRequestType =
  | 'new_coverage'
  | 'renewal_help'
  | 'add_vehicle'
  | 'remove_vehicle'
  | 'certificate_request'
  | 'coverage_question'
  | 'policy_update'
  | 'partner_referral'
  | 'other';

export type InsuranceRequestStatus =
  | 'draft'
  | 'submitted'
  | 'information_needed'
  | 'internal_review'
  | 'ready_for_referral'
  | 'referred'
  | 'partner_review'
  | 'quote_options_reported'
  | 'customer_review'
  | 'policy_selected_external'
  | 'policy_setup'
  | 'completed'
  | 'declined'
  | 'cancelled';

export interface InsuranceRequest {
  id: string;
  requestNumber: string;
  organizationId: string;
  requestType: InsuranceRequestType;
  status: InsuranceRequestStatus;
  coverageNeeds?: CoverageType[];
  coverageNeedNotes?: string;
  selectedPowerUnitIds: string[];
  existingPolicyId?: string;
  assignedCoordinatorStaffId?: string;
  partnerId?: string;
  partnerHandoffId?: string;
  documentIds: string[];
  operationsNotes?: string;
  customerVisibleNotes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export type InsurancePartnerStatus = 'prospective' | 'approved_relationship' | 'customer_existing_agent' | 'inactive';

export type InsurancePartnerRelationshipType = 'referral' | 'coordination' | 'existing_agent';

export interface InsurancePartner {
  id: string;
  agencyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  websiteReference?: string;
  relationshipType: InsurancePartnerRelationshipType;
  status: InsurancePartnerStatus;
  statesServed?: string[];
  commercialTrucking: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnerHandoffStatus =
  | 'draft'
  | 'ready'
  | 'sent_manual'
  | 'acknowledged_future'
  | 'additional_info_needed'
  | 'response_received'
  | 'closed';

export interface InsurancePartnerHandoff {
  id: string;
  requestId: string;
  partnerId: string;
  status: PartnerHandoffStatus;
  sentAt?: string;
  externalReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InsuranceQuoteSource =
  | 'partner_reported'
  | 'document_supported'
  | 'staff_entered_from_partner'
  | 'future_api';

export type InsuranceQuoteStatus =
  | 'reported'
  | 'available'
  | 'customer_review'
  | 'selected'
  | 'declined'
  | 'expired'
  | 'withdrawn';

export interface InsuranceQuoteRecord {
  id: string;
  requestId: string;
  partnerId?: string;
  insuranceCarrierName: string;
  quoteReference?: string;
  premiumMinor?: number;
  billingFrequency?: string;
  downPaymentMinor?: number;
  coverageSummary?: string;
  effectiveDate?: string;
  expirationDate?: string;
  status: InsuranceQuoteStatus;
  source: InsuranceQuoteSource;
  documentIds: string[];
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type CertificateStatus = 'requested' | 'processing' | 'issued' | 'rejected' | 'expired' | 'cancelled';

export interface CertificateHolder {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  email?: string;
  holderType: 'broker' | 'shipper' | 'facility' | 'other';
  relatedOrganizationId?: string;
  createdAt: string;
}

export interface InsuranceCertificate {
  id: string;
  organizationId: string;
  policyId?: string;
  certificateHolderId: string;
  status: CertificateStatus;
  requestedAt: string;
  issuedAt?: string;
  expirationReference?: string;
  documentId?: string;
  source: InsuranceQuoteSource | 'customer_request';
  loadReference?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type InsuranceIssueType =
  | 'missing_policy_document'
  | 'missing_coi'
  | 'policy_expiring'
  | 'policy_expired'
  | 'vehicle_coverage_review'
  | 'coverage_info_needed'
  | 'partner_info_needed'
  | 'quote_clarification'
  | 'certificate_holder_info'
  | 'policy_verification_needed'
  | 'other';

export type InsuranceIssueStatus = 'open' | 'waiting_on_customer' | 'waiting_on_partner' | 'staff_review' | 'resolved';

export interface InsuranceIssue {
  id: string;
  organizationId: string;
  requestId?: string;
  policyId?: string;
  type: InsuranceIssueType;
  status: InsuranceIssueStatus;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceCounters {
  request: number;
  policy: number;
  certificate: number;
}

/** Future-only credential tracking — not customer-facing. */
export interface InsuranceCredential {
  id: string;
  holderStaffId: string;
  credentialType: string;
  state?: string;
  licenseNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  verificationSource?: string;
  verificationDate?: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
}
