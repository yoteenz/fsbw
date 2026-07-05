import {
  EXECUTIVE_TIMELINE_STORAGE_KEY,
  EXECUTIVE_TIMELINE_VERSION,
  TIMELINE_LAYERS,
  TIMELINE_PHILOSOPHY,
} from './constants';
import { analyzeEventMoveImpact, parseConciergeTimelineCommand } from './intelligence';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type {
  ConciergeTimelineCommand,
  ExecutiveTimelineStore,
  TimelineLayerId,
  TimelineOrganizationId,
  TimelineViewId,
} from './types';

function emptyStore(): ExecutiveTimelineStore {
  return {
    version: EXECUTIVE_TIMELINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeOrganizationId: 'frontal-slayer',
    activeView: 'agenda',
    visibleLayerIds: TIMELINE_LAYERS.map((l) => l.id),
    selectedEventId: null,
    philosophy: [...TIMELINE_PHILOSOPHY],
    events: [],
    morningBriefing: {
      generatedAt: new Date().toISOString(),
      todaysPriorities: [],
      upcomingDeadlines: [],
      executiveMeetings: [],
      publishingSchedule: [],
      travel: [],
      personalCommitments: [],
      recommendedAdjustments: [],
      potentialConflicts: [],
      organizationalHealth: 'Awaiting timeline bootstrap.',
      chiefConciergeSummary: 'Chief Concierge morning briefing will appear here.',
    },
    conciergeCommands: [],
    proactiveRecommendations: [],
    timelineMemory: [],
    pendingImpact: null,
    conversationalInput: '',
  };
}

export function readExecutiveTimelineStore(): ExecutiveTimelineStore {
  return readScopedStore(EXECUTIVE_TIMELINE_STORAGE_KEY, emptyStore);
}

export function writeExecutiveTimelineStore(store: ExecutiveTimelineStore): void {
  writeScopedStore(EXECUTIVE_TIMELINE_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapExecutiveTimelineStore(seed: Partial<ExecutiveTimelineStore>): void {
  const current = readExecutiveTimelineStore();
  if (current.events.length > 0) return;
  writeExecutiveTimelineStore({ ...emptyStore(), ...seed });
}

export function selectTimelineOrganization(orgId: TimelineOrganizationId): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({
    ...store,
    activeOrganizationId: orgId,
    selectedEventId: null,
  });
}

export function setTimelineView(viewId: TimelineViewId): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({ ...store, activeView: viewId });
}

export function toggleTimelineLayer(layerId: TimelineLayerId): void {
  const store = readExecutiveTimelineStore();
  const visible = store.visibleLayerIds.includes(layerId)
    ? store.visibleLayerIds.filter((id) => id !== layerId)
    : [...store.visibleLayerIds, layerId];
  writeExecutiveTimelineStore({ ...store, visibleLayerIds: visible });
}

export function selectTimelineEvent(eventId: string | null): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({ ...store, selectedEventId: eventId });
}

export function setConversationalInput(text: string): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({ ...store, conversationalInput: text });
}

export function submitConciergeCommand(rawText: string, concierge?: string): ConciergeTimelineCommand {
  const store = readExecutiveTimelineStore();
  const parsed = parseConciergeTimelineCommand(rawText, concierge);
  const command: ConciergeTimelineCommand = {
    ...parsed,
    id: `cmd-${Date.now()}`,
    status: 'pending-approval',
    createdAt: new Date().toISOString(),
  };

  const selected = store.selectedEventId
    ? store.events.find((e) => e.id === store.selectedEventId)
    : store.events[0];
  if (selected) {
    command.targetEventId = selected.id;
    command.impact = analyzeEventMoveImpact(store, selected.id, parsed.proposedAction) ?? undefined;
  }

  writeExecutiveTimelineStore({
    ...store,
    conciergeCommands: [command, ...store.conciergeCommands].slice(0, 12),
    pendingImpact: command.impact ?? null,
    lastConciergeResponse: `${command.concierge} parsed: ${command.proposedAction}. Awaiting founder approval before applying.`,
    conversationalInput: '',
  });
  return command;
}

export function approvePendingCommand(commandId: string): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({
    ...store,
    conciergeCommands: store.conciergeCommands.map((c) =>
      c.id === commandId ? { ...c, status: 'applied' as const } : c
    ),
    pendingImpact: null,
    lastConciergeResponse: 'Timeline updated — downstream dependencies reorganized with founder approval.',
  });
}

export function dismissProactiveRecommendation(id: string): void {
  const store = readExecutiveTimelineStore();
  writeExecutiveTimelineStore({
    ...store,
    proactiveRecommendations: store.proactiveRecommendations.map((r) =>
      r.id === id ? { ...r, dismissed: true } : r
    ),
  });
}

export function getVisibleEvents(store: ExecutiveTimelineStore) {
  return store.events.filter((e) => {
    if (store.activeOrganizationId === 'portfolio') return true;
    return e.organizationId === store.activeOrganizationId || e.organizationId === 'portfolio';
  }).filter((e) => store.visibleLayerIds.includes(e.layerId));
}

export function getSelectedEvent(store: ExecutiveTimelineStore) {
  return store.events.find((e) => e.id === store.selectedEventId) ?? null;
}
