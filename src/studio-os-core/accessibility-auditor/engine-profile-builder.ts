import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildAccessibilityFindings,
  buildDimensionScores,
  computeOverallAccessibilityScore,
  countOpenIssues,
  countPagesNeedingWork,
  deriveAverageWcagLevel,
} from './audit-engine';
import {
  buildAccessibilityPageReports,
  buildDockAccessibilityLine,
} from './report-engine';
import { buildUserSimulations } from './simulation-engine';
import type { OrganizationAccessibilityAuditorProfile } from './types';

export function buildOrganizationAccessibilityAuditorProfile(
  organizationId: string
): OrganizationAccessibilityAuditorProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const dimensionScores = buildDimensionScores(organizationId);
  const findings = buildAccessibilityFindings(organizationId);
  const pageReports = buildAccessibilityPageReports(findings, now);
  const simulations = buildUserSimulations(pageReports);
  const overallAccessibilityScore = computeOverallAccessibilityScore(pageReports);

  const profile: OrganizationAccessibilityAuditorProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallAccessibilityScore,
    pagesAudited: pageReports.length,
    issuesOpen: countOpenIssues(findings),
    pagesNeedingWork: countPagesNeedingWork(pageReports),
    averageWcagLevel: deriveAverageWcagLevel(pageReports),
    dimensionScores,
    findings,
    pageReports,
    simulations,
    selectedPageId: pageReports.find((p) => !p.inclusivelyUsable)?.pageId ?? pageReports[0]?.pageId ?? null,
    dockAccessibilityLine: '',
    inclusiveDesignPhilosophy: true,
    lastSyncedAt: now,
  };

  profile.dockAccessibilityLine = buildDockAccessibilityLine(profile);
  return profile;
}
