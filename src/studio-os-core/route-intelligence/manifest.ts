import type {
  DesignCoverageSummary,
  DesignFamilyRecord,
  DesignRouteSyncContract,
  DesignScreenRecord,
  DynamicRouteTemplateGroup,
  PageVisualCoverageRecord,
  ProjectCompletenessScores,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  ProjectVisualStateRecord,
  ReachabilitySummary,
  ReferenceGenerationSavings,
  ReferenceNecessityAuditRecord,
  DesignFamilyReferenceAuthority,
  DesignScreenReferenceInheritance,
  StudioWorldDesignRouteManifest,
  StudioWorldProjectRecord,
} from './types';
import { DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION, DESIGN_ROUTE_MANIFEST_VERSION } from './constants';

export function buildCoverageSummary(
  projectId: string,
  routes: ProjectPageRouteRecord[],
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
  necessityAudits?: ReferenceNecessityAuditRecord[],
  savings?: ReferenceGenerationSavings,
  designFamilies?: DesignFamilyRecord[],
): DesignCoverageSummary {
  const rawRoutes = routes.filter((r) => r.projectId === projectId);
  const screens = designScreens.filter((s) => s.projectId === projectId);
  const screenCoverage = coverage.filter((c) => screens.some((s) => s.designScreenId === c.routeId));

  const countViewport = (vp: 'mobile' | 'tablet' | 'desktop') => {
    let canonical = 0;
    let missing = 0;
    let stale = 0;
    let matched = 0;
    for (const c of screenCoverage) {
      const auth = c[vp];
      if (auth.designStatus === 'REFERENCE_CANONICAL' || auth.designStatus === 'MATCHED') canonical++;
      if (auth.designStatus === 'MISSING_REFERENCE') missing++;
      if (auth.designStatus === 'STALE_AGAINST_REFERENCE' || auth.designStatus === 'NEEDS_REBUILD') stale++;
      if (auth.designStatus === 'MATCHED') matched++;
    }
    return { canonical, missing, stale, matched };
  };

  const needsReference = necessityAudits
    ? necessityAudits.filter(
        (a) =>
          a.projectId === projectId &&
          (a.classification === 'UNIQUE_REFERENCE_REQUIRED' ||
            a.classification === 'VIEWPORT_SPECIFIC_REFERENCE_REQUIRED' ||
            a.classification === 'UNKNOWN_REVIEW_REQUIRED') &&
          !coverage.find((c) => c.routeId === a.designScreenId)?.[
            a.viewportClass.toLowerCase() as 'mobile' | 'tablet' | 'desktop'
          ]?.referenceId,
      ).length
    : screenCoverage.reduce((acc, c) => {
        return (
          acc +
          (['mobile', 'tablet', 'desktop'] as const).filter((vp) => c[vp].designStatus === 'MISSING_REFERENCE').length
        );
      }, 0);

  const needsImprovement = screenCoverage.reduce((acc, c) => {
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

  const trueOrphans = rawRoutes.filter((r) => r.reachabilityClassification === 'TRUE_ORPHAN');

  return {
    projectId,
    totalDesignableScreens: screens.length,
    rawImplementationRoutes: rawRoutes.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE').length,
    normalizedRouteTemplates: new Set(screens.filter((s) => s.routeTemplateId).map((s) => s.routeTemplateId)).size,
    trueOrphanCount: trueOrphans.length,
    mobile: countViewport('mobile'),
    tablet: countViewport('tablet'),
    desktop: countViewport('desktop'),
    needsReference,
    needsImprovement,
    brokenRoutes: rawRoutes.filter((r) => r.status === 'REQUIRED_MISSING_ROUTE').length,
    possibleDeadRoutes: trueOrphans.length,
    designFamilies: designFamilies?.filter((f) => f.projectId === projectId).length ?? 0,
    uniqueReferencesRequired: savings?.uniqueReferencesRequired ?? 0,
    generationRequestsAvoided: savings?.generationRequestsAvoided ?? 0,
  };
}

export function buildCompletenessScores(
  projectId: string,
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
  graph: ProjectRouteDependencyGraph,
): ProjectCompletenessScores {
  const screens = designScreens.filter((s) => s.projectId === projectId);
  const projectCoverage = coverage.filter((c) => screens.some((s) => s.designScreenId === c.routeId));

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
    designableRouteCount: screens.length,
    totalRouteCount: graph.nodes.length,
  };
}

export function buildSyncContracts(
  designScreens: DesignScreenRecord[],
  coverage: PageVisualCoverageRecord[],
  visualStates: ProjectVisualStateRecord[],
  _graphs: ProjectRouteDependencyGraph[],
): DesignRouteSyncContract[] {
  const coverageByScreen = new Map(coverage.map((c) => [c.routeId, c]));

  return designScreens.map((screen) => {
    const cov = coverageByScreen.get(screen.designScreenId) ?? screen.viewportCoverage;
    const states = visualStates.filter((s) => screen.visualStateIds.includes(s.visualStateId));

    let recommendedAction = 'REVIEW';
    if (cov?.mobile.designStatus === 'MISSING_REFERENCE') recommendedAction = 'CREATE_REFERENCE';
    else if (cov?.mobile.designStatus === 'NEEDS_REBUILD') recommendedAction = 'REPLACE_REFERENCE';
    else if (cov?.mobile.designStatus === 'IMPLEMENTED_UNMATCHED') recommendedAction = 'MATCH_IMPLEMENTATION';
    if (screen.referenceFamilyConflict) recommendedAction = 'REFERENCE_FAMILY_CONFLICT';

    return {
      schemaVersion: DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
      projectId: screen.projectId,
      routeId: screen.designScreenId,
      route: screen.representativeRoute,
      displayName: screen.displayName,
      routeFamily: screen.routeFamily,
      priority: screen.priority,
      dependencies: screen.implementationRouteIds,
      visualStates: states,
      viewportCoverage: cov!,
      referenceCoverage: cov!,
      implementationCoverage: cov!,
      recommendedAction,
      sourceAuthority: 'fsbw',
      designableSurface: 'FOUNDER_DESIGNABLE',
      status: 'ACTIVE',
    };
  });
}

export function buildDesignRouteManifest(input: {
  projects: StudioWorldProjectRecord[];
  rawImplementationRoutes: ProjectPageRouteRecord[];
  routeTemplates: DynamicRouteTemplateGroup[];
  designScreens: DesignScreenRecord[];
  designFamilies: DesignFamilyRecord[];
  referenceNecessityAudits: ReferenceNecessityAuditRecord[];
  familyReferenceAuthorities: DesignFamilyReferenceAuthority[];
  screenReferenceInheritances: DesignScreenReferenceInheritance[];
  referenceGenerationSavings: ReferenceGenerationSavings[];
  visualStates: ProjectVisualStateRecord[];
  graphs: ProjectRouteDependencyGraph[];
  coverage: PageVisualCoverageRecord[];
  sourceCommit: string;
  sourceRepo: string;
  forensicReportId: string;
  failures: StudioWorldDesignRouteManifest['failures'];
  reachabilitySummaries: ReachabilitySummary[];
  referenceMigration?: StudioWorldDesignRouteManifest['referenceMigration'];
  projectPageSets?: StudioWorldDesignRouteManifest['projectPageSets'];
  pageSetCompilation?: StudioWorldDesignRouteManifest['pageSetCompilation'];
  pageSetOverrides?: StudioWorldDesignRouteManifest['pageSetOverrides'];
}): StudioWorldDesignRouteManifest {
  const coverageSummaries = input.projects.map((p) =>
    buildCoverageSummary(
      p.projectId,
      input.rawImplementationRoutes,
      input.designScreens,
      input.coverage,
      input.referenceNecessityAudits,
      input.referenceGenerationSavings.find((s) => s.projectId === p.projectId),
      input.designFamilies,
    ),
  );
  const completenessScores = input.projects.map((p) => {
    const graph = input.graphs.find((g) => g.projectId === p.projectId)!;
    return buildCompletenessScores(p.projectId, input.designScreens, input.coverage, graph);
  });
  const syncContracts = buildSyncContracts(
    input.designScreens,
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
    rawImplementationRoutes: input.rawImplementationRoutes,
    routes: input.rawImplementationRoutes,
    routeTemplates: input.routeTemplates,
    designScreens: input.designScreens,
    designFamilies: input.designFamilies,
    referenceNecessityAudits: input.referenceNecessityAudits,
    familyReferenceAuthorities: input.familyReferenceAuthorities,
    screenReferenceInheritances: input.screenReferenceInheritances,
    referenceGenerationSavings: input.referenceGenerationSavings,
    visualStates: input.visualStates,
    dependencyGraphs: input.graphs,
    coverage: input.coverage,
    syncContracts,
    coverageSummaries,
    completenessScores,
    reachabilitySummaries: input.reachabilitySummaries,
    failures: input.failures,
    forensicReportId: input.forensicReportId,
    referenceMigration: input.referenceMigration,
    projectPageSets: input.projectPageSets ?? [],
    pageSetCompilation: input.pageSetCompilation,
    pageSetOverrides: input.pageSetOverrides ?? [],
  };
}
