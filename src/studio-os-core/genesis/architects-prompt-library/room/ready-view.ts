import {
  APL_ROOM_PATHS,
  APL_ROOM_PATH_LABELS,
  type AplRoomPath,
} from '../constants';
import {
  buildAnalyticsSnapshot,
  buildAplOrbRecommendations,
  buildOrbCuratorBrief,
  buildQualityScores,
  getArchitectsPromptLibraryPlatformStats,
} from '../engines/intelligence-engine';
import {
  buildKnowledgeGraph,
  getDependenciesForPrompt,
  getExecutionTimeline,
  getLineageForPrompt,
  getRelationshipsForPrompt,
  searchPrompts,
} from '../engines/graph-engine';
import { readArchitectsPromptLibraryStore } from '../persistence';
import type { AplReadyView, AplRuntimeInput } from '../types';
import { listPromptTemplates } from '../bootstrap/seed';

export function isValidAplRoomPath(slug: string): slug is AplRoomPath {
  return (APL_ROOM_PATHS as readonly string[]).includes(slug);
}

export function aplRoomPathFromSlug(slug?: string): AplRoomPath {
  if (slug && isValidAplRoomPath(slug)) return slug;
  return 'prompt-library';
}

export function buildArchitectsPromptLibraryReadyView(
  input?: AplRuntimeInput
): AplReadyView {
  const store = readArchitectsPromptLibraryStore();
  const activeRoom = aplRoomPathFromSlug(
    input?.pathname?.split('/').filter(Boolean).pop()
  );
  const selectedPromptId =
    input?.selectedPromptId ?? store.prompts.find((p) => p.lifecycleStage === 'execution')?.promptId;
  const searchResults = input?.searchQuery
    ? searchPrompts(input.searchQuery)
    : listPromptTemplates();
  const { nodes, edges } = buildKnowledgeGraph();

  return {
    activeRoom,
    stats: getArchitectsPromptLibraryPlatformStats(),
    analytics: buildAnalyticsSnapshot(),
    prompts: listPromptTemplates(),
    collections: store.collections,
    versions: store.versions,
    dependencies: store.dependencies,
    relationships: store.relationships,
    executions: store.executions,
    validations: store.validations,
    modelPerformance: store.modelPerformance,
    lessons: store.lessons,
    outputs: store.outputs,
    genesisRefs: store.genesisRefs,
    launchStackRefs: store.launchStackRefs,
    coreSystemRefs: store.coreSystemRefs,
    comparisons: store.comparisons,
    recommendations: buildAplOrbRecommendations(),
    qualityScores: buildQualityScores(),
    graphNodes: nodes,
    graphEdges: edges,
    searchResults,
    selectedPromptId,
    orbLibrarianMode: store.orbLibrarianMode,
    orbCuratorBrief: buildOrbCuratorBrief(selectedPromptId),
    lineageForSelected: selectedPromptId ? getLineageForPrompt(selectedPromptId) : [],
    executionTimeline: getExecutionTimeline(selectedPromptId),
  };
}

export { APL_ROOM_PATH_LABELS, getDependenciesForPrompt, getRelationshipsForPrompt };
