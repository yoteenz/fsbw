import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  resolveCreativePreviewRenderBinding,
  type CreativePreviewCompanyId,
} from '../studio-os-core/creative-studio-preview';
import { useDepartmentVerticalSlice } from './useDepartmentVerticalSlice';
import { useSceneStack } from './useSceneStack';

/** Experience Lab — invoke Creative Studio World Compiler™ for a company preview. */
export function useCreativeStudioRenderPreview(
  companyId: CreativePreviewCompanyId,
  conceptId: 'a' | 'b' | 'c'
) {
  const { workspaceId } = useWorkspace();
  const binding = useMemo(
    () => resolveCreativePreviewRenderBinding(companyId, conceptId),
    [companyId, conceptId]
  );

  const slice = useDepartmentVerticalSlice(binding.departmentId);
  const stack = useSceneStack(binding.departmentId, slice.project.projectId, workspaceId);

  const stationId = binding.stationId;
  const layers = stack.getLayerViews(stationId);
  const status = stack.getCompositeStatus(stationId);
  const pipeline = stack.getStationPipelineProgress(stationId);
  const sceneGraph = stack.getStationSceneGraph(stationId);
  const compileReport = stack.getStationCompileReport(stationId);

  const ensureAttemptedRef = useRef<string | null>(null);
  const compileAttemptedRef = useRef<string | null>(null);

  const stationKey = `${binding.departmentId}:${stationId}:${slice.project.projectId}`;

  useEffect(() => {
    ensureAttemptedRef.current = null;
    compileAttemptedRef.current = null;
  }, [stationKey]);

  useEffect(() => {
    if (ensureAttemptedRef.current === stationKey) return;
    if (stack.isStationPipelineActive(stationId)) return;

    const hasLayers = layers.some((l) => l.publicUrl);
    if (hasLayers && status !== 'building') {
      ensureAttemptedRef.current = stationKey;
      return;
    }

    ensureAttemptedRef.current = stationKey;
    void stack.ensureStation(stationId);
  }, [layers, stack, stationId, stationKey, status]);

  useEffect(() => {
    if (compileAttemptedRef.current === stationKey) return;
    if (stack.isStationPipelineActive(stationId)) return;

    const hasLayers = layers.some((l) => l.publicUrl);
    if (!hasLayers) return;

    compileAttemptedRef.current = stationKey;
    void stack.compileStation(stationId);
  }, [layers, stack, stationId, stationKey]);

  const retryPipeline = useCallback(() => {
    ensureAttemptedRef.current = null;
    compileAttemptedRef.current = null;
    void stack.ensureStation(stationId);
  }, [stack, stationId]);

  return {
    binding,
    stack,
    stationId,
    layers,
    status,
    pipeline,
    sceneGraph,
    compileReport,
    retryPipeline,
  };
}
