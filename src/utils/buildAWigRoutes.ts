/**
 * Shared route helpers for /build-a-wig product, customize and edit flows.
 * Keeps breadcrumb navigation and customize-mode detection consistent across the main page and sub-pages.
 */

import {
  BAW_TUTORIAL_ROUTE,
  getBawTryFlowBasePath,
  isBawTutorialPath,
  isBawTryStepSegment,
  isBawTryUnitSlug,
} from '../constants/bawTutorialConfig';

/** URL segments for premium membership option steps (lace → add-ons). */
const PREMIUM_STEP_SEGMENT = /\/(lace|texture|color|hairline|styling|addons)(?:$|[?#])/;

export function pathnameIsBuildWigPremiumMembershipStep(pathname: string): boolean {
  return PREMIUM_STEP_SEGMENT.test(pathname);
}

const BAW_HUB_LANDING_PATHS = new Set([
  '/build-a-wig',
  '/build-a-wig/noir',
  '/build-a-wig/blanco',
  '/build-a-wig/soft-wave',
  '/build-a-wig/beach-wave',
  '/build-a-wig/soft-curl',
  '/build-a-wig/ocean-curl',
]);

/** Main hub only — not length/density/etc. sub-steps. */
export function isBuildAWigHubLandingPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return BAW_HUB_LANDING_PATHS.has(p);
}

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

/** Customize hub or edit flow (any unit), including sub-steps. */
export function isBuildAWigCustomizeOrEditPath(pathname: string): boolean {
  if (!pathname.startsWith('/build-a-wig')) return false;
  return pathname.includes('/customize') || pathname.includes('/edit');
}

/** Exact unit customize hub only: `/build-a-wig/{unit}/customize` — not `/…/customize/color` etc. */
export function isBuildAWigCustomizeHubPathname(pathname: string): boolean {
  const p = pathname.replace(/\/$/, '') || '/';
  return /\/build-a-wig\/[^/]+\/customize$/.test(p);
}

/**
 * Target for the grey "BUILD-A-WIG >" breadcrumb from a sub-page:
 * customize/edit/product main or /build-a-wig for the generic flow.
 */
export function getBuildAWigFlowBasePath(pathname: string): string {
  if (!pathname.startsWith('/build-a-wig')) {
    return '/build-a-wig';
  }
  if (isBawTutorialPath(pathname)) {
    return getBawTryFlowBasePath(pathname);
  }
  for (const base of FLOW_BASES_ORDERED) {
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return base;
    }
  }
  return '/build-a-wig';
}

/** Member SHOP menu target — product customize hub (default NOIR). */
export function getBuildAWigMemberMenuTargetPath(buildAWigPath = '/build-a-wig/noir'): string {
  return getBuildAWigCustomizePathForMenu(buildAWigPath);
}

/** Map guest try routes to the equivalent product hub path for shared Build-a-Wig UI. */
export function resolveBuildAWigTryPathToHubPath(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';
  if (!isBawTutorialPath(p)) return pathname;
  if (p === BAW_TUTORIAL_ROUTE) return '/build-a-wig/noir';

  const prefix = `${BAW_TUTORIAL_ROUTE}/`;
  if (!p.startsWith(prefix)) return '/build-a-wig/noir';

  const segments = p.slice(prefix.length).split('/').filter(Boolean);
  const first = segments[0] ?? '';

  if (isBawTryUnitSlug(first)) {
    const unit = first;
    const step = segments[1];
    if (step && isBawTryStepSegment(step)) {
      const hubStep = step === 'cap-size' ? 'cap' : step;
      return `/build-a-wig/${unit}/customize/${hubStep}`;
    }
    return `/build-a-wig/${unit}`;
  }

  return '/build-a-wig/noir';
}

/** Guest SHOP menu target — try flow (NOIR default at `/build-a-wig/try`). */
export function getBuildAWigGuestMenuTargetPath(): string {
  return BAW_TUTORIAL_ROUTE;
}

/** Signed-in menu: customize hub; guests: try route. */
export function getBuildAWigShopMenuTargetPath(isSignedIn: boolean, buildAWigPath = '/build-a-wig/noir'): string {
  return isSignedIn ? getBuildAWigMemberMenuTargetPath(buildAWigPath) : getBuildAWigGuestMenuTargetPath();
}

/** Map menu/build path to `/build-a-wig/{unit}/customize`. */
export function getBuildAWigCustomizePathForMenu(buildAWigPath: string): string {
  const p = buildAWigPath.replace(/\/$/, '') || '/';
  if (p.includes('/customize')) return p;
  if (p === '/build-a-wig' || isBawTutorialPath(p)) return '/build-a-wig/noir/customize';
  if (p.startsWith('/build-a-wig/')) return `${p}/customize`;
  return '/build-a-wig/noir/customize';
}

/** Standard-member hub footer → customize for the active product hub. */
export function getBuildAWigCustomizePathFromHub(pathname: string): string {
  const base = getBuildAWigFlowBasePath(pathname);
  return getBuildAWigCustomizePathForMenu(base);
}

/** True for customize, edit, try hub, or try option routes for a product slug. */
export function pathnameIncludesBawProductSlug(pathname: string, unitSlug: string): boolean {
  if (pathname.includes(`/build-a-wig/${unitSlug}/`)) return true;
  if (pathname.includes(`/build-a-wig/try/${unitSlug}`)) return true;
  if (unitSlug === 'noir' && (pathname.replace(/\/$/, '') === BAW_TUTORIAL_ROUTE || pathname.replace(/\/$/, '') === '/build-a-wig/noir')) {
    return true;
  }
  return false;
}
