/**
 * Studio World Constitution™ — Keeper of Studio World (Orb personality).
 */

import type { ConstitutionLawId, ConstitutionReviewResult } from './types';
import { FOUNDATIONAL_LAWS, getConstitutionLaw } from './laws';

export type ConstitutionKeeperLine = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  lawId?: ConstitutionLawId;
};

function uid(): string {
  return `keeper-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const CONSTITUTION_KEEPER_ROLE = 'Keeper of Studio World';

export const CONSTITUTION_KEEPER_GREETING =
  'Welcome to Constitution Hall™ — I guard the permanent laws of Studio World™. Every expansion must earn its place.';

export const CONSTITUTION_KEEPER_ACCENT = '#d4c4a0';

export function buildConstitutionKeeperWelcomeLines(): ConstitutionKeeperLine[] {
  return [
    {
      id: uid(),
      message:
        'Most software grows by accumulating features. Studio World grows by expanding a civilization — the Constitution™ ensures coherence.',
      priority: 'high',
    },
    {
      id: uid(),
      message:
        'Eight Foundational Laws govern every room, department, Blueprint, Expedition, and Marketplace asset.',
      priority: 'medium',
      lawId: 'everything-belongs-somewhere',
    },
    {
      id: uid(),
      message: 'Run Constitution Review™ on any proposed feature before implementation.',
      priority: 'medium',
    },
  ];
}

export function buildConstitutionKeeperReviewLines(
  result: ConstitutionReviewResult
): ConstitutionKeeperLine[] {
  const lines: ConstitutionKeeperLine[] = [];
  const overall = result.scores.overallCompliance;

  if (result.approved) {
    lines.push({
      id: uid(),
      message: `${result.proposalName} earns its place — ${overall}% Constitution Compliance™.`,
      priority: 'high',
    });
  } else {
    lines.push({
      id: uid(),
      message: `${result.proposalName} falls below threshold (${overall}%) — redesign before building.`,
      priority: 'high',
    });
  }

  if (result.owningFlagship) {
    lines.push({
      id: uid(),
      message: `Law #1: ${result.proposalName} belongs under ${result.owningFlagship.replace(/-/g, ' ')} as a ${result.suggestedPhysicalType}.`,
      priority: 'medium',
      lawId: 'everything-belongs-somewhere',
    });
  } else {
    lines.push({
      id: uid(),
      message: 'Law #1 violation — no flagship owns this feature. It cannot be built.',
      priority: 'high',
      lawId: 'everything-belongs-somewhere',
    });
  }

  for (const lawId of result.violatedLaws.slice(0, 3)) {
    const law = getConstitutionLaw(lawId);
    lines.push({
      id: uid(),
      message: `Law #${law.number} — ${law.title}: ${law.enforcement}`,
      priority: 'medium',
      lawId,
    });
  }

  if (result.recommendations[0]) {
    lines.push({
      id: uid(),
      message: result.recommendations[0]!,
      priority: 'low',
    });
  }

  lines.push({
    id: uid(),
    message: 'The founder remains Creative Director™ — I recommend and explain, never override your intent.',
    priority: 'low',
    lawId: 'founder-creative-director',
  });

  return lines.slice(0, 6);
}

export function buildConstitutionKeeperLawInsight(lawId: ConstitutionLawId): ConstitutionKeeperLine {
  const law = getConstitutionLaw(lawId);
  return {
    id: uid(),
    message: `Law #${law.number} ${law.title} — ${law.summary} ${law.enforcement}`,
    priority: 'medium',
    lawId,
  };
}

export function constitutionKeeperExplainsEvolution(reviewCount: number): ConstitutionKeeperLine {
  return {
    id: uid(),
    message:
      reviewCount > 0
        ? `Studio World has recorded ${reviewCount} Constitutional Reviews™ — each decision teaches the civilization.`
        : 'Studio World Learns™ from every approval, rejection, and merge — reviews will accumulate here.',
    priority: 'low',
    lawId: 'studio-world-learns',
  };
}

export function listKeeperLawSummaries(): ConstitutionKeeperLine[] {
  return FOUNDATIONAL_LAWS.map((law) => ({
    id: law.id,
    message: `#${law.number} ${law.title}`,
    priority: 'low' as const,
    lawId: law.id,
  }));
}
