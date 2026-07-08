import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KNOWLEDGE_RETENTION_UPDATED_EVENT,
  bootstrapKnowledgeRetention,
  syncKnowledgeRetention,
  type KnowledgeRetentionState,
  type KnowledgeRetentionStore,
  type RetentionPlan,
  type RetentionAnalyticsSnapshot,
} from '../studio-os-core/knowledge-retention-engine';

const DEFAULT_ORG = 'frontal-slayer';
const DEFAULT_LEARNER = 'studio-local-learner';

export function useKnowledgeRetentionState(
  organizationId = DEFAULT_ORG,
  learnerId = DEFAULT_LEARNER
) {
  const [store, setStore] = useState<KnowledgeRetentionStore | null>(null);
  const [plan, setPlan] = useState<RetentionPlan | null>(null);
  const [analytics, setAnalytics] = useState<RetentionAnalyticsSnapshot | null>(null);

  const refresh = useCallback(
    (options?: { forceScheduler?: boolean }) => {
      const next = syncKnowledgeRetention(organizationId, learnerId, options);
      setStore(next.store);
      setPlan(next.plan);
      setAnalytics(next.analytics);
    },
    [organizationId, learnerId]
  );

  useEffect(() => {
    bootstrapKnowledgeRetention(organizationId, learnerId);
    refresh();
  }, [organizationId, learnerId, refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(KNOWLEDGE_RETENTION_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(KNOWLEDGE_RETENTION_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const state: KnowledgeRetentionState | null = useMemo(() => {
    if (!store || !plan || !analytics) return null;
    return { store, plan, analytics };
  }, [store, plan, analytics]);

  return { store, plan, analytics, state, refresh };
}
