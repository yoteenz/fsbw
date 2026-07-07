/**
 * NDXBook — AI Media workspace bootstrap (Milestone 29.5).
 */

import {
  DEFAULT_BRAND,
  DEFAULT_CREATIVE_DNA,
  DEFAULT_LAUNCH_CHECKLIST,
  DEFAULT_PROGRAMMING,
  DEFAULT_SOCIAL_ACCOUNTS,
  DEFAULT_TALENT_HOSTS,
  DEFAULT_TAXONOMY,
  DEFAULT_VOICE_RULES,
  LAUNCH_VOLUMES,
  NDXBOOK_WORKSPACE_ID,
} from '../../../studio-os-core/ndxbook/constants';
import {
  bootstrapNdxbookStore,
  mergeNdxbookPatch,
  readNdxbookStore,
  refreshNdxbookDashboardMetrics,
} from '../../../studio-os-core/ndxbook/store';
import {
  buildPilotNdxbookStorePatch,
  ensureFounderPilotForOrganization,
  shouldUseFounderPilotSeed,
} from '../../../studio-os-core/founder-pilot-mode';
import {
  readWorkspaceCreationStore,
  writeWorkspaceCreationStore,
} from '../../../studio-os-core/workspace-creation/registry';
import type { NdxbookStore } from '../../../studio-os-core/ndxbook/types';

const WS = NDXBOOK_WORKSPACE_ID;

export function buildNdxbookStorePatch(): Partial<NdxbookStore> {
  if (shouldUseFounderPilotSeed(NDXBOOK_WORKSPACE_ID)) {
    return buildPilotNdxbookStorePatch();
  }
  return {
    brand: DEFAULT_BRAND,
    taxonomy: DEFAULT_TAXONOMY,
    volumes: LAUNCH_VOLUMES,
    programming: DEFAULT_PROGRAMMING,
    programmingSlots: [],
    pages: [],
    talentHosts: DEFAULT_TALENT_HOSTS,
    socialAccounts: DEFAULT_SOCIAL_ACCOUNTS,
    voiceRules: DEFAULT_VOICE_RULES,
    creativeDna: DEFAULT_CREATIVE_DNA,
    launchChecklist: DEFAULT_LAUNCH_CHECKLIST.map((item) => ({ ...item })),
    nextPageNumber: 1,
    dashboard: {
      brand: 'ndxbook',
      positioning: DEFAULT_BRAND.positioning,
      launchVolumes: LAUNCH_VOLUMES.length,
      pagesCreated: 0,
      pagesScheduled: 0,
      socialsConnected: 0,
      labsExperiments: 0,
      nextAction: 'connect socials & create first 10 pages',
    },
  };
}

export function bootstrapAiMediaNdxbook(): void {
  ensureAiMediaNdxbookModuleEnabled();
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  const store = readNdxbookStore();
  // Seed once when registry is empty — never re-merge pilot patch (pages: []) on revisit.
  if (store.brand?.id !== 'ndxbook') {
    bootstrapNdxbookStore();
    mergeNdxbookPatch(buildNdxbookStorePatch());
  }
  refreshNdxbookDashboardMetrics();
}

function ensureAiMediaNdxbookModuleEnabled(): void {
  const store = readWorkspaceCreationStore();
  const idx = store.workspaces.findIndex((w) => w.slug === 'ai-media');
  if (idx < 0) return;
  const ws = store.workspaces[idx];
  if (ws.enabledModules.includes('ndxbook')) return;
  const next = [...store.workspaces];
  next[idx] = {
    ...ws,
    enabledModules: [...ws.enabledModules, 'ndxbook'],
    updatedAt: new Date().toISOString(),
  };
  writeWorkspaceCreationStore({ ...store, workspaces: next });
}

export { WS as NDXBOOK_AI_MEDIA_WORKSPACE_ID };
