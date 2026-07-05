import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildFoundersPromiseSeed } from '../studio-os-core/founders-promise/bootstrap';
import {
  bootstrapFoundersPromiseStore,
  readFoundersPromiseStore,
  selectFoundersPromiseWorkspace,
} from '../studio-os-core/founders-promise/store';
import type { FoundersPromiseWorkspaceId } from '../studio-os-core/founders-promise/types';

function ensureSeeded(): void {
  bootstrapFoundersPromiseStore(buildFoundersPromiseSeed());
}

export function useFoundersPromiseState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readFoundersPromiseStore();
  }, [version]);

  const selectWorkspace = useCallback((id: FoundersPromiseWorkspaceId) => {
    selectFoundersPromiseWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
