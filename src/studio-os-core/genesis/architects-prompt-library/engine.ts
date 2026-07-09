import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import {
  archivePrompt,
  ensureArchitectsPromptLibraryStore,
  getPromptTemplate,
  listArchivedPrompts,
  listPromptTemplates,
  promotePromptToCanon,
  recordArchitectsPromptLibraryOpened,
  seedArchitectsPromptLibraryStore,
  toggleOrbLibrarianMode,
} from './bootstrap/seed';
import {
  buildAnalyticsSnapshot,
  buildAplOrbRecommendations,
  buildOrbCuratorBrief,
  buildQualityScores,
  getArchitectsPromptLibraryPlatformStats,
} from './engines/intelligence-engine';
import {
  buildKnowledgeGraph,
  comparePromptVersions,
  getDependenciesForPrompt,
  getExecutionTimeline,
  getLineageForPrompt,
  getRelationshipsForPrompt,
  searchPrompts,
} from './engines/graph-engine';
import {
  buildArchitectsPromptLibraryReadyView,
  isValidAplRoomPath,
  aplRoomPathFromSlug,
  APL_ROOM_PATH_LABELS,
} from './room/ready-view';
import {
  mutateArchitectsPromptLibraryStore,
  readArchitectsPromptLibraryStore,
} from './persistence';
import {
  APL_SUBSYSTEM_NAME,
  APL_SUBSYSTEM_VERSION,
  APL_ROOM_PATHS,
  APL_PROMPT_CATEGORY_LABELS,
} from './constants';

export function ensureArchitectsPromptLibrarySubsystem() {
  const store = ensureArchitectsPromptLibraryStore();
  if (store.seededAt) {
    updateBuildOrderSystemStatus('architects-prompt-library', 'implemented');
  }
  return store;
}

export function getArchitectsPromptLibraryReadyView(input?: {
  pathname?: string;
  searchQuery?: string;
  selectedPromptId?: string;
  founderDisplayName?: string;
}) {
  ensureArchitectsPromptLibrarySubsystem();
  recordArchitectsPromptLibraryOpened();
  return buildArchitectsPromptLibraryReadyView(input);
}

export {
  APL_SUBSYSTEM_NAME,
  APL_SUBSYSTEM_VERSION,
  APL_ROOM_PATHS,
  APL_ROOM_PATH_LABELS,
  APL_PROMPT_CATEGORY_LABELS,
  isValidAplRoomPath,
  aplRoomPathFromSlug,
  readArchitectsPromptLibraryStore,
  mutateArchitectsPromptLibraryStore,
  seedArchitectsPromptLibraryStore,
  ensureArchitectsPromptLibraryStore,
  recordArchitectsPromptLibraryOpened,
  buildArchitectsPromptLibraryReadyView,
  getArchitectsPromptLibraryPlatformStats,
  buildAnalyticsSnapshot,
  buildQualityScores,
  buildAplOrbRecommendations,
  buildOrbCuratorBrief,
  buildKnowledgeGraph,
  searchPrompts,
  listPromptTemplates,
  listArchivedPrompts,
  getPromptTemplate,
  getLineageForPrompt,
  getExecutionTimeline,
  getDependenciesForPrompt,
  getRelationshipsForPrompt,
  comparePromptVersions,
  promotePromptToCanon,
  archivePrompt,
  toggleOrbLibrarianMode,
};

export type {
  AplStore,
  AplReadyView,
  AplPlatformStats,
  AplPromptTemplate,
  AplPromptCollection,
  AplPromptVersion,
  AplExecutionRecord,
  AplValidationResult,
  AplModelPerformanceRecord,
  AplRecommendation,
  AplAnalyticsSnapshot,
  AplQualityScore,
  AplGraphNode,
  AplGraphEdge,
  AplDependency,
  AplPromptRelationship,
  AplVersionComparison,
  AplLessonLearned,
  AplGeneratedOutput,
  AplGenesisReference,
  AplRuntimeInput,
} from './types';

export type { AplRoomPath, AplPromptCategory, AplSupportedModel } from './constants';
