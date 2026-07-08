import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bootstrapCareerWorld,
  buildCareerHubViewModel,
  CAREER_WORLDS_UPDATED_EVENT,
  listCareerWorlds,
  persistCareerWorldSave,
  syncCareerWorldOnReturn,
  type CareerHubViewModel,
  type CareerWorldBlueprint,
  type CareerWorldSave,
} from '../studio-os-core/career-worlds';
import type { CareerWorldId } from '../studio-os-core/career-worlds/types';

const DEFAULT_LEARNER = 'studio-local-learner';

export function useCareerWorldState(worldId: CareerWorldId, learnerId = DEFAULT_LEARNER) {
  const [save, setSave] = useState<CareerWorldSave | null>(null);
  const [hub, setHub] = useState<CareerHubViewModel | null>(null);

  const refresh = useCallback(() => {
    const next = syncCareerWorldOnReturn(worldId, learnerId);
    setSave(next);
    setHub(buildCareerHubViewModel(next));
  }, [worldId, learnerId]);

  useEffect(() => {
    bootstrapCareerWorld(worldId, learnerId);
    refresh();
  }, [worldId, learnerId, refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(CAREER_WORLDS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CAREER_WORLDS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const updateSave = useCallback(
    (mutator: (current: CareerWorldSave) => CareerWorldSave) => {
      setSave((prev) => {
        if (!prev) return prev;
        const next = mutator(prev);
        persistCareerWorldSave(next);
        setHub(buildCareerHubViewModel(next));
        return next;
      });
    },
    [],
  );

  return { save, hub, refresh, updateSave };
}

export function useCareerWorldCatalog(): CareerWorldBlueprint[] {
  return useMemo(() => listCareerWorlds(), []);
}
