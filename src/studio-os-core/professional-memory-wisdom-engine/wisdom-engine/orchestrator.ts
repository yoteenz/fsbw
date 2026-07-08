import { getRetentionPlan } from '../../knowledge-retention-engine';
import { syncProfessionalMemory } from '../professional-memory/orchestrator';
import { synthesizeWisdomRecommendation } from './synthesizer';
import type { WisdomContext, WisdomRecommendation } from '../types';

/** Orchestration layer — combines knowledge retention, career memory, and lived experience. */
export function orchestrateWisdomRecommendation(
  context: WisdomContext,
  options: { includeRetention?: boolean } = { includeRetention: true }
): WisdomRecommendation {
  const memoryState = syncProfessionalMemory(
    context.organizationId,
    context.learnerId,
    { profession: context.profession, worldId: context.worldId }
  );

  const enrichedContext: WisdomContext = {
    ...context,
    memoryIds:
      context.memoryIds.length > 0
        ? context.memoryIds
        : memoryState.store.memories.map((memory) => memory.id),
    retentionProfileIds:
      context.retentionProfileIds.length > 0
        ? context.retentionProfileIds
        : options.includeRetention
          ? getRetentionPlan(context.organizationId, context.learnerId).evaluations.map(
              (evaluation) => evaluation.profileId
            )
          : [],
    simulationOutcomeIds:
      context.simulationOutcomeIds.length > 0
        ? context.simulationOutcomeIds
        : memoryState.store.memories
            .map((memory) => memory.simulationId)
            .filter((id): id is string => Boolean(id)),
    mentorshipIds:
      context.mentorshipIds.length > 0
        ? context.mentorshipIds
        : memoryState.store.memories.flatMap((memory) => memory.relatedMentorshipIds),
  };

  return synthesizeWisdomRecommendation(enrichedContext, memoryState.store.memories);
}

export { createWisdomContext, synthesizeWisdomRecommendation } from './synthesizer';
