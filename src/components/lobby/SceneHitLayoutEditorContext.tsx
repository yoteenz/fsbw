import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SceneHitRegionConfig, SceneHitRegionId } from '../../utils/sceneHitRegionDefaults';
import {
  clearSceneHitLayoutOverrides,
  formatSceneHitOverridesForCopy,
  getEffectiveSceneHitRegionConfigs,
  loadSceneHitLayoutOverrides,
  saveSceneHitLayoutOverrides,
  type SceneHitLayoutOverridesFile,
} from '../../utils/sceneHitLayoutOverrides';
import type { SceneHitLayoutOptions } from '../../utils/sceneHitLayout';
import { useSceneHitEditEnabled } from '../../utils/sceneHitDebug';

type SceneHitLayoutEditorContextValue = {
  editEnabled: boolean;
  selectedRegionId: SceneHitRegionId | null;
  selectRegion: (id: SceneHitRegionId) => void;
  clearSelectedRegion: () => void;
  regions: Record<SceneHitRegionId, SceneHitRegionConfig>;
  getRegion: (id: SceneHitRegionId) => SceneHitRegionConfig;
  patchRegionLayout: (id: SceneHitRegionId, patch: Partial<SceneHitLayoutOptions>) => void;
  patchRegionCoverOffset: (id: SceneHitRegionId, patch: Partial<{ x: number; y: number }>) => void;
  saveOverrides: () => void;
  resetOverrides: () => void;
  copyOverridesJson: () => Promise<void>;
  hasUnsavedChanges: boolean;
  hasSavedOverrides: boolean;
};

const SceneHitLayoutEditorContext = createContext<SceneHitLayoutEditorContextValue | null>(null);

export function SceneHitLayoutEditorProvider({ children }: { children: ReactNode }) {
  const editEnabled = useSceneHitEditEnabled();
  const [selectedRegionId, setSelectedRegionId] = useState<SceneHitRegionId | null>(null);
  const [draft, setDraft] = useState<SceneHitLayoutOverridesFile>({});
  const [savedVersion, setSavedVersion] = useState(0);

  const selectRegion = useCallback((id: SceneHitRegionId) => {
    setSelectedRegionId(id);
  }, []);

  const clearSelectedRegion = useCallback(() => {
    setSelectedRegionId(null);
  }, []);

  useEffect(() => {
    if (!editEnabled) setSelectedRegionId(null);
  }, [editEnabled]);

  const regions = useMemo(
    () => getEffectiveSceneHitRegionConfigs(draft),
    [draft, savedVersion],
  );

  const hasSavedOverrides = useMemo(() => {
    void savedVersion;
    return Object.keys(loadSceneHitLayoutOverrides()).length > 0;
  }, [savedVersion]);

  const hasUnsavedChanges = Object.keys(draft).length > 0;

  const getRegion = useCallback((id: SceneHitRegionId) => regions[id], [regions]);

  const patchRegionLayout = useCallback((id: SceneHitRegionId, patch: Partial<SceneHitLayoutOptions>) => {
    setDraft((prev) => {
      const current = getEffectiveSceneHitRegionConfigs(prev)[id];
      const nextLayout = { ...current.layout, ...patch };
      if (patch.layoutScale) {
        nextLayout.layoutScale = patch.layoutScale;
      }
      return {
        ...prev,
        [id]: {
          ...prev[id],
          layout: nextLayout,
        },
      };
    });
  }, []);

  const patchRegionCoverOffset = useCallback(
    (id: SceneHitRegionId, patch: Partial<{ x: number; y: number }>) => {
      setDraft((prev) => {
        const current = getEffectiveSceneHitRegionConfigs(prev)[id];
        return {
          ...prev,
          [id]: {
            ...prev[id],
            coverOffset: {
              x: patch.x ?? current.coverOffset?.x ?? 0,
              y: patch.y ?? current.coverOffset?.y ?? 0,
            },
          },
        };
      });
    },
    [],
  );

  const saveOverrides = useCallback(() => {
    const effective = getEffectiveSceneHitRegionConfigs(draft);
    const payload: SceneHitLayoutOverridesFile = {};
    for (const [id, config] of Object.entries(effective) as [SceneHitRegionId, SceneHitRegionConfig][]) {
      payload[id] = config;
    }
    saveSceneHitLayoutOverrides(payload);
    setDraft({});
    setSavedVersion((v) => v + 1);
  }, [draft]);

  const resetOverrides = useCallback(() => {
    clearSceneHitLayoutOverrides();
    setDraft({});
    setSavedVersion((v) => v + 1);
  }, []);

  const copyOverridesJson = useCallback(async () => {
    const json = formatSceneHitOverridesForCopy(getEffectiveSceneHitRegionConfigs(draft));
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      // Fallback for older browsers / non-secure contexts.
      window.prompt('Copy scene hit layout JSON:', json);
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      editEnabled,
      selectedRegionId,
      selectRegion,
      clearSelectedRegion,
      regions,
      getRegion,
      patchRegionLayout,
      patchRegionCoverOffset,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    }),
    [
      editEnabled,
      selectedRegionId,
      selectRegion,
      clearSelectedRegion,
      regions,
      getRegion,
      patchRegionLayout,
      patchRegionCoverOffset,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    ],
  );

  return (
    <SceneHitLayoutEditorContext.Provider value={value}>{children}</SceneHitLayoutEditorContext.Provider>
  );
}

export function useSceneHitLayoutEditor(): SceneHitLayoutEditorContextValue {
  const ctx = useContext(SceneHitLayoutEditorContext);
  if (!ctx) {
    throw new Error('useSceneHitLayoutEditor must be used within SceneHitLayoutEditorProvider');
  }
  return ctx;
}

export function useOptionalSceneHitLayoutEditor(): SceneHitLayoutEditorContextValue | null {
  return useContext(SceneHitLayoutEditorContext);
}

/** Safe outside provider — returns code defaults only. */
export function useSceneHitRegionConfig(id: SceneHitRegionId): SceneHitRegionConfig {
  const ctx = useContext(SceneHitLayoutEditorContext);
  if (!ctx) {
    return getEffectiveSceneHitRegionConfigs()[id];
  }
  return ctx.getRegion(id);
}
