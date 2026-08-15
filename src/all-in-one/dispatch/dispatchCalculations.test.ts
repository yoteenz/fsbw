import { describe, expect, it } from 'vitest';
import {
  computeAllMilesRpm,
  computeDeadheadPercent,
  computeDispatchFeeMinor,
  computeGrossMinor,
  computeLoadedRpm,
  computeTotalMiles,
  sumApprovedAccessorials,
} from './dispatchCalculations';

describe('dispatchCalculations', () => {
  it('computes total miles', () => {
    expect(computeTotalMiles(600, 75)).toBe(675);
  });

  it('computes loaded RPM', () => {
    expect(computeLoadedRpm(180000, 600)).toBe(300);
  });

  it('computes all-miles RPM', () => {
    expect(computeAllMilesRpm(180000, 600, 75)).toBe(267);
  });

  it('computes deadhead percent safely', () => {
    expect(computeDeadheadPercent(75, 600)).toBeCloseTo(11.11, 1);
    expect(computeDeadheadPercent(0, 0)).toBe(0);
  });

  it('computes gross from components', () => {
    expect(computeGrossMinor(200000, 35000, 5000)).toBe(240000);
  });

  it('sums only approved accessorials', () => {
    const total = sumApprovedAccessorials([
      { amountMinor: 10000, status: 'requested' },
      { amountMinor: 5000, status: 'approved' },
    ]);
    expect(total).toBe(5000);
  });

  it('computes dispatch fee percentage', () => {
    expect(computeDispatchFeeMinor(235000, 'percentage', 800)).toBe(18800);
  });

  it('computes flat per load dispatch fee', () => {
    expect(computeDispatchFeeMinor(235000, 'flat_per_load', undefined, 7500)).toBe(7500);
  });
});
