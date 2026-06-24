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
  TransformationSuiteCircleRegionId,
  TransformationSuiteLayout,
  TransformationSuitePercentRect,
  TransformationSuiteRectRegionId,
} from '../../types/transformationSuite';
import {
  TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS,
  TRANSFORMATION_SUITE_LAYOUT_SEED,
  TRANSFORMATION_SUITE_RECT_DEBUG_PANELS,
  cloneTransformationSuiteLayout,
} from '../../constants/transformationSuiteLayout';
import {
  clearTransformationSuiteLayoutOverrides,
  copyTransformationSuiteDebugText,
  formatTransformationSuiteLayoutForExport,
  isTransformationSuiteDebugEnabled,
  registerTransformationSuiteDebugShortcut,
  resolveTransformationSuiteLayout,
  saveTransformationSuiteLayoutOverrides,
  setTransformationSuiteDebugEnabled,
  TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT,
} from '../../utils/transformationSuiteDebug';
import {
  clampTransformationSuiteCircle,
  clampTransformationSuiteRect,
} from '../../utils/transformationSuiteLayoutMath';

type ContextValue = {
  debugEnabled: boolean;
  overlaysVisible: boolean;
  layout: TransformationSuiteLayout;
  selectedRectId: TransformationSuiteRectRegionId | null;
  selectedCircleId: TransformationSuiteCircleRegionId | null;
  selectRect: (id: TransformationSuiteRectRegionId) => void;
  selectCircle: (id: TransformationSuiteCircleRegionId) => void;
  patchRect: (id: TransformationSuiteRectRegionId, patch: Partial<TransformationSuitePercentRect>) => void;
  patchCircle: (
    id: TransformationSuiteCircleRegionId,
    patch: Partial<TransformationSuiteLayout['circles'][TransformationSuiteCircleRegionId]>,
  ) => void;
  setOverlaysVisible: (visible: boolean) => void;
  toggleDebug: () => void;
  exportLayout: () => Promise<boolean>;
  resetLayout: () => void;
  rectPanels: typeof TRANSFORMATION_SUITE_RECT_DEBUG_PANELS;
  circlePanels: typeof TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS;
};

const TransformationSuiteDebugContext = createContext<ContextValue | null>(null);

export function TransformationSuiteDebugProvider({ children }: { children: ReactNode }) {
  const [debugEnabled, setDebugEnabled] = useState(() => isTransformationSuiteDebugEnabled());
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [layout, setLayout] = useState<TransformationSuiteLayout>(() => resolveTransformationSuiteLayout());
  const [selectedRectId, setSelectedRectId] = useState<TransformationSuiteRectRegionId | null>(
    TRANSFORMATION_SUITE_RECT_DEBUG_PANELS[0]?.id ?? null,
  );
  const [selectedCircleId, setSelectedCircleId] = useState<TransformationSuiteCircleRegionId | null>(null);

  const reloadLayout = useCallback(() => {
    setLayout(resolveTransformationSuiteLayout());
  }, []);

  useEffect(() => registerTransformationSuiteDebugShortcut(), []);

  useEffect(() => {
    const sync = () => setDebugEnabled(isTransformationSuiteDebugEnabled());
    window.addEventListener(TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT, sync);
    return () => window.removeEventListener(TRANSFORMATION_SUITE_DEBUG_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!debugEnabled) return;
    reloadLayout();
  }, [debugEnabled, reloadLayout]);

  useEffect(() => {
    if (!debugEnabled) return;
    saveTransformationSuiteLayoutOverrides(layout);
  }, [debugEnabled, layout]);

  const patchRect = useCallback((id: TransformationSuiteRectRegionId, patch: Partial<TransformationSuitePercentRect>) => {
    setLayout((prev) => {
      const current = prev.rects[id];
      if (!current) return prev;
      return {
        ...prev,
        rects: {
          ...prev.rects,
          [id]: clampTransformationSuiteRect({ ...current, ...patch }),
        },
      };
    });
  }, []);

  const patchCircle = useCallback(
    (
      id: TransformationSuiteCircleRegionId,
      patch: Partial<TransformationSuiteLayout['circles'][TransformationSuiteCircleRegionId]>,
    ) => {
      setLayout((prev) => {
        const current = prev.circles[id];
        if (!current) return prev;
        return {
          ...prev,
          circles: {
            ...prev.circles,
            [id]: clampTransformationSuiteCircle({ ...current, ...patch }),
          },
        };
      });
    },
    [],
  );

  const toggleDebug = useCallback(() => {
    const next = !isTransformationSuiteDebugEnabled();
    setTransformationSuiteDebugEnabled(next);
    setDebugEnabled(next);
    if (next) reloadLayout();
  }, [reloadLayout]);

  const exportLayout = useCallback(async () => {
    const text = formatTransformationSuiteLayoutForExport(layout);
    return copyTransformationSuiteDebugText(text);
  }, [layout]);

  const resetLayout = useCallback(() => {
    clearTransformationSuiteLayoutOverrides();
    setLayout(cloneTransformationSuiteLayout(TRANSFORMATION_SUITE_LAYOUT_SEED));
  }, []);

  const value = useMemo(
    () => ({
      debugEnabled,
      overlaysVisible,
      layout,
      selectedRectId,
      selectedCircleId,
      selectRect: (id: TransformationSuiteRectRegionId) => {
        setSelectedRectId(id);
        setSelectedCircleId(null);
      },
      selectCircle: (id: TransformationSuiteCircleRegionId) => {
        setSelectedCircleId(id);
        setSelectedRectId(null);
      },
      patchRect,
      patchCircle,
      setOverlaysVisible,
      toggleDebug,
      exportLayout,
      resetLayout,
      rectPanels: TRANSFORMATION_SUITE_RECT_DEBUG_PANELS,
      circlePanels: TRANSFORMATION_SUITE_CIRCLE_DEBUG_PANELS,
    }),
    [
      debugEnabled,
      overlaysVisible,
      layout,
      selectedRectId,
      selectedCircleId,
      patchRect,
      patchCircle,
      toggleDebug,
      exportLayout,
      resetLayout,
    ],
  );

  return (
    <TransformationSuiteDebugContext.Provider value={value}>
      {children}
    </TransformationSuiteDebugContext.Provider>
  );
}

export function useTransformationSuiteDebug(): ContextValue | null {
  return useContext(TransformationSuiteDebugContext);
}

export function useTransformationSuiteDebugRequired(): ContextValue {
  const ctx = useContext(TransformationSuiteDebugContext);
  if (!ctx) throw new Error('useTransformationSuiteDebugRequired requires TransformationSuiteDebugProvider');
  return ctx;
}

export function useTransformationSuiteLayout(): TransformationSuiteLayout {
  const ctx = useContext(TransformationSuiteDebugContext);
  return ctx?.layout ?? resolveTransformationSuiteLayout();
}

export function useTransformationSuiteDebugActive(): boolean {
  const ctx = useContext(TransformationSuiteDebugContext);
  return Boolean(ctx?.debugEnabled && ctx.overlaysVisible);
}
