import { join } from 'node:path';
import {
  dedupeScannedRoutes,
  inferRouteType,
  readRepoFile,
  scanMultipleFiles,
  scanNavigationLinks,
  scanRouteConstants,
  scanRouteFile,
  type ScannedRoute,
} from './source-scanner';
import { displayNameFromRoute } from '../route-labels';
import type {
  DesignRoutePriority,
  DesignableSurfaceClass,
  ProjectPageRouteRecord,
  RouteFamily,
  RouteStatus,
} from '../types';

export type ProjectDiscoveryContext = {
  repoRoot: string;
  projectId: string;
};

function makeRouteId(projectId: string, routePattern: string): string {
  return `${projectId}:${routePattern}`;
}

function classifyRouteFamily(route: string, projectId: string): RouteFamily {
  if (/\/admin\//.test(route)) return 'ADMIN';
  if (/\/(checkout|bag|shop|product|straight|wavy|curly|build-a-wig)/.test(route)) return 'COMMERCE';
  if (/\/account/.test(route)) return 'ACCOUNT';
  if (/\/(sign-in|onboarding|provisioning|assessment|get-started|portal-onboarding)/.test(route)) return 'ONBOARDING';
  if (/\/admin\/studio/.test(route) || projectId === 'ndxbook') return 'WORKSPACE';
  if (/\/(tools|booking|concierge|analysis|showroom)/.test(route)) return 'TOOLS';
  if (/\/(journal|about|brand|newsroom|content)/.test(route)) return 'CONTENT';
  if (/\/(support|contact|faq)/.test(route)) return 'SUPPORT';
  if (/\/(marketing|services|home)/.test(route)) return 'MARKETING';
  return 'OTHER';
}

function classifyPriority(route: string, family: RouteFamily): DesignRoutePriority {
  if (family === 'COMMERCE' && /\/(checkout|straight\/noir|build-a-wig)/.test(route)) return 'CRITICAL';
  if (family === 'MARKETING' && (route === '/' || route === '/home/shop')) return 'CRITICAL';
  if (family === 'ACCOUNT' && /\/account$/.test(route)) return 'PRIMARY';
  if (family === 'WORKSPACE') return 'PRIMARY';
  if (family === 'ADMIN') return 'SECONDARY';
  if (route.startsWith('/__') || route.includes('debug')) return 'INTERNAL';
  return 'SUPPORTING';
}

function classifyDesignable(route: string, projectId: string): DesignableSurfaceClass {
  if (route.startsWith('/__') || route.includes('debug') || route.includes('diagnostic')) return 'DEV_ONLY';
  if (route.includes('/test') || route.includes('mock')) return 'TEST_ONLY';
  if (projectId === 'ndxbook' && route.includes('/admin/studio/') && !route.includes('ndxbook')) {
    return 'SYSTEM_INTERNAL';
  }
  if (/\/desktop-preview/.test(route)) return 'DEV_ONLY';
  return 'FOUNDER_DESIGNABLE';
}

function classifyStatus(scanned: ScannedRoute, existsInRouter: boolean): RouteStatus {
  if (scanned.isNavigate && scanned.redirect) return 'ACTIVE';
  if (scanned.route.includes('/legacy') || scanned.sourceFile.includes('Legacy')) return 'LEGACY';
  if (scanned.route.includes('/edit/') && scanned.route.includes('build-a-wig')) return 'ACTIVE';
  return existsInRouter ? 'ACTIVE' : 'UNKNOWN';
}

function scannedToRecord(
  scanned: ScannedRoute,
  projectId: string,
  reachable: Set<string>,
  routerRoutes: Set<string>,
): ProjectPageRouteRecord {
  const family = classifyRouteFamily(scanned.route, projectId);
  const designable = classifyDesignable(scanned.route, projectId);
  return {
    routeId: makeRouteId(projectId, scanned.routePattern),
    projectId,
    route: scanned.route,
    routePattern: scanned.routePattern,
    displayName: displayNameFromRoute(scanned.route),
    routeType: inferRouteType(scanned.route, scanned.sourceFile),
    routeFamily: family,
    priority: classifyPriority(scanned.route, family),
    designableSurface: designable,
    parentRouteId: undefined,
    childRouteIds: [],
    sourceFile: scanned.sourceFile,
    component: scanned.component,
    existsInRouter: routerRoutes.has(scanned.routePattern),
    reachableFromUI: reachable.has(scanned.routePattern),
    deepLinkOnly: !reachable.has(scanned.routePattern) && routerRoutes.has(scanned.routePattern),
    redirect: scanned.redirect,
    deprecated: scanned.route.includes('legacy') || designable === 'DEPRECATED',
    authRequired: /\/account|\/admin|\/portal|\/office|\/control|\/idnty\/state/.test(scanned.route),
    isTemplate: scanned.routePattern.includes(':param'),
    status: classifyStatus(scanned, routerRoutes.has(scanned.routePattern)),
    evidence: scanned.evidence,
    responsiveLayout: scanned.route.includes('/desktop') ? 'DEDICATED_DESKTOP_LAYOUT' : 'RESPONSIVE_INTERPOLATION',
    reachabilityClassification: 'UNKNOWN',
    entryEvidence: [],
    implementationRouteKind: 'IMPLEMENTATION_ROUTE',
  };
}

/** Frontal Slayer — discover from App.tsx + nav sources + e2e/launch manifests */
export function discoverFrontalSlayerRoutes(ctx: ProjectDiscoveryContext): {
  routes: ProjectPageRouteRecord[];
  scanned: ScannedRoute[];
  navTargets: string[];
} {
  const appRoutes = scanRouteFile(join(ctx.repoRoot, 'src/App.tsx'), ctx.repoRoot);
  const debugRoutes = scanRouteFile(join(ctx.repoRoot, 'src/routes/StudioDebugRoutes.tsx'), ctx.repoRoot);

  const navSources = [
    'e2e/helpers/routes.ts',
    'scripts/launch-integrity-auditor/config.mjs',
    'src/pages/lobby/page.tsx',
    'src/components/desktop-lobby/DesktopLobbyNav.tsx',
  ];
  const navTargets = new Set<string>();
  for (const rel of navSources) {
    const content = readRepoFile(ctx.repoRoot, rel);
    if (content) scanNavigationLinks(content, rel).forEach((t) => navTargets.add(t));
  }

  const scanned = dedupeScannedRoutes([...appRoutes, ...debugRoutes]);
  const routerPatterns = new Set(scanned.map((s) => s.routePattern));
  const reachable = new Set([...navTargets].map((r) => r.replace(/:[^/]+/g, ':param')));

  const routes = scanned.map((s) =>
    scannedToRecord(s, ctx.projectId, reachable, routerPatterns),
  );

  for (const r of routes) {
    if (r.status === 'LEGACY') r.designableSurface = 'DEPRECATED';
  }

  return { routes, scanned, navTargets: [...navTargets] };
}

/** NDXBOOK — studio admin routes under /admin/studio/ndxbook and related paths */
export function discoverNdxbookRoutes(ctx: ProjectDiscoveryContext): {
  routes: ProjectPageRouteRecord[];
  scanned: ScannedRoute[];
  navTargets: string[];
} {
  const appContent = readRepoFile(ctx.repoRoot, 'src/App.tsx');
  const catalogContent = readRepoFile(ctx.repoRoot, 'src/studio-os-core/company-routes/route-catalog.ts');

  const appRoutes = scanRouteFile(join(ctx.repoRoot, 'src/App.tsx'), ctx.repoRoot);
  const ndxRoutes = appRoutes.filter(
    (r) =>
      r.route.includes('/ndxbook') ||
      r.route.includes('/mission-control') ||
      r.route.includes('/newsroom') ||
      r.route.includes('/creative-direction') ||
      (r.route.includes('/admin/studio/') &&
        /ndxbook|mission-control|newsroom|creative-direction/i.test(r.sourceFile + r.route)),
  );

  const catalogRoutes = catalogContent
    ? scanRouteConstants(catalogContent, 'src/studio-os-core/company-routes/route-catalog.ts').filter((r) =>
        r.route.includes('ndxbook'),
      )
    : [];

  const navTargets = new Set<string>();
  if (appContent) {
    const ndxNav = scanNavigationLinks(appContent, 'src/App.tsx').filter(
      (t) => t.includes('ndxbook') || t.includes('mission-control') || t.includes('newsroom'),
    );
    ndxNav.forEach((t) => navTargets.add(t));
  }

  const scanned = dedupeScannedRoutes([...ndxRoutes, ...catalogRoutes]);
  const routerPatterns = new Set(scanned.map((s) => s.routePattern));
  const reachable = new Set([...navTargets].map((r) => r.replace(/:[^/]+/g, ':param')));

  const routes = scanned.map((s) => scannedToRecord(s, ctx.projectId, reachable, routerPatterns));

  return { routes, scanned, navTargets: [...navTargets] };
}

/** SITE 00 — public + admin routes */
export function discoverSite00Routes(ctx: ProjectDiscoveryContext): {
  routes: ProjectPageRouteRecord[];
  scanned: ScannedRoute[];
  navTargets: string[];
} {
  const files = [
    'src/routes/Site00Routes.tsx',
    'src/routes/Site00AdminRoutes.tsx',
    'src/site00/config/routes.ts',
    'src/site00/admin/config/routes.ts',
  ];
  const routeFileScans = scanMultipleFiles(ctx.repoRoot, files.slice(0, 2));
  const publicConstants = readRepoFile(ctx.repoRoot, files[2]!);
  const adminConstants = readRepoFile(ctx.repoRoot, files[3]!);

  const constantRoutes = [
    ...scanRouteConstants(publicConstants, files[2]!),
    ...scanRouteConstants(adminConstants, files[3]!),
  ];

  const navContent = readRepoFile(ctx.repoRoot, 'src/site00/config/fast-travel-actions.ts');
  const navTargets = new Set(scanNavigationLinks(navContent, 'src/site00/config/fast-travel-actions.ts'));

  const scanned = dedupeScannedRoutes([...routeFileScans, ...constantRoutes]);
  const routerPatterns = new Set(scanned.map((s) => s.routePattern));
  const reachable = new Set([...navTargets].map((r) => r.replace(/:[^/]+/g, ':param')));

  const routes = scanned.map((s) => scannedToRecord(s, ctx.projectId, reachable, routerPatterns));

  return { routes, scanned, navTargets: [...navTargets] };
}

/** All In One — standalone manifest + route files */
export function discoverAioRoutes(ctx: ProjectDiscoveryContext): {
  routes: ProjectPageRouteRecord[];
  scanned: ScannedRoute[];
  navTargets: string[];
} {
  const aioRoot = join(ctx.repoRoot, 'all-in-one-enterprises');
  const manifestContent = readRepoFile(aioRoot, 'src/qa/routeManifest.ts');
  const routeFiles = [
    'src/routes/AllInOneRoutes.tsx',
    'src/routes/AioCoreRoutes.tsx',
    'src/office/routes/OfficeRoutes.tsx',
  ];

  const manifestRoutes: ScannedRoute[] = [];
  if (manifestContent) {
    const aioPathsContent = readRepoFile(aioRoot, 'src/utils/paths.ts');
    const resolvedPaths = new Map<string, string>();
    if (aioPathsContent) {
      const kvRe = /(\w+):\s*['"`]([^'"`]+)['"`]/g;
      let m: RegExpExecArray | null;
      while ((m = kvRe.exec(aioPathsContent))) {
        resolvedPaths.set(m[1]!, m[2]!);
      }
    }
    const entryRe = /path:\s*(?:aioPaths\.(\w+)|['"`]([^'"`]+)['"`])/g;
    let em: RegExpExecArray | null;
    while ((em = entryRe.exec(manifestContent))) {
      const path = em[2] ?? resolvedPaths.get(em[1]!);
      if (!path) continue;
      manifestRoutes.push({
        route: path.startsWith('/') ? path : `/${path}`,
        routePattern: path.replace(/:[^/]+/g, ':param'),
        sourceFile: 'all-in-one-enterprises/src/qa/routeManifest.ts',
        evidence: [{ source: 'manifest', file: 'all-in-one-enterprises/src/qa/routeManifest.ts' }],
      });
    }
  }

  const fileScans: ScannedRoute[] = [];
  for (const rel of routeFiles) {
    fileScans.push(...scanRouteFile(join(aioRoot, rel), ctx.repoRoot));
  }

  const navTargets = new Set<string>();
  for (const rel of routeFiles) {
    const c = readRepoFile(aioRoot, rel);
    scanNavigationLinks(c, rel).forEach((t) => navTargets.add(t));
  }

  const scanned = dedupeScannedRoutes([...manifestRoutes, ...fileScans]);
  const routerPatterns = new Set(scanned.map((s) => s.routePattern));
  const reachable = new Set([...navTargets].map((r) => r.replace(/:[^/]+/g, ':param')));

  const routes = scanned.map((s) => scannedToRecord(s, ctx.projectId, reachable, routerPatterns));

  return { routes, scanned, navTargets: [...navTargets] };
}

export function discoverProjectRoutes(ctx: ProjectDiscoveryContext): {
  routes: ProjectPageRouteRecord[];
  scanned: ScannedRoute[];
  navTargets: string[];
} {
  switch (ctx.projectId) {
    case 'frontal-slayer':
      return discoverFrontalSlayerRoutes(ctx);
    case 'ndxbook':
      return discoverNdxbookRoutes(ctx);
    case 'site00':
      return discoverSite00Routes(ctx);
    case 'all-in-one-enterprise':
      return discoverAioRoutes(ctx);
    default:
      return { routes: [], scanned: [], navTargets: [] };
  }
}

export function discoverAllProjectRoutes(repoRoot: string): Map<string, ProjectPageRouteRecord[]> {
  const projectIds = ['frontal-slayer', 'ndxbook', 'site00', 'all-in-one-enterprise'];
  const map = new Map<string, ProjectPageRouteRecord[]>();
  for (const projectId of projectIds) {
    map.set(projectId, discoverProjectRoutes({ repoRoot, projectId }).routes);
  }
  return map;
}
