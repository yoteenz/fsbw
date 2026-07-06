import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildExecutiveForecasts, summarizeExecutiveForecasts } from './executive-forecasts';
import { buildPredictiveIntelligenceSnapshots, summarizeIntelligenceSnapshots } from './predictive-intelligence';
import { buildOrganizationPredictions, summarizePredictions } from './predictions-engine';
import type { OrganizationPredictiveProfile } from './types';

export function computePredictiveScore(
  domainsAnalyzed: number,
  predictionsActive: number,
  avgConfidence: number
): number {
  return Math.min(
    98,
    Math.round(domainsAnalyzed * 3 + predictionsActive * 4 + avgConfidence * 0.45)
  );
}

export function buildDockPredictionLine(profile: OrganizationPredictiveProfile): string {
  const launch = profile.predictions.find((p) => p.category === 'launch');
  const busy = profile.predictions.find((p) => p.category === 'busy-season');
  const capacity = profile.predictions.find((p) => p.category === 'capacity');
  const thirtyDay = profile.executiveForecasts.find((f) => f.horizon === '30-day');

  if (launch) return launch.recommendedAction;
  if (busy) return busy.prediction;
  if (capacity) return capacity.recommendedAction;
  if (thirtyDay) return thirtyDay.summary;
  return 'Predictive Organization monitoring — forecasts improve as historical intelligence accumulates.';
}

export function buildOrganizationPredictiveProfile(organizationId: string): OrganizationPredictiveProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const intelligenceSnapshots = buildPredictiveIntelligenceSnapshots(organizationId);
  const predictions = buildOrganizationPredictions(organizationId, intelligenceSnapshots);
  const executiveForecasts = buildExecutiveForecasts(organizationId, intelligenceSnapshots, predictions);

  const avgConfidence =
    predictions.reduce((sum, p) => sum + p.confidencePct, 0) / Math.max(1, predictions.length);

  const profile: OrganizationPredictiveProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    predictiveScore: 0,
    domainsAnalyzed: intelligenceSnapshots.length,
    predictionsActive: predictions.length,
    forecastsReady: executiveForecasts.length,
    intelligenceSnapshots,
    predictions,
    executiveForecasts,
    dockPredictionLine: '',
    prepareNotReact: true,
    syncedSources: [
      'relationship-memory',
      'anticipation-engine',
      'ambient-awareness',
      'organization-pulse',
      'company-health-index',
      'founder-cognitive-load',
      'knowledge-confidence',
      'business-discovery-blueprint',
      'profession-brain',
      'executive-council',
      'cross-organization-intelligence',
      'command-dock',
    ],
  };

  profile.predictiveScore = computePredictiveScore(
    profile.domainsAnalyzed,
    profile.predictionsActive,
    avgConfidence || 70
  );
  profile.dockPredictionLine = buildDockPredictionLine(profile);
  return profile;
}

export function summarizePredictiveOrganizationProfile(profile: OrganizationPredictiveProfile): string {
  return [
    profile.dockPredictionLine,
    `${profile.domainsAnalyzed} domains analyzed · ${profile.predictionsActive} prediction(s) · predictive score ${profile.predictiveScore}%.`,
    summarizeIntelligenceSnapshots(profile.intelligenceSnapshots),
    summarizePredictions(profile.predictions),
    summarizeExecutiveForecasts(profile.executiveForecasts),
    'Every prediction includes reasoning and confidence — prepare, don\'t react.',
  ].join(' ');
}
