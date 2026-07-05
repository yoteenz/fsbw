import {useCallback, useMemo, useState} from 'react';
import { buildWorkOrchestrationSeed } from '../studio-os-core/work-orchestration/bootstrap';
import {
  bootstrapWorkOrchestrationStore,
  readWorkOrchestrationStore,
  selectWorkOrchestrationPackage,
  selectWorkOrchestrationWorkspace,
  setWorkOrchestrationTimelineZoom,
} from '../studio-os-core/work-orchestration/store';
import type { TimelineZoom, WorkOrchestrationWorkspaceId } from '../studio-os-core/work-orchestration/types';

function ensureSeeded(): void {
  bootstrapWorkOrchestrationStore(buildWorkOrchestrationSeed());
}

export function useWorkOrchestrationState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readWorkOrchestrationStore();
  }, [version]);

  const selectedPackage = useMemo(
    () => store.workPackages.find((p) => p.id === store.selectedWorkPackageId) ?? store.workPackages[0] ?? null,
    [store.workPackages, store.selectedWorkPackageId]
  );

  const packageActivities = useMemo(
    () => (selectedPackage ? store.activities.filter((a) => a.workPackageId === selectedPackage.id) : []),
    [store.activities, selectedPackage]
  );

  const workspacePackages = useMemo(
    () => store.workPackages.filter((p) => p.workspaceId === store.activeWorkspaceId),
    [store.workPackages, store.activeWorkspaceId]
  );

  const selectWorkspace = useCallback((id: WorkOrchestrationWorkspaceId) => {
    selectWorkOrchestrationWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectPackage = useCallback((id: string | null) => {
    selectWorkOrchestrationPackage(id);
    setVersion((v) => v + 1);
  }, []);

  const setTimelineZoom = useCallback((zoom: TimelineZoom) => {
    setWorkOrchestrationTimelineZoom(zoom);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedPackage,
    packageActivities,
    workspacePackages,
    selectWorkspace,
    selectPackage,
    setTimelineZoom,
  };
}
