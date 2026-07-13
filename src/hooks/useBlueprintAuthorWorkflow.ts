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

export type BlueprintWorkflowStep = 'idle' | 'plan' | 'preview' | 'inspector' | 'manufacturing' | 'complete';

export function useBlueprintAuthorWorkflow() {
  const [step, setStep] = useState<BlueprintWorkflowStep>('idle');
  const [view, setView] = useState<'plan' | 'preview' | 'inspector'>('plan');
  const [bundle, setBundle] = useState<BlueprintAuthorSessionBundle | null>(null);
  const [manufacturingResult, setManufacturingResult] = useState<ConstructionModeCompileResult | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [request, setRequest] = useState<FounderCompileRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthoring, setIsAuthoring] = useState(false);
  const [isManufacturing, setIsManufacturing] = useState(false);

  const summary = useMemo(() => (bundle ? buildConstructionPlanSummary(bundle) : null), [bundle]);

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
      setStep('plan');
      setView('plan');
      setSelectedAssetId(null);
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
    if (view === 'inspector') {
      setView('preview');
      setSelectedAssetId(null);
      setStep('preview');
      return;
    }
    if (view === 'preview') {
      setView('plan');
      setStep('plan');
      return;
    }
    setStep('idle');
    setBundle(null);
    setManufacturingResult(null);
    setRequest(null);
    setSelectedAssetId(null);
    setView('plan');
  }, [view]);

  const openPreview = useCallback(() => {
    setView('preview');
    setStep('preview');
  }, []);

  const openInspector = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setView('inspector');
    setStep('inspector');
  }, []);

  const reset = useCallback(() => {
    setStep('idle');
    setView('plan');
    setBundle(null);
    setManufacturingResult(null);
    setRequest(null);
    setSelectedAssetId(null);
    setError(null);
    setIsAuthoring(false);
    setIsManufacturing(false);
  }, []);

  const isApproved = Boolean(manufacturingResult?.success);
  const manufacturingBlocked = !manufacturingResult && bundle?.session.approvalStatus === 'pending';

  return {
    step,
    view,
    summary,
    bundle,
    manufacturingResult,
    selectedAssetId,
    selectedInspector,
    request,
    error,
    isAuthoring,
    isManufacturing,
    isApproved,
    manufacturingBlocked,
    submitRequest,
    approveAndBuild,
    goBack,
    openPreview,
    openInspector,
    reset,
    setView,
  };
}

export type UseBlueprintAuthorWorkflowReturn = ReturnType<typeof useBlueprintAuthorWorkflow>;
