/**
 * Approved variant asset registry — populated when Asset Factory generates color variants.
 * Keys: `{unitSlug}_{colorSlug}_{suffix}`.
 */
export const BAW_APPROVED_VARIANT_URLS: Record<string, string> = {};

export function lookupApprovedVariantUrl(assetId: string): string | null {
  return BAW_APPROVED_VARIANT_URLS[assetId] ?? null;
}
