import type {
  AtlasParallelFuture,
  FutureMergeRecipe,
  MergeConflict,
  MergeHistoryEntry,
} from './types';

function uid(): string {
  return `merge-hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function buildMergeHistoryEntry(
  future: AtlasParallelFuture,
  recipe: FutureMergeRecipe,
  sources: AtlasParallelFuture[],
  conflicts: MergeConflict[]
): MergeHistoryEntry {
  const sourceLabels = sources.map((s) => s.tagline);
  const replaySteps = [
    ...sources.map((s) => s.tagline),
    '↓',
    `MERGE (${recipe.ingredients.length} ingredients)`,
    '↓',
    future.tagline,
    ...recipe.ingredients.map((i) => `${i.label} ← ${i.sourceFutureLabel}`),
  ];

  return {
    id: uid(),
    mergedAt: new Date().toISOString(),
    resultFutureId: future.id,
    resultLabel: future.label,
    sourceFutureIds: sources.map((s) => s.id),
    sourceLabels,
    recipe,
    conflictsDetected: conflicts.length,
    conflictsResolved: conflicts.filter((c) => c.resolved).length,
    author: recipe.createdBy,
    replaySteps,
  };
}

export function formatMergeReplay(entry: MergeHistoryEntry): string {
  return entry.replaySteps.join('\n');
}
