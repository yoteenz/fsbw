import type {
  ConceptMergeIngredient,
  ConceptMergeRecipe,
  CreativeConceptFuture,
} from './creative-pipeline-types';
import { synthesizeMergedConceptAnalysis } from './creative-concepts';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Default merge recipe — best-of-each-concept synthesis. */
export function defaultConceptMergeRecipe(concepts: CreativeConceptFuture[]): ConceptMergeRecipe {
  const byArchetype = (archetype: CreativeConceptFuture['archetype']) =>
    concepts.find((c) => c.archetype === archetype);

  const a = byArchetype('luxury-editorial') ?? concepts[0]!;
  const b = byArchetype('apple-minimal') ?? concepts[1] ?? concepts[0]!;
  const c = byArchetype('futuristic-luxury') ?? concepts[2] ?? concepts[0]!;
  const d = byArchetype('modern-penthouse') ?? concepts[3] ?? concepts[0]!;

  const ingredients: ConceptMergeIngredient[] = [
    { kind: 'lighting', label: 'Lighting', sourceConceptId: b.id, sourceConceptLabel: b.tagline },
    { kind: 'architecture', label: 'Architecture', sourceConceptId: a.id, sourceConceptLabel: a.tagline },
    { kind: 'furniture', label: 'Furniture', sourceConceptId: c.id, sourceConceptLabel: c.tagline },
    { kind: 'atmosphere', label: 'Atmosphere', sourceConceptId: d.id, sourceConceptLabel: d.tagline },
    { kind: 'hero-landmark', label: 'Hero Landmark', sourceConceptId: a.id, sourceConceptLabel: a.tagline },
    { kind: 'motion-language', label: 'Motion Language', sourceConceptId: c.id, sourceConceptLabel: c.tagline },
  ];

  return {
    id: uid('concept-merge'),
    ingredients,
    createdAt: new Date().toISOString(),
    createdBy: 'Founder',
  };
}

function pickField(
  concepts: CreativeConceptFuture[],
  ingredient: ConceptMergeIngredient | undefined,
  field: keyof CreativeConceptFuture
): string {
  if (!ingredient) return '';
  const source = concepts.find((c) => c.id === ingredient.sourceConceptId);
  const val = source?.[field];
  return typeof val === 'string' ? val : '';
}

/** Synthesize a new master concept from merged ingredients. */
export function executeConceptMerge(
  recipe: ConceptMergeRecipe,
  concepts: CreativeConceptFuture[]
): CreativeConceptFuture {
  const sourceIds = [...new Set(recipe.ingredients.map((i) => i.sourceConceptId))];
  const sources = concepts.filter((c) => sourceIds.includes(c.id));
  const now = new Date().toISOString();
  const mergedCount = concepts.filter((c) => c.isMerged).length;

  const draft: CreativeConceptFuture = {
    id: uid('concept-merged'),
    archetype: 'merged-concept',
    label: `Synthesized Master Concept ${mergedCount + 1}`,
    tagline: `Merged ${String.fromCharCode(71 + mergedCount)}™`,
    mood: 'Future Merge™ synthesis — strongest elements combined',
    completeSceneStack: true,
    environment:
      pickField(concepts, recipe.ingredients.find((i) => i.kind === 'architecture'), 'environment') ||
      sources[0]?.environment ||
      'Merged shell',
    lighting:
      pickField(concepts, recipe.ingredients.find((i) => i.kind === 'lighting'), 'lighting') ||
      sources[0]?.lighting ||
      'Merged lighting',
    materials: sources.map((s) => s.materials).join(' · ').slice(0, 120),
    architecture: pickField(concepts, recipe.ingredients.find((i) => i.kind === 'architecture'), 'architecture'),
    furniture: pickField(concepts, recipe.ingredients.find((i) => i.kind === 'furniture'), 'furniture'),
    heroObjects: pickField(concepts, recipe.ingredients.find((i) => i.kind === 'hero-landmark'), 'heroObjects'),
    atmosphere: pickField(concepts, recipe.ingredients.find((i) => i.kind === 'atmosphere'), 'atmosphere'),
    motionLanguage: pickField(
      concepts,
      recipe.ingredients.find((i) => i.kind === 'motion-language'),
      'motionLanguage'
    ),
    colorDirection: sources.map((s) => s.colorDirection).join(' + ').slice(0, 80),
    analysis: synthesizeMergedConceptAnalysis(sources),
    isMerged: true,
    mergeSourceIds: sourceIds,
    createdAt: now,
    updatedAt: now,
  };

  return draft;
}
