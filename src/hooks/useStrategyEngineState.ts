import {useCallback, useMemo, useState} from 'react';
import { buildStrategyEngineSeed } from '../studio-os-core/strategy-engine/bootstrap';
import {
  bootstrapStrategyEngineStore,
  readStrategyEngineStore,
  selectStrategyEngineInitiative,
  selectStrategyEngineStrategy,
  selectStrategyEngineWorkspace,
  setStrategyBuilderStep,
} from '../studio-os-core/strategy-engine/store';
import type { WorkspaceStrategyId } from '../studio-os-core/strategy-engine/types';

function ensureSeeded(): void {
  bootstrapStrategyEngineStore(buildStrategyEngineSeed());
}

export function useStrategyEngineState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);


  const store = useMemo(() => {
    void version;
    return readStrategyEngineStore();
  }, [version]);

  const activeProfile = useMemo(
    () => store.profiles.find((p) => p.workspaceId === store.activeWorkspaceId) ?? store.profiles[0] ?? null,
    [store.profiles, store.activeWorkspaceId]
  );

  const selectedStrategy = useMemo(
    () => store.strategies.find((s) => s.id === store.selectedStrategyId) ?? null,
    [store.strategies, store.selectedStrategyId]
  );

  const selectedInitiative = useMemo(
    () => store.initiatives.find((i) => i.id === store.selectedInitiativeId) ?? null,
    [store.initiatives, store.selectedInitiativeId]
  );

  const workspaceStrategies = useMemo(
    () => store.strategies.filter((s) => s.workspaceId === store.activeWorkspaceId),
    [store.strategies, store.activeWorkspaceId]
  );

  const workspaceInitiatives = useMemo(
    () => store.initiatives.filter((i) => i.workspaceId === store.activeWorkspaceId),
    [store.initiatives, store.activeWorkspaceId]
  );

  const workspaceBets = useMemo(
    () => store.bets.filter((b) => b.workspaceId === store.activeWorkspaceId || b.workspaceId === 'studio-os'),
    [store.bets, store.activeWorkspaceId]
  );

  const selectWorkspace = useCallback((id: WorkspaceStrategyId) => {
    selectStrategyEngineWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectStrategy = useCallback((id: string | null) => {
    selectStrategyEngineStrategy(id);
    setVersion((v) => v + 1);
  }, []);

  const selectInitiative = useCallback((id: string | null) => {
    selectStrategyEngineInitiative(id);
    setVersion((v) => v + 1);
  }, []);

  const setBuilderStep = useCallback((step: number) => {
    setStrategyBuilderStep(step);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    activeProfile,
    selectedStrategy,
    selectedInitiative,
    workspaceStrategies,
    workspaceInitiatives,
    workspaceBets,
    refresh,
    selectWorkspace,
    selectStrategy,
    selectInitiative,
    setBuilderStep,
  };
}
