import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
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
  PERSPECTIVE_PANEL_STORAGE_KEY,
  PERSPECTIVE_PANEL_UPDATED_EVENT,
  resolvePerspectivePanelQuad,
  savePerspectivePanelOverrides,
} from '../../utils/perspectivePanelStorage';
import { syncPerspectivePanelMapToCloud } from '../../utils/perspectivePanelSync';
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
  const dirtyRef = useRef(false);
  const suppressReloadRef = useRef(false);
  const draftSaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pagePanelIds.length === 0) return;
    setSelectedPanelId((prev) => (pagePanelIds.includes(prev) ? prev : pagePanelIds[0]));
  }, [pagePanelIds]);

  const reloadFromStorage = useCallback(() => {
    if (!isPerspectivePanelDebugEnabled()) {
      setPanelOverrides({});
      return;
    }
    if (dirtyRef.current) return;
    setPanelOverrides(loadPerspectivePanelOverrides());
    setSaveStatus('idle');
  }, []);

  const scheduleDraftSave = useCallback((map: PerspectivePanelMap) => {
    if (!isPerspectivePanelDebugEnabled()) return;
    if (draftSaveTimerRef.current != null) {
      window.clearTimeout(draftSaveTimerRef.current);
    }
    draftSaveTimerRef.current = window.setTimeout(() => {
      draftSaveTimerRef.current = null;
      suppressReloadRef.current = true;
      savePerspectivePanelOverrides(map, { silent: true });
      suppressReloadRef.current = false;
    }, 350);
  }, []);

  useEffect(() => {
    if (!debugEnabled) {
      dirtyRef.current = false;
      setPanelOverrides({});
      return;
    }
    reloadFromStorage();
    const onStorage = (event: StorageEvent) => {
      if (event.key != null && event.key !== PERSPECTIVE_PANEL_STORAGE_KEY) return;
      if (dirtyRef.current || suppressReloadRef.current) return;
      reloadFromStorage();
    };
    const onUpdated = () => {
      if (dirtyRef.current || suppressReloadRef.current) return;
      reloadFromStorage();
    };
    window.addEventListener(PERSPECTIVE_PANEL_UPDATED_EVENT, onUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(PERSPECTIVE_PANEL_UPDATED_EVENT, onUpdated);
      window.removeEventListener('storage', onStorage);
      if (draftSaveTimerRef.current != null) {
        window.clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [debugEnabled, reloadFromStorage]);

  const resolveQuad = useCallback(
    (id: PerspectivePanelId) => {
      if (!debugEnabled) return defaultPerspectivePanelQuad(id);
      return resolvePerspectivePanelQuad(id, panelOverrides);
    },
    [debugEnabled, panelOverrides],
  );

  const patchCorner = useCallback(
    (id: PerspectivePanelId, cornerId: PerspectivePanelCornerId, point: PerspectivePanelPoint) => {
      dirtyRef.current = true;
      setPanelOverrides((prev) => {
        const current = resolvePerspectivePanelQuad(id, prev);
        const next = {
          ...prev,
          [id]: clampPerspectivePanelQuad({
            ...current,
            [cornerId]: clampPerspectivePanelPoint(point),
          }),
        };
        scheduleDraftSave(next);
        return next;
      });
      setSaveStatus('idle');
    },
    [scheduleDraftSave],
  );

  const resetSelectedPanel = useCallback(() => {
    if (draftSaveTimerRef.current != null) {
      window.clearTimeout(draftSaveTimerRef.current);
      draftSaveTimerRef.current = null;
    }
    dirtyRef.current = false;
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
      dirtyRef.current = false;
      savePerspectivePanelOverrides(next);
      if (canAccessPageDebugMode()) {
        void syncPerspectivePanelMapToCloud(next).catch(() => {
          /* ignore */
        });
      }
      setSaveStatus('idle');
      return true;
    } catch {
      return false;
    }
  }, [panelOverrides]);

  const save = useCallback(() => {
    if (draftSaveTimerRef.current != null) {
      window.clearTimeout(draftSaveTimerRef.current);
      draftSaveTimerRef.current = null;
    }
    const ok = savePerspectivePanelOverrides(panelOverrides);
    dirtyRef.current = false;
    if (ok && canAccessPageDebugMode()) {
      void syncPerspectivePanelMapToCloud(panelOverrides).catch(() => {
        /* local save still valid */
      });
    }
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
  if (!isPerspectivePanelDebugEnabled()) return defaultPerspectivePanelQuad(id);
  return resolvePerspectivePanelQuad(id);
}

export function panelHasCustomQuad(id: PerspectivePanelId, quad: PerspectivePanelQuad): boolean {
  const defaults = defaultPerspectivePanelQuad(id);
  return !perspectivePanelQuadsEqual(quad, defaults);
}
