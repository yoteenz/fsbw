import { useCallback, useEffect, useMemo, useState } from 'react';
import { requireDepartmentPackage } from '../studio-os-core/department-package';
import {
  approveSceneStackLayer,
  buildSceneGraph,
  buildSceneStackExportBundle,
  compileSceneStackLayerPrompt,
  compileWorldStation,
  createDebugViewState,
  enforceFalReferenceLaw,
  executeCleanRegenerationDiscard,
  getSceneStackLayerRecord,
  getLockedReferenceUrlsForLayer,
  listGeneratableLayerIdsForStation,
  listSceneStackStations,
  nextSceneStackLayerVersion,
  planCleanRegeneration,
  resolveMasterSceneBlueprint,
  resolveStackCompositeStatus,
  resolveStationLayerViews,
  saveSceneStackLayerRecord,
  getSceneStackStation,
  SCENE_STACK_LAYER_SHORT_LABELS,
  hydrateSceneStackFromBuilderRegistry,
  tryMountSceneStackLayerFromRegistry,
  SCENE_STACK_HYDRATED_EVENT,
  getRegistryAssetForSceneLayer,
  validateSceneLayerQuality,
  formatQualityGuardSummary,
  SCENE_ASSEMBLY_LAW_VERSION,
  assertShellImmutableForLayer,
  resolveShellLockState,
  toggleDebugLayer,
  type SceneGraph,
  type SceneStackExportBundle,
  type CleanRegenerationPlan,
  type SceneStackCompositeStatus,
  type SceneStackLayerId,
  type SceneStackLayerView,
  type WorldCompilationReport,
  type ArchitectDebugViewState,
  type ArchitectDebugLayer,
  isExperienceLabValidationRender,
  type WorldCompileOptions,
} from '../studio-os-core/scene-stack';
import { requestStudioBuilderGenerate } from '../services/studio/studioBuilder/api';
import {
  beginStudioAlphaGeneration,
  completeStudioAlphaGeneration,
  failStudioAlphaGeneration,
  layerIdToAssetType,
  recordStudioAlphaReuse,
} from '../studio-os-core/studio-alpha-cost';
import { gateAfterSceneAssembly, requestArchitectureAudit } from '../studio-os-core/architecture-auditor';
import {
  gateAfterArchitectureAudit,
  requestExperienceIntelligenceAudit,
} from '../studio-os-core/experience-intelligence-engine';
import {
  freezeLayer1Failure,
  isWorldCompilerDiagnosticMode,
  LAYER_1_ID,
  recordLayer1Transition,
} from '../studio-os/diagnostics/world-compiler-investigation';
import { VALIDATION_RENDER_AUTHORIZATION } from '../studio-os-core/scene-stack/validation-render';

export type SceneStackPipelineProgress = {
  stationId: string;
  layersComplete: number;
  layersTotal: number;
  currentLayerId: SceneStackLayerId | null;
  currentLayerLabel: string | null;
  phase: 'idle' | 'queued' | 'generating';
};

export function useSceneStack(
  departmentId: string,
  projectId: string,
  workspaceId: string | undefined
) {
  const [version, setVersion] = useState(0);
  const [generatingKeys, setGeneratingKeys] = useState<Set<string>>(new Set());
  const [ensuringStations, setEnsuringStations] = useState<Set<string>>(new Set());
  const [pipelineLayer, setPipelineLayer] = useState<{
    stationId: string;
    layerId: SceneStackLayerId;
    phase: 'queued' | 'generating';
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [compileReports, setCompileReports] = useState<Record<string, WorldCompilationReport>>({});
  const [debugView, setDebugView] = useState<ArchitectDebugViewState>(() => createDebugViewState());

  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const pkg = useMemo(() => requireDepartmentPackage(departmentId), [departmentId]);
  const stations = useMemo(() => listSceneStackStations(departmentId), [departmentId]);

  useEffect(() => {
    hydrateSceneStackFromBuilderRegistry(departmentId, projectId);
    void import('../services/studio/assetRegistry/pipelineSync')
      .then((m) => m.hydratePipelineRegistryFromSupabase(departmentId, projectId))
      .catch(() => {
        /* offline — local Scene Stack still mounts from registry */
      });
  }, [departmentId, projectId]);

  useEffect(() => {
    const onHydrated = () => bump();
    const onRegistrySynced = () => bump();
    window.addEventListener(SCENE_STACK_HYDRATED_EVENT, onHydrated);
    window.addEventListener('studio-os-pipeline-registry-synced', onRegistrySynced);
    return () => {
      window.removeEventListener(SCENE_STACK_HYDRATED_EVENT, onHydrated);
      window.removeEventListener('studio-os-pipeline-registry-synced', onRegistrySynced);
    };
  }, [bump]);

  const genKey = (stationId: string, layerId: SceneStackLayerId) => `${stationId}:${layerId}`;

  const getLayerViews = useCallback(
    (stationId: string): SceneStackLayerView[] => {
      void version;
      const generating = new Set<SceneStackLayerId>();
      const failed = new Set<SceneStackLayerId>();
      for (const key of generatingKeys) {
        const [sid, lid] = key.split(':') as [string, SceneStackLayerId];
        if (sid === stationId) generating.add(lid);
      }
      for (const [key, msg] of Object.entries(errors)) {
        if (msg) {
          const [sid, lid] = key.split(':') as [string, SceneStackLayerId];
          if (sid === stationId) failed.add(lid);
        }
      }
      return resolveStationLayerViews(departmentId, projectId, stationId, generating, failed);
    },
    [departmentId, projectId, version, generatingKeys, errors]
  );

  const getCompositeStatus = useCallback(
    (stationId: string): SceneStackCompositeStatus => {
      const base = resolveStackCompositeStatus(getLayerViews(stationId));
      if (ensuringStations.has(stationId) && base !== 'ready') return 'building';
      return base;
    },
    [ensuringStations, getLayerViews]
  );

  const isStationPipelineActive = useCallback(
    (stationId: string) => {
      if (ensuringStations.has(stationId)) return true;
      for (const key of generatingKeys) {
        if (key.startsWith(`${stationId}:`)) return true;
      }
      return false;
    },
    [ensuringStations, generatingKeys]
  );

  const getStationPipelineProgress = useCallback(
    (stationId: string): SceneStackPipelineProgress => {
      const station = getSceneStackStation(departmentId, stationId);
      const layerIds = station
        ? listGeneratableLayerIdsForStation(departmentId, stationId, station.layerPrompts)
        : [];
      const views = getLayerViews(stationId);
      const layersComplete = views.filter((l) => l.definition.generatable && l.publicUrl).length;
      const layersTotal = layerIds.length;

      let currentLayerId: SceneStackLayerId | null = null;
      let phase: SceneStackPipelineProgress['phase'] = 'idle';

      if (pipelineLayer?.stationId === stationId) {
        currentLayerId = pipelineLayer.layerId;
        phase = pipelineLayer.phase;
      } else if (ensuringStations.has(stationId)) {
        phase = 'queued';
        currentLayerId = layerIds.find((id) => !getSceneStackLayerRecord(departmentId, projectId, stationId, id)?.publicUrl) ?? null;
      } else {
        for (const key of generatingKeys) {
          if (key.startsWith(`${stationId}:`)) {
            currentLayerId = key.split(':')[1] as SceneStackLayerId;
            phase = 'generating';
            break;
          }
        }
      }

      return {
        stationId,
        layersComplete,
        layersTotal,
        currentLayerId,
        currentLayerLabel: currentLayerId ? SCENE_STACK_LAYER_SHORT_LABELS[currentLayerId] : null,
        phase,
      };
    },
    [departmentId, ensuringStations, generatingKeys, getLayerViews, pipelineLayer, projectId]
  );

  const generateLayer = useCallback(
    async (
      stationId: string,
      layerId: SceneStackLayerId,
      force = false,
      layerCompileOptions?: Pick<WorldCompileOptions, 'previewCompileContext' | 'validationMode'>
    ): Promise<boolean> => {
      const key = genKey(stationId, layerId);
      if (generatingKeys.has(key)) return false;

      const previewSessionId = layerCompileOptions?.previewCompileContext?.previewSessionId;
      const validationMode = layerCompileOptions?.validationMode ?? isExperienceLabValidationRender();
      const lookupOptions =
        validationMode && previewSessionId
          ? { validationMode: true, previewSessionId }
          : undefined;

      const existing = getSceneStackLayerRecord(
        departmentId,
        projectId,
        stationId,
        layerId,
        lookupOptions
      );
      if (!force && (existing?.status === 'approved' || existing?.status === 'draft_ready') && existing.publicUrl) return true;

      if (!force) {
        const reuseEntry = getRegistryAssetForSceneLayer(
          departmentId,
          projectId,
          stationId,
          layerId
        );
        if (
          reuseEntry?.publicUrl &&
          tryMountSceneStackLayerFromRegistry(departmentId, projectId, stationId, layerId)
        ) {
          recordStudioAlphaReuse({
            departmentId,
            projectId,
            sceneId: stationId,
            assetId: `scene-stack-${stationId}-${layerId}-reused`,
            assetType: layerIdToAssetType(layerId),
            reusedFromAssetId: reuseEntry.assetId,
            model: reuseEntry.model,
          });
          bump();
          return true;
        }
      }

      setPipelineLayer({ stationId, layerId, phase: 'generating' });
      setGeneratingKeys((prev) => new Set(prev).add(key));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      const nextVersion = force
        ? nextSceneStackLayerVersion(departmentId, projectId, stationId, layerId)
        : existing?.publicUrl
          ? existing.version
          : nextSceneStackLayerVersion(departmentId, projectId, stationId, layerId);

      const assetId = `scene-stack-${stationId}-${layerId}-v${nextVersion}`;
      const generationId = beginStudioAlphaGeneration({
        departmentId,
        projectId,
        sceneId: stationId,
        assetId,
        assetType: layerIdToAssetType(layerId),
      });

      try {
        const isLayer1 = layerId === LAYER_1_ID;
        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          recordLayer1Transition('LAYER_1_ENTERED', { stationId, departmentId, projectId });
        }

        const station = getSceneStackStation(departmentId, stationId);
        const blueprint = resolveMasterSceneBlueprint({
          departmentId,
          projectId,
          stationId,
          workspaceId,
        });

        const shellLock = resolveShellLockState(departmentId, projectId, stationId, {
          validationMode,
          ...(previewSessionId ? { previewSessionId } : {}),
        });
        const shellCheck = assertShellImmutableForLayer(layerId, shellLock);
        if (!shellCheck.ok) {
          failStudioAlphaGeneration(generationId, shellCheck.reason);
          setErrors((prev) => ({ ...prev, [key]: shellCheck.reason }));
          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            freezeLayer1Failure({
              failedTransition: 'LAYER_1_ENTERED',
              errorCode: shellCheck.code,
              errorMessage: shellCheck.reason,
              failedFunction: 'assertShellImmutableForLayer',
              failedFile: 'src/studio-os-core/scene-stack/world-compiler/immutable-shell.ts',
              adapter: 'shell-immutability-guard',
              shellRemainedValid: Boolean(shellLock.shellUrl),
              requestInput: { layerId, shellLock },
              responseOutput: null,
            });
          }
          return false;
        }

        const rawReferenceUrls = station
          ? getLockedReferenceUrlsForLayer(
              departmentId,
              projectId,
              stationId,
              layerId,
              station.layerPrompts
            )
          : [];

        const refEnforcement = enforceFalReferenceLaw({
          departmentId,
          projectId,
          stationId,
          targetLayerId: layerId,
          requestedUrls: rawReferenceUrls,
        });

        if (!refEnforcement.ok) {
          const msg = refEnforcement.violations.join(' ');
          failStudioAlphaGeneration(generationId, msg);
          setErrors((prev) => ({ ...prev, [key]: msg }));
          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            freezeLayer1Failure({
              failedTransition: 'LANDMARK_REQUEST_CREATED',
              errorCode: 'SCENE_STACK_REFERENCE_LAW',
              errorMessage: msg,
              failedFunction: 'enforceFalReferenceLaw',
              failedFile: 'src/studio-os-core/scene-stack/reference-enforcement.ts',
              adapter: 'fal-reference-enforcement',
              shellRemainedValid: Boolean(shellLock.shellUrl),
              requestInput: { layerId, rawReferenceUrls, violations: refEnforcement.violations },
              responseOutput: null,
            });
          }
          return false;
        }

        const referenceImageUrls = refEnforcement.sanitizedUrls;

        const compiled = compileSceneStackLayerPrompt({
          departmentId,
          stationId,
          layerId,
          workspaceId,
          projectId,
          referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
        });

        const generationPayload = {
          departmentId,
          packageId: pkg.packageId,
          projectId,
          productionGroupId: `scene-stack-${stationId}-${layerId}`,
          heroAssetId: compiled.heroAssetId,
          prompt: compiled.prompt,
          aspectRatio: compiled.aspectRatio,
          outputFormat: compiled.outputFormat,
          forceGenerate: force || !existing?.publicUrl,
          referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
        };

        const requestInputForensic = {
          schemaVersion: 'scene-stack-layer-generate-v1',
          layerId,
          stationId,
          departmentId,
          packageId: pkg.packageId,
          projectId,
          compiledProductionGroupId: compiled.productionGroupId,
          compiledHeroAssetId: compiled.heroAssetId,
          blueprintId: compiled.blueprintId,
          promptVersion: compiled.promptVersion,
          aspectRatio: compiled.aspectRatio,
          outputFormat: compiled.outputFormat,
          referenceImageUrls,
          referenceUrlScheme: referenceImageUrls.map((u) => (u.startsWith('data:') ? 'data-url' : u.startsWith('http') ? 'http' : 'other')),
          validationMode: isExperienceLabValidationRender(),
          authorizationMode: VALIDATION_RENDER_AUTHORIZATION,
          generationProvider: 'POST /api/admin/studio-builder-generate',
          modelAdapter: 'fal-ai/nano-banana-pro/edit via executeGovernedGeneration → generateStudioBuilderAsset',
          forceGenerate: generationPayload.forceGenerate,
        };

        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          recordLayer1Transition('LANDMARK_REQUEST_CREATED', { requestInputForensic });
          recordLayer1Transition('GENERATION_REQUEST_STARTED', {
            endpoint: '/api/admin/studio-builder-generate',
          });
        }

        const result = await requestStudioBuilderGenerate(generationPayload);

        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          if (result.ok && result.publicUrl) {
            recordLayer1Transition('GENERATION_REQUEST_COMPLETED', {
              publicUrl: result.publicUrl,
              model: result.model,
              code: result.code,
            });
          } else {
            recordLayer1Transition('GENERATION_REQUEST_FAILED', {
              error: result.error,
              code: result.code,
            });
          }
        }

        if (!result.ok || !result.publicUrl) {
          const errMsg = result.error ?? 'Layer generation failed';
          failStudioAlphaGeneration(generationId, errMsg);
          setErrors((prev) => ({ ...prev, [key]: errMsg }));
          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            freezeLayer1Failure({
              failedTransition: 'GENERATION_REQUEST_FAILED',
              errorCode: result.code ?? 'GENERATION_FAILED',
              errorMessage: errMsg,
              failedFunction: 'requestStudioBuilderGenerate',
              failedFile: 'src/services/studio/studioBuilder/api.ts',
              adapter: 'studio-builder-generate → executeGovernedGeneration (FAL nano-banana-pro/edit)',
              shellRemainedValid: Boolean(shellLock.shellUrl),
              requestInput: requestInputForensic,
              responseOutput: {
                ok: result.ok,
                code: result.code,
                error: result.error,
                publicUrl: result.publicUrl ?? null,
                model: result.model ?? null,
              },
            });
          }
          return false;
        }

        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          recordLayer1Transition('LANDMARK_VALIDATION_STARTED', { publicUrl: result.publicUrl });
        }

        const quality = await validateSceneLayerQuality({
          layerId,
          publicUrl: result.publicUrl,
          blueprint,
        });

        if (quality.status === 'regenerate_required') {
          const msg = formatQualityGuardSummary(quality);
          failStudioAlphaGeneration(generationId, msg);
          setErrors((prev) => ({ ...prev, [key]: msg }));
          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            freezeLayer1Failure({
              failedTransition: 'LANDMARK_VALIDATION_FAILED',
              errorCode: 'QUALITY_REGENERATE_REQUIRED',
              errorMessage: msg,
              failedFunction: 'validateSceneLayerQuality',
              failedFile: 'src/studio-os-core/scene-stack/quality-guard.ts',
              adapter: 'scene-layer-quality-guard',
              shellRemainedValid: Boolean(shellLock.shellUrl),
              requestInput: requestInputForensic,
              responseOutput: { publicUrl: result.publicUrl, quality },
            });
          }
          saveSceneStackLayerRecord({
            departmentId,
            projectId,
            stationId,
            layerId,
            version: nextVersion,
            status: 'failed',
            publicUrl: result.publicUrl,
            storagePath: result.storagePath,
            model: result.model,
            generatedAt: new Date().toISOString(),
            promptVersion: compiled.promptVersion,
            productionGroupId: compiled.productionGroupId,
            heroAssetId: compiled.heroAssetId,
            blueprintId: compiled.blueprintId,
            assemblyLawVersion: SCENE_ASSEMBLY_LAW_VERSION,
            qualityStatus: 'regenerate_required',
            qualityIssues: quality.issues,
          });
          bump();
          return false;
        }

        completeStudioAlphaGeneration({
          generationId,
          model: result.model,
          assetId,
        });

        saveSceneStackLayerRecord({
          departmentId,
          projectId,
          stationId,
          layerId,
          version: nextVersion,
          status: 'draft_ready',
          publicUrl: result.publicUrl,
          storagePath: result.storagePath,
          model: result.model,
          generatedAt: new Date().toISOString(),
          promptVersion: compiled.promptVersion,
          productionGroupId: compiled.productionGroupId,
          heroAssetId: compiled.heroAssetId,
          blueprintId: compiled.blueprintId,
          assemblyLawVersion: SCENE_ASSEMBLY_LAW_VERSION,
          qualityStatus: quality.status,
          qualityIssues: quality.issues,
          canonicalStatus: 'non_canonical',
        });

        // Phase 1: no auto-register to Asset Registry — promotion requires Production Authorization.

        bump();
        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          recordLayer1Transition('LAYER_1_COMPLETED', { publicUrl: result.publicUrl });
        }
        void compileWorldStation({
          departmentId,
          projectId,
          stationId,
          blueprint,
          options: {
            validationMode,
            ...(layerCompileOptions?.previewCompileContext
              ? { previewCompileContext: layerCompileOptions.previewCompileContext }
              : {}),
          },
        }).then((result) => {
          setCompileReports((prev) => ({ ...prev, [stationId]: result.report }));
        });
        void gateAfterSceneAssembly({ departmentId, projectId, stationId })
          .then(() => gateAfterArchitectureAudit({ departmentId, projectId, stationId }))
          .then(() => {
            requestArchitectureAudit();
            requestExperienceIntelligenceAudit();
          });
        return true;
      } catch (err) {
        failStudioAlphaGeneration(
          generationId,
          err instanceof Error ? err.message : 'Layer generation failed'
        );
        setErrors((prev) => ({
          ...prev,
          [key]: err instanceof Error ? err.message : 'Layer generation failed',
        }));
        return false;
      } finally {
        setGeneratingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setPipelineLayer((prev) =>
          prev?.stationId === stationId && prev.layerId === layerId ? null : prev
        );
      }
    },
    [bump, departmentId, generatingKeys, pkg.packageId, projectId, workspaceId]
  );

  const regenerateLayer = useCallback(
    async (
      stationId: string,
      layerId: SceneStackLayerId,
      compileOptions?: Pick<WorldCompileOptions, 'previewCompileContext' | 'validationMode'>
    ) => generateLayer(stationId, layerId, true, compileOptions),
    [generateLayer]
  );

  const ensureStation = useCallback(
    async (stationId: string, options?: WorldCompileOptions) => {
      const station = getSceneStackStation(departmentId, stationId);
      if (!station || ensuringStations.has(stationId)) return;

      let layerIds = listGeneratableLayerIdsForStation(
        departmentId,
        stationId,
        station.layerPrompts
      );
      if (options?.skipEnvironmentShell) {
        layerIds = layerIds.filter((id) => id !== 'environment-shell');
      }

      setEnsuringStations((prev) => new Set(prev).add(stationId));
      const firstPending = layerIds.find(
        (layerId) => !getSceneStackLayerRecord(departmentId, projectId, stationId, layerId)?.publicUrl
      );
      if (firstPending) {
        setPipelineLayer({ stationId, layerId: firstPending, phase: 'queued' });
      }

      try {
        for (const layerId of layerIds) {
          const lookupOptions =
            options?.validationMode && options.previewCompileContext?.previewSessionId
              ? {
                  validationMode: true,
                  previewSessionId: options.previewCompileContext.previewSessionId,
                }
              : undefined;
          const rec = getSceneStackLayerRecord(
            departmentId,
            projectId,
            stationId,
            layerId,
            lookupOptions
          );
          if (!rec?.publicUrl) {
            setPipelineLayer({ stationId, layerId, phase: 'queued' });
            await generateLayer(stationId, layerId, false, options);
          }
        }
        const blueprint = resolveMasterSceneBlueprint({
          departmentId,
          projectId,
          stationId,
          workspaceId,
        });
        const compiled = await compileWorldStation({
          departmentId,
          projectId,
          stationId,
          blueprint,
          options,
        });
        setCompileReports((prev) => ({ ...prev, [stationId]: compiled.report }));
      } finally {
        setEnsuringStations((prev) => {
          const next = new Set(prev);
          next.delete(stationId);
          return next;
        });
        setPipelineLayer((prev) => (prev?.stationId === stationId ? null : prev));
      }
    },
    [departmentId, generateLayer, projectId, ensuringStations, workspaceId]
  );

  const getStationBlueprint = useCallback(
    (stationId: string) =>
      resolveMasterSceneBlueprint({ departmentId, projectId, stationId, workspaceId }),
    [departmentId, projectId, workspaceId]
  );

  const getStationSceneGraph = useCallback(
    (stationId: string): SceneGraph => {
      const blueprint = getStationBlueprint(stationId);
      return buildSceneGraph({
        blueprint,
        departmentId,
        projectId,
        stationId,
        compositionMode: 'world-compiler',
      });
    },
    [departmentId, getStationBlueprint, projectId]
  );

  const getStationCompileReport = useCallback(
    (stationId: string): WorldCompilationReport | null => compileReports[stationId] ?? null,
    [compileReports]
  );

  const compileStation = useCallback(
    async (stationId: string, options?: WorldCompileOptions) => {
      const blueprint = getStationBlueprint(stationId);
      const result = await compileWorldStation({
        departmentId,
        projectId,
        stationId,
        blueprint,
        options,
      });
      setCompileReports((prev) => ({ ...prev, [stationId]: result.report }));
      return result;
    },
    [departmentId, getStationBlueprint, projectId]
  );

  const toggleDebugView = useCallback(() => {
    setDebugView((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const toggleDebugViewLayer = useCallback((layer: ArchitectDebugLayer) => {
    setDebugView((prev) => toggleDebugLayer(prev, layer));
  }, []);

  const planStationCleanRegeneration = useCallback(
    (stationId: string): CleanRegenerationPlan | null =>
      planCleanRegeneration(departmentId, projectId, stationId),
    [departmentId, projectId]
  );

  const cleanRegenerateStation = useCallback(
    async (stationId: string): Promise<boolean> => {
      const plan = planCleanRegeneration(departmentId, projectId, stationId);
      if (!plan) return false;

      executeCleanRegenerationDiscard(departmentId, projectId, plan);
      bump();

      for (const layerId of plan.regenerateOrder) {
        const ok = await generateLayer(stationId, layerId, true);
        if (!ok && layerId === 'environment-shell') return false;
      }
      return true;
    },
    [bump, departmentId, generateLayer, projectId]
  );

  const exportStationScene = useCallback(
    async (stationId: string, includeFlattenedPreview = true): Promise<SceneStackExportBundle> => {
      const blueprint = getStationBlueprint(stationId);
      const graph = buildSceneGraph({ blueprint, departmentId, projectId, stationId });
      return buildSceneStackExportBundle({
        blueprint,
        graph,
        includeFlattenedPreview,
      });
    },
    [departmentId, getStationBlueprint, projectId]
  );

  const readyStationCount = useMemo(
    () => stations.filter((s) => getCompositeStatus(s.stationId) === 'ready').length,
    [stations, getCompositeStatus]
  );

  const isAnyPipelineActive = useMemo(
    () => ensuringStations.size > 0 || generatingKeys.size > 0,
    [ensuringStations, generatingKeys]
  );

  return {
    stations,
    getLayerViews,
    getCompositeStatus,
    generateLayer,
    regenerateLayer,
    ensureStation,
    approveLayer: approveSceneStackLayer,
    readyStationCount,
    totalStationCount: stations.length,
    isStationPipelineActive,
    getStationPipelineProgress,
    isAnyPipelineActive,
    errors,
    bump,
    getStationBlueprint,
    getStationSceneGraph,
    getStationCompileReport,
    compileStation,
    debugView,
    toggleDebugView,
    toggleDebugViewLayer,
    planStationCleanRegeneration,
    cleanRegenerateStation,
    exportStationScene,
  };
}
