import { PIPELINE_STAGE_LABELS, PIPELINE_STAGES } from './constants';
import type { InnovationIdea, InnovationPipelineSummary } from './types';

export function buildPipelineSummary(ideas: InnovationIdea[]): InnovationPipelineSummary[] {
  return PIPELINE_STAGES.map((stage) => {
    const matching = ideas.filter((i) => i.stage === stage);
    return {
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: matching.length,
      ideaIds: matching.map((i) => i.id),
    };
  });
}

export function summarizePipeline(summary: InnovationPipelineSummary[]): string {
  const active = summary.filter((s) => s.stage !== 'archived' && s.stage !== 'completed');
  const activeCount = active.reduce((sum, s) => sum + s.count, 0);
  const archived = summary.find((s) => s.stage === 'archived')?.count ?? 0;
  return `${activeCount} ideas in active pipeline · ${archived} archived (searchable) · ideas never disappear.`;
}

export function countRevenueOpportunities(ideas: InnovationIdea[]): number {
  return ideas.filter((i) => !i.archived && i.revenuePotentialScore >= 70).length;
}
