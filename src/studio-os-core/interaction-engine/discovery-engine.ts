import { getAllInteractionPatterns } from './registration';
import type { InteractionSearchHit } from './types';

/** Search interaction patterns by name, type, trigger, or consumer. */
export function queryInteractionPatterns(query: string, limit = 12): InteractionSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const patterns = getAllInteractionPatterns();
  const hits: InteractionSearchHit[] = [];

  for (const entry of patterns) {
    const blob = `${entry.name} ${entry.patternId} ${entry.type} ${entry.trigger} ${entry.behavior} ${entry.feedback} ${entry.consumedBy.join(' ')}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.patternId.includes(term)) score += 12;
      if (entry.type.includes(term)) {
        score += 10;
        reason = 'type';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainInteractionPattern(patternId: string): string | null {
  const entry = getAllInteractionPatterns().find((p) => p.patternId === patternId);
  if (!entry) return null;
  return `${entry.name} (${entry.type}) — ${entry.behavior} Feedback: ${entry.feedback}. Used by: ${entry.consumedBy.slice(0, 3).join(', ') || 'platform'}.`;
}
