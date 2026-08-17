/**
 * AIO FleetCare Network — domain types
 * Marketplace + referral platform connecting clients with independent repair providers.
 */

export type FleetCareTicketStatus =
  | 'draft'
  | 'submitted'
  | 'searching'
  | 'matched'
  | 'provider_reviewing'
  | 'provider_accepted'
  | 'provider_declined'
  | 'awaiting_estimate'
  | 'estimate_sent'
  | 'awaiting_customer_authorization'
  | 'authorized'
  | 'scheduled'
  | 'in_service'
  | 'awaiting_parts'
  | 'on_hold'
  | 'completed'
  | 'customer_confirmed'
  | 'cancelled'
  | 'disputed'
  | 'closed';

export type FleetCareUrgency = 'routine' | 'soon' | 'today' | 'roadside_urgent';
export type FleetCareDrivableStatus = 'yes' | 'no' | 'unknown';
export type FleetCareLeadSource =
  | 'aio_marketplace'
  | 'provider_direct'
  | 'preexisting_relationship'
  | 'manual_assignment';

export type ProviderVerificationStatus =
  | 'unverified'
  | 'pending_review'
  | 'aio_verified'
  | 'suspended'
  | 'expired_documents_required'
  | 'rejected';

export type ReferralFeeStatus =
  | 'pending'
  | 'calculated'
  | 'invoiced'
  | 'paid'
  | 'waived'
  | 'disputed'
  | 'refunded';

export type PreexistingRelationshipReview =
  | 'declared'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'disputed';

export interface FleetCareServiceCategory {
  code: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export interface ServiceProvider {
  id: string;
  organizationId?: string;
  businessName: string;
  providerType: string;
  verificationStatus: ProviderVerificationStatus;
  providerTier: 'founding' | 'standard' | 'pro' | 'enterprise';
  phone?: string;
  email?: string;
  website?: string;
  mobileServiceAvailable: boolean;
  shopServiceAvailable: boolean;
  emergencyAvailable: boolean;
  applicationStatus: string;
  active: boolean;
  agreementVersion?: string;
  agreementAcceptedAt?: string;
  serviceCategoryCodes: string[];
  primaryLocation?: ServiceProviderLocation;
  serviceAreas: ServiceProviderServiceArea[];
}

export interface ServiceProviderLocation {
  id: string;
  providerId: string;
  label: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
}

export interface ServiceProviderServiceArea {
  id: string;
  providerId: string;
  areaType: 'radius' | 'state' | 'city' | 'postal';
  radiusMiles?: number;
  stateCode?: string;
  city?: string;
  postalCode?: string;
  centerLatitude?: number;
  centerLongitude?: number;
}

export interface ServiceProviderUser {
  id: string;
  providerId: string;
  userId: string;
  role: 'owner' | 'manager' | 'technician' | 'coordinator';
  status: 'active' | 'inactive';
}

export interface ServiceProviderCredential {
  id: string;
  providerId: string;
  credentialType: string;
  jurisdiction?: string;
  expirationDate?: string;
  verificationStatus: string;
}

export interface ServiceProviderInsurance {
  id: string;
  providerId: string;
  coverageType: string;
  insurer?: string;
  expirationDate?: string;
  verificationStatus: string;
}

export interface FleetCareTicketLocation {
  label?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  clientOrganizationId: string;
  requesterUserId?: string;
  vehicleId: string;
  serviceCategoryCode: string;
  issueDescription: string;
  drivableStatus: FleetCareDrivableStatus;
  location: FleetCareTicketLocation;
  urgency: FleetCareUrgency;
  status: FleetCareTicketStatus;
  providerId?: string;
  assignedAt?: string;
  leadSource: FleetCareLeadSource;
  aioOriginated: boolean;
  preexistingRelationshipId?: string;
  customerContactReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketEvent {
  id: string;
  ticketId: string;
  eventType: string;
  fromStatus?: FleetCareTicketStatus;
  toStatus?: FleetCareTicketStatus;
  actorType: 'client' | 'provider' | 'system' | 'staff';
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface TicketMatch {
  id: string;
  ticketId: string;
  providerId: string;
  matchScore: number;
  eligible: boolean;
  matchReason: Record<string, unknown>;
}

export interface RepairEstimateLineItem {
  id: string;
  lineType: 'labor' | 'parts' | 'shop_fee' | 'mobile_fee' | 'towing' | 'tax' | 'other';
  description: string;
  quantity: number;
  unitAmountMinor: number;
  totalMinor: number;
}

export interface RepairEstimate {
  id: string;
  ticketId: string;
  providerId: string;
  version: number;
  status: 'draft' | 'sent' | 'approved' | 'declined' | 'superseded';
  lineItems: RepairEstimateLineItem[];
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  notes?: string;
  expiresAt?: string;
  isChangeOrder: boolean;
  parentEstimateId?: string;
  createdAt: string;
}

export interface CustomerAuthorization {
  id: string;
  ticketId: string;
  estimateId: string;
  decision: 'approve' | 'decline' | 'clarification';
  authorizedAmountMinor?: number;
  notes?: string;
  createdAt: string;
}

export interface ServiceJob {
  id: string;
  ticketId: string;
  providerId: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  finalAmountMinor?: number;
  mileageAtService?: number;
  workSummary?: string;
}

export interface RepairRecord {
  id: string;
  jobId: string;
  vehicleId: string;
  organizationId: string;
  providerId: string;
  serviceCategoryCode: string;
  summary: string;
  mileageAtService?: number;
  completedAt: string;
  documentIds: string[];
}

export interface ReferralTransaction {
  id: string;
  ticketId: string;
  jobId?: string;
  providerId: string;
  clientOrganizationId: string;
  leadSource: FleetCareLeadSource;
  aioOriginated: boolean;
  preexistingRelationship: boolean;
  grossServiceValueMinor: number;
  feeRate: number;
  feeAmountMinor: number;
  feeStatus: ReferralFeeStatus;
  earnedAt?: string;
  paidAt?: string;
}

export interface PreexistingCustomerRelationship {
  id: string;
  providerId: string;
  clientOrganizationId: string;
  relationshipDeclaredAt: string;
  relationshipStartDate?: string;
  evidenceNotes?: string;
  reviewStatus: PreexistingRelationshipReview;
}

export interface FleetCareCounters {
  ticketSeq: number;
}

export interface FleetCareDemoContext {
  /** Demo provider portal user maps to this provider */
  activeProviderId: string;
}
