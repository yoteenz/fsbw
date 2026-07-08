import { useCallback, useEffect, useState } from 'react';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import type { ArchitecturalNavRailMode } from '../studio-os-core/architectural-navigation';

const STORAGE_KEY = ADMIN_STUDIO_STORAGE_KEYS.architecturalNavRail;

type RailPrefs = {
  mode: ArchitecturalNavRailMode;
};

export function useArchitecturalNavigationRail() {
  const [mode, setModeState] = useState<ArchitecturalNavRailMode>(() => {
    const stored = readStudioJson<RailPrefs>(STORAGE_KEY);
    return stored?.mode ?? 'expanded';
  });

  const persist = useCallback((next: ArchitecturalNavRailMode) => {
    writeStudioJson(STORAGE_KEY, { mode: next });
    setModeState(next);
    document.documentElement.style.setProperty('--sw-rail-w', railWidthForMode(next));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--sw-rail-w', railWidthForMode(mode));
    return () => {
      document.documentElement.style.removeProperty('--sw-rail-w');
    };
  }, [mode]);

  const cycleMode = useCallback(() => {
    const order: ArchitecturalNavRailMode[] = ['expanded', 'compact', 'hidden'];
    const idx = order.indexOf(mode);
    persist(order[(idx + 1) % order.length]!);
  }, [mode, persist]);

  const setMode = useCallback((next: ArchitecturalNavRailMode) => persist(next), [persist]);

  return { mode, setMode, cycleMode };
}

export function railWidthForMode(mode: ArchitecturalNavRailMode): string {
  if (mode === 'expanded') return '168px';
  if (mode === 'compact') return '48px';
  return '0px';
}
