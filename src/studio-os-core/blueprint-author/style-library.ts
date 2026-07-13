import type { StyleProfileSpec } from './construction-plan-schema';

export const STYLE_LIBRARY_VERSION = 'style-library.v1';

export type OrganizationStyleId =
  | 'studio-world-luxury'
  | 'founder-luxury'
  | 'executive-reception'
  | 'gallery-minimal'
  | 'hair-lab-clinical'
  | 'showroom-luxury';

export const ORGANIZATION_STYLES: Record<OrganizationStyleId, StyleProfileSpec> = {
  'studio-world-luxury': {
    styleId: 'StudioWorldLuxury',
    version: '1.0.0',
    organizationStyle: 'studio-world-luxury',
    visualLanguage: 'Premium spatial computing — crystalline surfaces, executive lighting',
  },
  'founder-luxury': {
    styleId: 'FounderLuxury',
    version: '1.0.0',
    organizationStyle: 'founder-luxury',
    visualLanguage: 'Founder-grade materials — marble, chrome, crystal, crimson accent',
  },
  'executive-reception': {
    styleId: 'ExecutiveReception',
    version: '1.0.0',
    organizationStyle: 'executive-reception',
    visualLanguage: 'Concierge arrival — hero desk, landmark presence, walkable circulation',
  },
  'gallery-minimal': {
    styleId: 'GalleryMinimal',
    version: '1.0.0',
    organizationStyle: 'gallery-minimal',
    visualLanguage: 'Gallery white space — minimal decor, focused lighting',
  },
  'hair-lab-clinical': {
    styleId: 'HairLabClinical',
    version: '1.0.0',
    organizationStyle: 'hair-lab-clinical',
    visualLanguage: 'Clinical precision — clean surfaces, task lighting',
  },
  'showroom-luxury': {
    styleId: 'ShowroomLuxury',
    version: '1.0.0',
    organizationStyle: 'showroom-luxury',
    visualLanguage: 'Product showcase — display platforms, accent lighting',
  },
};

export function resolveStyleProfile(styleProfileId: string): StyleProfileSpec | null {
  const key = styleProfileId as OrganizationStyleId;
  return ORGANIZATION_STYLES[key] ?? null;
}

/** Models receive style identifiers — not vague prompts */
export function buildStyleWorkerPayload(style: StyleProfileSpec): {
  styleId: string;
  version: string;
  organizationStyle: string;
  visualLanguage: string;
} {
  return {
    styleId: style.styleId,
    version: style.version,
    organizationStyle: style.organizationStyle,
    visualLanguage: style.visualLanguage,
  };
}
