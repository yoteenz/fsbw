/**
 * Orb Ecosystem Architect™ — urban planner recommendations from ecology balance.
 */

import type { DistrictThemeId } from '../architectural-navigation/district-themes';
import type {
  ChainReaction,
  DistrictEcologyState,
  LivingDistrictEcologySnapshot,
  WorldHealthMetric,
} from './types';
import { metricById } from './world-health';

type PlannerOpportunity = {
  priority: number;
  line: string;
};

export function buildOrbPlannerLine(input: {
  worldHealth: WorldHealthMetric[];
  chainReactions: ChainReaction[];
  underservedDistricts: DistrictThemeId[];
  ecosystemBalance: number;
  dominantDistrict: DistrictThemeId | null;
  districts: Record<DistrictThemeId, DistrictEcologyState>;
}): string | null {
  const opportunities: PlannerOpportunity[] = [];

  const marketplace = metricById(input.worldHealth, 'marketplace-energy')?.value ?? 0;
  const production = metricById(input.worldHealth, 'production-capacity')?.value ?? 0;
  if (marketplace > production + 12) {
    opportunities.push({
      priority: 90,
      line: `The Marketplace is growing faster than Production. Consider expanding Warehouse capacity — fabrication demand is ${Math.round(marketplace - production)} points ahead.`,
    });
  }

  const innovation = metricById(input.worldHealth, 'innovation-velocity')?.value ?? 0;
  const museum = metricById(input.worldHealth, 'historical-preservation')?.value ?? 0;
  if (innovation >= 55 && museum < innovation - 20) {
    opportunities.push({
      priority: 85,
      line: `The Innovation District has produced significant prototypes this cycle. The Museum recommends commissioning a new Innovation Hall.`,
    });
  }

  const knowledge = metricById(input.worldHealth, 'knowledge-flow')?.value ?? 0;
  const learning = metricById(input.worldHealth, 'learning-growth')?.value ?? 0;
  if (knowledge >= 50 && learning >= knowledge * 0.9) {
    opportunities.push({
      priority: 80,
      line: `Knowledge output has doubled. Atlas predicts expansion opportunities near the Library.`,
    });
  }

  if (input.underservedDistricts.length > 0) {
    const weak = input.underservedDistricts[0]!.replace(/-/g, ' ');
    const dominant = input.dominantDistrict?.replace(/-/g, ' ') ?? 'another district';
    opportunities.push({
      priority: 70,
      line: `${weak} is underserved while ${dominant} leads. Strengthening this relationship will balance the ecosystem.`,
    });
  }

  const latestReaction = input.chainReactions[input.chainReactions.length - 1];
  if (latestReaction) {
    const districtNames = latestReaction.consequences
      .map((c) => c.districtId.replace(/-/g, ' '))
      .slice(0, 3)
      .join(', ');
    opportunities.push({
      priority: 75,
      line: `Chain reaction active: "${latestReaction.trigger}" — ${districtNames} are responding across campus.`,
    });
  }

  if (input.ecosystemBalance < 45) {
    opportunities.push({
      priority: 65,
      line: `Ecosystem balance is uneven. No single district should dominate forever — diversify founder investments.`,
    });
  }

  const weakLinks = Object.values(input.districts).flatMap((d) =>
    d.weakRelationships.filter((r) => r.relationship === 'underserved').map((r) => ({
      from: d.districtId,
      to: r.districtId,
    }))
  );
  if (weakLinks.length > 0) {
    const link = weakLinks[0]!;
    opportunities.push({
      priority: 60,
      line: `Consider strengthening the ${link.from.replace(/-/g, ' ')} → ${link.to.replace(/-/g, ' ')} relationship — synergy is underdeveloped.`,
    });
  }

  if (opportunities.length === 0) {
    return 'Campus ecosystem is balanced — continue earning progress and neighboring districts will respond naturally.';
  }

  opportunities.sort((a, b) => b.priority - a.priority);
  return opportunities[0]!.line;
}

export function buildEcosystemSummary(snapshot: Pick<LivingDistrictEcologySnapshot, 'ecosystemBalance' | 'balanceLabel' | 'activeSynergyFlows' | 'chainReactions'>): string {
  const flows = snapshot.activeSynergyFlows.filter((f) => f.active).length;
  const reactions = snapshot.chainReactions.length;
  if (reactions > 0) {
    return `Living ecosystem — ${snapshot.balanceLabel} · ${reactions} chain reaction${reactions > 1 ? 's' : ''} active · ${flows} synergy flows`;
  }
  if (flows > 0) {
    return `Living ecosystem — ${snapshot.balanceLabel} · ${flows} district synergy flows active`;
  }
  return `Living ecosystem — ${snapshot.balanceLabel}`;
}
