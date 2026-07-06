import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { summarizeConnections, buildIntelligentConnections } from './connection-engine';
import { buildFounderNetwork } from './founder-network';
import { buildPrivacySettings, privacyFirstSummary } from './privacy-controls';
import { buildDiscoverableResources } from './resource-awareness';
import type { OrganizationCrossOrgIntelligenceProfile } from './types';

export function computeCollaborationScore(
  connections: number,
  networkMembers: number,
  discoverableCount: number
): number {
  return Math.min(
    92,
    Math.round(40 + connections * 8 + networkMembers * 4 + discoverableCount * 3)
  );
}

export function buildDockHeadline(profile: OrganizationCrossOrgIntelligenceProfile): string {
  const top = profile.connectionSuggestions[0];
  if (top) {
    return `${top.title} — permission required before any collaboration begins. ${privacyFirstSummary()}`;
  }
  return `Founder network active (${profile.networkMembers} organizations) — opportunities, not exposure. ${privacyFirstSummary()}`;
}

export function buildOrganizationCrossOrgIntelligenceProfile(
  organizationId: string
): OrganizationCrossOrgIntelligenceProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const discoverableResources = buildDiscoverableResources(organizationId, companyName);
  const connectionSuggestions = buildIntelligentConnections(organizationId, companyName, industryId);
  const founderNetwork = buildFounderNetwork(organizationId, companyName);
  const privacySettings = buildPrivacySettings();
  const discoverableCount = discoverableResources.filter((r) => r.discoverable).length;

  const profile: OrganizationCrossOrgIntelligenceProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    collaborationScore: computeCollaborationScore(
      connectionSuggestions.length,
      founderNetwork.length,
      discoverableCount
    ),
    connectionsSuggested: connectionSuggestions.length,
    networkMembers: founderNetwork.length,
    discoverableResources,
    connectionSuggestions,
    founderNetwork,
    privacySettings,
    dockHeadline: '',
    privacyFirst: true,
    syncedSources: [
      'presence-engine',
      'anticipation-engine',
      'profession-brain',
      'knowledge-confidence',
      'business-discovery-blueprint',
      'expert-marketplace',
      'ecosystem-marketplace',
      'organization-context',
    ],
  };

  profile.dockHeadline = buildDockHeadline(profile);
  return profile;
}

export function summarizeCrossOrgProfile(profile: OrganizationCrossOrgIntelligenceProfile): string {
  return [
    profile.dockHeadline,
    summarizeConnections(profile.connectionSuggestions),
    `${profile.networkMembers} founder network member(s) · ${profile.discoverableResources.length} resource types monitored · collaboration score ${profile.collaborationScore}%.`,
    privacyFirstSummary(),
  ].join(' ');
}
