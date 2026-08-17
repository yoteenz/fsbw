/**
 * SITE 00 environment registry — separates ENVIRONMENT from INTERFACE.
 * Production assets referenced here; temporary CSS fallbacks when unavailable.
 */

export type EnvironmentId = 'ORIGIN_ENVIRONMENT' | 'WORKFLOW_ENVIRONMENT' | 'ENTER_00_WAITING_ROOM';

export type FocalPoint = {
  x: string;
  y: string;
};

export type EnvironmentConfig = {
  id: EnvironmentId;
  asset?: string;
  desktopPosition: string;
  mobilePosition: string;
  desktopScale: number;
  mobileScale: number;
  overlay?: string;
  lightingClass: string;
  /** CSS fallback when production asset unavailable */
  fallbackClass: string;
  routes: string[];
  notes?: string;
};

export const SITE00_ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  ORIGIN_ENVIRONMENT: {
    id: 'ORIGIN_ENVIRONMENT',
    asset: undefined, // Gap: production origin environment image required
    desktopPosition: 'center center',
    mobilePosition: '60% center',
    desktopScale: 1,
    mobileScale: 1.15,
    lightingClass: 'site00-env--origin-lighting',
    fallbackClass: 'site00-env-fallback--origin',
    routes: ['/', '/origin'],
    notes: 'Reference 01_ORIGIN_APPROVED — locked geometry pending production asset',
  },
  WORKFLOW_ENVIRONMENT: {
    id: 'WORKFLOW_ENVIRONMENT',
    asset: undefined, // Gap: production workflow hall environment
    desktopPosition: 'center center',
    mobilePosition: '50% center',
    desktopScale: 1,
    mobileScale: 1.2,
    lightingClass: 'site00-env--workflow-lighting',
    fallbackClass: 'site00-env-fallback--workflow',
    routes: ['/idnty/state', '/bldr/state'],
    notes: 'References 04_IDNTY_BRAND_STATE, 05_BLDR_BUILD_STATE — shared workflow geometry',
  },
  ENTER_00_WAITING_ROOM: {
    id: 'ENTER_00_WAITING_ROOM',
    asset: undefined, // Gap: production waiting room environment (locked reference exists)
    desktopPosition: 'center center',
    mobilePosition: '55% center',
    desktopScale: 1,
    mobileScale: 1.1,
    lightingClass: 'site00-env--enter-lighting',
    fallbackClass: 'site00-env-fallback--enter',
    routes: ['/enter'],
    notes: 'Reference 06_ENTER00_WAITING_ROOM_APPROVED — environment LOCKED when asset arrives',
  },
};

export function getEnvironmentForPath(pathname: string): EnvironmentId | null {
  if (pathname === '/' || pathname === '/origin') return 'ORIGIN_ENVIRONMENT';
  if (pathname === '/enter') return 'ENTER_00_WAITING_ROOM';
  if (pathname.startsWith('/idnty/state') || pathname.startsWith('/bldr/state')) {
    return 'WORKFLOW_ENVIRONMENT';
  }
  if (pathname.startsWith('/idnty') || pathname.startsWith('/bldr')) {
    return 'WORKFLOW_ENVIRONMENT';
  }
  return null;
}
