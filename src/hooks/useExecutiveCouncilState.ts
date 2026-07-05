import {useCallback, useMemo, useState} from 'react';
import { buildExecutiveCouncilSeed } from '../studio-os-core/executive-council/bootstrap';
import {
  bootstrapExecutiveCouncilStore,
  readExecutiveCouncilStore,
  selectExecutiveCouncilWorkspace,
} from '../studio-os-core/executive-council/store';
import type { ExecutiveCouncilWorkspaceId } from '../studio-os-core/executive-council/types';

function ensureSeeded(): void {
  bootstrapExecutiveCouncilStore(buildExecutiveCouncilSeed());
}

export function useExecutiveCouncilState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readExecutiveCouncilStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ExecutiveCouncilWorkspaceId) => {
    selectExecutiveCouncilWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
