import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  resolveCreativePreviewRenderBinding,
  runExperienceLabValidationShellPipeline,
  type CreativePreviewCompanyId,
  type ValidationShellPipelineResult,
} from '../studio-os-core/creative-studio-preview';
import {
  setValidationRenderMode,
  setValidationPreviewSession,
  clearValidationPreviewSession,
  shellIsMountReady,
  diagnoseShellResolution,
} from '../studio-os-core/scene-stack';
import { useDepartmentVerticalSlice } from './useDepartmentVerticalSlice';
import { useSceneStack } from './useSceneStack';

export type ShellPipelinePhase = 'idle' | 'compile-spec' | 'generate-shell' | 'register' | 'ready' | 'failed';

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

  const previewSessionId = `${companyId}:${conceptId}:${departmentId}:${stationId}:${projectId}`;

  const layers = stack.getLayerViews(stationId);
  const status = stack.getCompositeStatus(stationId);
  const pipeline = stack.getStationPipelineProgress(stationId);
  const sceneGraph = stack.getStationSceneGraph(stationId);
  const compileReport = stack.getStationCompileReport(stationId);

  const [shellPipelinePhase, setShellPipelinePhase] = useState<ShellPipelinePhase>('idle');
  const [shellPipelineResult, setShellPipelineResult] = useState<ValidationShellPipelineResult | null>(null);

  const shellDiagnostic = useMemo(
    () => diagnoseShellResolution(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, compileReport, shellPipelinePhase]
  );

  const shellReady = useMemo(
    () => shellIsMountReady(departmentId, projectId, stationId, { validationMode: true }),
    [departmentId, projectId, stationId, layers, status, shellPipelinePhase]
  );

  const pipelineRunRef = useRef<string | null>(null);
  const compileAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    setValidationRenderMode('experience-lab-validation');
    setValidationPreviewSession(previewSessionId);
    return () => {
      setValidationPreviewSession(null);
      clearValidationPreviewSession(previewSessionId);
      setValidationRenderMode('production');
    };
  }, [previewSessionId]);

  useEffect(() => {
    pipelineRunRef.current = null;
    compileAttemptedRef.current = null;
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
  }, [previewSessionId]);

  useEffect(() => {
    if (pipelineRunRef.current === previewSessionId) return;
    if (stack.isStationPipelineActive(stationId)) return;

    pipelineRunRef.current = previewSessionId;
    let cancelled = false;

    async function run() {
      setShellPipelinePhase('compile-spec');
      const shellResult = await runExperienceLabValidationShellPipeline({
        companyId,
        conceptId,
        projectId,
        previewSessionId,
        workspaceId,
        forceRegenerate: true,
      });

      if (cancelled) return;

      setShellPipelineResult(shellResult);

      if (!shellResult.ok) {
        setShellPipelinePhase('failed');
        return;
      }

      setShellPipelinePhase('ready');
      stack.bump();

      await stack.ensureStation(stationId, {
        validationMode: true,
        skipEnvironmentShell: true,
      });

      if (cancelled) return;

      const compiled = await stack.compileStation(stationId, { validationMode: true });
      if (!cancelled && !compiled.report.success) {
        stack.bump();
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [companyId, conceptId, previewSessionId, projectId, stack, stationId, workspaceId]);

  const retryPipeline = useCallback(() => {
    pipelineRunRef.current = null;
    compileAttemptedRef.current = null;
    clearValidationPreviewSession(previewSessionId);
    setShellPipelinePhase('idle');
    setShellPipelineResult(null);
    void runExperienceLabValidationShellPipeline({
      companyId,
      conceptId,
      projectId,
      previewSessionId,
      workspaceId,
      forceRegenerate: true,
    }).then(async (shellResult) => {
      setShellPipelineResult(shellResult);
      if (!shellResult.ok) {
        setShellPipelinePhase('failed');
        return;
      }
      setShellPipelinePhase('ready');
      stack.bump();
      await stack.ensureStation(stationId, { validationMode: true, skipEnvironmentShell: true });
      await stack.compileStation(stationId, { validationMode: true });
    });
  }, [companyId, conceptId, previewSessionId, projectId, stack, stationId, workspaceId]);

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
    shellPipelinePhase,
    shellPipelineResult,
    previewSessionId,
    retryPipeline,
  };
}