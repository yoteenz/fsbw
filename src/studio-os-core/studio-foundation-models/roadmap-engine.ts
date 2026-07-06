import { ROADMAP_PHASE_LABELS, ROADMAP_PHASES } from './constants';
import type { RoadmapPhase, RoadmapPhaseStatus } from './types';

export function computeFoundationScore(
  roadmapProgressAvg: number,
  professionModelsReady: number,
  moatAvg: number,
  hybridLayersActive: number
): number {
  return Math.min(
    99,
    Math.round(
      roadmapProgressAvg * 0.35 +
        professionModelsReady * 2.5 +
        moatAvg * 0.2 +
        hybridLayersActive * 4
    )
  );
}

export function resolveCurrentRoadmapPhase(phases: RoadmapPhaseStatus[]): RoadmapPhase {
  const active = phases.find((p) => p.status === 'active');
  if (active) return active.phase;
  const lastComplete = [...phases].reverse().find((p) => p.status === 'complete');
  return lastComplete?.phase ?? 'model-agnostic';
}

export function buildRoadmapPhases(
  orchestratorScore: number,
  architectureScore: number
): RoadmapPhaseStatus[] {
  return ROADMAP_PHASES.map((phase, index) => {
    let status: RoadmapPhaseStatus['status'] = 'planned';
    let progressPct = 0;
    let detail = '';

    switch (phase) {
      case 'model-agnostic':
        status = 'complete';
        progressPct = 100;
        detail = 'Third-party models via Model Orchestrator™ — Studio Intelligence™ owns knowledge layer.';
        break;
      case 'model-resilient':
        status = orchestratorScore >= 80 ? 'complete' : orchestratorScore >= 60 ? 'active' : 'planned';
        progressPct = Math.min(100, Math.round(orchestratorScore * 0.95));
        detail = 'AI Swap Engine™ + failover — providers interchangeable without breaking Studio OS.';
        break;
      case 'model-independent':
        status =
          orchestratorScore >= 85 && architectureScore >= 80
            ? 'active'
            : orchestratorScore >= 70
              ? 'planned'
              : 'planned';
        progressPct = Math.min(100, Math.round((orchestratorScore + architectureScore) / 2 - 15));
        if (status === 'active') {
          detail = 'Hybrid intelligence active — Studio Profession Models™ reason; external models draft.';
        } else {
          detail = 'Knowledge Fabric™ + Profession Brain™ reduce external model dependency over time.';
        }
        break;
      case 'studio-owned':
        status = 'planned';
        progressPct = Math.min(45, Math.round(architectureScore * 0.35));
        detail = 'Long-term destination — Studio Foundation Models™ trained on approved organizational expertise.';
        break;
      default:
        detail = ROADMAP_PHASE_LABELS[phase];
    }

    if (status === 'active' && index > 0) {
      const prev = ROADMAP_PHASES[index - 1];
      detail = `${ROADMAP_PHASE_LABELS[prev]} complete · ${detail}`;
    }

    return {
      phase,
      label: ROADMAP_PHASE_LABELS[phase],
      status,
      detail,
      progressPct,
    };
  });
}

export function summarizeRoadmap(phases: RoadmapPhaseStatus[], currentPhase: RoadmapPhase): string {
  const active = phases.find((p) => p.phase === currentPhase);
  return `Roadmap phase: ${ROADMAP_PHASE_LABELS[currentPhase]} (${active?.progressPct ?? 0}%). Third-party models are the bridge. Studio Models™ are the destination.`;
}
