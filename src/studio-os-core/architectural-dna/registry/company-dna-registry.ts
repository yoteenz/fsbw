import type { CompanyDnaProfile } from '../schemas/company-dna';
import { COMPANY_DNA_VERSION } from '../schemas/company-dna';

const KNOWN_COMPANY_PROFILES: Record<string, Omit<CompanyDnaProfile, 'companyDnaVersion'>> = {
  'frontal-slayer': {
    organizationId: 'frontal-slayer',
    organizationName: 'Frontal Slayer',
    logoAssetPath: '/assets/brand/frontal-slayer-logo.png',
    brandMarble: 'founder-marble — white polished marble with subtle veining',
    accentColor: 'founder-red-illumination — signature red accent lighting',
    secondaryAccents: ['founder-chrome', 'founder-crystal'],
    materialOverrides: ['founder-marble', 'founder-chrome', 'founder-crystal', 'founder-glass', 'founder-red-illumination'],
    brandInjectionPrompt:
      'COMPANY BRAND LAYER — Frontal Slayer: apply founder marble floors, chrome and crystal accents, signature red illumination. Brand materials only — no generic substitutes.',
    forbiddenBrandSubstitutions: ['Carrara substitute', 'Calacatta substitute', 'generic random marble'],
    historyContext: 'Frontal Slayer founder brand — executive luxury creative infrastructure',
    futureAssetSlots: ['brand-logo-mount', 'brand-history-wall', 'brand-accent-lighting'],
  },
  'studio-os': {
    organizationId: 'studio-os',
    organizationName: 'Studio World',
    logoAssetPath: null,
    brandMarble: 'founder-marble — canonical Studio World marble grounding via frontal-slayer vault',
    accentColor: 'founder-red-illumination',
    secondaryAccents: ['founder-chrome', 'founder-white-acrylic'],
    materialOverrides: ['founder-marble', 'founder-chrome', 'founder-crystal', 'founder-glass', 'founder-red-illumination', 'founder-white-acrylic'],
    brandInjectionPrompt:
      'COMPANY BRAND LAYER — Studio World canonical: neutral executive infrastructure with founder marble grounding. Architecture Law #001 compliant.',
    forbiddenBrandSubstitutions: ['generic random marble', 'tenant-specific branding'],
    historyContext: 'Studio World global canonical infrastructure — not tenant-owned',
    futureAssetSlots: ['canonical-brand-mount'],
  },
};

export function resolveCompanyDna(organizationId: string, organizationName?: string): CompanyDnaProfile {
  const known = KNOWN_COMPANY_PROFILES[organizationId];
  if (known) {
    return { companyDnaVersion: COMPANY_DNA_VERSION, ...known };
  }
  return {
    companyDnaVersion: COMPANY_DNA_VERSION,
    organizationId,
    organizationName: organizationName ?? organizationId,
    logoAssetPath: null,
    brandMarble: 'approved organization materials',
    accentColor: 'organization accent',
    secondaryAccents: [],
    materialOverrides: [],
    brandInjectionPrompt: `COMPANY BRAND LAYER — ${organizationName ?? organizationId}: apply approved brand materials only.`,
    forbiddenBrandSubstitutions: ['generic substitutes', 'unapproved materials'],
    historyContext: null,
    futureAssetSlots: [],
  };
}
