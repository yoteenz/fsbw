import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationWorkflowEngineProfile } from '../workflow-engine/store';
import {
  buildQaResponsibilities,
  buildRecentValidations,
  countActiveIssues,
  countValidationsToday,
} from './validation-engine';
import {
  buildTrustScoreEntries,
  computeOverallTrustScore,
  computeTrustTrend,
} from './trust-score-engine';
import type { OrganizationQaHeadquartersProfile } from './types';

export function buildDockQaLine(profile: OrganizationQaHeadquartersProfile): string {
  return `QA Headquarters™ ${profile.overallTrustScore}% trust · ${profile.validationsToday} validations today · ${profile.activeIssues} active issues · quietly protecting ${profile.companyName}.`;
}

export function buildOrganizationQaHeadquartersProfile(organizationId: string): OrganizationQaHeadquartersProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const workflow = getOrganizationWorkflowEngineProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const trustScores = buildTrustScoreEntries(now);

  if (confidence) {
    const brainEntry = trustScores.find((t) => t.systemId === 'profession-brain');
    if (brainEntry) {
      brainEntry.scorePct = Math.round((brainEntry.scorePct + confidence.overallConfidenceScore) / 2);
      brainEntry.summary = `${confidence.brainsAssessed} brains assessed · ${confidence.brainsNeedingTeaching} need teaching.`;
    }
  }

  if (workflow) {
    const workflowEntry = trustScores.find((t) => t.systemId === 'workflows');
    if (workflowEntry) {
      workflowEntry.scorePct = Math.min(99, Math.round((workflowEntry.scorePct + workflow.choreographyScore) / 2));
    }
  }

  const responsibilities = buildQaResponsibilities(now);
  const recentValidations = buildRecentValidations(now);
  const overallTrustScore = computeOverallTrustScore(trustScores);

  const profile: OrganizationQaHeadquartersProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallTrustScore,
    trustTrend: computeTrustTrend(trustScores),
    validationsToday: countValidationsToday(recentValidations),
    activeIssues: countActiveIssues(responsibilities),
    trustScores,
    responsibilities,
    recentValidations,
    dockQaLine: '',
    qualityAssuranceActive: true,
    lastSyncedAt: now,
  };

  profile.dockQaLine = buildDockQaLine(profile);
  return profile;
}

export function summarizeQaHeadquarters(profile: OrganizationQaHeadquartersProfile): string {
  return `${profile.dockQaLine} Studio OS continuously earns trust.`;
}
