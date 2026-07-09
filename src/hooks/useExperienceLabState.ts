import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyRuntimeGraphToElement,
  ensureExperienceLabSubsystem,
  getExperienceLabReadyView,
  applyLabScenario,
  updateLabSelection,
  updateLabSwitchers,
  setActiveLabPanel,
  GENESIS_UPDATED_EVENT,
  type XelabLabSwitchers,
  type XelabPanelId,
  type XelabScenarioId,
} from '../studio-os-core/genesis';
import { useExperienceRuntimeAssembly } from './useExperienceRuntimeAssembly';

export function useExperienceLabState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureExperienceLabSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExperienceLabSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(() => {
    try {
      return getExperienceLabReadyView();
    } catch {
      ensureExperienceLabSubsystem();
      return getExperienceLabReadyView();
    }
  }, [tick]);
  const graph = view.runtimeGraph;
  const bootError = !graph?.brand?.brandId;

  const { ref: sceneRef, switchBrandLive, switchCount: runtimeSwitchCount } = useExperienceRuntimeAssembly({
    brandId: view.selection.brandId,
    departmentId: view.selection.departmentId,
    sceneId: view.selection.sceneId,
    motionDnaId: view.selection.motionDnaId,
  });

  useEffect(() => {
    if (bootError) return;
    const el = sceneRef.current;
    if (!el) return;
    applyRuntimeGraphToElement(el, graph);
  }, [bootError, graph, sceneRef]);

  const loadScenario = useCallback(
    (scenarioId: XelabScenarioId) => {
      applyLabScenario(scenarioId);
      refresh();
    },
    [refresh]
  );

  const setBrand = useCallback(
    (brandId: string) => {
      updateLabSelection({ brandId, motionDnaId: `motion-${brandId}` });
      switchBrandLive(brandId);
      refresh();
    },
    [refresh, switchBrandLive]
  );

  const setDepartment = useCallback(
    (departmentId: string) => {
      updateLabSelection({ departmentId });
      refresh();
    },
    [refresh]
  );

  const setSwitchers = useCallback(
    (partial: Partial<XelabLabSwitchers>) => {
      updateLabSwitchers(partial);
      refresh();
    },
    [refresh]
  );

  const setPanel = useCallback(
    (panel: XelabPanelId) => {
      setActiveLabPanel(panel);
      refresh();
    },
    [refresh]
  );

  return {
    view,
    graph,
    sceneRef,
    loadScenario,
    setBrand,
    setDepartment,
    setSwitchers,
    setPanel,
    refresh,
    switchCount: view.switchCount + runtimeSwitchCount,
    bootError,
  };
}
