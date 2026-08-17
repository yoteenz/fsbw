/**
 * SITE 00 environment registry — separates ENVIRONMENT from INTERFACE.
 * Production assets referenced here; temporary CSS fallbacks when unavailable.
 */

/** Approved Origin desktop environment (Supabase live-preview/site00/). */
export const SITE00_ORIGIN_DESKTOP_BACKGROUND_PATH = '942898D3-6953-47CD-8987-0697EC1C9F11.png';

/** Approved Enter 00 desktop menu environment (Supabase live-preview/site00/). */
export const SITE00_ENTER_DESKTOP_BACKGROUND_PATH = '89319E70-D080-4798-9BCA-E53B137F2387.png';

/** Approved IDNTY/BLDR workflow hall desktop environment — state routes only (Supabase live-preview/site00/). */
export const SITE00_WORKFLOW_DESKTOP_BACKGROUND_PATH = '3A2AC3AD-7192-45E8-B4B3-B811CB0DD792.png';

export type EnvironmentId = 'ORIGIN_ENVIRONMENT' | 'WORKFLOW_ENVIRONMENT' | 'ENTER_00_WAITING_ROOM';

export type FocalPoint = {
  x: string;
  y: string;
};

export type EnvironmentConfig = {
  id: EnvironmentId;
  asset?: string;
  /** Supabase live-preview path — resolved at runtime; desktop viewport only. */
  desktopAssetPath?: string;
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
    desktopAssetPath: SITE00_ORIGIN_DESKTOP_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: '60% center',
    desktopScale: 1,
    mobileScale: 1.15,
    lightingClass: 'site00-env--origin-lighting',
    fallbackClass: 'site00-env-fallback--origin',
    routes: ['/', '/origin'],
    notes: 'Approved Origin desktop environment — 942898D3 @ live-preview/site00',
  },
  WORKFLOW_ENVIRONMENT: {
    id: 'WORKFLOW_ENVIRONMENT',
    desktopAssetPath: SITE00_WORKFLOW_DESKTOP_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: '50% center',
    desktopScale: 1,
    mobileScale: 1.2,
    lightingClass: 'site00-env--workflow-lighting',
    fallbackClass: 'site00-env-fallback--workflow',
    routes: ['/idnty/state', '/bldr/state'],
    notes: 'Approved workflow hall — /idnty/state and /bldr/state only; 3A2AC3AD @ live-preview/site00',
  },
  ENTER_00_WAITING_ROOM: {
    id: 'ENTER_00_WAITING_ROOM',
    desktopAssetPath: SITE00_ENTER_DESKTOP_BACKGROUND_PATH,
    desktopPosition: 'center center',
    mobilePosition: '55% center',
    desktopScale: 1,
    mobileScale: 1.1,
    lightingClass: 'site00-env--enter-lighting',
    fallbackClass: 'site00-env-fallback--enter',
    routes: ['/enter'],
    notes: 'Approved Enter 00 desktop menu — 89319E70 @ live-preview/site00',
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
