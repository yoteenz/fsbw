import type { XniNarrativeBlueprint, XniSceneFlow, XniHeadquartersEnvironment } from '../types';
import { generateEpisodeStructure } from './episode-generator';
import { generateCampaignStructure } from './campaign-generator';
import { generateCourseStructure } from './course-generator';
import { generateLaunchStructure } from './launch-generator';
import { generateCommercialStructure } from './commercial-generator';
import { ensureProductionGenomeForBrand } from './production-genome-registry';
import type { XniDemoBrandId } from '../constants';

/** Narrative Intelligence Engine™ — executive creative reasoning orchestrator */
export function reasonAboutNarrative(blueprint: XniNarrativeBlueprint): {
  summary: string;
  creativeDirection: string;
  risks: string[];
  typeSpecificStructure: unknown;
} {
  const genome = ensureProductionGenomeForBrand(blueprint.brandId as XniDemoBrandId);
  let typeSpecificStructure: unknown;

  switch (blueprint.narrativeType) {
    case 'episode':
    case 'experience':
    case 'headquarters-film':
      typeSpecificStructure = generateEpisodeStructure(blueprint);
      break;
    case 'campaign':
      typeSpecificStructure = generateCampaignStructure(blueprint);
      break;
    case 'course':
      typeSpecificStructure = generateCourseStructure(blueprint);
      break;
    case 'launch':
      typeSpecificStructure = generateLaunchStructure(blueprint);
      break;
    case 'commercial':
      typeSpecificStructure = generateCommercialStructure(blueprint);
      break;
    default:
      typeSpecificStructure = generateEpisodeStructure(blueprint);
  }

  return {
    summary: `Executive Creative Director reasoning for "${blueprint.topic}" — ${blueprint.narrativeType} narrative aligned to ${genome.brandDnaRef}.`,
    creativeDirection: `${blueprint.desiredEmotion} · ${genome.visualLanguage} · ${genome.presenterStyle}`,
    risks: [
      blueprint.status !== 'approved' ? 'Production gate closed until blueprint approval' : 'Production gate open',
      'Single primary CTA required per viewport',
      'Orb must speak with evidence, not hype',
    ],
    typeSpecificStructure,
  };
}

export function buildSceneFlow(blueprint: XniNarrativeBlueprint): XniSceneFlow {
  return {
    flowId: `flow-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    moments: blueprint.scenes.map((scene, i) => ({
      momentId: scene.sceneId,
      label: scene.title,
      arcStage: scene.arcStage,
      transition: i === 0 ? 'Fade from intro' : `${blueprint.motion} · cut on beat`,
    })),
  };
}

export function buildHeadquartersEnvironment(blueprint: XniNarrativeBlueprint): XniHeadquartersEnvironment {
  const genome = ensureProductionGenomeForBrand(blueprint.brandId as XniDemoBrandId);
  return {
    environmentId: `hq-env-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    room: blueprint.headquartersRoom,
    atmosphere: blueprint.desiredEmotion,
    lightingWash: blueprint.lighting,
    focalObject: blueprint.requiredAssets[0] ?? 'Proof object',
    orbPlacement: genome.orbBehavior,
  };
}
