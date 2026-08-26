import type {
  DesignCoverageSummary,
  DesignRouteSyncContract,
  PageVisualCoverageRecord,
  ProjectCompletenessScores,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  ProjectVisualStateRecord,
  StudioWorldDesignRouteManifest,
  StudioWorldProjectRecord,
} from './types';
import { DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION, DESIGN_ROUTE_MANIFEST_VERSION } from './constants';

export function buildCoverageSummary(
  projectId: string,
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
): DesignCoverageSummary {
  const designable = routes.filter(
    (r) => r.projectId === projectId && r.designableSurface === 'FOUNDER_DESIGNABLE',
  );
  const projectCoverage = coverage.filter((c) => c.projectId === projectId);

  const countViewport = (vp: 'mobile' | 'tablet' | 'desktop') => {
    let canonical = 0;
    let missing = 0;
    let stale = 0;
    let matched = 0;
    for (const c of projectCoverage) {
      const auth = c[vp];
      if (auth.designStatus === 'REFERENCE_CANONICAL' || auth.designStatus === 'MATCHED') canonical++;
      if (auth.designStatus === 'MISSING_REFERENCE') missing++;
      if (auth.designStatus === 'STALE_AGAINST_REFERENCE' || auth.designStatus === 'NEEDS_REBUILD') stale++;
      if (auth.designStatus === 'MATCHED') matched++;
    }
    return { canonical, missing, stale, matched };
  };

  const needsReference = projectCoverage.reduce((acc, c) => {
    return (
      acc +
      (['mobile', 'tablet', 'desktop'] as const).filter((vp) => c[vp].designStatus === 'MISSING_REFERENCE').length
    );
  }, 0);

  const needsImprovement = projectCoverage.reduce((acc, c) => {
    return (
      acc +
      (['mobile', 'tablet', 'desktop'] as const).filter(
        (vp) =>
          c[vp].referenceQuality === 'OUTDATED' ||
          c[vp].referenceQuality === 'SHOULD_REPLACE' ||
          c[vp].referenceQuality === 'LOW_RESOLUTION',
      ).length
    );
  }, 0);

  const brokenRoutes = designable.filter(
    (r) => r.status === 'ORPHANED' || r.status === 'REQUIRED_MISSING_ROUTE',
  ).length;

  return {
    projectId,
    totalDesignableScreens: designable.length,
    mobile: countViewport('mobile'),
    tablet: countViewport('tablet'),
    desktop: countViewport('desktop'),
    needsReference,
    needsImprovement,
    brokenRoutes,
  };
}

export function buildCompletenessScores(
  projectId: string,
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
  graph: ProjectRouteDependencyGraph,
): ProjectCompletenessScores {
  const projectRoutes = routes.filter((r) => r.projectId === projectId);
  const designable = projectRoutes.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE');
  const projectCoverage = coverage.filter((c) => c.projectId === projectId);

  const completeFlows = graph.closures.filter((c) => c.status === 'COMPLETE').length;
  const totalFlows = Math.max(graph.closures.length, 1);
  const routeCompletenessScore = Math.round((completeFlows / totalFlows) * 100);

  let refMatched = 0;
  let refTotal = 0;
  let implPresent = 0;
  let viewportFilled = 0;
  let viewportTotal = 0;

  for (const c of projectCoverage) {
    for (const vp of ['mobile', 'tablet', 'desktop'] as const) {
      refTotal++;
      viewportTotal++;
      const auth = c[vp];
      if (auth.designStatus === 'MATCHED' || auth.designStatus === 'REFERENCE_CANONICAL') refMatched++;
      if (auth.implementationStatus === 'IMPLEMENTATION_PRESENT') implPresent++;
      if (auth.referenceId || auth.designStatus !== 'MISSING_REFERENCE') viewportFilled++;
    }
  }

  return {
    projectId,
    routeCompletenessScore,
    visualReferenceCoverageScore: refTotal ? Math.round((refMatched / refTotal) * 100) : 0,
    implementationCoverageScore: refTotal ? Math.round((implPresent / refTotal) * 100) : 0,
    viewportCoverageScore: viewportTotal ? Math.round((viewportFilled / viewportTotal) * 100) : 0,
    designableRouteCount: designable.length,
    totalRouteCount: projectRoutes.length,
  };
}

export function buildSyncContracts(
  routes: ProjectPageRouteRecord[],
  coverage: PageVisualCoverageRecord[],
  visualStates: ProjectVisualStateRecord[],
  graphs: ProjectRouteDependencyGraph[],
): DesignRouteSyncContract[] {
  const coverageByRoute = new Map(coverage.map((c) => [c.routeId, c]));
  const statesByRoute = new Map<string, ProjectVisualStateRecord[]>();
  for (const s of visualStates) {
    const list = statesByRoute.get(s.routeId) ?? [];
    list.push(s);
    statesByRoute.set(s.routeId, list);
  }
  const graphByProject = new Map(graphs.map((g) => [g.projectId, g]));

  return routes
    .filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE' || r.status === 'REQUIRED_MISSING_ROUTE')
    .map((route) => {
      const cov = coverageByRoute.get(route.routeId);
      const graph = graphByProject.get(route.projectId);
      const deps =
        graph?.edges.filter((e) => e.fromRouteId === route.routeId).map((e) => e.toRouteId) ?? [];

      let recommendedAction = 'REVIEW';
      if (route.status === 'REQUIRED_MISSING_ROUTE') recommendedAction = 'IMPLEMENTATION_MISSING';
      else if (cov?.mobile.designStatus === 'MISSING_REFERENCE') recommendedAction = 'CREATE_REFERENCE';
      else if (cov?.mobile.designStatus === 'NEEDS_REBUILD') recommendedAction = 'REPLACE_REFERENCE';
      else if (cov?.mobile.designStatus === 'IMPLEMENTED_UNMATCHED') recommendedAction = 'MATCH_IMPLEMENTATION';

      return {
        schemaVersion: DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
        projectId: route.projectId,
        routeId: route.routeId,
        route: route.route,
        displayName: route.displayName,
        routeFamily: route.routeFamily,
        priority: route.priority,
        dependencies: deps,
        visualStates: statesByRoute.get(route.routeId) ?? [],
        viewportCoverage: cov!,
        referenceCoverage: cov!,
        implementationCoverage: cov!,
        recommendedAction,
        sourceAuthority: 'fsbw',
        designableSurface: route.designableSurface,
        status: route.status,
      };
    });
}

export function buildDesignRouteManifest(input: {
  projects: StudioWorldProjectRecord[];
  routes: ProjectPageRouteRecord[];
  visualStates: ProjectVisualStateRecord[];
  graphs: ProjectRouteDependencyGraph[];
  coverage: PageVisualCoverageRecord[];
  sourceCommit: string;
  sourceRepo: string;
  forensicReportId: string;
  failures: StudioWorldDesignRouteManifest['failures'];
}): StudioWorldDesignRouteManifest {
  const coverageSummaries = input.projects.map((p) =>
    buildCoverageSummary(p.projectId, input.routes, input.coverage),
  );
  const completenessScores = input.projects.map((p) => {
    const graph = input.graphs.find((g) => g.projectId === p.projectId)!;
    return buildCompletenessScores(p.projectId, input.routes, input.coverage, graph);
  });
  const syncContracts = buildSyncContracts(
    input.routes,
    input.coverage,
    input.visualStates,
    input.graphs,
  );

  return {
    manifestVersion: DESIGN_ROUTE_MANIFEST_VERSION,
    schemaVersion: DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    sourceCommit: input.sourceCommit,
    sourceRepo: input.sourceRepo,
    projects: input.projects,
    routes: input.routes,
    visualStates: input.visualStates,
    dependencyGraphs: input.graphs,
    coverage: input.coverage,
    syncContracts,
    coverageSummaries,
    completenessScores,
    failures: input.failures,
    forensicReportId: input.forensicReportId,
  };
}
