import type {
  FactoringEnrollmentStatus,
  FactoringIssueType,
  FactoringSubmissionStatus,
  FactoringServiceMode,
} from './factoringTypes';

export const DEMO_FACTORING_LABEL = 'DEMO · Fictional providers, amounts, and funding for review only';

/** Direct factoring must remain disabled until legal/capital structure supports it. */
export const directFactoringEnabled = false;

export const FACTORING_SERVICE_MODE_LABELS: Record<FactoringServiceMode, string> = {
  factoring_assistance: 'Factoring Assistance',
  partner_factoring: 'Partner Factoring',
  direct_factoring_future: 'Direct Factoring (Future)',
};

export const ENROLLMENT_STATUS_LABELS: Record<FactoringEnrollmentStatus, string> = {
  not_enrolled: 'Not Enrolled',
  interested: 'Interested',
  application_started: 'Application Started',
  documents_needed: 'Documents Needed',
  under_review: 'Under Review',
  partner_review: 'Partner Review',
  approved: 'Approved',
  active: 'Active',
  declined: 'Declined',
  paused: 'Paused',
  ended: 'Ended',
};

export const SUBMISSION_STATUS_LABELS: Record<FactoringSubmissionStatus, string> = {
  draft: 'Draft',
  documents_needed: 'Documents Needed',
  ready: 'Ready',
  submitted: 'Submitted',
  provider_review: 'Provider Review',
  additional_information_needed: 'Additional Information Needed',
  approved: 'Approved',
  funding_pending: 'Funding Pending',
  funded: 'Funded',
  declined: 'Declined',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

export const ISSUE_TYPE_LABELS: Record<FactoringIssueType, string> = {
  missing_pod: 'Missing POD',
  missing_rate_confirmation: 'Missing Rate Confirmation',
  invoice_amount_mismatch: 'Invoice Amount Mismatch',
  debtor_info_needed: 'Broker/Debtor Information Needed',
  provider_additional_info: 'Provider Requested Additional Information',
  duplicate_invoice: 'Duplicate Invoice',
  submission_rejected: 'Submission Rejected',
  funding_delay: 'Funding Delay',
  rate_dispute: 'Rate Dispute',
  document_quality: 'Document Quality Issue',
  other: 'Other',
};

export const FACTORING_PIPELINE_COLUMNS: { key: string; statuses: FactoringSubmissionStatus[] }[] = [
  { key: 'ready', statuses: ['ready', 'draft'] },
  { key: 'documents', statuses: ['documents_needed'] },
  { key: 'review', statuses: ['ready'] },
  { key: 'submitted', statuses: ['submitted'] },
  { key: 'provider', statuses: ['provider_review', 'additional_information_needed'] },
  { key: 'funding', statuses: ['approved', 'funding_pending'] },
  { key: 'funded', statuses: ['funded'] },
  { key: 'issue', statuses: ['declined', 'disputed'] },
];

export const REVIEW_CHECKLIST_ITEMS = [
  'Load Complete',
  'Rate Confirmation Present',
  'POD Present',
  'Freight Invoice Created',
  'Amount Matches Confirmed Load',
  'Broker/Debtor Identified',
  'Provider Selected',
  'Required Documents Present',
] as const;
