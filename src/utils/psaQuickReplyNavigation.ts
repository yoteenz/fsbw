/**
 * Immediate navigation for PSA "open" quick replies — route without waiting for chat reply.
 */
const UNIT_PATHS: Record<string, string> = {
  noir: '/build-a-wig/noir',
  blanco: '/build-a-wig/blanco',
  'soft wave': '/build-a-wig/soft-wave',
  'soft-wave': '/build-a-wig/soft-wave',
  'beach wave': '/build-a-wig/beach-wave',
  'beach-wave': '/build-a-wig/beach-wave',
  'soft curl': '/build-a-wig/soft-curl',
  'soft-curl': '/build-a-wig/soft-curl',
  'ocean curl': '/build-a-wig/ocean-curl',
  'ocean-curl': '/build-a-wig/ocean-curl',
};

const EXACT_ROUTES: Record<string, string> = {
  'TRACK MY ORDER': '/account/orders',
  'VIEW MY ORDERS': '/account/orders',
  'GO TO ORDERS': '/account/orders',
};

function unitPathFromFragment(fragment: string): string | null {
  const norm = fragment.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!norm) return null;
  if (UNIT_PATHS[norm]) return UNIT_PATHS[norm];
  for (const [key, path] of Object.entries(UNIT_PATHS)) {
    if (norm.includes(key)) return path;
  }
  return null;
}

/** Path to navigate immediately, or null if this chip should wait for PSA. */
export function resolvePsaQuickReplyNavigation(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const exact = EXACT_ROUTES[trimmed.toUpperCase()];
  if (exact) return exact;

  const goTo = /^GO TO (\/.+)$/i.exec(trimmed);
  if (goTo?.[1]) return goTo[1].split(/\s/)[0];

  if (!/^OPEN\b/i.test(trimmed)) return null;

  if (/^OPEN\s+ORDERS\b/i.test(trimmed)) return '/account/orders';
  if (/^OPEN\s+LOUNGE\b/i.test(trimmed)) return '/lobby/lounge';
  if (/^OPEN\s+(?:BUILD-A-WIG|BAW)\s*$/i.test(trimmed)) return '/build-a-wig';

  const forUnit = /^OPEN\s+(?:BUILD-A-WIG|BAW)\s+(?:FOR\s+)?(.+)$/i.exec(trimmed);
  if (forUnit?.[1]) {
    const path = unitPathFromFragment(forUnit[1]);
    if (path) return path;
  }

  return null;
}

export function isPsaImmediateNavigateReply(text: string): boolean {
  return resolvePsaQuickReplyNavigation(text) != null;
}
