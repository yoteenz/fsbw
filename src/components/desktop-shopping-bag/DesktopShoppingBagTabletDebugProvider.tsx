import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isDesktopShoppingBagDebugEnabled } from '../../constants/desktopShoppingBag';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import {
  clearShoppingBagTabletPercentRect,
  defaultShoppingBagTabletPercentRect,
  formatShoppingBagTabletRectForExport,
  loadShoppingBagTabletPercentRect,
  resolveShoppingBagTabletImageRect,
  saveShoppingBagTabletPercentRect,
  type ShoppingBagTabletPercentRect,
} from '../../utils/desktopShoppingBagTabletDebug';
import { clampPanelDebugPercentRect } from '../../utils/desktopPanelDebugMode';

type ContextValue = {
  debugEnabled: boolean;
  percentRect: ShoppingBagTabletPercentRect;
  imageRect: FinalSceneHitRect;
  overlayVisible: boolean;
  setOverlayVisible: (visible: boolean) => void;
  patchRect: (patch: Partial<ShoppingBagTabletPercentRect>) => void;
  exportRect: () => Promise<void>;
  resetRect: () => void;
};

const DesktopShoppingBagTabletDebugContext = createContext<ContextValue | null>(null);

export function DesktopShoppingBagTabletDebugProvider({ children }: { children: ReactNode }) {
  const debugEnabled = isDesktopShoppingBagDebugEnabled();

  const [percentRect, setPercentRect] = useState<ShoppingBagTabletPercentRect>(() =>
    loadShoppingBagTabletPercentRect() ?? defaultShoppingBagTabletPercentRect(),
  );
  const [overlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (!debugEnabled) return;
    saveShoppingBagTabletPercentRect(percentRect);
  }, [debugEnabled, percentRect]);

  const patchRect = useCallback((patch: Partial<ShoppingBagTabletPercentRect>) => {
    setPercentRect((prev) => clampPanelDebugPercentRect({ ...prev, ...patch }));
  }, []);

  const exportRect = useCallback(async () => {
    await navigator.clipboard.writeText(formatShoppingBagTabletRectForExport(percentRect));
  }, [percentRect]);

  const resetRect = useCallback(() => {
    const fresh = defaultShoppingBagTabletPercentRect();
    setPercentRect(fresh);
    clearShoppingBagTabletPercentRect();
  }, []);

  const imageRect = useMemo(
    () => (debugEnabled ? resolveShoppingBagTabletImageRect(percentRect) : resolveShoppingBagTabletImageRect(null)),
    [debugEnabled, percentRect],
  );

  const value = useMemo(
    () => ({
      debugEnabled,
      percentRect,
      imageRect,
      overlayVisible,
      setOverlayVisible,
      patchRect,
      exportRect,
      resetRect,
    }),
    [debugEnabled, percentRect, imageRect, overlayVisible, patchRect, exportRect, resetRect],
  );

  return (
    <DesktopShoppingBagTabletDebugContext.Provider value={value}>
      {children}
    </DesktopShoppingBagTabletDebugContext.Provider>
  );
}

export function useDesktopShoppingBagTabletRect(): FinalSceneHitRect {
  const ctx = useContext(DesktopShoppingBagTabletDebugContext);
  if (ctx) return ctx.imageRect;
  return resolveShoppingBagTabletImageRect(null);
}

export function useDesktopShoppingBagTabletDebug(): ContextValue | null {
  return useContext(DesktopShoppingBagTabletDebugContext);
}

export function useDesktopShoppingBagTabletDebugRequired(): ContextValue {
  const ctx = useContext(DesktopShoppingBagTabletDebugContext);
  if (!ctx) {
    throw new Error('useDesktopShoppingBagTabletDebugRequired requires DesktopShoppingBagTabletDebugProvider');
  }
  return ctx;
}
