/**
 * Chain Reactions™ — one meaningful event, multiple architectural consequences.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type { LivingArchitectureSnapshot } from '../living-architecture/types';
import type { ChainReaction, EcologyInputSignals, WorldHealthMetric } from './types';
import { metricById } from './world-health';

type ReactionTemplate = {
  id: string;
  test: (health: WorldHealthMetric[], signals: EcologyInputSignals, arch: LivingArchitectureSnapshot) => boolean;
  trigger: string;
  sourceDistrict: DistrictThemeId;
  sourceEvent: string;
  consequences: Array<{
    districtId: DistrictThemeId;
    architecturalChange: string;
    causedBy: string;
  }>;
};

const REACTION_TEMPLATES: ReactionTemplate[] = [
  {
    id: 'cr-blueprint-surge',
    test: (h, s) => s.campusKnowledgeTriggers >= 2 && (metricById(h, 'knowledge-flow')?.value ?? 0) >= 45,
    trigger: 'Blueprint publishing surge',
    sourceDistrict: 'knowledge-library',
    sourceEvent: 'Multiple Blueprints™ published and institutionalized',
    consequences: [
      {
        districtId: 'innovation-district',
        architecturalChange: 'New Innovation Lab commissioned — experimental tower rises',
        causedBy: 'Knowledge output crossed activation threshold',
      },
      {
        districtId: 'marketplace',
        architecturalChange: 'Premium showcase room unlocks — innovations ready for exhibition',
        causedBy: 'Blueprint lineage creates marketplace-ready assets',
      },
      {
        districtId: 'museum',
        architecturalChange: 'Historic timeline wing extended — breakthroughs preserved',
        causedBy: 'Knowledge milestones become company memory',
      },
      {
        districtId: 'warehouse',
        architecturalChange: 'Production bays expand — asset generation capacity increases',
        causedBy: 'Blueprint dependencies require new production output',
      },
      {
        districtId: 'atlas',
        architecturalChange: 'Atlas points of interest updated — Knowledge Library highlighted',
        causedBy: 'Campus intelligence detects knowledge cluster growth',
      },
    ],
  },
  {
    id: 'cr-marketplace-milestone',
    test: (h) => (metricById(h, 'marketplace-energy')?.value ?? 0) >= 55,
    trigger: 'Marketplace momentum threshold',
    sourceDistrict: 'marketplace',
    sourceEvent: 'Marketplace influence crosses architectural activation',
    consequences: [
      {
        districtId: 'marketplace',
        architecturalChange: 'Marketplace Pavilion expands — premium showcase halls open',
        causedBy: 'Sustained marketplace success',
      },
      {
        districtId: 'innovation-district',
        architecturalChange: 'Innovation laboratory commissioned — prototype space grows',
        causedBy: 'Commerce funds experimental infrastructure',
      },
      {
        districtId: 'museum',
        architecturalChange: 'Permanent marketplace breakthrough exhibit opens',
        causedBy: 'Historic sales milestone memorialized',
      },
      {
        districtId: 'warehouse',
        architecturalChange: 'Premium production equipment unlocked in Generation Bay™',
        causedBy: 'Marketplace demand exceeds current production capacity',
      },
      {
        districtId: 'knowledge-library',
        architecturalChange: 'Strategy archive wing added — GTM playbooks institutionalized',
        causedBy: 'Marketplace success patterns archived for reuse',
      },
    ],
  },
  {
    id: 'cr-innovation-overflow',
    test: (h, _s, a) =>
      (metricById(h, 'innovation-velocity')?.value ?? 0) >= 60 &&
      (a.districts['innovation-district']?.tier ?? 0) >= 2,
    trigger: 'Innovation District overcrowding',
    sourceDistrict: 'innovation-district',
    sourceEvent: 'Prototype output exceeds current laboratory capacity',
    consequences: [
      {
        districtId: 'innovation-district',
        architecturalChange: 'Research Annex constructed nearby — experimental towers extend',
        causedBy: 'Innovation velocity demands adjacent expansion',
      },
      {
        districtId: 'museum',
        architecturalChange: 'Innovation Hall recommends new permanent exhibit',
        causedBy: '38+ prototypes this cycle warrant preservation',
      },
      {
        districtId: 'warehouse',
        architecturalChange: 'Fabrication hall opens — production supports prototype pipeline',
        causedBy: 'Innovation overflow creates production demand',
      },
    ],
  },
  {
    id: 'cr-museum-milestones',
    test: (h, s) => s.campusMuseumGalleries >= 3 || (metricById(h, 'historical-preservation')?.value ?? 0) >= 50,
    trigger: 'Historic milestone accumulation',
    sourceDistrict: 'museum',
    sourceEvent: 'Multiple company breakthroughs reach preservation threshold',
    consequences: [
      {
        districtId: 'museum',
        architecturalChange: 'Second exhibition wing commissioned — Legacy Hall extends',
        causedBy: 'Historic milestones exceed current gallery capacity',
      },
      {
        districtId: 'knowledge-library',
        architecturalChange: 'Archive halls expand — preserved knowledge densifies',
        causedBy: 'Museum preservation feeds institutional learning',
      },
      {
        districtId: 'warehouse',
        architecturalChange: 'Restoration bays grow — Golden Build™ pipeline accelerates',
        causedBy: 'Preservation demand increases asset restoration throughput',
      },
    ],
  },
  {
    id: 'cr-production-strain',
    test: (h) => {
      const mp = metricById(h, 'marketplace-energy')?.value ?? 0;
      const prod = metricById(h, 'production-capacity')?.value ?? 0;
      return mp >= 45 && prod < mp - 15;
    },
    trigger: 'Marketplace outpacing production',
    sourceDistrict: 'marketplace',
    sourceEvent: 'Marketplace growth exceeds Warehouse production capacity',
    consequences: [
      {
        districtId: 'warehouse',
        architecturalChange: 'New fabrication hall opens — production bays multiply',
        causedBy: 'Marketplace demand creates production urgency',
      },
      {
        districtId: 'innovation-district',
        architecturalChange: 'Rapid prototyping corridor links to Warehouse Wing™',
        causedBy: 'Production strain requires innovation-production bridge',
      },
    ],
  },
];

export function evaluateChainReactions(
  health: WorldHealthMetric[],
  signals: EcologyInputSignals,
  architecture: LivingArchitectureSnapshot
): ChainReaction[] {
  return REACTION_TEMPLATES.filter((t) => t.test(health, signals, architecture)).map((t) => ({
    id: t.id,
    trigger: t.trigger,
    sourceDistrict: t.sourceDistrict,
    sourceEvent: t.sourceEvent,
    consequences: t.consequences,
    worldGraphNodeId: `W-ECO-CR-${t.id}`,
  }));
}
