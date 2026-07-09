import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyRuntimeGraphToElement,
  ensureExperienceEngineDnaSubsystem,
  ensureExperienceLabSubsystem,
  ensureExperienceRuntimeSubsystem,
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
    ensureExperienceEngineDnaSubsystem();
    ensureExperienceRuntimeSubsystem();
    ensureExperienceLabSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureExperienceEngineDnaSubsystem();
    ensureExperienceRuntimeSubsystem();
    ensureExperienceLabSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const view = useMemo(() => getExperienceLabReadyView(), [tick]);
  const graph = view.runtimeGraph;
  const bootReport = view.bootReport;
  const bootBlocked = !graph?.brand?.brandId;

  const { ref: sceneRef, switchBrandLive, switchCount: runtimeSwitchCount } = useExperienceRuntimeAssembly({
    brandId: view.selection.brandId,
    departmentId: view.selection.departmentId,
    sceneId: view.selection.sceneId,
    motionDnaId: view.selection.motionDnaId,
  });

  useEffect(() => {
    if (bootBlocked || !graph) return;
    const el = sceneRef.current;
    if (!el) return;
    applyRuntimeGraphToElement(el, graph);
  }, [bootBlocked, graph, sceneRef]);

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
    graph,
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
