import type { WigUnitSlug } from '../../../content/education/care/productCatalog';
import { getActiveSignatureUnitEducationProfiles } from '../../../content/education';
import { getContentPackById } from '../loungeTvContentPack';

export type ProductBreakdownPresentationEntry = {
  /** Stable presentation id — e.g. product-breakdown-blanco */
  id: string;
  unitId: WigUnitSlug;
  /** Engagement / save pack id */
  packId: string;
  productType: string;
  displayName: string;
};

function packIdForUnit(unitId: WigUnitSlug): string {
  return `product-breakdown-${unitId}`;
}

function buildEntry(unitId: WigUnitSlug, displayName: string): ProductBreakdownPresentationEntry {
  return {
    id: packIdForUnit(unitId),
    unitId,
    packId: packIdForUnit(unitId),
    productType: 'SIGNATURE UNIT',
    displayName,
  };
}

export function listProductBreakdownPresentationEntries(): ProductBreakdownPresentationEntry[] {
  const entries: ProductBreakdownPresentationEntry[] = [];
  for (const profile of getActiveSignatureUnitEducationProfiles()) {
    const packId = packIdForUnit(profile.unitId);
    if (!getContentPackById(packId)) continue;
    entries.push(buildEntry(profile.unitId, profile.displayName));
  }
  return entries;
}

export function getProductBreakdownPresentationEntryById(
  id: string,
): ProductBreakdownPresentationEntry | undefined {
  return listProductBreakdownPresentationEntries().find((e) => e.id === id);
}

export function getProductBreakdownPresentationEntryByUnitId(
  unitId: WigUnitSlug,
): ProductBreakdownPresentationEntry | undefined {
  return getProductBreakdownPresentationEntryById(packIdForUnit(unitId));
}

export function isProductBreakdownPackId(packId: string): boolean {
  return packId.startsWith('product-breakdown-');
}
