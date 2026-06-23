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
  copyShoppingBagTabletDebugText,
  defaultShoppingBagTabletPercentRect,
  formatShoppingBagTabletRectForExport,
  hasSavedShoppingBagTabletRect,
  loadEffectiveShoppingBagTabletPercentRect,
  resolveShoppingBagTabletImageRect,
  saveShoppingBagTabletPercentRect,
  shoppingBagTabletRectsEqual,
  type ShoppingBagTabletPercentRect,
} from '../../utils/desktopShoppingBagTabletDebug';
import { clampPanelDebugPercentRect } from '../../utils/desktopPanelDebugMode';

export type ShoppingBagTabletSaveStatus = 'idle' | 'saved' | 'failed';

type ContextValue = {
  debugEnabled: boolean;
  percentRect: ShoppingBagTabletPercentRect;
  imageRect: FinalSceneHitRect;
  overlayVisible: boolean;
  hasCustomLayout: boolean;
  saveStatus: ShoppingBagTabletSaveStatus;
  exportSnippet: string;
  setOverlayVisible: (visible: boolean) => void;
  patchRect: (patch: Partial<ShoppingBagTabletPercentRect>) => void;
  saveLayout: () => boolean;
  exportRect: () => Promise<boolean>;
  resetRect: () => void;
};

const DesktopShoppingBagTabletDebugContext = createContext<ContextValue | null>(null);

export function DesktopShoppingBagTabletDebugProvider({ children }: { children: ReactNode }) {
  const debugEnabled = isDesktopShoppingBagDebugEnabled();

  const [percentRect, setPercentRect] = useState<ShoppingBagTabletPercentRect>(() =>
    loadEffectiveShoppingBagTabletPercentRect(),
  );
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [saveStatus, setSaveStatus] = useState<ShoppingBagTabletSaveStatus>('idle');

  const persistRect = useCallback((rect: ShoppingBagTabletPercentRect) => {
    const ok = saveShoppingBagTabletPercentRect(rect);
    setSaveStatus(ok ? 'saved' : 'failed');
    return ok;
  }, []);

  useEffect(() => {
    persistRect(percentRect);
  }, [percentRect, persistRect]);

  const patchRect = useCallback((patch: Partial<ShoppingBagTabletPercentRect>) => {
    setPercentRect((prev) => clampPanelDebugPercentRect({ ...prev, ...patch }));
  }, []);

  const saveLayout = useCallback(() => {
    return persistRect(percentRect);
  }, [percentRect, persistRect]);

  const exportRect = useCallback(async () => {
    const snippet = formatShoppingBagTabletRectForExport(percentRect);
    return copyShoppingBagTabletDebugText(snippet);
  }, [percentRect]);

  const resetRect = useCallback(() => {
    const fresh = defaultShoppingBagTabletPercentRect();
    setPercentRect(fresh);
    clearShoppingBagTabletPercentRect();
    setSaveStatus('idle');
  }, []);

  const imageRect = useMemo(
    () => resolveShoppingBagTabletImageRect(percentRect),
    [percentRect],
  );

  const hasCustomLayout = useMemo(
    () =>
      hasSavedShoppingBagTabletRect() ||
      !shoppingBagTabletRectsEqual(percentRect, defaultShoppingBagTabletPercentRect()),
    [percentRect],
  );

  const exportSnippet = useMemo(
    () => formatShoppingBagTabletRectForExport(percentRect),
    [percentRect],
  );

  const value = useMemo(
    () => ({
      debugEnabled,
      percentRect,
      imageRect,
      overlayVisible,
      hasCustomLayout,
      saveStatus,
      exportSnippet,
      setOverlayVisible,
      patchRect,
      saveLayout,
      exportRect,
      resetRect,
    }),
    [
      debugEnabled,
      percentRect,
      imageRect,
      overlayVisible,
      hasCustomLayout,
      saveStatus,
      exportSnippet,
      patchRect,
      saveLayout,
      exportRect,
      resetRect,
    ],
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
  return resolveShoppingBagTabletImageRect(loadEffectiveShoppingBagTabletPercentRect());
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
