import type { BusinessModelEngineStore, EconomicSnapshot, EcosystemHealthMetrics } from './types';

export function buildDefaultEconomics(): EconomicSnapshot {
  return {
    mrr: 42800,
    arr: 513600,
    arpu: 142,
    marketplaceRevenue: 12400,
    subscriptionRevenue: 28400,
    royaltyRevenue: 3200,
    affiliateRevenue: 1800,
    platformFees: 8600,
    enterpriseRevenue: 48000,
    totalWalletBalances: 34200,
    payoutsPending: 5800,
    growthForecastPct: 18,
  };
}

export function buildDefaultEcosystemHealth(): EcosystemHealthMetrics {
  return {
    creatorSuccessScore: 82,
    brandSuccessScore: 78,
    marketplaceLiquidity: 74,
    averageEarnings: 1240,
    customerLifetimeValue: 4280,
    retentionPct: 91,
    churnPct: 4.2,
    workspaceGrowthPct: 22,
    networkGrowthPct: 28,
  };
}

export function summarizeStoreEconomics(store: BusinessModelEngineStore): EconomicSnapshot {
  const walletTotal = store.wallets.reduce((s, w) => s + w.availableBalance + w.pendingPayouts, 0);
  const payoutPending = store.wallets.reduce((s, w) => s + w.pendingPayouts, 0);
  return {
    ...store.economics,
    totalWalletBalances: walletTotal || store.economics.totalWalletBalances,
    payoutsPending: payoutPending || store.economics.payoutsPending,
  };
}
