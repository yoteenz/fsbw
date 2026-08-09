import {
  UNIT_SLUG_TEXTURE,
  WIG_UNIT_SLUGS,
  type WigUnitSlug,
} from '../care/productCatalog';
import { getDefaultDensityForUnit } from '../../../utils/productOptions';
import type { SignatureUnitEducationProfile } from './types';

/** Approved storefront hair origins — sourced from unit PDP defaults. */
const UNIT_HAIR_ORIGIN: Partial<Record<WigUnitSlug, string>> = {
  noir: 'CAMBODIAN',
  blanco: 'RUSSIAN',
  'soft-wave': 'INDIAN',
  'beach-wave': 'INDONESIAN',
  'soft-curl': 'VIETNAMESE',
  'ocean-curl': 'FILIPINO',
};

function buildProfile(unitId: WigUnitSlug): SignatureUnitEducationProfile {
  const nameMap: Record<WigUnitSlug, string> = {
    noir: 'NOIR',
    blanco: 'BLANCO',
    'soft-wave': 'SOFT WAVE',
    'beach-wave': 'BEACH WAVE',
    'soft-curl': 'SOFT CURL',
    'ocean-curl': 'OCEAN CURL',
  };

  return {
    unitId,
    productId: unitId,
    displayName: nameMap[unitId],
    textureFamily: UNIT_SLUG_TEXTURE[unitId],
    hairOrigin: UNIT_HAIR_ORIGIN[unitId],
    defaultLength: '24"',
    density: getDefaultDensityForUnit(unitId),
    educationMedia: {},
    educationNotes: {},
    active: true,
  };
}

export const SIGNATURE_UNIT_EDUCATION_PROFILES: SignatureUnitEducationProfile[] =
  WIG_UNIT_SLUGS.map(buildProfile);

const profileById = new Map(WIG_UNIT_SLUGS.map((id) => [id, buildProfile(id)]));

export function getSignatureUnitEducationProfile(
  unitId: string | undefined | null
): SignatureUnitEducationProfile | undefined {
  if (!unitId) return undefined;
  return profileById.get(unitId as WigUnitSlug);
}

export function getActiveSignatureUnitEducationProfiles(): SignatureUnitEducationProfile[] {
  return SIGNATURE_UNIT_EDUCATION_PROFILES.filter((p) => p.active !== false);
}

export function isKnownSignatureUnitId(unitId: string): unitId is WigUnitSlug {
  return WIG_UNIT_SLUGS.includes(unitId as WigUnitSlug);
}
