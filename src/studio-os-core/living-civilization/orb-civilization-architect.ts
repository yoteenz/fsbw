/**
 * Civilization Architect™ — Orb understands civilization health strategically.
 */

import type { CivilizationConsequence, CivilizationHealth, EconomyState, EconomyId } from './types';

type StrategicInsight = {
  priority: number;
  line: string;
};

export function buildOrbArchitectLine(input: {
  health: CivilizationHealth;
  economies: Record<EconomyId, EconomyState>;
  consequences: CivilizationConsequence[];
  stageLabel: string;
}): string | null {
  const insights: StrategicInsight[] = [];
  const { economies: e, health, consequences } = input;

  if (e.innovation.capital > e.market.capital * 0.6 && e.innovation.capital > 50) {
    insights.push({
      priority: 92,
      line: 'Innovation exceeds production capacity. The civilization needs more Production Layer™ investment before prototype overflow.',
    });
  }

  if (e.market.trend === 'contracting' && e.knowledge.trend === 'contracting') {
    insights.push({
      priority: 90,
      line: 'Marketplace growth is slowing because Knowledge output declined. Publish Blueprints™ to restore civilization momentum.',
    });
  }

  if (e.innovation.capital > e.historical.capital + 18) {
    insights.push({
      priority: 88,
      line: 'Museum preservation is falling behind innovation. Historic milestones risk being lost — commission Legacy monuments.',
    });
  }

  if (e.collaboration.capital >= 55 && e.collaboration.trend === 'growing') {
    insights.push({
      priority: 85,
      line: 'Community collaboration is increasing rapidly. Skybridges and joint research institutes are now architecturally eligible.',
    });
  }

  if (health.selfBalancing) {
    insights.push({
      priority: 70,
      line: `Civilization self-balancing at ${health.overall}% health. ${input.stageLabel} — your decisions ripple across all layers.`,
    });
  }

  if (health.underservedLayers.length > 0) {
    const layer = health.underservedLayers[0]!.replace(/-/g, ' ');
    insights.push({
      priority: 75,
      line: `The ${layer} is underserved. Strengthening this layer will restore civilization balance.`,
    });
  }

  const thirdOrder = consequences.filter((c) => c.order === 3);
  if (thirdOrder.length > 0) {
    insights.push({
      priority: 80,
      line: `Third-order consequence active: ${thirdOrder[0]!.trigger}. The entire civilization is responding.`,
    });
  }

  if (e.knowledge.capital >= 60) {
    insights.push({
      priority: 72,
      line: 'Knowledge Capital™ is powering civilization — innovation, collaboration, and Orb intelligence all benefit.',
    });
  }

  if (insights.length === 0) {
    return 'Civilization foundational — every meaningful action will create second-order consequences across Studio World.';
  }

  insights.sort((a, b) => b.priority - a.priority);
  return insights[0]!.line;
}

export function buildFounderExperienceLine(input: {
  health: CivilizationHealth;
  dominantLayer: import('./types').CivilizationLayerId | null;
  companyName: string;
}): string {
  const name = input.companyName || 'Your company';
  if (input.health.selfBalancing) {
    return `${name} inhabits a self-balancing civilization — you guide, the world evolves.`;
  }
  if (input.dominantLayer) {
    const layer = input.dominantLayer.replace(/-/g, ' ');
    return `${name}'s civilization is ${layer}-led — your priorities shape the skyline.`;
  }
  return `${name} is founding a civilization — every invention, collaboration, and milestone becomes permanent.`;
}

export function buildCivilizationSummary(input: {
  health: CivilizationHealth;
  stageLabel: string;
  consequenceCount: number;
}): string {
  const balance = input.health.selfBalancing ? 'self-balancing' : 'evolving';
  if (input.consequenceCount > 0) {
    return `Living Civilization™ — ${input.stageLabel} · ${balance} · ${input.consequenceCount} ripple${input.consequenceCount > 1 ? 's' : ''} active`;
  }
  return `Living Civilization™ — ${input.stageLabel} · ${input.health.label}`;
}
