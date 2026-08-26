import type {
  DesignFamilyRecord,
  DesignRoutePriority,
  DesignScreenRecord,
  NeedsImprovementQueueItem,
  NeedsReferenceQueueItem,
  PageVisualCoverageRecord,
  PossibleDeadRouteQueueItem,
  ProjectPageRouteRecord,
  ReferenceNecessityAuditRecord,
  ReferenceNecessityClassification,
} from './types';
import { resolveEffectiveDesignReference } from './effective-reference-resolver';
import { isGenerationRequired } from './effective-reference-resolver';

export function buildNeedsReferenceQueue(
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
  necessityAudits?: ReferenceNecessityAuditRecord[],
  designFamilies?: DesignFamilyRecord[],
  inheritances?: Parameters<typeof resolveEffectiveDesignReference>[0]['inheritances'],
  familyAuthorities?: Parameters<typeof resolveEffectiveDesignReference>[0]['familyAuthorities'],
): NeedsReferenceQueueItem[] {
  const screenMap = new Map(designScreens.map((s) => [s.designScreenId, s]));
  const familyMap = new Map((designFamilies ?? []).map((f) => [f.designFamilyId, f]));
  const queued = new Set<string>();
  const queue: NeedsReferenceQueueItem[] = [];

  const audits =
    necessityAudits ??
    designScreens.flatMap((s) =>
      (['MOBILE', 'TABLET', 'DESKTOP'] as const).map((vp) => ({
        designScreenId: s.designScreenId,
        projectId: s.projectId,
        viewportClass: vp,
        classification: 'UNIQUE_REFERENCE_REQUIRED' as ReferenceNecessityClassification,
        designFamilyId: s.designFamilyId ?? s.designScreenId,
        confidence: 'HIGH' as const,
        reason: 'legacy queue',
        estimatedGenerationAvoided: false,
      })),
    );

  for (const audit of audits) {
    if (!isGenerationRequired(audit.classification)) continue;

    const screen = screenMap.get(audit.designScreenId);
    if (!screen) continue;

    const vpKey = audit.viewportClass.toLowerCase() as 'mobile' | 'tablet' | 'desktop';
    const cov = coverage.find((c) => c.routeId === audit.designScreenId);
    if (cov?.[vpKey]?.referenceId && audit.classification !== 'UNKNOWN_REVIEW_REQUIRED') continue;

    const family = familyMap.get(audit.designFamilyId);
    const isFamilyRep = family?.representativeScreenId === audit.designScreenId;
    const queueKind =
      audit.classification === 'UNKNOWN_REVIEW_REQUIRED'
        ? 'REVIEW_REQUIRED'
        : isFamilyRep && family && family.memberDesignScreenIds.length > 1
          ? 'FAMILY_REPRESENTATIVE'
          : 'UNIQUE_SCREEN';

    const dedupeKey =
      queueKind === 'FAMILY_REPRESENTATIVE'
        ? `family:${audit.designFamilyId}:${audit.viewportClass}`
        : `${audit.designScreenId}:${audit.viewportClass}`;

    if (queued.has(dedupeKey)) continue;

    if (inheritances && familyAuthorities && designFamilies) {
      const effective = resolveEffectiveDesignReference({
        projectId: audit.projectId,
        designScreenId: audit.designScreenId,
        viewportClass: audit.viewportClass,
        necessityAudits: audits,
        inheritances,
        familyAuthorities,
        families: designFamilies,
      });
      if (effective.referenceId && audit.classification !== 'UNKNOWN_REVIEW_REQUIRED') continue;
    }

    if (cov?.[vpKey]?.designStatus !== 'MISSING_REFERENCE' && cov?.[vpKey]?.referenceId) continue;

    queued.add(dedupeKey);
    queue.push({
      projectId: audit.projectId,
      routeId: screen.representativeRouteId,
      designScreenId: screen.designScreenId,
      designFamilyId: audit.designFamilyId,
      displayName:
        queueKind === 'FAMILY_REPRESENTATIVE' && family
          ? `${family.displayName} Family`
          : screen.displayName,
      viewportClass: audit.viewportClass,
      priority: screen.priority,
      routeFamily: screen.routeFamily,
      queueKind,
      necessityClassification: audit.classification,
    });
  }

  const priorityOrder: Record<DesignRoutePriority, number> = {
    CRITICAL: 0,
    PRIMARY: 1,
    SECONDARY: 2,
    SUPPORTING: 3,
    INTERNAL: 4,
  };

  return queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function buildNeedsImprovementQueue(
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
): NeedsImprovementQueueItem[] {
  const screenMap = new Map(designScreens.map((s) => [s.designScreenId, s]));
  const queue: NeedsImprovementQueueItem[] = [];

  for (const c of coverage) {
    const screen = screenMap.get(c.routeId);
    if (!screen) continue;
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      const auth = c[vp];
      const quality = auth.referenceQuality;
      if (
        quality === 'OUTDATED' ||
        quality === 'WRONG_SHELL' ||
        quality === 'LOW_RESOLUTION' ||
        quality === 'PARTIAL' ||
        quality === 'SHOULD_REPLACE' ||
        auth.designStatus === 'STALE_AGAINST_REFERENCE'
      ) {
        queue.push({
          projectId: c.projectId,
          routeId: screen.representativeRouteId,
          displayName: screen.displayName,
          viewportClass: vp.toUpperCase() as NeedsImprovementQueueItem['viewportClass'],
          quality: quality ?? 'OUTDATED',
          reasons: [`${vp} reference needs improvement`],
        });
      }
    }
  }

  return queue;
}

export function buildPossibleDeadRouteQueue(routes: ProjectPageRouteRecord[]): PossibleDeadRouteQueueItem[] {
  return routes
    .filter((r) => r.reachabilityClassification === 'TRUE_ORPHAN')
    .map((r) => ({
      projectId: r.projectId,
      routeId: r.routeId,
      route: r.route,
      displayName: r.displayName,
      reachabilityClassification: r.reachabilityClassification,
    }));
}

export type CoverageMatrixRow = {
  designScreenId: string;
  displayName: string;
  routeFamily: string;
  instanceCount: number;
  mobile: string;
  tablet: string;
  desktop: string;
  referencePolicy?: string;
};

function statusSymbol(designStatus: string): string {
  switch (designStatus) {
    case 'MATCHED':
      return '✓ MATCHED';
    case 'REFERENCE_CANONICAL':
      return '○ REFERENCE';
    case 'NEEDS_REBUILD':
    case 'STALE_AGAINST_REFERENCE':
      return '! NEEDS REBUILD';
    case 'MISSING_REFERENCE':
      return '+ MISSING REFERENCE';
    case 'IMPLEMENTED_UNMATCHED':
      return '! NEEDS MATCH';
    default:
      return '○ REFERENCE';
  }
}

export function buildCoverageMatrix(
  projectId: string,
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
  necessityAudits?: ReferenceNecessityAuditRecord[],
): CoverageMatrixRow[] {
  const screens = designScreens.filter((s) => s.projectId === projectId);
  const covMap = new Map(coverage.map((c) => [c.routeId, c]));

  return screens.map((screen) => {
    const c = covMap.get(screen.designScreenId);
    const mobileAudit = necessityAudits?.find(
      (a) => a.designScreenId === screen.designScreenId && a.viewportClass === 'MOBILE',
    );
    return {
      designScreenId: screen.designScreenId,
      displayName: screen.displayName,
      routeFamily: screen.routeFamily,
      instanceCount: screen.instanceCount,
      mobile: statusSymbol(c?.mobile.designStatus ?? 'MISSING_REFERENCE'),
      tablet: statusSymbol(c?.tablet.designStatus ?? 'MISSING_REFERENCE'),
      desktop: statusSymbol(c?.desktop.designStatus ?? 'MISSING_REFERENCE'),
      referencePolicy: mobileAudit?.classification,
    };
  });
}

/** @deprecated use groupDesignScreensForDropdown from design-screen-normalizer */
export function groupRoutesForScreenDropdown(
  routes: ProjectPageRouteRecord[],
  projectId: string,
): Record<string, ProjectPageRouteRecord[]> {
  const projectRoutes = routes.filter(
    (r) => r.projectId === projectId && r.designableSurface === 'FOUNDER_DESIGNABLE',
  );
  const groups: Record<string, ProjectPageRouteRecord[]> = {};
  for (const r of projectRoutes) {
    const list = groups[r.routeFamily] ?? [];
    list.push(r);
    groups[r.routeFamily] = list;
  }
  return groups;
}

export function buildReferencePolicyReviewQueue(
  necessityAudits: ReferenceNecessityAuditRecord[],
): ReferenceNecessityAuditRecord[] {
  return necessityAudits.filter(
    (a) => a.classification === 'UNKNOWN_REVIEW_REQUIRED' || a.confidence === 'LOW',
  );
}
