import type {
  CoverageType,
  InsuranceCapability,
  InsuranceOperatingMode,
  InsurancePolicyStatus,
  InsuranceQuoteSource,
  InsuranceReadinessItem,
  InsuranceRequestStatus,
  InsuranceRequestType,
  PartnerHandoffStatus,
} from './insuranceTypes';

export const DEFAULT_INSURANCE_OPERATING_MODE: InsuranceOperatingMode = 'assistance';
export const DEFAULT_INSURANCE_CAPABILITY: InsuranceCapability = 'demo';
export const DIRECT_INSURANCE_ENABLED = false;

export const DEMO_INSURANCE_LABEL =
  'DEMO · Fictional insurance data for review only. All In One is not a licensed insurer or producer.';

export const INSURANCE_DISCLOSURE =
  'Insurance quote and policy information is provided by licensed professionals or customer-supplied records. All In One coordinates assistance — it does not underwrite or bind coverage.';

export const COVERAGE_TYPE_LABELS: Record<CoverageType, string> = {
  auto_liability: 'Auto Liability',
  cargo: 'Cargo',
  physical_damage: 'Physical Damage',
  general_liability: 'General Liability',
  bobtail: 'Bobtail / Non-Trucking Liability',
  trailer_interchange: 'Trailer Interchange',
  workers_comp: "Workers' Compensation",
  occupational_accident: 'Occupational Accident',
  umbrella: 'Umbrella / Excess',
  other: 'Other',
};

export const INSURANCE_REQUEST_TYPE_LABELS: Record<InsuranceRequestType, string> = {
  new_coverage: 'New Coverage',
  renewal_help: 'Renewal Help',
  add_vehicle: 'Add Vehicle',
  remove_vehicle: 'Remove Vehicle',
  certificate_request: 'Certificate Request',
  coverage_question: 'Coverage Question',
  policy_update: 'Policy Update',
  partner_referral: 'Partner Referral',
  other: 'Other',
};

export const INSURANCE_REQUEST_STATUS_LABELS: Record<InsuranceRequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  information_needed: 'Information Needed',
  internal_review: 'Internal Review',
  ready_for_referral: 'Ready for Referral',
  referred: 'Referred',
  partner_review: 'Partner Review',
  quote_options_reported: 'Quote Options Reported',
  customer_review: 'Customer Review',
  policy_selected_external: 'Policy Selected (External)',
  policy_setup: 'Policy Setup',
  completed: 'Completed',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

export const POLICY_STATUS_LABELS: Record<InsurancePolicyStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  cancelled: 'Cancelled',
  replaced: 'Replaced',
  unknown: 'Unknown',
};

export const QUOTE_SOURCE_LABELS: Record<InsuranceQuoteSource, string> = {
  partner_reported: 'Partner Reported',
  document_supported: 'Document Supported',
  staff_entered_from_partner: 'Staff Entered (Partner)',
  future_api: 'Future API',
};

export const HANDOFF_STATUS_LABELS: Record<PartnerHandoffStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  sent_manual: 'Sent (Manual)',
  acknowledged_future: 'Acknowledged (Future)',
  additional_info_needed: 'Additional Info Needed',
  response_received: 'Response Received',
  closed: 'Closed',
};

export const INSURANCE_READINESS_CHECKLIST: Omit<InsuranceReadinessItem, 'status'>[] = [
  { key: 'operating_model', label: 'Operating Model Selected' },
  { key: 'licensed_partner', label: 'Licensed Partner Established' },
  { key: 'staff_roles', label: 'Staff Roles Defined' },
  { key: 'customer_disclosures', label: 'Approved Customer Disclosures' },
  { key: 'referral_language', label: 'Approved Referral Language' },
  { key: 'partner_handoff', label: 'Approved Partner Handoff' },
  { key: 'document_policies', label: 'Insurance Document Policies' },
  { key: 'data_security', label: 'Data Security' },
  { key: 'privacy_review', label: 'Privacy Review' },
  { key: 'billing_model', label: 'Billing Model (Service Fees Only)' },
  { key: 'renewal_process', label: 'Renewal Process' },
  { key: 'coi_process', label: 'COI Process' },
  { key: 'legal_review', label: 'Legal / Regulatory Review' },
  { key: 'direct_disabled', label: 'Direct Insurance Disabled' },
];

export const EXPIRING_SOON_DAYS = 45;
