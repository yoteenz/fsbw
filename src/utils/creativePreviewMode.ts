/**
 * Designer / creative showcase mode — preview deployments only.
 * Activate via secret URL: `?creativePreview=<VITE_CREATIVE_PREVIEW_TOKEN>`
 * Persists for the browser tab session (sessionStorage). No sign-up, no real payments.
 */

import { isPreviewEnvironment, persistAuthBackup } from './adminAuth';

export const CREATIVE_PREVIEW_URL_PARAM = 'creativePreview';
export const CREATIVE_PREVIEW_SESSION_KEY = 'baw_creative_preview_active';
export const CREATIVE_PREVIEW_DEMO_EMAIL = 'creative.preview@frontalslayer.com';

export const CREATIVE_PREVIEW_CHANGED_EVENT = 'bawCreativePreviewChanged';

function readEnvToken(): string {
  const v = import.meta.env?.VITE_CREATIVE_PREVIEW_TOKEN;
  return typeof v === 'string' ? v.trim() : '';
}

export function getCreativePreviewTokenFromEnv(): string {
  return readEnvToken();
}

function sessionFlagActive(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(CREATIVE_PREVIEW_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function setSessionFlagActive(): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  window.sessionStorage.setItem(CREATIVE_PREVIEW_SESSION_KEY, '1');
}

function tokenMatches(submitted: string): boolean {
  const expected = readEnvToken();
  if (!expected || !submitted.trim()) return false;
  return submitted.trim() === expected;
}

export function isCreativePreviewDemoEmail(email: string | undefined | null): boolean {
  return (email || '').trim().toLowerCase() === CREATIVE_PREVIEW_DEMO_EMAIL;
}

/** True on preview/local when the session was unlocked with the env token. */
export function isCreativePreviewMode(): boolean {
  if (!isPreviewEnvironment()) return false;
  if (!readEnvToken()) return false;
  return sessionFlagActive();
}

export function isCreativePreviewCheckoutBlocked(): boolean {
  return isCreativePreviewMode();
}

function buildCreativePreviewDemoUser(): Record<string, unknown> {
  return {
    email: CREATIVE_PREVIEW_DEMO_EMAIL,
    firstName: 'CREATIVE',
    lastName: 'PREVIEW',
    name: 'CREATIVE PREVIEW',
    membershipType: 'PREMIUM',
    subscriptionTier: '12months',
    tierName: 'BLACK',
    role: 'member',
    points: 1240,
    profileImage: '',
  };
}

function seedCreativePreviewOrders(): void {
  const key = `userOrders_${CREATIVE_PREVIEW_DEMO_EMAIL}`;
  if (localStorage.getItem(key)) return;

  const now = Date.now();
  const activeOrders = [
    {
      id: 'creative-preview-order-active-1',
      orderNumber: '128',
      date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PROCESSING',
      productName: 'NOIR',
      productImage: '/assets/NOIR/noir-thumb.png',
      total: 740,
      items: 1,
      placedAt: now - 3 * 24 * 60 * 60 * 1000,
    },
  ];
  const pastOrders = [
    {
      id: 'creative-preview-order-past-1',
      orderNumber: '117',
      date: new Date(now - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'COMPLETE',
      productName: 'SOFT WAVE',
      productImage: '/assets/SOFT WAVE/soft-wave-thumb.png',
      total: 680,
      items: 1,
      placedAt: now - 45 * 24 * 60 * 60 * 1000,
      deliveredAt: now - 38 * 24 * 60 * 60 * 1000,
    },
  ];

  localStorage.setItem(key, JSON.stringify({ activeOrders, pastOrders }));
}

/** Apply demo signed-in member with premium + BLACK tier and sample orders. */
export function seedCreativePreviewDemoSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify(buildCreativePreviewDemoUser()));
  seedCreativePreviewOrders();

  try {
    persistAuthBackup();
  } catch {
    /* ignore */
  }

  window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
  window.dispatchEvent(new CustomEvent(CREATIVE_PREVIEW_CHANGED_EVENT));
}

function stripCreativePreviewParamFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(CREATIVE_PREVIEW_URL_PARAM)) return;
    url.searchParams.delete(CREATIVE_PREVIEW_URL_PARAM);
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, '', next);
  } catch {
    /* ignore */
  }
}

function tryActivateFromUrlSearch(search: string): boolean {
  if (!isPreviewEnvironment() || !readEnvToken()) return false;
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const token = params.get(CREATIVE_PREVIEW_URL_PARAM);
  if (!token || !tokenMatches(token)) return false;
  setSessionFlagActive();
  return true;
}

/**
 * Call once at app startup (before auth backup restore). Returns true when creative preview is active.
 */
export function bootstrapCreativePreviewMode(): boolean {
  if (typeof window === 'undefined') return false;

  tryActivateFromUrlSearch(window.location.search);

  if (!isCreativePreviewMode()) return false;

  seedCreativePreviewDemoSession();
  stripCreativePreviewParamFromUrl();
  return true;
}
