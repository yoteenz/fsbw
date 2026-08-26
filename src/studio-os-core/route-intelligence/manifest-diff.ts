import type {
  CrossProjectRouteForensicReport,
  DesignRouteManifestDiff,
  DesignRouteManifestDiffEntry,
  FailureTaxonomy,
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

  const prevRoutes = new Map(previous.routes.map((r) => [r.routeId, r]));
  for (const r of current.routes) {
    const prev = prevRoutes.get(r.routeId);
    if (!prev) {
      entries.push({
        type: 'ROUTE_ADDED',
        projectId: r.projectId,
        routeId: r.routeId,
        detail: `New route detected: ${r.route}`,
      });
    } else if (prev.route !== r.route || prev.status !== r.status) {
      entries.push({
        type: 'ROUTE_CHANGED',
        projectId: r.projectId,
        routeId: r.routeId,
        previous: `${prev.route} (${prev.status})`,
        current: `${r.route} (${r.status})`,
        detail: `Route changed: ${r.routeId}`,
      });
    }
  }

  const currRouteIds = new Set(current.routes.map((r) => r.routeId));
  for (const r of previous.routes) {
    if (!currRouteIds.has(r.routeId)) {
      entries.push({
        type: 'ROUTE_REMOVED',
        projectId: r.projectId,
        routeId: r.routeId,
        detail: `Source route removed — preserved as HISTORICAL_ROUTE: ${r.route}`,
      });
    }
  }

  const prevStates = new Set(previous.visualStates.map((s) => s.visualStateId));
  for (const s of current.visualStates) {
    if (!prevStates.has(s.visualStateId)) {
      entries.push({
        type: 'STATE_ADDED',
        projectId: s.projectId,
        routeId: s.routeId,
        visualStateId: s.visualStateId,
        detail: `Visual state added: ${s.label}`,
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

export function collectForensicFailures(
  report: CrossProjectRouteForensicReport,
): FailureTaxonomy[] {
  const failures: FailureTaxonomy[] = [];
  if (report.projectsDiscovered.length < 4) {
    failures.push('FAIL_PROJECT_DISCOVERY_INCOMPLETE');
  }
  if (report.missingDependencyCount > 0) {
    failures.push('FAIL_DEPENDENCY_ROUTE_MISSING');
  }
  if (report.orphanedCount > 0) {
    failures.push('FAIL_ROUTE_ORPHANED');
  }
  const hasUnknownCoverage = report.coverageSummaries.some(
    (s) => s.totalDesignableScreens > 0 && s.mobile.missing === s.totalDesignableScreens,
  );
  if (hasUnknownCoverage) {
    failures.push('FAIL_REFERENCE_COVERAGE_UNKNOWN');
  }
  return failures;
}
