import {useCallback, useMemo, useState} from 'react';
import { buildCampaignEngineSeed } from '../studio-os-core/campaign-engine/bootstrap';
import {
  bootstrapCampaignEngineStore,
  readCampaignEngineStore,
  selectCampaignEngineCampaign,
  selectCampaignEngineWorkspace,
  setCampaignBuilderStep,
} from '../studio-os-core/campaign-engine/store';
import type { CampaignRecord, CampaignWorkspaceId } from '../studio-os-core/campaign-engine/types';

function ensureSeeded(): void {
  bootstrapCampaignEngineStore(buildCampaignEngineSeed());
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
    () => store.campaigns.find((c) => c.id === store.selectedCampaignId) ?? store.campaigns[0] ?? null,
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

  const selectWorkspace = useCallback((id: CampaignWorkspaceId) => {
    selectCampaignEngineWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const selectCampaign = useCallback((id: string | null) => {
    selectCampaignEngineCampaign(id);
    setVersion((v) => v + 1);
  }, []);

  const setBuilderStep = useCallback((step: number) => {
    setCampaignBuilderStep(step);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    selectedCampaign,
    workspaceCampaigns,
    campaignDeliverables,
    refresh,
    selectWorkspace,
    selectCampaign,
    setBuilderStep,
  };
}

export type { CampaignRecord };
