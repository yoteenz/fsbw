import {
  ADMIN_STUDIO_MODULES,
  filterStudioModulesForPrincipal,
  getStudioNavGroup,
  type AdminStudioModule,
  type StudioNavGroupId,
} from './adminStudioNavigation';
import { ADMIN_STUDIO_BASE_PATH } from './adminStudioRoutes';

export type StudioSearchHit = {
  id: string;
  label: string;
  subtitle: string;
  route: string;
  groupId: StudioNavGroupId;
  score: number;
  module?: AdminStudioModule;
};

/** Extra synonyms so natural queries (e.g. "socials") reach the right studio pages. */
const MODULE_SEARCH_KEYWORDS: Partial<Record<string, readonly string[]>> = {
  'social-accounts': [
    'socials',
    'social media',
    'connect social',
    'oauth',
    'instagram',
    'tiktok',
    'pinterest',
    'facebook',
    'twitter',
    'x api',
    'meta graph',
    'connect accounts',
  ],
  'distribution-network': ['socials', 'social', 'channels', 'publish', 'distribution'],
  'publishing-queue': ['socials', 'social', 'publish', 'queue', 'ship content'],
  'distribution-engine': ['social', 'distribution', 'channels', 'publish'],
  'ndxbook': ['socials', 'social accounts', 'ndxbook social', 'connect social', 'publishing'],
  'knowledge-hub': ['wiki', 'manual', 'documentation', 'help', 'search manual'],
  'memory-bible': ['memory', 'institutional', 'naming bible', 'decision log'],
  'mission-control': ['hq', 'headquarters', 'executive', 'missions'],
  'chief-of-staff': ['approvals', 'briefing', 'founder', 'executive'],
  'executive-timeline': ['calendar', 'timeline', 'schedule', 'events'],
  'asset-library': ['assets', 'media', 'files', 'library'],
  'prompt-library': ['prompts', 'ai prompts', 'templates'],
  'brand-assets': ['photography', 'brand', 'assets', 'bible'],
  'casting': ['talent', 'models', 'casting'],
  'content-packs': ['packs', 'content', 'weekly'],
  'tutorial-os': ['tutorial', 'onboarding', 'walkthrough', 'mansion tour'],
};

const SUB_ROUTE_HITS: readonly Omit<StudioSearchHit, 'score'>[] = [
  {
    id: 'ndxbook-socials-tab',
    label: 'NDXBOOK · CONNECT SOCIALS',
    subtitle: 'OAuth connectors for ndxbook publishing — same tokens as Social Accounts.',
    route: `${ADMIN_STUDIO_BASE_PATH}/ndxbook?tab=socials`,
    groupId: 'distribution',
  },
];

const SUB_ROUTE_KEYWORDS: Record<string, readonly string[]> = {
  'ndxbook-socials-tab': ['ndxbook social', 'ndxbook socials', 'connect ndxbook social'],
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[\s·\-_/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function buildHaystack(parts: Array<string | undefined | readonly string[]>): string {
  return parts
    .flat()
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreHaystack(haystack: string, query: string, tokens: string[], titleBoost = ''): number {
  let score = 0;
  const q = query.toLowerCase();

  if (haystack === q) score += 120;
  if (titleBoost.toLowerCase() === q) score += 100;
  if (haystack.includes(q)) score += 60;

  for (const token of tokens) {
    if (!token) continue;
    if (titleBoost.toLowerCase().includes(token)) score += 18;
    if (haystack.includes(token)) score += 12;
    if (haystack.split(/\s+/).some((word) => word.startsWith(token))) score += 6;
  }

  return score;
}

function moduleHit(mod: AdminStudioModule, score: number): StudioSearchHit {
  return {
    id: mod.id,
    label: mod.title,
    subtitle: mod.purpose,
    route: mod.route,
    groupId: mod.groupId,
    score,
    module: mod,
  };
}

/** Search studio modules and sub-routes — studio pages only, not global admin. */
export function searchStudioModules(query: string, limit = 12): StudioSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tokens = tokenize(q);
  const hits: StudioSearchHit[] = [];

  for (const mod of filterStudioModulesForPrincipal(ADMIN_STUDIO_MODULES)) {
    const group = getStudioNavGroup(mod.groupId);
    const haystack = buildHaystack([
      mod.id.replace(/-/g, ' '),
      mod.title,
      mod.purpose,
      mod.groupId,
      group?.label,
      group?.description,
      MODULE_SEARCH_KEYWORDS[mod.id],
    ]);

    const score = scoreHaystack(haystack, q, tokens, mod.title);
    if (score > 0) hits.push(moduleHit(mod, score));
  }

  for (const entry of SUB_ROUTE_HITS) {
    const haystack = buildHaystack([
      entry.label,
      entry.subtitle,
      entry.id,
      SUB_ROUTE_KEYWORDS[entry.id],
    ]);
    const score = scoreHaystack(haystack, q, tokens, entry.label);
    if (score > 0) hits.push({ ...entry, score });
  }

  const seen = new Set<string>();
  return hits
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .filter((hit) => {
      const key = hit.route;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}
