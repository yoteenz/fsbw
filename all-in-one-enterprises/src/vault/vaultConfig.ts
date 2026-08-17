import type { RejectionReason, VaultCategory } from './vaultTypes';
import { VAULT_TAXONOMY, documentTypesForCategory, labelForCategory } from './vaultTaxonomy';

/** Unique categories derived from taxonomy */
export const VAULT_CATEGORY_OPTIONS: { id: VaultCategory; label: string }[] = Array.from(
  new Map(
    VAULT_TAXONOMY.flatMap((t) => t.categories.map((id) => [id, { id, label: labelForCategory(id) }] as const)),
  ).values(),
);

/** @deprecated prefer VAULT_CATEGORY_OPTIONS */
export const VAULT_CATEGORIES = VAULT_CATEGORY_OPTIONS;

export const DOCUMENT_TYPES: Record<VaultCategory, string[]> = {
  business: documentTypesForCategory('business'),
  authority: documentTypesForCategory('authority'),
  registration: documentTypesForCategory('registration'),
  tax_fuel: documentTypesForCategory('tax_fuel'),
  insurance: documentTypesForCategory('insurance'),
  permits: documentTypesForCategory('permits'),
  fleet: documentTypesForCategory('fleet'),
  dispatch: documentTypesForCategory('dispatch'),
  factoring: documentTypesForCategory('factoring'),
  brokerage: documentTypesForCategory('brokerage'),
  billing: documentTypesForCategory('billing'),
  poa_authorization: documentTypesForCategory('poa_authorization'),
  contracts: documentTypesForCategory('contracts'),
  supporting: documentTypesForCategory('supporting'),
  correspondence: documentTypesForCategory('correspondence'),
  legacy: documentTypesForCategory('legacy'),
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
