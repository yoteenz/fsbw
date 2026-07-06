import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildConfidenceRecommendations,
  computeOverallConfidence,
  countLowConfidence,
} from './recommendation-engine';
import { buildDockConfidenceLine, buildExplorerHistory } from './explorer-engine';
import type { OrganizationConfidenceEngineProfile } from './types';

export function buildOrganizationConfidenceEngineProfile(organizationId: string): OrganizationConfidenceEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const recommendations = buildConfidenceRecommendations(organizationId, now);
  const explorerHistory = buildExplorerHistory(recommendations, now);

  const profile: OrganizationConfidenceEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallConfidenceScore: computeOverallConfidence(recommendations),
    averageRecommendationConfidence: computeOverallConfidence(recommendations),
    recommendationsActive: recommendations.length,
    lowConfidenceCount: countLowConfidence(recommendations),
    explorerEntries: explorerHistory.length,
    recommendations,
    explorerHistory,
    selectedRecommendationId: recommendations[0]?.id ?? null,
    dockConfidenceLine: '',
    confidenceIsConversation: true,
    lastSyncedAt: now,
  };

  profile.dockConfidenceLine = buildDockConfidenceLine(profile);
  return profile;
}
