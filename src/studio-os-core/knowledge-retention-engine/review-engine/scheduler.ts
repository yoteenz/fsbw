import { RETENTION_SCHEDULER_INTERVAL_MS } from '../constants';
import { generateRefresherSpecsForEvaluations } from '../refresher-generator/generator';
import { ensureKnowledgeRetentionStore, upsertKnowledgeRetentionStore } from '../memory-engine/store';
import type { KnowledgeRetentionStore, RetentionPlan } from '../types';
import { buildRetentionPlan } from './evaluator';
import { nextSchedulerRunAt, shouldRunRetentionScheduler } from './triggers';

export type RetentionSchedulerResult = {
  store: KnowledgeRetentionStore;
  plan: RetentionPlan;
  ranScheduler: boolean;
};

/** Periodic evaluation — respects scheduler interval unless forced. */
export function runRetentionScheduler(
  organizationId: string,
  learnerId: string,
  options: { force?: boolean; now?: Date } = {}
): RetentionSchedulerResult {
  const now = options.now ?? new Date();
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  const shouldRun =
    options.force ||
    shouldRunRetentionScheduler(store.lastSchedulerRunAt, RETENTION_SCHEDULER_INTERVAL_MS, now);

  const plan = buildRetentionPlan(
    organizationId,
    learnerId,
    store.profiles,
    store.industryUpdates,
    now
  );

  if (!shouldRun) {
    return { store, plan, ranScheduler: false };
  }

  const specs = generateRefresherSpecsForEvaluations(plan.priorityQueue, store.profiles);
  const nextStore = upsertKnowledgeRetentionStore({
    ...store,
    queuedRefreshers: specs,
    lastSchedulerRunAt: now.toISOString(),
    scheduledReviewAt: nextSchedulerRunAt(RETENTION_SCHEDULER_INTERVAL_MS, now),
  });

  return { store: nextStore, plan, ranScheduler: true };
}

export function evaluateAllProfiles(store: KnowledgeRetentionStore, now = new Date()): RetentionPlan {
  return buildRetentionPlan(
    store.organizationId,
    store.learnerId,
    store.profiles,
    store.industryUpdates,
    now
  );
}
