import { execSync } from 'node:child_process';
import { discoverStudioWorldProjects, listDesignableProjects } from './project-registry';
import { discoverProjectRoutes } from './discovery/project-adapters';
import { scanProgrammaticNavigation, findEntryEvidenceForRoute } from './discovery/programmatic-navigation-scanner';
import {
  applyReachabilityToRoutes,
  buildReachabilityContext,
  summarizeReachability,
} from './reachability-classifier';
import {
  buildDesignScreens,
  buildReferenceMigrationMap,
  buildRouteTemplates,
  buildScreenCoverageFromDesignScreens,
} from './design-screen-normalizer';
import { buildDependencyGraph, buildVisualStates, linkParentChildRoutes } from './dependency-graph';
import { discoverAllReferences } from './reference-discovery';
import { buildAllCoverage } from './viewport-coverage';
import { buildDesignRouteManifest } from './manifest';
import { attachPageSetsToManifest } from './website-page-compiler';
import { attachExperiencePagesToManifest } from './experience-page-abstraction';
import { collectForensicFailuresV2 } from './manifest-diff';
import { buildAllDesignFamilies } from './design-family-consolidator';
import {
  auditReferenceNecessity,
  computeReferenceGenerationSavings,
} from './reference-necessity-auditor';
import type {
  CrossProjectRouteForensicReport,
  DesignFamilyReferenceAuthority,
  DesignScreenRecord,
  DesignScreenReferenceInheritance,
  DynamicRouteTemplateGroup,
  FailureTaxonomy,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  ReachabilitySummary,
  ReferenceGenerationSavings,
  ReferenceNecessityAuditRecord,
  RouteEntryEvidence,
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

function toPattern(route: string): string {
  return route.replace(/:[^/]+/g, ':param');
}

function collectRedirectTargets(routes: ProjectPageRouteRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const r of routes) {
    if (r.redirect) map.set(r.routePattern, toPattern(r.redirect));
  }
  return map;
}

function enrichRoutesWithReachability(
  repoRoot: string,
  projectId: string,
  routes: ProjectPageRouteRecord[],
  navTargets: string[],
): ProjectPageRouteRecord[] {
  const navPatterns = new Set(navTargets.map(toPattern));
  const programmatic = scanProgrammaticNavigation(repoRoot, projectId);
  const programmaticPatterns = new Set(programmatic.targetsByPattern.keys());
  const redirectTargets = collectRedirectTargets(routes);

  for (const t of [...navTargets, ...e2eAndLaunchTargets(repoRoot, projectId)]) {
    navPatterns.add(toPattern(t));
  }

  const evidenceByRouteId = new Map<string, RouteEntryEvidence[]>();
  for (const route of routes) {
    const evidence = findEntryEvidenceForRoute(
      route.routePattern,
      navPatterns,
      programmatic,
      redirectTargets,
    );
    if (route.parentRouteId) {
      evidence.push({ type: 'PARENT_ROUTE', detail: route.parentRouteId });
    }
    if (route.evidence.some((e) => e.source === 'test')) {
      evidence.push({ type: 'TEST_FIXTURE', detail: 'route evidence test source' });
    }
    evidenceByRouteId.set(route.routeId, evidence);
  }

  const ctx = buildReachabilityContext(routes, navPatterns, programmaticPatterns, redirectTargets);
  return applyReachabilityToRoutes(routes, ctx, evidenceByRouteId);
}

function e2eAndLaunchTargets(_repoRoot: string, projectId: string): string[] {
  if (projectId !== 'frontal-slayer') return [];
  return [
    '/home/shop',
    '/bag',
    '/checkout',
    '/sign-in',
    '/straight/noir',
    '/build-a-wig',
    '/tools',
    '/brand',
    '/booking/consultation',
    '/account',
    '/account/orders',
    '/lobby',
  ];
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

  let allRoutes: ProjectPageRouteRecord[] = [];
  const graphs: ProjectRouteDependencyGraph[] = [];
  const allTemplates: DynamicRouteTemplateGroup[] = [];
  const allDesignScreens: DesignScreenRecord[] = [];
  const reachabilitySummaries: ReachabilitySummary[] = [];

  for (const projectId of pilotIds) {
    const { routes, navTargets } = discoverProjectRoutes({ repoRoot, projectId });
    let linked = linkParentChildRoutes(routes);
    linked = enrichRoutesWithReachability(repoRoot, projectId, linked, navTargets);
    allRoutes.push(...linked);
    graphs.push(buildDependencyGraph(projectId, linked, navTargets));

    const templates = buildRouteTemplates(linked, projectId);
    allTemplates.push(...templates);
    reachabilitySummaries.push(summarizeReachability(projectId, linked));
  }

  const refs = discoverAllReferences(repoRoot);
  const visualStates = buildVisualStates(allRoutes);

  for (const projectId of pilotIds) {
    const templates = allTemplates.filter((t) => t.projectId === projectId);
    allDesignScreens.push(...buildDesignScreens(allRoutes, templates, visualStates, refs, projectId));
  }

  const screenCoverage = buildScreenCoverageFromDesignScreens(allDesignScreens);
  const routeCoverage = buildAllCoverage(allRoutes, refs);
  const coverage = [...screenCoverage, ...routeCoverage.filter((c) => !screenCoverage.some((s) => s.routeId === c.routeId))];

  const allDesignFamilies = buildAllDesignFamilies(allDesignScreens, allRoutes, visualStates, pilotIds);
  const allNecessityAudits: ReferenceNecessityAuditRecord[] = [];
  const allInheritances: DesignScreenReferenceInheritance[] = [];
  const allFamilyAuthorities: DesignFamilyReferenceAuthority[] = [];
  const allSavings: ReferenceGenerationSavings[] = [];

  for (const projectId of pilotIds) {
    const { audits, inheritances, familyAuthorities } = auditReferenceNecessity(
      allDesignScreens,
      allDesignFamilies,
      allRoutes,
      visualStates,
      coverage,
      projectId,
    );
    allNecessityAudits.push(...audits);
    allInheritances.push(...inheritances);
    allFamilyAuthorities.push(...familyAuthorities);
    allSavings.push(
      computeReferenceGenerationSavings(projectId, allDesignScreens, allDesignFamilies, audits),
    );
  }

  const designableRoutes = allRoutes.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE');
  const trueOrphans = allRoutes.filter((r) => r.reachabilityClassification === 'TRUE_ORPHAN');
  const legacyOrphans = allRoutes.filter((r) => r.reachabilityClassification === 'LEGACY');

  const perProject = pilotIds.map((projectId) => {
    const pr = allRoutes.filter((r) => r.projectId === projectId);
    const screens = allDesignScreens.filter((s) => s.projectId === projectId);
    const templates = allTemplates.filter((t) => t.projectId === projectId);
    const reach = reachabilitySummaries.find((r) => r.projectId === projectId)!;
    const savings = allSavings.find((s) => s.projectId === projectId);
    return {
      projectId,
      rawImplementationRoutes: pr.length,
      normalizedRouteTemplates: templates.length,
      designScreens: screens.length,
      designFamilies: allDesignFamilies.filter((f) => f.projectId === projectId).length,
      uniqueReferencesRequired: savings?.uniqueReferencesRequired ?? 0,
      generationRequestsAvoided: savings?.generationRequestsAvoided ?? 0,
      routesDiscovered: pr.length,
      designableRoutes: pr.filter((r) => r.designableSurface === 'FOUNDER_DESIGNABLE').length,
      visualStates: visualStates.filter((s) => s.projectId === projectId).length,
      dynamicTemplates: templates.length,
      authenticatedRoutes: pr.filter((r) => r.authRequired).length,
      orphaned: trueOrphans.filter((r) => r.projectId === projectId).length,
      trueOrphans: trueOrphans.filter((r) => r.projectId === projectId).length,
      deprecated: pr.filter((r) => r.deprecated || r.status === 'LEGACY').length,
      missingDependencies: graphs.find((g) => g.projectId === projectId)?.missingRequired.length ?? 0,
      impliedRoutes: graphs.find((g) => g.projectId === projectId)?.impliedRequired.length ?? 0,
      navReachable: reach.navReachable,
      programmaticReachable: reach.programmaticReachable,
      workflowReachable: reach.workflowReachable,
      authGated: reach.authGated,
      deepLinkSupported: reach.deepLinkSupported,
      legacy: reach.legacy,
      unknown: reach.unknown,
      previousOrphanCount: projectId === 'frontal-slayer' ? 647 : undefined,
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
    dynamicTemplateCount: allTemplates.length,
    authenticatedRouteCount: allRoutes.filter((r) => r.authRequired).length,
    orphanedCount: trueOrphans.length,
    deprecatedCount: legacyOrphans.length,
    missingDependencyCount: graphs.flatMap((g) => g.missingRequired).length,
    impliedRouteCount: graphs.flatMap((g) => g.impliedRequired).length,
    dependencyGraphs: graphs,
    coverageSummaries: [],
    referenceQuality: [],
    failures: [],
    perProject,
  };

  report.failures = collectForensicFailuresV2(report, allRoutes);

  const baseManifest = buildDesignRouteManifest({
    projects: listDesignableProjects(),
    rawImplementationRoutes: allRoutes,
    routeTemplates: allTemplates,
    designScreens: allDesignScreens,
    designFamilies: allDesignFamilies,
    referenceNecessityAudits: allNecessityAudits,
    familyReferenceAuthorities: allFamilyAuthorities,
    screenReferenceInheritances: allInheritances,
    referenceGenerationSavings: allSavings,
    visualStates,
    graphs,
    coverage,
    sourceCommit,
    sourceRepo,
    forensicReportId: reportId,
    failures: report.failures,
    reachabilitySummaries,
    referenceMigration: buildReferenceMigrationMap(allRoutes, allDesignScreens),
  });

  const manifestWithPageSets = attachPageSetsToManifest(baseManifest);
  const manifest = attachExperiencePagesToManifest(manifestWithPageSets);

  report.coverageSummaries = manifest.coverageSummaries;

  return { report, manifest };
}

export function registerMissingRoutesAsDesignable(
  routes: StudioWorldDesignRouteManifest['rawImplementationRoutes'],
  graphs: StudioWorldDesignRouteManifest['dependencyGraphs'],
): StudioWorldDesignRouteManifest['rawImplementationRoutes'] {
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
        reachabilityClassification: 'UNKNOWN',
        entryEvidence: [],
        implementationRouteKind: 'IMPLEMENTATION_ROUTE',
      });
    }
  }
  return updated;
}

export function auditFailureTaxonomy(): FailureTaxonomy[] {
  return [
    'FAIL_FALSE_ORPHAN_CLASSIFICATION',
    'FAIL_STATIC_LINK_ONLY_REACHABILITY',
    'FAIL_PROGRAMMATIC_NAVIGATION_NOT_SCANNED',
    'FAIL_DYNAMIC_ROUTE_NOT_NORMALIZED',
    'FAIL_AUTH_ROUTE_MARKED_ORPHAN',
    'FAIL_WORKFLOW_CHILD_MARKED_ORPHAN',
    'FAIL_DEEP_LINK_MARKED_ORPHAN',
    'FAIL_ROUTE_ORPHANED',
  ];
}
