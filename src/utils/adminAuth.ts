/**
 * Admin authentication helpers.
 * Admin access is restricted to users whose email is in the allowed list.
 * Preview-only admins (e.g. Kristin Watson) get access only on preview/local, not on Vercel production.
 */

const STORAGE_IS_SIGNED_IN = 'isSignedIn';
const STORAGE_CURRENT_USER = 'currentUser';

/** Backup key for auth so we can restore if something else clears isSignedIn/currentUser. Only cleared on explicit Sign Out. */
export const AUTH_BACKUP_KEY = 'baw_auth_backup';

/** Call after setting isSignedIn and currentUser (sign-in). Persists a backup so we can restore if they get cleared. Only writes when signed in so we never overwrite a good backup with signed-out state (e.g. if something clears auth right before unload). */
export function persistAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const signedIn = localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (signedIn && currentUser) {
      localStorage.setItem(AUTH_BACKUP_KEY, JSON.stringify({ isSignedIn: true, currentUser }));
    }
  } catch (_) {}
}

/** Call only on explicit Sign Out (and delete account). Removes the auth backup. */
export function clearAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(AUTH_BACKUP_KEY);
  } catch (_) {}
}

/** Clear app auth state (isSignedIn, currentUser, backup). Call only on explicit Sign Out or delete account. */
export function clearAppAuth(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_IS_SIGNED_IN, 'false');
    localStorage.removeItem(STORAGE_CURRENT_USER);
    localStorage.removeItem(AUTH_BACKUP_KEY);
  } catch (_) {}
}

function restoreAuthFromBackupIfNeeded(): void {
  try {
    const raw = localStorage.getItem(AUTH_BACKUP_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as { isSignedIn?: boolean; currentUser?: string | null };
    if (data.isSignedIn === true && data.currentUser) {
      localStorage.setItem(STORAGE_IS_SIGNED_IN, 'true');
      localStorage.setItem(STORAGE_CURRENT_USER, data.currentUser);
    }
  } catch (_) {}
}

/** Call when Supabase or anything else may have cleared auth (e.g. SIGNED_OUT). Restores from backup so user stays signed in unless they explicitly signed out. */
export function ensureAuthRestoredFromBackup(): void {
  if (typeof window === 'undefined') return;
  restoreAuthFromBackupIfNeeded();
}

/** Allowed admin emails (case-insensitive). From env REACT_APP_ADMIN_EMAILS or VITE_ADMIN_EMAILS (Vite). */
function getAdminEmailsRaw(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAILS) {
    return String((import.meta as any).env.VITE_ADMIN_EMAILS).trim();
  }
  if (typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_EMAILS) {
    return String(process.env.REACT_APP_ADMIN_EMAILS).trim();
  }
  return '';
}
const ADMIN_EMAILS_RAW = getAdminEmailsRaw();
export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  : [];

/** Default admin emails when no env is set. */
const DEFAULT_ADMIN_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'ayoteenz@yahoo.com',
];

/** Single admin Kateena account (mock data, premium, test orders). Only this email gets the exception; same-name OAuth accounts do not. */
export const ADMIN_KATEENA_EMAIL = 'kateena.armstrong@frontalslayer.com';

/** Ayoteenz admin account – used for UI helpers (e.g. colored tier names on membership page). */
export const AYOTEENZ_ADMIN_EMAIL = 'ayoteenz@yahoo.com';

/** Effective list of admin emails (env list or defaults). Used for isAdminEmail and for who can access /admin/*. */
const allowedEmails = ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : DEFAULT_ADMIN_EMAILS;

/**
 * Emails that are allowed to access admin/sensitive pages (dashboard, clients, etc.).
 * When env sets admin emails, that list is used; otherwise defaults to ayoteenz only.
 */
export const ALLOWED_ADMIN_PAGE_EMAILS: string[] = allowedEmails;

/** True if user is the one admin Kateena account (by email only). Use for mock/premium exception only; other "Kateena Armstrong" accounts (e.g. OAuth with different email) are not included. */
export function isAdminKateenaAccount(user: { email?: string } | null): boolean {
  if (!user?.email) return false;
  return (user.email || '').trim().toLowerCase() === ADMIN_KATEENA_EMAIL;
}

/** True if user is the ayoteenz admin account (by email only). Use for admin-only UI (e.g. colored tier names). */
export function isAyoteenzAdminAccount(user: { email?: string } | null): boolean {
  if (!user?.email) return false;
  return (user.email || '').trim().toLowerCase() === AYOTEENZ_ADMIN_EMAIL;
}

/** localStorage key for ayoteenz admin subscription override (Standard / 3 / 6 / 12 month) for testing UI across pages. */
export const ADMIN_SUBSCRIPTION_OVERRIDE_KEY = 'adminSubscriptionOverride';

/** localStorage key for ayoteenz admin spend-tier override (SILVER / RED / BLACK) for testing UI and checkout logic across pages. */
export const ADMIN_TIER_OVERRIDE_KEY = 'adminTierOverride';

/**
 * Effective spend tier (SILVER / RED / BLACK) for the given user. For ayoteenz admin only, reads adminTierOverride from localStorage
 * so the membership page toggle persists and applies on checkout, confirm, etc.
 */
export function getEffectiveTierName(user: { email?: string; currentTierName?: string; tier?: string } | null): string | null {
  if (!user?.email) return null;
  if (!isAyoteenzAdminAccount(user)) {
    const tier = (user.currentTierName || user.tier || (typeof window !== 'undefined' && user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase();
    return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
  }
  if (typeof window === 'undefined') {
    const tier = (user.currentTierName || user.tier || '').toString().toUpperCase();
    return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
  }
  const override = (localStorage.getItem(ADMIN_TIER_OVERRIDE_KEY) || '').trim().toUpperCase();
  if (override === 'SILVER' || override === 'RED' || override === 'BLACK') return override;
  const tier = (user.currentTierName || user.tier || (user.email ? localStorage.getItem(`lastKnownTier_${(user.email || '').trim().toLowerCase()}`) : null) || '').toString().toUpperCase();
  return tier && ['SILVER', 'RED', 'BLACK'].includes(tier) ? tier : null;
}

/**
 * Effective subscription tier for the given user. For ayoteenz admin only, reads adminSubscriptionOverride from localStorage
 * so toggles on membership page persist and apply on checkout, orders, etc. Values: '3months' | '6months' | '12months' | null (Standard).
 */
export function getEffectiveSubscriptionTier(user: { email?: string; subscriptionTier?: string; membershipType?: string } | null): string | null {
  if (!user?.email) return null;
  if (!isAyoteenzAdminAccount(user)) {
    if (user.subscriptionTier) return user.subscriptionTier;
    if (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium') return '12months';
    return null;
  }
  if (typeof window === 'undefined') return user.subscriptionTier || (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium' ? '12months' : null);
  const override = (localStorage.getItem(ADMIN_SUBSCRIPTION_OVERRIDE_KEY) || '').trim().toLowerCase();
  if (override === 'standard' || override === '') return null;
  if (override === '3months' || override === '6months' || override === '12months') return override;
  return user.subscriptionTier || (user.membershipType === 'PREMIUM' || user.membershipType === 'Premium' ? '12months' : null);
}

/** True if this account should receive test/mock data (points, history, seed orders, etc.). Only the ayoteenz account when it has the admin tag (in admin list); OAuth/non-admin accounts (e.g. yoteenz@gmail.com) get no mock data. */
export function isMockDataAccount(user: { email?: string; role?: string } | null): boolean {
  if (!user?.email) return false;
  if (!isAyoteenzAdminAccount(user)) return false;
  return user.role === 'admin' || isAdminEmail(user.email || '');
}

/** Preview-only admin emails (env REACT_APP_PREVIEW_ADMIN_EMAILS). Only get admin on preview/local, never on Vercel production. */
const PREVIEW_ADMIN_RAW = typeof process !== 'undefined' && process.env?.REACT_APP_PREVIEW_ADMIN_EMAILS
  ? process.env.REACT_APP_PREVIEW_ADMIN_EMAILS
  : '';
const previewOnlyEmails: string[] = PREVIEW_ADMIN_RAW
  ? PREVIEW_ADMIN_RAW.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  : [];

/** IP that is allowed for preview admin (signed-out access on dev). Vite: VITE_PREVIEW_ADMIN_ALLOWED_IP in .env.local. */
export function getPreviewAdminAllowedIp(): string | undefined {
  const v =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_PREVIEW_ADMIN_ALLOWED_IP) ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_PREVIEW_ADMIN_ALLOWED_IP);
  return v ? String(v).trim() : undefined;
}

/** True when running on preview (localhost, LAN IP, or Vercel preview), false on Vercel production deploy. */
export function isPreviewEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (/^10\./.test(host) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) || /^192\.168\./.test(host)) {
      return true;
    }
  }
  const env = typeof process !== 'undefined' && process.env?.VERCEL_ENV;
  return env === 'preview' || env === 'development';
}

export function isAdminEmail(email: string): boolean {
  return allowedEmails.includes((email || '').trim().toLowerCase());
}

/** True if email is in the preview-only admin list (Kristin Watson, etc.). */
export function isPreviewOnlyAdminEmail(email: string): boolean {
  return previewOnlyEmails.length > 0 && previewOnlyEmails.includes((email || '').trim().toLowerCase());
}

export function getCurrentUser(): { email?: string; role?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) {
      restoreAuthFromBackupIfNeeded();
      raw = localStorage.getItem(STORAGE_CURRENT_USER);
    }
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true') return true;
    restoreAuthFromBackupIfNeeded();
    return localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
  } catch {
    return false;
  }
}

/** True if signed in and current user has full admin or (on preview only) preview-only admin. */
export function isAdminUser(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin' || isAdminEmail(user.email || '')) return true;
  if (isPreviewEnvironment() && isPreviewOnlyAdminEmail(user.email || '')) return true;
  return false;
}

/**
 * True only when signed in AND current user email is in ALLOWED_ADMIN_PAGE_EMAILS (e.g. ayoteenz@yahoo.com).
 * Use this to gate access to /admin/* routes. All other accounts must be redirected.
 */
export function canAccessAdminPages(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  if (!user?.email) return false;
  const email = (user.email || '').trim().toLowerCase();
  return ALLOWED_ADMIN_PAGE_EMAILS.some((allowed) => allowed.trim().toLowerCase() === email);
}

/** True if current user is a preview-only admin (must also pass IP check in guard). */
export function isPreviewOnlyAdminUser(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  return !!(user && isPreviewOnlyAdminEmail(user.email || ''));
}
