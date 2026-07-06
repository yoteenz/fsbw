import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import {
  FOUNDER_MILESTONE_LABELS,
  FOUNDER_PILOT_MODE_STORAGE_KEY,
  FOUNDER_PILOT_MODE_VERSION,
} from './constants';
import type { FounderPilotModeStore, FounderTimelineMilestone, FounderTimelineMilestoneId } from './types';

function emptyStore(organizationId: string): FounderPilotModeStore {
  return {
    version: FOUNDER_PILOT_MODE_VERSION,
    organizationId,
    enabled: false,
    activatedAt: new Date().toISOString(),
    pagesPublished: 0,
    followers: 0,
    knowledgeAssets: 0,
    milestones: [],
  };
}

export function readFounderPilotModeStore(organizationId?: string): FounderPilotModeStore {
  const orgId = organizationId ?? 'ai-media';
  return readScopedStore(FOUNDER_PILOT_MODE_STORAGE_KEY, () => emptyStore(orgId), orgId);
}

export function writeFounderPilotModeStore(store: FounderPilotModeStore): void {
  writeScopedStore(FOUNDER_PILOT_MODE_STORAGE_KEY, store, store.organizationId);
}

export function isFounderPilotModeActive(organizationId: string): boolean {
  const store = readFounderPilotModeStore(organizationId);
  return store.enabled;
}

export function enableFounderPilotMode(organizationId: string): FounderPilotModeStore {
  const existing = readFounderPilotModeStore(organizationId);
  if (existing.enabled) return existing;

  const store: FounderPilotModeStore = {
    ...existing,
    organizationId,
    enabled: true,
    activatedAt: new Date().toISOString(),
    pagesPublished: 0,
    followers: 0,
    knowledgeAssets: 0,
    milestones: [
      {
        id: 'organization-created',
        label: FOUNDER_MILESTONE_LABELS['organization-created'] ?? 'Organization Created',
        description: 'Founder Pilot Mode activated — every metric begins at zero.',
        recordedAt: new Date().toISOString(),
      },
    ],
  };
  writeFounderPilotModeStore(store);
  return store;
}

export function recordFounderMilestone(
  organizationId: string,
  id: FounderTimelineMilestoneId,
  partial?: Partial<FounderTimelineMilestone>
): FounderTimelineMilestone | null {
  const store = readFounderPilotModeStore(organizationId);
  if (!store.enabled) return null;
  if (store.milestones.some((m) => m.id === id)) return null;

  const milestone: FounderTimelineMilestone = {
    id,
    label: FOUNDER_MILESTONE_LABELS[id] ?? id,
    description: partial?.description ?? FOUNDER_MILESTONE_LABELS[id] ?? id,
    recordedAt: new Date().toISOString(),
    pageNumber: partial?.pageNumber,
    metadata: partial?.metadata,
  };

  writeFounderPilotModeStore({
    ...store,
    milestones: [milestone, ...store.milestones],
  });
  return milestone;
}

export function syncFounderPilotMetrics(organizationId: string, patch: Partial<Pick<FounderPilotModeStore, 'pagesPublished' | 'followers' | 'knowledgeAssets'>>): void {
  const store = readFounderPilotModeStore(organizationId);
  if (!store.enabled) return;
  writeFounderPilotModeStore({ ...store, ...patch });
}

export function getFounderPublishedCount(organizationId: string): number {
  return readFounderPilotModeStore(organizationId).pagesPublished;
}

export function getIntelligenceMaturityIndex(publishedCount: number): number {
  if (publishedCount >= 500) return 4;
  if (publishedCount >= 100) return 3;
  if (publishedCount >= 25) return 2;
  if (publishedCount >= 5) return 1;
  return 0;
}
