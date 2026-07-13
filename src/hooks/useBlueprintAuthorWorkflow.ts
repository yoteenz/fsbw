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
  buildFounderRenderModel,
  buildFounderReviewDiff,
  buildRoomAssemblyState,
  FOUNDER_RENDER_VARIANTS,
  visibleAssetIdsForAssembly,
  type FounderRenderVariantId,
} from '../studio-os-core/founder-review';

export type BlueprintWorkflowStep = 'idle' | 'founder-review' | 'manufacturing' | 'complete';

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

  const founderRender = useMemo(() => {
    if (!bundle) return null;
    const visibleIds = roomAssembly ? [...visibleAssetIdsForAssembly(roomAssembly)] : undefined;
    return buildFounderRenderModel({
      plan: bundle.plan,
      variantId,
      installedAssetIds: assemblyPhase === 'review' ? undefined : visibleIds,
    });
  }, [bundle, variantId, roomAssembly, assemblyPhase]);

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

  const submitRequest = useCallback((ctx: BlueprintWorkflowContext) => {
    setError(null);
    setIsAuthoring(true);
    setManufacturingResult(null);
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

  const approveAndBuild = useCallback(() => {
    if (!request) return;
    setError(null);
    setIsManufacturing(true);
    setStep('manufacturing');
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
  }, [request]);

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
  }, []);

  const isApproved = Boolean(manufacturingResult?.success);
  const manufacturingBlocked = !manufacturingResult && bundle?.session.approvalStatus === 'pending';

  return {
    step,
    variantId,
    blueprintDrawerOpen,
    inspectMode,
    summary,
    bundle,
    founderRender,
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
    manufacturingBlocked,
    founderRenderVariants: FOUNDER_RENDER_VARIANTS,
    submitRequest,
    approveAndBuild,
    goBack,
    openBlueprintDrawer,
    toggleBlueprintDrawer,
    openInspect,
    closeInspect,
    selectVariant,
    enableInspectMode,
    reset,
  };
}

export type UseBlueprintAuthorWorkflowReturn = ReturnType<typeof useBlueprintAuthorWorkflow>;
