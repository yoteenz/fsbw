import type {
  CompiledPageStatus,
  CompiledWebsitePageRecord,
  CustomerFlowDeadEndAudit,
  CustomerJourneyStage,
  ProjectCustomerJourneyIndex,
  ProjectRouteDependencyGraph,
  ProjectWebsitePageSet,
  ReferenceNecessityAuditRecord,
  ReferenceNecessityClassification,
  RequiredWebsitePageRecord,
  StudioWorldDesignRouteManifest,
  ViewportClass,
} from './types';
import { CUSTOMER_JOURNEY_STAGES } from './constants';
import { classifyWebsiteExperience, isExcludedFromPrimary, isPrimaryExperience } from './experience-classifier';
import { necessityBadge } from './reference-necessity-auditor';

const JOURNEY_ORDER: Record<CustomerJourneyStage, number> = {
  ENTRY: 0,
  DISCOVERY: 1,
  CONSIDERATION: 2,
  CONFIGURATION: 3,
  CONVERSION: 4,
  ACCOUNT: 5,
  RETENTION: 6,
  SUPPORT: 7,
};

const GROUP_ORDER: Record<string, number> = {
  HOME: 0,
  COMMERCE: 1,
  PERSONALIZATION: 2,
  MEMBERSHIP: 3,
  EXPERIENCE: 4,
  ACCOUNT: 5,
  SUPPORT: 6,
  ORIGIN: 0,
  IDENTITY: 1,
  BUILDER: 2,
  EVOLVE: 3,
  'PUBLIC WEBSITE': 0,
  SERVICES: 1,
  'CUSTOMER PORTAL': 2,
  CARRIER: 3,
  SHIPPER: 4,
  OFFICE: 10,
};

const TRIVIAL_STATE_TYPES = new Set(['LOADING', 'ERROR', 'EMPTY']);

function viewportCompiledStatus(
  designStatus: string | undefined,
  necessity?: ReferenceNecessityClassification,
): CompiledPageStatus {
  const n = necessity;
  if (n === 'ASSET_ONLY_VARIANT') return 'ASSET_ONLY';
  if (n === 'STATE_DERIVED') return 'STATE_DERIVED';
  if (n === 'CONTENT_ONLY_VARIANT') return 'CONTENT_ONLY';
  if (n === 'DATA_ONLY_VARIANT') return 'DATA_ONLY';
  if (n === 'SHARED_FAMILY_REFERENCE') return 'INHERITS_FAMILY_REFERENCE';
  if (designStatus === 'MATCHED' || designStatus === 'REFERENCE_CANONICAL') return 'REFERENCE_CANONICAL';
  if (designStatus === 'NEEDS_REBUILD' || designStatus === 'STALE_AGAINST_REFERENCE') return 'NEEDS_REBUILD';
  if (designStatus === 'MISSING_REFERENCE') return 'REFERENCE_MISSING';
  if (designStatus === 'NOT_IMPLEMENTED') return 'IMPLEMENTATION_MISSING';
  if (designStatus === 'IMPLEMENTED_UNMATCHED') return 'IMPLEMENTED';
  return 'IMPLEMENTED';
}

function aggregateCompiledStatus(mobile: CompiledPageStatus, tablet: CompiledPageStatus, desktop: CompiledPageStatus, implExists: boolean): CompiledPageStatus {
  if (!implExists) return 'IMPLEMENTATION_MISSING';
  const statuses = [mobile, tablet, desktop];
  if (statuses.every((s) => s === 'REFERENCE_CANONICAL' || s === 'INHERITS_FAMILY_REFERENCE' || s === 'ASSET_ONLY')) {
    return statuses.includes('INHERITS_FAMILY_REFERENCE') ? 'INHERITS_FAMILY_REFERENCE' : 'REFERENCE_CANONICAL';
  }
  if (statuses.some((s) => s === 'REFERENCE_MISSING')) return 'REFERENCE_MISSING';
  if (statuses.some((s) => s === 'NEEDS_REBUILD')) return 'NEEDS_REBUILD';
  if (statuses.every((s) => s === 'IMPLEMENTED' || s === 'CONTENT_ONLY' || s === 'DATA_ONLY')) return 'IMPLEMENTED';
  return 'IMPLEMENTED_PARTIAL';
}

function buildMissingPages(
  graph: ProjectRouteDependencyGraph | undefined,
  projectId: string,
  existingRoutes: Set<string>,
): RequiredWebsitePageRecord[] {
  if (!graph) return [];
  const missing: RequiredWebsitePageRecord[] = [];

  for (const m of graph.missingRequired) {
    const pageId = `${projectId}:missing-page:${m.routePattern}`;
    missing.push({
      pageId,
      projectId,
      displayName: m.expectedPurpose || `Missing: ${m.parentFlow}`,
      suggestedRoute: m.routePattern,
      experienceClassification: inferMissingClassification(m.routePattern, projectId),
      parentFlow: m.parentFlow,
      requiredByPageIds: m.requestedBy,
      dependencyEvidence: m.evidence,
      referenceStatus: 'REFERENCE_MISSING',
      implementationStatus: 'IMPLEMENTATION_MISSING',
      priority: m.routePattern.includes('checkout') || m.routePattern.includes('confirm') ? 'CRITICAL' : 'PRIMARY',
      journeyStage: m.routePattern.includes('checkout') ? 'CONVERSION' : 'CONSIDERATION',
    });
  }

  for (const implied of graph.impliedRequired) {
    if (existingRoutes.has(implied.routePattern)) continue;
    if (implied.evidence.length === 0) continue;
    const dup = missing.some((m) => m.suggestedRoute === implied.routePattern);
    if (dup) continue;
    missing.push({
      pageId: `${projectId}:implied-page:${implied.routePattern}`,
      projectId,
      displayName: implied.expectedPurpose,
      suggestedRoute: implied.routePattern,
      experienceClassification: inferMissingClassification(implied.routePattern, projectId),
      parentFlow: implied.parentFlow,
      requiredByPageIds: [],
      dependencyEvidence: implied.evidence,
      referenceStatus: 'REFERENCE_MISSING',
      implementationStatus: 'IMPLEMENTATION_MISSING',
      priority: 'SECONDARY',
      journeyStage: 'CONSIDERATION',
    });
  }

  return missing;
}

function inferMissingClassification(route: string, projectId: string): import('./types').ProjectWebsiteExperienceClassification {
  if (/checkout|bag|cart|product|shop/.test(route)) return 'COMMERCE_FLOW';
  if (/account|sign-in|auth/.test(route)) return 'AUTH_FLOW';
  if (/build-a-wig|baw/.test(route)) return 'CUSTOMER_FLOW';
  if (projectId === 'site00') return 'CLIENT_WORKFLOW';
  return 'PUBLIC_WEBSITE';
}

function auditDeadEnds(
  projectId: string,
  pages: CompiledWebsitePageRecord[],
  graph?: ProjectRouteDependencyGraph,
): CustomerFlowDeadEndAudit[] {
  const audits: CustomerFlowDeadEndAudit[] = [];
  const commercePages = pages.filter((p) => p.experienceClassification === 'COMMERCE_FLOW');
  const hasCheckout = commercePages.some((p) => /checkout/.test(p.representativeRoute));
  const hasCart = commercePages.some((p) => /bag|cart/.test(p.representativeRoute));
  const hasConfirmation = pages.some((p) => /confirm|thank|success|complete/i.test(p.displayName + p.representativeRoute));

  if (projectId === 'frontal-slayer') {
    if (hasCart && !hasCheckout) {
      audits.push({
        projectId,
        flowId: 'commerce',
        flowLabel: 'Commerce',
        deadEndRoute: '/bag',
        missingTerminal: '/checkout',
        severity: 'CRITICAL',
      });
    }
    if (hasCheckout && !hasConfirmation) {
      audits.push({
        projectId,
        flowId: 'checkout',
        flowLabel: 'Checkout',
        deadEndRoute: '/checkout',
        missingTerminal: 'confirmation',
        severity: 'WARNING',
      });
    }
  }

  for (const closure of graph?.closures ?? []) {
    if (closure.status === 'INCOMPLETE' || closure.status === 'MISSING_ROUTE') {
      audits.push({
        projectId,
        flowId: closure.flowId,
        flowLabel: closure.flowLabel,
        deadEndRoute: closure.missingRoutePatterns[0] ?? closure.flowId,
        missingTerminal: closure.missingRoutePatterns[0],
        severity: closure.missingRoutePatterns.some((r) => /checkout|confirm|complete/.test(r)) ? 'CRITICAL' : 'WARNING',
      });
    }
  }

  return audits;
}

function buildJourneyIndex(projectId: string, pages: CompiledWebsitePageRecord[]): ProjectCustomerJourneyIndex {
  return {
    projectId,
    stages: CUSTOMER_JOURNEY_STAGES.map((stage, order) => ({
      stage,
      pageIds: pages.filter((p) => p.journeyStage === stage && p.isPrimaryExperience).map((p) => p.pageId),
      order,
    })).filter((s) => s.pageIds.length > 0),
  };
}

export function compileProjectWebsitePageSet(
  manifest: StudioWorldDesignRouteManifest,
  projectId: string,
): ProjectWebsitePageSet {
  const project = manifest.projects.find((p) => p.projectId === projectId)!;
  const screens = manifest.designScreens.filter((s) => s.projectId === projectId);
  const routes = manifest.rawImplementationRoutes.filter((r) => r.projectId === projectId);
  const routeById = new Map(routes.map((r) => [r.routeId, r]));
  const graph = manifest.dependencyGraphs.find((g) => g.projectId === projectId);
  const necessityByScreenVp = new Map<string, ReferenceNecessityAuditRecord>();
  for (const a of manifest.referenceNecessityAudits ?? []) {
    if (a.projectId === projectId) necessityByScreenVp.set(`${a.designScreenId}:${a.viewportClass}`, a);
  }

  const compiledPages: CompiledWebsitePageRecord[] = [];
  const excludedInternalIds: string[] = [];
  const designFamilyIds = new Set<string>();

  for (const screen of screens) {
    const route = routeById.get(screen.representativeRouteId);
    const { classification, experienceGroup, journeyStage, confidence } = classifyWebsiteExperience({
      screen,
      route,
      projectId,
    });

    const primary = isPrimaryExperience(classification);
    const excludedInternal = isExcludedFromPrimary(classification);
    const founderWorkspace = classification === 'FOUNDER_WORKSPACE';

    if (excludedInternal) {
      excludedInternalIds.push(screen.designScreenId);
      continue;
    }

    if (screen.designFamilyId) designFamilyIds.add(screen.designFamilyId);

    const cov = manifest.coverage.find((c) => c.routeId === screen.designScreenId) ?? screen.viewportCoverage;
    const mobN = necessityByScreenVp.get(`${screen.designScreenId}:MOBILE`);
    const tabN = necessityByScreenVp.get(`${screen.designScreenId}:TABLET`);
    const deskN = necessityByScreenVp.get(`${screen.designScreenId}:DESKTOP`);

    const mobileStatus = viewportCompiledStatus(cov?.mobile.designStatus, mobN?.classification);
    const tabletStatus = viewportCompiledStatus(cov?.tablet.designStatus, tabN?.classification);
    const desktopStatus = viewportCompiledStatus(cov?.desktop.designStatus, deskN?.classification);
    const implExists = route?.existsInRouter !== false && route?.status !== 'REQUIRED_MISSING_ROUTE';

    const attachedStates = (manifest.visualStates ?? []).filter(
      (vs) =>
        vs.projectId === projectId &&
        screen.visualStateIds.includes(vs.visualStateId) &&
        !TRIVIAL_STATE_TYPES.has(vs.stateType),
    );

    const journeyOrder =
      (JOURNEY_ORDER[journeyStage] ?? 5) * 100 + (GROUP_ORDER[experienceGroup] ?? 50);

    compiledPages.push({
      pageId: screen.designScreenId,
      projectId,
      designScreenId: screen.designScreenId,
      displayName: screen.displayName,
      experienceGroup,
      experienceClassification: classification,
      representativeRoute: screen.representativeRoute,
      designFamilyId: screen.designFamilyId,
      instanceCount: screen.instanceCount,
      priority: screen.priority,
      journeyStage,
      journeyOrder,
      compiledStatus: aggregateCompiledStatus(mobileStatus, tabletStatus, desktopStatus, implExists),
      referencePolicy: mobN?.classification ?? 'UNIQUE_REFERENCE_REQUIRED',
      implementationStatus: implExists ? 'IMPLEMENTATION_PRESENT' : 'IMPLEMENTATION_MISSING',
      mobileStatus,
      tabletStatus,
      desktopStatus,
      visualStateIds: attachedStates.map((s) => s.visualStateId),
      isPrimaryExperience: primary && !founderWorkspace,
      isMissingPage: false,
      confidence,
      captureEligible: implExists && primary,
      authContext: route?.authRequired ? 'authenticated' : /^\/admin/.test(screen.representativeRoute) ? 'admin' : 'anonymous',
      effectiveReferenceHandoff: true,
    });
  }

  compiledPages.sort((a, b) => a.journeyOrder - b.journeyOrder || a.displayName.localeCompare(b.displayName));

  const existingRoutes = new Set(routes.map((r) => r.routePattern));
  const missingPages = buildMissingPages(graph, projectId, existingRoutes);

  const primaryPages = compiledPages.filter((p) => p.isPrimaryExperience);
  const primaryPageIds = [...new Set(primaryPages.map((p) => p.pageId))];
  const supportingPageIds = [...new Set(compiledPages.filter((p) => !p.isPrimaryExperience).map((p) => p.pageId))];
  const missingRequiredPageIds = missingPages.map((m) => m.pageId);
  const visualStateIds = compiledPages.flatMap((p) => p.visualStateIds);

  const deadEndAudits = auditDeadEnds(projectId, compiledPages, graph);
  const journeyIndex = buildJourneyIndex(projectId, compiledPages);

  const countMissingRef = (vp: ViewportClass) =>
    compiledPages.filter((p) => p.isPrimaryExperience && p[`${vp.toLowerCase()}Status` as 'mobileStatus'] === 'REFERENCE_MISSING').length;

  const summary = {
    totalPrimaryPages: primaryPageIds.length,
    implemented: compiledPages.filter((p) => p.isPrimaryExperience && p.compiledStatus !== 'IMPLEMENTATION_MISSING').length,
    missing: missingPages.length,
    referenceMissing: compiledPages.filter((p) => p.isPrimaryExperience && p.compiledStatus === 'REFERENCE_MISSING').length,
    inheritsFamily: compiledPages.filter((p) => p.isPrimaryExperience && p.compiledStatus === 'INHERITS_FAMILY_REFERENCE').length,
    assetOnly: compiledPages.filter((p) => p.isPrimaryExperience && p.mobileStatus === 'ASSET_ONLY').length,
    internalExcluded: excludedInternalIds.length,
  };

  let status: ProjectWebsitePageSet['status'] = 'COMPLETE';
  if (missingPages.some((m) => m.priority === 'CRITICAL')) status = 'HAS_MISSING';
  else if (missingPages.length > 0) status = 'HAS_MISSING';
  if (deadEndAudits.some((d) => d.severity === 'CRITICAL')) status = 'HAS_DEAD_ENDS';
  if (compiledPages.some((p) => p.confidence === 'LOW' && p.isPrimaryExperience)) status = 'REVIEW_REQUIRED';

  return {
    projectId,
    displayName: project.displayName,
    primaryPageIds,
    supportingPageIds,
    missingRequiredPageIds,
    visualStateIds,
    excludedInternalIds,
    designFamilyIds: [...designFamilyIds],
    compiledPages,
    missingPages,
    journeyIndex,
    deadEndAudits,
    viewportCoverage: {
      mobile: { primary: primaryPageIds.length, missingRef: countMissingRef('MOBILE') },
      tablet: { primary: primaryPageIds.length, missingRef: countMissingRef('TABLET') },
      desktop: { primary: primaryPageIds.length, missingRef: countMissingRef('DESKTOP') },
    },
    status,
    summary,
  };
}

export function compileAllProjectWebsitePageSets(manifest: StudioWorldDesignRouteManifest): ProjectWebsitePageSet[] {
  return manifest.projects.filter((p) => p.designable && p.status === 'active').map((p) => compileProjectWebsitePageSet(manifest, p.projectId));
}

export function attachPageSetsToManifest(
  manifest: StudioWorldDesignRouteManifest,
): StudioWorldDesignRouteManifest {
  const projectPageSets = compileAllProjectWebsitePageSets(manifest);
  return {
    ...manifest,
    projectPageSets,
    pageSetCompilation: {
      pageSetSchemaVersion: 'studio-world-project-page-set@1',
      generatedAt: new Date().toISOString(),
      sourceManifestVersion: manifest.manifestVersion,
      sourceCommit: manifest.sourceCommit,
    },
    pageSetOverrides: manifest.pageSetOverrides ?? [],
  };
}

export function groupCompiledPagesForSelector(
  pageSet: ProjectWebsitePageSet,
  mode: 'PRIMARY' | 'ALL_DESIGNABLE',
): Record<string, CompiledWebsitePageRecord[]> {
  const pages =
    mode === 'PRIMARY'
      ? pageSet.compiledPages.filter((p) => p.isPrimaryExperience)
      : pageSet.compiledPages;
  const groups: Record<string, CompiledWebsitePageRecord[]> = {};
  for (const p of pages) {
    const key = p.experienceGroup;
    const list = groups[key] ?? [];
    if (!list.some((x) => x.pageId === p.pageId)) list.push(p);
    groups[key] = list;
  }
  for (const key of Object.keys(groups)) {
    groups[key]!.sort((a, b) => a.journeyOrder - b.journeyOrder);
  }
  return groups;
}

export function pageStatusBadge(status: CompiledPageStatus): string {
  switch (status) {
    case 'INHERITS_FAMILY_REFERENCE':
      return 'FAMILY';
    case 'ASSET_ONLY':
      return 'ASSET ONLY';
    case 'CONTENT_ONLY':
      return 'CONTENT ONLY';
    case 'REFERENCE_MISSING':
      return 'NEEDS REF';
    default:
      return status.replace(/_/g, ' ');
  }
}

export { necessityBadge };
