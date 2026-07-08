import type { TournamentLearningRecord } from './future-tournament-types';

export function defaultTournamentLearning(): TournamentLearningRecord {
  return {
    acceptedRecommendations: 0,
    rejectedRecommendations: 0,
    preferredArchetypes: [],
    mergePatterns: [],
    creativePriorities: ['brand-alignment', 'asset-reuse', 'environmental-storytelling'],
    founderOverrides: [],
  };
}

export function recordTournamentLearning(
  learning: TournamentLearningRecord,
  action: TournamentLearningRecord['founderOverrides'][0]['action'],
  detail?: string,
  conceptId?: string,
  archetype?: string
): TournamentLearningRecord {
  const at = new Date().toISOString();
  const overrides = [{ at, action, conceptId, detail }, ...learning.founderOverrides].slice(0, 40);

  if (action === 'accept-chairman') {
    return { ...learning, acceptedRecommendations: learning.acceptedRecommendations + 1, founderOverrides: overrides };
  }
  if (action === 'reject-chairman') {
    return { ...learning, rejectedRecommendations: learning.rejectedRecommendations + 1, founderOverrides: overrides };
  }
  if (action === 'pick-finalist' && archetype && !learning.preferredArchetypes.includes(archetype)) {
    return {
      ...learning,
      preferredArchetypes: [...learning.preferredArchetypes, archetype].slice(0, 12),
      founderOverrides: overrides,
    };
  }
  if (action === 'request-merge') {
    return {
      ...learning,
      mergePatterns: [...learning.mergePatterns, detail ?? 'ingredient-merge'].slice(0, 16),
      founderOverrides: overrides,
    };
  }
  return { ...learning, founderOverrides: overrides };
}
