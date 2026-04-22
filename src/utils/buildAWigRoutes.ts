/**
 * Shared route helpers for /build-a-wig product, customize, and edit flows.
 * Keeps breadcrumb navigation and customize-mode detection consistent across the main page and sub-pages.
 */

const FLOW_BASES_ORDERED: string[] = [
  '/build-a-wig/blanco/customize',
  '/build-a-wig/blanco/edit',
  '/build-a-wig/blanco',
  '/build-a-wig/soft-wave/customize',
  '/build-a-wig/soft-wave/edit',
  '/build-a-wig/soft-wave',
  '/build-a-wig/soft-curl/customize',
  '/build-a-wig/soft-curl/edit',
  '/build-a-wig/soft-curl',
  '/build-a-wig/beach-wave/customize',
  '/build-a-wig/beach-wave/edit',
  '/build-a-wig/beach-wave',
  '/build-a-wig/ocean-curl/customize',
  '/build-a-wig/ocean-curl/edit',
  '/build-a-wig/ocean-curl',
  '/build-a-wig/noir/customize',
  '/build-a-wig/noir/edit',
  '/build-a-wig/noir',
  '/build-a-wig/edit',
  '/build-a-wig',
];

/** True when pathname is a product customize sub-route (any unit). */
export function isBuildAWigCustomizePath(pathname: string): boolean {
  return pathname.startsWith('/build-a-wig/') && pathname.includes('/customize');
}

/** Exact unit customize hub only: `/build-a-wig/{unit}/customize` — not `/…/customize/color` etc. */
export function isBuildAWigCustomizeHubPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return /\/build-a-wig\/[^/]+\/customize$/.test(p);
}

/**
 * Target for the grey "BUILD-A-WIG >" breadcrumb from a sub-page:
 * customize/edit/product main, or /build-a-wig for the generic flow.
 */
export function getBuildAWigFlowBasePath(pathname: string): string {
  if (!pathname.startsWith('/build-a-wig')) {
    return '/build-a-wig';
  }
  for (const base of FLOW_BASES_ORDERED) {
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return base;
    }
  }
  return '/build-a-wig';
}

/** SHOP menu "BUILD-A-WIG" item — matches main build-a-wig page behavior. */
export function getBuildAWigShopMenuTargetPath(): string {
  return '/build-a-wig';
}
