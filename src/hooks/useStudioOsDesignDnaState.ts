import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureStudioOsDesignDnaSubsystem,
  getStudioOsDesignDnaReadyView,
  setActiveDepartmentTheme,
  GENESIS_UPDATED_EVENT,
  type DdnaRoomPath,
} from '../studio-os-core/genesis';

export function useStudioOsDesignDnaState(founderDisplayName = 'Founder') {
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [previewDepartmentId, setPreviewDepartmentId] = useState<string | undefined>();

  const refresh = useCallback(() => {
    ensureStudioOsDesignDnaSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureStudioOsDesignDnaSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(
    () =>
      getStudioOsDesignDnaReadyView({
        pathname: location.pathname,
        departmentId: previewDepartmentId,
        founderDisplayName,
      }),
    [location.pathname, previewDepartmentId, founderDisplayName, tick]
  );

  const selectDepartment = useCallback(
    (departmentId: string) => {
      setActiveDepartmentTheme(departmentId);
      setPreviewDepartmentId(departmentId);
      refresh();
    },
    [refresh]
  );

  const activeRoom = (location.pathname.split('/').pop() ?? 'design-dna') as DdnaRoomPath;

  return {
    view,
    activeRoom,
    previewDepartmentId: previewDepartmentId ?? view.activeDepartmentId,
    selectDepartment,
    refresh,
  };
}
