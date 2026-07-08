import type { OrbCompanyContext, OrbPersonalizationProfile, OrbRecommendation } from './types';

function uid(): string {
  return `orb-surprise-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Surprise Discoveries™ — thoughtful delights, not random noise. */
export function buildSurpriseDiscoveries(
  context: OrbCompanyContext,
  profile: OrbPersonalizationProfile
): OrbRecommendation[] {
  const daySeed = new Date().getDate();
  const discoveries: OrbRecommendation[] = [];

  if (daySeed % 3 !== 0) {
    discoveries.push({
      id: uid(),
      title: 'Forgotten Blueprint solves today\'s problem',
      reasoning:
        'Blueprint Archive surfaced a 6-month-old Marketing wing spec that matches your current Campaign brief — worth revisiting before generating.',
      category: 'surprise-discovery',
      priority: 'medium',
      estimatedImpact: 'high',
      estimatedMinutes: 12,
      estimatedCost: '$0',
      potentialSavings: '45%',
      departmentsAffected: ['Blueprint Archive', 'Marketing'],
      creativeEquityGained: '+70 Creative Equity',
      confidenceScore: 81,
      targetPath: '/admin/studio/blueprint-manager',
      isSurprise: true,
      actionable: true,
    });
  }

  if (profile.mostUsedBlueprints.length > 0 && daySeed % 2 === 0) {
    discoveries.push({
      id: uid(),
      title: 'Reusable environment hidden in Warehouse',
      reasoning: `Your most-used blueprint (${profile.mostUsedBlueprints[0]}) has a companion environment in the Warehouse — never deployed to campus.`,
      category: 'surprise-discovery',
      priority: 'medium',
      estimatedImpact: 'moderate',
      estimatedMinutes: 8,
      estimatedCost: '$0',
      potentialSavings: '38%',
      departmentsAffected: ['Warehouse', 'Creative Budget'],
      creativeEquityGained: '+35 Creative Equity',
      confidenceScore: 79,
      targetPath: '/admin/studio/studio-warehouse',
      isSurprise: true,
      actionable: true,
    });
  }

  discoveries.push({
    id: uid(),
    title: 'Seasonal celebration — Studio World landmark',
    reasoning:
      'A golden monument appeared overnight near Executive Atrium — seasonal pavilion lighting activates this week.',
    category: 'surprise-discovery',
    priority: 'low',
    estimatedImpact: 'moderate',
    estimatedMinutes: 5,
    estimatedCost: '$0',
    potentialSavings: null,
    departmentsAffected: ['Experience', 'Legacy'],
    creativeEquityGained: '+15 Creative Equity',
    confidenceScore: 74,
    targetPath: '/admin/studio/world-atlas',
    targetNodeId: 'atlas-flagship-studio-command-center',
    isSurprise: true,
    actionable: true,
  });

  if (context.overnightGenerations >= 2) {
    discoveries.push({
      id: uid(),
      title: 'Milestone reached overnight',
      reasoning: `${context.overnightGenerations} generations completed while you were away — campus AI population crossed a new threshold.`,
      category: 'surprise-discovery',
      priority: 'low',
      estimatedImpact: 'moderate',
      estimatedMinutes: 3,
      estimatedCost: '$0',
      potentialSavings: null,
      departmentsAffected: ['Operations', 'AI'],
      creativeEquityGained: '+20 Creative Equity',
      confidenceScore: 88,
      targetPath: '/admin/studio/overview',
      isSurprise: true,
      actionable: false,
    });
  }

  return discoveries.slice(0, 2);
}
