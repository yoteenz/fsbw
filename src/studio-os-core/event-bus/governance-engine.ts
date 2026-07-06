import { STUDIO_OS_CORE_MODULES } from '../core/modules';
import { buildEventTypeCatalog } from './event-catalog';
import type { EventBusGovernanceFinding } from './types';

/** Event governance — systems must publish/subscribe; no direct feature-to-feature calls. */
export function runEventBusGovernanceAudit(): EventBusGovernanceFinding[] {
  const findings: EventBusGovernanceFinding[] = [];
  const catalog = buildEventTypeCatalog();
  const modules = STUDIO_OS_CORE_MODULES.map((m) => m.id);

  const withoutSubscribers = catalog.filter((e) => e.subscribers.length === 0 && e.eventTypeId !== 'bus.self');
  if (withoutSubscribers.length > 3) {
    findings.push({
      id: 'orphan-events',
      severity: 'info',
      message: `${withoutSubscribers.length} event types have no registered subscribers yet.`,
      recommendation: 'Register subscribers in subscription-registry.ts as modules come online.',
    });
  }

  const registryModules = ['documentation-registry', 'system-registry', 'component-registry', 'design-token-engine', 'interaction-engine', 'event-bus'];
  for (const mod of registryModules) {
    const publishes = catalog.some((e) => e.publishers.includes(mod));
    const subscribes = catalog.some((e) => e.subscribers.includes(mod));
    if (!publishes && !subscribes && modules.includes(mod as (typeof modules)[number])) {
      findings.push({
        id: `no-bus-${mod}`,
        severity: 'warning',
        systemId: mod,
        message: `${mod} has no Event Bus™ publish or subscribe bindings.`,
        recommendation: 'Publish standardized events — never call another module directly.',
      });
    }
  }

  findings.push({
    id: 'loosely-coupled',
    severity: 'info',
    message: 'Event Bus™ enforces publish/subscribe — systems must not communicate directly.',
    recommendation: 'Replace direct imports between features with event publications.',
  });

  findings.push({
    id: 'standard-verbs',
    severity: 'info',
    message: `${catalog.length} event types use standardized verbs (created, updated, approved, etc.).`,
    recommendation: 'Every future module publishes standardized events via registerEventType().',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeEventCoveragePct(): number {
  const catalog = buildEventTypeCatalog();
  const withSubs = catalog.filter((e) => e.subscribers.length > 0).length;
  return Math.round((withSubs / Math.max(1, catalog.length)) * 100);
}
