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
import { useDesktopLoungeTvEditEnabled } from '../../utils/desktopLoungeTvFrameDebug';
import {
  clearDesktopLoungeTvFrameOverrides,
  formatDesktopLoungeTvFrameOverridesForCopy,
  getEffectiveDesktopLoungeTvFrameConfig,
  loadDesktopLoungeTvFrameOverrides,
  saveDesktopLoungeTvFrameOverrides,
  type DesktopLoungeTvFrameConfig,
  type DesktopLoungeTvFrameOverridesFile,
} from '../../utils/desktopLoungeTvFrameOverrides';
import type { SceneHitLayoutOptions } from '../../utils/sceneHitLayout';

type DesktopLoungeTvFrameEditorContextValue = {
  editEnabled: boolean;
  selected: boolean;
  select: () => void;
  clearSelected: () => void;
  config: DesktopLoungeTvFrameConfig;
  patchRect: (patch: Partial<FinalSceneHitRect>) => void;
  patchLayout: (patch: Partial<SceneHitLayoutOptions>) => void;
  saveOverrides: () => void;
  resetOverrides: () => void;
  copyOverridesJson: () => Promise<void>;
  hasUnsavedChanges: boolean;
  hasSavedOverrides: boolean;
};

const DesktopLoungeTvFrameEditorContext =
  createContext<DesktopLoungeTvFrameEditorContextValue | null>(null);

export function DesktopLoungeTvFrameEditorProvider({ children }: { children: ReactNode }) {
  const editEnabled = useDesktopLoungeTvEditEnabled();
  const [selected, setSelected] = useState(false);
  const [draft, setDraft] = useState<DesktopLoungeTvFrameOverridesFile>({});
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    if (!editEnabled) setSelected(false);
  }, [editEnabled]);

  const config = useMemo(
    () => getEffectiveDesktopLoungeTvFrameConfig(draft),
    [draft, savedVersion],
  );

  const hasSavedOverrides = useMemo(() => {
    void savedVersion;
    return Object.keys(loadDesktopLoungeTvFrameOverrides()).length > 0;
  }, [savedVersion]);

  const hasUnsavedChanges = Object.keys(draft).length > 0;

  const select = useCallback(() => setSelected(true), []);
  const clearSelected = useCallback(() => setSelected(false), []);

  const patchRect = useCallback((patch: Partial<FinalSceneHitRect> | FinalSceneHitRect) => {
    setDraft((prev) => ({
      ...prev,
      rect: { ...getEffectiveDesktopLoungeTvFrameConfig(prev).rect, ...patch },
      layout: {
        ...getEffectiveDesktopLoungeTvFrameConfig(prev).layout,
        layoutOffsetX: 0,
        layoutOffsetY: 0,
        layoutWidthExtraPx: 0,
        layoutHeightExtraPx: 0,
      },
    }));
  }, []);

  const patchLayout = useCallback((patch: Partial<SceneHitLayoutOptions>) => {
    setDraft((prev) => {
      const current = getEffectiveDesktopLoungeTvFrameConfig(prev);
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
    const saved = loadDesktopLoungeTvFrameOverrides();
    const next: DesktopLoungeTvFrameOverridesFile = {
      ...saved,
      ...draft,
      rect: draft.rect ?? saved.rect,
      layout: draft.layout ?? saved.layout,
    };
    saveDesktopLoungeTvFrameOverrides(next);
    setDraft({});
    setSavedVersion((n) => n + 1);
  }, [draft]);

  const resetOverrides = useCallback(() => {
    clearDesktopLoungeTvFrameOverrides();
    setDraft({});
    setSavedVersion((n) => n + 1);
  }, []);

  const copyOverridesJson = useCallback(async () => {
    const merged = getEffectiveDesktopLoungeTvFrameOverridesForCopy();
    await navigator.clipboard.writeText(formatDesktopLoungeTvFrameOverridesForCopy(merged));
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
    <DesktopLoungeTvFrameEditorContext.Provider value={value}>
      {children}
    </DesktopLoungeTvFrameEditorContext.Provider>
  );
}

function getEffectiveDesktopLoungeTvFrameOverridesForCopy(): DesktopLoungeTvFrameOverridesFile {
  const saved = loadDesktopLoungeTvFrameOverrides();
  return {
    rect: getEffectiveDesktopLoungeTvFrameConfig().rect,
    layout: getEffectiveDesktopLoungeTvFrameConfig().layout,
    screenOffsetX: getEffectiveDesktopLoungeTvFrameConfig().screenOffsetX,
    screenOffsetY: getEffectiveDesktopLoungeTvFrameConfig().screenOffsetY,
    updatedAt: saved.updatedAt,
  };
}

export function useDesktopLoungeTvFrameEditor(): DesktopLoungeTvFrameEditorContextValue | null {
  return useContext(DesktopLoungeTvFrameEditorContext);
}

export function useEffectiveDesktopLoungeTvFrameConfig(): DesktopLoungeTvFrameConfig {
  const editor = useDesktopLoungeTvFrameEditor();
  return editor?.config ?? getEffectiveDesktopLoungeTvFrameConfig();
}
