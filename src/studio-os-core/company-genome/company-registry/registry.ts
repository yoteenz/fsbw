import type { CompanyRegistryEntry } from '../business-types';
import type { ModuleTenantId } from '../../workspace/tenant-ids';

const COMPANY_REGISTRY: Record<ModuleTenantId, CompanyRegistryEntry | undefined> = {
  'frontal-slayer': {
    companyId: 'frontal-slayer',
    officialName: 'FRONTAL SLAYER',
    industry: 'Luxury hair commerce, customization, education, and client relationships',
    thesis:
      'Frontal Slayer is a luxury hair commerce organism built from desire, product, client, revenue, and operating engines.',
    engines: ['desire', 'product', 'client', 'revenue', 'operating'],
    growthLoop:
      'Founder Vision → Brand → Campaign → Content → Launch → Traffic → Conversion → Payment → Fulfillment → Delivery → Review → Loyalty → Membership → Rewards → Repeat Purchase → Advocacy → Referral → New Customer',
  },
  ndxbook: {
    companyId: 'ndxbook',
    officialName: 'NDXBOOK',
    industry: 'Authority media and publishing',
    thesis: 'NDXBOOK compounds knowledge into authority media through editorial systems.',
    engines: ['desire', 'client', 'revenue', 'operating'],
    growthLoop: 'Vision → Content → Distribution → Reader → Relationship → Authority → Revenue',
  },
  'studio-os': {
    companyId: 'studio-os',
    officialName: 'STUDIO OS',
    industry: 'Organizational operating system platform',
    thesis: 'Studio OS is the platform that hosts and generates company genomes for any business.',
    engines: ['operating', 'desire', 'client'],
    growthLoop: 'Genesis → Workspace → Company Genome → Operating Intelligence → Expansion',
  },
  portfolio: undefined,
};

export function getCompanyRegistryEntry(orgId: ModuleTenantId): CompanyRegistryEntry {
  const entry = COMPANY_REGISTRY[orgId];
  if (entry) return entry;
  return {
    companyId: orgId,
    officialName: orgId.toUpperCase().replace(/-/g, ' '),
    industry: 'General business',
    thesis: 'Company genome ready for configuration.',
    engines: ['desire', 'product', 'client', 'revenue', 'operating'],
    growthLoop: 'Vision → Product → Customer → Revenue → Operations → Growth',
  };
}

export function listRegisteredCompanies(): CompanyRegistryEntry[] {
  return Object.values(COMPANY_REGISTRY).filter((e): e is CompanyRegistryEntry => e !== undefined);
}
