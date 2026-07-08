import { buildDemoContributionTimeline } from './contribution-timeline';
import { buildLineageTimelineFromGraph } from './lineage-graph';
import type { InnovationGraph, MarketplaceInventionListing } from './types';

export function buildMarketplaceInventionListing(
  graph: InnovationGraph,
  performanceScore: number
): MarketplaceInventionListing {
  const flagship = graph.nodes.find((n) => n.marketplaceBestseller) ?? graph.nodes[graph.nodes.length - 1]!;
  const timeline = buildLineageTimelineFromGraph(graph);
  const contributors = graph.edges
    .filter((e) => e.actorName)
    .map((e) => e.actorName!)
    .filter((n, i, arr) => arr.indexOf(n) === i);

  void buildDemoContributionTimeline(flagship.title);

  return {
    innovationId: flagship.innovationId,
    title: flagship.title,
    innovationStory: `${flagship.title} is not a product — it is an invention with ${graph.nodes.length} generations of evolution, preserved forever in the Innovation Graph™.`,
    evolutionTimeline: timeline,
    contributors: contributors.length > 0 ? contributors : ['Founder'],
    lineageTreeSummary: timeline.map((s) => s.label).join(' → '),
    marketplacePerformanceScore: performanceScore,
    companiesUsing: flagship.companiesUsing,
    estimatedTimeSavedHours: Math.round(flagship.companiesUsing * 4.2),
    creativeBudgetSavedUsd: Math.round(flagship.companiesUsing * 850),
    founderReviews: [
      '"We adopted the full lineage — every fork explained why it works."',
      '"Finally a Marketplace listing that feels like studying invention history."',
    ],
    innovationImpactScore: Math.min(99, performanceScore + 8),
    potentialFutureForks: [
      'Hospitality Automation Merge™',
      'Retail Genome Preset Pack™',
      'Concierge Experience Expedition™',
    ],
  };
}

export function summarizeMarketplaceInvention(listing: MarketplaceInventionListing): string {
  return `${listing.title} — ${listing.companiesUsing.toLocaleString()} companies · ${listing.estimatedTimeSavedHours.toLocaleString()}h saved · Impact ${listing.innovationImpactScore}`;
}
