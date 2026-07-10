import { updateBuildOrderSystemStatus } from '../build-order/build-order/registry';
import { ensureExecutiveHeadquartersSubsystem } from '../executive-headquarters/engine';
import {
  ensureOrbStore,
  recordOrbOpened,
  seedOrbStore,
  updateOrbSessionPath,
  buildOrbQuickActions,
} from './bootstrap/seed';
import { buildOrbContextBundle } from './context/context-engine';
import { resolveOrbAttentionState } from './attention/attention-engine';
import { buildOrbExecutiveBriefing } from './briefings/briefing-engine';
import {
  buildOrbRecommendations,
  overrideOrbRecommendation,
} from './recommendations/recommendation-engine';
import { buildOrbMissionAdvice } from './missions/mission-advisor';
import { buildOrbKnowledgeResults } from './knowledge/knowledge-retrieval';
import { buildOrbCreativeInsights } from './creative/creative-partner';
import { buildOrbDecisionDrafts } from './decisions/decision-support';
import {
  appendOrbConversationEntry,
  listOrbConversationTimeline,
  recordFounderOrbMessage,
  recordOrbResponse,
} from './conversation/timeline';
import {
  listOrbMemoryEntries,
  listOrbMemoryByTier,
  proposeOrbMemoryWrite,
} from './memory/memory-engine';
import { readOrbStore, mutateOrbStore } from './persistence';
import {
  ORB_SUBSYSTEM_NAME,
  ORB_SUBSYSTEM_VERSION,
  type OrbRole,
} from './constants';
import type { OrbPlatformStats, OrbReadyView, OrbRuntimeInput } from './types';

const DEFAULT_INPUT: OrbRuntimeInput = { pathname: '/admin/studio/overview' };

export function ensureOrbSubsystem(input: OrbRuntimeInput = DEFAULT_INPUT) {
  ensureExecutiveHeadquartersSubsystem();
  const store = ensureOrbStore(input);
  if (store.seededAt) {
    updateBuildOrderSystemStatus('orb', 'implemented');
  }
  return store;
}

export function getOrbPlatformStats(input: OrbRuntimeInput = DEFAULT_INPUT): OrbPlatformStats {
  ensureOrbSubsystem(input);
  const store = readOrbStore();
  const recommendations = buildOrbRecommendations();
  return {
    memoryCount: store.memoryEntries.length,
    conversationCount: store.conversationTimeline.length,
    recommendationCount: recommendations.length,
    missionAdviceCount: buildOrbMissionAdvice().length,
    presenceState: store.session?.presenceState ?? 'idle',
    activeRole: store.session?.activeRole ?? 'executive-advisor',
  };
}

function assembleOrbReadyView(input: OrbRuntimeInput): OrbReadyView {
  ensureOrbSubsystem(input);

  const context = buildOrbContextBundle(input);
  const attention = resolveOrbAttentionState(input);
  const briefing = buildOrbExecutiveBriefing(input);
  const recommendations = buildOrbRecommendations();
  const store = readOrbStore();

  const session = store.session ?? {
    sessionId: 'orb-session-fallback',
    actorIdentityId: context.actorIdentityId,
    companyIdentityId: context.companyIdentityId,
    presenceState: attention.presenceState,
    activeRole: 'executive-advisor' as OrbRole,
    pathname: input.pathname,
    startedAt: new Date().toISOString(),
    lastInteractionAt: new Date().toISOString(),
  };

  return {
    context,
    attention,
    briefing,
    recommendations,
    missionAdvice: buildOrbMissionAdvice(),
    knowledgeResults: buildOrbKnowledgeResults(),
    creativeInsights: buildOrbCreativeInsights(input.pathname),
    decisionDrafts: buildOrbDecisionDrafts(),
    memoryTimeline: listOrbMemoryEntries(),
    conversationTimeline: listOrbConversationTimeline(),
    quickActions: buildOrbQuickActions(),
    session: { ...session, presenceState: attention.presenceState },
  };
}

/** Idempotent route sync — only persists when pathname or derived presence actually changes. */
export function syncOrbRouteContext(input: OrbRuntimeInput): void {
  ensureOrbSubsystem(input);
  const attention = resolveOrbAttentionState(input);
  mutateOrbStore((current) => {
    const session = current.session;
    if (!session) return current;
    const pathnameChanged = session.pathname !== input.pathname;
    const presenceChanged = session.presenceState !== attention.presenceState;
    if (!pathnameChanged && !presenceChanged) return current;
    return {
      ...current,
      session: {
        ...session,
        pathname: input.pathname,
        presenceState: attention.presenceState,
      },
    };
  });
}

/** Read-only Orb view for React render — no genesis persistence during render. */
export function buildOrbReadyViewSnapshot(input: OrbRuntimeInput): OrbReadyView {
  return assembleOrbReadyView(input);
}

/** Imperative Orb read — syncs route context once, then returns snapshot. */
export function getOrbReadyView(input: OrbRuntimeInput): OrbReadyView {
  syncOrbRouteContext(input);
  return assembleOrbReadyView(input);
}

export {
  ORB_SUBSYSTEM_NAME,
  ORB_SUBSYSTEM_VERSION,
  readOrbStore,
  mutateOrbStore,
  seedOrbStore,
  ensureOrbStore,
  recordOrbOpened,
  updateOrbSessionPath,
  buildOrbContextBundle,
  resolveOrbAttentionState,
  buildOrbExecutiveBriefing,
  buildOrbRecommendations,
  overrideOrbRecommendation,
  buildOrbMissionAdvice,
  buildOrbKnowledgeResults,
  buildOrbCreativeInsights,
  buildOrbDecisionDrafts,
  listOrbMemoryEntries,
  listOrbMemoryByTier,
  proposeOrbMemoryWrite,
  listOrbConversationTimeline,
  appendOrbConversationEntry,
  recordFounderOrbMessage,
  recordOrbResponse,
  buildOrbQuickActions,
};

export type {
  OrbReadyView,
  OrbPlatformStats,
  OrbRuntimeInput,
  OrbStore,
  OrbContextBundle,
  OrbRecommendationCard,
  OrbExecutiveBriefing,
  OrbMissionAdvice,
  OrbKnowledgeResult,
  OrbCreativeInsight,
  OrbDecisionDraft,
  OrbMemoryEntry,
  OrbConversationEntry,
  OrbQuickAction,
  OrbAttentionState,
  OrbSessionState,
} from './types';

export type { OrbPresenceState, OrbRole, OrbMemoryTier, OrbConversationKind } from './constants';
