import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyRuntimeGraphToElement,
  buildExperienceLabReadyView,
  ensureExperienceEngineDnaSubsystem,
  ensureExperienceLabSubsystem,
  ensureExperienceRuntimeSubsystem,
  repairExperienceLabStoreIfNeeded,
  applyLabScenario,
  updateLabSelection,
  updateLabSwitchers,
  setActiveLabPanel,
  type XelabLabSwitchers,
  type XelabPanelId,
  type XelabScenarioId,
} from '../studio-os-core/genesis';
import { useExperienceRuntimeAssembly } from './useExperienceRuntimeAssembly';

export function useExperienceLabState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    repairExperienceLabStoreIfNeeded();
    ensureExperienceEngineDnaSubsystem();
    ensureExperienceRuntimeSubsystem();
    ensureExperienceLabSubsystem();
  }, []);

  const view = useMemo(() => buildExperienceLabReadyView(), [tick]);
  const bootReport = view.bootReport;
  const bootBlocked = !view.runtimeGraph?.brand?.brandId;

  const { ref: sceneRef, graph, switchBrandLive, switchCount: runtimeSwitchCount } =
    useExperienceRuntimeAssembly({
      brandId: view.selection.brandId,
      departmentId: view.selection.departmentId,
      sceneId: view.selection.sceneId,
      motionDnaId: view.selection.motionDnaId,
    });

  const displayGraph = graph ?? view.runtimeGraph;

  useEffect(() => {
    if (bootBlocked || !displayGraph) return;
    const el = sceneRef.current;
    if (!el) return;
    applyRuntimeGraphToElement(el, displayGraph);
  }, [bootBlocked, displayGraph, sceneRef]);

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

  const setScene = useCallback(
    (sceneId: string) => {
      updateLabSelection({ sceneId });
      refresh();
    },
    [refresh]
  );

  return {
    view,
    graph: displayGraph,
    bootReport,
    sceneRef,
    loadScenario,
    setBrand,
    setDepartment,
    setScene,
    setSwitchers,
    setPanel,
    refresh,
    switchCount: view.switchCount + runtimeSwitchCount,
    bootBlocked,
  };
}
