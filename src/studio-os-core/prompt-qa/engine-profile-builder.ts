import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildPromptQaFindings,
  buildSourceCoverage,
  computeOverallQaScore,
  countNotProductionReady,
  countOpenFindings,
} from './audit-engine';
import { buildPromptAuditReports, buildDockQaLine } from './report-engine';
import { buildPromptVersionHistory } from './version-engine';
import type { OrganizationPromptQaProfile } from './types';

export function buildOrganizationPromptQaProfile(organizationId: string): OrganizationPromptQaProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const sourceCoverage = buildSourceCoverage(organizationId);
  const findings = buildPromptQaFindings(organizationId);
  const auditReports = buildPromptAuditReports(findings, organizationId, now);
  const versionHistory = buildPromptVersionHistory(organizationId);
  const overallQaScore = computeOverallQaScore(auditReports);
  const averageAiConfidence = Math.round(
    auditReports.reduce((s, r) => s + r.estimatedAiConfidence, 0) / Math.max(auditReports.length, 1)
  );

  const profile: OrganizationPromptQaProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallQaScore,
    promptsAudited: auditReports.length,
    findingsOpen: countOpenFindings(findings),
    promptsNotProductionReady: countNotProductionReady(auditReports),
    averageAiConfidence,
    sourceCoverage,
    findings,
    auditReports,
    versionHistory,
    selectedPromptId: auditReports.find((r) => !r.productionReady)?.promptId ?? auditReports[0]?.promptId ?? null,
    dockQaLine: '',
    missionCriticalInfrastructure: true,
    lastSyncedAt: now,
  };

  profile.dockQaLine = buildDockQaLine(profile);
  return profile;
}
