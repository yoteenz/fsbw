import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VirtualProductionMode } from '../studio-os-core/virtual-production';
import {
  buildCampaign001PlaceholderShots,
  CAMPAIGN_001_SHELL,
  FRONTAL_SLAYER_BRAND_SHELL,
} from '../studio-os-core/virtual-production/reference-seed';
import {
  createCampaign,
  getProductionBoard,
  listCampaigns,
  seedReferenceTenant,
  type CampaignSummary,
  type ShotRow,
} from '../services/studio/virtualProduction/api';

function buildDemoBoard(): { campaign: Record<string, unknown>; shots: ShotRow[] } {
  const campaignId = 'demo-campaign-001';
  const sceneId = 'demo-scene-01';
  const placeholders = buildCampaign001PlaceholderShots(campaignId, sceneId);
  return {
    campaign: {
      id: campaignId,
      name: CAMPAIGN_001_SHELL.name,
      objective: CAMPAIGN_001_SHELL.objective,
      production_mode: CAMPAIGN_001_SHELL.productionMode,
      lifecycle_status: CAMPAIGN_001_SHELL.lifecycleStatus,
      approval_state: CAMPAIGN_001_SHELL.approvalState,
      creative_brief: CAMPAIGN_001_SHELL.creativeBrief,
      studio_vp_brands: { display_name: FRONTAL_SLAYER_BRAND_SHELL.displayName },
      metadata: { demoFallback: true },
    },
    shots: placeholders.map((s, i) => ({
      id: `demo-shot-${i + 1}`,
      shot_key: s.shotKey,
      sort_order: s.sortOrder,
      description: s.description,
      approval_state: s.approvalState,
      qc_summary: s.qcSummary,
      production_mode: s.productionMode,
      provider_id: s.providerId,
      metadata: s.metadata,
    })),
  };
}

export function useVirtualProductionBoard(orgId = 'frontal-slayer', demoFallback = false) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Record<string, unknown> | null>(null);
  const [shots, setShots] = useState<ShotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    'overview' | 'canon' | 'story' | 'storyboard' | 'shots' | 'production' | 'qc' | 'edit' | 'deliverables' | 'history'
  >('production');

  const [demoActive, setDemoActive] = useState(demoFallback);

  const demoBoard = useMemo(() => buildDemoBoard(), []);

  const refreshCampaigns = useCallback(async () => {
    if (demoActive) {
      setCampaigns([
        {
          id: demoBoard.campaign.id as string,
          campaign_key: 'campaign-001',
          name: demoBoard.campaign.name as string,
          production_mode: demoBoard.campaign.production_mode as string,
          lifecycle_status: demoBoard.campaign.lifecycle_status as string,
          approval_state: demoBoard.campaign.approval_state as string,
        },
      ]);
      setActiveCampaignId(demoBoard.campaign.id as string);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await listCampaigns(orgId);
      setCampaigns(res.campaigns);
      if (res.campaigns.length > 0 && !activeCampaignId) {
        setActiveCampaignId(res.campaigns[0].id);
      }
    } catch (e) {
      if (demoFallback) {
        setDemoActive(true);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load campaigns');
      }
    } finally {
      setLoading(false);
    }
  }, [orgId, activeCampaignId, demoActive, demoFallback, demoBoard]);

  const refreshBoard = useCallback(async () => {
    if (demoActive) {
      setCampaign(demoBoard.campaign);
      setShots(demoBoard.shots);
      return;
    }
    if (!activeCampaignId) return;
    setError(null);
    try {
      const res = await getProductionBoard(orgId, activeCampaignId);
      setCampaign(res.campaign);
      setShots(res.shots);
    } catch (e) {
      if (demoFallback) {
        setDemoActive(true);
        setCampaign(demoBoard.campaign);
        setShots(demoBoard.shots);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load board');
      }
    }
  }, [orgId, activeCampaignId, demoActive, demoFallback, demoBoard]);

  useEffect(() => {
    void refreshCampaigns();
  }, [refreshCampaigns]);

  useEffect(() => {
    void refreshBoard();
  }, [refreshBoard]);

  const seedReference = useCallback(async () => {
    setLoading(true);
    try {
      const res = await seedReferenceTenant(orgId);
      setActiveCampaignId(res.campaignId);
      setDemoActive(false);
      await refreshCampaigns();
      await refreshBoard();
    } catch (e) {
      if (demoFallback || import.meta.env.DEV) {
        setDemoActive(true);
        setCampaign(demoBoard.campaign);
        setShots(demoBoard.shots);
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Seed failed');
      }
    } finally {
      setLoading(false);
    }
  }, [orgId, refreshCampaigns, refreshBoard, demoFallback, demoBoard]);

  const createNewCampaign = useCallback(
    async (brandId: string, name: string, productionMode: VirtualProductionMode) => {
      await createCampaign({ orgId, brandId, name, productionMode });
      await refreshCampaigns();
    },
    [orgId, refreshCampaigns]
  );

  return {
    campaigns,
    activeCampaignId,
    setActiveCampaignId,
    campaign,
    shots,
    loading,
    error,
    tab,
    setTab,
    seedReference,
    createNewCampaign,
    refreshBoard,
  };
}
