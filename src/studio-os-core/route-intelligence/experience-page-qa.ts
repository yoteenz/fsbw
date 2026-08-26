import type {
  ExperiencePageAbstractionQa,
  ExperiencePageAbstractionQaIssue,
  ExperiencePageRecord,
  ProjectWebsitePageSet,
} from './types';
import { SITE00_P0_VR_3D_BASELINE_COUNT } from './site00-p0-vr-3d-scope';

export function runExperiencePageAbstractionQa(
  projectId: string,
  pages: ExperiencePageRecord[],
  _pageSet: ProjectWebsitePageSet,
  beforeVr3fPrimary: number,
): ExperiencePageAbstractionQa {
  const issues: ExperiencePageAbstractionQaIssue[] = [];
  const primary = pages.filter((p) => p.founderPrimary);

  if (projectId === 'site00') {
    const primaryCount = primary.length;
    if (primaryCount > SITE00_P0_VR_3D_BASELINE_COUNT + 8) {
      issues.push({
        code: 'SITE00_SCOPE_REGRESSION',
        severity: 'CRITICAL',
        detail: `SITE 00 primary experience pages (${primaryCount}) exceed P0.VR.3D baseline (~${SITE00_P0_VR_3D_BASELINE_COUNT})`,
      });
    }
  }

  for (const page of primary) {
    if (/^\/studio/.test(page.representativeRoute) || /^\/admin\/site00/.test(page.representativeRoute)) {
      issues.push({
        code: 'INTERNAL_ROUTE_LEAKED',
        severity: 'CRITICAL',
        detail: `Internal route leaked to primary: ${page.displayName} (${page.representativeRoute})`,
        experiencePageId: page.experiencePageId,
      });
    }
    if (page.memberDesignScreenIds.length === 1 && page.routeNodeCount > 10) {
      issues.push({
        code: 'WORKFLOW_NODE_PROMOTED',
        severity: 'WARNING',
        detail: `Single screen page covers ${page.routeNodeCount} route nodes: ${page.displayName}`,
        experiencePageId: page.experiencePageId,
      });
    }
  }

  if (primary.length >= beforeVr3fPrimary * 0.9 && beforeVr3fPrimary > 50) {
    issues.push({
      code: 'DIFFERENT_EXPERIENCES_MERGED',
      severity: 'WARNING',
      detail: `Minimal reduction from P0.VR.3F (${beforeVr3fPrimary} → ${primary.length}) — review abstraction`,
    });
  }

  return {
    projectId,
    issues,
    reviewRequired: issues.some((i) => i.severity === 'CRITICAL') || primary.some((p) => p.abstractionConfidence === 'LOW'),
  };
}
