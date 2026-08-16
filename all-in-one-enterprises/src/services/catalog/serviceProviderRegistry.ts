import type { ServicePartnerRecord } from './serviceCatalogTypes';

/** Partner directory — no invented provider names; slots for configured partners. */
export const SERVICE_PARTNER_DIRECTORY: ServicePartnerRecord[] = [
  {
    id: 'partner-factoring',
    name: 'Approved Factoring Partner (configure)',
    providerTypes: ['factoring'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'referral',
    customerDisclosure: 'Service fulfilled through an approved AIO partner.',
  },
  {
    id: 'partner-insurance',
    name: 'Approved Insurance Partner (configure)',
    providerTypes: ['insurance'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'referral',
    customerDisclosure: 'Coverage is provided by licensed insurers.',
  },
  {
    id: 'partner-payroll',
    name: 'Approved Payroll Provider (configure)',
    providerTypes: ['payroll'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'managed',
    customerDisclosure: 'Payroll processing may be fulfilled through an approved provider.',
  },
  {
    id: 'partner-tax',
    name: 'Approved Tax Preparer (configure)',
    providerTypes: ['tax_preparation'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'managed',
    customerDisclosure: 'Tax preparation may be fulfilled by an approved provider where disclosure is required.',
  },
  {
    id: 'partner-eld',
    name: 'Approved ELD Provider (configure)',
    providerTypes: ['eld'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'managed',
  },
  {
    id: 'partner-consortium',
    name: 'Approved Consortium Provider (configure)',
    providerTypes: ['drug_alcohol_consortium', 'testing_compliance'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'managed',
  },
  {
    id: 'partner-title-tag',
    name: 'Approved Title/Tag Partner (configure)',
    providerTypes: ['title_tag'],
    status: 'pending',
    jurisdictions: [],
    referralOrManaged: 'managed',
    customerDisclosure: 'Requirements and availability vary by jurisdiction.',
  },
];

export function getPartnersByType(type: string): ServicePartnerRecord[] {
  return SERVICE_PARTNER_DIRECTORY.filter((p) => p.providerTypes.includes(type as ServicePartnerRecord['providerTypes'][number]));
}

export function getPartnerById(id: string): ServicePartnerRecord | undefined {
  return SERVICE_PARTNER_DIRECTORY.find((p) => p.id === id);
}
