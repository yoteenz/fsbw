import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildCommunityHighlights, summarizeCommunity } from './community-engine';
import { discoverNetworkResources, summarizeDiscovery } from './discovery-engine';
import { buildPublishableAssets, summarizePublishableAssets } from './shareable-assets';
import { buildReputationProfile, summarizeReputation } from './reputation-system';
import type { OrganizationLegacyNetworkProfile } from './types';

export function computeNetworkMovementScore(
  publishedAssets: number,
  discoveredResources: number,
  legacyScore: number,
  communityTrust: number
): number {
  return Math.min(
    99,
    Math.round(publishedAssets * 8 + discoveredResources * 0.5 + legacyScore * 0.35 + communityTrust * 0.25)
  );
}

export function buildDockLegacyLine(profile: OrganizationLegacyNetworkProfile): string {
  const topDiscovered = profile.discoveredResourcesList.find((r) => r.verified && r.rating >= 4);
  const readyToPublish = profile.publishableAssetsList.filter((a) => !a.published).length;
  const published = profile.publishedAssets;

  if (topDiscovered) {
    return `A verified organization published "${topDiscovered.title}" — your industry may benefit. Full attribution preserved.`;
  }
  if (readyToPublish >= 5 && published === 0) {
    return `${readyToPublish} assets ready to publish — you retain complete IP ownership. Nothing shared automatically.`;
  }
  if (published >= 2) {
    return `${published} contributions live on Legacy Network — ${profile.reputation.find((r) => r.dimension === 'knowledge-impact')?.scorePct ?? 0}% knowledge impact.`;
  }
  return 'Legacy Network™ — permission-based ecosystem. Share expertise intentionally. PRESERVE EXPERTISE. BUILD LEGACY.';
}

export function buildOrganizationLegacyNetworkProfile(organizationId: string): OrganizationLegacyNetworkProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;
  const founderName = inauguration?.charter.founder ?? 'Founder';

  const publishableAssetsList = buildPublishableAssets(organizationId, companyName, founderName, industryId);
  const publishedAssets = publishableAssetsList.filter((a) => a.published).length;
  const discoveredResourcesList = discoverNetworkResources(organizationId, industryId, publishableAssetsList);
  const reputation = buildReputationProfile(
    organizationId,
    publishedAssets,
    discoveredResourcesList.length,
    publishableAssetsList
  );
  const communityHighlights = buildCommunityHighlights(organizationId, industryId);

  const legacyScorePct = reputation.find((r) => r.dimension === 'legacy-score')?.scorePct ?? 0;
  const communityTrustPct = reputation.find((r) => r.dimension === 'community-trust')?.scorePct ?? 0;

  const profile: OrganizationLegacyNetworkProfile = {
    organizationId,
    companyName,
    industryId,
    founderName,
    updatedAt: new Date().toISOString(),
    networkMovementScore: 0,
    publishableAssets: publishableAssetsList.length,
    publishedAssets,
    discoveredResources: discoveredResourcesList.length,
    communityTrustPct,
    legacyScorePct,
    publishableAssetsList,
    discoveredResourcesList,
    reputation,
    communityHighlights,
    dockLegacyLine: '',
    permissionBasedEcosystem: true,
    notAMarketplace: true,
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'studio-institute',
      'innovation-lab',
      'organization-operating-manual',
      'organization-inauguration',
      'executive-council',
      'knowledge-commerce',
      'command-dock',
    ],
  };

  profile.networkMovementScore = computeNetworkMovementScore(
    publishedAssets,
    discoveredResourcesList.length,
    legacyScorePct,
    communityTrustPct
  );
  profile.dockLegacyLine = buildDockLegacyLine(profile);
  return profile;
}

export function summarizeLegacyNetworkProfile(profile: OrganizationLegacyNetworkProfile): string {
  return [
    profile.dockLegacyLine,
    `Network movement ${profile.networkMovementScore}% · ${summarizePublishableAssets(profile.publishableAssetsList)}`,
    summarizeDiscovery(profile.discoveredResourcesList),
    summarizeReputation(profile.reputation),
    summarizeCommunity(profile.communityHighlights),
    'Not a marketplace — a movement. PRESERVE EXPERTISE. BUILD LEGACY.',
  ].join(' ');
}
