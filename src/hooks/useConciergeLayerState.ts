import { useCallback, useEffect, useState } from 'react';
import { buildConciergeLayerSeed } from '../studio-os-core/concierge-layer/bootstrap';
import {
  bootstrapConciergeLayerStore,
  readConciergeLayerStore,
  selectConciergeLayerWorkspace,
} from '../studio-os-core/concierge-layer/store';
import type { ConciergeLayerWorkspaceId } from '../studio-os-core/concierge-layer/types';

function ensureBootstrap(): void {
  bootstrapConciergeLayerStore(buildConciergeLayerSeed());
}

export function useConciergeLayerState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readConciergeLayerStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readConciergeLayerStore());
  }, []);

  const selectWorkspace = useCallback((id: ConciergeLayerWorkspaceId) => {
    selectConciergeLayerWorkspace(id);
    setStore(readConciergeLayerStore());
  }, []);

  return { store, selectWorkspace };
}
