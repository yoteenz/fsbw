import type { XniNarrativeBlueprint } from '../types';

export type XniCampaignStructure = {
  structureId: string;
  blueprintId: string;
  phases: { phaseId: string; label: string; channels: string[]; beats: string[] }[];
};

/** Campaign Generator™ — multi-channel campaign arc from blueprint */
export function generateCampaignStructure(blueprint: XniNarrativeBlueprint): XniCampaignStructure {
  return {
    structureId: `camp-${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    phases: [
      {
        phaseId: 'tease',
        label: 'Tease',
        channels: ['social', 'email'],
        beats: [blueprint.hook, 'Mystery asset · department color teaser'],
      },
      {
        phaseId: 'reveal',
        label: 'Reveal',
        channels: ['headquarters', 'social'],
        beats: [blueprint.opening, ...blueprint.scenes.slice(0, 2).map((s) => s.title)],
      },
      {
        phaseId: 'proof',
        label: 'Proof',
        channels: blueprint.distributionPlan.map((d) => d.channelId),
        beats: blueprint.scenes.filter((s) => s.arcStage === 'Proof').map((s) => s.title),
      },
      {
        phaseId: 'convert',
        label: 'Convert',
        channels: ['headquarters', 'email'],
        beats: [blueprint.cta, ...blueprint.repurposingPlan.map((r) => r.targetFormat)],
      },
    ],
  };
}
