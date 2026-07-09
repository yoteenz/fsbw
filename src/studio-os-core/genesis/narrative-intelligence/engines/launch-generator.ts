import type { XniNarrativeBlueprint } from '../types';

export type XniLaunchStructure = {
  structureId: string;
  blueprintId: string;
  timeline: { dayOffset: number; milestone: string; assets: string[] }[];
};

/** Launch Generator™ — launch timeline from blueprint */
export function generateLaunchStructure(blueprint: XniNarrativeBlueprint): XniLaunchStructure {
  return {
    structureId: `launch-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    timeline: [
      { dayOffset: -7, milestone: 'Internal brief', assets: ['Draft blueprint', 'Production genome lock'] },
      { dayOffset: -3, milestone: 'Founder approval gate', assets: ['Approved Narrative Blueprint™'] },
      { dayOffset: 0, milestone: 'Launch day', assets: blueprint.requiredAssets },
      { dayOffset: 1, milestone: 'Repurpose wave', assets: blueprint.repurposingPlan.map((r) => r.targetFormat) },
      { dayOffset: 7, milestone: 'Measure', assets: blueprint.successMetrics.map((m) => m.label) },
    ],
  };
}
