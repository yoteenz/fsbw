import { getAllAutomations } from './registration';
import type { AutomationSearchHit } from './types';

/** Search automations by name, category, trigger, owner, or department. */
export function queryAutomationRegistry(query: string, limit = 12): AutomationSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  const automations = getAllAutomations();
  const hits: AutomationSearchHit[] = [];

  for (const entry of automations) {
    const blob = `${entry.name} ${entry.automationId} ${entry.category} ${entry.description} ${entry.owner} ${entry.department} ${entry.trigger} ${entry.actions.join(' ')}`.toLowerCase();
    let score = 0;
    let reason = 'keyword';
    for (const term of terms) {
      if (entry.automationId.includes(term)) score += 12;
      if (entry.category.includes(term)) {
        score += 10;
        reason = 'category';
      }
      if (entry.status.includes(term)) {
        score += 9;
        reason = 'status';
      }
      if (entry.name.toLowerCase().includes(term)) score += 8;
      if (blob.includes(term)) score += 5;
    }
    if (score > 0) hits.push({ entry, score, matchReason: reason });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainAutomation(automationId: string): string | null {
  const entry = getAllAutomations().find((a) => a.automationId === automationId);
  if (!entry) return null;
  return `${entry.name} (${entry.category}) — ${entry.description} Owner: ${entry.owner}. Trigger: ${entry.trigger}. Success: ${entry.successRatePct}%. Status: ${entry.status}.`;
}
