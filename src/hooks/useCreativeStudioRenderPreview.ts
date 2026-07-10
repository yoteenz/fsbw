import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  resolveCreativePreviewRenderBinding,
  type CreativePreviewCompanyId,
} from '../studio-os-core/creative-studio-preview';
import {
  setValidationRenderMode,
  shellIsMountReady,
  diagnoseShellResolution,
} from '../studio-os-core/scene-stack';
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
  const projectId = slice.project.projectId;
  const departmentId = binding.departmentId;

  const layers = stack.getLayerViews(stationId);
  const status = stack.getCompositeStatus(stationId);
  const pipeline = stack.getStationPipelineProgress(stationId);
  const sceneGraph = stack.getStationSceneGraph(stationId);
  const compileReport = stack.getStationCompileReport(stationId);

  const shellDiagnostic = useMemo(
    () => diagnoseShellResolution(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, compileReport]
  );

  const shellReady = useMemo(
    () => shellIsMountReady(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, status]
  );

  const ensureAttemptedRef = useRef<string | null>(null);
  const compileAttemptedRef = useRef<string | null>(null);

  const stationKey = `${departmentId}:${stationId}:${projectId}`;

  useEffect(() => {
    setValidationRenderMode('experience-lab-validation');
    return () => setValidationRenderMode('production');
  }, []);

  useEffect(() => {
    ensureAttemptedRef.current = null;
    compileAttemptedRef.current = null;
  }, [stationKey]);

  useEffect(() => {
    if (ensureAttemptedRef.current === stationKey) return;
    if (stack.isStationPipelineActive(stationId)) return;

    if (status === 'ready' && shellReady) {
      ensureAttemptedRef.current = stationKey;
      return;
    }

    ensureAttemptedRef.current = stationKey;
    void stack.ensureStation(stationId, { validationMode: true });
  }, [shellReady, stack, stationId, stationKey, status]);

  useEffect(() => {
    if (compileAttemptedRef.current === stationKey) return;
    if (stack.isStationPipelineActive(stationId)) return;
    if (!shellReady) return;

    compileAttemptedRef.current = stationKey;
    void stack.compileStation(stationId, { validationMode: true });
  }, [shellReady, stack, stationId, stationKey]);

  const retryPipeline = useCallback(() => {
    ensureAttemptedRef.current = null;
    compileAttemptedRef.current = null;
    void stack.ensureStation(stationId, { validationMode: true });
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
    shellDiagnostic,
    shellReady,
    retryPipeline,
  };
}
