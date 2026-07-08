import type { OrbRetentionReminder, RefresherModeId, RetentionEvaluation } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function priorityFromEvaluation(evaluation: RetentionEvaluation): 'low' | 'medium' | 'high' {
  if (evaluation.status === 'critical' || evaluation.status === 'changed') return 'high';
  if (evaluation.status === 'needs-refresh') return 'medium';
  return 'low';
}

function contextFromEvaluation(evaluation: RetentionEvaluation): OrbRetentionReminder['context'] {
  if (evaluation.triggers.includes('industry-standard-update')) return 'industry-update';
  if (evaluation.triggers.includes('upcoming-simulation')) return 'simulation-prep';
  if (evaluation.triggers.includes('certification-deadline')) return 'certification';
  if (evaluation.triggers.includes('time-elapsed')) return 'time-since';
  if (evaluation.masteryScore >= 75) return 'mastered-refresh';
  return 'before-appointment';
}

export function buildOrbRetentionReminder(evaluation: RetentionEvaluation): OrbRetentionReminder {
  const suggestedModeId = evaluation.recommendedModes[0]?.id ?? 'memory-spark';

  return {
    id: uid('orb-retention'),
    profileId: evaluation.profileId,
    conceptTitle: evaluation.conceptTitle,
    line: evaluation.orbMentorLine,
    context: contextFromEvaluation(evaluation),
    optional: true,
    suggestedModeId: suggestedModeId as RefresherModeId,
    priority: priorityFromEvaluation(evaluation),
  };
}

export function buildOrbRetentionReminders(evaluations: RetentionEvaluation[]): OrbRetentionReminder[] {
  return evaluations
    .filter((evaluation) => evaluation.status !== 'fresh')
    .sort((a, b) => b.decayRiskScore - a.decayRiskScore)
    .slice(0, 5)
    .map((evaluation) => buildOrbRetentionReminder(evaluation));
}

export const ORB_RETENTION_CONTEXT_LINES: Record<OrbRetentionReminder['context'], string[]> = {
  'before-appointment': [
    "Before today's first appointment...",
    'Ahead of your next client block...',
  ],
  'time-since': [
    "It's been a while since...",
    'Your last real use of this skill was some time ago...',
  ],
  'industry-update': [
    'A new industry technique is now available...',
    'Profession Brain™ has updated this standard...',
  ],
  'mastered-refresh': [
    "You've mastered this skill before—want a quick refresh?",
    'This is already in your professional memory — a spark could sharpen it.',
  ],
  'simulation-prep': [
    'Your upcoming simulation is a natural refresher moment...',
    'Practice is waiting in your next simulation...',
  ],
  certification: [
    'Certification standards may have shifted — optional renewal available.',
    'Credential relevance is high — a renewal pass is available if you want it.',
  ],
};
