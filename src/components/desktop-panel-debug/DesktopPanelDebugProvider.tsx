import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PanelDebugPanelDef } from '../../types/desktopPanelDebug';
import type { PanelDebugMap, PanelDebugPercentRect, PanelDebugSceneId } from '../../types/desktopPanelDebug';
import {
  clampPanelDebugPercentRect,
  formatPanelDebugMapForExport,
  isPanelDebugModeEnabled,
  loadPanelDebugMap,
  loadPanelDebugOverlaysVisible,
  savePanelDebugMap,
  savePanelDebugOverlaysVisible,
} from '../../utils/desktopPanelDebugMode';
import { resolvePanelDebugMap } from '../../utils/desktopPanelDebugSeed';

type DesktopPanelDebugContextValue = {
  sceneId: PanelDebugSceneId;
  panels: PanelDebugPanelDef[];
  panelMap: PanelDebugMap;
  overlaysVisible: boolean;
  selectedPanelId: string | null;
  selectPanel: (id: string) => void;
  patchPanel: (id: string, patch: Partial<PanelDebugPercentRect>) => void;
  setOverlaysVisible: (visible: boolean) => void;
  exportPanelMap: () => Promise<void>;
  resetPanelMap: () => void;
};

const DesktopPanelDebugContext = createContext<DesktopPanelDebugContextValue | null>(null);

type ProviderProps = {
  sceneId: PanelDebugSceneId;
  panels: PanelDebugPanelDef[];
  children: ReactNode;
};

export function DesktopPanelDebugProvider({ sceneId, panels, children }: ProviderProps) {
  const panelIds = useMemo(() => panels.map((p) => p.id), [panels]);
  const debugEnabled = isPanelDebugModeEnabled();

  const [panelMap, setPanelMap] = useState<PanelDebugMap>(() =>
    resolvePanelDebugMap(sceneId, panelIds, loadPanelDebugMap(sceneId)),
  );
  const [overlaysVisible, setOverlaysVisibleState] = useState(() => loadPanelDebugOverlaysVisible());
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(panelIds[0] ?? null);

  useEffect(() => {
    if (!debugEnabled) return;
    setPanelMap(resolvePanelDebugMap(sceneId, panelIds, loadPanelDebugMap(sceneId)));
  }, [debugEnabled, sceneId, panelIds]);

  useEffect(() => {
    if (!debugEnabled) return;
    savePanelDebugMap(sceneId, panelMap);
  }, [debugEnabled, sceneId, panelMap]);

  const selectPanel = useCallback((id: string) => {
    setSelectedPanelId(id);
  }, []);

  const patchPanel = useCallback((id: string, patch: Partial<PanelDebugPercentRect>) => {
    setPanelMap((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: clampPanelDebugPercentRect({ ...current, ...patch }),
      };
    });
  }, []);

  const setOverlaysVisible = useCallback((visible: boolean) => {
    setOverlaysVisibleState(visible);
    savePanelDebugOverlaysVisible(visible);
  }, []);

  const exportPanelMap = useCallback(async () => {
    await navigator.clipboard.writeText(formatPanelDebugMapForExport(panelMap));
  }, [panelMap]);

  const resetPanelMap = useCallback(() => {
    const fresh = resolvePanelDebugMap(sceneId, panelIds, null);
    setPanelMap(fresh);
    savePanelDebugMap(sceneId, fresh);
  }, [sceneId, panelIds]);

  const value = useMemo(
    () => ({
      sceneId,
      panels,
      panelMap,
      overlaysVisible,
      selectedPanelId,
      selectPanel,
      patchPanel,
      setOverlaysVisible,
      exportPanelMap,
      resetPanelMap,
    }),
    [
      sceneId,
      panels,
      panelMap,
      overlaysVisible,
      selectedPanelId,
      selectPanel,
      patchPanel,
      setOverlaysVisible,
      exportPanelMap,
      resetPanelMap,
    ],
  );

  if (!debugEnabled) {
    return <>{children}</>;
  }

  return (
    <DesktopPanelDebugContext.Provider value={value}>{children}</DesktopPanelDebugContext.Provider>
  );
}

export function useDesktopPanelDebug(): DesktopPanelDebugContextValue | null {
  return useContext(DesktopPanelDebugContext);
}

export function useDesktopPanelDebugRequired(): DesktopPanelDebugContextValue {
  const ctx = useContext(DesktopPanelDebugContext);
  if (!ctx) {
    throw new Error('useDesktopPanelDebugRequired must be used within DesktopPanelDebugProvider');
  }
  return ctx;
}
