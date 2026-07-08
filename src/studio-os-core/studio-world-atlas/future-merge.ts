import type {
  AtlasParallelFuture,
  FutureMergeRecipe,
  MergeIngredient,
  ParallelFutureArchetype,
  ParallelFutureBuilding,
} from './types';
import { buildParallelFutureRoadPaths } from './parallel-futures';
import { buildFutureGenome } from './future-merge-genome';
import { detectMergeConflicts } from './future-merge-conflicts';
import { synthesizeMergedAnalysis } from './future-merge-analysis';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const MERGED_LETTERS: ParallelFutureArchetype[] = ['future-e', 'future-f', 'future-g'];

/** Default Future Merge™ recipe — best-of-each-future synthesis. */
export function defaultMergeRecipe(futures: AtlasParallelFuture[]): FutureMergeRecipe {
  const byId = Object.fromEntries(futures.map((f) => [f.id, f]));
  const a = futures.find((f) => f.archetype === 'future-a');
  const b = futures.find((f) => f.archetype === 'future-b');
  const c = futures.find((f) => f.archetype === 'future-c');
  const d = futures.find((f) => f.archetype === 'future-d');

  const pickBuilding = (future: AtlasParallelFuture | undefined, match: RegExp) =>
    future?.buildings.find((bld) => match.test(bld.label));

  const ingredients: MergeIngredient[] = [
    {
      kind: 'campus-layout',
      label: 'Campus Layout',
      sourceFutureId: a?.id ?? futures[0]!.id,
      sourceFutureLabel: a?.label ?? 'Future A™',
    },
    {
      kind: 'building',
      label: 'Creative Direction Studio™',
      sourceFutureId: c?.id ?? futures[0]!.id,
      sourceFutureLabel: c?.label ?? 'Future C™',
      buildingId: pickBuilding(c, /Creative|Compact/)?.id,
    },
    {
      kind: 'building',
      label: 'Studio Archives™',
      sourceFutureId: b?.id ?? futures[1]?.id ?? futures[0]!.id,
      sourceFutureLabel: b?.label ?? 'Future B™',
      buildingId: pickBuilding(b, /Archives|Enterprise/)?.id,
    },
    {
      kind: 'building',
      label: 'Marketplace Pavilion™',
      sourceFutureId: d?.id ?? futures[3]?.id ?? futures[0]!.id,
      sourceFutureLabel: d?.label ?? 'Future D™',
      buildingId: pickBuilding(d, /Marketplace|Pavilion/)?.id,
    },
    {
      kind: 'transportation',
      label: 'Transportation Network',
      sourceFutureId: a?.id ?? futures[0]!.id,
      sourceFutureLabel: a?.label ?? 'Future A™',
    },
    {
      kind: 'district',
      label: 'Innovation District',
      sourceFutureId: c?.id ?? futures[0]!.id,
      sourceFutureLabel: c?.label ?? 'Future C™',
      buildingId: pickBuilding(c, /Innovation|Prototype|Compact/)?.id,
    },
    {
      kind: 'building',
      label: 'Customer Experience HQ',
      sourceFutureId: b?.id ?? futures[1]?.id ?? futures[0]!.id,
      sourceFutureLabel: b?.label ?? 'Future B™',
      buildingId: pickBuilding(b, /Training|Experience|Enterprise/)?.id,
    },
    {
      kind: 'budget-strategy',
      label: 'Budget Strategy',
      sourceFutureId: d?.id ?? futures[3]?.id ?? futures[0]!.id,
      sourceFutureLabel: d?.label ?? 'Future D™',
    },
  ];

  void byId;
  return {
    id: uid('merge-recipe'),
    ingredients,
    createdAt: new Date().toISOString(),
    createdBy: 'Founder',
  };
}

export function nextMergedFutureArchetype(existing: AtlasParallelFuture[]): ParallelFutureArchetype {
  const used = new Set(existing.filter((f) => f.isMerged).map((f) => f.archetype));
  return MERGED_LETTERS.find((l) => !used.has(l)) ?? 'future-g';
}

export function mergedFutureTagline(archetype: ParallelFutureArchetype): string {
  const map: Record<string, string> = {
    'future-e': 'Future E™',
    'future-f': 'Future F™',
    'future-g': 'Future G™',
  };
  return map[archetype] ?? 'Merged Future™';
}

function collectBuildingsFromRecipe(
  recipe: FutureMergeRecipe,
  futures: AtlasParallelFuture[]
): ParallelFutureBuilding[] {
  const byId = Object.fromEntries(futures.map((f) => [f.id, f]));
  const buildings: ParallelFutureBuilding[] = [];
  const seen = new Set<string>();

  for (const ing of recipe.ingredients) {
    const source = byId[ing.sourceFutureId];
    if (!source) continue;

    if (ing.kind === 'campus-layout') {
      for (const b of source.buildings) {
        if (!seen.has(b.id)) {
          buildings.push({ ...b, id: `${b.id}-merged` });
          seen.add(b.id);
        }
      }
      continue;
    }

    if (ing.buildingId) {
      const b = source.buildings.find((x) => x.id === ing.buildingId);
      if (b && !seen.has(b.id)) {
        buildings.push({ ...b, id: `${b.id}-from-${source.archetype}`, label: ing.label });
        seen.add(b.id);
      }
      continue;
    }

    if (ing.kind === 'district' || ing.kind === 'department') {
      const b = source.buildings.find((x) => ing.label.toLowerCase().includes(x.department.toLowerCase()));
      if (b && !seen.has(b.id)) {
        buildings.push({ ...b, id: `${b.id}-district`, label: ing.label });
        seen.add(b.id);
      }
    }
  }

  if (buildings.length === 0) {
    return futures[0]?.buildings.map((b) => ({ ...b, id: `${b.id}-fallback` })) ?? [];
  }

  return buildings;
}

/** Intelligently synthesize a new future from merge ingredients. */
export function executeFutureMerge(
  recipe: FutureMergeRecipe,
  futures: AtlasParallelFuture[],
  existingFutures: AtlasParallelFuture[]
): { future: AtlasParallelFuture; conflicts: ReturnType<typeof detectMergeConflicts> } {
  const sourceIds = [...new Set(recipe.ingredients.map((i) => i.sourceFutureId))];
  const sources = futures.filter((f) => sourceIds.includes(f.id));
  const archetype = nextMergedFutureArchetype(existingFutures);
  const tagline = mergedFutureTagline(archetype);
  const buildings = collectBuildingsFromRecipe(recipe, futures);
  const roads = sources.flatMap((s) => s.roads).slice(0, 4);
  const analysis = synthesizeMergedAnalysis(sources, recipe);
  const now = new Date().toISOString();

  const draft: AtlasParallelFuture = {
    id: uid('pf-merged'),
    archetype,
    label: `Synthesized ${tagline}`,
    tagline,
    strategy: `Future Merge™ — ${recipe.ingredients.length} ingredients from ${sources.map((s) => s.tagline).join(' + ')}`,
    createdAt: now,
    updatedAt: now,
    version: 1,
    status: 'draft',
    isMerged: true,
    mergeSourceIds: sourceIds,
    mergeRecipe: recipe,
    buildings,
    roads,
    departments: [...new Set(buildings.map((b) => b.department))],
    expansionStrategy: sources.map((s) => s.expansionStrategy).join(' · '),
    constructionPhases: sources[0]?.constructionPhases ?? [],
    analysis,
    genome: buildFutureGenome(analysis, sources),
  };

  const conflicts = detectMergeConflicts(draft, sources);
  return { future: draft, conflicts };
}

export function moveMergedBuilding(
  future: AtlasParallelFuture,
  buildingId: string,
  mapX: number,
  mapY: number
): AtlasParallelFuture {
  return {
    ...future,
    buildings: future.buildings.map((b) =>
      b.id === buildingId ? { ...b, mapX, mapY } : b
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function buildMergeLabRoadPaths(
  futures: AtlasParallelFuture[],
  anchor: { mapX: number; mapY: number }
): string[] {
  return futures.flatMap((f) => buildParallelFutureRoadPaths(f, anchor)).slice(0, 12);
}
