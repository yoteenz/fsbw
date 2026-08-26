import { execSync } from 'node:child_process';
import { discoverStudioWorldProjects, listDesignableProjects } from './project-registry';
import { discoverProjectRoutes } from './discovery/project-adapters';
import { buildDependencyGraph, buildVisualStates, linkParentChildRoutes } from './dependency-graph';
import { discoverAllReferences } from './reference-discovery';
import { buildAllCoverage } from './viewport-coverage';
import { buildDesignRouteManifest } from './manifest';
import { collectForensicFailures } from './manifest-diff';
import type {
  CrossProjectRouteForensicReport,
  FailureTaxonomy,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  StudioWorldDesignRouteManifest,
} from './types';

export type AuditOptions = {
  repoRoot: string;
  sourceRepo?: string;
  projectIds?: string[];
};

export function resolveSourceCommit(repoRoot: string): string {
  try {
    return execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

export function runCrossProjectRouteForensicAudit(options: AuditOptions): {
  report: CrossProjectRouteForensicReport;
  manifest: StudioWorldDesignRouteManifest;
} {
  const { repoRoot } = options;
  const sourceCommit = resolveSourceCommit(repoRoot);
  const sourceRepo = options.sourceRepo ?? 'yoteenz/fsbw';
  const reportId = `forensic-${Date.now()}`;

  const projects = discoverStudioWorldProjects();
  const pilotIds = options.projectIds ?? ['frontal-slayer', 'ndxbook', 'site00', 'all-in-one-enterprise'];

  const allRoutes: ProjectPageRouteRecord[] = [];
  const allNavTargets: string[] = [];
  const graphs: ProjectRouteDependencyGraph[] = [];

  for (const projectId of pilotIds) {
    const { routes, navTargets } = discoverProjectRoutes({ repoRoot, projectId });
    const linked = linkParentChildRoutes(routes);
    allRoutes.push(...linked);
    allNavTargets.push(...navTargets);
    graphs.push(buildDependencyGraph(projectId, linked, navTargets));
  }

  const refs = discoverAllReferences(repoRoot);
  const visualStates = buildVisualStates(allRoutes);
  const coverage = buildAllCoverage(allRoutes, refs);

  const designableRoutes = allRoutes.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE');
  const dynamicTemplates = allRoutes.filter((r) => r.isTemplate);
  const authenticatedRoutes = allRoutes.filter((r) => r.authRequired);
  const orphaned = allRoutes.filter((r) => r.status === 'ORPHANED');
  const deprecated = allRoutes.filter((r) => r.deprecated || r.status === 'LEGACY');
  const missingDeps = graphs.flatMap((g) => g.missingRequired);
  const impliedRoutes = graphs.flatMap((g) => g.impliedRequired);

  const perProject = pilotIds.map((projectId) => {
    const pr = allRoutes.filter((r) => r.projectId === projectId);
    return {
      projectId,
      routesDiscovered: pr.length,
      designableRoutes: pr.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE').length,
      visualStates: visualStates.filter((s) => s.projectId === projectId).length,
      dynamicTemplates: pr.filter((r) => r.isTemplate).length,
      authenticatedRoutes: pr.filter((r) => r.authRequired).length,
      orphaned: pr.filter((r) => r.status === 'ORPHANED').length,
      deprecated: pr.filter((r) => r.deprecated).length,
      missingDependencies: graphs.find((g) => g.projectId === projectId)?.missingRequired.length ?? 0,
      impliedRoutes: graphs.find((g) => g.projectId === projectId)?.impliedRequired.length ?? 0,
    };
  });

  const report: CrossProjectRouteForensicReport = {
    reportId,
    generatedAt: new Date().toISOString(),
    sourceCommit,
    sourceRepo,
    projectsDiscovered: projects,
    routesDiscovered: allRoutes.length,
    designableRoutes: designableRoutes.length,
    visualStateCount: visualStates.length,
    dynamicTemplateCount: dynamicTemplates.length,
    authenticatedRouteCount: authenticatedRoutes.length,
    orphanedCount: orphaned.length,
    deprecatedCount: deprecated.length,
    missingDependencyCount: missingDeps.length,
    impliedRouteCount: impliedRoutes.length,
    dependencyGraphs: graphs,
    coverageSummaries: [],
    referenceQuality: [],
    failures: [],
    perProject,
  };

  report.failures = collectForensicFailures(report);

  const manifest = buildDesignRouteManifest({
    projects: listDesignableProjects(),
    routes: allRoutes,
    visualStates,
    graphs,
    coverage,
    sourceCommit,
    sourceRepo,
    forensicReportId: reportId,
    failures: report.failures,
  });

  report.coverageSummaries = manifest.coverageSummaries;

  return { report, manifest };
}

export function registerMissingRoutesAsDesignable(
  routes: StudioWorldDesignRouteManifest['routes'],
  graphs: StudioWorldDesignRouteManifest['dependencyGraphs'],
): StudioWorldDesignRouteManifest['routes'] {
  const updated = [...routes];
  for (const graph of graphs) {
    for (const missing of graph.missingRequired) {
      const routeId = `${graph.projectId}:missing:${missing.routePattern}`;
      if (updated.some((r) => r.routeId === routeId)) continue;
      updated.push({
        routeId,
        projectId: graph.projectId,
        route: missing.routePattern,
        routePattern: missing.routePattern,
        displayName: `Missing: ${missing.parentFlow}`,
        routeType: 'PAGE',
        routeFamily: 'OTHER',
        priority: 'PRIMARY',
        designableSurface: 'FOUNDER_DESIGNABLE',
        parentRouteId: undefined,
        childRouteIds: [],
        existsInRouter: false,
        reachableFromUI: false,
        deepLinkOnly: false,
        deprecated: false,
        authRequired: false,
        isTemplate: missing.routePattern.includes(':'),
        status: 'REQUIRED_MISSING_ROUTE',
        evidence: missing.evidence,
        responsiveLayout: 'UNKNOWN',
      });
    }
  }
  return updated;
}

export function auditFailureTaxonomy(): FailureTaxonomy[] {
  return [
    'FAIL_PROJECT_DISCOVERY_INCOMPLETE',
    'FAIL_ROUTER_ROUTE_OMITTED',
    'FAIL_LINK_TARGET_NOT_AUDITED',
    'FAIL_DEPENDENCY_ROUTE_MISSING',
    'FAIL_ROUTE_ORPHANED',
    'FAIL_ROUTE_DUPLICATE_UNKNOWN_AUTHORITY',
    'FAIL_VIEWPORT_COVERAGE_UNKNOWN',
    'FAIL_REFERENCE_COVERAGE_UNKNOWN',
    'FAIL_IMPLEMENTATION_COVERAGE_UNKNOWN',
    'FAIL_MOBILE_DESKTOP_CONFLATED',
    'FAIL_TABLET_CONFLATED_WITH_MOBILE',
    'FAIL_OUTDATED_REFERENCE_ACTIVE',
    'FAIL_ROUTE_MANIFEST_STALE',
    'FAIL_CROSS_PROJECT_ROUTE_LEAK',
    'FAIL_DESIGNABLE_ROUTE_NOT_VISIBLE_IN_DESIGN',
  ];
}
