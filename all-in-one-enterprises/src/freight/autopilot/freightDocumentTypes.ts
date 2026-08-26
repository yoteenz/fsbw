/** Freight document taxonomy — extends vault operations group with load-close requirements. */
export type FreightDocumentType =
  | 'RATE_CONFIRMATION'
  | 'BOL'
  | 'POD'
  | 'LUMPER_RECEIPT'
  | 'FUEL_RECEIPT'
  | 'SCALE_TICKET'
  | 'DETENTION_DOCUMENT'
  | 'TONU_DOCUMENT'
  | 'ACCESSORIAL_RECEIPT'
  | 'CARRIER_PACKET'
  | 'INSURANCE_CERTIFICATE'
  | 'W9'
  | 'INVOICE'
  | 'SETTLEMENT'
  | 'FACTORING_DOCUMENT'
  | 'OTHER_LOAD_DOCUMENT';

export type FreightDocumentVerificationStatus =
  | 'pending_review'
  | 'verified'
  | 'rejected'
  | 'override_approved';

export type FreightDocumentSource = 'upload' | 'generated' | 'integration' | 'manual_entry';

export interface FreightLoadDocumentRef {
  documentType: FreightDocumentType;
  documentId?: string;
  requiredForClose: boolean;
  requiredForFactoring: boolean;
  requiredForSettlement: boolean;
  status: 'missing' | 'received' | 'not_required' | 'override';
  uploadedAt?: string;
  uploadedBy?: string;
  verificationStatus?: FreightDocumentVerificationStatus;
}

export const LOAD_CLOSE_BASE_REQUIREMENTS: FreightDocumentType[] = [
  'RATE_CONFIRMATION',
  'BOL',
  'POD',
];

export const FACTORING_EXTRA_REQUIREMENTS: FreightDocumentType[] = ['LUMPER_RECEIPT', 'FUEL_RECEIPT'];
