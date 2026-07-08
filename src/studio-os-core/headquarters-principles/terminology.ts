import type { CanonicalTerminologyEntry } from './types';

/** ARTICLE-C04 constitutional vocabulary — legacy → Headquarters language. */
export const CANONICAL_TERMINOLOGY: CanonicalTerminologyEntry[] = [
  {
    legacyTerm: 'Admin Dashboard',
    constitutionalTerm: 'Company Headquarters™',
    description: 'Studio OS is operational headquarters, not a monitoring dashboard.',
  },
  {
    legacyTerm: 'Dashboard Widgets',
    constitutionalTerm: 'Workspaces™',
    description: 'Living workspaces create motion; widgets only display state.',
  },
  {
    legacyTerm: 'Navigation Menu',
    constitutionalTerm: 'Atlas™',
    description: 'Founders navigate through space, not menu hierarchies.',
  },
  {
    legacyTerm: 'Notifications',
    constitutionalTerm: 'Executive Advisories™',
    description: 'Guidance for leadership decisions, not notification noise.',
  },
  {
    legacyTerm: 'Reports',
    constitutionalTerm: 'Intelligence Briefings™',
    description: 'Briefings answer what the founder should understand or do next.',
  },
  {
    legacyTerm: 'Settings',
    constitutionalTerm: 'Operations Rooms™',
    description: 'Operational configuration lives in dedicated rooms, not generic settings.',
  },
  {
    legacyTerm: 'Assistant',
    constitutionalTerm: 'Orb™',
    description: 'The Orb is contextual executive intelligence, not a generic chatbot.',
  },
  {
    legacyTerm: 'Search',
    constitutionalTerm: 'Atlas™',
    description: 'Spatial discovery replaces flat search boxes where possible.',
  },
];

const TERMINOLOGY_LOOKUP = new Map<string, string>(
  CANONICAL_TERMINOLOGY.flatMap((entry) => [
    [entry.legacyTerm.toLowerCase(), entry.constitutionalTerm],
    [entry.legacyTerm.toLowerCase().replace(/\s+/g, '-'), entry.constitutionalTerm],
  ])
);

export function resolveConstitutionalTerm(legacyTerm: string): string {
  const key = legacyTerm.trim().toLowerCase();
  return TERMINOLOGY_LOOKUP.get(key) ?? legacyTerm;
}

export function translateFounderFacingLabel(label: string): string {
  let result = label;
  for (const entry of CANONICAL_TERMINOLOGY) {
    if (result.toLowerCase().includes(entry.legacyTerm.toLowerCase())) {
      result = result.replace(new RegExp(entry.legacyTerm, 'gi'), entry.constitutionalTerm);
    }
  }
  return result;
}

export function listCanonicalTerminology(): CanonicalTerminologyEntry[] {
  return [...CANONICAL_TERMINOLOGY];
}
