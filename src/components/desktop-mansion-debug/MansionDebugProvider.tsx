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

type ContextValue = {
  available: boolean;
  enabled: boolean;
  displayMode: MansionDebugDisplayMode;
  pageFilter: MansionDebugPageFilter;
  filters: MansionDebugFilterState;
  viewport: MansionDebugViewportBinding | null;
  runtimeRegions: MansionDebugRegion[];
  toggleEnabled: () => void;
  setDisplayMode: (mode: MansionDebugDisplayMode) => void;
  setPageFilter: (filter: MansionDebugPageFilter) => void;
  setFilters: (filters: MansionDebugFilterState) => void;
  setFilterGroup: (group: keyof MansionDebugFilterState, enabled: boolean) => void;
  bindViewport: (binding: MansionDebugViewportBinding | null) => void;
  registerRegion: (region: MansionDebugRegion) => void;
  unregisterRegion: (id: string) => void;
};

const MansionDebugContext = createContext<ContextValue | null>(null);

export function MansionDebugProvider({ children }: { children: ReactNode }) {
  const available = isMansionDebugAvailable();
  const [enabled, setEnabled] = useState(() => isMansionDebugEnabled());
  const [displayMode, setDisplayModeState] = useState(() => getMansionDebugDisplayMode());
  const [pageFilter, setPageFilterState] = useState(() => getMansionDebugPageFilter());
  const [filters, setFiltersState] = useState(() => getMansionDebugFilters());
  const [viewport, setViewport] = useState<MansionDebugViewportBinding | null>(null);
  const [runtimeRegions, setRuntimeRegions] = useState<MansionDebugRegion[]>([]);

  const syncFromStorage = useCallback(() => {
    setEnabled(isMansionDebugEnabled());
    setDisplayModeState(getMansionDebugDisplayMode());
    setPageFilterState(getMansionDebugPageFilter());
    setFiltersState(getMansionDebugFilters());
  }, []);

  useEffect(() => {
    if (!available) return;
    const onUpdate = () => syncFromStorage();
    window.addEventListener(MANSION_DEBUG_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(MANSION_DEBUG_UPDATED_EVENT, onUpdate);
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

  const value = useMemo(
    () => ({
      available,
      enabled,
      displayMode,
      pageFilter,
      filters,
      viewport,
      runtimeRegions,
      toggleEnabled,
      setDisplayMode,
      setPageFilter,
      setFilters,
      setFilterGroup,
      bindViewport,
      registerRegion,
      unregisterRegion,
    }),
    [
      available,
      enabled,
      displayMode,
      pageFilter,
      filters,
      viewport,
      runtimeRegions,
      toggleEnabled,
      setDisplayMode,
      setPageFilter,
      setFilters,
      setFilterGroup,
      bindViewport,
      registerRegion,
      unregisterRegion,
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
