import {
  XNI_DEMO_BRAND_IDS,
  XNI_ROOM_PATHS,
  type XniRoomPath,
} from '../constants';
import { readNarrativeIntelligenceStore } from '../persistence';
import { listProductionGenomes, getProductionGenomeForBrand } from '../engines/production-genome-registry';
import { listNarrativeBlueprints } from '../engines/narrative-blueprint-generator';
import { listNarrativeConsumerBindings } from '../engines/narrative-consumer-engine';
import { getLastPlaygroundPreview } from '../engines/narrative-playground-engine';
import type { XniReadyView, XniRuntimeInput } from '../types';

export function isValidXniRoomPath(slug: string): slug is XniRoomPath {
  return (XNI_ROOM_PATHS as readonly string[]).includes(slug);
}

export function xniRoomPathFromSlug(slug?: string): XniRoomPath {
  if (slug && isValidXniRoomPath(slug)) return slug;
  return 'narrative-intelligence';
}

export function buildXniOrbNote(): string {
  return 'Narrative Intelligence™ — Studio OS reasons like an Executive Creative Director. No asset is created until a Narrative Blueprint™ is approved.';
}

export function buildNarrativeIntelligenceReadyView(input?: XniRuntimeInput): XniReadyView {
  const store = readNarrativeIntelligenceStore();
  const activeRoom = xniRoomPathFromSlug(input?.pathname?.split('/').pop());
  const playground = input?.playground ? { ...store.playground, ...input.playground } : store.playground;
  const brandId = input?.brandId ?? playground.brandId;

  const productionGenomes = listProductionGenomes();
  const activeProductionGenome = getProductionGenomeForBrand(brandId);
  const blueprints = listNarrativeBlueprints();
  const approvedBlueprints = blueprints.filter((b) => b.status === 'approved');
  const preview = store.lastPreview ?? getLastPlaygroundPreview();
  const activeBlueprint = preview?.blueprint;

  return {
    activeRoom,
    activeBrandId: brandId,
    productionGenomes,
    activeProductionGenome,
    blueprints,
    approvedBlueprints,
    playground,
    preview,
    consumerBindings: listNarrativeConsumerBindings(activeBlueprint),
    demoBrandIds: [...XNI_DEMO_BRAND_IDS],
    orbNote: buildXniOrbNote(),
    constitutionLocked: store.constitutionLocked,
  };
}
