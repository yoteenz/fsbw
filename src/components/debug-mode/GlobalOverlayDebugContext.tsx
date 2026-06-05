import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DebugElementOverride } from '../../utils/debugMode';
import {
  clearGlobalOverlayPageConfig,
  getGlobalOverlayRegionOverride,
  GLOBAL_OVERLAY_IDS,
  globalOverlayPageKey,
  notifyGlobalOverlayDebugUpdated,
  patchGlobalOverlayRegion,
  saveGlobalOverlayPageConfig,
  type GlobalOverlayId,
} from '../../utils/globalOverlayDebug';
import { getDebugPageConfig, loadDebugModeStore, type DebugPageConfig } from '../../utils/debugMode';
import { syncPageDebugStoreToCloud } from '../../utils/debugModeSync';

export const GLOBAL_OVERLAY_DEBUG_OPEN_CART_EVENT = 'bawGlobalOverlayDebugOpenCart';
export const GLOBAL_OVERLAY_DEBUG_OPEN_CURRENCY_EVENT = 'bawGlobalOverlayDebugOpenCurrency';

type GlobalOverlayDebugContextValue = {
  editEnabled: boolean;
  editingOverlayId: GlobalOverlayId | null;
  setEditingOverlayId: (id: GlobalOverlayId | null) => void;
  revision: number;
  patchRegion: (overlayId: GlobalOverlayId, regionId: string, patch: Partial<DebugElementOverride>) => void;
  getRegionOverride: (overlayId: GlobalOverlayId, regionId: string) => DebugElementOverride | undefined;
  saveOverlay: (overlayId: GlobalOverlayId) => Promise<void>;
  resetOverlay: (overlayId: GlobalOverlayId) => Promise<void>;
  openCartForEdit: () => void;
  openCurrencyForEdit: () => void;
};

const GlobalOverlayDebugContext = createContext<GlobalOverlayDebugContextValue | null>(null);

export function GlobalOverlayDebugProvider({
  editEnabled,
  children,
}: {
  editEnabled: boolean;
  children: ReactNode;
}) {
  const [editingOverlayId, setEditingOverlayId] = useState<GlobalOverlayId | null>(null);
  const [draftByOverlay, setDraftByOverlay] = useState<
    Partial<Record<GlobalOverlayId, Record<string, DebugElementOverride>>>
  >({});
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!editEnabled) setEditingOverlayId(null);
  }, [editEnabled]);

  useEffect(() => {
    const bump = () => setRevision((v) => v + 1);
    window.addEventListener('bawPageDebugOverridesUpdated', bump);
    return () => window.removeEventListener('bawPageDebugOverridesUpdated', bump);
  }, []);

  const patchRegion = useCallback(
    (overlayId: GlobalOverlayId, regionId: string, patch: Partial<DebugElementOverride>) => {
      setDraftByOverlay((prev) => ({
        ...prev,
        [overlayId]: {
          ...(prev[overlayId] ?? {}),
          [regionId]: { ...(prev[overlayId]?.[regionId] ?? getGlobalOverlayRegionOverride(overlayId, regionId) ?? {}), ...patch },
        },
      }));
      patchGlobalOverlayRegion(overlayId, regionId, patch);
      notifyGlobalOverlayDebugUpdated();
      setRevision((v) => v + 1);
    },
    [],
  );

  const getRegionOverride = useCallback(
    (overlayId: GlobalOverlayId, regionId: string) => {
      void revision;
      const draft = draftByOverlay[overlayId]?.[regionId];
      const saved = getGlobalOverlayRegionOverride(overlayId, regionId);
      return { ...saved, ...draft };
    },
    [draftByOverlay, revision],
  );

  const saveOverlay = useCallback(async (overlayId: GlobalOverlayId) => {
    const pageKey = globalOverlayPageKey(overlayId);
    const current = getDebugPageConfig(pageKey);
    if (current) {
      saveGlobalOverlayPageConfig(overlayId, current);
    }
    setDraftByOverlay((prev) => {
      const next = { ...prev };
      delete next[overlayId];
      return next;
    });
    try {
      await syncPageDebugStoreToCloud(loadDebugModeStore());
    } catch {
      /* local save still applied */
    }
    notifyGlobalOverlayDebugUpdated();
    setRevision((v) => v + 1);
  }, []);

  const resetOverlay = useCallback(async (overlayId: GlobalOverlayId) => {
    clearGlobalOverlayPageConfig(overlayId);
    setDraftByOverlay((prev) => {
      const next = { ...prev };
      delete next[overlayId];
      return next;
    });
    try {
      await syncPageDebugStoreToCloud(loadDebugModeStore());
    } catch {
      /* local reset still applied */
    }
    notifyGlobalOverlayDebugUpdated();
    setRevision((v) => v + 1);
  }, []);

  const openCartForEdit = useCallback(() => {
    setEditingOverlayId('cart-dropdown');
    window.dispatchEvent(new CustomEvent(GLOBAL_OVERLAY_DEBUG_OPEN_CART_EVENT));
  }, []);

  const openCurrencyForEdit = useCallback(() => {
    setEditingOverlayId('currency-modal');
    window.dispatchEvent(new CustomEvent(GLOBAL_OVERLAY_DEBUG_OPEN_CART_EVENT));
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(GLOBAL_OVERLAY_DEBUG_OPEN_CURRENCY_EVENT));
    }, 350);
  }, []);

  const value = useMemo<GlobalOverlayDebugContextValue>(
    () => ({
      editEnabled,
      editingOverlayId,
      setEditingOverlayId,
      revision,
      patchRegion,
      getRegionOverride,
      saveOverlay,
      resetOverlay,
      openCartForEdit,
      openCurrencyForEdit,
    }),
    [
      editEnabled,
      editingOverlayId,
      getRegionOverride,
      openCartForEdit,
      openCurrencyForEdit,
      patchRegion,
      resetOverlay,
      revision,
      saveOverlay,
    ],
  );

  return (
    <GlobalOverlayDebugContext.Provider value={value}>{children}</GlobalOverlayDebugContext.Provider>
  );
}

export function useGlobalOverlayDebug(): GlobalOverlayDebugContextValue | null {
  return useContext(GlobalOverlayDebugContext);
}

export function listGlobalOverlayLabels(): { id: GlobalOverlayId; label: string }[] {
  return [
    { id: 'cart-dropdown', label: 'Cart dropdown' },
    { id: 'currency-modal', label: 'Currency exchange' },
  ];
}

export function overlayHasSavedLayout(overlayId: GlobalOverlayId): boolean {
  const config = getDebugPageConfig(globalOverlayPageKey(overlayId));
  return Boolean(config && Object.keys(config.elements).length > 0);
}

export function formatGlobalOverlayConfigForCopy(overlayId: GlobalOverlayId): string {
  const config = getDebugPageConfig(globalOverlayPageKey(overlayId));
  const payload: DebugPageConfig = config ?? { updatedAt: 0, elements: {} };
  return JSON.stringify({ overlayId, pageKey: globalOverlayPageKey(overlayId), ...payload }, null, 2);
}

export { GLOBAL_OVERLAY_IDS };
