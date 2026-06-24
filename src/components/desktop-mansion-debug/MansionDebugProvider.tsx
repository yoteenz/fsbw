import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type {
  MansionDebugBounds,
  MansionDebugDisplayMode,
  MansionDebugFilterState,
  MansionDebugPageFilter,
  MansionDebugRegion,
  MansionDebugViewportBinding,
} from '../../types/desktopMansionDebug';
import {
  getMansionDebugDisplayMode,
  getMansionDebugFilters,
  getMansionDebugPageFilter,
  isMansionDebugAvailable,
  isMansionDebugEnabled,
  MANSION_DEBUG_UPDATED_EVENT,
  registerMansionDebugShortcut,
  setMansionDebugDisplayMode,
  setMansionDebugEnabled,
  setMansionDebugFilters,
  setMansionDebugPageFilter,
  toggleMansionDebugEnabled,
} from '../../utils/desktopMansionDebug';
import type { DesktopGrandLobbyPanelRegionId } from '../../types/desktopGrandLobby';
import { DESKTOP_GRAND_LOBBY_LAYOUT_SEED } from '../../constants/desktopGrandLobbyLayout';
import {
  clearMansionDebugLayoutOverrides,
  copyMansionDebugText,
  formatMansionDebugLayoutExportForPage,
  MANSION_DEBUG_LAYOUT_UPDATED_EVENT,
  readMansionDebugLayoutOverrides,
  resolveGrandLobbyPercentRect,
  resolveMansionDebugRegion,
  type MansionDebugLayoutOverrides,
  writeMansionDebugLayoutOverrides,
} from '../../utils/mansionDebugLayoutStore';

type ContextValue = {
  available: boolean;
  enabled: boolean;
  editMode: boolean;
  displayMode: MansionDebugDisplayMode;
  pageFilter: MansionDebugPageFilter;
  filters: MansionDebugFilterState;
  viewport: MansionDebugViewportBinding | null;
  runtimeRegions: MansionDebugRegion[];
  layoutOverrides: MansionDebugLayoutOverrides;
  selectedRegionId: string | null;
  toggleEnabled: () => void;
  toggleEditMode: () => void;
  setDisplayMode: (mode: MansionDebugDisplayMode) => void;
  setPageFilter: (filter: MansionDebugPageFilter) => void;
  setFilters: (filters: MansionDebugFilterState) => void;
  setFilterGroup: (group: keyof MansionDebugFilterState, enabled: boolean) => void;
  bindViewport: (binding: MansionDebugViewportBinding | null) => void;
  registerRegion: (region: MansionDebugRegion) => void;
  unregisterRegion: (id: string) => void;
  selectRegion: (id: string | null) => void;
  patchRegionBounds: (id: string, bounds: MansionDebugBounds) => void;
  resolveRegion: (region: MansionDebugRegion) => MansionDebugRegion;
  resolveGrandLobbyRect: (regionId: DesktopGrandLobbyPanelRegionId) => ReturnType<typeof resolveGrandLobbyPercentRect>;
  saveLayout: () => void;
  exportLayout: () => Promise<boolean>;
  resetLayout: () => void;
};

const MansionDebugContext = createContext<ContextValue | null>(null);

export function MansionDebugProvider({ children }: { children: ReactNode }) {
  const available = isMansionDebugAvailable();
  const [enabled, setEnabled] = useState(() => isMansionDebugEnabled());
  const [editMode, setEditMode] = useState(false);
  const [displayMode, setDisplayModeState] = useState(() => getMansionDebugDisplayMode());
  const [pageFilter, setPageFilterState] = useState(() => getMansionDebugPageFilter());
  const [filters, setFiltersState] = useState(() => getMansionDebugFilters());
  const [viewport, setViewport] = useState<MansionDebugViewportBinding | null>(null);
  const [runtimeRegions, setRuntimeRegions] = useState<MansionDebugRegion[]>([]);
  const [layoutOverrides, setLayoutOverrides] = useState(() => readMansionDebugLayoutOverrides());
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  const reloadLayoutOverrides = useCallback(() => {
    setLayoutOverrides(readMansionDebugLayoutOverrides());
  }, []);

  const syncFromStorage = useCallback(() => {
    setEnabled(isMansionDebugEnabled());
    setDisplayModeState(getMansionDebugDisplayMode());
    setPageFilterState(getMansionDebugPageFilter());
    setFiltersState(getMansionDebugFilters());
    reloadLayoutOverrides();
  }, [reloadLayoutOverrides]);

  useEffect(() => {
    if (!available) return;
    const onUpdate = () => syncFromStorage();
    window.addEventListener(MANSION_DEBUG_UPDATED_EVENT, onUpdate);
    window.addEventListener(MANSION_DEBUG_LAYOUT_UPDATED_EVENT, onUpdate);
    return () => {
      window.removeEventListener(MANSION_DEBUG_UPDATED_EVENT, onUpdate);
      window.removeEventListener(MANSION_DEBUG_LAYOUT_UPDATED_EVENT, onUpdate);
    };
  }, [available, syncFromStorage]);

  useEffect(() => {
    if (!available) return;
    return registerMansionDebugShortcut((event) => {
      if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        if (!isMansionDebugEnabled()) setMansionDebugEnabled(true);
        setMansionDebugDisplayMode('labels');
        syncFromStorage();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        if (!isMansionDebugEnabled()) setMansionDebugEnabled(true);
        setMansionDebugDisplayMode('boundaries');
        syncFromStorage();
        return;
      }
      if (event.altKey) return;
      event.preventDefault();
      toggleMansionDebugEnabled();
      syncFromStorage();
    });
  }, [available, syncFromStorage]);

  const bindViewport = useCallback((binding: MansionDebugViewportBinding | null) => {
    setViewport(binding);
    if (binding) {
      const currentFilter = getMansionDebugPageFilter();
      if (currentFilter !== 'all' && currentFilter !== binding.page) {
        setMansionDebugPageFilter(binding.page);
        setPageFilterState(binding.page);
      }
    }
  }, []);

  const registerRegion = useCallback((region: MansionDebugRegion) => {
    setRuntimeRegions((current) => {
      const without = current.filter((entry) => entry.id !== region.id);
      return [...without, region];
    });
  }, []);

  const unregisterRegion = useCallback((id: string) => {
    setRuntimeRegions((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const selectRegion = useCallback((id: string | null) => {
    setSelectedRegionId(id);
  }, []);

  const patchRegionBounds = useCallback(
    (id: string, bounds: MansionDebugBounds) => {
      setLayoutOverrides((current) => {
        const next = {
          regions: {
            ...current.regions,
            [id]: bounds,
          },
        };
        writeMansionDebugLayoutOverrides(next);
        return next;
      });
    },
    [],
  );

  const resolveRegion = useCallback(
    (region: MansionDebugRegion) => resolveMansionDebugRegion(region, layoutOverrides),
    [layoutOverrides],
  );

  const resolveGrandLobbyRect = useCallback(
    (regionId: DesktopGrandLobbyPanelRegionId) => resolveGrandLobbyPercentRect(regionId, layoutOverrides),
    [layoutOverrides],
  );

  const saveLayout = useCallback(() => {
    writeMansionDebugLayoutOverrides(layoutOverrides);
    reloadLayoutOverrides();
  }, [layoutOverrides, reloadLayoutOverrides]);

  const exportLayout = useCallback(async () => {
    const text = formatMansionDebugLayoutExportForPage(
      viewport?.page ?? 'lobby',
      layoutOverrides,
    );
    return copyMansionDebugText(text);
  }, [layoutOverrides, viewport?.page]);

  const resetLayout = useCallback(() => {
    clearMansionDebugLayoutOverrides();
    setLayoutOverrides(readMansionDebugLayoutOverrides());
    setSelectedRegionId(null);
  }, []);

  const setDisplayMode = useCallback(
    (mode: MansionDebugDisplayMode) => {
      setMansionDebugDisplayMode(mode);
      syncFromStorage();
    },
    [syncFromStorage],
  );

  const setPageFilter = useCallback(
    (filter: MansionDebugPageFilter) => {
      setMansionDebugPageFilter(filter);
      syncFromStorage();
    },
    [syncFromStorage],
  );

  const setFilters = useCallback(
    (next: MansionDebugFilterState) => {
      setMansionDebugFilters(next);
      syncFromStorage();
    },
    [syncFromStorage],
  );

  const setFilterGroup = useCallback(
    (group: keyof MansionDebugFilterState, value: boolean) => {
      const next = { ...getMansionDebugFilters(), [group]: value };
      setMansionDebugFilters(next);
      syncFromStorage();
    },
    [syncFromStorage],
  );

  const toggleEnabled = useCallback(() => {
    toggleMansionDebugEnabled();
    syncFromStorage();
  }, [syncFromStorage]);

  const toggleEditMode = useCallback(() => {
    setEditMode((current) => {
      const next = !current;
      if (next && viewport) {
        if (viewport.page === 'shopping-bag') {
          setSelectedRegionId('curator-tablet-screen');
        } else if (viewport.page === 'acquisition') {
          setSelectedRegionId('acquisition-checkout-tablet');
        }
      }
      return next;
    });
  }, [viewport]);

  const value = useMemo(
    () => ({
      available,
      enabled,
      editMode,
      displayMode,
      pageFilter,
      filters,
      viewport,
      runtimeRegions,
      layoutOverrides,
      selectedRegionId,
      toggleEnabled,
      toggleEditMode,
      setDisplayMode,
      setPageFilter,
      setFilters,
      setFilterGroup,
      bindViewport,
      registerRegion,
      unregisterRegion,
      selectRegion,
      patchRegionBounds,
      resolveRegion,
      resolveGrandLobbyRect,
      saveLayout,
      exportLayout,
      resetLayout,
    }),
    [
      available,
      enabled,
      editMode,
      displayMode,
      pageFilter,
      filters,
      viewport,
      runtimeRegions,
      layoutOverrides,
      selectedRegionId,
      toggleEnabled,
      toggleEditMode,
      setDisplayMode,
      setPageFilter,
      setFilters,
      setFilterGroup,
      bindViewport,
      registerRegion,
      unregisterRegion,
      selectRegion,
      patchRegionBounds,
      resolveRegion,
      resolveGrandLobbyRect,
      saveLayout,
      exportLayout,
      resetLayout,
    ],
  );

  return <MansionDebugContext.Provider value={value}>{children}</MansionDebugContext.Provider>;
}

export function useMansionDebug(): ContextValue | null {
  return useContext(MansionDebugContext);
}

export function useMansionDebugRequired(): ContextValue {
  const ctx = useContext(MansionDebugContext);
  if (!ctx) throw new Error('useMansionDebugRequired must be used within MansionDebugProvider');
  return ctx;
}

export function useMansionDebugViewportBinding(
  measureRef: RefObject<HTMLElement | null>,
  config: { page: MansionDebugViewportBinding['page']; pageZone?: string; pageLabel: string },
): void {
  const debug = useMansionDebug();

  useEffect(() => {
    if (!debug?.available) return;
    debug.bindViewport({ measureRef, ...config });
    return () => debug.bindViewport(null);
  }, [debug, measureRef, config.page, config.pageZone, config.pageLabel]);
}

export function useRegisterMansionDebugRegion(region: MansionDebugRegion | null): void {
  const debug = useMansionDebug();

  useEffect(() => {
    if (!debug?.available || !region) return;
    debug.registerRegion(region);
    return () => debug.unregisterRegion(region.id);
  }, [debug, region]);
}

export function useGrandLobbyLayoutRect(regionId: DesktopGrandLobbyPanelRegionId) {
  const debug = useMansionDebug();
  if (debug?.available) {
    return debug.resolveGrandLobbyRect(regionId);
  }
  return DESKTOP_GRAND_LOBBY_LAYOUT_SEED.rects[regionId];
}
