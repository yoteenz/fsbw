import type { RejectionReason, VaultCategory } from './vaultTypes';

export const VAULT_CATEGORIES: { id: VaultCategory; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'authority', label: 'Authority' },
  { id: 'registration', label: 'Registration' },
  { id: 'tax_fuel', label: 'Tax & Fuel' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'permits', label: 'Permits' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'factoring', label: 'Factoring' },
  { id: 'brokerage', label: 'Brokerage' },
  { id: 'billing', label: 'Billing' },
];

export const DOCUMENT_TYPES: Record<VaultCategory, string[]> = {
  business: ['Formation Document', 'Business Registration', 'Operating Agreement', 'Tax Document', 'Other'],
  authority: ['USDOT Record', 'Operating Authority', 'BOC-3', 'Authority Documentation', 'Other'],
  registration: ['Vehicle Registration', 'IRP Cab Card', 'Commercial Tags', 'Trailer Registration', 'Other'],
  tax_fuel: ['IFTA Credential', 'Fuel Tax Document', 'Highway Tax', 'State Tax Document', 'Other'],
  insurance: ['Certificate of Insurance', 'Policy Document', 'Coverage Summary', 'Other'],
  permits: ['Trip Permit', 'Temporary Permit', 'State Permit', 'Oversize Permit', 'Other'],
  fleet: ['Vehicle Document', 'Trailer Document', 'Driver Document', 'Other'],
  dispatch: ['Rate Confirmation', 'BOL', 'POD', 'Load Document', 'Other'],
  factoring: ['Invoice', 'Rate Confirmation', 'POD', 'Factoring Case Document', 'Other'],
  brokerage: ['Quote Document', 'BOL', 'POD', 'Shipment Document', 'Other'],
  billing: ['Service Invoice', 'Receipt', 'Statement', 'Other'],
};

export const FILE_POLICY = {
  maxBytes: 15 * 1024 * 1024,
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const REJECTION_REASONS: { id: RejectionReason; label: string; customerMessage: string }[] = [
  { id: 'wrong_document', label: 'Wrong Document', customerMessage: 'This does not appear to be the document we requested.' },
  { id: 'unreadable', label: 'Unreadable', customerMessage: 'The file is unclear or incomplete. Please upload a clearer copy.' },
  { id: 'expired', label: 'Expired', customerMessage: 'This document appears to be expired. Please upload a current version.' },
  { id: 'missing_page', label: 'Missing Page', customerMessage: 'A required page appears to be missing.' },
  { id: 'info_mismatch', label: 'Information Does Not Match', customerMessage: 'Information on the document does not match your profile.' },
  { id: 'incorrect_vehicle', label: 'Incorrect Vehicle', customerMessage: 'This document does not match the selected vehicle.' },
  { id: 'other', label: 'Other', customerMessage: 'Additional information is needed. See the message from All In One.' },
];
