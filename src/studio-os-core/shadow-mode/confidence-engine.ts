import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationWisdomProfile } from '../wisdom-capture/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import type { ConciergeConfidenceScores, ShadowLearningPhase } from './types';
import { DEFAULT_PHASE_THRESHOLDS } from './constants';
import type { FounderPhaseThresholds } from './types';

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeConciergeConfidence(
  organizationId: string,
  conciergeIndex: number
): ConciergeConfidenceScores {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const wisdom = getOrganizationWisdomProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);

  const brainMaturity = brain?.overallMaturityPct ?? 0;
  const memoryDepth = memory?.memoryDepthScore ?? 0;
  const wisdomDepth = wisdom?.wisdomDepthScore ?? 0;
  const blueprintPct = blueprint?.overallProgressPct ?? 0;
  const councilMeetings = council?.meetingsHeld ?? 0;

  const variance = conciergeIndex * 4;

  const knowledgeConfidence = clamp(25 + brainMaturity * 0.45 + wisdomDepth * 0.25 + variance);
  const workflowConfidence = clamp(
    20 + memoryDepth * 0.35 + (memory?.records.filter((r) => r.type === 'workflow-improvement').length ?? 0) * 6 + variance
  );
  const decisionConfidence = clamp(30 + blueprintPct * 0.3 + councilMeetings * 5 + variance);
  const automationReadiness = clamp(
    (knowledgeConfidence * 0.35 + workflowConfidence * 0.35 + decisionConfidence * 0.3) - (conciergeIndex > 5 ? 8 : 0)
  );

  const overallConfidence = clamp(
    (knowledgeConfidence + workflowConfidence + decisionConfidence + automationReadiness) / 4
  );

  return {
    knowledgeConfidence,
    workflowConfidence,
    decisionConfidence,
    automationReadiness,
    overallConfidence,
  };
}

export function resolvePhaseFromConfidence(
  overallConfidence: number,
  automationReadiness: number,
  automationThreshold: number,
  thresholds: FounderPhaseThresholds
): ShadowLearningPhase {
  if (automationReadiness >= automationThreshold && overallConfidence >= thresholds.automateMin) {
    return 'automate';
  }
  if (overallConfidence > thresholds.recommendMax) return 'assist';
  if (overallConfidence > thresholds.observeMax) return 'recommend';
  return 'observe';
}

export function buildPhaseRationale(
  phase: ShadowLearningPhase,
  confidence: ConciergeConfidenceScores,
  automationThreshold: number
): string {
  if (phase === 'observe') {
    return `Overall confidence ${confidence.overallConfidence}% — observing workflows and decisions before recommending changes.`;
  }
  if (phase === 'recommend') {
    return `Confidence rising (${confidence.overallConfidence}%) — suggesting improvements with founder approval required.`;
  }
  if (phase === 'assist') {
    return `Workflow confidence ${confidence.workflowConfidence}% — assisting approved portions with confirmation gates.`;
  }
  if (confidence.automationReadiness < automationThreshold) {
    return `Automation readiness ${confidence.automationReadiness}% below founder threshold ${automationThreshold}% — assist mode maintained.`;
  }
  return `Automation readiness ${confidence.automationReadiness}% meets threshold — recurring workflows eligible within boundaries.`;
}

export { DEFAULT_PHASE_THRESHOLDS };
