import type { CareerNpcProfile } from '../core/schemas';

export function createNpcFromArchetype(
  archetype: string,
  role: CareerNpcProfile['role'],
  index: number
): CareerNpcProfile {
  return {
    id: `npc-${role}-${index}`,
    name: `${archetype} ${index + 1}`,
    archetype,
    role,
    trust: 40 + index * 5,
    reputation: 50 + index * 3,
    conversationHistory: [],
    projectsCompleted: [],
    recommendations: [],
    employmentHistory: [],
    teachingHistory: [],
    lastInteractionDay: 0,
  };
}

export function recordNpcConversation(
  npc: CareerNpcProfile,
  summary: string,
  day: number,
  sentiment: CareerNpcProfile['conversationHistory'][0]['sentiment'] = 'neutral'
): CareerNpcProfile {
  return {
    ...npc,
    lastInteractionDay: day,
    trust: Math.min(100, npc.trust + (sentiment === 'positive' ? 2 : sentiment === 'negative' ? -2 : 0)),
    conversationHistory: [
      { id: `conv-${day}-${npc.conversationHistory.length}`, day, summary, sentiment },
      ...npc.conversationHistory,
    ].slice(0, 20),
  };
}

export function npcTrustSummary(npcs: CareerNpcProfile[]): Record<string, number> {
  return Object.fromEntries(npcs.map((npc) => [npc.id, npc.trust]));
}

export function mentorFeedback(npcs: CareerNpcProfile[]): string[] {
  return npcs
    .filter((npc) => npc.role === 'mentor')
    .flatMap((npc) =>
      npc.recommendations.length
        ? npc.recommendations.slice(0, 2)
        : [`${npc.name} is observing your progress.`]
    );
}
