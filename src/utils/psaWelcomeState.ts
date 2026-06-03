/**
 * PSA welcome greeting — first unlock vs return-after-idle vs same-session.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';

export type PsaWelcomeKind = 'first' | 'returning' | 'default';

const FIRST_WELCOME_PREFIX = 'psaFirstWelcomeShown';
const SITE_SESSION_FLAG = 'psaSiteSessionActive';
const SESSION_KIND_KEY = 'psaWelcomeKindThisSession';

function firstWelcomeKey(email: string): string {
  return getPerUserKey(FIRST_WELCOME_PREFIX, email);
}

export function hasShownFirstPsaWelcome(email?: string | null): boolean {
  const e = (email ?? getCurrentUserEmailFromStorage())?.trim();
  if (!e) return false;
  try {
    return localStorage.getItem(firstWelcomeKey(e)) === '1';
  } catch {
    return false;
  }
}

export function markFirstPsaWelcomeShown(email?: string | null): void {
  const e = (email ?? getCurrentUserEmailFromStorage())?.trim();
  if (!e) return;
  try {
    localStorage.setItem(firstWelcomeKey(e), '1');
  } catch {
    /* ignore */
  }
}

function markSiteSessionStarted(): void {
  try {
    sessionStorage.setItem(SITE_SESSION_FLAG, '1');
  } catch {
    /* ignore */
  }
}

function isNewSiteSession(): boolean {
  try {
    return sessionStorage.getItem(SITE_SESSION_FLAG) !== '1';
  } catch {
    return true;
  }
}

function computePsaWelcomeKind(email: string): PsaWelcomeKind {
  if (!hasShownFirstPsaWelcome(email)) return 'first';
  if (isNewSiteSession()) return 'returning';
  return 'default';
}

/**
 * Resolved once per browser tab session so focus/sync does not flip the greeting.
 * First premium unlock → "Welcome, {name}!"
 * New site session after that → "Welcome back, {name}!"
 * Same session → no welcome prefix.
 */
export function resolvePsaWelcomeKind(email?: string | null): PsaWelcomeKind {
  try {
    const cached = sessionStorage.getItem(SESSION_KIND_KEY);
    if (cached === 'first' || cached === 'returning' || cached === 'default') {
      return cached;
    }
  } catch {
    /* ignore */
  }

  const e = (email ?? getCurrentUserEmailFromStorage())?.trim();
  if (!e) return 'default';

  const kind = computePsaWelcomeKind(e);

  try {
    sessionStorage.setItem(SESSION_KIND_KEY, kind);
  } catch {
    /* ignore */
  }

  markSiteSessionStarted();
  if (kind === 'first') {
    markFirstPsaWelcomeShown(e);
  }

  return kind;
}
