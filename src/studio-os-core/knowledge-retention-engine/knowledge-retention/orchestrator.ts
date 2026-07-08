/**
 * Knowledge Retention Engine™ — orchestration layer.
 * Reusable across every Career World; no single-profession hardcoding.
 */

import { buildRetentionAnalyticsSnapshot } from '../memory-engine/analytics';
import {
  appendIndustryUpdates,
  appendReviewRecord,
  ensureKnowledgeRetentionStore,
  queueRefresherSpecs,
  upsertKnowledgeRetentionStore,
} from '../memory-engine/store';
import { generateRefresherSpecsForEvaluation } from '../refresher-generator/generator';
import { patchRetentionProfile, recordProfileReviewCompletion } from '../retention-profiles/profile-store';
import { buildRetentionPlan } from '../review-engine/evaluator';
import { runRetentionScheduler } from '../review-engine/scheduler';
import type {
  KnowledgeIndustryUpdate,
  KnowledgeRetentionProfile,
  KnowledgeRetentionStore,
  RefresherExperienceSpec,
  RetentionAnalyticsSnapshot,
  RetentionPlan,
  RetentionReviewRecord,
} from '../types';

export type KnowledgeRetentionState = {
  store: KnowledgeRetentionStore;
  plan: RetentionPlan;
  analytics: RetentionAnalyticsSnapshot;
};

export function bootstrapKnowledgeRetention(
  organizationId: string,
  learnerId: string
): KnowledgeRetentionStore {
  return ensureKnowledgeRetentionStore(organizationId, learnerId);
}

export function syncKnowledgeRetention(
  organizationId: string,
  learnerId: string,
  options?: { forceScheduler?: boolean }
): KnowledgeRetentionState {
  const { store, plan } = runRetentionScheduler(organizationId, learnerId, {
    force: options?.forceScheduler,
  });
  const analytics = buildRetentionAnalyticsSnapshot({
    organizationId,
    learnerId,
    profiles: store.profiles,
    industryUpdates: store.industryUpdates,
    reviewHistory: store.reviewHistory,
  });
  return { store, plan, analytics };
}

export function getRetentionPlan(
  organizationId: string,
  learnerId: string
): RetentionPlan {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  return buildRetentionPlan(
    organizationId,
    learnerId,
    store.profiles,
    store.industryUpdates
  );
}

export function updateRetentionProfile(
  organizationId: string,
  learnerId: string,
  profileId: string,
  patch: Partial<KnowledgeRetentionProfile>
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  return upsertKnowledgeRetentionStore({
    ...store,
    profiles: patchRetentionProfile(store.profiles, profileId, patch),
  });
}

export function ingestIndustryKnowledgeUpdates(
  organizationId: string,
  learnerId: string,
  updates: KnowledgeIndustryUpdate[]
): KnowledgeRetentionState {
  const store = appendIndustryUpdates(organizationId, learnerId, updates);
  const affectedProfiles = store.profiles.map((profile) => {
    const relevant = updates.filter((update) => update.conceptId === profile.id);
    if (!relevant.length) return profile;
    const latest = relevant.sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))[0];
    return {
      ...profile,
      industryUpdateCount: profile.industryUpdateCount + relevant.length,
      industryVersion: latest.industryVersion,
    };
  });

  const nextStore = upsertKnowledgeRetentionStore({ ...store, profiles: affectedProfiles });
  const plan = buildRetentionPlan(
    organizationId,
    learnerId,
    nextStore.profiles,
    nextStore.industryUpdates
  );
  const specs = plan.updateImpacts.map((impact) => {
    const profile = nextStore.profiles.find((item) => item.id === impact.conceptId);
    if (!profile) return null;
    const evaluation = plan.evaluations.find((item) => item.profileId === impact.conceptId);
    if (!evaluation) return null;
    return generateRefresherSpecsForEvaluation(profile, evaluation)[0] ?? null;
  }).filter((spec): spec is RefresherExperienceSpec => Boolean(spec));

  queueRefresherSpecs(organizationId, learnerId, specs);
  const synced = syncKnowledgeRetention(organizationId, learnerId, { forceScheduler: true });
  return synced;
}

export function completeRetentionReview(
  organizationId: string,
  learnerId: string,
  record: RetentionReviewRecord
): KnowledgeRetentionStore {
  const store = ensureKnowledgeRetentionStore(organizationId, learnerId);
  const profile = store.profiles.find((item) => item.id === record.profileId);
  if (!profile) return store;

  const updatedProfiles = store.profiles.map((item) =>
    item.id === profile.id
      ? recordProfileReviewCompletion(item, record.confidenceDelta, record.recallDelta)
      : item
  );

  appendReviewRecord(organizationId, learnerId, record);
  return upsertKnowledgeRetentionStore({ ...store, profiles: updatedProfiles });
}

export { runRetentionScheduler, buildRetentionPlan };
