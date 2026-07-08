import type { AtlasExpansionRecommendation, AtlasMasterPlanReservation, AtlasNode } from './types';

function uid(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Expansion Recommendations™ — proactive campus growth intelligence */
export function buildExpansionRecommendations(
  nodes: AtlasNode[],
  masterPlan: AtlasMasterPlanReservation[]
): AtlasExpansionRecommendation[] {
  const recs: AtlasExpansionRecommendation[] = [];
  const plannedLabels = new Set(masterPlan.map((p) => p.label.toLowerCase()));

  const hasMarketing = [...plannedLabels].some((l) => l.includes('marketing'));
  if (!hasMarketing) {
    recs.push({
      id: uid(),
      message: 'Marketing Headquarters is approaching capacity — reserve northern campus land.',
      targetPlanLabel: 'Marketing Headquarters™',
      priority: 'high',
      suggestedCategory: 'headquarters',
    });
  }

  const archives = nodes.find((n) => n.flagshipId === 'studio-archives' && n.level === 1);
  if (archives && !plannedLabels.has('blueprint wing')) {
    recs.push({
      id: uid(),
      message: 'Studio Archives™ would benefit from an additional Blueprint Wing.',
      targetPlanLabel: 'Blueprint Archive Wing™',
      priority: 'medium',
      suggestedCategory: 'district',
    });
  }

  if (!plannedLabels.has('marketplace')) {
    recs.push({
      id: uid(),
      message: 'Marketplace Pavilion could support another exhibition hall.',
      targetPlanLabel: 'Marketplace Pavilion Expansion™',
      priority: 'medium',
      suggestedCategory: 'pavilion',
    });
  }

  const aiHeavy = nodes.filter((n) => n.engineIds?.includes('architecture-auditor')).length;
  if (aiHeavy >= 2) {
    recs.push({
      id: uid(),
      message: 'AI population suggests adding another Operations Wing for concierge traffic.',
      targetPlanLabel: 'Operations Wing Expansion™',
      priority: 'medium',
      suggestedCategory: 'district',
    });
  }

  return recs.slice(0, 4);
}
