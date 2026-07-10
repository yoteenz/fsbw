import type { SubscriptionEdge, SubscriptionLoop } from '../types';
import { recordFlightEvent } from '../flight-recorder/recorder';
import {
  decrementActiveSubscriptions,
  incrementActiveSubscriptions,
} from '../flight-recorder/context-snapshot';

const edges = new Map<string, SubscriptionEdge>();
const adjacency = new Map<string, Set<string>>();

function ensureEdge(publisher: string): SubscriptionEdge {
  let edge = edges.get(publisher);
  if (!edge) {
    edge = { publisher, subscribers: [], sideEffects: [], furtherEvents: [] };
    edges.set(publisher, edge);
    adjacency.set(publisher, new Set());
  }
  return edge;
}

export function recordSubscriptionAttach(
  publisher: string,
  subscriber: string,
  sideEffect?: string,
  furtherEvent?: string
): void {
  incrementActiveSubscriptions();
  const edge = ensureEdge(publisher);
  if (!edge.subscribers.includes(subscriber)) edge.subscribers.push(subscriber);
  if (sideEffect && !edge.sideEffects.includes(sideEffect)) edge.sideEffects.push(sideEffect);
  if (furtherEvent && !edge.furtherEvents.includes(furtherEvent)) edge.furtherEvents.push(furtherEvent);
  adjacency.get(publisher)?.add(subscriber);

  recordFlightEvent('SUBSCRIPTION_ATTACHED', publisher, {
    detail: { subscriber, sideEffect, furtherEvent },
  });
  recordFlightEvent('SUBSCRIPTION_CREATED', publisher, {
    detail: { subscriber, sideEffect, furtherEvent },
  });
}

export function recordSubscriptionDetach(publisher: string, subscriber: string): void {
  decrementActiveSubscriptions();
  recordFlightEvent('SUBSCRIPTION_DETACHED', publisher, { detail: { subscriber } });
  recordFlightEvent('SUBSCRIPTION_DESTROYED', publisher, { detail: { subscriber } });
}

/** Install passive listeners on known publishers. */
export function installSubscriptionGraphMonitor(): () => void {
  const publishers: Array<{ event: string; publisher: string; mapsTo?: string }> = [
    { event: 'genesis-updated', publisher: 'genesis/persistence/store', mapsTo: 'STORE_UPDATED' },
    { event: 'studio-os-scene-stack-hydrated', publisher: 'scene-stack', mapsTo: 'SCENE_STACK_UPDATED' },
    { event: 'studio-os-boot-updated', publisher: 'studio-kernel' },
    { event: 'signInStateChanged', publisher: 'auth-session', mapsTo: 'AUTH_COMPLETED' },
    { event: 'studio-os-experience-engine-updated', publisher: 'experience-engine/store' },
  ];

  const handlers: Array<{ event: string; fn: EventListener }> = [];

  for (const { event, publisher, mapsTo } of publishers) {
    const fn = (ev: Event) => {
      recordSubscriptionAttach(publisher, `window:${event}`, 'event-dispatch', mapsTo);
      if (mapsTo) {
        recordFlightEvent(mapsTo as import('../types').FlightEventType, publisher, {
          detail: { eventType: ev.type },
        });
      }
    };
    window.addEventListener(event, fn);
    handlers.push({ event, fn });
  }

  return () => {
    for (const { event, fn } of handlers) {
      window.removeEventListener(event, fn);
    }
  };
}

export function getSubscriptionGraph(): SubscriptionEdge[] {
  return [...edges.values()];
}

/** Detect simple cycles in subscription graph (publisher → subscriber → publisher). */
export function detectSubscriptionLoops(): SubscriptionLoop[] {
  const loops: SubscriptionLoop[] = [];
  for (const [pub, subs] of adjacency) {
    for (const sub of subs) {
      const subTargets = adjacency.get(sub);
      if (subTargets?.has(pub)) {
        loops.push({
          cycle: [pub, sub, pub],
          evidence: `${pub} ↔ ${sub} mutual subscription`,
        });
      }
    }
  }
  return loops;
}
