import { WISDOM_SOURCE_DEFAULT_WEIGHTS } from '../constants';
import { buildProfessionalTimeline } from '../memory-timeline/builder';
import {
  appendProfessionalMemory,
  ensureProfessionalMemoryStore,
  upsertProfessionalMemoryStore,
} from './store';
import { registerMemoryFromCareerWorldEvent } from '../memory-events/registry';
import { synthesizeWisdomRecommendation } from '../wisdom-engine/synthesizer';
import type {
  MemoryEventPayload,
  ProfessionalMemoryState,
  ProfessionalMemoryStore,
  WisdomContext,
  WisdomRecommendation,
} from '../types';

export function bootstrapProfessionalMemory(
  organizationId: string,
  learnerId: string,
  profession = 'all'
): ProfessionalMemoryStore {
  return ensureProfessionalMemoryStore(organizationId, learnerId, profession);
}

export function syncProfessionalMemory(
  organizationId: string,
  learnerId: string,
  options: { profession?: string; worldId?: string; question?: string } = {}
): ProfessionalMemoryState {
  const store = ensureProfessionalMemoryStore(
    organizationId,
    learnerId,
    options.profession ?? 'all'
  );
  const profession = options.profession ?? storeProfession(store);
  const timeline = buildProfessionalTimeline({
    learnerId,
    profession,
    worldId: options.worldId ?? store.worldId,
    memories: store.memories,
  });

  const wisdomRecommendation = options.question
    ? synthesizeWisdomRecommendation(
        createDefaultWisdomContext(organizationId, learnerId, options.question, store),
        store.memories
      )
    : null;

  return { store, timeline, wisdomRecommendation };
}

function storeProfession(store: ProfessionalMemoryStore): string {
  return store.profession === 'all' && store.memories[0] ? store.memories[0].profession : store.profession;
}

export function ingestCareerWorldMemoryEvent(
  organizationId: string,
  learnerId: string,
  payload: MemoryEventPayload
): ProfessionalMemoryStore {
  const store = ensureProfessionalMemoryStore(organizationId, learnerId, payload.profession);
  const memories = registerMemoryFromCareerWorldEvent(learnerId, store.memories, payload);
  return upsertProfessionalMemoryStore({
    ...store,
    profession: payload.profession,
    worldId: payload.worldId,
    memories,
  });
}

export function recordProfessionalMemoryEvent(
  organizationId: string,
  learnerId: string,
  payload: MemoryEventPayload
): ProfessionalMemoryStore {
  return ingestCareerWorldMemoryEvent(organizationId, learnerId, payload);
}

export function createDefaultWisdomContext(
  organizationId: string,
  learnerId: string,
  question: string,
  store: ProfessionalMemoryStore
): WisdomContext {
  return {
    learnerId,
    organizationId,
    profession: store.profession,
    worldId: store.worldId,
    currentQuestion: question,
    activeCareerGoalIds: [],
    sourceWeights: { ...WISDOM_SOURCE_DEFAULT_WEIGHTS },
    memoryIds: store.memories.map((memory) => memory.id),
    retentionProfileIds: store.memories.flatMap((memory) => memory.relatedBrainConceptIds),
    simulationOutcomeIds: store.memories
      .map((memory) => memory.simulationId)
      .filter((id): id is string => Boolean(id)),
    industryUpdateIds: [],
    mentorshipIds: store.memories.flatMap((memory) => memory.relatedMentorshipIds),
    communityContributionIds: [],
  };
}

export function requestWisdomRecommendation(
  organizationId: string,
  learnerId: string,
  context: WisdomContext
): WisdomRecommendation {
  const store = ensureProfessionalMemoryStore(organizationId, learnerId, context.profession);
  return synthesizeWisdomRecommendation(context, store.memories);
}

export { appendProfessionalMemory };
