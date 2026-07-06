import { explainEventType, queryEventTypes } from './discovery-engine';
import { summarizeEventBus } from './engine-profile-builder';
import { getChainForEvent } from './chain-builder';
import { debugEventFailure, summarizeInspectorState } from './inspector-engine';
import { listEventTypesByVerb } from './event-catalog';
import {
  ensureOrganizationEventBusProfile,
  getOrganizationEventBusProfile,
} from './store';
import type { EventBusDockAdvice } from './types';

export function resolveEventBusAdvice(input: string, organizationId: string): EventBusDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationEventBusProfile(organizationId) ??
    ensureOrganizationEventBusProfile(organizationId);

  if (/event bus|nervous system|publish event|event-driven|loosely coupled/i.test(trimmed)) {
    return {
      response: summarizeEventBus(profile),
      concierge: 'Chief Concierge',
      busScore: profile.busScore,
    };
  }

  if (/customer created|event chain|reaction chain/i.test(trimmed)) {
    const chain = getChainForEvent('customer.created');
    if (chain) {
      return {
        response: `${chain.description} · Total latency ${chain.totalLatencyMs}ms. One event — many intelligent reactions.`,
        concierge: 'Chief Concierge',
        busScore: profile.busScore,
      };
    }
  }

  if (/event inspector|monitor event|replay event|event history/i.test(trimmed)) {
    return {
      response: summarizeInspectorState(profile.eventHistory),
      concierge: 'Chief Concierge',
      busScore: profile.busScore,
    };
  }

  if (/latency|delivery rate|failed event/i.test(trimmed)) {
    const failed = profile.eventHistory.filter((e) => e.status === 'failed').length;
    return {
      response: `Avg latency ${profile.avgLatencyMs}ms · ${profile.eventHistory.length} events in history · ${failed} failures. Use Event Inspector to debug.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/subscribe|subscriber|who listens/i.test(trimmed)) {
    const hits = queryEventTypes(trimmed.replace(/who listens to/i, ''), 1);
    if (hits[0]) {
      const subs = hits[0].entry.subscribers.slice(0, 5).join(' · ') || 'none registered';
      return { response: `${hits[0].entry.name} subscribers: ${subs}.`, concierge: 'Chief Concierge' };
    }
  }

  if (/created|approved|published|failed|completed/i.test(trimmed) && /event type|list event/i.test(trimmed)) {
    const verb = trimmed.includes('approved')
      ? 'approved'
      : trimmed.includes('published')
        ? 'published'
        : trimmed.includes('failed')
          ? 'failed'
          : trimmed.includes('completed')
            ? 'completed'
            : 'created';
    const list = listEventTypesByVerb(verb as Parameters<typeof listEventTypesByVerb>[0]).slice(0, 3);
    return {
      response: `${verb} events: ${list.map((e) => e.name).join(' · ') || 'none'}.`,
      concierge: 'Chief Concierge',
    };
  }

  if (/governance|direct call|coupling|depend directly/i.test(trimmed)) {
    const warnings = profile.governanceFindings.filter((f) => f.severity === 'warning');
    return {
      response:
        warnings.length === 0
          ? 'All systems communicate via Event Bus™ — no direct feature dependencies.'
          : `${warnings.length} coupling findings — ${warnings[0]?.recommendation ?? 'review Event Bus dashboard.'}`,
      concierge: 'Chief Concierge',
      busScore: profile.busScore,
    };
  }

  const explainMatch = trimmed.match(/explain event\s+(.+)/i);
  if (explainMatch) {
    const hits = queryEventTypes(explainMatch[1], 1);
    if (hits[0]) {
      return {
        response: explainEventType(hits[0].entry.eventTypeId) ?? hits[0].entry.description,
        concierge: 'Chief Concierge',
      };
    }
  }

  const debugMatch = profile.eventHistory.find((e) => e.status !== 'delivered');
  if (/debug failure|why did.*fail/i.test(trimmed) && debugMatch) {
    return {
      response: debugEventFailure(debugMatch) ?? 'No failed events in recent history.',
      concierge: 'Chief Concierge',
    };
  }

  const hits = queryEventTypes(trimmed, 3);
  if (hits.length > 0 && /find|search|what is|show event|list event/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.entry.name} (${h.entry.eventTypeId})`).join(' · '),
      concierge: 'Chief Concierge',
      busScore: profile.busScore,
    };
  }

  return null;
}

export function listEventBusDockSuggestions(_organizationId: string): string[] {
  return [
    'Show Event Bus status.',
    'What happens when a customer is created?',
    'Show Event Inspector metrics.',
    'Are systems communicating via events?',
  ].slice(0, 4);
}

export function buildProactiveEventBusSuggestion(organizationId: string): string | null {
  const profile = getOrganizationEventBusProfile(organizationId);
  if (!profile) return null;
  return summarizeEventBus(profile);
}

export function buildEventBusOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationEventBusProfile(organizationId);
  return profile.dockBusLine;
}
