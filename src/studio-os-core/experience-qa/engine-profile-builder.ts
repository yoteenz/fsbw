import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildCategoryScores,
  buildExperienceFindings,
  computeOverallExperienceScore,
  countOpenFindings,
  countPagesNeedingRefinement,
} from './audit-engine';
import {
  buildDockExperienceLine,
  buildExperiencePageReports,
  buildQuestionAnswers,
} from './report-engine';
import { buildPersonaSimulations } from './simulation-engine';
import type { OrganizationExperienceQaProfile } from './types';

export function buildOrganizationExperienceQaProfile(organizationId: string): OrganizationExperienceQaProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const categoryScores = buildCategoryScores(organizationId);
  const findings = buildExperienceFindings(organizationId);
  const pageReports = buildExperiencePageReports(findings, now);
  const simulations = buildPersonaSimulations(pageReports);
  const questionAnswers = buildQuestionAnswers(pageReports);
  const overallExperienceScore = computeOverallExperienceScore(pageReports);
  const averageEmotionalLoad = Math.round(
    pageReports.reduce((s, r) => s + r.emotionalLoad, 0) / Math.max(pageReports.length, 1)
  );

  const profile: OrganizationExperienceQaProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    overallExperienceScore,
    pagesAudited: pageReports.length,
    findingsOpen: countOpenFindings(findings),
    pagesNeedingRefinement: countPagesNeedingRefinement(pageReports),
    averageEmotionalLoad,
    categoryScores,
    findings,
    pageReports,
    simulations,
    questionAnswers,
    selectedPageId: pageReports.find((p) => !p.feelsEffortless)?.pageId ?? pageReports[0]?.pageId ?? null,
    dockExperienceLine: '',
    optimizesForConfidence: true,
    lastSyncedAt: now,
  };

  profile.dockExperienceLine = buildDockExperienceLine(profile);
  return profile;
}
