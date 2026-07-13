import { useCallback, useMemo, useState } from 'react';
import type { FounderCompileRequest } from '../studio-os-core/blueprint-author/contract';
import { buildAssetInspector } from '../studio-os-core/construction-mode/asset-inspector';
import type { ConstructionModeCompileResult } from '../studio-os-core/construction-mode/compile-orchestrator';
import { runConstructionModeCompile } from '../studio-os-core/construction-mode/compile-orchestrator';
import {
  buildConstructionPlanSummary,
  openBlueprintAuthorSession,
  type BlueprintAuthorSessionBundle,
} from '../studio-os-core/blueprint-author/workflow-session';
import {
  mapWorkflowContextToCompileRequest,
  type BlueprintWorkflowContext,
} from '../studio-os-core/blueprint-author/workflow-mapper';
import {
  buildConstructionTimeline,
  buildFounderReviewDiff,
  buildRoomAssemblyState,
  type FounderRenderVariantId,
} from '../studio-os-core/founder-review';
import {
  buildFounderRenderJobView,
  canApproveFounderRender,
  type FounderRenderJobStatus,
  type FounderRenderDiagnostics,
} from '../studio-os-core/founder-render';
import {
  pollFounderRenderStatus,
  requestFounderRenderGenerate,
  requestFounderRenderApprove,
} from '../services/studio/founderRender/api';

export type BlueprintWorkflowStep = 'idle' | 'founder-review' | 'manufacturing' | 'complete';

type FounderRenderState = {
  jobId: string | null;
  status: FounderRenderJobStatus;
  previewArtifactUrl: string | null;
  failureReason: string | null;
  blueprintRevision: number;
  modelRoute: string | null;
  providerModel: string | null;
  diagnostics: FounderRenderDiagnostics | null;
  approvalStatus: 'pending' | 'approved';
  revisionNote: string | null;
};

const INITIAL_RENDER_STATE: FounderRenderState = {
  jobId: null,
  status: 'no_preview',
  previewArtifactUrl: null,
  failureReason: null,
  blueprintRevision: 0,
  modelRoute: null,
  providerModel: null,
  diagnostics: null,
  approvalStatus: 'pending',
  revisionNote: null,
};

export function useBlueprintAuthorWorkflow() {
  const [step, setStep] = useState<BlueprintWorkflowStep>('idle');
  const [variantId, setVariantId] = useState<FounderRenderVariantId>('current');
  const [blueprintDrawerOpen, setBlueprintDrawerOpen] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [bundle, setBundle] = useState<BlueprintAuthorSessionBundle | null>(null);
  const [manufacturingResult, setManufacturingResult] = useState<ConstructionModeCompileResult | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [request, setRequest] = useState<FounderCompileRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthoring, setIsAuthoring] = useState(false);
  const [isManufacturing, setIsManufacturing] = useState(false);
  const [variantChanged, setVariantChanged] = useState(false);
  const [founderRenderState, setFounderRenderState] = useState<FounderRenderState>(INITIAL_RENDER_STATE);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewImageLoaded, setPreviewImageLoaded] = useState(false);
  const [revisionInput, setRevisionInput] = useState('');

  const summary = useMemo(() => (bundle ? buildConstructionPlanSummary(bundle) : null), [bundle]);

  const liveView = manufacturingResult?.session.liveConstruction ?? bundle?.session.liveConstruction ?? null;

  const assemblyPhase = useMemo<'review' | 'manufacturing' | 'complete'>(() => {
    if (manufacturingResult?.success) return 'complete';
    if (step === 'manufacturing') return 'manufacturing';
    return 'review';
  }, [manufacturingResult?.success, step]);

  const roomAssembly = useMemo(() => {
    if (!bundle) return null;
    return buildRoomAssemblyState({
      preview: bundle.session.worldPreview,
      phase: assemblyPhase,
      liveView,
    });
  }, [bundle, assemblyPhase, liveView]);

  const founderRenderJob = useMemo(() => {
    if (!bundle || !summary) return null;
    return buildFounderRenderJobView({
      plan: bundle.plan,
      job: {
        jobId: founderRenderState.jobId ?? undefined,
        status: founderRenderState.status,
        previewArtifactUrl: founderRenderState.previewArtifactUrl,
        failureReason: founderRenderState.failureReason,
        modelRoute: founderRenderState.modelRoute,
        providerModel: founderRenderState.providerModel,
        blueprintRevision: founderRenderState.blueprintRevision || bundle.plan.metadata.revision,
        approvalStatus: founderRenderState.approvalStatus,
        diagnostics: founderRenderState.diagnostics,
        revisionNote: founderRenderState.revisionNote,
      },
      estimatedCost: summary.estimatedCost,
      estimatedBuildTimeMs: summary.estimatedBuildTimeMs,
    });
  }, [bundle, summary, founderRenderState]);

  const founderDiff = useMemo(() => {
    if (!bundle) return null;
    return buildFounderReviewDiff({
      plan: bundle.plan,
      variantChanged,
      changedRegionIds: variantChanged ? ['lighting', 'materials'] : undefined,
    });
  }, [bundle, variantChanged]);

  const constructionTimeline = useMemo(() => {
    if (!bundle) return null;
    const phase =
      step === 'manufacturing' ? 'manufacturing' : manufacturingResult?.success ? 'complete' : 'pre-approval';
    return buildConstructionTimeline({
      planId: bundle.plan.planId,
      queue: bundle.queue,
      phase,
      liveView,
    });
  }, [bundle, step, manufacturingResult?.success, liveView]);

  const selectedInspector = useMemo(() => {
    if (!bundle || !selectedAssetId) return null;
    const dnaRec = bundle.assetDna.find((d) => d.assetId === selectedAssetId) ?? null;
    const intent = bundle.renderIntents.find((i) => i.assetId === selectedAssetId) ?? null;
    const job = bundle.queue.jobs.find((j) => j.assetId === selectedAssetId) ?? null;
    return buildAssetInspector({
      plan: bundle.plan,
      assetId: selectedAssetId,
      dna: dnaRec,
      intent,
      job,
    });
  }, [bundle, selectedAssetId]);

  const applyStatusResponse = useCallback(
    (data: Awaited<ReturnType<typeof pollFounderRenderStatus>>) => {
      if (!data.ok) {
        setError(data.error ?? 'Founder render failed');
        setFounderRenderState((prev) => ({
          ...prev,
          status: 'failed',
          failureReason: data.error ?? 'Founder render failed',
        }));
        return;
      }
      setFounderRenderState((prev) => ({
        ...prev,
        jobId: data.jobId ?? prev.jobId,
        status: data.status ?? prev.status,
        previewArtifactUrl: data.previewArtifactUrl ?? null,
        failureReason: data.failureReason ?? null,
        blueprintRevision: data.blueprintRevision ?? prev.blueprintRevision,
        modelRoute: data.modelRoute ?? prev.modelRoute,
        providerModel: data.providerModel ?? prev.providerModel,
        diagnostics: data.diagnostics ?? null,
        approvalStatus: data.approvalStatus === 'approved' ? 'approved' : 'pending',
      }));
      if (data.status === 'failed') {
        setPreviewImageLoaded(false);
      }
    },
    []
  );

  const generateFounderPreview = useCallback(
    async (revisionNote?: string | null) => {
      if (!bundle) return;
      setError(null);
      setIsGeneratingPreview(true);
      setPreviewImageLoaded(false);
      setFounderRenderState((prev) => ({
        ...prev,
        status: 'generating',
        failureReason: null,
        revisionNote: revisionNote ?? null,
      }));

      try {
        const submitted = await requestFounderRenderGenerate({
          plan: bundle.plan,
          revisionNote: revisionNote ?? null,
        });
        if (!submitted.ok || !submitted.jobId) {
          setFounderRenderState((prev) => ({
            ...prev,
            status: 'failed',
            failureReason: submitted.error ?? submitted.code ?? 'Dispatch failed',
          }));
          setError(submitted.error ?? 'Founder render dispatch failed');
          return;
        }

        setFounderRenderState((prev) => ({
          ...prev,
          jobId: submitted.jobId!,
          status: 'generating',
          modelRoute: submitted.modelRoute ?? null,
          providerModel: submitted.providerModel ?? null,
          blueprintRevision: submitted.blueprintRevision ?? bundle.plan.metadata.revision,
        }));

        const completed = await pollFounderRenderStatus(submitted.jobId, bundle.plan.metadata.revision, {
          onProgress: (status) => {
            setFounderRenderState((prev) => ({ ...prev, status }));
          },
        });
        applyStatusResponse(completed);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setFounderRenderState((prev) => ({ ...prev, status: 'failed', failureReason: msg }));
      } finally {
        setIsGeneratingPreview(false);
      }
    },
    [bundle, applyStatusResponse]
  );

  const submitRequest = useCallback((ctx: BlueprintWorkflowContext) => {
    setError(null);
    setIsAuthoring(true);
    setManufacturingResult(null);
    setFounderRenderState(INITIAL_RENDER_STATE);
    setPreviewImageLoaded(false);
    setRevisionInput('');
    try {
      const compileRequest = mapWorkflowContextToCompileRequest(ctx);
      setRequest(compileRequest);
      const opened = openBlueprintAuthorSession(compileRequest);
      setBundle(opened);
      setStep('founder-review');
      setSelectedAssetId(null);
      setVariantId('current');
      setVariantChanged(false);
      setBlueprintDrawerOpen(false);
      setInspectMode(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStep('idle');
    } finally {
      setIsAuthoring(false);
    }
  }, []);

  const approveAndBuild = useCallback(async () => {
    if (!request || !founderRenderJob || !canApproveFounderRender(founderRenderJob, previewImageLoaded)) return;
    setError(null);
    setIsManufacturing(true);

    if (founderRenderJob.jobId) {
      const approval = await requestFounderRenderApprove({
        jobId: founderRenderJob.jobId,
        currentBlueprintRevision: founderRenderJob.currentBlueprintRevision,
        materialSet: founderRenderJob.materialLibrary,
        lightingProfile: founderRenderJob.lightingProfile,
        cameraProfile: founderRenderJob.cameraProfile,
      });
      if (!approval.ok) {
        setError(approval.error ?? 'Founder render approval failed');
        setIsManufacturing(false);
        return;
      }
    }

    setStep('manufacturing');
    setFounderRenderState((prev) => ({ ...prev, approvalStatus: 'approved', status: 'approved' }));
    try {
      const result = runConstructionModeCompile({ ...request, founderApproved: true });
      setManufacturingResult(result);
      if (result.session) {
        setBundle((prev) =>
          prev
            ? {
                ...prev,
                session: result.session,
              }
            : prev
        );
      }
      setStep(result.success ? 'complete' : 'manufacturing');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsManufacturing(false);
    }
  }, [request, founderRenderJob, previewImageLoaded]);

  const submitRevision = useCallback(() => {
    const note = revisionInput.trim();
    if (!note) return;
    void generateFounderPreview(note);
    setRevisionInput('');
  }, [revisionInput, generateFounderPreview]);

  const goBack = useCallback(() => {
    if (inspectMode && selectedAssetId) {
      setSelectedAssetId(null);
      setInspectMode(false);
      return;
    }
    if (blueprintDrawerOpen) {
      setBlueprintDrawerOpen(false);
      return;
    }
    setStep('idle');
    setBundle(null);
    setManufacturingResult(null);
    setRequest(null);
    setSelectedAssetId(null);
    setVariantId('current');
    setVariantChanged(false);
    setBlueprintDrawerOpen(false);
    setInspectMode(false);
    setFounderRenderState(INITIAL_RENDER_STATE);
    setPreviewImageLoaded(false);
  }, [inspectMode, selectedAssetId, blueprintDrawerOpen]);

  const openBlueprintDrawer = useCallback(() => {
    setBlueprintDrawerOpen(true);
  }, []);

  const toggleBlueprintDrawer = useCallback(() => {
    setBlueprintDrawerOpen((v) => !v);
  }, []);

  const openInspect = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setInspectMode(true);
  }, []);

  const closeInspect = useCallback(() => {
    setSelectedAssetId(null);
    setInspectMode(false);
  }, []);

  const selectVariant = useCallback((id: FounderRenderVariantId) => {
    setVariantId(id);
    if (id !== 'current') setVariantChanged(true);
  }, []);

  const enableInspectMode = useCallback(() => {
    setInspectMode(true);
  }, []);

  const reset = useCallback(() => {
    setStep('idle');
    setBundle(null);
    setManufacturingResult(null);
    setRequest(null);
    setSelectedAssetId(null);
    setVariantId('current');
    setVariantChanged(false);
    setBlueprintDrawerOpen(false);
    setInspectMode(false);
    setError(null);
    setIsAuthoring(false);
    setIsManufacturing(false);
    setFounderRenderState(INITIAL_RENDER_STATE);
    setPreviewImageLoaded(false);
    setRevisionInput('');
  }, []);

  const isApproved = Boolean(manufacturingResult?.success);
  const canApprove =
    founderRenderJob != null && canApproveFounderRender(founderRenderJob, previewImageLoaded) && !isManufacturing;

  return {
    step,
    variantId,
    blueprintDrawerOpen,
    inspectMode,
    summary,
    bundle,
    founderRenderJob,
    founderDiff,
    constructionTimeline,
    roomAssembly,
    manufacturingResult,
    selectedAssetId,
    selectedInspector,
    request,
    error,
    isAuthoring,
    isManufacturing,
    isApproved,
    canApprove,
    isGeneratingPreview,
    previewImageLoaded,
    revisionInput,
    setRevisionInput,
    submitRequest,
    generateFounderPreview,
    approveAndBuild,
    submitRevision,
    goBack,
    openBlueprintDrawer,
    toggleBlueprintDrawer,
    openInspect,
    closeInspect,
    selectVariant,
    enableInspectMode,
    setPreviewImageLoaded,
    reset,
  };
}

export type UseBlueprintAuthorWorkflowReturn = ReturnType<typeof useBlueprintAuthorWorkflow>;
