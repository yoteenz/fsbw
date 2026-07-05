import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildExperienceArchitectSeed } from '../studio-os-core/experience-architect/bootstrap';
import {
  bootstrapExperienceArchitectStore,
  readExperienceArchitectStore,
  selectExperienceArchitectWorkspace,
} from '../studio-os-core/experience-architect/store';
import type { ExperienceArchitectWorkspaceId } from '../studio-os-core/experience-architect/types';

function ensureSeeded(): void {
  bootstrapExperienceArchitectStore(buildExperienceArchitectSeed());
}

export function useExperienceArchitectState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readExperienceArchitectStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ExperienceArchitectWorkspaceId) => {
    selectExperienceArchitectWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
