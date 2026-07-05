/**
 * Application-layer routes — Studio OS vs organization headquarters vs Studio Administration.
 * When Studio OS becomes its own deployment, remap these prefixes only.
 */

const ADMIN_BASE = '/admin';

/** Portfolio control plane — master Studio Administration. */
export const STUDIO_ADMINISTRATION_ROUTES = {
  root: `${ADMIN_BASE}/studio-os/administration`,
  registry: `${ADMIN_BASE}/studio-os`,
  create: `${ADMIN_BASE}/studio-os/create`,
  blueprints: `${ADMIN_BASE}/studio-os/blueprints`,
  promotionCenter: `${ADMIN_BASE}/studio-os/promotion-center`,
  workspaceShell: (workspaceId: string) => `${ADMIN_BASE}/studio-os/workspace/${workspaceId}`,
} as const;

/** Organization headquarters entry — launches workspace HQ inside Studio OS. */
export const ORGANIZATION_ROUTES = {
  /** Frontal Slayer admin entry — replaces legacy "THE STUDIO" dashboard card. */
  headquartersEntry: `${ADMIN_BASE}/headquarters`,
  /** Default landing after headquarters launch. */
  missionControl: `${ADMIN_BASE}/studio/mission-control`,
  studioOverview: `${ADMIN_BASE}/studio/overview`,
} as const;

/** Paths restricted to portfolio owners (Studio Administration). */
export const STUDIO_ADMINISTRATION_PATH_PREFIXES = [
  '/admin/studio-os',
  '/admin/studio-os/',
] as const;

export function isStudioAdministrationPath(pathname: string): boolean {
  if (pathname === '/admin/studio-os/administration') return true;
  if (pathname === '/admin/studio-os') return true;
  if (pathname.startsWith('/admin/studio-os/create')) return true;
  if (pathname.startsWith('/admin/studio-os/blueprints')) return true;
  if (pathname.startsWith('/admin/studio-os/promotion-center')) return true;
  if (pathname.startsWith('/admin/studio-os/workspace/')) return true;
  return false;
}

export function isOrganizationHeadquartersPath(pathname: string): boolean {
  return pathname.startsWith('/admin/studio/') || pathname === '/admin/headquarters';
}
