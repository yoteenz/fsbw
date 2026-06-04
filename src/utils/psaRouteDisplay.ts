/**
 * Strip raw app paths from PSA bubble copy and surface friendly GO HERE links instead.
 */

const APP_PATH_PATTERN = /\/(?:[a-z0-9-]+\/)*[a-z0-9-]+/gi;

const NAV_TAIL_RE =
  /\b(GO HERE NEXT|GO HERE|TAP HERE|OPEN HERE|HEAD HERE)\s*:\s*(.+)\s*$/im;

const PSA_ROUTE_LINK_LABELS: Record<string, string> = {
  '/wishlist': 'WISHLIST PAGE',
  '/wishlist/lists': 'WISHLIST LISTS',
  '/bag': 'BAG',
  '/orders': 'ORDERS',
  '/build-a-wig': 'BUILD-A-WIG',
  '/home/shop': 'SHOP',
  '/account/rewards': 'REWARDS',
  '/lobby/lounge': 'VIP LOUNGE',
  '/brand/faq': 'FAQ',
  '/brand/contact': 'CONTACT',
};

const PSA_DESTINATION_LABEL_TO_PATH: Record<string, string> = {
  'WISHLIST PAGE': '/wishlist',
  WISHLIST: '/wishlist',
  BAG: '/bag',
  ORDERS: '/orders',
  SHOP: '/home/shop',
  REWARDS: '/account/rewards',
};

function normalizeAppPath(raw: string): string | null {
  const segment = raw.split(/[\s),."'<>[\]]/)[0]?.toLowerCase() ?? '';
  if (!segment.startsWith('/') || segment.length <= 1) return null;
  return segment;
}

export function extractPsaAppPaths(text: string): string[] {
  const matches = text.match(APP_PATH_PATTERN) ?? [];
  const unique: string[] = [];
  for (const m of matches) {
    const p = normalizeAppPath(m);
    if (p && !unique.includes(p)) unique.push(p);
  }
  return unique.slice(0, 4);
}

export type PsaRouteLink = {
  path: string;
  label: string;
};

export type PsaMessageRouteDisplay = {
  displayText: string;
  routeLinks: PsaRouteLink[];
  /** Render the first link inline after this cue (e.g. "GO HERE NEXT:"). */
  inlineTailCue: string | null;
};

function removePathsFromText(text: string, paths: string[]): string {
  let out = text;
  for (const path of paths) {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), '');
  }
  return out.replace(APP_PATH_PATTERN, '');
}

function cleanupRoutelessNavigationCopy(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/\b(?:GO\s+TO|VISIT|HEAD\s+TO|NAVIGATE\s+TO|OPEN\s+AT)\s*:\s*/gi, '')
        .replace(/\s*:\s*(?=[.!?]|$)/g, '')
        .replace(/[^\S\n]+/g, ' ')
        .replace(/\s+([,.!?])/g, '$1')
        .replace(/\(\s*\)/g, '')
        .trim()
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function routeLabelForPath(path: string): string {
  if (PSA_ROUTE_LINK_LABELS[path]) return PSA_ROUTE_LINK_LABELS[path];
  const segments = path.split('/').filter(Boolean);
  const last = segments[segments.length - 1]?.replace(/-/g, ' ') ?? 'GO HERE';
  return last.toUpperCase();
}

export function formatPsaMessageRouteDisplay(text: string): PsaMessageRouteDisplay {
  let paths = extractPsaAppPaths(text);
  const navTailMatch = text.trim().match(NAV_TAIL_RE);
  const inlineTailCue = navTailMatch ? `${navTailMatch[1].toUpperCase()}:` : null;
  let tailDestinationLabel: string | null = null;

  if (navTailMatch) {
    const suffix = navTailMatch[2].trim();
    const pathFromTail = normalizeAppPath(suffix);
    if (pathFromTail) {
      if (!paths.includes(pathFromTail)) paths = [...paths, pathFromTail];
    } else {
      tailDestinationLabel = suffix.toUpperCase();
      const inferred = PSA_DESTINATION_LABEL_TO_PATH[tailDestinationLabel];
      if (inferred && !paths.includes(inferred)) {
        paths = [inferred, ...paths];
      }
    }
  }

  let displayText = text;
  if (navTailMatch) {
    displayText = displayText.replace(NAV_TAIL_RE, '').trim();
  }
  displayText = removePathsFromText(displayText, paths);
  displayText = cleanupRoutelessNavigationCopy(displayText);

  const routeLinks: PsaRouteLink[] = paths.map((path, idx) => ({
    path,
    label:
      idx === 0 && tailDestinationLabel ? tailDestinationLabel : routeLabelForPath(path),
  }));

  return { displayText, routeLinks, inlineTailCue };
}
