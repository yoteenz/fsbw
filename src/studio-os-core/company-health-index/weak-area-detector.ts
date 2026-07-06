import type { CategoryHealthScore, WeakAreaAlert } from './types';
import { CRITICAL_AREA_THRESHOLD, WEAK_AREA_THRESHOLD } from './constants';

export function detectWeakAreas(categories: CategoryHealthScore[]): WeakAreaAlert[] {
  return categories
    .filter((c) => c.scorePct < WEAK_AREA_THRESHOLD)
    .map((c) => ({
      id: `weak-${c.id}`,
      categoryId: c.id,
      label: c.label,
      scorePct: c.scorePct,
      severity:
        c.scorePct < CRITICAL_AREA_THRESHOLD ? ('critical' as const) : ('at-risk' as const),
      proactiveAction: c.recommendation,
    }))
    .sort((a, b) => a.scorePct - b.scorePct);
}

export function buildProactivePriorities(
  categories: CategoryHealthScore[],
  weakAreas: WeakAreaAlert[]
): string[] {
  const priorities: string[] = [];

  for (const weak of weakAreas.slice(0, 3)) {
    priorities.push(`${weak.label}: ${weak.proactiveAction}`);
  }

  const watch = categories.filter((c) => c.status === 'watch').slice(0, 2);
  for (const w of watch) {
    if (priorities.length >= 5) break;
    priorities.push(`Watch ${w.label} (${w.scorePct}%) — ${w.recommendation.slice(0, 80)}`);
  }

  if (priorities.length === 0) {
    priorities.push(
      'All major health categories above threshold — maintain proactive reviews.',
      'Continue compounding Memory Engine lessons into Studio Institute training.'
    );
  }

  return priorities.slice(0, 5);
}
