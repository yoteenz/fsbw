import { CORE_DIGITAL_EXECUTIVES } from '../executive-council/constants';
import { resolveDigitalExecutiveRoster } from '../executive-council/digital-executives';
import { resolveIndustryForWorkspace } from '../industry-architecture/industries';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildPhaseRationale,
  computeConciergeConfidence,
  resolvePhaseFromConfidence,
} from './confidence-engine';
import { DEFAULT_AUTOMATION_THRESHOLD, DEFAULT_PHASE_THRESHOLDS } from './constants';
import type {
  ConciergeShadowProfile,
  OrganizationShadowModeProfile,
  ShadowTransparencyEntry,
} from './types';

function buildTransparencyEntry(
  profile: ConciergeShadowProfile,
  organizationId: string
): ShadowTransparencyEntry {
  return {
    id: `transparency-${organizationId}-${profile.conciergeId}-${Date.now()}`,
    conciergeId: profile.conciergeId,
    conciergeName: profile.conciergeName,
    recordedAt: new Date().toISOString(),
    observed: `${profile.observationsCount} workflow observations · ${profile.patternsLearned} patterns identified in ${profile.department}.`,
    learned: `Knowledge ${profile.confidence.knowledgeConfidence}% · Workflow ${profile.confidence.workflowConfidence}% · Decision ${profile.confidence.decisionConfidence}%.`,
    canAutomate: profile.canAutomate
      ? `Eligible for Phase 4 automation (${profile.confidence.automationReadiness}% readiness ≥ ${profile.automationThreshold}% threshold).`
      : `Not yet eligible — automation readiness ${profile.confidence.automationReadiness}% · threshold ${profile.automationThreshold}%.`,
    confidenceReason: profile.phaseRationale,
    phase: profile.currentPhase,
  };
}

function buildConciergeShadowProfile(
  organizationId: string,
  concierge: { id: string; name: string; department: string },
  index: number,
  existing?: ConciergeShadowProfile
): ConciergeShadowProfile {
  const confidence = computeConciergeConfidence(organizationId, index);
  const automationThreshold = existing?.automationThreshold ?? DEFAULT_AUTOMATION_THRESHOLD;
  const currentPhase = resolvePhaseFromConfidence(
    confidence.overallConfidence,
    confidence.automationReadiness,
    automationThreshold,
    DEFAULT_PHASE_THRESHOLDS
  );
  const canAutomate =
    currentPhase === 'automate' && confidence.automationReadiness >= automationThreshold;
  const phaseRationale = buildPhaseRationale(currentPhase, confidence, automationThreshold);

  const observationsCount = Math.max(3, Math.round(confidence.knowledgeConfidence / 8) + index);
  const patternsLearned = Math.max(1, Math.round(confidence.workflowConfidence / 12));
  const recommendationsOffered =
    currentPhase === 'observe' ? 0 : Math.max(1, Math.round(confidence.overallConfidence / 15));
  const assistedWorkflows = currentPhase === 'assist' || currentPhase === 'automate' ? Math.max(0, patternsLearned - 1) : 0;
  const automatedWorkflows = canAutomate ? Math.max(0, assistedWorkflows - 1) : 0;

  return {
    conciergeId: concierge.id,
    conciergeName: concierge.name,
    department: concierge.department,
    currentPhase,
    confidence,
    automationThreshold,
    observationsCount,
    patternsLearned,
    recommendationsOffered,
    assistedWorkflows,
    automatedWorkflows,
    canAutomate,
    phaseRationale,
  };
}

export function buildOrganizationShadowModeProfile(
  organizationId: string,
  existing?: OrganizationShadowModeProfile | null
): OrganizationShadowModeProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const roster = resolveDigitalExecutiveRoster(organizationId).filter((e) => e.active);

  const conciergeProfiles = (roster.length > 0 ? roster : CORE_DIGITAL_EXECUTIVES.slice(0, 6)).map(
    (exec, index) => {
      const existingConcierge = existing?.conciergeProfiles.find((c) => c.conciergeId === exec.id);
      return buildConciergeShadowProfile(
        organizationId,
        { id: exec.id, name: exec.name, department: exec.department },
        index,
        existingConcierge
      );
    }
  );

  const transparencyLog = conciergeProfiles.slice(0, 5).map((p) => buildTransparencyEntry(p, organizationId));
  const overallTrustScore = clampAvg(conciergeProfiles.map((c) => c.confidence.overallConfidence));

  return {
    organizationId,
    companyName: brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase(),
    industryId: brain?.industryId ?? resolveIndustryForWorkspace(organizationId),
    updatedAt: new Date().toISOString(),
    overallTrustScore,
    conciergesInShadow: conciergeProfiles.filter((c) => c.currentPhase === 'observe').length,
    conciergesReadyToAutomate: conciergeProfiles.filter((c) => c.canAutomate).length,
    phaseThresholds: existing?.phaseThresholds ?? { ...DEFAULT_PHASE_THRESHOLDS },
    conciergeProfiles,
    transparencyLog: [...transparencyLog, ...(existing?.transparencyLog ?? [])].slice(0, 30),
    syncedSources: [
      'profession-brain',
      'memory-engine',
      'wisdom-capture',
      'executive-council',
      'business-discovery-blueprint',
      'concierge-layer',
    ],
  };
}

function clampAvg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}
