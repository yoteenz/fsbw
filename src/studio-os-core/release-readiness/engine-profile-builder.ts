import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildDisciplineApprovals,
  buildReadinessOpenIssues,
  collectBlockedSystems,
  computeConfidence,
  computeOverallReadinessScore,
  countApprovalsGranted,
} from './discipline-engine';
import { buildExecutiveApprovalBriefs } from './executive-engine';
import { deriveReleaseGate } from './gate-engine';
import {
  buildDockReadinessLine,
  buildProductionReadinessReports,
} from './report-engine';
import type { OrganizationReleaseReadinessProfile } from './types';

export function buildOrganizationReleaseReadinessProfile(
  organizationId: string
): OrganizationReleaseReadinessProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const disciplineApprovals = buildDisciplineApprovals(organizationId);
  const openIssues = buildReadinessOpenIssues(disciplineApprovals);
  const overallReadinessScore = computeOverallReadinessScore(disciplineApprovals);
  const releaseGate = deriveReleaseGate(disciplineApprovals, openIssues, overallReadinessScore);
  const productionReports = buildProductionReadinessReports(disciplineApprovals, openIssues, now);
  const executiveBriefs = buildExecutiveApprovalBriefs(productionReports, now);
  const approvalsGranted = countApprovalsGranted(disciplineApprovals);
  const blockedSystems = collectBlockedSystems(openIssues);

  const profile: OrganizationReleaseReadinessProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallReadinessScore,
    releaseGate,
    confidence: computeConfidence(disciplineApprovals, openIssues),
    openIssuesCount: openIssues.length,
    blockedSystemsCount: blockedSystems.length,
    approvalsGranted,
    approvalsRequired: disciplineApprovals.length,
    disciplineApprovals,
    openIssues,
    productionReports,
    executiveBriefs,
    selectedReleaseId: productionReports[0]?.releaseId ?? null,
    dockReadinessLine: '',
    productionIsAPrivilege: true,
    lastSyncedAt: now,
  };

  profile.dockReadinessLine = buildDockReadinessLine(profile);
  return profile;
}
