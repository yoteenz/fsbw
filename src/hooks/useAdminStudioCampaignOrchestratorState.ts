import { useCallback, useMemo, useState } from 'react';
import type {
  CampaignBlueprint,
  CampaignPlan,
  CampaignWizardDraft,
  CampaignWizardStep,
} from '../utils/adminStudioCampaignOrchestratorDemo';
import {
  CAMPAIGN_BLUEPRINTS,
  createDefaultWizard,
} from '../utils/adminStudioCampaignOrchestratorDemo';
import { computeCampaignProgress, generateCampaignPlan } from '../utils/adminStudioCampaignOrchestratorPlan';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type CampaignOrchestratorStore = {
  campaigns?: Record<string, CampaignPlan>;
  activeCampaignId?: string;
  wizardDraft?: CampaignWizardDraft;
  view?: 'hub' | 'wizard' | 'dashboard';
};

function readStore(): CampaignOrchestratorStore {
  return readStudioJson<CampaignOrchestratorStore>(ADMIN_STUDIO_STORAGE_KEYS.campaignOrchestrator) ?? {};
}

function writeStore(store: CampaignOrchestratorStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.campaignOrchestrator, store);
}

export function exportCampaignOrchestratorSnapshot() {
  const store = readStore();
  return {
    campaigns: store.campaigns ?? {},
    activeCampaignId: store.activeCampaignId,
    source: 'campaign-orchestrator-local' as const,
  };
}

export function useAdminStudioCampaignOrchestrator() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const view = store.view ?? 'hub';
  const wizard = store.wizardDraft ?? createDefaultWizard();

  const activeCampaign: CampaignPlan | null = useMemo(() => {
    const id = store.activeCampaignId;
    if (!id || !store.campaigns?.[id]) return null;
    const plan = store.campaigns[id];
    return { ...plan, progressPct: computeCampaignProgress(plan) };
  }, [store, version]);

  const campaigns = useMemo(() => Object.values(store.campaigns ?? {}), [store]);

  const setView = useCallback(
    (v: 'hub' | 'wizard' | 'dashboard') => {
      writeStore({ ...readStore(), view: v });
      bump();
    },
    [bump]
  );

  const updateWizard = useCallback(
    (patch: Partial<CampaignWizardDraft>) => {
      const s = readStore();
      const current = s.wizardDraft ?? createDefaultWizard();
      writeStore({ ...s, wizardDraft: { ...current, ...patch }, view: 'wizard' });
      bump();
    },
    [bump]
  );

  const setWizardStep = useCallback(
    (step: CampaignWizardStep) => updateWizard({ step }),
    [updateWizard]
  );

  const startWizard = useCallback(
    (blueprint?: CampaignBlueprint) => {
      const base = createDefaultWizard();
      if (blueprint) {
        base.typeId = blueprint.typeId;
        base.name = blueprint.name;
        base.theme = blueprint.description;
      }
      writeStore({ ...readStore(), wizardDraft: base, view: 'wizard' });
      bump();
    },
    [bump]
  );

  const generatePlan = useCallback(() => {
    const s = readStore();
    const w = s.wizardDraft ?? createDefaultWizard();
    const plan = generateCampaignPlan(w);
    const campaigns = { ...(s.campaigns ?? {}), [plan.id]: plan };
    writeStore({
      ...s,
      campaigns,
      activeCampaignId: plan.id,
      view: 'dashboard',
      wizardDraft: undefined,
    });
    bump();
  }, [bump]);

  const selectCampaign = useCallback(
    (id: string) => {
      writeStore({ ...readStore(), activeCampaignId: id, view: 'dashboard' });
      bump();
    },
    [bump]
  );

  const toggleApproval = useCallback(
    (gateId: string) => {
      const s = readStore();
      const id = s.activeCampaignId;
      if (!id || !s.campaigns?.[id]) return;
      const plan = s.campaigns[id];
      const approvals = plan.approvals.map((a) => (a.id === gateId ? { ...a, approved: !a.approved } : a));
      writeStore({
        ...s,
        campaigns: { ...s.campaigns, [id]: { ...plan, approvals } },
      });
      bump();
    },
    [bump]
  );

  const toggleAutomation = useCallback(
    (ruleId: string) => {
      const s = readStore();
      const id = s.activeCampaignId;
      if (!id || !s.campaigns?.[id]) return;
      const plan = s.campaigns[id];
      const automation = plan.automation.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
      writeStore({ ...s, campaigns: { ...s.campaigns, [id]: { ...plan, automation } } });
      bump();
    },
    [bump]
  );

  const advanceTask = useCallback(
    (taskId: string) => {
      const s = readStore();
      const id = s.activeCampaignId;
      if (!id || !s.campaigns?.[id]) return;
      const plan = s.campaigns[id];
      const order: Array<CampaignPlan['tasks'][0]['status']> = ['waiting', 'working', 'ready', 'complete'];
      const tasks = plan.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const idx = order.indexOf(t.status);
        const next = order[Math.min(idx + 1, order.length - 1)];
        return { ...t, status: next };
      });
      const updated = { ...plan, tasks, progressPct: computeCampaignProgress({ ...plan, tasks }) };
      writeStore({ ...s, campaigns: { ...s.campaigns, [id]: updated } });
      bump();
    },
    [bump]
  );

  const saveAsBlueprint = useCallback(() => {
    void CAMPAIGN_BLUEPRINTS;
    bump();
  }, [bump]);

  return {
    view,
    setView,
    wizard,
    updateWizard,
    setWizardStep,
    startWizard,
    generatePlan,
    activeCampaign,
    campaigns,
    selectCampaign,
    toggleApproval,
    toggleAutomation,
    advanceTask,
    saveAsBlueprint,
    blueprints: CAMPAIGN_BLUEPRINTS,
  };
}
