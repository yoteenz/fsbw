import { getAllPrompts } from './registration';
import type { PromptSearchHit } from './types';

/** Search prompts by name, category, feature, owner, or purpose. */
export function queryPromptRegistry(query: string, limit = 12): PromptSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const prompts = getAllPrompts();
  const hits: PromptSearchHit[] = [];

  for (const entry of prompts) {
    const blob = `${entry.name} ${entry.promptId} ${entry.category} ${entry.description} ${entry.purpose} ${entry.owner} ${entry.department} ${entry.associatedFeature} ${entry.promptType}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.promptId.includes(term)) score += 12;
      if (entry.category.includes(term)) {
        score += 10;
        reason = 'category';
      }
      if (entry.associatedFeature.includes(term)) {
        score += 10;
        reason = 'feature';
      }
      if (entry.promptType.includes(term)) {
        score += 9;
        reason = 'type';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainPrompt(promptId: string): string | null {
  const entry = getAllPrompts().find((p) => p.promptId === promptId);
  if (!entry) return null;
  return `${entry.name} (${entry.promptType}) — ${entry.description} Owner: ${entry.owner}. Purpose: ${entry.purpose}. Quality: ${entry.qualityScorePct}%. Status: ${entry.status}. Version: ${entry.version}.`;
}
