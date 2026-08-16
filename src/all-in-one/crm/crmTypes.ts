/** Canonical CRM types — Sprint 15 */

export type CrmLeadType =
  | 'owner_operator'
  | 'new_trucking_business'
  | 'existing_carrier'
  | 'fleet'
  | 'shipper'
  | 'brokerage_carrier'
  | 'general_business'
  | 'unknown';

export type CrmLeadStatus =
  | 'new'
  | 'contact_attempted'
  | 'contacted'
  | 'qualifying'
  | 'qualified'
  | 'unqualified'
  | 'nurturing'
  | 'converted'
  | 'lost'
  | 'do_not_contact';

export type CrmLeadSourceSlug =
  | 'website'
  | 'smart_intake'
  | 'phone'
  | 'email'
  | 'text_manual'
  | 'referral'
  | 'social_media'
  | 'google_search'
  | 'returning_customer'
  | 'partner_referral'
  | 'event'
  | 'service_page'
  | 'callback'
  | 'other'
  | 'unknown';

export type CrmServiceInterestState =
  | 'interested'
  | 'discussing'
  | 'recommended'
  | 'quote_requested'
  | 'quote_included'
  | 'declined'
  | 'converted';

export type CrmQualificationState =
  | 'not_started'
  | 'in_progress'
  | 'complete'
  | 'needs_more_information'
  | 'not_a_fit';

export type CrmOpportunityStatus = 'open' | 'won' | 'lost';

export type CrmActivityType =
  | 'call'
  | 'email'
  | 'text'
  | 'meeting'
  | 'note'
  | 'follow_up'
  | 'quote_sent'
  | 'quote_viewed'
  | 'customer_reply'
  | 'service_discussion'
  | 'status_change'
  | 'conversion'
  | 'consultation';

export type CrmFollowUpStatus = 'upcoming' | 'due' | 'overdue' | 'completed' | 'cancelled';

export type CrmLeadPriority = 'normal' | 'high' | 'urgent';

export type CrmConsentState = {
  smsContactAllowed?: boolean;
  emailContactAllowed?: boolean;
  marketingOptIn?: boolean;
  transactionalContactAllowed?: boolean;
};

export interface CrmLeadSource {
  id: string;
  slug: CrmLeadSourceSlug;
  name: string;
  isDemo?: boolean;
}

export interface CrmPipelineStage {
  id: string;
  pipelineId: string;
  slug: string;
  name: string;
  sortOrder: number;
  allowedNextStageIds?: string[];
  isTerminal?: boolean;
  isWon?: boolean;
  isLost?: boolean;
}

export interface CrmPipeline {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface CrmLostReason {
  id: string;
  slug: string;
  label: string;
}

export interface CrmLead {
  id: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: 'phone' | 'email' | 'text';
  leadType: CrmLeadType;
  leadSourceId: string;
  status: CrmLeadStatus;
  priority: CrmLeadPriority;
  assignedUserId?: string;
  assignedTeamId?: string;
  organizationId?: string;
  intakeSnapshotId?: string;
  qualificationState: CrmQualificationState;
  qualificationNotes?: string;
  originalSourceId?: string;
  latestSourceId?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    landingPage?: string;
  };
  consent?: CrmConsentState;
  doNotContact?: boolean;
  doNotContactReason?: string;
  doNotContactAt?: string;
  doNotContactById?: string;
  possibleDuplicateOfLeadId?: string;
  mergedIntoLeadId?: string;
  referralId?: string;
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  firstStaffActionAt?: string;
  firstContactAt?: string;
  qualifiedAt?: string;
  isDemo?: boolean;
}

export interface CrmServiceInterest {
  id: string;
  leadId: string;
  serviceSlug: string;
  serviceTitle: string;
  state: CrmServiceInterestState;
  source?: string;
  createdAt: string;
}

export interface CrmOpportunity {
  id: string;
  leadId: string;
  organizationId?: string;
  name: string;
  status: CrmOpportunityStatus;
  pipelineId: string;
  pipelineStageId: string;
  estimatedValueMinor?: number;
  assignedUserId?: string;
  assignedTeamId?: string;
  expectedCloseDate?: string;
  quoteId?: string;
  lostReasonId?: string;
  lostNotes?: string;
  wonAt?: string;
  lostAt?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface CrmActivity {
  id: string;
  leadId: string;
  opportunityId?: string;
  activityType: CrmActivityType;
  title: string;
  body?: string;
  actorStaffId?: string;
  callOutcome?: 'connected' | 'voicemail' | 'no_answer' | 'callback_requested' | 'wrong_number';
  createdAt: string;
  isDemo?: boolean;
}

export interface CrmFollowUp {
  id: string;
  leadId: string;
  opportunityId?: string;
  purpose: string;
  scheduledFor: string;
  assignedUserId?: string;
  status: CrmFollowUpStatus;
  notes?: string;
  officeWorkItemId?: string;
  completedAt?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface CrmReferral {
  id: string;
  referrerType: 'customer' | 'partner' | 'staff' | 'other';
  referrerLabel: string;
  referredLeadId: string;
  createdAt: string;
  status: 'pending' | 'converted' | 'lost';
  isDemo?: boolean;
}

export interface CrmConversionRecord {
  id: string;
  leadId: string;
  opportunityId: string;
  organizationId: string;
  contactCreated: boolean;
  serviceRequestIds: string[];
  quoteId?: string;
  convertedByStaffId?: string;
  convertedAt: string;
  idempotencyKey: string;
  wasExistingCustomer: boolean;
}

export interface CrmSettings {
  staleQualifiedDays: number;
  staleQuoteSentDays: number;
}

export const CRM_LEAD_STATUS_LABELS: Record<CrmLeadStatus, string> = {
  new: 'New',
  contact_attempted: 'Contact Attempted',
  contacted: 'Contacted',
  qualifying: 'Qualifying',
  qualified: 'Qualified',
  unqualified: 'Unqualified',
  nurturing: 'Nurturing',
  converted: 'Converted',
  lost: 'Lost',
  do_not_contact: 'Do Not Contact',
};

export const CARRIER_PIPELINE_ID = 'pipeline-carrier-services';
export const SHIPPER_PIPELINE_ID = 'pipeline-shipper';
