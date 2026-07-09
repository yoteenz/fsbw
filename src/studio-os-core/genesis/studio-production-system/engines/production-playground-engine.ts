import type { XpsPlaygroundInput, XpsPlaygroundPreview } from '../types';
import { coordinateProduction, evaluatePackageProductionGate } from './production-coordinator';
import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { readStudioProductionSystemStore, writeStudioProductionSystemStore } from '../persistence';

/** Production Playground™ — topic → blueprint + team + workflow + assets + distribution */
export function buildProductionPlaygroundPreview(input: XpsPlaygroundInput): XpsPlaygroundPreview {
  const productionPackage = coordinateProduction(input);
  const blueprint = getNarrativeBlueprint(productionPackage.blueprintId)!;
  const productionGate = evaluatePackageProductionGate(productionPackage);

  const preview: XpsPlaygroundPreview = {
    input,
    blueprint,
    productionTeam: productionPackage.departments,
    departmentWorkflow: productionPackage.timeline,
    virtualSet: productionPackage.virtualSet,
    assetChecklist: productionPackage.assets,
    publishingPlan: productionPackage.publishing,
    productionPackage,
    productionGate,
  };

  writeStudioProductionSystemStore({
    ...readStudioProductionSystemStore(),
    lastPreview: preview,
    playground: input,
  });

  return preview;
}

export function getLastProductionPreview(): XpsPlaygroundPreview | undefined {
  return readStudioProductionSystemStore().lastPreview;
}
