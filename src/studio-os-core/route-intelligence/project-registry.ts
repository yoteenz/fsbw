import { listWorkspaces } from '../../workspaces';
import type { StudioWorldProjectRecord } from './types';

const STATIC_PROJECT_OVERRIDES: StudioWorldProjectRecord[] = [
  {
    projectId: 'site00',
    displayName: 'SITE 00',
    slug: 'site00',
    hostBrand: 'host',
    rootRoute: '/',
    repoAuthority: 'fsbw',
    routeNamespace: 'site00',
    designable: true,
    status: 'active',
    projectAccent: '#0a0a0a',
    routerSystems: ['Site00Routes', 'Site00AdminRoutes'],
  },
  {
    projectId: 'all-in-one-enterprise',
    displayName: 'ALL IN ONE ENTERPRISES',
    slug: 'all-in-one',
    hostBrand: 'client',
    rootRoute: '/',
    repoAuthority: 'aio-standalone',
    routeNamespace: 'aio',
    designable: true,
    status: 'active',
    projectAccent: '#1e3a5f',
    routerSystems: ['AllInOneRoutes', 'AioCoreRoutes', 'OfficeRoutes'],
  },
];

const WORKSPACE_TO_PROJECT: Record<string, Partial<StudioWorldProjectRecord>> = {
  'frontal-slayer': {
    projectId: 'frontal-slayer',
    displayName: 'FRONTAL SLAYER',
    slug: 'frontal-slayer',
    hostBrand: 'client',
    rootRoute: '/',
    repoAuthority: 'fsbw',
    routeNamespace: 'commerce',
    designable: true,
    routerSystems: ['App.tsx', 'StudioDebugRoutes'],
    projectAccent: '#EB1C24',
  },
  'ai-media': {
    projectId: 'ndxbook',
    displayName: 'NDXBOOK',
    slug: 'ndxbook',
    hostBrand: 'client',
    rootRoute: '/admin/studio/ndxbook',
    repoAuthority: 'fsbw',
    routeNamespace: 'ndxbook',
    designable: true,
    routerSystems: ['App.tsx', 'company-routes/route-catalog'],
    projectAccent: '#111111',
  },
  'vxd-inc': {
    projectId: 'vxd-inc',
    displayName: 'VXD INC',
    slug: 'vxd-inc',
    hostBrand: 'client',
    rootRoute: '/admin/studio',
    repoAuthority: 'fsbw',
    routeNamespace: 'vxd',
    designable: false,
    routerSystems: ['App.tsx'],
    status: 'planned',
  },
  sandbox: {
    projectId: 'sandbox',
    displayName: 'SANDBOX',
    slug: 'sandbox',
    hostBrand: 'client',
    rootRoute: '/admin/studio',
    repoAuthority: 'fsbw',
    routeNamespace: 'sandbox',
    designable: false,
    routerSystems: ['App.tsx'],
    status: 'planned',
  },
};

/** Discovered cross-project registry — wraps workspace registry without duplicating it. */
export function discoverStudioWorldProjects(): StudioWorldProjectRecord[] {
  const workspaceProjects: StudioWorldProjectRecord[] = listWorkspaces().map((ws) => {
    const override = WORKSPACE_TO_PROJECT[ws.id] ?? {};
    return {
      projectId: override.projectId ?? ws.id,
      displayName: override.displayName ?? ws.displayName,
      slug: override.slug ?? ws.id,
      hostBrand: override.hostBrand ?? 'client',
      rootRoute: override.rootRoute ?? '/admin/studio',
      repoAuthority: override.repoAuthority ?? 'fsbw',
      brandConfig: { brandName: ws.brandName, logoSrc: ws.logoSrc, status: ws.status },
      projectAccent: override.projectAccent,
      routeNamespace: override.routeNamespace ?? ws.id,
      designable: override.designable ?? ws.studioEnabled ?? false,
      status: (override.status ?? ws.status ?? 'active') as StudioWorldProjectRecord['status'],
      routerSystems: override.routerSystems ?? ['App.tsx'],
    };
  });

  const byId = new Map<string, StudioWorldProjectRecord>();
  for (const p of [...workspaceProjects, ...STATIC_PROJECT_OVERRIDES]) {
    byId.set(p.projectId, p);
  }
  return [...byId.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getStudioWorldProject(projectId: string): StudioWorldProjectRecord | undefined {
  return discoverStudioWorldProjects().find((p) => p.projectId === projectId);
}

export function listDesignableProjects(): StudioWorldProjectRecord[] {
  return discoverStudioWorldProjects().filter((p) => p.designable && p.status === 'active');
}
