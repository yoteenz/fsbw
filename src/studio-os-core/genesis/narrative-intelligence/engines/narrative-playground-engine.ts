import type { XniPlaygroundInput, XniPlaygroundPreview } from '../types';
import { generateNarrativeBlueprint, saveNarrativeBlueprint } from './narrative-blueprint-generator';
import { ensureProductionGenomeForBrand } from './production-genome-registry';
import { evaluateProductionGate } from './production-gate';
import { generateEpisodeStructure } from './episode-generator';
import {
  buildHeadquartersEnvironment,
  buildSceneFlow,
  reasonAboutNarrative,
} from './narrative-intelligence-engine';
import { readNarrativeIntelligenceStore, writeNarrativeIntelligenceStore } from '../persistence';

/** Narrative Intelligence Playground™ — instant preview from topic */
export function buildNarrativePlaygroundPreview(input: XniPlaygroundInput): XniPlaygroundPreview {
  const blueprint = generateNarrativeBlueprint(input);
  saveNarrativeBlueprint(blueprint);

  const productionGenome = ensureProductionGenomeForBrand(input.brandId);
  const episodeStructure = generateEpisodeStructure(blueprint);
  const sceneFlow = buildSceneFlow(blueprint);
  const headquartersEnvironment = buildHeadquartersEnvironment(blueprint);
  const reasoning = reasonAboutNarrative(blueprint);

  const preview: XniPlaygroundPreview = {
    topic: input.topic,
    brandId: input.brandId,
    companyId: input.companyId,
    narrativeType: input.narrativeType,
    blueprint,
    episodeStructure,
    sceneFlow,
    productionGenome,
    headquartersEnvironment,
    requiredAssets: blueprint.requiredAssets,
    distributionPlan: blueprint.distributionPlan,
    productionGate: evaluateProductionGate(blueprint),
  };

  writeNarrativeIntelligenceStore({
    ...readNarrativeIntelligenceStore(),
    lastPreview: preview,
    playground: input,
  });

  void reasoning;
  return preview;
}

export function getLastPlaygroundPreview(): XniPlaygroundPreview | undefined {
  return readNarrativeIntelligenceStore().lastPreview;
}
