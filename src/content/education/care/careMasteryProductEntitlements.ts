import type { CarePurchaseProfile } from '../types';
import { CARE_MASTERY_CANONICAL_SEASON_ID } from '../hierarchy/care/seasons';

/**
 * Explicit product-type mapping for complimentary Care Mastery season entitlement.
 * Uses structured commerce attributes — not SKU name parsing.
 */
export const CARE_MASTERY_QUALIFYING_PRODUCT_TYPES = [
  'unit',
  'bundles',
  'closures',
  'frontals',
] as const;

export type CareMasteryQualifyingProductType = (typeof CARE_MASTERY_QUALIFYING_PRODUCT_TYPES)[number];

export function carePurchaseProfileQualifiesForCareMasterySeason(
  profile: CarePurchaseProfile,
): boolean {
  if (profile.status !== 'active') return false;
  return CARE_MASTERY_QUALIFYING_PRODUCT_TYPES.includes(
    profile.productType as CareMasteryQualifyingProductType,
  );
}

export function resolveQualifyingOrderIdsForCareMastery(
  profiles: CarePurchaseProfile[],
): string[] {
  const ids = new Set<string>();
  for (const profile of profiles) {
    if (carePurchaseProfileQualifiesForCareMasterySeason(profile)) {
      ids.add(profile.orderId);
    }
  }
  return [...ids];
}

export function seasonIdForCareMasteryEntitlement(): string {
  return CARE_MASTERY_CANONICAL_SEASON_ID;
}
