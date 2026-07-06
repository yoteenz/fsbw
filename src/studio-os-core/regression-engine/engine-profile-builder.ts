import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildHistoricalMemory } from './history-engine';
import {
  buildBrokenFeatures,
  buildCategoryScores,
  computeOverallRegressionScore,
  countBrokenFeatures,
  countRecurringPatterns,
} from './regression-engine';
import {
  buildBuildRegressionReports,
  buildDockRegressionLine,
} from './report-engine';
import { buildRegressionReplayResults } from './simulation-engine';
import type { OrganizationRegressionEngineProfile } from './types';

export function buildOrganizationRegressionEngineProfile(
  organizationId: string
): OrganizationRegressionEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const categoryScores = buildCategoryScores(organizationId);
  const brokenFeatures = buildBrokenFeatures(organizationId);
  const buildReports = buildBuildRegressionReports(brokenFeatures, now);
  const overallRegressionScore = computeOverallRegressionScore(buildReports);
  const replayResults = buildRegressionReplayResults(brokenFeatures, overallRegressionScore);
  const historicalMemory = buildHistoricalMemory(now);

  const profile: OrganizationRegressionEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallRegressionScore,
    buildsTested: buildReports.length,
    brokenFeaturesOpen: countBrokenFeatures(brokenFeatures),
    regressionsInHistory: historicalMemory.length,
    recurringPatterns: countRecurringPatterns(historicalMemory),
    categoryScores,
    brokenFeatures,
    buildReports,
    replayResults,
    historicalMemory,
    selectedBuildId: buildReports.find((r) => r.riskLevel === 'critical' || r.riskLevel === 'high')?.buildId ?? buildReports[0]?.buildId ?? null,
    dockRegressionLine: '',
    neverRepeatMistakes: true,
    lastSyncedAt: now,
  };

  profile.dockRegressionLine = buildDockRegressionLine(profile);
  return profile;
}
