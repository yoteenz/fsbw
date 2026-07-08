import type { CareerWorldBlueprint } from '../types';
import type { CareerWorldState } from '../core/schemas';

export function tickEconomy(state: CareerWorldState, blueprint: CareerWorldBlueprint, days: number): CareerWorldState {
  const drift = (Math.random() - 0.45) * 0.02 * days;
  const economyIndex = Math.max(0.5, Math.min(2, state.economyIndex + drift));
  const companyGrowthIndex = Math.max(0, Math.min(1, state.companyGrowthIndex + drift * 0.5));

  const trendPool = blueprint.economy.marketForces;
  const industryTrend = trendPool[Math.floor(Math.random() * trendPool.length)] ?? state.industryTrend;

  return {
    ...state,
    economyIndex: Number(economyIndex.toFixed(3)),
    companyGrowthIndex: Number(companyGrowthIndex.toFixed(3)),
    industryTrend,
    activeTrends: trendPool.slice(0, 3),
  };
}

export function estimateIncomeMultiplier(economyIndex: number): number {
  return Math.max(0.75, Math.min(1.5, economyIndex));
}
