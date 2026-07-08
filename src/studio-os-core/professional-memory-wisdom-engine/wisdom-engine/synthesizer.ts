import { WISDOM_SOURCE_DEFAULT_WEIGHTS } from '../constants';
import type {
  ProfessionalMemoryRecord,
  WisdomContext,
  WisdomRecommendation,
  WisdomSource,
} from '../types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createWisdomContext(input: {
  learnerId: string;
  organizationId: string;
  profession: string;
  worldId?: string;
  currentQuestion: string;
  activeCareerGoalIds?: string[];
  memoryIds?: string[];
  retentionProfileIds?: string[];
  simulationOutcomeIds?: string[];
  industryUpdateIds?: string[];
  mentorshipIds?: string[];
  communityContributionIds?: string[];
  sourceWeights?: Partial<Record<WisdomSource, number>>;
}): WisdomContext {
  return {
    learnerId: input.learnerId,
    organizationId: input.organizationId,
    profession: input.profession,
    worldId: input.worldId,
    currentQuestion: input.currentQuestion,
    activeCareerGoalIds: input.activeCareerGoalIds ?? [],
    sourceWeights: { ...WISDOM_SOURCE_DEFAULT_WEIGHTS, ...input.sourceWeights },
    memoryIds: input.memoryIds ?? [],
    retentionProfileIds: input.retentionProfileIds ?? [],
    simulationOutcomeIds: input.simulationOutcomeIds ?? [],
    industryUpdateIds: input.industryUpdateIds ?? [],
    mentorshipIds: input.mentorshipIds ?? [],
    communityContributionIds: input.communityContributionIds ?? [],
  };
}

export function synthesizeWisdomRecommendation(
  context: WisdomContext,
  memories: ProfessionalMemoryRecord[],
  now = new Date()
): WisdomRecommendation {
  const recalledMemories = memories
    .filter((memory) => memory.learnerId === context.learnerId)
    .filter(
      (memory) =>
        context.memoryIds.length === 0 ||
        context.memoryIds.includes(memory.id) ||
        memory.relatedCareerGoalIds.some((goalId) => context.activeCareerGoalIds.includes(goalId))
    )
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  const strongestMemory = recalledMemories[0];
  const recommendation = strongestMemory
    ? `Based on everything you've experienced — especially ${strongestMemory.title.toLowerCase()} — choose the path that protects trust before speed.`
    : 'Use Profession Brain™ standards first, then check the choice against your lived career patterns.';

  return {
    id: uid('wisdom-recommendation'),
    learnerId: context.learnerId,
    generatedAt: now.toISOString(),
    question: context.currentQuestion,
    recommendation,
    whyNow: strongestMemory
      ? strongestMemory.reflectionSummary
      : 'No single memory dominates this decision yet, so the Wisdom Engine™ keeps the guidance conservative.',
    recalledMemories,
    sourceSummary: {
      'profession-brain': 'Canonical professional standards define the safe baseline.',
      'professional-memory': `${recalledMemories.length} lived memories shaped this recommendation.`,
      'knowledge-retention': `${context.retentionProfileIds.length} retained concepts inform recall strength.`,
      'career-world': context.worldId
        ? `Career World ${context.worldId} supplies active career context.`
        : 'Career World context is available when a world is active.',
      'world-graph': 'Professional Memory™ nodes connect experience to canon systems.',
      'simulation-outcomes': `${context.simulationOutcomeIds.length} simulation outcomes are available.`,
      mentorship: `${context.mentorshipIds.length} mentorship signals are available.`,
      'industry-updates': `${context.industryUpdateIds.length} industry updates are available.`,
      'community-contributions': `${context.communityContributionIds.length} community signals are available.`,
    },
    confidenceScore: clamp(70 + recalledMemories.length * 8),
    suggestedNextStep:
      'Reflect on the closest prior memory, then apply the current Profession Brain™ standard.',
  };
}
