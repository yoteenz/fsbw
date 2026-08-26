import type {
  DependencyClosure,
  ImpliedRequiredRoute,
  MissingRequiredRoute,
  ProjectPageRouteRecord,
  ProjectRouteDependencyGraph,
  ProjectVisualStateRecord,
} from './types';

/** Flow definitions discovered from navigation patterns — not hardcoded page arrays per company */
const FLOW_SEEDS: Array<{
  flowId: string;
  flowLabel: string;
  projectId: string;
  terminalPatterns: RegExp[];
  requiredPatterns: RegExp[];
}> = [
  {
    flowId: 'fs-commerce',
    flowLabel: 'Product → Cart → Checkout',
    projectId: 'frontal-slayer',
    terminalPatterns: [/\/checkout/, /\/account\/orders/],
    requiredPatterns: [/\/home\/shop|\/straight\/|\/shop\//, /\/bag/, /\/checkout/],
  },
  {
    flowId: 'fs-baw',
    flowLabel: 'Build-a-Wig configuration',
    projectId: 'frontal-slayer',
    terminalPatterns: [/\/bag/, /\/checkout/],
    requiredPatterns: [/\/build-a-wig/, /\/build-a-wig\/[^/]+\/(customize|edit)/],
  },
  {
    flowId: 'fs-account',
    flowLabel: 'Account hub',
    projectId: 'frontal-slayer',
    terminalPatterns: [/\/account\/settings/],
    requiredPatterns: [/\/sign-in/, /\/account/],
  },
  {
    flowId: 'aio-portal',
    flowLabel: 'Customer portal',
    projectId: 'all-in-one-enterprise',
    terminalPatterns: [/\/portal\/settings/],
    requiredPatterns: [/\/portal/, /\/get-started|\/schedule/],
  },
  {
    flowId: 'aio-office',
    flowLabel: 'Office staff workflow',
    projectId: 'all-in-one-enterprise',
    terminalPatterns: [/\/office\/management/],
    requiredPatterns: [/\/office/, /\/office\/clients/],
  },
  {
    flowId: 'site00-bldr',
    flowLabel: 'BLDR assessment flow',
    projectId: 'site00',
    terminalPatterns: [/\/bldr\/state/],
    requiredPatterns: [/\/bldr/, /\/bldr\/(site|world|enterprise|not-sure)/],
  },
  {
    flowId: 'site00-idnty',
    flowLabel: 'IDNTY assessment flow',
    projectId: 'site00',
    terminalPatterns: [/\/idnty\/state/],
    requiredPatterns: [/\/idnty/, /\/idnty\/(starting-at-zero|some-pieces-exist)/],
  },
  {
    flowId: 'ndxbook-workspace',
    flowLabel: 'NDXBOOK workspace',
    projectId: 'ndxbook',
    terminalPatterns: [/\/newsroom/],
    requiredPatterns: [/\/admin\/studio\/ndxbook/, /\/admin\/studio\/mission-control/],
  },
];

const VISUAL_STATE_PATTERNS: Array<{
  pattern: RegExp;
  label: string;
  stateType: ProjectVisualStateRecord['stateType'];
}> = [
  { pattern: /\/bag|shopping-bag|cart-drawer/i, label: 'Cart Drawer', stateType: 'DRAWER' },
  { pattern: /\/alerts|notifications/i, label: 'Notification Center', stateType: 'PANEL' },
  { pattern: /\/menu|drawer|nav-open/i, label: 'Mobile Navigation', stateType: 'MENU' },
  { pattern: /\/filter/i, label: 'Filter Panel', stateType: 'PANEL' },
  { pattern: /build-a-wig.*\/(color|length|density|review)/i, label: 'BAW Step', stateType: 'STEP' },
];

function routeMatchesPattern(route: string, pattern: RegExp): boolean {
  return pattern.test(route);
}

function findMatchingRoutes(routes: ProjectPageRouteRecord[], pattern: RegExp): ProjectPageRouteRecord[] {
  return routes.filter((r) => routeMatchesPattern(r.route, pattern));
}

export function buildVisualStates(routes: ProjectPageRouteRecord[]): ProjectVisualStateRecord[] {
  const states: ProjectVisualStateRecord[] = [];
  for (const route of routes) {
    for (const vs of VISUAL_STATE_PATTERNS) {
      if (!vs.pattern.test(route.route)) continue;
      states.push({
        visualStateId: `${route.routeId}::${vs.stateType.toLowerCase()}`,
        routeId: route.routeId,
        projectId: route.projectId,
        label: vs.label,
        stateType: vs.stateType,
        parentRouteId: route.routeId,
        designableSurface: route.designableSurface,
      });
    }
  }
  return states;
}

export function buildDependencyGraph(
  projectId: string,
  routes: ProjectPageRouteRecord[],
  navTargets: string[],
): ProjectRouteDependencyGraph {
  const projectRoutes = routes.filter((r) => r.projectId === projectId);
  const routeByPattern = new Map(projectRoutes.map((r) => [r.routePattern, r]));
  const edges: ProjectRouteDependencyGraph['edges'] = [];
  const closures: DependencyClosure[] = [];
  const missingRequired: MissingRequiredRoute[] = [];
  const impliedRequired: ImpliedRequiredRoute[] = [];

  for (const seed of FLOW_SEEDS.filter((f) => f.projectId === projectId)) {
    const matchedRequired = seed.requiredPatterns.flatMap((p) => findMatchingRoutes(projectRoutes, p));
    const matchedTerminal = seed.terminalPatterns.flatMap((p) => findMatchingRoutes(projectRoutes, p));
    const routeIds = [...new Set([...matchedRequired, ...matchedTerminal].map((r) => r.routeId))];

    const missingPatterns: string[] = [];
    for (const p of seed.requiredPatterns) {
      if (findMatchingRoutes(projectRoutes, p).length === 0) {
        missingPatterns.push(p.source);
      }
    }

    const brokenLinks: string[] = [];
    for (const target of navTargets) {
      const pattern = target.replace(/:[^/]+/g, ':param');
      if (!routeByPattern.has(pattern) && target.startsWith('/')) {
        brokenLinks.push(target);
      }
    }

    let status: DependencyClosure['status'] = 'COMPLETE';
    if (missingPatterns.length > 0) status = 'MISSING_ROUTE';
    else if (brokenLinks.length > 0) status = 'BROKEN_LINK';
    else if (routeIds.length === 0) status = 'UNREACHABLE';

    closures.push({
      flowId: seed.flowId,
      flowLabel: seed.flowLabel,
      projectId,
      routeIds,
      status,
      missingRoutePatterns: missingPatterns,
      brokenLinks: brokenLinks.slice(0, 10),
    });

    for (const mp of missingPatterns) {
      missingRequired.push({
        routePattern: mp,
        requestedBy: [seed.flowId],
        parentFlow: seed.flowLabel,
        expectedPurpose: `Required for ${seed.flowLabel}`,
        evidence: [{ source: 'navigation', detail: seed.flowId }],
        recommendedAction: 'Implement route or register as REQUIRED_MISSING_ROUTE in Design',
      });
    }
  }

  for (let i = 0; i < projectRoutes.length; i++) {
    const parent = projectRoutes[i]!;
    for (let j = 0; j < projectRoutes.length; j++) {
      if (i === j) continue;
      const child = projectRoutes[j]!;
      if (child.route.startsWith(`${parent.route}/`) && child.route !== parent.route) {
        edges.push({ fromRouteId: parent.routeId, toRouteId: child.routeId, relation: 'child' });
        parent.childRouteIds.push(child.routeId);
        child.parentRouteId = parent.routeId;
      }
    }
  }

  const orphanedRouteIds = projectRoutes.filter((r) => r.status === 'ORPHANED').map((r) => r.routeId);

  const duplicateGroups: ProjectRouteDependencyGraph['duplicateGroups'] = [];
  const byDisplay = new Map<string, ProjectPageRouteRecord[]>();
  for (const r of projectRoutes) {
    const key = `${r.displayName}:${r.routeFamily}`;
    const list = byDisplay.get(key) ?? [];
    list.push(r);
    byDisplay.set(key, list);
  }
  for (const [, group] of byDisplay) {
    if (group.length > 1) {
      duplicateGroups.push({
        authority: 'UNKNOWN',
        routeIds: group.map((g) => g.routeId),
        note: `Multiple routes share display name "${group[0]!.displayName}"`,
      });
    }
  }

  if (closures.some((c) => c.status === 'MISSING_ROUTE')) {
    impliedRequired.push({
      routePattern: '/implied/*',
      parentFlow: 'dependency-closure',
      expectedPurpose: 'Flow cannot terminate without missing routes',
      evidence: [{ source: 'navigation', detail: 'dependency-closure' }],
    });
  }

  return {
    projectId,
    nodes: projectRoutes,
    edges,
    closures,
    missingRequired,
    impliedRequired,
    orphanedRouteIds,
    duplicateGroups,
  };
}

export function linkParentChildRoutes(routes: ProjectPageRouteRecord[]): ProjectPageRouteRecord[] {
  const sorted = [...routes].sort((a, b) => a.route.length - b.route.length);
  for (const route of sorted) {
    const parent = sorted.find(
      (p) => p.routeId !== route.routeId && route.route.startsWith(`${p.route}/`) && p.route !== route.route,
    );
    if (parent) {
      route.parentRouteId = parent.routeId;
      if (!parent.childRouteIds.includes(route.routeId)) {
        parent.childRouteIds.push(route.routeId);
      }
    }
  }
  return sorted;
}
