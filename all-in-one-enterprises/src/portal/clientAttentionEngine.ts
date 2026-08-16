import type {
  ActionPriority,
  AttentionCategory,
  ClientAttentionItem,
} from './clientCommandCenterTypes';

export interface RawAttentionCandidate {
  dedupeKey: string;
  category: AttentionCategory;
  priority: ActionPriority;
  title: string;
  explanation: string;
  statusLabel: string;
  deadline?: string;
  deadlineLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  affectedAreas?: string[];
  entityType?: string;
  entityId?: string;
  sortScore: number;
}

const PRIORITY_WEIGHT: Record<ActionPriority, number> = {
  urgent: 400,
  high: 300,
  normal: 200,
  low: 100,
};

/** Deduplicate by dedupeKey; merge affected areas when the same underlying issue appears in multiple domains. */
export function aggregateAttentionItems(candidates: RawAttentionCandidate[]): ClientAttentionItem[] {
  const byKey = new Map<string, ClientAttentionItem>();

  for (const c of candidates) {
    const existing = byKey.get(c.dedupeKey);
    if (!existing) {
      byKey.set(c.dedupeKey, {
        id: c.dedupeKey,
        dedupeKey: c.dedupeKey,
        category: c.category,
        priority: c.priority,
        title: c.title,
        explanation: c.explanation,
        statusLabel: c.statusLabel,
        deadline: c.deadline,
        deadlineLabel: c.deadlineLabel,
        ctaLabel: c.ctaLabel,
        ctaHref: c.ctaHref,
        affectedAreas: c.affectedAreas ?? [],
        entityType: c.entityType,
        entityId: c.entityId,
      });
      continue;
    }

    const mergedAreas = new Set([...existing.affectedAreas, ...(c.affectedAreas ?? [])]);
    existing.affectedAreas = [...mergedAreas];
    if (PRIORITY_WEIGHT[c.priority] > PRIORITY_WEIGHT[existing.priority]) {
      existing.priority = c.priority;
      existing.title = c.title;
      existing.explanation = c.explanation;
      existing.ctaLabel = c.ctaLabel;
      existing.ctaHref = c.ctaHref;
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const scoreA = PRIORITY_WEIGHT[a.priority] + (a.deadline ? daysUntil(a.deadline) * -1 : 0);
    const scoreB = PRIORITY_WEIGHT[b.priority] + (b.deadline ? daysUntil(b.deadline) * -1 : 0);
    return scoreB - scoreA;
  });
}

function daysUntil(isoDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const ms = new Date(isoDate.slice(0, 10)).getTime() - new Date(today).getTime();
  return Math.floor(ms / 86400000);
}

export function sortCandidates(candidates: RawAttentionCandidate[]): RawAttentionCandidate[] {
  return [...candidates].sort((a, b) => {
    const scoreA = a.sortScore + PRIORITY_WEIGHT[a.priority];
    const scoreB = b.sortScore + PRIORITY_WEIGHT[b.priority];
    return scoreB - scoreA;
  });
}

/** Growth/optional recommendations must not outrank operational items — filter to low priority only. */
export function suppressOptionalGrowthItems(
  candidates: RawAttentionCandidate[],
  hasOperationalItems: boolean,
): RawAttentionCandidate[] {
  if (!hasOperationalItems) return candidates;
  return candidates.filter((c) => c.category !== 'services');
}
