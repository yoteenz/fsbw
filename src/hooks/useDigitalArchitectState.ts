import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildDigitalArchitectSeed } from '../studio-os-core/digital-architect/bootstrap';
import {
  bootstrapDigitalArchitectStore,
  readDigitalArchitectStore,
  selectDigitalArchitectWorkspace,
} from '../studio-os-core/digital-architect/store';
import type { DigitalArchitectWorkspaceId } from '../studio-os-core/digital-architect/types';

function ensureSeeded(): void {
  bootstrapDigitalArchitectStore(buildDigitalArchitectSeed());
}

export function useDigitalArchitectState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readDigitalArchitectStore();
  }, [version]);

  const selectWorkspace = useCallback((id: DigitalArchitectWorkspaceId) => {
    selectDigitalArchitectWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
