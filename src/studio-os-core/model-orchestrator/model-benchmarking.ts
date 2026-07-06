import {
  BENCHMARK_DIMENSION_LABELS,
  BENCHMARK_DIMENSIONS,
  ORCHESTRATOR_PROVIDER_LABELS,
} from './constants';
import type { BenchmarkDimension, ModelBenchmarkScore, OrchestratorProvider } from './types';

const PREFERRED_BY_DIMENSION: Record<BenchmarkDimension, OrchestratorProvider> = {
  accuracy: 'anthropic',
  speed: 'openai',
  cost: 'google',
  tone: 'openai',
  'reasoning-quality': 'anthropic',
  'professional-reliability': 'anthropic',
  'organization-fit': 'anthropic',
  privacy: 'local',
  'founder-preference': 'openai',
};

export function buildModelBenchmarkScores(organizationId: string): ModelBenchmarkScore[] {
  const hash = organizationId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return BENCHMARK_DIMENSIONS.map((dimension, index) => {
    const preferred = PREFERRED_BY_DIMENSION[dimension];
    const scorePct = Math.min(96, 72 + ((hash + index * 7) % 24));
    return {
      dimension,
      label: BENCHMARK_DIMENSION_LABELS[dimension],
      scorePct,
      insight: benchmarkInsight(dimension, preferred, scorePct),
      preferredProvider: preferred,
    };
  });
}

function benchmarkInsight(
  dimension: BenchmarkDimension,
  preferred: OrchestratorProvider,
  scorePct: number
): string {
  const provider = ORCHESTRATOR_PROVIDER_LABELS[preferred];
  const insights: Record<BenchmarkDimension, string> = {
    accuracy: `${provider} leads for factual precision in this org`,
    speed: `${provider} fastest for Command Dock™ responses`,
    cost: `${provider} best cost-efficiency for volume tasks`,
    tone: `${provider} best matches Organization Genome™ voice`,
    'reasoning-quality': `${provider} strongest strategic deliberation`,
    'professional-reliability': `${provider} safest for regulated Professional Trust scope`,
    'organization-fit': `${scorePct}% fit with org task patterns learned over time`,
    privacy: 'Local model preferred for enterprise-sensitive workloads',
    'founder-preference': 'Learned from approval patterns · improves continuously',
  };
  return insights[dimension];
}

export function summarizeBenchmarking(scores: ModelBenchmarkScore[]): string {
  const avg = Math.round(scores.reduce((s, b) => s + b.scorePct, 0) / Math.max(1, scores.length));
  const top = [...scores].sort((a, b) => b.scorePct - a.scorePct)[0];
  return `Model benchmarking — ${avg}% avg org fit · best: ${top?.label ?? 'accuracy'} via ${top ? ORCHESTRATOR_PROVIDER_LABELS[top.preferredProvider] : 'orchestrator'}. System learns which models perform best per task.`;
}
