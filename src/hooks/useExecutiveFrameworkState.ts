import {useCallback, useMemo, useState} from 'react';
import { buildExecutiveFrameworkSeed } from '../studio-os-core/executive-framework/bootstrap';
import {
  bootstrapExecutiveFrameworkStore,
  readExecutiveFrameworkStore,
  selectExecutiveFrameworkWorkspace,
} from '../studio-os-core/executive-framework/store';
import type { ExecutiveFrameworkWorkspaceId } from '../studio-os-core/executive-framework/types';

function ensureSeeded(): void {
  bootstrapExecutiveFrameworkStore(buildExecutiveFrameworkSeed());
}

export function useExecutiveFrameworkState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readExecutiveFrameworkStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ExecutiveFrameworkWorkspaceId) => {
    selectExecutiveFrameworkWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
