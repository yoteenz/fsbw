import { EVENT_LATENCY_BASELINE_MS } from './constants';
import type { EventChain } from './types';

/** Canonical event reaction chains — one event, many intelligent reactions. */
export function buildEventChains(): EventChain[] {
  return [
    {
      chainId: 'chain-customer-created',
      triggerEvent: 'customer.created',
      description: 'Customer Created → Executive Timeline → Memory Engine → Organization Pulse → Documentation Registry → Command Dock → Notifications → Automation → Analytics → Search',
      links: [
        { order: 1, systemId: 'event-bus', systemLabel: 'Event Bus™', reaction: 'Publish customer.created', latencyMs: 2 },
        { order: 2, systemId: 'executive-timeline', systemLabel: 'Executive Timeline™', reaction: 'Append customer milestone', latencyMs: EVENT_LATENCY_BASELINE_MS },
        { order: 3, systemId: 'memory-engine', systemLabel: 'Memory Engine™', reaction: 'Record customer memory', latencyMs: EVENT_LATENCY_BASELINE_MS + 4 },
        { order: 4, systemId: 'organization-pulse', systemLabel: 'Organization Pulse™', reaction: 'Update customer pulse indicator', latencyMs: EVENT_LATENCY_BASELINE_MS + 8 },
        { order: 5, systemId: 'documentation-registry', systemLabel: 'Documentation Registry™', reaction: 'Sync customer docs metadata', latencyMs: EVENT_LATENCY_BASELINE_MS + 11 },
        { order: 6, systemId: 'command-dock', systemLabel: 'Command Dock™', reaction: 'Proactive customer briefing line', latencyMs: EVENT_LATENCY_BASELINE_MS + 15 },
        { order: 7, systemId: 'notifications', systemLabel: 'Notifications™', reaction: 'Notify assigned team', latencyMs: EVENT_LATENCY_BASELINE_MS + 18 },
        { order: 8, systemId: 'automation-registry', systemLabel: 'Automation Registry™', reaction: 'Trigger onboarding workflow', latencyMs: EVENT_LATENCY_BASELINE_MS + 22 },
        { order: 9, systemId: 'analytics', systemLabel: 'Analytics™', reaction: 'Record customer acquisition metric', latencyMs: EVENT_LATENCY_BASELINE_MS + 25 },
        { order: 10, systemId: 'search', systemLabel: 'Search™', reaction: 'Index customer entity', latencyMs: EVENT_LATENCY_BASELINE_MS + 28 },
      ],
      totalLatencyMs: EVENT_LATENCY_BASELINE_MS + 28,
    },
    {
      chainId: 'chain-module-registered',
      triggerEvent: 'module.registered',
      description: 'Module Registered → Documentation Registry → Documentation Governance → Component Registry → Design Token Engine → Interaction Engine',
      links: [
        { order: 1, systemId: 'system-registry', systemLabel: 'System Registry™', reaction: 'Publish module.registered', latencyMs: 3 },
        { order: 2, systemId: 'documentation-registry', systemLabel: 'Documentation Registry™', reaction: 'Register doc metadata', latencyMs: EVENT_LATENCY_BASELINE_MS },
        { order: 3, systemId: 'documentation-governance', systemLabel: 'Documentation Governance™', reaction: 'Run coverage audit', latencyMs: EVENT_LATENCY_BASELINE_MS + 6 },
        { order: 4, systemId: 'component-registry', systemLabel: 'Component Registry™', reaction: 'Index module UI assets', latencyMs: EVENT_LATENCY_BASELINE_MS + 12 },
        { order: 5, systemId: 'design-token-engine', systemLabel: 'Design Token Engine™', reaction: 'Validate token inheritance', latencyMs: EVENT_LATENCY_BASELINE_MS + 18 },
        { order: 6, systemId: 'interaction-engine', systemLabel: 'Interaction Engine™', reaction: 'Audit interaction patterns', latencyMs: EVENT_LATENCY_BASELINE_MS + 24 },
      ],
      totalLatencyMs: EVENT_LATENCY_BASELINE_MS + 24,
    },
    {
      chainId: 'chain-workflow-approved',
      triggerEvent: 'workflow.approved',
      description: 'Workflow Approved → Automation Registry → Notifications → Analytics → Memory Engine',
      links: [
        { order: 1, systemId: 'automation-registry', systemLabel: 'Automation Registry™', reaction: 'Execute approved workflow', latencyMs: EVENT_LATENCY_BASELINE_MS },
        { order: 2, systemId: 'notifications', systemLabel: 'Notifications™', reaction: 'Notify stakeholders', latencyMs: EVENT_LATENCY_BASELINE_MS + 5 },
        { order: 3, systemId: 'analytics', systemLabel: 'Analytics™', reaction: 'Record approval metric', latencyMs: EVENT_LATENCY_BASELINE_MS + 9 },
        { order: 4, systemId: 'memory-engine', systemLabel: 'Memory Engine™', reaction: 'Preserve approval decision', latencyMs: EVENT_LATENCY_BASELINE_MS + 14 },
      ],
      totalLatencyMs: EVENT_LATENCY_BASELINE_MS + 14,
    },
  ];
}

export function getEventChain(chainId: string): EventChain | undefined {
  return buildEventChains().find((c) => c.chainId === chainId);
}

export function getChainForEvent(eventTypeId: string): EventChain | undefined {
  return buildEventChains().find((c) => c.triggerEvent === eventTypeId);
}
