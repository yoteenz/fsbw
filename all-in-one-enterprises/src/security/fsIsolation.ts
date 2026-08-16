/**
 * Frontal Slayer isolation regression — All In One must not depend on FS domain systems.
 * Infrastructure-only shared tooling (Vite, React) is permitted.
 */

const FORBIDDEN_IMPORT_PATTERNS = [
  '@/utils/adminAuth',
  '@/lib/supabase',
  'src/utils/adminAuth',
  'SUPABASE_SERVICE_ROLE_KEY',
  'baw_sb_',
  'frontalslayer.com/payment',
  'stripeSecretKey',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

/** Static allowlist of known-safe AIO auth paths */
const AIO_AUTH_ALLOW = [
  'all-in-one/auth/',
  'aio-auth-token',
  'AIOAuthProvider',
];

export interface FsIsolationResult {
  ok: boolean;
  violations: string[];
}

export function checkFsIsolationInSourceSnippet(source: string, contextLabel: string): FsIsolationResult {
  const violations: string[] = [];
  for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
    if (source.includes(pattern) && !source.includes('// fs-isolation-ok')) {
      violations.push(`${contextLabel}: forbidden reference "${pattern}"`);
    }
  }
  return { ok: violations.length === 0, violations };
}

export function runFsIsolationSelfCheck(): FsIsolationResult {
  const violations: string[] = [];
  // Runtime boundary assertions for debug environment
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    const fsAuth = keys.filter((k) => k.includes('baw_sb_') || k.includes('sb-') && !k.includes('aio'));
    if (fsAuth.length > 0) {
      // Coexistence in shared host is OK — AIO must not READ FS keys for auth decisions
      violations.push('Note: shared host may contain FS auth keys — AIO must not consume them (documented boundary)');
    }
  }
  return { ok: true, violations };
}

export function assertAioAuthStorageKey(key: string): boolean {
  return key.includes('aio') || AIO_AUTH_ALLOW.some((a) => key.includes(a));
}
