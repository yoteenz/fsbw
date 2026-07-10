import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import '../tutorial-os/tutorial-os.css';
import type { ManualModule, ManualStep } from './types';
import { STUDIO_INTERACTIVE_MANUAL_LABEL } from './constants';
import {
  findManualStepIndex,
  getManualModuleById,
  getManualSteps,
} from './registry';
import { resolveManualModuleIdForPath } from './knowledge-graph/queries';
import {
  clearManualResume,
  markManualNodeCompleted,
  markModuleCompleted,
  readManualProgressStore,
  saveManualResume,
  upsertModuleProgress,
} from './progressStorage';
import { waitForManualTarget, type ResolvedManualTarget } from './targetResolver';
import { ManualWizardPanel } from './components/ManualWizardPanel';
import { ManualSpotlightOverlay } from './components/ManualSpotlightOverlay';
import { ManualSearchModal } from './components/ManualSearchModal';
import { ManualWorkspaceHelpButton } from './components/ManualWorkspaceHelpButton';
import type { ManualSearchEntry } from './types';
import { getWhatsNewForModule } from './whatsNew';
import { getModuleGraphEntry } from './knowledge-graph/queries';
import { markGraphNodeVisited } from './progressStorage';

export type StudioInteractiveManualContextValue = {
  activeModule: ManualModule | null;
  activeStep: ManualStep | null;
  activeStepIndex: number;
  isManualActive: boolean;
  openModuleManual: (moduleId?: string, options?: { stepId?: string }) => void;
  openWorkspaceHelp: () => void;
  stopManual: () => void;
  openSearchModal: () => void;
  closeSearchModal: () => void;
  searchModalOpen: boolean;
  openWrittenDocumentation: () => void;
};

const StudioInteractiveManualContext = createContext<StudioInteractiveManualContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  onOpenWrittenDoc?: () => void;
};

export function StudioInteractiveManualProvider({ children, onOpenWrittenDoc }: ProviderProps) {
  const location = useLocation();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [target, setTarget] = useState<ResolvedManualTarget | null>(null);
  const [storeVersion, setStoreVersion] = useState(0);
  const bumpStore = useCallback(() => setStoreVersion((v) => v + 1), []);

  const activeModule = useMemo(
    () => (activeModuleId ? getManualModuleById(activeModuleId) ?? null : null),
    [activeModuleId]
  );
  const steps = useMemo(
    () => (activeModule ? getManualSteps(activeModule.id) : []),
    [activeModule]
  );
  const activeStep = steps[stepIndex] ?? null;
  const isManualActive = Boolean(activeModule && activeStep);

  const resolveStepTarget = useCallback(async (step: ManualStep) => {
    const resolved = await waitForManualTarget(step, location.pathname);
    setTarget(resolved);
  }, [location.pathname]);

  useEffect(() => {
    if (!isManualActive || !activeStep) return;
    void resolveStepTarget(activeStep);
    saveManualResume(activeModule!.id, stepIndex);
  }, [isManualActive, activeStep, stepIndex, activeModule, resolveStepTarget]);

  const persistStep = useCallback(
    (moduleId: string, index: number, step: ManualStep) => {
      const prev = readManualProgressStore().modules[moduleId];
      const completed = new Set(prev?.completedStepIds ?? []);
      completed.add(step.id);
      upsertModuleProgress(moduleId, {
        status: 'in_progress',
        lastStepId: step.id,
        lastStepIndex: index,
        completedStepIds: [...completed],
        startedAt: prev?.startedAt ?? new Date().toISOString(),
      });
      markManualNodeCompleted(step);
      bumpStore();
    },
    [bumpStore]
  );

  const startModule = useCallback(
    (moduleId: string, options?: { stepId?: string }) => {
      const mod = getManualModuleById(moduleId);
      if (!mod || mod.steps.length === 0) return;
      const idx = options?.stepId ? Math.max(0, findManualStepIndex(moduleId, options.stepId)) : 0;
      setSearchModalOpen(false);
      setActiveModuleId(moduleId);
      setStepIndex(idx);
      markGraphNodeVisited(moduleId);
      upsertModuleProgress(moduleId, {
        status: 'started',
        lastStepIndex: idx,
        startedAt: new Date().toISOString(),
      });
      bumpStore();
    },
    [bumpStore]
  );

  const stopManual = useCallback(() => {
    setActiveModuleId(null);
    setStepIndex(0);
    setTarget(null);
    clearManualResume();
  }, []);

  const completeModule = useCallback(
    (moduleId: string) => {
      markModuleCompleted(moduleId);
      bumpStore();
      stopManual();
    },
    [bumpStore, stopManual]
  );

  const goNext = useCallback(() => {
    if (!activeModule || !activeStep) return;
    persistStep(activeModule.id, stepIndex, activeStep);
    if (stepIndex >= steps.length - 1) {
      completeModule(activeModule.id);
      return;
    }
    setStepIndex((i) => i + 1);
    setTarget(null);
  }, [activeModule, activeStep, stepIndex, steps.length, persistStep, completeModule]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
    setTarget(null);
  }, [stepIndex]);

  const skipManual = useCallback(() => {
    if (activeModule) {
      upsertModuleProgress(activeModule.id, { status: 'skipped' });
      bumpStore();
    }
    stopManual();
  }, [activeModule, bumpStore, stopManual]);

  const openModuleManual = useCallback(
    (moduleId?: string, options?: { stepId?: string }) => {
      const id = moduleId ?? resolveManualModuleIdForPath(location.pathname);
      if (!id) return;
      startModule(id, options);
    },
    [location.pathname, startModule]
  );

  const openWorkspaceHelp = useCallback(() => {
    openModuleManual(undefined);
  }, [openModuleManual]);

  const openWrittenDocumentation = useCallback(() => {
    onOpenWrittenDoc?.();
  }, [onOpenWrittenDoc]);

  const handleStepAction = useCallback(() => {
    if (!activeStep) return;
    if (activeStep.actionType === 'open-written-doc') {
      openWrittenDocumentation();
      return;
    }
    if (activeStep.actionType === 'try-feature') {
      const whatsNew = getWhatsNewForModule(activeStep.moduleId);
      if (whatsNew?.highlightStepId) {
        const idx = findManualStepIndex(activeStep.moduleId, whatsNew.highlightStepId);
        if (idx >= 0) setStepIndex(idx);
      }
    }
  }, [activeStep, openWrittenDocumentation]);

  const handleSearchSelect = useCallback(
    (entry: ManualSearchEntry) => {
      if (entry.stepId) startModule(entry.moduleId, { stepId: entry.stepId });
      else startModule(entry.moduleId);
    },
    [startModule]
  );

  const value = useMemo<StudioInteractiveManualContextValue>(
    () => ({
      activeModule,
      activeStep,
      activeStepIndex: stepIndex,
      isManualActive,
      openModuleManual,
      openWorkspaceHelp,
      stopManual,
      openSearchModal: () => setSearchModalOpen(true),
      closeSearchModal: () => setSearchModalOpen(false),
      searchModalOpen,
      openWrittenDocumentation,
    }),
    [
      activeModule,
      activeStep,
      stepIndex,
      isManualActive,
      openModuleManual,
      openWorkspaceHelp,
      stopManual,
      searchModalOpen,
      openWrittenDocumentation,
    ]
  );

  void storeVersion;

  const connectedForStep = useMemo(() => {
    if (!activeModule) return [];
    const entry = getModuleGraphEntry(activeModule.id);
    if (!entry) return [];
    return entry.connected
      .filter((c) => c.node.type === 'module' || c.node.moduleId)
      .slice(0, 6)
      .map((c) => ({ node: c.node, relation: c.relation }));
  }, [activeModule]);

  const overlay =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            <ManualSearchModal
              open={searchModalOpen}
              onClose={() => setSearchModalOpen(false)}
              onSelect={handleSearchSelect}
            />
            <ManualWorkspaceHelpButton />
            <ManualSpotlightOverlay step={activeStep} target={target} visible={isManualActive} />
            {isManualActive && activeModule && activeStep ? (
              <ManualWizardPanel
                step={activeStep}
                stepIndex={stepIndex}
                stepCount={steps.length}
                title={activeStep.title}
                body={activeStep.body}
                benefit={activeStep.benefit}
                productLabel={activeModule.productLabel ?? STUDIO_INTERACTIVE_MANUAL_LABEL}
                moduleName={activeModule.customerName}
                position={activeStep.position === 'auto' ? 'bottom' : activeStep.position}
                actionLabel={activeStep.actionLabel}
                onAction={activeStep.actionLabel ? handleStepAction : undefined}
                onOpenWrittenDoc={openWrittenDocumentation}
                onOpenConnectedModule={(id) => startModule(id)}
                connectedModules={connectedForStep}
                onBack={goBack}
                onNext={goNext}
                onSkip={skipManual}
                canBack={stepIndex > 0}
                isLast={stepIndex >= steps.length - 1}
              />
            ) : null}
          </>,
          document.body
        )
      : null;

  return (
    <StudioInteractiveManualContext.Provider value={value}>
      {children}
      {overlay}
    </StudioInteractiveManualContext.Provider>
  );
}

export function useStudioInteractiveManual(): StudioInteractiveManualContextValue {
  const ctx = useContext(StudioInteractiveManualContext);
  if (!ctx) {
    throw new Error('useStudioInteractiveManual requires StudioInteractiveManualProvider');
  }
  return ctx;
}

export function useStudioInteractiveManualOptional(): StudioInteractiveManualContextValue | null {
  return useContext(StudioInteractiveManualContext);
}
