/**
 * Total units in the bag for the header badge: sum of per-line `quantity`.
 * Missing/undefined quantity counts as **1** (matches pricing and cart dropdown behavior).
 */
export function cartTotalQuantityUnits(items: { quantity?: number }[] | null | undefined): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, ci) => sum + (ci.quantity ?? 1), 0);
}
