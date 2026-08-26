import type {
  CrossProjectRouteForensicReport,
  DesignRouteManifestDiff,
  DesignRouteManifestDiffEntry,
  FailureTaxonomy,
  ProjectPageRouteRecord,
  StudioWorldDesignRouteManifest,
} from './types';

export function diffDesignRouteManifests(
  previous: StudioWorldDesignRouteManifest,
  current: StudioWorldDesignRouteManifest,
): DesignRouteManifestDiff {
  const entries: DesignRouteManifestDiffEntry[] = [];

  const prevProjects = new Set(previous.projects.map((p) => p.projectId));
  for (const p of current.projects) {
    if (!prevProjects.has(p.projectId)) {
      entries.push({
        type: 'PROJECT_ADDED',
        projectId: p.projectId,
        detail: `Project ${p.displayName} added to manifest`,
      });
    }
  }

  const prevRoutes = new Map(previous.rawImplementationRoutes.map((r) => [r.routeId, r]));
  for (const r of current.rawImplementationRoutes) {
    const prev = prevRoutes.get(r.routeId);
    if (!prev) {
      entries.push({
        type: 'ROUTE_ADDED',
        projectId: r.projectId,
        routeId: r.routeId,
        detail: `New route detected: ${r.route}`,
      });
    } else if (prev.route !== r.route || prev.reachabilityClassification !== r.reachabilityClassification) {
      entries.push({
        type: 'ROUTE_CHANGED',
        projectId: r.projectId,
        routeId: r.routeId,
        previous: `${prev.route} (${prev.reachabilityClassification})`,
        current: `${r.route} (${r.reachabilityClassification})`,
        detail: `Route changed: ${r.routeId}`,
      });
    }
  }

  const currRouteIds = new Set(current.rawImplementationRoutes.map((r) => r.routeId));
  for (const r of previous.rawImplementationRoutes) {
    if (!currRouteIds.has(r.routeId)) {
      entries.push({
        type: 'ROUTE_REMOVED',
        projectId: r.projectId,
        routeId: r.routeId,
        detail: `Source route removed — preserved as HISTORICAL_ROUTE: ${r.route}`,
      });
    }
  }

  const prevScreens = new Set((previous.designScreens ?? []).map((s) => s.designScreenId));
  for (const s of current.designScreens ?? []) {
    if (!prevScreens.has(s.designScreenId)) {
      entries.push({
        type: 'STATE_ADDED',
        projectId: s.projectId,
        detail: `Design screen added: ${s.displayName}`,
      });
    }
  }

  return {
    previousCommit: previous.sourceCommit,
    currentCommit: current.sourceCommit,
    previousGeneratedAt: previous.generatedAt,
    currentGeneratedAt: current.generatedAt,
    entries,
  };
}

export function collectForensicFailures(report: CrossProjectRouteForensicReport): FailureTaxonomy[] {
  const failures: FailureTaxonomy[] = [];
  if (report.projectsDiscovered.length < 4) {
    failures.push('FAIL_PROJECT_DISCOVERY_INCOMPLETE');
  }
  if (report.missingDependencyCount > 0) {
    failures.push('FAIL_DEPENDENCY_ROUTE_MISSING');
  }
  return failures;
}

export function collectForensicFailuresV2(
  report: CrossProjectRouteForensicReport,
  routes: ProjectPageRouteRecord[],
): FailureTaxonomy[] {
  const failures = collectForensicFailures(report);

  const fs = report.perProject.find((p) => p.projectId === 'frontal-slayer');
  if (fs && fs.trueOrphans > Math.max(50, fs.rawImplementationRoutes * 0.15)) {
    failures.push('FAIL_FALSE_ORPHAN_CLASSIFICATION');
  }

  const authMarkedOrphan = routes.filter(
    (r) => r.authRequired && r.reachabilityClassification === 'TRUE_ORPHAN',
  );
  if (authMarkedOrphan.length > 0) failures.push('FAIL_AUTH_ROUTE_MARKED_ORPHAN');

  const workflowMarkedOrphan = routes.filter(
    (r) => /build-a-wig|assessment/.test(r.route) && r.reachabilityClassification === 'TRUE_ORPHAN',
  );
  if (workflowMarkedOrphan.length > 0) failures.push('FAIL_WORKFLOW_CHILD_MARKED_ORPHAN');

  return failures;
}
