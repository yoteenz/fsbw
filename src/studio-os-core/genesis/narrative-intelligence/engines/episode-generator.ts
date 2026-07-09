import type { XniEpisodeStructure, XniNarrativeBlueprint } from '../types';
import { ensureProductionGenomeForBrand } from './production-genome-registry';

/** Episode Generator™ — act structure from approved narrative blueprint */
export function generateEpisodeStructure(blueprint: XniNarrativeBlueprint): XniEpisodeStructure {
  const genome = ensureProductionGenomeForBrand(blueprint.brandId as import('../constants').XniDemoBrandId);
  const rhythm = genome.episodeRhythm.split('→').map((s) => s.trim());

  return {
    structureId: `ep-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    title: blueprint.topic,
    acts: [
      { actId: 'act-1', label: 'Arrival', beats: [blueprint.hook, blueprint.opening] },
      { actId: 'act-2', label: 'Development', beats: blueprint.scenes.slice(1, 4).map((s) => s.title) },
      { actId: 'act-3', label: 'Proof & Close', beats: [...blueprint.scenes.slice(4).map((s) => s.title), blueprint.cta] },
    ],
    estimatedRuntimeMin: blueprint.narrativeType === 'commercial' ? 1 : 6,
    rhythmNotes: rhythm.join(' · ') || genome.episodeRhythm,
  };
}
