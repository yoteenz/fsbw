import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildVisualDiffFindings,
  computeVisualMemoryScore,
  countDiffs,
  countScreensWithRegressions,
} from './diff-engine';
import {
  buildGoldenReferences,
  countActiveGoldenReferences,
} from './golden-reference-engine';
import {
  buildDockVisualDiffLine,
  buildVisualQaReports,
} from './report-engine';
import type { OrganizationVisualDiffEngineProfile } from './types';

export function buildOrganizationVisualDiffEngineProfile(
  organizationId: string
): OrganizationVisualDiffEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const goldenReferences = buildGoldenReferences(organizationId);
  const findings = buildVisualDiffFindings(organizationId);
  const visualReports = buildVisualQaReports(findings, goldenReferences, organizationId, now);
  const visualMemoryScore = computeVisualMemoryScore(visualReports);

  const profile: OrganizationVisualDiffEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    visualMemoryScore,
    screensCompared: visualReports.length,
    diffsDetected: countDiffs(findings),
    screensWithRegressions: countScreensWithRegressions(visualReports),
    goldenReferencesActive: countActiveGoldenReferences(goldenReferences),
    findings,
    visualReports,
    goldenReferences,
    selectedScreenId: visualReports.find((r) => !r.matchesGoldenReference)?.screenId ?? visualReports[0]?.screenId ?? null,
    dockVisualDiffLine: '',
    guardianOfVisualIdentity: true,
    lastSyncedAt: now,
  };

  profile.dockVisualDiffLine = buildDockVisualDiffLine(profile);
  return profile;
}
