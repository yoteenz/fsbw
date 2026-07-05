import {useCallback, useMemo, useState} from 'react';
import { buildCampusEvolutionSeed } from '../studio-os-core/campus-evolution-engine/bootstrap';
import {
  bootstrapCampusEvolutionStore,
  readCampusEvolutionStore,
  selectCampusEvolutionWorkspace,
  setCampusStageFocus,
} from '../studio-os-core/campus-evolution-engine/store';
import type { CampusEvolutionWorkspaceId, CampusStageId } from '../studio-os-core/campus-evolution-engine/types';

function ensureSeeded(): void {
  bootstrapCampusEvolutionStore(buildCampusEvolutionSeed());
}

export function useCampusEvolutionEngineState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readCampusEvolutionStore();
  }, [version]);

  const selectWorkspace = useCallback((id: CampusEvolutionWorkspaceId) => {
    selectCampusEvolutionWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const focusStage = useCallback((stageId: CampusStageId) => {
    setCampusStageFocus(stageId);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace, focusStage };
}
