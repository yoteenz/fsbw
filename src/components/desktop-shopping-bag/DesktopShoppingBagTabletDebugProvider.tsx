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
import {
  clearShoppingBagTabletQuad,
  copyShoppingBagTabletDebugText,
  defaultShoppingBagTabletQuad,
  formatShoppingBagTabletQuadForExport,
  hasSavedShoppingBagTabletQuad,
  loadEffectiveShoppingBagTabletQuad,
  saveShoppingBagTabletQuad,
  shoppingBagTabletQuadsEqual,
  type ShoppingBagTabletQuad,
} from '../../utils/desktopShoppingBagTabletQuad';
import { clampQuad, clampQuadPoint, type QuadCornerId } from '../../utils/quadPerspectiveTransform';

export type ShoppingBagTabletSaveStatus = 'idle' | 'saved' | 'failed';

type ContextValue = {
  debugEnabled: boolean;
  quad: ShoppingBagTabletQuad;
  overlayVisible: boolean;
  hasCustomLayout: boolean;
  saveStatus: ShoppingBagTabletSaveStatus;
  exportSnippet: string;
  setOverlayVisible: (visible: boolean) => void;
  patchCorner: (cornerId: QuadCornerId, point: { x: number; y: number }) => void;
  patchQuad: (quad: ShoppingBagTabletQuad) => void;
  saveLayout: () => boolean;
  exportLayout: () => Promise<boolean>;
  resetLayout: () => void;
};

const DesktopShoppingBagTabletDebugContext = createContext<ContextValue | null>(null);

export function DesktopShoppingBagTabletDebugProvider({ children }: { children: ReactNode }) {
  const debugEnabled = isDesktopShoppingBagDebugEnabled();

  const [quad, setQuad] = useState<ShoppingBagTabletQuad>(() => loadEffectiveShoppingBagTabletQuad());
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [saveStatus, setSaveStatus] = useState<ShoppingBagTabletSaveStatus>('idle');

  const persistQuad = useCallback((next: ShoppingBagTabletQuad) => {
    const ok = saveShoppingBagTabletQuad(next);
    setSaveStatus(ok ? 'saved' : 'failed');
    return ok;
  }, []);

  useEffect(() => {
    if (!debugEnabled) return;
    persistQuad(quad);
  }, [quad, persistQuad, debugEnabled]);

  const patchCorner = useCallback((cornerId: QuadCornerId, point: { x: number; y: number }) => {
    setQuad((prev) =>
      clampQuad({
        ...prev,
        [cornerId]: clampQuadPoint(point),
      }),
    );
  }, []);

  const patchQuad = useCallback((next: ShoppingBagTabletQuad) => {
    setQuad(clampQuad(next));
  }, []);

  const saveLayout = useCallback(() => persistQuad(quad), [persistQuad, quad]);

  const exportLayout = useCallback(async () => {
    const snippet = formatShoppingBagTabletQuadForExport(quad);
    return copyShoppingBagTabletDebugText(snippet);
  }, [quad]);

  const resetLayout = useCallback(() => {
    const fresh = defaultShoppingBagTabletQuad();
    setQuad(fresh);
    clearShoppingBagTabletQuad();
    setSaveStatus('idle');
  }, []);

  const hasCustomLayout = useMemo(
    () =>
      hasSavedShoppingBagTabletQuad() ||
      !shoppingBagTabletQuadsEqual(quad, defaultShoppingBagTabletQuad()),
    [quad],
  );

  const exportSnippet = useMemo(() => formatShoppingBagTabletQuadForExport(quad), [quad]);

  const value = useMemo(
    () => ({
      debugEnabled,
      quad,
      overlayVisible,
      hasCustomLayout,
      saveStatus,
      exportSnippet,
      setOverlayVisible,
      patchCorner,
      patchQuad,
      saveLayout,
      exportLayout,
      resetLayout,
    }),
    [
      debugEnabled,
      quad,
      overlayVisible,
      hasCustomLayout,
      saveStatus,
      exportSnippet,
      patchCorner,
      patchQuad,
      saveLayout,
      exportLayout,
      resetLayout,
    ],
  );

  return (
    <DesktopShoppingBagTabletDebugContext.Provider value={value}>
      {children}
    </DesktopShoppingBagTabletDebugContext.Provider>
  );
}

export function useDesktopShoppingBagTabletQuad(): ShoppingBagTabletQuad {
  const ctx = useContext(DesktopShoppingBagTabletDebugContext);
  if (ctx) return ctx.quad;
  return loadEffectiveShoppingBagTabletQuad();
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
