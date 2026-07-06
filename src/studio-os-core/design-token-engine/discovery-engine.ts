import { getAllDesignTokens } from './registration';
import type { DesignTokenSearchHit } from './types';

/** Search design tokens by name, category, value, or consumer. */
export function queryDesignTokens(query: string, limit = 12): DesignTokenSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const tokens = getAllDesignTokens();
  const hits: DesignTokenSearchHit[] = [];

  for (const entry of tokens) {
    const blob = `${entry.name} ${entry.tokenId} ${entry.category} ${entry.value} ${entry.description} ${entry.consumedBy.join(' ')}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.tokenId.includes(term)) score += 12;
      if (entry.category.includes(term)) {
        score += 10;
        reason = 'category';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainDesignToken(tokenId: string): string | null {
  const entry = getAllDesignTokens().find((t) => t.tokenId === tokenId);
  if (!entry) return null;
  return `${entry.name} (${entry.category}) = ${entry.value}. Source: ${entry.source}. Used by: ${entry.consumedBy.slice(0, 3).join(', ') || 'platform'}.`;
}
