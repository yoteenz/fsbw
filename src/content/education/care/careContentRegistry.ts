import type { CareGuide } from '../types';
import type { CareApplicability } from './careApplicability';
import { getAllCareGuides } from './guides/catalog';

export type CareGuideRegistryEntry = {
  contentId: string;
  contentKind: 'care-guide';
  title: string;
  careApplicability: CareApplicability;
};

/** Canonical Care Guide registry — rule-evaluated at runtime (future-content aware). */
export function getCareGuideRegistry(): CareGuideRegistryEntry[] {
  return getAllCareGuides()
    .filter((g) => g.accessType === 'qualifying-product')
    .map((g) => ({
      contentId: g.id,
      contentKind: 'care-guide' as const,
      title: g.title,
      careApplicability: guideCareApplicability(g),
    }));
}

function guideCareApplicability(guide: CareGuide): CareApplicability {
  if (guide.applicability) return guide.applicability;
  if (guide.careApplicability) return guide.careApplicability;

  const applicability: CareApplicability = {};
  if (guide.tags?.includes('universal')) applicability.universal = true;
  if (guide.applicableProductTypes?.length) {
    applicability.productTypes = guide.applicableProductTypes as CareApplicability['productTypes'];
  }
  if (guide.applicableTextures?.length) {
    applicability.textureFamilies = guide.applicableTextures as CareApplicability['textureFamilies'];
  }
  if (!applicability.universal && !applicability.productTypes && !applicability.textureFamilies) {
    applicability.universal = true;
  }
  return applicability;
}

export function getCareGuideRegistryEntry(contentId: string): CareGuideRegistryEntry | undefined {
  return getCareGuideRegistry().find((e) => e.contentId === contentId);
}

/** @deprecated Use getCareGuideRegistry — Care Mastery episodes are never product-entitled. */
export { getCareGuideRegistry as getCareContentRegistry };
export type { CareGuideRegistryEntry as CareContentRegistryEntry };
