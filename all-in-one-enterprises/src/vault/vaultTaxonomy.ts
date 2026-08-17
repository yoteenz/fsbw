import type { VaultCategory } from './vaultTypes';

/** Canonical document taxonomy — single source for UI labels, types, and navigation groups. */
export type VaultTaxonomyGroup =
  | 'all'
  | 'business_formation'
  | 'authority_federal'
  | 'permits_registration'
  | 'insurance'
  | 'poa_authorization'
  | 'tax_financial'
  | 'contracts'
  | 'supporting'
  | 'correspondence'
  | 'legacy'
  | 'operations';

export type VaultTaxonomyEntry = {
  group: VaultTaxonomyGroup;
  label: string;
  shortLabel: string;
  categories: VaultCategory[];
  documentTypes: string[];
};

export const VAULT_TAXONOMY: VaultTaxonomyEntry[] = [
  {
    group: 'business_formation',
    label: 'Business Formation',
    shortLabel: 'Formation',
    categories: ['business'],
    documentTypes: [
      'Articles of Organization',
      'Articles of Incorporation',
      'EIN Letter',
      'Operating Agreement',
      'Amendment',
      'Business Registration',
      'Certificate of Good Standing',
      'Other',
    ],
  },
  {
    group: 'authority_federal',
    label: 'Authority & Federal',
    shortLabel: 'Authority',
    categories: ['authority'],
    documentTypes: ['USDOT Registration', 'MC Authority', 'BOC-3', 'MCS-150', 'UCR', 'Federal Correspondence', 'Other'],
  },
  {
    group: 'permits_registration',
    label: 'Permits & Registration',
    shortLabel: 'Permits',
    categories: ['registration', 'permits', 'tax_fuel'],
    documentTypes: [
      'IFTA License',
      'IRP Cab Card',
      'Apportioned Registration',
      'Trip Permit',
      'Temporary Permit',
      'State Permit',
      'Renewal Record',
      'Other',
    ],
  },
  {
    group: 'insurance',
    label: 'Insurance',
    shortLabel: 'Insurance',
    categories: ['insurance'],
    documentTypes: ['Certificate of Insurance', 'Policy Document', 'Insurance Filing', 'Coverage Summary', 'Other'],
  },
  {
    group: 'poa_authorization',
    label: 'POA & Authorization',
    shortLabel: 'POA',
    categories: ['poa_authorization'],
    documentTypes: ['Power of Attorney', 'Authorization Form', 'Representation Agreement', 'Signed Permission', 'Other'],
  },
  {
    group: 'tax_financial',
    label: 'Tax & Financial',
    shortLabel: 'Tax',
    categories: ['tax_fuel', 'billing'],
    documentTypes: ['Form 2290 / HVUT', 'Tax Document', 'Invoice', 'Receipt', 'Financial Statement', 'Other'],
  },
  {
    group: 'contracts',
    label: 'Contracts & Agreements',
    shortLabel: 'Contracts',
    categories: ['contracts'],
    documentTypes: ['Service Agreement', 'Carrier Agreement', 'Lease Agreement', 'Vendor Contract', 'Other'],
  },
  {
    group: 'supporting',
    label: 'Identification & Supporting',
    shortLabel: 'Supporting',
    categories: ['supporting', 'fleet'],
    documentTypes: ['Driver License', 'Vehicle Title', 'Supporting ID', 'Fleet Document', 'Other'],
  },
  {
    group: 'correspondence',
    label: 'Correspondence',
    shortLabel: 'Correspondence',
    categories: ['correspondence'],
    documentTypes: ['Agency Letter', 'Client Letter', 'Notice', 'Email Archive', 'Other'],
  },
  {
    group: 'legacy',
    label: 'Legacy Records',
    shortLabel: 'Legacy',
    categories: ['legacy'],
    documentTypes: ['Legacy Scan', 'Historical File', 'Unclassified Legacy', 'Other'],
  },
  {
    group: 'operations',
    label: 'Operations',
    shortLabel: 'Ops',
    categories: ['dispatch', 'factoring', 'brokerage'],
    documentTypes: ['Rate Confirmation', 'BOL', 'POD', 'Load Document', 'Factoring Document', 'Other'],
  },
];

export function taxonomyForCategory(category: VaultCategory): VaultTaxonomyEntry | undefined {
  return VAULT_TAXONOMY.find((t) => t.categories.includes(category));
}

export function documentTypesForCategory(category: VaultCategory): string[] {
  const entry = taxonomyForCategory(category);
  if (entry) return entry.documentTypes;
  return ['Other'];
}

export function categoriesForTaxonomyGroup(group: VaultTaxonomyGroup): VaultCategory[] {
  if (group === 'all') {
    return VAULT_TAXONOMY.flatMap((t) => t.categories);
  }
  return VAULT_TAXONOMY.find((t) => t.group === group)?.categories ?? [];
}

export function labelForCategory(category: VaultCategory): string {
  const entry = taxonomyForCategory(category);
  return entry?.shortLabel ?? category.replace(/_/g, ' ');
}
