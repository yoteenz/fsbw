/**
 * AIO DriverLink — domain types
 * Recruiting / matching platform connecting drivers with motor carriers.
 */

export type DriverMarketplaceStatus =
  | 'draft'
  | 'profile_incomplete'
  | 'under_review'
  | 'active'
  | 'paused'
  | 'unavailable'
  | 'hired'
  | 'suspended'
  | 'archived';

export type DriverCredentialVerificationStatus =
  | 'not_provided'
  | 'uploaded'
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'expiring_soon'
  | 'needs_update'
  | 'employer_action_required';

export type JobOpportunityStatus =
  | 'draft'
  | 'published'
  | 'paused'
  | 'filled'
  | 'closed'
  | 'expired'
  | 'archived';

export type DriverApplicationStatus =
  | 'matched'
  | 'saved'
  | 'invited'
  | 'application_started'
  | 'application_submitted'
  | 'under_review'
  | 'documents_needed'
  | 'interview_requested'
  | 'interview_scheduled'
  | 'conditional_offer'
  | 'employer_compliance'
  | 'hired'
  | 'not_selected'
  | 'withdrawn'
  | 'closed';

export type ClearinghouseWorkflowStatus =
  | 'not_started'
  | 'employer_action_required'
  | 'consent_pending'
  | 'query_in_progress'
  | 'completed';

export type EmployerDataAccessLevel =
  | 'profile_only'
  | 'application_data'
  | 'selected_credentials'
  | 'employer_compliance_access'
  | 'active_driver_access';

export type CompensationType = 'per_mile' | 'percentage' | 'salary' | 'hourly' | 'per_load' | 'custom';

export interface DriverProfile {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  homeCity?: string;
  homeState?: string;
  preferredRegions: string[];
  preferredLanes: string[];
  routePreference: 'local' | 'regional' | 'otr' | 'any';
  soloTeamPreference: 'solo' | 'team' | 'either';
  employmentPreference: 'company_driver' | 'owner_operator' | 'either';
  cdlClass: 'A' | 'B' | 'C' | 'unknown';
  endorsements: string[];
  yearsExperience: number;
  equipmentExperience: string[];
  availabilityDate?: string;
  homeTimePreference?: string;
  workHistorySummary?: string;
  profileVisibility: 'public_match' | 'paused' | 'hidden' | 'invite_only';
  marketplaceStatus: DriverMarketplaceStatus;
  preferredLanguage?: 'en-US' | 'es-US';
  createdAt: string;
  updatedAt: string;
}

export interface DriverCredential {
  id: string;
  driverProfileId: string;
  credentialType: string;
  documentId?: string;
  credentialNumberMasked?: string;
  issuingAuthority?: string;
  jurisdiction?: string;
  issueDate?: string;
  expirationDate?: string;
  verificationStatus: DriverCredentialVerificationStatus;
  reviewStatus?: string;
  clearinghouseStatus?: ClearinghouseWorkflowStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOpportunity {
  id: string;
  organizationId: string;
  createdByUserId?: string;
  jobTitle: string;
  status: JobOpportunityStatus;
  driverType: 'company_driver' | 'owner_operator' | 'either';
  cdlClassRequired: 'A' | 'B' | 'C' | 'any';
  endorsementsRequired: string[];
  equipmentType: string[];
  routeType: 'local' | 'regional' | 'otr';
  baseLocation?: { city?: string; stateCode?: string };
  serviceRegions: string[];
  lanes: string[];
  homeTime?: string;
  experienceRequiredYears?: number;
  compensationType?: CompensationType;
  compensationRange?: string;
  startDate?: string;
  numberOfPositions: number;
  description: string;
  requirements?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverJobMatch {
  id: string;
  driverProfileId: string;
  opportunityId: string;
  matchScore: number;
  matchFactors: Record<string, string | boolean>;
  eligible: boolean;
  createdAt: string;
}

export interface DriverApplication {
  id: string;
  driverProfileId: string;
  opportunityId: string;
  organizationId: string;
  status: DriverApplicationStatus;
  matchId?: string;
  consentGrantedAt?: string;
  consentScope: string[];
  employerAccessLevel: EmployerDataAccessLevel;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverConsentRecord {
  id: string;
  applicationId: string;
  driverProfileId: string;
  organizationId: string;
  scope: string[];
  grantedAt: string;
  grantedByUserId?: string;
}

export interface DriverLinkCounters {
  applicationSeq: number;
  opportunitySeq: number;
}

export interface DriverLinkDemoContext {
  activeDriverProfileId: string;
  activeCompanyOrgId: string;
}

export interface DriverPublicProfileView {
  displayName: string;
  generalLocation?: string;
  cdlClass: string;
  endorsements: string[];
  yearsExperience: number;
  equipmentExperience: string[];
  availabilityDate?: string;
  routePreference: string;
  summary?: string;
  credentialSummary: { type: string; status: DriverCredentialVerificationStatus }[];
}
