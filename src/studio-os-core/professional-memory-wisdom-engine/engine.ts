import { WISDOM_SOURCE_DEFAULT_WEIGHTS } from './constants';
import { LAUNCH_PROFESSIONAL_MEMORIES } from './catalog';
import type {
  OrbMemoryRecall,
  ProfessionalMemoryRecord,
  ProfessionalMemorySignal,
  ProfessionalTimeline,
  WisdomContext,
  WisdomRecommendation,
  WisdomSource,
} from './types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function dominantSignals(memories: ProfessionalMemoryRecord[]): ProfessionalMemorySignal[] {
  const counts = new Map<ProfessionalMemorySignal, number>();
  for (const memory of memories) {
    for (const signal of memory.signals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([signal]) => signal);
}

export function buildProfessionalTimeline(
  learnerId: string,
  profession: string,
  memories: ProfessionalMemoryRecord[] = LAUNCH_PROFESSIONAL_MEMORIES,
  now = new Date()
): ProfessionalTimeline {
  const scoped = memories
    .filter((memory) => memory.learnerId === learnerId)
    .filter((memory) => profession === 'all' || memory.profession === profession)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));

  const wisdomScore = clamp(
    scoped.reduce((sum, memory) => sum + memory.impactScore + memory.masteryDelta, 0) /
      Math.max(scoped.length * 1.2, 1)
  );

  return {
    learnerId,
    profession,
    generatedAt: now.toISOString(),
    memories: scoped,
    milestoneCount: scoped.filter((memory) => memory.signals.includes('career-milestone')).length,
    wisdomScore,
    dominantSignals: dominantSignals(scoped),
  };
}

export function buildOrbMemoryRecalls(
  memories: ProfessionalMemoryRecord[],
  now = new Date()
): OrbMemoryRecall[] {
  return memories
    .filter((memory) => memory.visibleToOrb)
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 4)
    .map((memory) => {
      const yearsAgo = Math.max(0, now.getFullYear() - new Date(memory.occurredAt).getFullYear());
      const line =
        yearsAgo > 0
          ? `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago you ${memory.title.toLowerCase()}.`
          : `You recently added this to your professional memory: ${memory.title}.`;
      return {
        id: uid('orb-memory-recall'),
        memoryId: memory.id,
        line,
        tone: memory.emotionalTone === 'humbled' ? 'guidance' : 'mentor',
        optional: true,
      };
    });
}

export function createWisdomContext(input: {
  learnerId: string;
  profession: string;
  currentQuestion: string;
  activeCareerGoalIds?: string[];
  memoryIds?: string[];
  simulationOutcomeIds?: string[];
  industryUpdateIds?: string[];
  mentorshipIds?: string[];
  communityContributionIds?: string[];
  sourceWeights?: Partial<Record<WisdomSource, number>>;
}): WisdomContext {
  return {
    learnerId: input.learnerId,
    profession: input.profession,
    currentQuestion: input.currentQuestion,
    activeCareerGoalIds: input.activeCareerGoalIds ?? [],
    sourceWeights: { ...WISDOM_SOURCE_DEFAULT_WEIGHTS, ...input.sourceWeights },
    memoryIds: input.memoryIds ?? [],
    simulationOutcomeIds: input.simulationOutcomeIds ?? [],
    industryUpdateIds: input.industryUpdateIds ?? [],
    mentorshipIds: input.mentorshipIds ?? [],
    communityContributionIds: input.communityContributionIds ?? [],
  };
}

export function synthesizeWisdomRecommendation(
  context: WisdomContext,
  memories: ProfessionalMemoryRecord[] = LAUNCH_PROFESSIONAL_MEMORIES,
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
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);

  const strongestMemory = recalledMemories[0];
  const recommendation = strongestMemory
    ? `Based on your experience with ${strongestMemory.title.toLowerCase()}, choose the path that protects trust before speed.`
    : 'Use Profession Brain™ standards first, then check the choice against your lived career patterns.';

  return {
    id: uid('wisdom-recommendation'),
    learnerId: context.learnerId,
    generatedAt: now.toISOString(),
    question: context.currentQuestion,
    recommendation,
    whyNow: strongestMemory
      ? strongestMemory.wisdomExtracted
      : 'No single memory dominates this decision yet, so the Wisdom Engine™ keeps the guidance conservative.',
    recalledMemories,
    sourceSummary: {
      'profession-brain': 'Canonical professional standards define the safe baseline.',
      'professional-memory': `${recalledMemories.length} lived memories shaped this recommendation.`,
      'career-history': `${context.activeCareerGoalIds.length} career goals are active in this decision.`,
      'simulation-outcomes': `${context.simulationOutcomeIds.length} simulation outcomes are available.`,
      mentorship: `${context.mentorshipIds.length} mentorship signals are available.`,
      'industry-updates': `${context.industryUpdateIds.length} industry updates are available.`,
      'community-contributions': `${context.communityContributionIds.length} community signals are available.`,
    },
    confidenceScore: clamp(72 + recalledMemories.length * 7),
    suggestedNextStep: 'Reflect on the closest prior memory, then apply the current Profession Brain™ standard.',
  };
}
