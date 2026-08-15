/** Deterministic dispatch math — integer minor units for money */

export function computeTotalMiles(loadedMiles: number, deadheadMiles: number): number {
  return Math.max(0, loadedMiles) + Math.max(0, deadheadMiles);
}

export function computeLoadedRpm(grossMinor: number, loadedMiles: number): number {
  if (loadedMiles <= 0) return 0;
  return Math.round(grossMinor / loadedMiles);
}

export function computeAllMilesRpm(grossMinor: number, loadedMiles: number, deadheadMiles: number): number {
  const total = computeTotalMiles(loadedMiles, deadheadMiles);
  if (total <= 0) return 0;
  return Math.round(grossMinor / total);
}

export function computeDeadheadPercent(deadheadMiles: number, loadedMiles: number): number {
  const total = computeTotalMiles(loadedMiles, deadheadMiles);
  if (total <= 0) return 0;
  return Math.round((deadheadMiles / total) * 10000) / 100;
}

export function computeGrossMinor(
  linehaulMinor: number,
  fuelSurchargeMinor: number,
  approvedAccessorialMinor: number,
): number {
  return Math.max(0, linehaulMinor) + Math.max(0, fuelSurchargeMinor) + Math.max(0, approvedAccessorialMinor);
}

export function computeDispatchFeeMinor(
  confirmedGrossMinor: number,
  billingMode: 'percentage' | 'flat_per_load' | 'weekly' | 'monthly' | 'custom',
  billingRateBasisPoints?: number,
  flatPerLoadMinor?: number,
): number {
  if (billingMode === 'flat_per_load' && flatPerLoadMinor != null) {
    return Math.max(0, flatPerLoadMinor);
  }
  if (billingMode === 'percentage' && billingRateBasisPoints != null) {
    return Math.round((confirmedGrossMinor * billingRateBasisPoints) / 10000);
  }
  return 0;
}

export function computeCarrierGrossAfterDispatchFee(confirmedGrossMinor: number, dispatchFeeMinor: number): number {
  return Math.max(0, confirmedGrossMinor - Math.max(0, dispatchFeeMinor));
}

export function sumApprovedAccessorials(
  accessorials: { amountMinor: number; status: string }[],
): number {
  return accessorials
    .filter((a) => a.status === 'approved')
    .reduce((s, a) => s + a.amountMinor, 0);
}
