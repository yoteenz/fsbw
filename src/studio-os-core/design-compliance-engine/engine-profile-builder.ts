import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildCategoryScores,
  buildComplianceFindings,
  computeCreativeDirectorScore,
  countNonCompliantPages,
  countOpenFindings,
} from './audit-engine';
import { buildDockComplianceLine, buildPageComplianceReports } from './report-engine';
import type { OrganizationDesignComplianceEngineProfile } from './types';

export function buildOrganizationDesignComplianceEngineProfile(
  organizationId: string
): OrganizationDesignComplianceEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const categoryScores = buildCategoryScores(organizationId);
  const findings = buildComplianceFindings(organizationId);
  const pageReports = buildPageComplianceReports(findings, now);
  const creativeDirectorScore = computeCreativeDirectorScore(categoryScores, pageReports);
  const averageLuxuryScore = Math.round(
    pageReports.reduce((s, r) => s + r.luxuryScore, 0) / Math.max(pageReports.length, 1)
  );

  const profile: OrganizationDesignComplianceEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    creativeDirectorScore,
    pagesAudited: pageReports.length,
    findingsOpen: countOpenFindings(findings),
    pagesNonCompliant: countNonCompliantPages(pageReports),
    averageLuxuryScore,
    categoryScores,
    findings,
    pageReports,
    selectedPageId: pageReports.find((p) => !p.recognizedAsStudioOs)?.pageId ?? pageReports[0]?.pageId ?? null,
    dockComplianceLine: '',
    studioOsCreativeDirector: true,
    lastSyncedAt: now,
  };

  profile.dockComplianceLine = buildDockComplianceLine(profile);
  return profile;
}
