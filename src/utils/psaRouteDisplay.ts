/**
 * Strip raw app paths from PSA bubble copy and surface friendly GO HERE links instead.
 */

const APP_PATH_PATTERN = /\/(?:[a-z0-9-]+\/)*[a-z0-9-]+/gi;

const NAV_TAIL_WITH_PATH_RE =
  /\b(GO HERE NEXT|GO HERE|TAP HERE|OPEN HERE|HEAD HERE)\s*:\s*(?:\/(?:[a-z0-9-]+\/)*[a-z0-9-]+)?\s*$/i;

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
    .replace(/\b(?:GO\s+TO|VISIT|HEAD\s+TO|NAVIGATE\s+TO|OPEN\s+AT)\s*:\s*/gi, '')
    .replace(/\s*:\s*(?=[.!?]|$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .trim();
}

export function formatPsaMessageRouteDisplay(text: string): PsaMessageRouteDisplay {
  const paths = extractPsaAppPaths(text);
  const navTailMatch = text.trim().match(NAV_TAIL_WITH_PATH_RE);
  const inlineTailCue = navTailMatch ? `${navTailMatch[1].toUpperCase()}:` : null;

  let displayText = text;
  if (navTailMatch) {
    displayText = displayText.replace(NAV_TAIL_WITH_PATH_RE, '').trim();
  }
  displayText = removePathsFromText(displayText, paths);
  displayText = cleanupRoutelessNavigationCopy(displayText);

  const routeLinks: PsaRouteLink[] = paths.map((path) => ({
    path,
    label: 'GO HERE',
  }));

  return { displayText, routeLinks, inlineTailCue };
}
