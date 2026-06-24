import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  DesktopNotificationsLayout,
  DesktopNotificationsPercentRect,
  DesktopNotificationsRectRegionId,
} from '../../types/desktopNotifications';
import {
  DESKTOP_NOTIFICATIONS_DEBUG_PANELS,
  DESKTOP_NOTIFICATIONS_LAYOUT_SEED,
  cloneDesktopNotificationsLayout,
} from '../../constants/desktopNotificationsLayout';
import {
  clearDesktopNotificationsLayoutOverrides,
  copyDesktopNotificationsDebugText,
  formatDesktopNotificationsLayoutForExport,
  isDesktopNotificationsDebugEnabled,
  registerDesktopNotificationsDebugShortcut,
  resolveDesktopNotificationsLayout,
  saveDesktopNotificationsLayoutOverrides,
  setDesktopNotificationsDebugEnabled,
  DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT,
} from '../../utils/desktopNotificationsDebug';
import { clampDesktopNotificationsRect } from '../../utils/desktopNotificationsLayoutMath';

type ContextValue = {
  debugEnabled: boolean;
  overlaysVisible: boolean;
  layout: DesktopNotificationsLayout;
  selectedRectId: DesktopNotificationsRectRegionId | null;
  selectRect: (id: DesktopNotificationsRectRegionId) => void;
  patchRect: (id: DesktopNotificationsRectRegionId, patch: Partial<DesktopNotificationsPercentRect>) => void;
  setOverlaysVisible: (visible: boolean) => void;
  toggleDebug: () => void;
  exportLayout: () => Promise<boolean>;
  resetLayout: () => void;
  rectPanels: typeof DESKTOP_NOTIFICATIONS_DEBUG_PANELS;
};

const DesktopNotificationsDebugContext = createContext<ContextValue | null>(null);

export function DesktopNotificationsDebugProvider({ children }: { children: ReactNode }) {
  const [debugEnabled, setDebugEnabled] = useState(() => isDesktopNotificationsDebugEnabled());
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [layout, setLayout] = useState<DesktopNotificationsLayout>(() => resolveDesktopNotificationsLayout());
  const [selectedRectId, setSelectedRectId] = useState<DesktopNotificationsRectRegionId | null>(
    DESKTOP_NOTIFICATIONS_DEBUG_PANELS[0]?.id ?? null,
  );

  const reloadLayout = useCallback(() => {
    setLayout(resolveDesktopNotificationsLayout());
  }, []);

  useEffect(() => registerDesktopNotificationsDebugShortcut(), []);

  useEffect(() => {
    const sync = () => setDebugEnabled(isDesktopNotificationsDebugEnabled());
    window.addEventListener(DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(DESKTOP_NOTIFICATIONS_DEBUG_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!debugEnabled) return;
    reloadLayout();
  }, [debugEnabled, reloadLayout]);

  useEffect(() => {
    if (!debugEnabled) return;
    saveDesktopNotificationsLayoutOverrides(layout);
  }, [debugEnabled, layout]);

  const patchRect = useCallback(
    (id: DesktopNotificationsRectRegionId, patch: Partial<DesktopNotificationsPercentRect>) => {
      setLayout((prev) => {
        const current = prev.rects[id];
        if (!current) return prev;
        return {
          ...prev,
          rects: {
            ...prev.rects,
            [id]: clampDesktopNotificationsRect({ ...current, ...patch }),
          },
        };
      });
    },
    [],
  );

  const toggleDebug = useCallback(() => {
    const next = !isDesktopNotificationsDebugEnabled();
    setDesktopNotificationsDebugEnabled(next);
    setDebugEnabled(next);
    if (next) reloadLayout();
  }, [reloadLayout]);

  const exportLayout = useCallback(async () => {
    const text = formatDesktopNotificationsLayoutForExport(layout);
    return copyDesktopNotificationsDebugText(text);
  }, [layout]);

  const resetLayout = useCallback(() => {
    clearDesktopNotificationsLayoutOverrides();
    setLayout(cloneDesktopNotificationsLayout(DESKTOP_NOTIFICATIONS_LAYOUT_SEED));
  }, []);

  const value = useMemo(
    () => ({
      debugEnabled,
      overlaysVisible,
      layout,
      selectedRectId,
      selectRect: (id: DesktopNotificationsRectRegionId) => setSelectedRectId(id),
      patchRect,
      setOverlaysVisible,
      toggleDebug,
      exportLayout,
      resetLayout,
      rectPanels: DESKTOP_NOTIFICATIONS_DEBUG_PANELS,
    }),
    [debugEnabled, overlaysVisible, layout, selectedRectId, patchRect, toggleDebug, exportLayout, resetLayout],
  );

  return (
    <DesktopNotificationsDebugContext.Provider value={value}>
      {children}
    </DesktopNotificationsDebugContext.Provider>
  );
}

export function useDesktopNotificationsDebug(): ContextValue | null {
  return useContext(DesktopNotificationsDebugContext);
}

export function useDesktopNotificationsDebugRequired(): ContextValue {
  const ctx = useContext(DesktopNotificationsDebugContext);
  if (!ctx) throw new Error('useDesktopNotificationsDebugRequired requires DesktopNotificationsDebugProvider');
  return ctx;
}

export function useDesktopNotificationsLayout(): DesktopNotificationsLayout {
  const ctx = useContext(DesktopNotificationsDebugContext);
  return ctx?.layout ?? resolveDesktopNotificationsLayout();
}
