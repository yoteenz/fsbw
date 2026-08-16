import { aioPaths } from '../utils/paths';

const ALLOWED_PREFIXES = [
  aioPaths.home,
  aioPaths.portal,
  aioPaths.login,
  aioPaths.signUp,
  aioPaths.onboarding,
  aioPaths.services,
  aioPaths.startYourBusiness,
  aioPaths.roadReadyPublic,
  aioPaths.getStarted,
  aioPaths.bookkeeping,
  aioPaths.bookkeepingAssessment,
  aioPaths.dispatching,
  aioPaths.factoring,
  aioPaths.insurance,
  aioPaths.brokerage,
  aioPaths.businessFormation,
  aioPaths.permitting,
  '/office',
] as const;

/** Validate safe internal return URL — blocks external redirects. */
export function sanitizeReturnUrl(raw: string | null | undefined, fallback: string = aioPaths.portal): string {
  if (!raw || typeof raw !== 'string') return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (raw.includes('://')) return fallback;

  const path = raw.split('?')[0] ?? raw;
  const allowed = ALLOWED_PREFIXES.some((prefix) => {
    if (prefix === aioPaths.home) return path === '/' || path === '';
    return path === prefix || path.startsWith(`${prefix}/`);
  });

  return allowed ? raw : fallback;
}

export function returnUrlFromSearch(search: string): string | undefined {
  const params = new URLSearchParams(search);
  const value = params.get('return') ?? params.get('from');
  return value ? sanitizeReturnUrl(value) : undefined;
}
