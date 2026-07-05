import {
  EXPERIENCE_ARCHITECT_STORAGE_KEY,
  EXPERIENCE_ARCHITECT_VERSION,
  EXPERIENCE_PHILOSOPHY,
} from './constants';
import type { ExperienceArchitectStore, ExperienceArchitectWorkspaceId } from './types';

function emptyStore(): ExperienceArchitectStore {
  return {
    version: EXPERIENCE_ARCHITECT_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      experienceHealthPct: 0,
      journeyCompletenessPct: 0,
      emotionalCoherencePct: 0,
      relationshipImpactPct: 0,
      crossChannelConsistencyPct: 0,
      approvalStatus: 'draft',
    },
    experiencePhilosophy: [...EXPERIENCE_PHILOSOPHY],
    blueprintStages: [],
    journeyTouchpoints: [],
    emotionalArchitecture: [],
    experienceSystems: [],
    microExperiences: [],
    simulations: [],
    intelligenceAlerts: [],
    crossChannel: [],
    experienceStandards: [],
    frictionAnalysis: [],
    retentionOpportunities: [],
    digitalHandoff: {
      status: 'pending',
      transferredAt: null,
      inheritedAssets: [],
      downstreamTargets: [],
    },
  };
}

function refreshDashboard(store: ExperienceArchitectStore): ExperienceArchitectStore['dashboard'] {
  const approvedStages = store.blueprintStages.filter((s) => s.status === 'approved').length;
  const journeyPct = store.blueprintStages.length > 0
    ? Math.round((approvedStages / store.blueprintStages.length) * 100)
    : 0;
  const channelUnified = store.crossChannel.filter((c) => c.status === 'unified').length;
  const channelPct = store.crossChannel.length > 0
    ? Math.round((channelUnified / store.crossChannel.length) * 100)
    : 0;

  return {
    ...store.dashboard,
    journeyCompletenessPct: journeyPct,
    crossChannelConsistencyPct: channelPct,
    experienceHealthPct: store.dashboard.experienceHealthPct || Math.round((journeyPct + channelPct) / 2),
  };
}

export function readExperienceArchitectStore(): ExperienceArchitectStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXPERIENCE_ARCHITECT_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExperienceArchitectStore;
    return { ...emptyStore(), ...parsed, version: EXPERIENCE_ARCHITECT_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExperienceArchitectStore(store: ExperienceArchitectStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    EXPERIENCE_ARCHITECT_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: EXPERIENCE_ARCHITECT_VERSION })
  );
}

export function bootstrapExperienceArchitectStore(seed?: Partial<ExperienceArchitectStore>): void {
  const existing = readExperienceArchitectStore();
  if (existing.blueprintStages.length > 0) return;
  const merged = { ...emptyStore(), ...seed };
  writeExperienceArchitectStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectExperienceArchitectWorkspace(id: ExperienceArchitectWorkspaceId): void {
  const store = readExperienceArchitectStore();
  writeExperienceArchitectStore({
    ...store,
    activeWorkspaceId: id,
    dashboard: refreshDashboard({ ...store, activeWorkspaceId: id }),
  });
}
