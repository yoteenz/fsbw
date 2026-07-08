import { getOrganizationInnovationLabProfile } from '../innovation-lab/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildDemoJointInnovations,
  summarizeJointInnovations,
} from './joint-innovations';
import {
  buildCollaboratorRecommendations,
  summarizeDiscovery,
} from './discovery-engine';
import {
  buildLiveCollaboratorPresences,
  buildSharedInnovationWorkspaces,
  summarizeLiveCollaboration,
} from './live-collaboration';
import {
  buildDemoPartnerGenomes,
  buildFounderGenomeSnapshot,
  combineCollaborationGenome,
} from './shared-genome';
import type { OrganizationCollaborativeInnovationNetworkProfile } from './types';

export function computeInnovationNetworkScore(
  liveCount: number,
  jointCount: number,
  publishedCount: number,
  recommendationCount: number
): number {
  return Math.min(99, 40 + liveCount * 6 + jointCount * 5 + publishedCount * 8 + recommendationCount * 2);
}

export function buildDockCollaborationLine(profile: OrganizationCollaborativeInnovationNetworkProfile): string {
  const top = profile.recommendations.sort((a, b) => b.complementScore - a.complementScore)[0];
  if (top && top.complementScore >= 80) {
    return `I've identified founders whose expertise complements yours — invite ${top.founderName} into ${top.suggestedWorkspace}.`;
  }
  const unpublished = profile.jointInnovations.find((j) => !j.published);
  if (unpublished) {
    return `"${unpublished.title}" appears to be an original innovation — ready to publish as ${unpublished.assetTypeLabel}.`;
  }
  if (profile.liveCollaborators.filter((p) => p.status === 'active').length >= 2) {
    return 'Multiple founders are co-inventing live — Shared Innovation Workspace™ active.';
  }
  return 'Collaborative Innovation Network™ — co-invent, publish, and distribute royalties automatically.';
}

export function buildOrganizationCollaborativeInnovationNetworkProfile(
  organizationId: string
): OrganizationCollaborativeInnovationNetworkProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const innovationLab = getOrganizationInnovationLabProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const founderGenome = buildFounderGenomeSnapshot(organizationId, companyName);
  const partners = buildDemoPartnerGenomes(organizationId);

  const sessionId = `session-${organizationId}`;
  const collaborationGenomes = [
    combineCollaborationGenome(sessionId, [founderGenome, ...partners.slice(0, 3)]),
  ];

  const liveCollaborators = buildLiveCollaboratorPresences(founderGenome, partners);
  const sharedWorkspaces = buildSharedInnovationWorkspaces(
    founderGenome,
    partners,
    collaborationGenomes.map((g) => g.id)
  );
  const jointInnovations = buildDemoJointInnovations(organizationId, companyName, partners);
  const recommendations = buildCollaboratorRecommendations(founderGenome, partners);

  const publishedCount = jointInnovations.filter((j) => j.published).length;
  const summary = {
    activeSessions: sharedWorkspaces.filter((w) => w.active).length,
    liveCollaborators: liveCollaborators.filter((p) => p.status === 'active').length,
    jointInnovationsPublished: publishedCount,
    marketplaceRevenuePotential: jointInnovations.reduce((s, j) => s + j.marketplacePerformanceScore, 0),
    recommendedCollaborators: recommendations.length,
  };

  const profile: OrganizationCollaborativeInnovationNetworkProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    innovationNetworkScore: 0,
    summary,
    founderGenome,
    liveCollaborators,
    sharedWorkspaces,
    collaborationGenomes,
    jointInnovations,
    recommendations,
    dockCollaborationLine: '',
    syncedSources: [
      'innovation-lab',
      'cross-organization-intelligence',
      'legacy-network',
      'expert-marketplace',
      'marketplace',
      'organization-genome',
      'profession-brain',
    ],
    permanentCollaborativeInvention: true,
  };

  profile.innovationNetworkScore = computeInnovationNetworkScore(
    summary.liveCollaborators,
    jointInnovations.length,
    publishedCount,
    recommendations.length
  );
  profile.dockCollaborationLine = buildDockCollaborationLine(profile);

  if (innovationLab) {
    profile.syncedSources.push(`innovation-lab:${innovationLab.ideasGenerated}-ideas`);
  }

  return profile;
}

export function summarizeCollaborativeInnovationNetwork(
  profile: OrganizationCollaborativeInnovationNetworkProfile
): string {
  return [
    `Innovation Network Score ${profile.innovationNetworkScore}%`,
    summarizeLiveCollaboration(profile.liveCollaborators),
    summarizeJointInnovations(profile.jointInnovations),
    summarizeDiscovery(profile.recommendations),
  ].join(' ');
}
