import type { InnovationGraph, IntellectualEquityMetrics } from './types';

export function computeIntellectualEquity(graph: InnovationGraph): IntellectualEquityMetrics {
  const forks = graph.edges.filter((e) => e.relationType === 'forked-from').length;
  const merges = graph.edges.filter((e) => e.relationType === 'merged-with').length;
  const flagship = graph.nodes.find((n) => n.marketplaceBestseller) ?? graph.nodes[graph.nodes.length - 1]!;
  const companiesUsing = graph.nodes.reduce((s, n) => s + n.companiesUsing, 0);
  const reuseCount = Math.round(companiesUsing * 0.35 + forks * 120);
  const revenue = flagship.marketplaceBestseller ? 284_000 + forks * 12_000 : forks * 4000;

  const influenceScore = Math.min(
    99,
    Math.round(40 + forks * 6 + merges * 8 + Math.log10(Math.max(1, companiesUsing)) * 12)
  );
  const innovationReach = Math.min(99, Math.round(companiesUsing / 250 + forks * 5));
  const creativeEquity = Math.min(99, Math.round(influenceScore * 0.55 + innovationReach * 0.45));

  return {
    originalContributions: graph.nodes.filter((n) => n.id === graph.rootNodeId).length || 1,
    derivativeWorks: Math.max(0, graph.nodes.length - 1),
    forks,
    successfulMerges: merges,
    marketplaceRevenueUsd: revenue,
    reuseCount,
    companiesUsing,
    influenceScore,
    innovationReach,
    creativeEquity,
  };
}

export function formatIntellectualEquitySummary(metrics: IntellectualEquityMetrics): string {
  return `Influence ${metrics.influenceScore} · Reach ${metrics.innovationReach} · Creative Equity ${metrics.creativeEquity} · ${metrics.companiesUsing.toLocaleString()} companies · $${metrics.marketplaceRevenueUsd.toLocaleString()} revenue`;
}
