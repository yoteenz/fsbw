import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildBrandArchitectSeed } from '../studio-os-core/brand-architect/bootstrap';
import {
  bootstrapBrandArchitectStore,
  readBrandArchitectStore,
  selectBrandArchitectWorkspace,
} from '../studio-os-core/brand-architect/store';
import type { BrandArchitectWorkspaceId } from '../studio-os-core/brand-architect/types';

function ensureSeeded(): void {
  bootstrapBrandArchitectStore(buildBrandArchitectSeed());
}

export function useBrandArchitectState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readBrandArchitectStore();
  }, [version]);

  const selectWorkspace = useCallback((id: BrandArchitectWorkspaceId) => {
    selectBrandArchitectWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
