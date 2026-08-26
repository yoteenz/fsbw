import type {
  DesignRoutePriority,
  DesignScreenRecord,
  NeedsImprovementQueueItem,
  NeedsReferenceQueueItem,
  PageVisualCoverageRecord,
  PossibleDeadRouteQueueItem,
  ProjectPageRouteRecord,
} from './types';

export function buildNeedsReferenceQueue(
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
): NeedsReferenceQueueItem[] {
  const screenMap = new Map(designScreens.map((s) => [s.designScreenId, s]));
  const queue: NeedsReferenceQueueItem[] = [];

  for (const c of coverage) {
    const screen = screenMap.get(c.routeId);
    if (!screen) continue;
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      if (c[vp].designStatus === 'MISSING_REFERENCE') {
        queue.push({
          projectId: c.projectId,
          routeId: screen.representativeRouteId,
          designScreenId: screen.designScreenId,
          displayName: screen.displayName,
          viewportClass: vp.toUpperCase() as NeedsReferenceQueueItem['viewportClass'],
          priority: screen.priority,
          routeFamily: screen.routeFamily,
        });
      }
    }
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
): CoverageMatrixRow[] {
  const screens = designScreens.filter((s) => s.projectId === projectId);
  const covMap = new Map(coverage.map((c) => [c.routeId, c]));

  return screens.map((screen) => {
    const c = covMap.get(screen.designScreenId);
    return {
      designScreenId: screen.designScreenId,
      displayName: screen.displayName,
      routeFamily: screen.routeFamily,
      instanceCount: screen.instanceCount,
      mobile: statusSymbol(c?.mobile.designStatus ?? 'MISSING_REFERENCE'),
      tablet: statusSymbol(c?.tablet.designStatus ?? 'MISSING_REFERENCE'),
      desktop: statusSymbol(c?.desktop.designStatus ?? 'MISSING_REFERENCE'),
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
