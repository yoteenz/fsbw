import type { XniNarrativeBlueprint } from '../types';
import { ensureProductionGenomeForBrand } from './production-genome-registry';

export type XniCommercialStructure = {
  structureId: string;
  blueprintId: string;
  scriptBeats: { beatId: string; durationSec: number; line: string; visual: string }[];
  totalDurationSec: number;
};

/** Commercial Generator™ — :15/:30 script beats from blueprint */
export function generateCommercialStructure(blueprint: XniNarrativeBlueprint): XniCommercialStructure {
  const genome = ensureProductionGenomeForBrand(blueprint.brandId as import('../constants').XniDemoBrandId);
  const beats = [
    { beatId: 'b1', durationSec: 3, line: blueprint.hook, visual: genome.intro },
    { beatId: 'b2', durationSec: 8, line: blueprint.opening, visual: blueprint.environment },
    { beatId: 'b3', durationSec: 10, line: blueprint.scenes.find((s) => s.arcStage === 'Proof')?.title ?? 'Proof moment', visual: genome.visualLanguage },
    { beatId: 'b4', durationSec: 5, line: blueprint.cta, visual: genome.outro },
  ];
  return {
    structureId: `comm-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    scriptBeats: beats,
    totalDurationSec: beats.reduce((n, b) => n + b.durationSec, 0),
  };
}
