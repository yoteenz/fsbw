import type {
  DesignScreenRecord,
  DynamicRouteTemplateGroup,
  PageVisualCoverageRecord,
  ProjectPageRouteRecord,
  ProjectVisualStateRecord,
  RouteFamily,
  StudioWorldDesignRouteManifest,
} from './types';
import { displayNameFromRoute } from './route-labels';
import { buildViewportCoverage } from './viewport-coverage';
import type { DiscoveredReference } from './reference-discovery';

/** Template rules — collapse instances sharing visual shell */
const TEMPLATE_RULES: Array<{
  id: string;
  match: RegExp;
  pattern: string;
  displayName: string;
  family: RouteFamily;
  sharedShell: boolean;
  perInstanceOverride?: RegExp;
}> = [
  {
    id: 'product-pdp',
    match: /^\/(straight|wavy|curly)\/[^/]+$/,
    pattern: '/:texture/:unit',
    displayName: 'Product Page',
    family: 'COMMERCE',
    sharedShell: true,
  },
  {
    id: 'baw-step',
    match: /^\/build-a-wig\/[^/]+\/(customize|edit)\/[^/]+$/,
    pattern: '/build-a-wig/:unit/:mode/:step',
    displayName: 'Build-a-Wig Step',
    family: 'COMMERCE',
    sharedShell: true,
  },
  {
    id: 'baw-hub',
    match: /^\/build-a-wig(\/[^/]+)?$/,
    pattern: '/build-a-wig/:unit?',
    displayName: 'Build-a-Wig Hub',
    family: 'COMMERCE',
    sharedShell: true,
  },
  {
    id: 'desktop-room',
    match: /^\/desktop\/[^/]+$/,
    pattern: '/desktop/:room',
    displayName: 'Desktop Room',
    family: 'TOOLS',
    sharedShell: true,
  },
  {
    id: 'site00-assessment',
    match: /^\/(idnty|bldr|evolve)\/[^/]+(\/desktop)?$/,
    pattern: '/:stage/:slug',
    displayName: 'Assessment Step',
    family: 'ONBOARDING',
    sharedShell: true,
  },
  {
    id: 'aio-portal',
    match: /^\/portal\/[^/]+$/,
    pattern: '/portal/:section',
    displayName: 'Customer Portal',
    family: 'ACCOUNT',
    sharedShell: true,
  },
  {
    id: 'aio-office',
    match: /^\/office\/[^/]+$/,
    pattern: '/office/:section',
    displayName: 'Office Section',
    family: 'ADMIN',
    sharedShell: true,
  },
];

function matchTemplate(route: string): (typeof TEMPLATE_RULES)[number] | undefined {
  return TEMPLATE_RULES.find((t) => t.match.test(route));
}

function screenId(projectId: string, slug: string): string {
  return `${projectId}:screen:${slug}`;
}

function templateGroupId(projectId: string, templateId: string): string {
  return `${projectId}:template:${templateId}`;
}

export function buildRouteTemplates(
  routes: ProjectPageRouteRecord[],
  projectId: string,
): DynamicRouteTemplateGroup[] {
  const designable = routes.filter(
    (r) => r.projectId === projectId && r.designableSurface === 'FOUNDER_DESIGNABLE',
  );
  const groups = new Map<string, DynamicRouteTemplateGroup>();

  for (const route of designable) {
    const rule = matchTemplate(route.route);
    if (!rule) continue;

    const tid = templateGroupId(projectId, rule.id);
    let group = groups.get(tid);
    if (!group) {
      group = {
        templateId: tid,
        projectId,
        routePattern: rule.pattern,
        displayName: rule.displayName,
        routeFamily: rule.family,
        instanceRouteIds: [],
        representativeRouteId: route.routeId,
        representativeRoute: route.route,
        sharedVisualShell: rule.sharedShell,
        perInstanceOverrideAllowed: true,
      };
      groups.set(tid, group);
    }
    group.instanceRouteIds.push(route.routeId);
    if (route.route.length < group.representativeRoute.length) {
      group.representativeRouteId = route.routeId;
      group.representativeRoute = route.route;
    }
  }

  return [...groups.values()];
}

export function buildDesignScreens(
  routes: ProjectPageRouteRecord[],
  templates: DynamicRouteTemplateGroup[],
  visualStates: ProjectVisualStateRecord[],
  refs: DiscoveredReference[],
  projectId: string,
): DesignScreenRecord[] {
  const designable = routes.filter(
    (r) =>
      r.projectId === projectId &&
      r.designableSurface === 'FOUNDER_DESIGNABLE' &&
      r.reachabilityClassification !== 'TRUE_ORPHAN' &&
      r.reachabilityClassification !== 'TEST_ONLY' &&
      r.implementationRouteKind !== 'DESIGN_SCREEN',
  );

  const assigned = new Set<string>();
  const screens: DesignScreenRecord[] = [];

  for (const tmpl of templates) {
    if (tmpl.projectId !== projectId) continue;
    const instanceRoutes = routes.filter((r) => tmpl.instanceRouteIds.includes(r.routeId));
    instanceRoutes.forEach((r) => assigned.add(r.routeId));

    const rep = routes.find((r) => r.routeId === tmpl.representativeRouteId)!;
    const designScreenId = screenId(projectId, tmpl.templateId.split(':').pop()!);
    const stateIds = visualStates
      .filter((s) => tmpl.instanceRouteIds.includes(s.routeId))
      .map((s) => s.visualStateId);

    const coverage = buildViewportCoverage(rep, refs);
    const reachabilitySummary: DesignScreenRecord['reachabilitySummary'] = {};
    for (const ir of instanceRoutes) {
      const c = ir.reachabilityClassification;
      reachabilitySummary[c] = (reachabilitySummary[c] ?? 0) + 1;
    }

    screens.push({
      designScreenId,
      projectId,
      displayName: tmpl.displayName,
      routeFamily: tmpl.routeFamily,
      priority: rep.priority,
      implementationRouteIds: tmpl.instanceRouteIds,
      routeTemplateId: tmpl.templateId,
      representativeRoute: tmpl.representativeRoute,
      representativeRouteId: tmpl.representativeRouteId,
      instanceCount: tmpl.instanceRouteIds.length,
      instanceRoutes: instanceRoutes.map((r) => r.route),
      perInstanceOverrideRouteIds: [],
      visualStateIds: stateIds,
      viewportCoverage: { ...coverage, routeId: designScreenId, projectId },
      referenceCoverage: { ...coverage, routeId: designScreenId, projectId },
      reachabilitySummary,
      referenceFamilyConflict: false,
    });

    for (const ir of instanceRoutes) {
      ir.designScreenId = designScreenId;
      ir.routeTemplateId = tmpl.templateId;
      ir.aliasClass = ir.routeId === tmpl.representativeRouteId ? 'CANONICAL' : 'ALIAS';
    }
  }

  const ungrouped = designable.filter((r) => !assigned.has(r.routeId));
  for (const route of ungrouped) {
    const slug = route.routePattern.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root';
    const designScreenId = screenId(projectId, slug);
    const stateIds = visualStates.filter((s) => s.routeId === route.routeId).map((s) => s.visualStateId);
    const coverage = buildViewportCoverage(route, refs);

    screens.push({
      designScreenId,
      projectId,
      displayName: displayNameFromRoute(route.route),
      routeFamily: route.routeFamily,
      priority: route.priority,
      implementationRouteIds: [route.routeId],
      representativeRoute: route.route,
      representativeRouteId: route.routeId,
      instanceCount: 1,
      instanceRoutes: [route.route],
      perInstanceOverrideRouteIds: [],
      visualStateIds: stateIds,
      viewportCoverage: { ...coverage, routeId: designScreenId, projectId },
      referenceCoverage: { ...coverage, routeId: designScreenId, projectId },
      reachabilitySummary: { [route.reachabilityClassification]: 1 },
      referenceFamilyConflict: false,
    });
    route.designScreenId = designScreenId;
    route.aliasClass = 'CANONICAL';
  }

  return screens.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function buildReferenceMigrationMap(
  routes: ProjectPageRouteRecord[],
  screens: DesignScreenRecord[],
): StudioWorldDesignRouteManifest['referenceMigration'] {
  const mappedToDesignScreens: Record<string, string> = {};
  for (const r of routes) {
    if (r.designScreenId) mappedToDesignScreens[r.routeId] = r.designScreenId;
  }
  return {
    preservedRouteIds: routes.map((r) => r.routeId),
    mappedToDesignScreens,
    conflicts: screens.filter((s) => s.referenceFamilyConflict).map((s) => s.designScreenId),
    deleted: [],
  };
}

export function buildScreenCoverageFromDesignScreens(
  screens: DesignScreenRecord[],
): PageVisualCoverageRecord[] {
  return screens
    .filter((s) => s.viewportCoverage)
    .map((s) => s.viewportCoverage!);
}

export { groupDesignScreensForDropdown } from './design-screen-dropdown';
