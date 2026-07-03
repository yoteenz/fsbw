import { useCallback, useMemo, useState } from 'react';
import {
  DEMO_ORCHESTRATOR_PACK_ID,
  ORCHESTRATOR_ADAPTER_REGISTRY,
  ORCHESTRATOR_PIPELINE_STEPS,
  type OrchestratorProviderId,
} from '../utils/adminStudioOrchestratorDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';
import {
  createDefaultAdapterStates,
  planOrchestratorRun,
  simulateDemoPackaging,
  retryStep,
  advanceApproval,
  getPipelineProgress,
  type OrchestratedContentPack,
} from '../services/studio/orchestrator';
import type { AdapterRuntimeState } from '../services/studio/orchestrator/types';

type OrchestratorPersisted = {
  adapterStates: Record<OrchestratorProviderId, AdapterRuntimeState>;
  pack: OrchestratedContentPack | null;
  topic: string;
};

function loadPersisted(): OrchestratorPersisted {
  const saved = readStudioJson<Partial<OrchestratorPersisted>>(ADMIN_STUDIO_STORAGE_KEYS.orchestrator);
  return {
    adapterStates: { ...createDefaultAdapterStates(), ...(saved?.adapterStates ?? {}) },
    pack: saved?.pack ?? null,
    topic: saved?.topic ?? 'CHERRY RED FORECAST',
  };
}

function persist(state: OrchestratorPersisted): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.orchestrator, state);
}

export function useAdminStudioOrchestrator() {
  const [state, setState] = useState(loadPersisted);

  const pipelineProgress = useMemo(
    () => (state.pack ? getPipelineProgress(state.pack.pipelineStep) : 0),
    [state.pack]
  );

  const update = useCallback((patch: Partial<OrchestratorPersisted>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const toggleAdapter = useCallback((id: OrchestratorProviderId) => {
    setState((prev) => {
      const current = prev.adapterStates[id];
      const nextAdapters = {
        ...prev.adapterStates,
        [id]: {
          ...current,
          enabled: !current.enabled,
          statusMessage: !current.enabled ? 'ENABLED · NOT CONNECTED' : 'DISABLED',
        },
      };
      const next = { ...prev, adapterStates: nextAdapters };
      persist(next);
      return next;
    });
  }, []);

  const planGeneration = useCallback(() => {
    const pack = planOrchestratorRun({
      topic: state.topic,
      packId: DEMO_ORCHESTRATOR_PACK_ID,
      masterPrompt: '[ASSEMBLED BY CREATIVE DIRECTOR — PROVIDERS NOT CALLED]',
      adapterStates: state.adapterStates,
    });
    update({ pack });
  }, [state.topic, state.adapterStates, update]);

  const packageDemo = useCallback(() => {
    const pack = simulateDemoPackaging(state.topic);
    update({ pack });
  }, [state.topic, update]);

  const retryFailedStep = useCallback(
    (stepId: string) => {
      if (!state.pack) return;
      update({ pack: retryStep(state.pack, stepId) });
    },
    [state.pack, update]
  );

  const setApproval = useCallback(
    (status: OrchestratedContentPack['approvalStatus']) => {
      if (!state.pack) return;
      update({ pack: advanceApproval(state.pack, status) });
    },
    [state.pack, update]
  );

  const setTopic = useCallback(
    (topic: string) => {
      update({ topic });
    },
    [update]
  );

  return {
    adapterRegistry: ORCHESTRATOR_ADAPTER_REGISTRY,
    pipelineSteps: ORCHESTRATOR_PIPELINE_STEPS,
    adapterStates: state.adapterStates,
    pack: state.pack,
    topic: state.topic,
    pipelineProgress,
    toggleAdapter,
    planGeneration,
    packageDemo,
    retryFailedStep,
    setApproval,
    setTopic,
  };
}
