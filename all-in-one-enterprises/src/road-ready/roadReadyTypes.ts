export type RoadReadyCategory =
  | 'business'
  | 'authority'
  | 'registration'
  | 'tax_fuel'
  | 'insurance'
  | 'permits'
  | 'fleet'
  | 'ongoing'
  | 'operate';

export type RoadReadyItemStatus =
  | 'not_started'
  | 'action_needed'
  | 'in_progress'
  | 'needs_review'
  | 'completed'
  | 'optional'
  | 'not_applicable';

export type VerificationStatus =
  | 'unverified'
  | 'self_reported'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'expired';

export type ItemSource =
  | 'customer_reported'
  | 'staff_verified'
  | 'document_verified'
  | 'service_request'
  | 'system_recommendation'
  | 'external_source_future';

export type RoadReadyProfileMode =
  | 'onboarding'
  | 'active'
  | 'attention_required'
  | 'review_required'
  | 'monitoring';

export type YesNoProgress = 'yes' | 'no' | 'in_progress' | 'not_sure';

export type ExpirationState = 'active' | 'expiring_soon' | 'expired' | 'unknown';

export type VehicleReadiness = 'ready' | 'needs_attention' | 'incomplete' | 'unknown';

export interface BusinessProfile {
  legalName: string;
  dba?: string;
  structure?: string;
  formationState?: string;
  primaryOperatingState?: string;
  businessStatus?: string;
  startDate?: string;
  address?: string;
  mailingAddress?: string;
  phone?: string;
  email?: string;
  einStatus?: YesNoProgress;
}

export interface OperatingProfile {
  operationType?: 'owner_operator' | 'motor_carrier' | 'fleet' | 'shipper' | 'other';
  scope?: 'intrastate' | 'interstate' | 'both' | 'not_sure';
  currentlyOperating?: 'yes' | 'no' | 'preparing' | 'inactive';
  equipmentTypes?: string[];
  freightTypes?: string[];
  primaryStates?: string[];
  fleetSize?: number;
}

export interface AuthorityProfile {
  usdot?: YesNoProgress;
  usdotNumber?: string;
  mc?: YesNoProgress;
  mcNumber?: string;
  boc3?: YesNoProgress;
}

export interface RegistrationProfile {
  vehicleRegistration?: YesNoProgress;
  irp?: YesNoProgress;
  commercialTags?: YesNoProgress;
  trailerRegistration?: YesNoProgress;
}

export interface TaxFuelProfile {
  ifta?: YesNoProgress;
  highwayTax?: YesNoProgress;
  stateTaxAccounts?: YesNoProgress;
}

export interface InsuranceProfile {
  hasInsurance?: YesNoProgress;
  carrierName?: string;
  expirationDate?: string;
  coverageTypes?: string[];
}

export interface PermitsProfile {
  tripPermits?: YesNoProgress;
  temporaryPermits?: YesNoProgress;
  statePermits?: YesNoProgress;
  oversize?: YesNoProgress;
  notSure?: boolean;
}

export interface PowerUnit {
  id: string;
  organizationId: string;
  nickname: string;
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
  plate?: string;
  plateState?: string;
  gvwr?: string;
  ownership?: 'owned' | 'financed' | 'leased' | 'other';
  status?: 'active' | 'inactive' | 'sold';
  readiness?: VehicleReadiness;
}

export interface Trailer {
  id: string;
  organizationId: string;
  number: string;
  year?: string;
  make?: string;
  type?: string;
  plate?: string;
  plateState?: string;
  status?: 'active' | 'inactive';
}

export interface DriverPlaceholder {
  id: string;
  organizationId: string;
  name: string;
  phone?: string;
  email?: string;
  assignedUnitId?: string;
  status?: 'active' | 'inactive';
}

export interface RoadReadyProfile {
  organizationId: string;
  mode: RoadReadyProfileMode;
  onboardingStep: number;
  onboardingComplete: boolean;
  onboardingSkipped?: boolean;
  ruleVersion: string;
  business: BusinessProfile;
  operating: OperatingProfile;
  authority: AuthorityProfile;
  registration: RegistrationProfile;
  taxFuel: TaxFuelProfile;
  insurance: InsuranceProfile;
  permits: PermitsProfile;
  createdAt: string;
  updatedAt: string;
  lastCustomerUpdateAt?: string;
}

export interface RoadReadyItem {
  id: string;
  organizationId: string;
  scopeType: 'organization' | 'vehicle' | 'driver';
  scopeId?: string;
  category: RoadReadyCategory;
  requirementKey: string;
  title: string;
  description?: string;
  status: RoadReadyItemStatus;
  verificationStatus: VerificationStatus;
  source: ItemSource;
  reason?: string;
  applicable: boolean;
  requiredForProgress: boolean;
  weight: number;
  expiresAt?: string;
  verifiedAt?: string;
  verifiedByStaffId?: string;
  serviceSlug?: string;
  serviceRequestId?: string;
  documentId?: string;
  updatedAt: string;
}

export interface RoadReadyVerificationEvent {
  id: string;
  organizationId: string;
  itemId: string;
  staffId?: string;
  staffName?: string;
  previousVerification: VerificationStatus;
  newVerification: VerificationStatus;
  previousStatus?: RoadReadyItemStatus;
  newStatus?: RoadReadyItemStatus;
  documentId?: string;
  note?: string;
  createdAt: string;
  visibility: 'customer' | 'internal';
}

export interface RoadReadyHistoryEvent {
  id: string;
  organizationId: string;
  eventType: string;
  title: string;
  detail?: string;
  visibility: 'customer' | 'internal';
  createdAt: string;
}

export interface RoadReadyScores {
  setupProgress: number;
  verifiedProgress: number;
  verifiedCount: number;
  selfReportedCount: number;
  needsAttentionCount: number;
  inProgressCount: number;
  optionalCount: number;
}

export interface RoadReadyAttentionItem {
  itemId: string;
  title: string;
  category: RoadReadyCategory;
  reason: string;
  priority: number;
  action: 'upload' | 'request_help' | 'update_status' | 'message' | 'review';
  serviceSlug?: string;
}

export interface CategorySummary {
  category: RoadReadyCategory;
  label: string;
  setupProgress: number;
  verifiedCount: number;
  attentionCount: number;
  nextAction?: string;
  items: RoadReadyItem[];
}
