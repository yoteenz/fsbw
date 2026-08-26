import type {
  DesignRoutePriority,
  NeedsImprovementQueueItem,
  NeedsReferenceQueueItem,
  PageVisualCoverageRecord,
  ProjectPageRouteRecord,
} from './types';

export function buildNeedsReferenceQueue(
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
): NeedsReferenceQueueItem[] {
  const routeMap = new Map(routes.map((r) => [r.routeId, r]));
  const queue: NeedsReferenceQueueItem[] = [];

  for (const c of coverage) {
    const route = routeMap.get(c.routeId);
    if (!route) continue;
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      if (c[vp].designStatus === 'MISSING_REFERENCE') {
        queue.push({
          projectId: c.projectId,
          routeId: c.routeId,
          displayName: route.displayName,
          viewportClass: vp.toUpperCase() as NeedsReferenceQueueItem['viewportClass'],
          priority: route.priority,
          routeFamily: route.routeFamily,
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
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
): NeedsImprovementQueueItem[] {
  const routeMap = new Map(routes.map((r) => [r.routeId, r]));
  const queue: NeedsImprovementQueueItem[] = [];

  for (const c of coverage) {
    const route = routeMap.get(c.routeId);
    if (!route) continue;
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
          routeId: c.routeId,
          displayName: route.displayName,
          viewportClass: vp.toUpperCase() as NeedsImprovementQueueItem['viewportClass'],
          quality: quality ?? 'OUTDATED',
          reasons: [`${vp} reference needs improvement`],
        });
      }
    }
  }

  return queue;
}

export type CoverageMatrixRow = {
  routeId: string;
  displayName: string;
  routeFamily: string;
  mobile: string;
  tablet: string;
  desktop: string;
};

function statusSymbol(designStatus: string, designable: boolean): string {
  if (!designable) return '— NOT REQUIRED';
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
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
): CoverageMatrixRow[] {
  const projectRoutes = routes.filter((r) => r.projectId === projectId && r.designableSurface === 'FOUNDER_DESIGNABLE');
  const covMap = new Map(coverage.map((c) => [c.routeId, c]));

  return projectRoutes.map((route) => {
    const c = covMap.get(route.routeId);
    return {
      routeId: route.routeId,
      displayName: route.displayName,
      routeFamily: route.routeFamily,
      mobile: statusSymbol(c?.mobile.designStatus ?? 'MISSING_REFERENCE', true),
      tablet: statusSymbol(c?.tablet.designStatus ?? 'MISSING_REFERENCE', true),
      desktop: statusSymbol(c?.desktop.designStatus ?? 'MISSING_REFERENCE', true),
    };
  });
}

export function groupRoutesForScreenDropdown(
  routes: ProjectPageRouteRecord[],
  projectId: string,
): Record<string, ProjectPageRouteRecord[]> {
  const projectRoutes = routes.filter(
    (r) => r.projectId === projectId && r.designableSurface === 'FOUNDER_DESIGNABLE',
  );
  const groups: Record<string, ProjectPageRouteRecord[]> = {};
  for (const r of projectRoutes) {
    const group = r.routeFamily;
    const list = groups[group] ?? [];
    list.push(r);
    groups[group] = list;
  }
  for (const key of Object.keys(groups)) {
    groups[key]!.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return groups;
}
