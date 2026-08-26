import type {
  ProjectPageRouteRecord,
  RouteEntryEvidence,
  RouteReachabilityClassification,
  RouteStatus,
} from './types';

export type ReachabilityContext = {
  navPatterns: Set<string>;
  programmaticPatterns: Set<string>;
  redirectTargets: Map<string, string>;
  testFixturePatterns: Set<string>;
  deepLinkPatterns: Set<string>;
  parentRouteIds: Map<string, string>;
  childRouteIds: Map<string, string[]>;
};

function hasEvidence(types: RouteEntryEvidence['type'][], evidence: RouteEntryEvidence[]): boolean {
  return evidence.some((e) => types.includes(e.type));
}

export function classifyRouteReachability(
  route: ProjectPageRouteRecord,
  evidence: RouteEntryEvidence[],
  ctx: ReachabilityContext,
): { classification: RouteReachabilityClassification; entryEvidence: RouteEntryEvidence[]; status: RouteStatus } {
  const entryEvidence = [...evidence];
  const pattern = route.routePattern;

  if (route.designableSurface === 'TEST_ONLY' || ctx.testFixturePatterns.has(pattern)) {
    return { classification: 'TEST_ONLY', entryEvidence, status: route.status === 'LEGACY' ? 'LEGACY' : 'ACTIVE' };
  }

  if (route.route.includes('legacy') || route.status === 'LEGACY' || route.deprecated) {
    return { classification: 'LEGACY', entryEvidence, status: 'LEGACY' };
  }

  if (route.status === 'SUPERSEDED') {
    return { classification: 'SUPERSEDED', entryEvidence, status: 'SUPERSEDED' };
  }

  if (route.status === 'REQUIRED_MISSING_ROUTE') {
    return { classification: 'UNKNOWN', entryEvidence, status: 'REQUIRED_MISSING_ROUTE' };
  }

  if (ctx.navPatterns.has(pattern) || hasEvidence(['STATIC_LINK', 'NAV_CONFIG'], entryEvidence)) {
    return { classification: 'NAV_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (hasEvidence(['NAVIGATE_CALL', 'ROUTER_PUSH', 'LOCATION_ASSIGNMENT', 'CTA_HANDLER'], entryEvidence)) {
    return { classification: 'PROGRAMMATIC_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (hasEvidence(['IMMERSIVE_TRANSITION'], entryEvidence) || /\/(lobby|lounge|desktop|penthouse|elevator)/.test(route.route)) {
    entryEvidence.push({ type: 'IMMERSIVE_TRANSITION', detail: 'immersive/mansion navigation surface' });
    return { classification: 'WORKFLOW_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (
    /\/build-a-wig/.test(route.route) ||
    hasEvidence(['WORKFLOW_TRANSITION', 'STATE_MACHINE_TRANSITION'], entryEvidence)
  ) {
    if (!hasEvidence(['WORKFLOW_TRANSITION'], entryEvidence)) {
      entryEvidence.push({ type: 'WORKFLOW_TRANSITION', detail: 'BAW workflow family' });
    }
    return { classification: 'WORKFLOW_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  const parentId = ctx.parentRouteIds.get(route.routeId);
  const parentReachable = parentId && ctx.childRouteIds.get(parentId);
  if (parentId && parentReachable) {
    entryEvidence.push({ type: 'PARENT_ROUTE', detail: `child of ${parentId}` });
    return { classification: 'WORKFLOW_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (route.authRequired || /\/account|\/admin|\/portal|\/office|\/control/.test(route.route)) {
    if (/\/admin/.test(route.route)) {
      entryEvidence.push({ type: 'AUTH_REDIRECT', detail: 'admin surface' });
      return { classification: 'ADMIN_REACHABLE', entryEvidence, status: 'ACTIVE' };
    }
    entryEvidence.push({ type: 'AUTH_REDIRECT', detail: 'authenticated flow entry' });
    return { classification: 'AUTH_GATED_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (ctx.deepLinkPatterns.has(pattern) || hasEvidence(['DEEP_LINK_REGISTRY', 'TEST_FIXTURE', 'MANUAL_ENTRY_ALLOWED'], entryEvidence)) {
    entryEvidence.push({ type: 'DEEP_LINK_REGISTRY', detail: 'explicit deep-link / test fixture' });
    return { classification: 'DEEP_LINK_SUPPORTED', entryEvidence, status: 'ACTIVE' };
  }

  if (hasEvidence(['NOTIFICATION_LINK'], entryEvidence)) {
    return { classification: 'NOTIFICATION_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (hasEvidence(['REDIRECT_TARGET'], entryEvidence)) {
    return { classification: 'PROGRAMMATIC_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (hasEvidence(['DYNAMIC_SLUG_GENERATOR', 'PRODUCT_CARD_ROUTE'], entryEvidence)) {
    return { classification: 'DYNAMIC_INSTANCE_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (route.isTemplate || /\/(straight|wavy|curly)\/[^/]+/.test(route.route)) {
    if (ctx.programmaticPatterns.has(pattern) || /\/(straight|wavy|curly)\//.test(route.route)) {
      entryEvidence.push({ type: 'PRODUCT_CARD_ROUTE', detail: 'product instance family' });
      return { classification: 'DYNAMIC_INSTANCE_REACHABLE', entryEvidence, status: 'ACTIVE' };
    }
  }

  if (route.route.includes('/assessment') || /\/(idnty|bldr|evolve)\/[^/]+/.test(route.route)) {
    entryEvidence.push({ type: 'STATE_MACHINE_TRANSITION', detail: 'assessment state machine' });
    return { classification: 'STATE_MACHINE_REACHABLE', entryEvidence, status: 'ACTIVE' };
  }

  if (entryEvidence.length === 0 && route.existsInRouter) {
    return { classification: 'UNKNOWN', entryEvidence, status: 'UNKNOWN' };
  }

  if (entryEvidence.length === 0) {
    return { classification: 'TRUE_ORPHAN', entryEvidence, status: 'POSSIBLY_DEAD' };
  }

  return { classification: 'UNKNOWN', entryEvidence, status: 'UNKNOWN' };
}

export function buildReachabilityContext(
  routes: ProjectPageRouteRecord[],
  navPatterns: Set<string>,
  programmaticPatterns: Set<string>,
  redirectTargets: Map<string, string>,
): ReachabilityContext {
  const testFixturePatterns = new Set<string>();
  const deepLinkPatterns = new Set<string>();
  const parentRouteIds = new Map<string, string>();
  const childRouteIds = new Map<string, string[]>();

  for (const r of routes) {
    if (r.parentRouteId) parentRouteIds.set(r.routeId, r.parentRouteId);
    if (r.parentRouteId) {
      const list = childRouteIds.get(r.parentRouteId) ?? [];
      list.push(r.routeId);
      childRouteIds.set(r.parentRouteId, list);
    }
    if (r.evidence.some((e) => e.source === 'test')) {
      testFixturePatterns.add(r.routePattern);
    }
    if (/\/(sign-in|reset|invite|share|token)/.test(r.route)) {
      deepLinkPatterns.add(r.routePattern);
    }
  }

  for (const p of navPatterns) deepLinkPatterns.add(p);

  return {
    navPatterns,
    programmaticPatterns,
    redirectTargets,
    testFixturePatterns,
    deepLinkPatterns,
    parentRouteIds,
    childRouteIds,
  };
}

export function applyReachabilityToRoutes(
  routes: ProjectPageRouteRecord[],
  ctx: ReachabilityContext,
  evidenceByRouteId: Map<string, RouteEntryEvidence[]>,
): ProjectPageRouteRecord[] {
  return routes.map((route) => {
    const evidence = evidenceByRouteId.get(route.routeId) ?? [];
    const { classification, entryEvidence, status } = classifyRouteReachability(route, evidence, ctx);
    return {
      ...route,
      reachabilityClassification: classification,
      entryEvidence,
      status: status === 'POSSIBLY_DEAD' ? 'POSSIBLY_DEAD' : status,
      reachableFromUI: classification !== 'TRUE_ORPHAN' && classification !== 'UNKNOWN',
      deepLinkOnly: classification === 'DEEP_LINK_SUPPORTED' || classification === 'DYNAMIC_INSTANCE_REACHABLE',
    };
  });
}

export function summarizeReachability(projectId: string, routes: ProjectPageRouteRecord[]) {
  const counts: Record<string, number> = {};
  for (const r of routes) {
    if (r.projectId !== projectId) continue;
    const c = r.reachabilityClassification ?? 'UNKNOWN';
    counts[c] = (counts[c] ?? 0) + 1;
  }
  return {
    projectId,
    navReachable: counts.NAV_REACHABLE ?? 0,
    programmaticReachable: counts.PROGRAMMATIC_REACHABLE ?? 0,
    workflowReachable: counts.WORKFLOW_REACHABLE ?? 0,
    authGated: counts.AUTH_GATED_REACHABLE ?? 0,
    deepLinkSupported: counts.DEEP_LINK_SUPPORTED ?? 0,
    legacy: counts.LEGACY ?? 0,
    unknown: counts.UNKNOWN ?? 0,
    trueOrphan: counts.TRUE_ORPHAN ?? 0,
    dynamicInstance: counts.DYNAMIC_INSTANCE_REACHABLE ?? 0,
    adminReachable: counts.ADMIN_REACHABLE ?? 0,
    testOnly: counts.TEST_ONLY ?? 0,
  };
}
