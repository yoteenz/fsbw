import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { FinalSceneHitRect } from '../../constants/finalLobbySceneAssets';
import { useDesktopPsaSuiteEditEnabled } from '../../utils/desktopPsaSuiteFrameDebug';
import {
  clearDesktopPsaSuiteFrameOverrides,
  formatDesktopPsaSuiteFrameOverridesForCopy,
  getEffectiveDesktopPsaSuiteFrameConfig,
  loadDesktopPsaSuiteFrameOverrides,
  saveDesktopPsaSuiteFrameOverrides,
  type DesktopPsaSuiteFrameConfig,
  type DesktopPsaSuiteFrameOverridesFile,
} from '../../utils/desktopPsaSuiteFrameOverrides';
import type { SceneHitLayoutOptions } from '../../utils/sceneHitLayout';

type DesktopPsaSuiteFrameEditorContextValue = {
  editEnabled: boolean;
  selected: boolean;
  select: () => void;
  clearSelected: () => void;
  config: DesktopPsaSuiteFrameConfig;
  patchRect: (patch: Partial<FinalSceneHitRect>) => void;
  patchLayout: (patch: Partial<SceneHitLayoutOptions>) => void;
  saveOverrides: () => void;
  resetOverrides: () => void;
  copyOverridesJson: () => Promise<void>;
  hasUnsavedChanges: boolean;
  hasSavedOverrides: boolean;
};

const DesktopPsaSuiteFrameEditorContext =
  createContext<DesktopPsaSuiteFrameEditorContextValue | null>(null);

export function DesktopPsaSuiteFrameEditorProvider({ children }: { children: ReactNode }) {
  const editEnabled = useDesktopPsaSuiteEditEnabled();
  const [selected, setSelected] = useState(false);
  const [draft, setDraft] = useState<DesktopPsaSuiteFrameOverridesFile>({});
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    if (!editEnabled) setSelected(false);
  }, [editEnabled]);

  const config = useMemo(
    () => getEffectiveDesktopPsaSuiteFrameConfig(draft),
    [draft, savedVersion],
  );

  const hasSavedOverrides = useMemo(() => {
    void savedVersion;
    return Object.keys(loadDesktopPsaSuiteFrameOverrides()).length > 0;
  }, [savedVersion]);

  const hasUnsavedChanges = Object.keys(draft).length > 0;

  const select = useCallback(() => setSelected(true), []);
  const clearSelected = useCallback(() => setSelected(false), []);

  const patchRect = useCallback((patch: Partial<FinalSceneHitRect> | FinalSceneHitRect) => {
    setDraft((prev) => ({
      ...prev,
      rect: { ...getEffectiveDesktopPsaSuiteFrameConfig(prev).rect, ...patch },
      layout: {
        ...getEffectiveDesktopPsaSuiteFrameConfig(prev).layout,
        layoutOffsetX: 0,
        layoutOffsetY: 0,
        layoutWidthExtraPx: 0,
        layoutHeightExtraPx: 0,
      },
    }));
  }, []);

  const patchLayout = useCallback((patch: Partial<SceneHitLayoutOptions>) => {
    setDraft((prev) => {
      const current = getEffectiveDesktopPsaSuiteFrameConfig(prev);
      const nextLayout = { ...current.layout, ...patch };
      if (patch.layoutScale) {
        nextLayout.layoutScale = patch.layoutScale;
      }
      return {
        ...prev,
        layout: nextLayout,
      };
    });
  }, []);

  const saveOverrides = useCallback(() => {
    const saved = loadDesktopPsaSuiteFrameOverrides();
    const next: DesktopPsaSuiteFrameOverridesFile = {
      ...saved,
      ...draft,
      rect: draft.rect ?? saved.rect,
      layout: draft.layout ?? saved.layout,
    };
    saveDesktopPsaSuiteFrameOverrides(next);
    setDraft({});
    setSavedVersion((n) => n + 1);
  }, [draft]);

  const resetOverrides = useCallback(() => {
    clearDesktopPsaSuiteFrameOverrides();
    setDraft({});
    setSavedVersion((n) => n + 1);
  }, []);

  const copyOverridesJson = useCallback(async () => {
    const merged = getEffectiveDesktopPsaSuiteFrameOverridesForCopy();
    await navigator.clipboard.writeText(formatDesktopPsaSuiteFrameOverridesForCopy(merged));
  }, []);

  const value = useMemo(
    () => ({
      editEnabled,
      selected,
      select,
      clearSelected,
      config,
      patchRect,
      patchLayout,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    }),
    [
      editEnabled,
      selected,
      select,
      clearSelected,
      config,
      patchRect,
      patchLayout,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    ],
  );

  return (
    <DesktopPsaSuiteFrameEditorContext.Provider value={value}>
      {children}
    </DesktopPsaSuiteFrameEditorContext.Provider>
  );
}

function getEffectiveDesktopPsaSuiteFrameOverridesForCopy(): DesktopPsaSuiteFrameOverridesFile {
  const saved = loadDesktopPsaSuiteFrameOverrides();
  return {
    rect: getEffectiveDesktopPsaSuiteFrameConfig().rect,
    layout: getEffectiveDesktopPsaSuiteFrameConfig().layout,
    screenOffsetX: getEffectiveDesktopPsaSuiteFrameConfig().screenOffsetX,
    screenOffsetY: getEffectiveDesktopPsaSuiteFrameConfig().screenOffsetY,
    updatedAt: saved.updatedAt,
  };
}

export function useDesktopPsaSuiteFrameEditor(): DesktopPsaSuiteFrameEditorContextValue | null {
  return useContext(DesktopPsaSuiteFrameEditorContext);
}

export function useEffectiveDesktopPsaSuiteFrameConfig(): DesktopPsaSuiteFrameConfig {
  const editor = useDesktopPsaSuiteFrameEditor();
  return editor?.config ?? getEffectiveDesktopPsaSuiteFrameConfig();
}
