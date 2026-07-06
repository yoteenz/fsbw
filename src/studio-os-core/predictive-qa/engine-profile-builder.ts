import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildPreventativeActions,
  buildPredictiveQaPatterns,
  summarizePredictiveQa,
} from './pattern-engine';
import {
  buildPredictiveQaPredictions,
  computePredictiveQaScore,
  countHighRiskPredictions,
  countPreventableRisks,
} from './prediction-engine';
import type { OrganizationPredictiveQaProfile } from './types';

export function buildDockPredictiveQaLine(profile: OrganizationPredictiveQaProfile): string {
  return summarizePredictiveQa(profile);
}

export function buildOrganizationPredictiveQaProfile(organizationId: string): OrganizationPredictiveQaProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const predictions = buildPredictiveQaPredictions(organizationId, now);
  const patterns = buildPredictiveQaPatterns(predictions);
  const preventativeActions = buildPreventativeActions(predictions);
  const activePredictions = predictions.filter((p) => p.status === 'active').length;

  const profile: OrganizationPredictiveQaProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    predictiveQaScore: computePredictiveQaScore(predictions),
    activePredictions,
    highRiskPredictions: countHighRiskPredictions(predictions),
    patternsDetected: patterns.length,
    preventableRisks: countPreventableRisks(predictions),
    predictions,
    patterns,
    preventativeActions,
    dockPredictiveQaLine: '',
    protectsTheFuture: true,
    lastSyncedAt: now,
  };

  profile.dockPredictiveQaLine = buildDockPredictiveQaLine(profile);
  return profile;
}
