import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  applyRuntimeGraphToElement,
  assembleExperienceRuntime,
  ensureExperienceRuntimeSubsystem,
  switchRuntimeBrandLive,
  updateSessionStateSlot,
  type XerRuntimeGraph,
} from '../studio-os-core/genesis';

/** Runtime assembly hook — live Brand DNA switching without page reload or layout regeneration. */
export function useExperienceRuntimeAssembly(input?: {
  brandId?: string;
  departmentId?: string;
  sceneId?: string;
  motionDnaId?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [graph, setGraph] = useState<XerRuntimeGraph | null>(null);
  const [switchCount, setSwitchCount] = useState(0);

  useEffect(() => {
    ensureExperienceRuntimeSubsystem();
  }, []);

  const runtimeGraph = useMemo(
    () =>
      assembleExperienceRuntime({
        brandId: input?.brandId,
        departmentId: input?.departmentId,
        sceneId: input?.sceneId,
        motionDnaId: input?.motionDnaId,
        skipCache: false,
      }),
    [input?.brandId, input?.departmentId, input?.sceneId, input?.motionDnaId]
  );

  useEffect(() => {
    setGraph(runtimeGraph);
  }, [runtimeGraph]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    applyRuntimeGraphToElement(el, graph ?? runtimeGraph);
  }, [graph, runtimeGraph]);

  const switchBrandLive = useCallback((brandId: string) => {
    const next = switchRuntimeBrandLive(brandId);
    setGraph(next);
    setSwitchCount((n) => n + 1);
    const el = ref.current;
    if (el) applyRuntimeGraphToElement(el, next);
    return next;
  }, []);

  const updateStateSlot = useCallback((slotId: string, value: string) => {
    updateSessionStateSlot(slotId, value);
  }, []);

  return {
    ref,
    graph: graph ?? runtimeGraph,
    switchBrandLive,
    updateStateSlot,
    switchCount,
  };
}
