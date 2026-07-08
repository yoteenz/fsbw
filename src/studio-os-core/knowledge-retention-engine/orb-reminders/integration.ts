import type { OrbRecommendation } from '../../orb-recommendations/types';
import { ensureKnowledgeRetentionStore } from '../memory-engine/store';
import { runRetentionScheduler } from '../review-engine/scheduler';
import { buildOrbRetentionReminders } from './generator';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Build optional Orb recommendations from retention reminders — never mandatory language. */
export function buildRetentionOrbRecommendations(
  organizationId: string,
  learnerId: string
): OrbRecommendation[] {
  const { plan } = runRetentionScheduler(organizationId, learnerId);
  const reminders = buildOrbRetentionReminders(plan.priorityQueue);

  return reminders.map((reminder) => ({
    id: uid('orb-retention-rec'),
    title: reminder.line,
    reasoning: `${reminder.conceptTitle} — optional refresher. The learner chooses depth; nothing is overdue.`,
    category: 'knowledge-refresh' as OrbRecommendation['category'],
    priority: reminder.priority === 'high' ? 'medium' : 'low',
    estimatedImpact: 'moderate',
    estimatedMinutes: reminder.priority === 'high' ? 8 : 5,
    estimatedCost: '$0 — optional professional memory',
    potentialSavings: null,
    departmentsAffected: ['Studio Institute', 'Career Worlds'],
    creativeEquityGained: '+15 Mastery Equity',
    confidenceScore: 88,
    targetPath: '/admin/studio/career-worlds',
    actionable: true,
  }));
}

export function readTopRetentionAmbientLine(
  organizationId: string,
  learnerId: string
): string | null {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  const { plan } = runRetentionScheduler(organizationId, learnerId);
  void store;
  const reminders = buildOrbRetentionReminders(plan.priorityQueue);
  return reminders[0]?.line ?? null;
}
