/**
 * SITE 00 route constants — single source for navigation and routing.
 * Future reserved namespaces documented in docs/site00/ROUTES.md
 */

export const SITE00_ROUTES = {
  origin: '/',
  originAlias: '/origin',
  enter: '/enter',
  idnty: '/idnty',
  idntyState: '/idnty/state',
  bldr: '/bldr',
  bldrState: '/bldr/state',
  assts: '/assts',
  asstsBatch: '/assts/batches/:batchId',
  asstsAsset: '/assts/:assetId',
  sites: '/sites',
  services: '/services',
  system: '/system',
  about: '/about',
  journal: '/journal',
} as const;

/** Future reserved stage namespaces (placeholder routes — not populated this sprint) */
export const SITE00_FUTURE_ROUTES = {
  bluprint: '/bluprint',
  build: '/build',
  control: '/control',
  live: '/live',
  evolve: '/evolve',
  projects: '/projects',
  account: '/account',
  support: '/support',
} as const;

export type Site00RouteKey = keyof typeof SITE00_ROUTES;

export function isSite00Route(pathname: string): boolean {
  const paths = Object.values(SITE00_ROUTES);
  return paths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

export function site00NavPathIsActive(pathname: string, href: string): boolean {
  if (href === SITE00_ROUTES.origin) {
    return pathname === '/' || pathname === SITE00_ROUTES.originAlias;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
