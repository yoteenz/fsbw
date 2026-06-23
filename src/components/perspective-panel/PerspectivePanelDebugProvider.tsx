import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  PERSPECTIVE_PANEL_DEFINITIONS,
  PERSPECTIVE_PANEL_BY_ID,
} from '../../constants/perspectivePanelConfig';
import type {
  PerspectivePanelCornerId,
  PerspectivePanelId,
  PerspectivePanelMap,
  PerspectivePanelPoint,
  PerspectivePanelQuad,
} from '../../types/perspectivePanel';
import {
  clampPerspectivePanelPoint,
  clampPerspectivePanelQuad,
  formatPerspectivePanelMapForExport,
  perspectivePanelQuadsEqual,
} from '../../utils/perspectivePanelQuad';
import {
  copyPerspectivePanelDebugText,
  isPerspectivePanelDebugEnabled,
  resolvePerspectivePanelPage,
} from '../../utils/perspectivePanelDebug';
import {
  clearPerspectivePanelOverride,
  loadPerspectivePanelOverrides,
  resolvePerspectivePanelQuad,
  savePerspectivePanelOverrides,
} from '../../utils/perspectivePanelStorage';
import { defaultPerspectivePanelQuad } from '../../constants/perspectivePanelConfig';

export type PerspectivePanelSaveStatus = 'idle' | 'saved' | 'failed';

type ContextValue = {
  debugEnabled: boolean;
  currentPage: ReturnType<typeof resolvePerspectivePanelPage>;
  panelOverrides: PerspectivePanelMap;
  selectedPanelId: PerspectivePanelId;
  editAll: boolean;
  overlaysVisible: boolean;
  saveStatus: PerspectivePanelSaveStatus;
  selectPanel: (id: PerspectivePanelId) => void;
  setEditAll: (value: boolean) => void;
  setOverlaysVisible: (value: boolean) => void;
  resolveQuad: (id: PerspectivePanelId) => PerspectivePanelQuad;
  patchCorner: (id: PerspectivePanelId, cornerId: PerspectivePanelCornerId, point: PerspectivePanelPoint) => void;
  resetSelectedPanel: () => void;
  copyJson: () => Promise<boolean>;
  importJson: (json: string) => boolean;
  save: () => boolean;
  isPanelEditable: (id: PerspectivePanelId) => boolean;
  isPanelHighlighted: (id: PerspectivePanelId) => boolean;
};

const PerspectivePanelDebugContext = createContext<ContextValue | null>(null);

function buildInitialOverrides(): PerspectivePanelMap {
  return loadPerspectivePanelOverrides();
}

export function PerspectivePanelDebugProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const debugEnabled = isPerspectivePanelDebugEnabled();
  const currentPage = resolvePerspectivePanelPage(location.pathname, location.search);

  const pagePanelIds = useMemo(() => {
    if (!currentPage) return [] as PerspectivePanelId[];
    return PERSPECTIVE_PANEL_DEFINITIONS.filter((p) => p.page === currentPage).map((p) => p.id);
  }, [currentPage]);

  const [panelOverrides, setPanelOverrides] = useState<PerspectivePanelMap>(buildInitialOverrides);
  const [selectedPanelId, setSelectedPanelId] = useState<PerspectivePanelId>(
    () => pagePanelIds[0] ?? PERSPECTIVE_PANEL_DEFINITIONS[0].id,
  );
  const [editAll, setEditAll] = useState(false);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [saveStatus, setSaveStatus] = useState<PerspectivePanelSaveStatus>('idle');

  useEffect(() => {
    if (pagePanelIds.length === 0) return;
    setSelectedPanelId((prev) => (pagePanelIds.includes(prev) ? prev : pagePanelIds[0]));
  }, [pagePanelIds]);

  const resolveQuad = useCallback(
    (id: PerspectivePanelId) => resolvePerspectivePanelQuad(id, panelOverrides),
    [panelOverrides],
  );

  const patchCorner = useCallback(
    (id: PerspectivePanelId, cornerId: PerspectivePanelCornerId, point: PerspectivePanelPoint) => {
      setPanelOverrides((prev) => {
        const current = resolvePerspectivePanelQuad(id, prev);
        return {
          ...prev,
          [id]: clampPerspectivePanelQuad({
            ...current,
            [cornerId]: clampPerspectivePanelPoint(point),
          }),
        };
      });
      setSaveStatus('idle');
    },
    [],
  );

  const resetSelectedPanel = useCallback(() => {
    clearPerspectivePanelOverride(selectedPanelId);
    setPanelOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedPanelId];
      return next;
    });
    setSaveStatus('idle');
  }, [selectedPanelId]);

  const copyJson = useCallback(async () => {
    const exportMap: PerspectivePanelMap = {};
    for (const panel of PERSPECTIVE_PANEL_DEFINITIONS) {
      exportMap[panel.id] = resolvePerspectivePanelQuad(panel.id, panelOverrides);
    }
    const text = formatPerspectivePanelMapForExport(exportMap);
    return copyPerspectivePanelDebugText(text);
  }, [panelOverrides]);

  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (!parsed || typeof parsed !== 'object') return false;

      const record = parsed as Record<string, unknown>;
      const source =
        record.panels && typeof record.panels === 'object'
          ? (record.panels as PerspectivePanelMap)
          : (record as PerspectivePanelMap);

      const next: PerspectivePanelMap = { ...panelOverrides };
      for (const [rawId, quad] of Object.entries(source)) {
        const id = rawId as PerspectivePanelId;
        if (!PERSPECTIVE_PANEL_BY_ID[id]) continue;
        if (!quad || typeof quad !== 'object') continue;
        const q = quad as PerspectivePanelQuad;
        if (!q.topLeft || !q.topRight || !q.bottomRight || !q.bottomLeft) continue;
        next[id] = clampPerspectivePanelQuad(q);
      }
      setPanelOverrides(next);
      setSaveStatus('idle');
      return true;
    } catch {
      return false;
    }
  }, [panelOverrides]);

  const save = useCallback(() => {
    const ok = savePerspectivePanelOverrides(panelOverrides);
    setSaveStatus(ok ? 'saved' : 'failed');
    return ok;
  }, [panelOverrides]);

  const isPanelEditable = useCallback(
    (id: PerspectivePanelId) => {
      if (!debugEnabled || !overlaysVisible) return false;
      if (editAll) return true;
      return id === selectedPanelId;
    },
    [debugEnabled, overlaysVisible, editAll, selectedPanelId],
  );

  const isPanelHighlighted = useCallback(
    (id: PerspectivePanelId) => {
      if (!debugEnabled || !overlaysVisible) return false;
      if (editAll) return true;
      return id === selectedPanelId;
    },
    [debugEnabled, overlaysVisible, editAll, selectedPanelId],
  );

  const value = useMemo(
    () => ({
      debugEnabled,
      currentPage,
      panelOverrides,
      selectedPanelId,
      editAll,
      overlaysVisible,
      saveStatus,
      selectPanel: setSelectedPanelId,
      setEditAll,
      setOverlaysVisible,
      resolveQuad,
      patchCorner,
      resetSelectedPanel,
      copyJson,
      importJson,
      save,
      isPanelEditable,
      isPanelHighlighted,
    }),
    [
      debugEnabled,
      currentPage,
      panelOverrides,
      selectedPanelId,
      editAll,
      overlaysVisible,
      saveStatus,
      resolveQuad,
      patchCorner,
      resetSelectedPanel,
      copyJson,
      importJson,
      save,
      isPanelEditable,
      isPanelHighlighted,
    ],
  );

  return (
    <PerspectivePanelDebugContext.Provider value={value}>
      {children}
    </PerspectivePanelDebugContext.Provider>
  );
}

export function usePerspectivePanelDebug(): ContextValue | null {
  return useContext(PerspectivePanelDebugContext);
}

export function usePerspectivePanelQuad(id: PerspectivePanelId): PerspectivePanelQuad {
  const ctx = useContext(PerspectivePanelDebugContext);
  if (ctx) return ctx.resolveQuad(id);
  return resolvePerspectivePanelQuad(id);
}

export function panelHasCustomQuad(id: PerspectivePanelId, quad: PerspectivePanelQuad): boolean {
  const defaults = defaultPerspectivePanelQuad(id);
  return !perspectivePanelQuadsEqual(quad, defaults);
}
