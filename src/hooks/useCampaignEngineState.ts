import { useCallback, useMemo, useState } from 'react';
import { buildCampaignEngineSeed } from '../studio-os-core/campaign-engine/bootstrap';
import {
  applyDeliverableWorkflowAction,
  bootstrapCampaignEngineStore,
  openCampaignDeliverablesTab,
  readCampaignEngineStore,
  selectCampaignEngineCampaign,
  selectCampaignEngineDeliverable,
  selectCampaignEngineWorkspace,
  selectCampaignEngineWorkspaceTab,
  setCampaignBuilderStep,
  syncCampaignEngineFromSeed,
} from '../studio-os-core/campaign-engine/store';
import type { DeliverableWorkflowAction } from '../studio-os-core/campaign-engine/store';
import type {
  CampaignDeliverable,
  CampaignRecord,
  CampaignWorkspaceId,
  CampaignWorkspaceTab,
} from '../studio-os-core/campaign-engine/types';
import { computeDeliverableStats } from '../studio-os-core/campaign-engine/deliverableUtils';

function ensureSeeded(): void {
  const seed = buildCampaignEngineSeed();
  bootstrapCampaignEngineStore(seed);
  syncCampaignEngineFromSeed(seed);
}

export function useCampaignEngineState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    return readCampaignEngineStore();
  }, [version]);

  const selectedCampaign = useMemo(
    () => store.campaigns.find((c) => c.id === store.selectedCampaignId) ?? null,
    [store.campaigns, store.selectedCampaignId]
  );

  const workspaceCampaigns = useMemo(
    () => store.campaigns.filter((c) => c.workspaceId === store.activeWorkspaceId),
    [store.campaigns, store.activeWorkspaceId]
  );

  const campaignDeliverables = useMemo(
    () => (selectedCampaign ? store.deliverables.filter((d) => d.campaignId === selectedCampaign.id) : []),
    [store.deliverables, selectedCampaign]
  );

  const selectedDeliverable = useMemo(
    () => store.deliverables.find((d) => d.id === store.selectedDeliverableId) ?? null,
    [store.deliverables, store.selectedDeliverableId]
  );

  const deliverableStatsByCampaign = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeDeliverableStats>>();
    for (const camp of workspaceCampaigns) {
      const dels = store.deliverables.filter((d) => d.campaignId === camp.id);
      map.set(camp.id, computeDeliverableStats(dels));
    }
    return map;
  }, [workspaceCampaigns, store.deliverables]);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const selectWorkspace = useCallback(
    (id: CampaignWorkspaceId) => {
      selectCampaignEngineWorkspace(id);
      bump();
    },
    [bump]
  );

  const selectCampaign = useCallback(
    (id: string | null) => {
      selectCampaignEngineCampaign(id);
      bump();
    },
    [bump]
  );

  const selectWorkspaceTab = useCallback(
    (tab: CampaignWorkspaceTab) => {
      selectCampaignEngineWorkspaceTab(tab);
      bump();
    },
    [bump]
  );

  const viewCampaignDeliverables = useCallback(
    (campaignId: string) => {
      openCampaignDeliverablesTab(campaignId);
      bump();
    },
    [bump]
  );

  const selectDeliverable = useCallback(
    (id: string | null) => {
      selectCampaignEngineDeliverable(id);
      bump();
    },
    [bump]
  );

  const setBuilderStep = useCallback(
    (step: number) => {
      setCampaignBuilderStep(step);
      bump();
    },
    [bump]
  );

  const applyDeliverableAction = useCallback(
    (deliverableId: string, action: DeliverableWorkflowAction) => {
      applyDeliverableWorkflowAction(deliverableId, action);
      bump();
    },
    [bump]
  );

  return {
    store,
    selectedCampaign,
    selectedDeliverable,
    workspaceCampaigns,
    campaignDeliverables,
    deliverableStatsByCampaign,
    refresh,
    selectWorkspace,
    selectCampaign,
    selectWorkspaceTab,
    viewCampaignDeliverables,
    selectDeliverable,
    setBuilderStep,
    applyDeliverableAction,
  };
}

export type { CampaignRecord, CampaignDeliverable };
