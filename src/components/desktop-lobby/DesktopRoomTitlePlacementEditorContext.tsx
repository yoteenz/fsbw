import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DesktopRoomTitlePlacement } from '../../constants/desktopRoomTitlePlacement';
import {
  useDesktopRoomTitleEditEnabled,
  useDesktopRoomTitleViewportProfile,
  type DesktopRoomTitleViewportProfile,
} from '../../utils/desktopRoomTitlePlacementDebug';
import {
  clearDesktopRoomTitlePlacementOverrides,
  formatDesktopRoomTitleOverridesForCopy,
  getEffectiveDesktopRoomTitlePlacement,
  loadDesktopRoomTitlePlacementOverrides,
  saveDesktopRoomTitlePlacementOverrides,
  type DesktopRoomTitlePlacementOverridesFile,
  type DesktopRoomTitlePlacementPatch,
} from '../../utils/desktopRoomTitlePlacementOverrides';

type DesktopRoomTitlePlacementEditorContextValue = {
  editEnabled: boolean;
  profile: DesktopRoomTitleViewportProfile | null;
  activeZoneId: string | null;
  setActiveZoneId: (zoneId: string | null) => void;
  getPlacement: (zoneId: string) => DesktopRoomTitlePlacement;
  patchPlacement: (zoneId: string, patch: DesktopRoomTitlePlacementPatch) => void;
  saveOverrides: () => void;
  resetOverrides: () => void;
  copyOverridesJson: () => Promise<void>;
  hasUnsavedChanges: boolean;
  hasSavedOverrides: boolean;
};

const DesktopRoomTitlePlacementEditorContext =
  createContext<DesktopRoomTitlePlacementEditorContextValue | null>(null);

export function DesktopRoomTitlePlacementEditorProvider({ children }: { children: ReactNode }) {
  const editEnabled = useDesktopRoomTitleEditEnabled();
  const profile = useDesktopRoomTitleViewportProfile();
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DesktopRoomTitlePlacementOverridesFile>({});
  const [savedVersion, setSavedVersion] = useState(0);

  useEffect(() => {
    if (!editEnabled) setActiveZoneId(null);
  }, [editEnabled]);

  const hasSavedOverrides = useMemo(() => {
    void savedVersion;
    const saved = loadDesktopRoomTitlePlacementOverrides();
    return Boolean(
      Object.keys(saved.desktop ?? {}).length || Object.keys(saved.tablet ?? {}).length,
    );
  }, [savedVersion]);

  const hasUnsavedChanges = Object.keys(draft.desktop ?? {}).length > 0 ||
    Object.keys(draft.tablet ?? {}).length > 0;

  const getPlacement = useCallback(
    (zoneId: string) =>
      getEffectiveDesktopRoomTitlePlacement(zoneId, {
        draft,
        profile,
      }),
    [draft, profile],
  );

  const patchPlacement = useCallback(
    (zoneId: string, patch: DesktopRoomTitlePlacementPatch) => {
      if (!profile) return;
      setDraft((prev) => ({
        ...prev,
        [profile]: {
          ...prev[profile],
          [zoneId]: {
            ...getEffectiveDesktopRoomTitlePlacement(zoneId, { draft: prev, profile }),
            ...prev[profile]?.[zoneId],
            ...patch,
          },
        },
      }));
    },
    [profile],
  );

  const saveOverrides = useCallback(() => {
    const saved = loadDesktopRoomTitlePlacementOverrides();
    const next: DesktopRoomTitlePlacementOverridesFile = {
      desktop: { ...saved.desktop },
      tablet: { ...saved.tablet },
    };

    if (draft.desktop) {
      next.desktop = { ...next.desktop, ...draft.desktop };
    }
    if (draft.tablet) {
      next.tablet = { ...next.tablet, ...draft.tablet };
    }

    saveDesktopRoomTitlePlacementOverrides(next);
    setDraft({});
    setSavedVersion((v) => v + 1);
  }, [draft]);

  const resetOverrides = useCallback(() => {
    clearDesktopRoomTitlePlacementOverrides();
    setDraft({});
    setSavedVersion((v) => v + 1);
  }, []);

  const copyOverridesJson = useCallback(async () => {
    const saved = loadDesktopRoomTitlePlacementOverrides();
    const merged: DesktopRoomTitlePlacementOverridesFile = {
      desktop: { ...saved.desktop, ...draft.desktop },
      tablet: { ...saved.tablet, ...draft.tablet },
    };
    const text = formatDesktopRoomTitleOverridesForCopy(merged);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('Copy room title placement JSON:', text);
    }
  }, [draft]);

  const value = useMemo(
    () => ({
      editEnabled,
      profile,
      activeZoneId,
      setActiveZoneId,
      getPlacement,
      patchPlacement,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    }),
    [
      editEnabled,
      profile,
      activeZoneId,
      getPlacement,
      patchPlacement,
      saveOverrides,
      resetOverrides,
      copyOverridesJson,
      hasUnsavedChanges,
      hasSavedOverrides,
    ],
  );

  return (
    <DesktopRoomTitlePlacementEditorContext.Provider value={value}>
      {children}
    </DesktopRoomTitlePlacementEditorContext.Provider>
  );
}

export function useDesktopRoomTitlePlacementEditor(): DesktopRoomTitlePlacementEditorContextValue | null {
  return useContext(DesktopRoomTitlePlacementEditorContext);
}
