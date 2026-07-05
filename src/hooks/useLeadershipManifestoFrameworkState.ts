import {useCallback, useMemo, useState} from 'react';
import { buildLeadershipManifestoFrameworkSeed } from '../studio-os-core/leadership-manifesto-framework/bootstrap';
import {
  bootstrapLeadershipManifestoFrameworkStore,
  readLeadershipManifestoFrameworkStore,
  selectLeadershipManifestoFrameworkWorkspace,
} from '../studio-os-core/leadership-manifesto-framework/store';
import type { LeadershipManifestoFrameworkWorkspaceId } from '../studio-os-core/leadership-manifesto-framework/types';

function ensureSeeded(): void {
  bootstrapLeadershipManifestoFrameworkStore(buildLeadershipManifestoFrameworkSeed());
}

export function useLeadershipManifestoFrameworkState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readLeadershipManifestoFrameworkStore();
  }, [version]);

  const selectWorkspace = useCallback((id: LeadershipManifestoFrameworkWorkspaceId) => {
    selectLeadershipManifestoFrameworkWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
