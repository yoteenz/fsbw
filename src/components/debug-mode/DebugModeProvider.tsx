import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearDebugPageConfig,
  formatDebugPageConfigForCopy,
  getDebugPageConfig,
  loadDebugModeStore,
  saveDebugPageConfig,
  type DebugElementOverride,
  type DebugPageConfig,
} from '../../utils/debugMode';
import { syncPageDebugStoreToCloud } from '../../utils/debugModeSync';

type DebugModeContextValue = {
  enabled: boolean;
  pageKey: string;
  draft: DebugPageConfig;
  selectedId: string | null;
  selectElement: (id: string | null) => void;
  patchElement: (id: string, patch: Partial<DebugElementOverride>) => void;
  getElementOverride: (id: string) => DebugElementOverride | undefined;
  savePage: () => Promise<void>;
  resetPage: () => Promise<void>;
  copyPageJson: () => Promise<void>;
  hasUnsavedChanges: boolean;
  hasSavedConfig: boolean;
};

const DebugModeContext = createContext<DebugModeContextValue | null>(null);

export function DebugModeProvider({
  enabled,
  pageKey,
  children,
}: {
  enabled: boolean;
  pageKey: string;
  children: ReactNode;
}) {
  const [draftElements, setDraftElements] = useState<Record<string, DebugElementOverride>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedVersion, setSavedVersion] = useState(0);

  const savedConfig = useMemo(() => {
    void savedVersion;
    return getDebugPageConfig(pageKey);
  }, [pageKey, savedVersion]);

  const draft = useMemo<DebugPageConfig>(
    () => ({
      updatedAt: Date.now(),
      elements: { ...(savedConfig?.elements ?? {}), ...draftElements },
    }),
    [draftElements, savedConfig],
  );

  const hasUnsavedChanges = Object.keys(draftElements).length > 0;
  const hasSavedConfig = Boolean(savedConfig && Object.keys(savedConfig.elements).length > 0);

  const patchElement = useCallback((id: string, patch: Partial<DebugElementOverride>) => {
    setDraftElements((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? savedConfig?.elements[id] ?? {}), ...patch },
    }));
  }, [savedConfig?.elements]);

  const getElementOverride = useCallback(
    (id: string) => draft.elements[id],
    [draft.elements],
  );

  const savePage = useCallback(async () => {
    saveDebugPageConfig(pageKey, draft);
    setDraftElements({});
    setSavedVersion((v) => v + 1);
    try {
      await syncPageDebugStoreToCloud();
    } catch {
      /* local save still applied */
    }
  }, [draft, pageKey]);

  const resetPage = useCallback(async () => {
    clearDebugPageConfig(pageKey);
    setDraftElements({});
    setSelectedId(null);
    setSavedVersion((v) => v + 1);
    try {
      await syncPageDebugStoreToCloud(loadDebugModeStore());
    } catch {
      /* local reset still applied */
    }
  }, [pageKey]);

  const copyPageJson = useCallback(async () => {
    const text = formatDebugPageConfigForCopy(pageKey, draft);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Copy page debug JSON:', text);
    }
  }, [draft, pageKey]);

  const value = useMemo<DebugModeContextValue>(
    () => ({
      enabled,
      pageKey,
      draft,
      selectedId,
      selectElement: setSelectedId,
      patchElement,
      getElementOverride,
      savePage,
      resetPage,
      copyPageJson,
      hasUnsavedChanges,
      hasSavedConfig,
    }),
    [
      copyPageJson,
      draft,
      enabled,
      getElementOverride,
      hasSavedConfig,
      hasUnsavedChanges,
      pageKey,
      patchElement,
      resetPage,
      savePage,
      selectedId,
    ],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return <DebugModeContext.Provider value={value}>{children}</DebugModeContext.Provider>;
}

export function useDebugMode(): DebugModeContextValue | null {
  return useContext(DebugModeContext);
}

export function useDebugModeStoreSnapshot(): ReturnType<typeof loadDebugModeStore> {
  return loadDebugModeStore();
}
