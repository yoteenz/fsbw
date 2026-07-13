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
import { getLastGenerationRequestHttpForensic } from '../studio-os/diagnostics/world-compiler-investigation/generation-request-forensic';
import {
  beginAsyncBoundary,
  endAsyncBoundary,
  logPipelineLifecycle,
  recordDuplicateCompileInvocation,
  type StallEvidenceContext,
} from '../studio-os/diagnostics/world-compiler-investigation/stall-evidence';
import {
  VALIDATION_RENDER_AUTHORIZATION,
  withValidationEphemeralAuth,
  getActiveEphemeralCompileAuthorization,
} from '../studio-os-core/scene-stack/validation-render';
import { resolveValidationCompileMode } from '../studio-os-core/creative-production/validation-compile-context';
import { attachCreativeStudioStackAuth } from '../studio-os-core/creative-production/creative-studio-stack-auth-session';
import {
  MAX_ISOLATION_REGENERATION_ATTEMPTS,
  isIsolatedObjectLayer,
} from '../studio-os-core/scene-stack/isolated-layer-contract';
import { recordLayerQualityRecovery } from '../studio-os-core/scene-stack/layer-quality-recovery';
import {
  assertIsolatedPromptBeforeDispatch,
  buildEffectiveGenerationRequestRecord,
  recordEffectiveGenerationRequest,
} from '../studio-os-core/scene-stack/effective-generation-request';
import {
  runVerifiedAssetProductionPipeline,
  uiLabelForProductionStage,
  validateSceneMount,
  emitVerifiedAssetImmuneEvent,
  type VerifiedAssetProductionStage,
  type AssetCandidateRecord,
} from '../studio-os-core/scene-stack/verified-asset-production';
import { requestSceneStackAssetCleanup } from '../services/studio/sceneStackAssetCleanup/api';
import { resolveArtifactIntent } from '../studio-os-core/creative-production/artifact-intent';
import { recordGenerationParityForensic } from '../studio-os-core/generation-runtime/generation-parity-forensic';
import {
  resolveBrandMaterialPackage,
  isBrandAssetResolutionError,
  CIRCULAR_CONCIERGE_DESK_SPEC,
} from '../studio-os-core/creative-production/brand-asset-grounding';

export type SceneStackPipelineProgress = {
  stationId: string;
  layersComplete: number;
  layersTotal: number;
  currentLayerId: SceneStackLayerId | null;
  currentLayerLabel: string | null;
  phase: 'idle' | 'queued' | 'generating';
  productionStage?: VerifiedAssetProductionStage | null;
  productionStageLabel?: string | null;
  regeneration?: {
    layerId: SceneStackLayerId;
    attempt: number;
    status: 'submitting' | 'validating' | 'idle';
    jobId?: string | null;
    providerRequestId?: string | null;
  } | null;
};

function buildEvidenceCtx(
  _departmentId: string,
  projectId: string,
  stationId: string,
  options?: WorldCompileOptions,
  compileOwner?: string
): StallEvidenceContext {
  const previewContext = options?.previewCompileContext;
  return {
    previewSessionId: previewContext?.previewSessionId ?? null,
    compileRunId: previewContext?.compileRunId ?? options?.investigation?.compileRunId ?? null,
    stationId,
    projectId,
    conceptId: previewContext?.conceptId ?? null,
    companyId: previewContext?.companyId ?? null,
    compileOwner: compileOwner ?? null,
    currentCompilerStage: null,
  };
}

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
    productionStage?: VerifiedAssetProductionStage | null;
    productionStageLabel?: string | null;
    regeneration?: SceneStackPipelineProgress['regeneration'];
  } | null>(null);
  const [productionEvidence, setProductionEvidence] = useState<AssetCandidateRecord | null>(null);
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
      const layersComplete = views.filter(
        (l) => l.definition.generatable && l.publicUrl && l.status === 'approved'
      ).length;
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
        productionStage: pipelineLayer?.stationId === stationId ? pipelineLayer.productionStage ?? null : null,
        productionStageLabel:
          pipelineLayer?.stationId === stationId
            ? pipelineLayer.productionStageLabel ??
              (pipelineLayer.productionStage && currentLayerId
                ? uiLabelForProductionStage(
                    pipelineLayer.productionStage,
                    SCENE_STACK_LAYER_SHORT_LABELS[currentLayerId]
                  )
                : null)
            : null,
        regeneration: pipelineLayer?.stationId === stationId ? pipelineLayer.regeneration ?? null : null,
      };
    },
    [departmentId, ensuringStations, generatingKeys, getLayerViews, pipelineLayer, projectId]
  );

  const generateLayer = useCallback(
    async (
      stationId: string,
      layerId: SceneStackLayerId,
      force = false,
      layerCompileOptions?: Pick<WorldCompileOptions, 'previewCompileContext' | 'validationMode' | 'creativeStudioStackMode'>
    ): Promise<boolean> => {
      const key = genKey(stationId, layerId);
      if (generatingKeys.has(key)) return false;

      const previewSessionId = layerCompileOptions?.previewCompileContext?.previewSessionId;
      const previewCtx = layerCompileOptions?.previewCompileContext;
      const validationMode = resolveValidationCompileMode(layerCompileOptions?.validationMode, {
        compileRunId: previewCtx?.compileRunId ?? null,
        previewSessionId: previewCtx?.previewSessionId ?? null,
        organizationId:
          previewCtx?.companyId ??
          getActiveEphemeralCompileAuthorization(previewCtx?.compileRunId ?? null)?.organizationId ??
          null,
        departmentId,
        stationId,
        projectId,
      });
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
              station.layerPrompts,
              validationMode && previewSessionId
                ? { validationMode: true, previewSessionId }
                : validationMode
                  ? { validationMode: true }
                  : undefined
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
        const maxIsolationAttempts = isIsolatedObjectLayer(layerId)
          ? MAX_ISOLATION_REGENERATION_ATTEMPTS
          : 1;

        let result: Awaited<ReturnType<typeof requestStudioBuilderGenerate>> | null = null;
        let compiled: ReturnType<typeof compileSceneStackLayerPrompt> | null = null;
        let approvedProduction: Extract<
          Awaited<ReturnType<typeof runVerifiedAssetProductionPipeline>>,
          { ok: true }
        > | null = null;
        let requestInputForensic: Record<string, unknown> = {};
        let qualityPassed = false;

        for (let isolationAttempt = 0; isolationAttempt < maxIsolationAttempts; isolationAttempt++) {
          const organizationIdForCompile =
            layerCompileOptions?.previewCompileContext?.companyId ??
            getActiveEphemeralCompileAuthorization(
              layerCompileOptions?.previewCompileContext?.compileRunId ?? null
            )?.organizationId ??
            'frontal-slayer';

          if (isIsolatedObjectLayer(layerId)) {
            const brandCheck = resolveBrandMaterialPackage({
              organizationId: organizationIdForCompile,
              materialRequests: CIRCULAR_CONCIERGE_DESK_SPEC.materialRequests,
            });
            if (isBrandAssetResolutionError(brandCheck)) {
              const msg = `${brandCheck.code}: ${brandCheck.message}`;
              failStudioAlphaGeneration(generationId, msg);
              setErrors((prev) => ({ ...prev, [key]: msg }));
              return false;
            }
          }

          compiled = compileSceneStackLayerPrompt({
            departmentId,
            stationId,
            layerId,
            workspaceId,
            projectId,
            referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
            isolationAttempt,
            organizationId: organizationIdForCompile,
          });

          if (isolationAttempt > 0 && isIsolatedObjectLayer(layerId)) {
            setPipelineLayer({
              stationId,
              layerId,
              phase: 'generating',
              regeneration: {
                layerId,
                attempt: isolationAttempt + 1,
                status: 'submitting',
              },
            });
            recordLayerQualityRecovery('IsolationPromptStrengthened', {
              layerId,
              stationId,
              departmentId,
              projectId,
              isolationAttempt,
              shellPreserved: Boolean(shellLock.shellUrl),
            });
            recordLayerQualityRecovery('LayerRegenerationStarted', {
              layerId,
              stationId,
              departmentId,
              projectId,
              isolationAttempt,
              shellPreserved: Boolean(shellLock.shellUrl),
            });
          }

          const generationPayload = attachCreativeStudioStackAuth(
            withValidationEphemeralAuth(
              {
                departmentId,
                packageId: pkg.packageId,
                projectId,
                productionGroupId: `scene-stack-${stationId}-${layerId}`,
                heroAssetId: compiled.heroAssetId,
                prompt: compiled.prompt,
                negativePrompt: compiled.negativePrompt,
                aspectRatio: compiled.aspectRatio,
                outputFormat: compiled.outputFormat,
                forceGenerate: force || !existing?.publicUrl,
                referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
                layerId,
                generationMode: compiled.generationMode,
                textToImageOnly: compiled.textToImageOnly,
                providerModel: compiled.providerModel,
                isolationAttempt,
                promptBuilderId: compiled.promptBuilderId,
                promptContractVersion: compiled.promptVersion,
                stationId,
                brandReferenceUrls: compiled.brandReferenceUrls,
                organizationId: organizationIdForCompile,
              },
              {
                validationMode,
                compileRunId: layerCompileOptions?.previewCompileContext?.compileRunId ?? null,
                previewSessionId: previewSessionId ?? null,
                organizationId:
                  layerCompileOptions?.previewCompileContext?.companyId ??
                  getActiveEphemeralCompileAuthorization(
                    layerCompileOptions?.previewCompileContext?.compileRunId ?? null
                  )?.organizationId ??
                  'frontal-slayer',
                departmentId,
                stationId,
                projectId,
              }
            ),
            {
              creativeStudioStackMode: layerCompileOptions?.creativeStudioStackMode === true,
              organizationId:
                layerCompileOptions?.previewCompileContext?.companyId ??
                getActiveEphemeralCompileAuthorization(
                  layerCompileOptions?.previewCompileContext?.compileRunId ?? null
                )?.organizationId ??
                'frontal-slayer',
              departmentId,
              stationId,
              projectId,
            }
          );

          requestInputForensic = {
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
            promptBuilderId: compiled.promptBuilderId,
            generationMode: compiled.generationMode,
            providerModel: compiled.providerModel,
            textToImageOnly: compiled.textToImageOnly,
            referenceStrategy: compiled.referenceStrategy,
            routeId: compiled.routeId,
            brandReferenceUrls: compiled.brandReferenceUrls,
            aspectRatio: compiled.aspectRatio,
            outputFormat: compiled.outputFormat,
            referenceImageUrls,
            isolationAttempt,
            referenceUrlScheme: referenceImageUrls.map((u) =>
              u.startsWith('data:') ? 'data-url' : u.startsWith('http') ? 'http' : 'other'
            ),
            validationMode: isExperienceLabValidationRender() && validationMode,
            authorizationMode: VALIDATION_RENDER_AUTHORIZATION,
            productionAuthorizationId:
              getActiveEphemeralCompileAuthorization(
                layerCompileOptions?.previewCompileContext?.compileRunId ?? null
              )?.productionAuthorizationId ?? null,
            generationProvider: 'POST /api/admin/studio-builder-generate',
            modelAdapter: `${compiled.providerModel ?? 'fal'} via executeGovernedGeneration → generateStudioBuilderAsset`,
            forceGenerate: generationPayload.forceGenerate,
          };

          if (isIsolatedObjectLayer(layerId)) {
            const promptAssert = assertIsolatedPromptBeforeDispatch({
              layerId,
              prompt: compiled.prompt,
              generationMode: compiled.generationMode ?? 'isolated-single-object',
              referenceImageUrls,
              brandReferenceUrls: compiled.brandReferenceUrls,
              textToImageOnly: compiled.textToImageOnly === true,
              organizationId: organizationIdForCompile,
            });
            if (!promptAssert.ok) {
              const msg = `Isolated prompt contract violation: ${promptAssert.violations.join(' ')}`;
              failStudioAlphaGeneration(generationId, msg);
              setErrors((prev) => ({ ...prev, [key]: msg }));
              return false;
            }
          }

          recordEffectiveGenerationRequest(
            buildEffectiveGenerationRequestRecord({
              layerId,
              prompt: compiled.prompt,
              negativePrompt: compiled.negativePrompt,
              outputFormat: compiled.outputFormat,
              aspectRatio: compiled.aspectRatio,
              referenceImageUrls,
              compileRunId: layerCompileOptions?.previewCompileContext?.compileRunId ?? null,
              organizationId: organizationIdForCompile,
              stationId,
              projectId,
              isolationAttempt,
              placementMetadataIncluded: true,
              routeId: compiled.routeId ?? null,
              brandReferenceUrls: compiled.brandReferenceUrls,
              brandReferenceChecksums: compiled.brandMaterialPackage?.referenceChecksums,
              materialMappings: compiled.brandMaterialPackage?.materialMappings,
              resolutionTruth: compiled.resolutionTruth,
            })
          );

          if (isLayer1 && isWorldCompilerDiagnosticMode() && isolationAttempt === 0) {
            recordLayer1Transition('LANDMARK_REQUEST_CREATED', { requestInputForensic });
            recordLayer1Transition('GENERATION_REQUEST_STARTED', {
              endpoint: '/api/admin/studio-builder-generate',
            });
          }

          result = await requestStudioBuilderGenerate(generationPayload, {
            onProgress: (label) => {
              setPipelineLayer((prev) => ({
                stationId,
                layerId,
                phase: 'generating',
                regeneration:
                  prev?.stationId === stationId && prev.layerId === layerId
                    ? prev.regeneration
                    : isolationAttempt > 0 && isIsolatedObjectLayer(layerId)
                      ? { layerId, attempt: isolationAttempt + 1, status: 'submitting' as const }
                      : null,
              }));
              void label;
            },
          });

          if (result.jobId && isIsolatedObjectLayer(layerId) && isolationAttempt > 0) {
            setPipelineLayer({
              stationId,
              layerId,
              phase: 'generating',
              regeneration: {
                layerId,
                attempt: isolationAttempt + 1,
                status: 'submitting',
                jobId: result.jobId,
              },
            });
          }

          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            if (result.ok && result.publicUrl) {
              recordLayer1Transition('GENERATION_REQUEST_COMPLETED', {
                publicUrl: result.publicUrl,
                model: result.model,
                code: result.code,
              });
            } else {
              const httpForensic = getLastGenerationRequestHttpForensic();
              recordLayer1Transition('GENERATION_REQUEST_FAILED', {
                error: result.error,
                code: result.code,
                httpForensic,
              });
            }
          }

          if (!result.ok || !result.publicUrl) {
            const errMsg = result.error ?? 'Layer generation failed';
            failStudioAlphaGeneration(generationId, errMsg);
            setErrors((prev) => ({ ...prev, [key]: errMsg }));
            if (isLayer1 && isWorldCompilerDiagnosticMode()) {
              const httpForensic = getLastGenerationRequestHttpForensic();
              freezeLayer1Failure({
                failedTransition: 'GENERATION_REQUEST_FAILED',
                errorCode: result.code ?? 'GENERATION_FAILED',
                errorMessage: errMsg,
                failedFunction: 'requestStudioBuilderGenerate',
                failedFile: 'src/services/studio/studioBuilder/api.ts',
                adapter:
                  'studio-builder-generate → executeGovernedGeneration (Model Registry — NB2 isolated / NBP edit shell)',
                shellRemainedValid: Boolean(shellLock.shellUrl),
                requestInput: requestInputForensic,
                responseOutput: {
                  ok: result.ok,
                  code: result.code,
                  error: result.error,
                  publicUrl: result.publicUrl ?? null,
                  model: result.model ?? null,
                  httpForensic,
                },
              });
            }
            return false;
          }

          if (isLayer1 && isWorldCompilerDiagnosticMode()) {
            recordLayer1Transition('LANDMARK_VALIDATION_STARTED', { publicUrl: result.publicUrl });
          }

          if (isIsolatedObjectLayer(layerId) && isolationAttempt > 0) {
            setPipelineLayer({
              stationId,
              layerId,
              phase: 'generating',
              regeneration: {
                layerId,
                attempt: isolationAttempt + 1,
                status: 'validating',
                jobId: result.jobId ?? null,
              },
            });
          }

          const layerLabel = SCENE_STACK_LAYER_SHORT_LABELS[layerId] ?? layerId;
          const organizationId =
            layerCompileOptions?.previewCompileContext?.companyId ??
            getActiveEphemeralCompileAuthorization(
              layerCompileOptions?.previewCompileContext?.compileRunId ?? null
            )?.organizationId ??
            'frontal-slayer';

          const artifactIntentSurface = layerCompileOptions?.creativeStudioStackMode
            ? 'creative-direction-studio'
            : layerCompileOptions?.validationMode
              ? 'experience-lab'
              : 'experience-lab';

          const production = await runVerifiedAssetProductionPipeline({
            layerId,
            candidateUrl: result.publicUrl,
            requestedAssetDescription: compiled.prompt.slice(0, 240),
            shellReferenceUrl: shellLock.shellUrl,
            departmentId,
            stationId,
            projectId,
            organizationId,
            promptVersion: compiled.promptVersion,
            providerModel: result.model,
            generationMode: compiled.generationMode,
            jobId: result.jobId ?? null,
            compileRunId: layerCompileOptions?.previewCompileContext?.compileRunId ?? null,
            regenerationAttempt: isolationAttempt,
            brandMaterialPackage: compiled.brandMaterialPackage ?? null,
            routeId: compiled.routeId ?? null,
            brandReferenceUrls: compiled.brandReferenceUrls,
            artifactIntentSurface,
            creativeStudioStackMode: layerCompileOptions?.creativeStudioStackMode === true,
            resolutionTruth: compiled.resolutionTruth
              ? {
                  requestedResolution: compiled.resolutionTruth.requestedResolution,
                  providerNativeResolution: compiled.resolutionTruth.providerNativeResolution,
                  outputResolution: compiled.resolutionTruth.providerNativeResolution,
                  upscaleApplied: false,
                  truthState: compiled.resolutionTruth.supportsNative4K
                    ? 'native-4k'
                    : 'provider-nearest-supported',
                }
              : null,
            onStageChange: (stage, label) => {
              setPipelineLayer((prev) => ({
                stationId,
                layerId,
                phase: 'generating',
                productionStage: stage,
                productionStageLabel: label,
                regeneration:
                  prev?.stationId === stationId && prev.layerId === layerId
                    ? prev.regeneration
                    : isolationAttempt > 0 && isIsolatedObjectLayer(layerId)
                      ? {
                          layerId,
                          attempt: isolationAttempt + 1,
                          status: 'validating' as const,
                          jobId: result?.jobId ?? null,
                        }
                      : null,
              }));
            },
            requestBackgroundCleanup:
              isIsolatedObjectLayer(layerId) || layerId === 'furniture-objects'
                ? async (sourceUrl, assetCandidateId) => {
                    const cleanup = await requestSceneStackAssetCleanup({
                      sourceUrl,
                      assetCandidateId,
                      layerId,
                      stationId,
                      projectId,
                    });
                    if (!cleanup.ok) return { ok: false as const, error: cleanup.error };
                    return { ok: true as const, cleanedUrl: cleanup.cleanedUrl, method: cleanup.method };
                  }
                : undefined,
          });

          setProductionEvidence(production.candidate);

          recordGenerationParityForensic({
            surface: artifactIntentSurface,
            endpoint: '/api/admin/studio-builder-generate',
            organizationId,
            projectId,
            compileRunId: layerCompileOptions?.previewCompileContext?.compileRunId ?? null,
            jobId: result.jobId ?? null,
            artifactIntent: resolveArtifactIntent({
              layerId,
              surface: artifactIntentSurface,
              creativeStudioStackMode: layerCompileOptions?.creativeStudioStackMode === true,
            }),
            modelRoute: result.model ?? compiled.providerModel ?? null,
            promptVersion: compiled.promptVersion,
            referenceCount: compiled.brandReferenceUrls?.length ?? 0,
            generationMode: compiled.generationMode ?? null,
            providerOutputUrls: result.publicUrl ? [result.publicUrl] : [],
            validationPath: 'runVerifiedAssetProductionPipeline',
            validationResult: production.ok ? 'approved' : production.failureState ?? 'denied',
            postprocessing:
              production.ok && production.cleanupUsed ? 'background-removal' : 'none',
            sceneStackState: production.stage,
            finalStatus: production.ok ? 'complete' : 'failed',
          });

          if (!production.ok) {
            const isFullSceneRerender =
              production.failureState === 'REJECTED_FULL_SCENE' ||
              production.candidate.backgroundClassification === 'FULL_SCENE_RERENDER';

            if (isIsolatedObjectLayer(layerId)) {
              recordLayerQualityRecovery('LayerQualityFailureDetected', {
                layerId,
                stationId,
                departmentId,
                projectId,
                classification: production.candidate.qualityClassification as never,
                isolationAttempt,
                publicUrl: result.publicUrl,
                shellPreserved: Boolean(shellLock.shellUrl),
                message: production.deniedReasons.join(' '),
              });
              if (isFullSceneRerender) {
                recordLayerQualityRecovery('FullSceneRerenderDiagnosed', {
                  layerId,
                  stationId,
                  departmentId,
                  projectId,
                  classification: production.candidate.qualityClassification as never,
                  isolationAttempt,
                  publicUrl: result.publicUrl,
                  shellPreserved: Boolean(shellLock.shellUrl),
                });
                emitVerifiedAssetImmuneEvent('FullSceneDetected', {
                  layerId,
                  stationId,
                  departmentId,
                  projectId,
                  assetCandidateId: production.candidate.assetCandidateId,
                  classification: production.candidate.backgroundClassification,
                  shellPreserved: Boolean(shellLock.shellUrl),
                });
              }
              recordLayerQualityRecovery('ShellPreservationConfirmed', {
                layerId,
                stationId,
                departmentId,
                projectId,
                shellPreserved: Boolean(shellLock.shellUrl),
              });
            }

            const canRetry =
              production.requiredNextAction === 'regenerate' &&
              isIsolatedObjectLayer(layerId) &&
              isolationAttempt < maxIsolationAttempts - 1;
            if (canRetry) {
              emitVerifiedAssetImmuneEvent('RegenerationStarted', {
                layerId,
                stationId,
                departmentId,
                projectId,
                assetCandidateId: production.candidate.assetCandidateId,
                shellPreserved: Boolean(shellLock.shellUrl),
              });
              continue;
            }

            const msg = `Verified asset production denied for ${layerLabel}: ${production.deniedReasons.join(' ')}`;
            const recoveryHint =
              isIsolatedObjectLayer(layerId) && result.jobId
                ? ` Regenerating ${layerLabel.toLowerCase()} only — shell preserved (job ${result.jobId}).`
                : isIsolatedObjectLayer(layerId)
                  ? ` Recovery: Regenerating ${layerLabel.toLowerCase()} only — shell preserved.`
                  : '';

            if (isIsolatedObjectLayer(layerId)) {
              recordLayerQualityRecovery('LayerRegenerationEscalated', {
                layerId,
                stationId,
                departmentId,
                projectId,
                classification: production.candidate.qualityClassification as never,
                isolationAttempt,
                publicUrl: result.publicUrl,
                shellPreserved: Boolean(shellLock.shellUrl),
                message: msg,
              });
            }

            failStudioAlphaGeneration(generationId, msg + recoveryHint);
            setErrors((prev) => ({ ...prev, [key]: msg + recoveryHint }));
            if (isLayer1 && isWorldCompilerDiagnosticMode()) {
              freezeLayer1Failure({
                failedTransition: 'LANDMARK_VALIDATION_FAILED',
                errorCode: 'QUALITY_REGENERATE_REQUIRED',
                errorMessage: msg + recoveryHint,
                failedFunction: 'runVerifiedAssetProductionPipeline',
                failedFile: 'src/studio-os-core/scene-stack/verified-asset-production/pipeline.ts',
                adapter: 'verified-asset-production-pipeline',
                shellRemainedValid: Boolean(shellLock.shellUrl),
                requestInput: requestInputForensic,
                responseOutput: { publicUrl: result.publicUrl, production },
              });
            }
            saveSceneStackLayerRecord({
              departmentId,
              projectId,
              stationId,
              layerId,
              version: nextVersion,
              status: 'failed',
              candidateUrl: result.publicUrl,
              assetCandidateId: production.candidate.assetCandidateId,
              quarantineId: production.quarantineId,
              publicUrl: undefined,
              storagePath: result.storagePath,
              model: result.model,
              generatedAt: new Date().toISOString(),
              promptVersion: compiled.promptVersion,
              productionGroupId: compiled.productionGroupId,
              heroAssetId: compiled.heroAssetId,
              blueprintId: compiled.blueprintId,
              assemblyLawVersion: SCENE_ASSEMBLY_LAW_VERSION,
              qualityStatus: 'regenerate_required',
              qualityIssues: production.deniedReasons,
              registryState: 'quarantined',
              productionStage: production.stage,
            });
            bump();
            return false;
          }

          const mountCheck = validateSceneMount({
            layerId,
            approvedUrl: production.approvedUrl,
            approvalProof: production.approvalProof,
            blueprint,
            shellUrl: shellLock.shellUrl,
            frameCoverage: production.candidate.frameCoverage,
          });

          if (!mountCheck.valid && mountCheck.placementFailure) {
            emitVerifiedAssetImmuneEvent('PlacementFailureDetected', {
              layerId,
              stationId,
              departmentId,
              projectId,
              assetCandidateId: production.candidate.assetCandidateId,
              message: mountCheck.issues.join(' '),
            });
          } else {
            emitVerifiedAssetImmuneEvent('ScenePlacementVerified', {
              layerId,
              stationId,
              departmentId,
              projectId,
              assetCandidateId: production.candidate.assetCandidateId,
            });
          }

          if (isIsolatedObjectLayer(layerId)) {
            recordLayerQualityRecovery('LayerRevalidated', {
              layerId,
              stationId,
              departmentId,
              projectId,
              classification: production.candidate.qualityClassification as never,
              isolationAttempt,
              publicUrl: production.approvedUrl,
              shellPreserved: Boolean(shellLock.shellUrl),
            });
          }

          approvedProduction = production;
          qualityPassed = true;
          break;
        }

        if (!qualityPassed || !result || !compiled || !approvedProduction) {
          return false;
        }

        completeStudioAlphaGeneration({
          generationId,
          model: result.model,
          assetId,
        });

        const approvedAt = new Date().toISOString();
        saveSceneStackLayerRecord({
          departmentId,
          projectId,
          stationId,
          layerId,
          version: nextVersion,
          status: 'approved',
          publicUrl: approvedProduction.approvedUrl,
          candidateUrl: result.publicUrl,
          assetCandidateId: approvedProduction.candidate.assetCandidateId,
          approvalProof: approvedProduction.approvalProof,
          productionStage: 'REGISTERED',
          registryState: 'approved',
          storagePath: result.storagePath,
          model: result.model,
          generatedAt: approvedAt,
          approvedAt,
          promptVersion: compiled.promptVersion,
          productionGroupId: compiled.productionGroupId,
          heroAssetId: compiled.heroAssetId,
          blueprintId: compiled.blueprintId,
          assemblyLawVersion: SCENE_ASSEMBLY_LAW_VERSION,
          qualityStatus: 'validated',
          qualityIssues: [],
          canonicalStatus: 'non_canonical',
        });

        // Phase 1: no auto-register to Asset Registry — promotion requires Production Authorization.

        if (isIsolatedObjectLayer(layerId)) {
          recordLayerQualityRecovery('LayerMounted', {
            layerId,
            stationId,
            departmentId,
            projectId,
            classification: approvedProduction.candidate.qualityClassification as never,
            publicUrl: approvedProduction.approvedUrl,
            shellPreserved: Boolean(shellLock.shellUrl),
          });
          emitVerifiedAssetImmuneEvent('AssetMounted', {
            layerId,
            stationId,
            departmentId,
            projectId,
            assetCandidateId: approvedProduction.candidate.assetCandidateId,
            shellPreserved: Boolean(shellLock.shellUrl),
          });
        }

        bump();
        if (isLayer1 && isWorldCompilerDiagnosticMode()) {
          recordLayer1Transition('LAYER_1_COMPLETED', { publicUrl: approvedProduction.approvedUrl });
        }
        recordDuplicateCompileInvocation('generateLayer.fireAndForget', buildEvidenceCtx(departmentId, projectId, stationId, {
          validationMode,
          ...(layerCompileOptions?.previewCompileContext
            ? { previewCompileContext: layerCompileOptions.previewCompileContext }
            : {}),
        }), { layerId });
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
          if (isIsolatedObjectLayer(layerId)) {
            recordLayerQualityRecovery('CompileResumed', {
              layerId,
              stationId,
              departmentId,
              projectId,
              shellPreserved: Boolean(shellLock.shellUrl),
            });
          }
          logPipelineLifecycle(
            'COMPILE_REPORT_PUBLISHED',
            'useSceneStack.generateLayer',
            buildEvidenceCtx(departmentId, projectId, stationId, {
              validationMode,
              ...(layerCompileOptions?.previewCompileContext
                ? { previewCompileContext: layerCompileOptions.previewCompileContext }
                : {}),
            }),
            { compileOwner: 'generateLayer.fireAndForget', success: result.report.success }
          );
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
      compileOptions?: Pick<WorldCompileOptions, 'previewCompileContext' | 'validationMode' | 'creativeStudioStackMode'>
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

      const evidenceCtx = buildEvidenceCtx(departmentId, projectId, stationId, options, 'ensureStation');
      const boundaryId = beginAsyncBoundary('ensureStation', evidenceCtx, { layerCount: layerIds.length });
      logPipelineLifecycle('ENSURE_STATION_ENTERED', 'useSceneStack.ensureStation', evidenceCtx, {
        layerIds,
        skipEnvironmentShell: options?.skipEnvironmentShell ?? false,
      });

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
        logPipelineLifecycle('COMPILE_REPORT_PUBLISHED', 'useSceneStack.ensureStation', evidenceCtx, {
          compileOwner: 'ensureStation.innerCompile',
          success: compiled.report.success,
        });
        logPipelineLifecycle('ENSURE_STATION_COMPLETED', 'useSceneStack.ensureStation', evidenceCtx, {
          success: compiled.report.success,
        });
        endAsyncBoundary(boundaryId, 'resolved', { resolvedCategory: 'ensureStationComplete' });
      } catch (err) {
        logPipelineLifecycle('ENSURE_STATION_FAILED', 'useSceneStack.ensureStation', evidenceCtx, {
          error: err instanceof Error ? err.message : String(err),
        });
        endAsyncBoundary(boundaryId, 'rejected', {
          rejectionMessage: err instanceof Error ? err.message : String(err),
        });
        throw err;
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
      const evidenceCtx = buildEvidenceCtx(departmentId, projectId, stationId, options, 'compileStation');
      const boundaryId = beginAsyncBoundary('compileStation', evidenceCtx);
      logPipelineLifecycle('COMPILE_STATION_ENTERED', 'useSceneStack.compileStation', evidenceCtx);
      try {
        const blueprint = getStationBlueprint(stationId);
        const result = await compileWorldStation({
          departmentId,
          projectId,
          stationId,
          blueprint,
          options,
        });
        setCompileReports((prev) => ({ ...prev, [stationId]: result.report }));
        logPipelineLifecycle('COMPILE_REPORT_PUBLISHED', 'useSceneStack.compileStation', evidenceCtx, {
          compileOwner: 'compileStation',
          success: result.report.success,
          failedStage: result.report.failedStage ?? null,
        });
        logPipelineLifecycle('COMPILE_STATION_COMPLETED', 'useSceneStack.compileStation', evidenceCtx, {
          success: result.report.success,
        });
        endAsyncBoundary(boundaryId, 'resolved', {
          resolvedCategory: result.report.success ? 'compileSuccess' : 'compileFailedStage',
        });
        return result;
      } catch (err) {
        logPipelineLifecycle('COMPILE_STATION_REJECTED', 'useSceneStack.compileStation', evidenceCtx, {
          error: err instanceof Error ? err.message : String(err),
        });
        endAsyncBoundary(boundaryId, 'rejected', {
          rejectionMessage: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }
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
    productionEvidence,
  };
}
