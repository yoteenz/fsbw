import { WORKSPACE_REGISTRY_STORAGE_KEY, WORKSPACE_REGISTRY_VERSION } from './types';
import type { WorkspaceRegistryStore } from './types';
import {
  readStudioOsJson,
  readStudioOsStorageValue,
  writeStudioOsJson,
} from '../../utils/studioOsBrowserStorage';

/** Lightweight subset persisted locally — full snapshots stay in memory only. */
type WorkspaceRegistryPrefs = Pick<
  WorkspaceRegistryStore,
  'version' | 'favorites' | 'recentWorkspaceIds' | 'lastUpdatedAt'
>;

function prefsFromStore(store: WorkspaceRegistryStore): WorkspaceRegistryPrefs {
  return {
    version: store.version,
    favorites: store.favorites,
    recentWorkspaceIds: store.recentWorkspaceIds,
    lastUpdatedAt: store.lastUpdatedAt,
  };
}

export function buildWorkspaceRegistrySeed(): WorkspaceRegistryStore {
  const now = new Date().toISOString();
  return {
    version: WORKSPACE_REGISTRY_VERSION,
    lastUpdatedAt: now,
    favorites: ['frontal-slayer', 'ai-media'],
    recentWorkspaceIds: ['ai-media', 'frontal-slayer', 'all-in-one-enterprise'],
    studioPortfolioInsights: [
      {
        id: 'spi-1',
        sourceWorkspaceId: 'frontal-slayer',
        targetWorkspaceId: 'ai-media',
        insight:
          'Frontal Slayer\'s onboarding experience increased retention by 23%. Would you like NDXBOOK to review a similar onboarding philosophy?',
        metric: '+23% RETENTION',
        requiresFounderApproval: true,
      },
      {
        id: 'spi-2',
        sourceWorkspaceId: 'ai-media',
        targetWorkspaceId: 'frontal-slayer',
        insight:
          'NDXBOOK editorial board flow reduced founder review time by 40%. Consider adopting for luxury launch campaigns.',
        metric: '-40% REVIEW TIME',
        requiresFounderApproval: true,
      },
    ],
    snapshots: [
      {
        workspaceId: 'frontal-slayer',
        todaysBriefing: 'Launch Week assets ready · 2 approvals pending · Screening Room prepared.',
        unreadExecutiveUpdates: 3,
        pendingApprovals: 2,
        autonomyLevel: 'guided',
        organizationalHealthPct: 94,
        revenueSnapshot: '$42.8K MTD · +12% vs prior',
        recentActivity: 'Brand Concierge completed lace mastery review · 12m ago',
        lastActiveAt: now,
        conciergeStatus: 'briefing-ready',
        isFavorite: true,
        recentlyViewedRank: 2,
      },
      {
        workspaceId: 'ai-media',
        todaysBriefing: 'Page 028 in editorial board · Growth recommends 2PM publish window.',
        unreadExecutiveUpdates: 5,
        pendingApprovals: 1,
        autonomyLevel: 'semi-autonomous',
        organizationalHealthPct: 91,
        revenueSnapshot: '$18.2K MTD · NDXBOOK ritual growth',
        recentActivity: 'Render Queue processing voice generation · live',
        lastActiveAt: now,
        conciergeStatus: 'in-review',
        isFavorite: true,
        recentlyViewedRank: 1,
      },
      {
        workspaceId: 'all-in-one-enterprise',
        todaysBriefing: 'Enterprise campus provisioning complete · CoS awaiting founder walkthrough.',
        unreadExecutiveUpdates: 1,
        pendingApprovals: 0,
        autonomyLevel: 'founder-led',
        organizationalHealthPct: 78,
        revenueSnapshot: 'Pre-revenue · pilot phase',
        recentActivity: 'Company Onboarding Intelligence configured workspace DNA',
        lastActiveAt: now,
        conciergeStatus: 'available',
        isFavorite: false,
      },
      {
        workspaceId: 'vxd-inc',
        todaysBriefing: 'Portfolio governance review · Studio Intelligence cross-workspace insights ready.',
        unreadExecutiveUpdates: 2,
        pendingApprovals: 0,
        autonomyLevel: 'autonomous',
        organizationalHealthPct: 96,
        revenueSnapshot: 'Platform · multi-workspace',
        recentActivity: 'Studio Intelligence prepared portfolio recommendation',
        lastActiveAt: now,
        conciergeStatus: 'available',
        isFavorite: false,
      },
    ],
  };
}

export function readWorkspaceRegistryStore(): WorkspaceRegistryStore {
  if (typeof window === 'undefined') return buildWorkspaceRegistrySeed();
  try {
    const seed = buildWorkspaceRegistrySeed();
    const fullRaw = readStudioOsStorageValue(`${WORKSPACE_REGISTRY_STORAGE_KEY}_full`);
    if (fullRaw) {
      try {
        const full = { ...seed, ...JSON.parse(fullRaw) } as WorkspaceRegistryStore;
        return { ...full, version: WORKSPACE_REGISTRY_VERSION };
      } catch {
        /* fall through */
      }
    }
    const prefs = readStudioOsJson<WorkspaceRegistryPrefs>(WORKSPACE_REGISTRY_STORAGE_KEY, () => ({
      version: WORKSPACE_REGISTRY_VERSION,
      favorites: seed.favorites,
      recentWorkspaceIds: seed.recentWorkspaceIds,
      lastUpdatedAt: seed.lastUpdatedAt,
    }));
    return {
      ...seed,
      ...prefs,
      version: WORKSPACE_REGISTRY_VERSION,
      studioPortfolioInsights: seed.studioPortfolioInsights,
      snapshots: seed.snapshots,
    };
  } catch {
    return buildWorkspaceRegistrySeed();
  }
}

export function writeWorkspaceRegistryStore(store: WorkspaceRegistryStore): void {
  if (typeof window === 'undefined') return;
  writeStudioOsJson(WORKSPACE_REGISTRY_STORAGE_KEY, {
    ...prefsFromStore(store),
    lastUpdatedAt: new Date().toISOString(),
  });
  // Full store (snapshots, insights) lives in memory via writeStudioOsJson guard — not localStorage.
  writeStudioOsJson(`${WORKSPACE_REGISTRY_STORAGE_KEY}_full`, store);
}

export function getWorkspaceSnapshot(workspaceId: string): WorkspaceRegistryStore['snapshots'][number] | null {
  const store = readWorkspaceRegistryStore();
  return store.snapshots.find((s) => s.workspaceId === workspaceId) ?? null;
}

export function recordWorkspaceVisit(workspaceId: string): void {
  const store = readWorkspaceRegistryStore();
  const recent = [workspaceId, ...store.recentWorkspaceIds.filter((id) => id !== workspaceId)].slice(0, 6);
  writeWorkspaceRegistryStore({ ...store, recentWorkspaceIds: recent });
}

export function toggleWorkspaceFavorite(workspaceId: string): void {
  const store = readWorkspaceRegistryStore();
  const favorites = store.favorites.includes(workspaceId)
    ? store.favorites.filter((id) => id !== workspaceId)
    : [...store.favorites, workspaceId];
  writeWorkspaceRegistryStore({ ...store, favorites });
}

export function bootstrapWorkspaceRegistryPlatform(): void {
  /* Snapshots are seeded in memory — no localStorage write required. */
}
