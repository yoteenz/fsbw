import {
  buildLoungeTvSearchIndex,
  type LoungeTvSearchIndexEntry,
} from './loungeTvSearchIndex';

export type LoungeTvSearchHit = LoungeTvSearchIndexEntry & {
  score: number;
};

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function queryTokens(query: string): string[] {
  const norm = normalizeQuery(query);
  if (!norm) return [];
  return norm.split(' ').filter((t) => t.length >= 1);
}

function scoreEntry(entry: LoungeTvSearchIndexEntry, query: string, tokens: string[]): number {
  if (!tokens.length) return 0;

  const qNorm = normalizeQuery(query);
  let score = 0;

  if (entry.titleNorm === qNorm) score += 120;
  else if (entry.titleNorm.startsWith(qNorm)) score += 70;
  else if (qNorm.length >= 3 && entry.titleNorm.includes(qNorm)) score += 45;

  const titleTokens = entry.titleNorm.split(' ').filter(Boolean);
  const allTokensInTitle = tokens.every((t) => titleTokens.some((tt) => tt.includes(t) || t.includes(tt)));
  if (allTokensInTitle) score += 35;

  for (const token of tokens) {
    if (token.length < 2) continue;
    if (entry.titleNorm.includes(token)) score += 22;
    if (entry.haystack.includes(token)) score += 8;
  }

  // Prefer exact word matches in haystack
  for (const token of tokens) {
    if (token.length < 3) continue;
    const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (re.test(entry.haystack)) score += 6;
  }

  return score;
}

/** Search entire lounge catalog — content packs, tips, care, PSA, masteries, seasons, topics. */
export function searchLoungeTvContent(query: string, limit = 48): LoungeTvSearchHit[] {
  const tokens = queryTokens(query);
  if (!tokens.length) return [];

  const index = buildLoungeTvSearchIndex();
  const hits: LoungeTvSearchHit[] = [];

  for (const entry of index) {
    const score = scoreEntry(entry, query, tokens);
    if (score <= 0) continue;
    hits.push({ ...entry, score });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });

  return hits.slice(0, limit);
}
