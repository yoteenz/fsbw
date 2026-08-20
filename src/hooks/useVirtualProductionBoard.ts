import { useCallback, useEffect, useMemo, useState } from 'react';
import type { VirtualProductionMode } from '../studio-os-core/virtual-production';
import {
  CAMPAIGN_001_META,
  CAMPAIGN_001_SHOTS,
} from '../studio-os-core/virtual-production/pilot/campaign-001';
import {
  FS_BRAND_CANON,
  FS_CHARACTER_NIA,
  buildNiaReferencePackV1SlotStates,
} from '../studio-os-core/virtual-production/canon/frontal-slayer-canon';
import {
  createCampaign,
  getProductionBoard,
  listCampaigns,
  seedFsCanonCampaign001,
  type CampaignSummary,
  type ShotRow,
} from '../services/studio/virtualProduction/api';

function buildCampaign001DemoBoard(): { campaign: Record<string, unknown>; shots: ShotRow[] } {
  const campaignId = 'demo-campaign-001';

  const approvalByShot: Record<string, string> = {
    'shot-01': 'approved',
    'shot-02': 'keyframe_approved',
    'shot-03': 'keyframe_approved',
    'shot-04': 'planned',
    'shot-05': 'generating',
    'shot-06': 'planned',
    'shot-07': 'planned',
    'shot-08': 'repair_required',
    'shot-09': 'planned',
  };

  const qcByShot: Record<string, string> = {
    'shot-01': 'pass',
    'shot-02': 'not_reviewed',
    'shot-05': 'not_reviewed',
    'shot-08': 'identity_warning',
  };

  const shots: ShotRow[] = CAMPAIGN_001_SHOTS.map((s) => ({
    id: `${campaignId}-${s.shotKey}`,
    shot_key: s.shotKey,
    sort_order: s.sortOrder,
    description: `${s.title} — ${s.purpose}`,
    approval_state: approvalByShot[s.shotKey] ?? 'planned',
    qc_summary: { overall: qcByShot[s.shotKey] ?? 'not_reviewed' },
    production_mode: s.productionMode,
    provider_id: s.providerId,
    duration_seconds: s.durationSeconds,
    identity_criticality: s.identityCriticality,
    product_criticality: s.productCriticality,
    environment_criticality: s.environmentCriticality,
    metadata: {
      editorialNote: s.editorialNote,
      hybridRepairCandidate: s.hybridRepairCandidate ?? false,
      capabilityRequired: s.capabilityRequired,
    },
  }));

  return {
    campaign: {
      id: campaignId,
      name: CAMPAIGN_001_META.name,
      objective: CAMPAIGN_001_META.objective,
      platform: CAMPAIGN_001_META.platform,
      production_mode: CAMPAIGN_001_META.productionMode,
      lifecycle_status: CAMPAIGN_001_META.lifecycleStatus,
      current_phase: CAMPAIGN_001_META.currentPhase,
      director_external_status: 'ready_for_director',
      creative_brief: CAMPAIGN_001_META.creativeBrief,
      narrative_concept: CAMPAIGN_001_META.narrativeConcept,
      treatment: CAMPAIGN_001_META.treatment,
      format: CAMPAIGN_001_META.format,
      audio_plan: CAMPAIGN_001_META.audioPlan,
      studio_vp_brands: { display_name: FS_BRAND_CANON.displayName },
      canon_snapshot: {
        brand: FS_BRAND_CANON,
        character: FS_CHARACTER_NIA,
        referencePackV1: {
          version: 1,
          slots: buildNiaReferencePackV1SlotStates(),
          note: 'All image slots SETUP REQUIRED',
        },
        identityGate: 'blocked',
      },
      metadata: { demoFallback: true, pilot: true },
    },
    shots,
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
    | 'brief'
    | 'canon'
    | 'storyboard'
    | 'shots'
    | 'production'
    | 'qc'
    | 'assembly'
    | 'deliverables'
    | 'history'
  >('production');

  const [demoActive, setDemoActive] = useState(demoFallback);

  const demoBoard = useMemo(() => buildCampaign001DemoBoard(), []);

  const refreshCampaigns = useCallback(async () => {
    if (demoActive) {
      setCampaigns([
        {
          id: demoBoard.campaign.id as string,
          campaign_key: 'campaign-001',
          name: demoBoard.campaign.name as string,
          production_mode: demoBoard.campaign.production_mode as string,
          lifecycle_status: demoBoard.campaign.lifecycle_status as string,
          approval_state: 'draft',
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

  const seedCanonCampaign001 = useCallback(async () => {
    setLoading(true);
    try {
      const res = await seedFsCanonCampaign001(orgId);
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

  /** @deprecated use seedCanonCampaign001 */
  const seedReference = seedCanonCampaign001;

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
    seedCanonCampaign001,
    seedReference,
    createNewCampaign,
    refreshBoard,
  };
}
