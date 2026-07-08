/**
 * Second & third-order consequences™ — meaningful actions ripple across civilization.
 */

import type { LivingDistrictEcologySnapshot } from '../living-district-ecology/types';
import type {
  CivilizationConsequence,
  CivilizationLayerId,
  EconomyId,
  EconomyState,
} from './types';

type ConsequenceTemplate = {
  id: string;
  order: 2 | 3;
  test: (economies: Record<EconomyId, EconomyState>, ecology: LivingDistrictEcologySnapshot) => boolean;
  trigger: string;
  sourceLayer: CivilizationLayerId;
  ripple: string;
  affectedLayers: CivilizationLayerId[];
  affectedDistricts: import('../architectural-navigation/district-themes').DistrictThemeId[];
};

const CONSEQUENCE_TEMPLATES: ConsequenceTemplate[] = [
  {
    id: 'c2-innovation-exceeds-production',
    order: 2,
    test: (e) => e.innovation.capital > e.market.capital * 0.5 && e.innovation.capital > 55,
    trigger: 'Innovation exceeds production capacity',
    sourceLayer: 'innovation',
    ripple: 'Research Annex demand rises · Warehouse fabrication hall recommended · Marketplace pipeline accelerates',
    affectedLayers: ['production', 'marketplace', 'intelligence'],
    affectedDistricts: ['innovation-district', 'warehouse', 'marketplace'],
  },
  {
    id: 'c2-market-slowing-knowledge',
    order: 2,
    test: (e) => e.market.trend === 'contracting' && e.knowledge.trend === 'contracting',
    trigger: 'Marketplace growth slowing — Knowledge output declined',
    sourceLayer: 'knowledge',
    ripple: 'Knowledge grants recommended · Blueprint publishing cadence affects commerce · Orb intelligence degrades',
    affectedLayers: ['marketplace', 'intelligence', 'innovation'],
    affectedDistricts: ['knowledge-library', 'marketplace', 'atlas'],
  },
  {
    id: 'c2-museum-behind-innovation',
    order: 2,
    test: (e) => e.innovation.capital > e.historical.capital + 20,
    trigger: 'Museum preservation falling behind innovation',
    sourceLayer: 'historical',
    ripple: 'Historic milestones at risk · Legacy monuments queued · Museum wing expansion recommended',
    affectedLayers: ['historical', 'knowledge', 'community'],
    affectedDistricts: ['museum', 'knowledge-library'],
  },
  {
    id: 'c2-collaboration-surge',
    order: 2,
    test: (e) => e.collaboration.capital >= 55 && e.collaboration.trend === 'growing',
    trigger: 'Community collaboration increasing rapidly',
    sourceLayer: 'community',
    ripple: 'Skybridge construction eligible · Joint museum commissioning · Shared research institute unlocks',
    affectedLayers: ['community', 'innovation', 'historical'],
    affectedDistricts: ['command-center', 'innovation-district', 'museum'],
  },
  {
    id: 'c3-knowledge-compounds',
    order: 3,
    test: (e, eco) => e.knowledge.capital >= 60 && eco.chainReactions.length >= 2,
    trigger: 'Knowledge capital compounding across civilization',
    sourceLayer: 'knowledge',
    ripple: 'Third-order: Innovation grants auto-issued · Atlas POI cluster forms · Industry reputation rises · Future generations inherit institutional memory',
    affectedLayers: ['knowledge', 'innovation', 'intelligence', 'historical'],
    affectedDistricts: ['knowledge-library', 'innovation-district', 'atlas', 'museum'],
  },
  {
    id: 'c3-market-funds-civilization',
    order: 3,
    test: (e) => e.market.capital >= 65,
    trigger: 'Market success funding civilization expansion',
    sourceLayer: 'marketplace',
    ripple: 'Third-order: Production funded · Museum preservation endowed · Knowledge grants distributed · Expansion budget unlocked',
    affectedLayers: ['production', 'historical', 'knowledge', 'marketplace'],
    affectedDistricts: ['marketplace', 'warehouse', 'museum', 'knowledge-library'],
  },
];

export function evaluateCivilizationConsequences(
  economies: Record<EconomyId, EconomyState>,
  ecology: LivingDistrictEcologySnapshot
): CivilizationConsequence[] {
  return CONSEQUENCE_TEMPLATES.filter((t) => t.test(economies, ecology)).map((t) => ({
    id: t.id,
    order: t.order,
    trigger: t.trigger,
    sourceLayer: t.sourceLayer,
    ripple: t.ripple,
    affectedLayers: t.affectedLayers,
    affectedDistricts: t.affectedDistricts,
  }));
}
