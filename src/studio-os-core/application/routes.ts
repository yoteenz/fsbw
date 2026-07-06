/**
 * Application-layer routes — Studio OS vs organization headquarters vs Studio Administration.
 * When Studio OS becomes its own deployment, remap these prefixes only.
 */

const ADMIN_BASE = '/admin';

/** Portfolio control plane — master Studio Administration. Never inherits organization Mission Control. */
export const STUDIO_ADMINISTRATION_ROUTES = {
  /** Studio Administration home — portfolio summary, not Mission Control. */
  commandCenter: `${ADMIN_BASE}/studio-os/command-center`,
  root: `${ADMIN_BASE}/studio-os/command-center`,
  registry: `${ADMIN_BASE}/studio-os`,
  create: `${ADMIN_BASE}/studio-os/create`,
  blueprints: `${ADMIN_BASE}/studio-os/blueprints`,
  promotionCenter: `${ADMIN_BASE}/studio-os/promotion-center`,
  licensing: `${ADMIN_BASE}/studio-os/licensing`,
  marketplace: `${ADMIN_BASE}/studio-os/marketplace`,
  systemHealth: `${ADMIN_BASE}/studio-os/system-health`,
  globalAi: `${ADMIN_BASE}/studio-os/global-ai`,
  crossOrgIntelligence: `${ADMIN_BASE}/studio-os/cross-org-intelligence`,
  plugins: `${ADMIN_BASE}/studio-os/plugins`,
  developerCenter: `${ADMIN_BASE}/studio-os/developer-center`,
  portfolioAnalytics: `${ADMIN_BASE}/studio-os/portfolio-analytics`,
  portfolioRevenue: `${ADMIN_BASE}/studio-os/portfolio-revenue`,
  studioSettings: `${ADMIN_BASE}/studio-os/studio-settings`,
  studioUpdates: `${ADMIN_BASE}/studio-os/studio-updates`,
  studioIntelligence: `${ADMIN_BASE}/studio-os/studio-intelligence`,
  /** Legacy alias — redirects to command center. */
  administration: `${ADMIN_BASE}/studio-os/administration`,
  workspaceShell: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}`,
} as const;

/** Organization headquarters entry — launches workspace HQ inside Studio OS. */
export const ORGANIZATION_ROUTES = {
  /** Organization admin entry — launches host company HQ (Frontal Slayer on fsbw). */
  headquartersEntry: `${ADMIN_BASE}/headquarters`,
  /** Default landing after headquarters launch — organization Mission Control only. */
  missionControl: `${ADMIN_BASE}/studio/mission-control`,
  studioOverview: `${ADMIN_BASE}/studio/overview`,
} as const;

/** Paths restricted to portfolio owners (Studio Administration). */
export const STUDIO_ADMINISTRATION_PATH_PREFIXES = [
  '/admin/studio-os',
  '/admin/studio-os/',
] as const;

export function isStudioAdministrationPath(pathname: string): boolean {
  if (pathname.startsWith('/admin/studio-os/workspace/')) return false;
  if (pathname === STUDIO_ADMINISTRATION_ROUTES.commandCenter) return true;
  if (pathname === STUDIO_ADMINISTRATION_ROUTES.registry) return true;
  if (pathname === STUDIO_ADMINISTRATION_ROUTES.administration) return true;
  if (pathname.startsWith('/admin/studio-os/create')) return true;
  if (pathname.startsWith('/admin/studio-os/blueprints')) return true;
  if (pathname.startsWith('/admin/studio-os/promotion-center')) return true;
  if (pathname.startsWith('/admin/studio-os/licensing')) return true;
  if (pathname.startsWith('/admin/studio-os/marketplace')) return true;
  if (pathname.startsWith('/admin/studio-os/system-health')) return true;
  if (pathname.startsWith('/admin/studio-os/global-ai')) return true;
  if (pathname.startsWith('/admin/studio-os/cross-org-intelligence')) return true;
  if (pathname.startsWith('/admin/studio-os/plugins')) return true;
  if (pathname.startsWith('/admin/studio-os/developer-center')) return true;
  if (pathname.startsWith('/admin/studio-os/portfolio-analytics')) return true;
  if (pathname.startsWith('/admin/studio-os/portfolio-revenue')) return true;
  if (pathname.startsWith('/admin/studio-os/studio-settings')) return true;
  if (pathname.startsWith('/admin/studio-os/studio-updates')) return true;
  if (pathname.startsWith('/admin/studio-os/studio-intelligence')) return true;
  return false;
}

export function isOrganizationHeadquartersPath(pathname: string): boolean {
  return pathname.startsWith('/admin/studio/') || pathname === '/admin/headquarters';
}
