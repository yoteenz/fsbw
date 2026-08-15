import type { ClientNextAction, ClientAttentionItem } from './clientCommandCenterTypes';
import type { RawAttentionCandidate } from './clientAttentionEngine';
import { sortCandidates, suppressOptionalGrowthItems } from './clientAttentionEngine';

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

/**
 * Deterministic next-action selection.
 * Precedence (highest first):
 * 1. Expired critical document
 * 2. Service request blocked by customer info
 * 3. Load delivery / POD action
 * 4. Insurance/registration inside urgent window (≤7 days)
 * 5. Carrier load offer requiring response
 * 6. Factoring package missing item
 * 7. Renewal action
 * 8. Open invoice past due / due soon
 * 9. Unread message requiring response
 * 10. Optional growth (low only)
 */
export function selectNextAction(
  candidates: RawAttentionCandidate[],
  attentionItems: ClientAttentionItem[],
): ClientNextAction | undefined {
  const operational = candidates.filter((c) => c.category !== 'services');
  const filtered = suppressOptionalGrowthItems(candidates, operational.length > 0);
  const sorted = sortCandidates(filtered);
  const top = sorted[0];
  if (!top) return undefined;

  const match = attentionItems.find((a) => a.dedupeKey === top.dedupeKey) ?? top;

  return {
    priority: match.priority,
    title: match.title,
    description: match.explanation,
    category: match.category,
    entityType: match.entityType,
    entityId: match.entityId,
    ctaLabel: match.ctaLabel,
    ctaHref: match.ctaHref,
    reason: top.statusLabel,
    dedupeKey: top.dedupeKey,
  };
}

export function comparePriority(a: string, b: string): number {
  return (PRIORITY_ORDER[a] ?? 0) - (PRIORITY_ORDER[b] ?? 0);
}
