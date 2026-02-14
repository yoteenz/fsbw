/**
 * Admin authentication helpers.
 * Admin access is restricted to users whose email is in the allowed list.
 * Preview-only admins (e.g. Kristin Watson) get access only on preview/local, not on Vercel production.
 */

const STORAGE_IS_SIGNED_IN = 'isSignedIn';
const STORAGE_CURRENT_USER = 'currentUser';

/** Allowed admin emails (case-insensitive). Add your admin email(s) here or via env. */
const ADMIN_EMAILS_RAW = typeof process !== 'undefined' && process.env?.REACT_APP_ADMIN_EMAILS
  ? process.env.REACT_APP_ADMIN_EMAILS
  : '';
export const ADMIN_EMAILS: string[] = ADMIN_EMAILS_RAW
  ? ADMIN_EMAILS_RAW.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  : [];

/** Default admin emails when no env is set. */
const DEFAULT_ADMIN_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'ayoteenz@yahoo.com',
];

const allowedEmails = ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : DEFAULT_ADMIN_EMAILS;

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
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && typeof user === 'object' ? user : null;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  return localStorage.getItem(STORAGE_IS_SIGNED_IN) === 'true';
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

/** True if current user is a preview-only admin (must also pass IP check in guard). */
export function isPreviewOnlyAdminUser(): boolean {
  if (!isSignedIn()) return false;
  const user = getCurrentUser();
  return !!(user && isPreviewOnlyAdminEmail(user.email || ''));
}
