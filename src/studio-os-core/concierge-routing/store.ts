import {
  CONCIERGE_ROUTING_STORAGE_KEY,
  CONCIERGE_ROUTING_VERSION,
  CONCIERGE_DISPLAY_NAMES,
  ROUTING_PHILOSOPHY,
} from './constants';
import {
  buildAskWhyExplanation,
  parseRoutingCorrection,
  routeFounderCommand,
} from './router';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import type {
  ConciergeRoutingId,
  ConciergeRoutingStore,
  FounderCommandRoute,
  RouteCommandContext,
  RoutingIntent,
} from './types';

function emptyStore(): ConciergeRoutingStore {
  return {
    version: CONCIERGE_ROUTING_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    philosophy: [...ROUTING_PHILOSOPHY],
    routingPreferences: [],
    conciergeTrust: Object.keys(CONCIERGE_DISPLAY_NAMES).map((id) => ({
      conciergeId: id as ConciergeRoutingId,
      trustPct: id === 'chief-concierge' ? 92 : 78,
      successfulRoutes: 0,
    })),
    commandHistory: [],
    pendingRoute: null,
    universalCommandInput: '',
  };
}

export function readConciergeRoutingStore(): ConciergeRoutingStore {
  return readScopedStore(CONCIERGE_ROUTING_STORAGE_KEY, emptyStore);
}

export function writeConciergeRoutingStore(store: ConciergeRoutingStore): void {
  writeScopedStore(CONCIERGE_ROUTING_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapConciergeRoutingStore(seed: Partial<ConciergeRoutingStore>): void {
  const current = readConciergeRoutingStore();
  if (current.commandHistory.length > 0) return;
  writeConciergeRoutingStore({ ...emptyStore(), ...seed });
}

export function setUniversalCommandInput(text: string): void {
  const store = readConciergeRoutingStore();
  writeConciergeRoutingStore({ ...store, universalCommandInput: text });
}

export function submitUniversalCommand(
  rawText: string,
  context: Omit<RouteCommandContext, 'workspaceId'> & { workspaceId?: string }
): FounderCommandRoute {
  const store = readConciergeRoutingStore();
  const fullContext: RouteCommandContext = {
    ...context,
    workspaceId: context.workspaceId ?? getRuntimeActiveWorkspaceId(),
  };

  const route = routeFounderCommand(rawText, fullContext, store.routingPreferences);

  writeConciergeRoutingStore({
    ...store,
    pendingRoute: route,
    commandHistory: [route, ...store.commandHistory].slice(0, 20),
    lastRoutingNote: route.routingNote,
    universalCommandInput: '',
  });

  return route;
}

export function approvePendingRoute(): void {
  const store = readConciergeRoutingStore();
  if (!store.pendingRoute) return;

  const updated: FounderCommandRoute = { ...store.pendingRoute, status: 'approved' };
  const trust = store.conciergeTrust.map((t) =>
    t.conciergeId === updated.primaryConciergeId
      ? { ...t, trustPct: Math.min(99, t.trustPct + 1), successfulRoutes: t.successfulRoutes + 1 }
      : t
  );

  writeConciergeRoutingStore({
    ...store,
    pendingRoute: null,
    conciergeTrust: trust,
    commandHistory: store.commandHistory.map((c) => (c.id === updated.id ? { ...updated, status: 'applied' } : c)),
    lastRoutingNote: `${updated.routingNote} Change applied with founder approval.`,
  });
}

export function cancelPendingRoute(): void {
  const store = readConciergeRoutingStore();
  if (!store.pendingRoute) return;
  const id = store.pendingRoute.id;
  writeConciergeRoutingStore({
    ...store,
    pendingRoute: null,
    commandHistory: store.commandHistory.map((c) =>
      c.id === id ? { ...c, status: 'cancelled' as const } : c
    ),
    lastRoutingNote: 'Request cancelled — no timeline changes applied.',
  });
}

export function adjustPendingRoute(note: string): void {
  const store = readConciergeRoutingStore();
  if (!store.pendingRoute) return;
  const adjusted = { ...store.pendingRoute, status: 'adjusted' as const, primaryAction: note };
  writeConciergeRoutingStore({
    ...store,
    pendingRoute: adjusted,
    lastRoutingNote: 'Adjustment noted — awaiting founder approval on revised action.',
  });
}

export function explainPendingRoute(): string {
  const store = readConciergeRoutingStore();
  if (!store.pendingRoute) return 'No pending route to explain.';
  return buildAskWhyExplanation(store.pendingRoute);
}

export function recordRoutingCorrection(rawText: string, intent?: RoutingIntent): ConciergeRoutingId | null {
  const corrected = parseRoutingCorrection(rawText);
  if (!corrected) return null;

  const store = readConciergeRoutingStore();
  const routeIntent = intent ?? store.pendingRoute?.intent ?? 'general';

  const existing = store.routingPreferences.find((p) => p.intent === routeIntent);
  const preferences = existing
    ? store.routingPreferences.map((p) =>
        p.intent === routeIntent
          ? { ...p, preferredConciergeId: corrected, confidenceBoost: p.confidenceBoost + 5, learnedFrom: rawText }
          : p
      )
    : [
        ...store.routingPreferences,
        {
          id: `pref-${Date.now()}`,
          intent: routeIntent,
          preferredConciergeId: corrected,
          learnedFrom: rawText,
          confidenceBoost: 10,
        },
      ];

  let pendingRoute = store.pendingRoute;
  if (pendingRoute) {
    pendingRoute = {
      ...pendingRoute,
      primaryConciergeId: corrected,
      primaryConcierge: CONCIERGE_DISPLAY_NAMES[corrected],
      routingNote: `Rerouted to ${CONCIERGE_DISPLAY_NAMES[corrected]} per founder preference.`,
    };
  }

  writeConciergeRoutingStore({
    ...store,
    routingPreferences: preferences,
    pendingRoute,
    lastRoutingNote: pendingRoute?.routingNote ?? `Routing preference updated: ${CONCIERGE_DISPLAY_NAMES[corrected]}.`,
  });

  return corrected;
}

export function getPendingRoute(): FounderCommandRoute | null {
  return readConciergeRoutingStore().pendingRoute;
}
