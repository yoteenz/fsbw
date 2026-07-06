import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { EXECUTIVE_IDENTITY_PILLARS } from './constants';
import { buildContinuousLearningSignals, summarizeContinuousLearning } from './learning-engine';
import {
  buildHolisticRecommendations,
  buildReasoningContext,
  summarizeReasoningContext,
} from './reasoning-engine';
import {
  buildConnectedSystemSnapshots,
  countConnectedSystems,
  summarizeConnectedSystems,
} from './system-integration';
import type { OrganizationConsciousnessProfile } from './types';

export function computeConsciousnessScore(
  systemsConnected: number,
  systemsTotal: number,
  reasoningFactors: number,
  avgVitality: number
): number {
  const connectionPct = (systemsConnected / Math.max(1, systemsTotal)) * 100;
  return Math.min(
    99,
    Math.round(connectionPct * 0.45 + reasoningFactors * 3 + avgVitality * 0.25)
  );
}

export function buildExecutiveIdentityLine(score: number): string {
  const pillars = EXECUTIVE_IDENTITY_PILLARS.slice(0, 5).join(' · ');
  return `Consciousness ${score}% — the organization ${pillars}. One intelligence, not software.`;
}

export function buildDockConsciousnessLine(profile: OrganizationConsciousnessProfile): string {
  const top = profile.holisticRecommendations[0];
  if (top) return top.recommendation;
  return `${profile.systemsConnected}/${profile.systemsTotal} systems unified — PRESERVE EXPERTISE. BUILD LEGACY.`;
}

export function buildOrganizationConsciousnessProfile(organizationId: string): OrganizationConsciousnessProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const connectedSystems = buildConnectedSystemSnapshots(organizationId);
  const reasoningContext = buildReasoningContext(organizationId);
  const holisticRecommendations = buildHolisticRecommendations(organizationId, reasoningContext);
  const continuousLearning = buildContinuousLearningSignals(organizationId);

  const systemsConnected = countConnectedSystems(connectedSystems);
  const avgVitality =
    connectedSystems.reduce((s, c) => s + c.vitalityPct, 0) / Math.max(1, connectedSystems.length);

  const profile: OrganizationConsciousnessProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    consciousnessScore: 0,
    systemsConnected,
    systemsTotal: connectedSystems.length,
    reasoningFactorsActive: reasoningContext.length,
    learningSignalsCount: continuousLearning.length,
    connectedSystems,
    reasoningContext,
    holisticRecommendations,
    continuousLearning,
    executiveIdentityLine: '',
    dockConsciousnessLine: '',
    unifiedIntelligence: true,
    syncedSources: connectedSystems.map((s) => s.systemId),
  };

  profile.consciousnessScore = computeConsciousnessScore(
    systemsConnected,
    connectedSystems.length,
    reasoningContext.length,
    avgVitality
  );
  profile.executiveIdentityLine = buildExecutiveIdentityLine(profile.consciousnessScore);
  profile.dockConsciousnessLine = buildDockConsciousnessLine(profile);
  return profile;
}

export function summarizeOrganizationalConsciousnessProfile(profile: OrganizationConsciousnessProfile): string {
  return [
    profile.dockConsciousnessLine,
    profile.executiveIdentityLine,
    `${profile.consciousnessScore}% consciousness · ${profile.systemsConnected}/${profile.systemsTotal} systems unified.`,
    summarizeConnectedSystems(profile.connectedSystems),
    summarizeReasoningContext(profile.reasoningContext),
    summarizeContinuousLearning(profile.continuousLearning),
    'PRESERVE EXPERTISE. BUILD LEGACY. — the living consciousness of the organization.',
  ].join(' ');
}
