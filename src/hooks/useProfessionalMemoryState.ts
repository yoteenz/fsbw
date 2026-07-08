import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PROFESSIONAL_MEMORY_UPDATED_EVENT,
  bootstrapProfessionalMemory,
  syncProfessionalMemory,
  type ProfessionalMemoryState,
  type ProfessionalMemoryStore,
  type ProfessionalTimeline,
  type WisdomRecommendation,
} from '../studio-os-core/professional-memory-wisdom-engine';

const DEFAULT_ORG = 'frontal-slayer';
const DEFAULT_LEARNER = 'studio-local-learner';

export function useProfessionalMemoryState(
  organizationId = DEFAULT_ORG,
  learnerId = DEFAULT_LEARNER,
  options?: { profession?: string; worldId?: string }
) {
  const [store, setStore] = useState<ProfessionalMemoryStore | null>(null);
  const [timeline, setTimeline] = useState<ProfessionalTimeline | null>(null);
  const [wisdomRecommendation, setWisdomRecommendation] = useState<WisdomRecommendation | null>(
    null
  );

  const refresh = useCallback(
    (question?: string) => {
      const next = syncProfessionalMemory(organizationId, learnerId, {
        profession: options?.profession,
        worldId: options?.worldId,
        question,
      });
      setStore(next.store);
      setTimeline(next.timeline);
      setWisdomRecommendation(next.wisdomRecommendation);
    },
    [organizationId, learnerId, options?.profession, options?.worldId]
  );

  useEffect(() => {
    bootstrapProfessionalMemory(organizationId, learnerId, options?.profession);
    refresh();
  }, [organizationId, learnerId, options?.profession, options?.worldId, refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(PROFESSIONAL_MEMORY_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(PROFESSIONAL_MEMORY_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const state: ProfessionalMemoryState | null = useMemo(() => {
    if (!store || !timeline) return null;
    return { store, timeline, wisdomRecommendation };
  }, [store, timeline, wisdomRecommendation]);

  return { store, timeline, wisdomRecommendation, state, refresh };
}
