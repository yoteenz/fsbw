/**
 * SITE 00 route constants — single source for navigation and routing.
 * Future reserved namespaces documented in docs/site00/ROUTES.md
 */

export const SITE00_ROUTES = {
  origin: '/',
  originAlias: '/origin',
  originDesktop: '/origin/desktop',
  locations: '/origin/locations',
  enter: '/enter',
  idnty: '/idnty',
  idntySignInSecurity: '/idnty/sign-in-security',
  idntyState: '/idnty/state',
  idntyStateDesktop: '/idnty/state/desktop',
  bldr: '/bldr',
  bldrTemplates: '/bldr/templates',
  bldrStart: '/bldr/start',
  bldrState: '/bldr/state',
  bldrStateDesktop: '/bldr/state/desktop',
  assts: '/assts',
  asstsBatch: '/assts/batches/:batchId',
  asstsAsset: '/assts/:assetId',
  sites: '/sites',
  services: '/services',
  system: '/system',
  about: '/about',
  journal: '/journal',
  signIn: '/origin/sign-in',
  control: '/control',
  controlSites: '/control/sites',
  controlDomains: '/control/domains',
  controlBilling: '/control/billing',
  controlTeam: '/control/team',
  controlSettings: '/control/settings',
  controlSecurity: '/control/security',
  projects: '/projects',
  support: '/support',
  /** Client post-payment provisioning — project slug in path */
  projectProvisioning: '/project/:projectSlug/provisioning',
} as const;

/** Future reserved stage namespaces — not yet populated */
export const SITE00_FUTURE_ROUTES = {
  bluprint: '/bluprint',
  build: '/build',
  live: '/live',
  evolve: '/evolve',
  account: '/account',
} as const;

export type Site00RouteKey = keyof typeof SITE00_ROUTES;

export function isSite00BldrStateDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.bldrStateDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export function isSite00IdntyStateDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.idntyStateDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export const IDNTY_ASSESSMENT_STATE_SLUGS = [
  'starting-at-zero',
  'some-pieces-exist',
  'needs-cohesion',
  'ready-for-evolution',
  'build-ready',
] as const;

export type IdntyAssessmentRouteSlug = (typeof IDNTY_ASSESSMENT_STATE_SLUGS)[number];

export function isSite00IdntyAssessmentPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/desktop(\/|$)/, '/');
  return IDNTY_ASSESSMENT_STATE_SLUGS.some(
    (slug) => normalized === `/idnty/${slug}` || normalized.startsWith(`/idnty/${slug}/`),
  );
}

export function isSite00IdntyAssessmentDesktopPath(pathname: string): boolean {
  return IDNTY_ASSESSMENT_STATE_SLUGS.some(
    (slug) => pathname === `/idnty/${slug}/desktop` || pathname.startsWith(`/idnty/${slug}/desktop/`),
  );
}

export function site00IdntyAssessmentDesktopPath(mobilePath: string): string {
  if (mobilePath.endsWith('/desktop')) return mobilePath;
  return `${mobilePath.replace(/\/$/, '')}/desktop`;
}

export function site00IdntyAssessmentMobilePath(pathname: string): string {
  return pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');
}

export function isSite00OriginDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.originDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

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

/** Mobile bottom nav — keep BLDR workflow on state routes instead of bouncing to mobile entry. */
export function site00MobileBuildNavHref(pathname: string): string {
  if (isSite00BldrStateDesktopPath(pathname)) {
    return SITE00_ROUTES.bldrStateDesktop;
  }
  if (pathname.startsWith(SITE00_ROUTES.bldrState)) {
    return SITE00_ROUTES.bldrState;
  }
  return SITE00_ROUTES.bldr;
}
