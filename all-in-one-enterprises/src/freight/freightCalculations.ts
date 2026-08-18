import { computeAllMilesRpm, computeLoadedRpm, computeTotalMiles } from '../dispatch/dispatchCalculations';

export { computeLoadedRpm, computeAllMilesRpm, computeTotalMiles };

export function computeTrueImmediateMiles(pickupDeadheadMiles: number, loadedMiles: number): number {
  return computeTotalMiles(loadedMiles, Math.max(0, pickupDeadheadMiles));
}

export function computeTrueRpm(carrierRateMinor: number, pickupDeadheadMiles: number, loadedMiles: number): number {
  return computeAllMilesRpm(carrierRateMinor, loadedMiles, Math.max(0, pickupDeadheadMiles));
}

export function computePostingAgeHours(publishedAt?: string, nowMs = Date.now()): number | null {
  if (!publishedAt) return null;
  const t = Date.parse(publishedAt);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((nowMs - t) / 3_600_000));
}

export function estimateFuelCostMinor(totalMiles: number, mpg = 6.5, fuelPricePerGallonMinor = 350): number {
  if (totalMiles <= 0 || mpg <= 0) return 0;
  return Math.round((totalMiles / mpg) * fuelPricePerGallonMinor);
}

export function estimateOperatingCostMinor(
  totalMiles: number,
  fuelMinor: number,
  driverPayPerMileMinor = 55,
  dispatchFeeMinor = 0,
  factoringFeePercent = 0,
  carrierRateMinor = 0,
): number {
  const driver = Math.round(totalMiles * driverPayPerMileMinor);
  const factoring = factoringFeePercent > 0 ? Math.round((carrierRateMinor * factoringFeePercent) / 100) : 0;
  return fuelMinor + driver + dispatchFeeMinor + factoring;
}
