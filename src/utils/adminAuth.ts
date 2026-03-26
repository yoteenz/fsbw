/**
 * Admin authentication helpers.
 * Admin access is restricted to users whose email is in the allowed list.
 * Preview-only admins (e.g. Kristin Watson) get access only on preview/local, not on Vercel production.
 */

const STORAGE_IS_SIGNED_IN = 'isSignedIn';
const STORAGE_CURRENT_USER = 'currentUser';

/** Backup key for auth so we can restore if something else clears isSignedIn/currentUser. Only cleared on explicit Sign Out. */
export const AUTH_BACKUP_KEY = 'baw_auth_backup';

const AUTH_BACKUP_COOKIE = 'baw_auth_b';
const AUTH_PROFILE_COOKIE = 'baw_auth_p';

/** Track how user signed in (session_restore = Face ID / Supabase cookie auto-login; password = tapped Sign in). Used so we persist backup reliably on Safari. */
export const LAST_SIGN_IN_METHOD_KEY = 'baw_last_sign_in_method';
export const LAST_SIGN_IN_AT_KEY = 'baw_last_sign_in_at';

function isSafariIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iP(?:hone|ad|od)/.test(ua) && /Safari|AppleWebKit/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
}

/** Call once after every successful sign-in (session restore, password submit, or passkey). Records method, persists backup, and on Safari iOS schedules extra persist retries so backup sticks before app is closed. */
export function onSignInSuccess(method: 'session_restore' | 'password' | 'passkey'): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LAST_SIGN_IN_METHOD_KEY, method);
    window.localStorage.setItem(LAST_SIGN_IN_AT_KEY, String(Date.now()));
    persistAuthBackup();
    if (isSafariIos()) {
      const delays = [150, 400, 800];
      delays.forEach((ms) => {
        setTimeout(() => persistAuthBackup(), ms);
      });
      authDebugLog(`signInSuccess: method=${method} (Safari iOS — scheduled ${delays.length} backup retries)`);
    } else {
      authDebugLog(`signInSuccess: method=${method}`);
    }
  } catch (_) {}
}

/** Enable auth debug: set localStorage 'baw_auth_debug' = 'true' or open site with ?auth_debug=1. Logs persist so you can see what happened after reopening the browser. */
export const AUTH_DEBUG_KEY = 'baw_auth_debug';
export const AUTH_DEBUG_LOG_KEY = 'baw_auth_debug_log';
const AUTH_DEBUG_LOG_MAX = 45;

function isAuthDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.localStorage.getItem(AUTH_DEBUG_KEY) === 'true') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_debug') === '1' || params.get('auth_debug') === 'true') return true;
    return false;
  } catch {
    return false;
  }
}

function authDebugLog(message: string): void {
  if (!isAuthDebugEnabled()) return;
  try {
    const t = Date.now();
    const line = { t, m: message };
    const raw = window.localStorage.getItem(AUTH_DEBUG_LOG_KEY);
    const log: { t: number; m: string }[] = raw ? JSON.parse(raw) : [];
    log.push(line);
    if (log.length > AUTH_DEBUG_LOG_MAX) log.splice(0, log.length - AUTH_DEBUG_LOG_MAX);
    window.localStorage.setItem(AUTH_DEBUG_LOG_KEY, JSON.stringify(log));
    if (typeof console !== 'undefined' && console.log) console.log('[baw-auth]', message);
  } catch (_) {}
}

/** Call with current search string (e.g. location.search) to enable debug when ?auth_debug=1 is present. */
export function enableAuthDebugFromSearch(search: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(search);
    if (params.get('auth_debug') === '1' || params.get('auth_debug') === 'true') {
      window.localStorage.setItem(AUTH_DEBUG_KEY, 'true');
      return true;
    }
    return window.localStorage.getItem(AUTH_DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Call once on load to enable debug from current window URL (e.g. ?auth_debug=1). */
export function enableAuthDebugFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return enableAuthDebugFromSearch(window.location.search);
}

/** Log a message only when auth debug is enabled (e.g. from main.tsx when visibility changes). */
export function authDebugLogIfEnabled(message: string): void {
  authDebugLog(message);
}

/** For debug panel: last sign-in method and timestamp (session_restore = Face ID/auto-login, password = tapped Sign in). */
export function getLastSignInInfo(): { method: string; at: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const method = window.localStorage.getItem(LAST_SIGN_IN_METHOD_KEY);
    const at = window.localStorage.getItem(LAST_SIGN_IN_AT_KEY);
    if (method && at) return { method, at: parseInt(at, 10) };
    return null;
  } catch {
    return null;
  }
}

/** Get recent auth debug log lines for the on-page panel. Returns { enabled, lines }. */
export function getAuthDebugLog(): { enabled: boolean; lines: { t: number; m: string }[] } {
  if (typeof window === 'undefined') return { enabled: false, lines: [] };
  try {
    const enabled = window.localStorage.getItem(AUTH_DEBUG_KEY) === 'true';
    const raw = window.localStorage.getItem(AUTH_DEBUG_LOG_KEY);
    const lines: { t: number; m: string }[] = raw ? JSON.parse(raw) : [];
    return { enabled, lines };
  } catch {
    return { enabled: false, lines: [] };
  }
}

function readBackupFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + AUTH_BACKUP_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function writeBackupToCookie(json: string): void {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 365 * 24 * 60 * 60;
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_BACKUP_COOKIE + '=' + encodeURIComponent(json) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function clearBackupCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_BACKUP_COOKIE + '=; path=/; max-age=0';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function writeProfileCookie(value: string): void {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = 365 * 24 * 60 * 60;
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_PROFILE_COOKIE + '=' + encodeURIComponent(value) + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

function readProfileCookie(): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + AUTH_PROFILE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function clearProfileCookie(): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let cookie = AUTH_PROFILE_COOKIE + '=; path=/; max-age=0';
    if (secure) cookie += '; Secure';
    document.cookie = cookie;
  } catch (_) {}
}

const COOKIE_BACKUP_MAX = 3800;

/** Build a slim currentUser (no large base64 image) so cookie backup fits and Safari can restore sign-in after close. */
function slimCurrentUserForCookie(currentUserJson: string, maxBytes: number): string {
  try {
    const u = JSON.parse(currentUserJson) as Record<string, unknown>;
    const slim = { ...u };
    if (slim.profileImage && typeof slim.profileImage === 'string' && slim.profileImage.length > 200) slim.profileImage = '';
    if (slim.profile_image && typeof slim.profile_image === 'string' && (slim.profile_image as string).length > 200) slim.profile_image = '';
    let out = JSON.stringify(slim);
    if (out.length <= maxBytes) return out;
    const minimal: Record<string, unknown> = { id: u.id, email: u.email, role: u.role };
    if (u.password && typeof u.password === 'string') minimal.password = u.password;
    return JSON.stringify(minimal);
  } catch {
    return currentUserJson;
  }
}

/** Call after setting isSignedIn and currentUser (sign-in). Persists a backup so we can restore if they get cleared. Only writes when signed in so we never overwrite a good backup with signed-out state (e.g. if something clears auth right before unload). Writes to both localStorage and a cookie so we survive localStorage clears on browser close. Cookie uses a slim user (no large profile image) so it always fits and Safari restore works. */
export function persistAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const signedIn = localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
    const currentUser = localStorage.getItem(STORAGE_CURRENT_USER);
    if (signedIn && currentUser) {
      const payload = JSON.stringify({ isSignedIn: true, currentUser });
      localStorage.setItem(AUTH_BACKUP_KEY, payload);
      let cookiePayload = payload;
      if (payload.length > COOKIE_BACKUP_MAX) {
        const wrapperOverhead = 35;
        const slimUser = slimCurrentUserForCookie(currentUser, COOKIE_BACKUP_MAX - wrapperOverhead);
        cookiePayload = JSON.stringify({ isSignedIn: true, currentUser: slimUser });
      }
      if (cookiePayload.length <= COOKIE_BACKUP_MAX) writeBackupToCookie(cookiePayload);
      // Persist a tiny profile cookie so Safari restore keeps key account fields even
      // when backup must be minimized.
      try {
        const u = JSON.parse(currentUser) as Record<string, unknown>;
        const small = {
          email: (u.email || '').toString().trim().toLowerCase(),
          firstName: (u.firstName || u.first_name || '').toString(),
          lastName: (u.lastName || u.last_name || '').toString(),
          birthday: (u.birthday || '').toString(),
          profileImage: (() => {
            const v = (u.profileImage || u.profile_image || '').toString();
            if (!v) return '';
            if (v.toLowerCase().startsWith('data:image/')) return '';
            return v;
          })(),
        };
        const json = JSON.stringify(small);
        if (json.length <= 1200) writeProfileCookie(json);
      } catch {
        // ignore profile-cookie write errors
      }
      authDebugLog(`persist: ls=ok cookie=${cookiePayload.length <= COOKIE_BACKUP_MAX ? 'ok' : 'skip'} len=${payload.length} — backup written; close Safari and reopen with ?auth_debug=1 to test`);
    } else {
      authDebugLog(`persist: skip (signedIn=${signedIn} hasUser=${!!currentUser})`);
    }
  } catch (e) {
    authDebugLog(`persist: err ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** Call only on explicit Sign Out (and delete account). Removes the auth backup from localStorage and cookie. */
export function clearAuthBackup(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(AUTH_BACKUP_KEY);
    clearBackupCookie();
    clearProfileCookie();
  } catch (_) {}
}

/** Clear app auth state (isSignedIn, currentUser, backup). Call only on explicit Sign Out or delete account. */
export function clearAppAuth(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(STORAGE_IS_SIGNED_IN, 'false');
    localStorage.removeItem(STORAGE_CURRENT_USER);
    localStorage.removeItem(AUTH_BACKUP_KEY);
    clearBackupCookie();
    clearProfileCookie();
    // Fire-and-forget: clear server HttpOnly session cookie (Safari restore) so next load is signed out
    import('./sessionRestore').then((m) => m.clearServerSessionCookie()).catch(() => {});
  } catch (_) {}
}

function restoreAuthFromBackupIfNeeded(): void {
  try {
    const hadLs = !!localStorage.getItem(AUTH_BACKUP_KEY);
    let raw = localStorage.getItem(AUTH_BACKUP_KEY);
    let fromCookie = false;
    if (!raw && typeof document !== 'undefined') {
      const cookieVal = readBackupFromCookie();
      if (cookieVal) {
        raw = cookieVal;
        fromCookie = true;
      }
    }
    authDebugLog(`restore: hadLs=${hadLs} hadCookie=${fromCookie} rawLen=${raw ? raw.length : 0}`);
    if (!raw) return;
    const data = JSON.parse(raw) as { isSignedIn?: boolean; currentUser?: string | null };
    if (data.isSignedIn === true && data.currentUser) {
      localStorage.setItem(STORAGE_IS_SIGNED_IN, 'true');
      localStorage.setItem(STORAGE_CURRENT_USER, data.currentUser);
      // Merge tiny profile cookie fields back in when backup payload had to be minimized.
      try {
        const profileRaw = readProfileCookie();
        if (profileRaw) {
          const p = JSON.parse(profileRaw) as Record<string, unknown>;
          const curRaw = localStorage.getItem(STORAGE_CURRENT_USER);
          const cur = curRaw ? JSON.parse(curRaw) as Record<string, unknown> : null;
          const pEmail = (p.email || '').toString().trim().toLowerCase();
          const cEmail = (cur?.email || '').toString().trim().toLowerCase();
          if (cur && pEmail && cEmail && pEmail === cEmail) {
            const merged = { ...cur } as Record<string, unknown>;
            const first = (merged.firstName || merged.first_name || '').toString().trim();
            const last = (merged.lastName || merged.last_name || '').toString().trim();
            const img = (merged.profileImage || merged.profile_image || '').toString().trim();
            const bday = (merged.birthday || '').toString().trim();
            if (!first && p.firstName) {
              merged.firstName = p.firstName;
              merged.first_name = p.firstName;
            }
            if (!last && p.lastName) {
              merged.lastName = p.lastName;
              merged.last_name = p.lastName;
            }
            if (!bday && p.birthday) merged.birthday = p.birthday;
            if ((!img || img === '/assets/profile-thumb.png') && p.profileImage) {
              merged.profileImage = p.profileImage;
              merged.profile_image = p.profileImage;
              localStorage.setItem('profileImage', String(p.profileImage));
            }
            localStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(merged));
          }
        }
      } catch {
        // ignore merge errors
      }
      authDebugLog('restore: applied backup to ls');
    }
  } catch (e) {
    authDebugLog(`restore: err ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** Call when Supabase or anything else may have cleared auth (e.g. SIGNED_OUT). Restores from backup so user stays signed in unless they explicitly signed out. */
export function ensureAuthRestoredFromBackup(): void {
  if (typeof window === 'undefined') return;
  const protocol = typeof location !== 'undefined' ? location.protocol : '?';
  const lsBackup = typeof localStorage !== 'undefined' ? !!localStorage.getItem(AUTH_BACKUP_KEY) : false;
  const cookieBackup = typeof document !== 'undefined' ? !!readBackupFromCookie() : false;
  authDebugLog(`load: protocol=${protocol} lsBackup=${lsBackup} cookieBackup=${cookieBackup}`);
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
