import {
  approvePendingRoute,
  cancelPendingRoute,
  explainPendingRoute,
  readConciergeRoutingStore,
  recordRoutingCorrection,
  submitUniversalCommand,
} from '../concierge-routing/store';
import { buildAskWhyExplanation } from '../concierge-routing/router';
import type { FounderCommandRoute } from '../concierge-routing/types';
import { readExecutiveTimelineStore } from '../executive-timeline/store';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import {
  COMMAND_DOCK_STORAGE_KEY,
  COMMAND_DOCK_VERSION,
  COMMAND_DOCK_PHILOSOPHY,
} from './constants';
import { MICRO_MOMENT_LABELS } from '../living-headquarters-presence/constants';
import { resolveDockContext } from './context';
import { resolveExecutiveGrowthAdvice, buildProactiveGrowthSuggestion } from '../monetization-architecture/dock-advisor';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type {
  CommandDockStore,
  CommandHistoryEntry,
  DockContextProfile,
  DockExpansionSize,
} from './types';

function emptyStore(): CommandDockStore {
  return {
    version: COMMAND_DOCK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    philosophy: [...COMMAND_DOCK_PHILOSOPHY],
    expansionSize: 'compact',
    dockInput: '',
    isFocused: false,
    processingActive: false,
    activeMicrointeraction: null,
    microinteractionQueue: [],
    pendingRoute: null,
    askWhyAnswer: null,
    lastRoutingSummary: null,
    proactiveSuggestion: null,
    recentCommands: [],
    favoriteCommands: [],
    recurringCommands: [],
    recommendedAutomations: [],
    showHistoryPanel: false,
    contextProfile: null,
  };
}

export function readCommandDockStore(): CommandDockStore {
  return readScopedStore(COMMAND_DOCK_STORAGE_KEY, emptyStore);
}

export function writeCommandDockStore(store: CommandDockStore): void {
  writeScopedStore(COMMAND_DOCK_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapCommandDockStore(seed: Partial<CommandDockStore>): void {
  const current = readCommandDockStore();
  if (current.recentCommands.length > 0) return;
  writeCommandDockStore({ ...emptyStore(), ...seed });
}

export function syncDockContext(pathname: string): DockContextProfile {
  const profile = resolveDockContext(pathname);
  const store = readCommandDockStore();
  const growth = buildProactiveGrowthSuggestion(getRuntimeActiveWorkspaceId());
  const proactiveSuggestion = growth
    ? {
        id: `growth-${Date.now()}`,
        insight: growth.response,
        concierge: growth.concierge,
        suggestedCommand: growth.suggestedCommand,
      }
    : store.proactiveSuggestion;
  writeCommandDockStore({ ...store, contextProfile: profile, proactiveSuggestion });
  return profile;
}

export function setDockInput(text: string): void {
  const store = readCommandDockStore();
  writeCommandDockStore({ ...store, dockInput: text });
}

export function setDockFocused(focused: boolean): void {
  const store = readCommandDockStore();
  const expansionSize: DockExpansionSize = focused && store.expansionSize === 'compact' ? 'medium' : store.expansionSize;
  writeCommandDockStore({ ...store, isFocused: focused, expansionSize });
}

export function setDockExpansion(size: DockExpansionSize): void {
  const store = readCommandDockStore();
  writeCommandDockStore({ ...store, expansionSize: size });
}

export function toggleDockHistory(): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    showHistoryPanel: !store.showHistoryPanel,
    expansionSize: !store.showHistoryPanel ? 'large' : 'compact',
  });
}

function buildRoutingSummary(route: FounderCommandRoute): string {
  const concierges = [route.primaryConcierge, ...route.supportingConcierges];
  const depCount = route.impactPreview?.affectedDependencies.length ?? 0;
  const lines = concierges.map((c) => `${c}\nRouting request…`);
  if (depCount > 0) {
    lines.push(`${depCount} organizational dependenc${depCount === 1 ? 'y' : 'ies'} identified.`);
  }
  return lines.join('\n');
}

function expansionForRoute(route: FounderCommandRoute): DockExpansionSize {
  if (route.impactPreview && (route.impactPreview.affectedEventTitles.length > 0 || route.requiresFounderApproval)) {
    return 'large';
  }
  if (route.clarificationQuestion) return 'medium';
  return 'medium';
}

export function submitDockCommand(rawText: string, pathname: string): FounderCommandRoute | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const growthAdvice = resolveExecutiveGrowthAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (growthAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${growthAdvice.concierge}\n${growthAdvice.response}`,
    });
    return null;
  }

  const correction = recordRoutingCorrection(trimmed);
  if (correction) {
    const routingStore = readConciergeRoutingStore();
    const route = routingStore.pendingRoute;
    if (route) {
      const store = readCommandDockStore();
      writeCommandDockStore({
        ...store,
        pendingRoute: route,
        lastRoutingSummary: route.routingNote,
        dockInput: '',
        expansionSize: 'medium',
      });
      return route;
    }
  }

  const store = readCommandDockStore();
  const timeline = readExecutiveTimelineStore();
  const contextProfile = store.contextProfile ?? resolveDockContext(pathname);

  writeCommandDockStore({
    ...store,
    processingActive: true,
    activeMicrointeraction: MICRO_MOMENT_LABELS[0],
    microinteractionQueue: [...MICRO_MOMENT_LABELS],
    expansionSize: 'medium',
    askWhyAnswer: null,
    dockInput: trimmed,
  });

  const route = submitUniversalCommand(trimmed, {
    workspaceId: getRuntimeActiveWorkspaceId(),
    activeOrganizationId: contextProfile.portfolioMode ? 'portfolio' : timeline.activeOrganizationId,
    events: timeline.events,
    selectedEventId: timeline.selectedEventId,
  });

  const historyEntry: CommandHistoryEntry = {
    id: route.id,
    rawText: trimmed,
    routedAt: route.createdAt,
    primaryConcierge: route.primaryConcierge,
    intent: route.intent,
    status: 'pending',
  };

  writeCommandDockStore({
    ...readCommandDockStore(),
    processingActive: false,
    activeMicrointeraction: null,
    microinteractionQueue: [],
    pendingRoute: route,
    lastRoutingSummary: buildRoutingSummary(route),
    dockInput: '',
    expansionSize: expansionForRoute(route),
    recentCommands: [historyEntry, ...store.recentCommands].slice(0, 12),
  });

  return route;
}

export function advanceMicrointeraction(): void {
  const store = readCommandDockStore();
  if (!store.processingActive || store.microinteractionQueue.length === 0) return;
  const [, ...rest] = store.microinteractionQueue;
  writeCommandDockStore({
    ...store,
    activeMicrointeraction: rest[0] ?? null,
    microinteractionQueue: rest,
  });
}

export function approveDockCommand(): void {
  const store = readCommandDockStore();
  approvePendingRoute();
  writeCommandDockStore({
    ...store,
    pendingRoute: null,
    expansionSize: 'compact',
    isFocused: false,
    lastRoutingSummary: 'Change applied with founder approval.',
    recentCommands: store.recentCommands.map((c) =>
      c.id === store.pendingRoute?.id ? { ...c, status: 'applied' as const } : c
    ),
  });
}

export function cancelDockCommand(): void {
  const store = readCommandDockStore();
  cancelPendingRoute();
  writeCommandDockStore({
    ...store,
    pendingRoute: null,
    expansionSize: 'compact',
    isFocused: false,
    askWhyAnswer: null,
    lastRoutingSummary: 'Request cancelled.',
    recentCommands: store.recentCommands.map((c) =>
      c.id === store.pendingRoute?.id ? { ...c, status: 'cancelled' as const } : c
    ),
  });
}

export function modifyDockCommand(note: string): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    dockInput: note || store.dockInput,
    isFocused: true,
    expansionSize: 'medium',
    lastRoutingSummary: 'Adjust your command and send again.',
  });
}

export function askWhyDockCommand(): void {
  const store = readCommandDockStore();
  const answer = store.pendingRoute
    ? buildAskWhyExplanation(store.pendingRoute)
    : explainPendingRoute();
  writeCommandDockStore({ ...store, askWhyAnswer: answer, expansionSize: 'large' });
}

export function dismissDockToCompact(): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    expansionSize: 'compact',
    isFocused: false,
    showHistoryPanel: false,
    pendingRoute: null,
    askWhyAnswer: null,
  });
}

export function runFavoriteCommand(rawText: string, pathname: string): FounderCommandRoute | null {
  return submitDockCommand(rawText, pathname);
}
