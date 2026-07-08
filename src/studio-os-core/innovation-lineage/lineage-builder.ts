import { getOrganizationCollaborativeInnovationNetworkProfile } from '../collaborative-innovation-network/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildDemoContributionTimeline } from './contribution-timeline';
import { buildLineageDiscoveryOpportunities } from './discovery-lineage';
import { buildDemoForkRecords } from './forking-engine';
import { buildFounderInnovationLegacy } from './founder-legacy';
import { computeIntellectualEquity } from './intellectual-equity';
import {
  buildLineageTimelineFromGraph,
  buildLuxuryCustomerExperienceLineageGraph,
  summarizeLineageGraph,
} from './lineage-graph';
import { buildMarketplaceInventionListing } from './marketplace-lineage';
import type { LineageGalleryExhibit, OrganizationInnovationLineageProfile } from './types';

export function computeLineageScore(
  graphCount: number,
  equityInfluence: number,
  forkCount: number,
  exhibitCount: number
): number {
  return Math.min(99, 35 + graphCount * 10 + equityInfluence * 0.25 + forkCount * 4 + exhibitCount * 5);
}

export function buildDockLineageLine(profile: OrganizationInnovationLineageProfile): string {
  const top = profile.galleryExhibits[0];
  if (top) {
    return `This Headquarters traces back through ${top.graph.nodes.length} generations — ${top.companiesUsing.toLocaleString()} companies in the lineage.`;
  }
  return 'Innovation Lineage™ — every invention develops a permanent family tree.';
}

export function buildLineageGalleryExhibits(graphs: ReturnType<typeof buildLuxuryCustomerExperienceLineageGraph>[]): LineageGalleryExhibit[] {
  return graphs.map((graph, i) => {
    const timeline = buildLineageTimelineFromGraph(graph);
    const equity = computeIntellectualEquity(graph);
    const flagship = graph.nodes.find((n) => n.marketplaceBestseller) ?? graph.nodes[graph.nodes.length - 1]!;
    const forks = graph.edges.filter((e) => e.relationType === 'forked-from').map((e) => {
      const n = graph.nodes.find((node) => node.id === e.toNodeId);
      return n?.title ?? 'Fork';
    });
    const collaborators = graph.edges
      .filter((e) => e.actorName)
      .map((e) => e.actorName!)
      .filter((n, idx, arr) => arr.indexOf(n) === idx);

    return {
      id: `exhibit-${i}`,
      title: flagship.title,
      originalVision: graph.nodes.find((n) => n.id === graph.rootNodeId)?.title ?? flagship.title,
      majorForks: forks,
      collaborators,
      marketplaceSuccess: flagship.marketplaceBestseller
        ? `Marketplace Bestseller™ · Influence ${equity.influenceScore}`
        : `Published · Reach ${equity.innovationReach}`,
      companiesUsing: flagship.companiesUsing,
      currentEvolution: summarizeLineageGraph(graph),
      graph,
      timeline,
      equity,
    };
  });
}

export function buildOrganizationInnovationLineageProfile(
  organizationId: string
): OrganizationInnovationLineageProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const cin = getOrganizationCollaborativeInnovationNetworkProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();

  const primaryGraph = buildLuxuryCustomerExperienceLineageGraph();
  const graphs = [primaryGraph];
  const galleryExhibits = buildLineageGalleryExhibits(graphs);
  const equity = computeIntellectualEquity(primaryGraph);
  const forkRecords = buildDemoForkRecords();
  const marketplaceInventions = galleryExhibits.map((e) =>
    buildMarketplaceInventionListing(e.graph, e.equity.influenceScore)
  );
  const founderLegacy = buildFounderInnovationLegacy(
    `founder-${organizationId}`,
    'Founder',
    equity,
    cin?.summary.activeSessions ?? 2
  );
  const discoveryOpportunities = buildLineageDiscoveryOpportunities(organizationId);

  // Ensure contribution timeline is built for sync metadata
  buildDemoContributionTimeline(galleryExhibits[0]?.title ?? 'Innovation');

  const profile: OrganizationInnovationLineageProfile = {
    organizationId,
    companyName,
    updatedAt: new Date().toISOString(),
    lineageScore: 0,
    graphs,
    galleryExhibits,
    founderLegacy,
    marketplaceInventions,
    forkRecords,
    discoveryOpportunities,
    dockLineageLine: '',
    syncedSources: [
      'collaborative-innovation-network',
      'marketplace',
      'studio-museum',
      'innovation-lab',
      'global-atlas-layer',
    ],
    permanentInnovationLineage: true,
  };

  profile.lineageScore = computeLineageScore(
    graphs.length,
    equity.influenceScore,
    forkRecords.length,
    galleryExhibits.length
  );
  profile.dockLineageLine = buildDockLineageLine(profile);

  if (cin) {
    profile.syncedSources.push(`cin:${cin.jointInnovations.length}-joint-innovations`);
  }

  return profile;
}

export function summarizeInnovationLineage(profile: OrganizationInnovationLineageProfile): string {
  const exhibit = profile.galleryExhibits[0];
  return [
    `Lineage Score ${profile.lineageScore}%`,
    exhibit ? summarizeLineageGraph(exhibit.graph) : 'No exhibits',
    `Founder Legacy — Innovation Score ${profile.founderLegacy.innovationScore}`,
    `${profile.forkRecords.length} fork actions with lineage preserved`,
  ].join(' · ');
}
