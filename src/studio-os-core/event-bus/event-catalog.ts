import { EVENT_BUS_ACCENT } from './constants';
import type { EventDomain, EventTypeDefinition, StandardEventVerb } from './types';

function eventType(
  partial: Pick<EventTypeDefinition, 'eventTypeId' | 'name' | 'verb' | 'domain' | 'description' | 'payloadSchema'> &
    Partial<EventTypeDefinition>
): EventTypeDefinition {
  return {
    publishers: partial.publishers ?? ['Studio OS Platform'],
    subscribers: partial.subscribers ?? [],
    platformStandard: partial.platformStandard ?? true,
    ...partial,
  };
}

/** Canonical Event Bus™ type catalog — standardized publish/subscribe contracts. */
export function buildEventTypeCatalog(): EventTypeDefinition[] {
  const types: EventTypeDefinition[] = [
    // Organization & customer
    eventType({
      eventTypeId: 'customer.created',
      name: 'Customer Created',
      verb: 'created',
      domain: 'customer',
      description: 'New customer record created — triggers timeline, memory, pulse, and notification reactions.',
      payloadSchema: '{ customerId, name, source, createdAt }',
      publishers: ['CRM', 'Knowledge Commerce'],
      subscribers: ['executive-timeline', 'memory-engine', 'organization-pulse', 'documentation-registry', 'command-dock', 'notifications', 'automation-registry', 'analytics', 'search'],
    }),
    eventType({
      eventTypeId: 'customer.updated',
      name: 'Customer Updated',
      verb: 'updated',
      domain: 'customer',
      description: 'Customer profile or relationship changed.',
      payloadSchema: '{ customerId, fields[], updatedAt }',
      subscribers: ['memory-engine', 'relationship-memory', 'search'],
    }),
    eventType({
      eventTypeId: 'organization.created',
      name: 'Organization Created',
      verb: 'created',
      domain: 'organization',
      description: 'New organization onboarded via Blueprint or Inauguration.',
      payloadSchema: '{ organizationId, name, industry }',
      publishers: ['business-discovery-blueprint', 'organization-inauguration'],
      subscribers: ['system-registry', 'documentation-registry', 'mission-control', 'profession-brain'],
    }),

    // Module & registry
    eventType({
      eventTypeId: 'module.registered',
      name: 'Module Registered',
      verb: 'created',
      domain: 'module',
      description: 'New Studio OS module indexed in System Registry.',
      payloadSchema: '{ moduleId, label, route }',
      publishers: ['system-registry'],
      subscribers: ['documentation-registry', 'documentation-governance', 'component-registry'],
    }),
    eventType({
      eventTypeId: 'documentation.published',
      name: 'Documentation Published',
      verb: 'published',
      domain: 'documentation',
      description: 'Documentation surface synced from Documentation Registry.',
      payloadSchema: '{ systemId, docPath, version }',
      publishers: ['documentation-registry'],
      subscribers: ['documentation-governance', 'documentation-sync', 'search', 'knowledge-hub'],
    }),
    eventType({
      eventTypeId: 'component.registered',
      name: 'Component Registered',
      verb: 'created',
      domain: 'registry',
      description: 'Reusable UI component added to Component Registry.',
      payloadSchema: '{ componentId, category, reuseScore }',
      publishers: ['component-registry'],
      subscribers: ['design-token-engine', 'interaction-engine', 'documentation-registry'],
    }),

    // Intelligence & memory
    eventType({
      eventTypeId: 'memory.recorded',
      name: 'Memory Recorded',
      verb: 'created',
      domain: 'memory',
      description: 'Organizational memory entry persisted in Memory Engine.',
      payloadSchema: '{ memoryId, category, summary }',
      publishers: ['memory-engine'],
      subscribers: ['executive-timeline', 'legacy-vault', 'search', 'studio-intelligence'],
    }),
    eventType({
      eventTypeId: 'timeline.milestone',
      name: 'Timeline Milestone',
      verb: 'completed',
      domain: 'timeline',
      description: 'Executive Timeline milestone captured.',
      payloadSchema: '{ milestoneId, title, date }',
      publishers: ['executive-timeline'],
      subscribers: ['legacy-vault', 'presence-engine', 'command-dock'],
    }),
    eventType({
      eventTypeId: 'pulse.alert',
      name: 'Pulse Alert',
      verb: 'started',
      domain: 'pulse',
      description: 'Organization Pulse detected state change requiring attention.',
      payloadSchema: '{ indicator, state, recommendation }',
      publishers: ['organization-pulse'],
      subscribers: ['command-dock', 'mission-control', 'notifications', 'executive-council'],
    }),

    // Workflow verbs
    eventType({ eventTypeId: 'workflow.approved', name: 'Workflow Approved', verb: 'approved', domain: 'automation', description: 'Approval gate passed — automation may proceed.', payloadSchema: '{ workflowId, approver }', subscribers: ['automation-registry', 'notifications'] }),
    eventType({ eventTypeId: 'workflow.rejected', name: 'Workflow Rejected', verb: 'rejected', domain: 'automation', description: 'Approval rejected — item returned.', payloadSchema: '{ workflowId, reason }', subscribers: ['notifications', 'memory-engine'] }),
    eventType({ eventTypeId: 'workflow.completed', name: 'Workflow Completed', verb: 'completed', domain: 'automation', description: 'Automation workflow finished successfully.', payloadSchema: '{ workflowId, durationMs }', publishers: ['automation-registry'], subscribers: ['analytics', 'memory-engine'] }),
    eventType({ eventTypeId: 'workflow.failed', name: 'Workflow Failed', verb: 'failed', domain: 'automation', description: 'Automation workflow failed — debug via Event Inspector.', payloadSchema: '{ workflowId, error }', subscribers: ['command-dock', 'notifications'] }),

    // Command & notifications
    eventType({
      eventTypeId: 'command.routed',
      name: 'Command Routed',
      verb: 'succeeded',
      domain: 'command',
      description: 'Command Dock routed user intent to a module.',
      payloadSchema: '{ command, targetModule, concierge }',
      publishers: ['command-dock'],
      subscribers: ['analytics', 'relationship-memory'],
    }),
    eventType({
      eventTypeId: 'notification.sent',
      name: 'Notification Sent',
      verb: 'published',
      domain: 'notification',
      description: 'User or system notification delivered.',
      payloadSchema: '{ notificationId, channel, recipient }',
      publishers: ['notifications'],
      subscribers: ['analytics', 'memory-engine'],
    }),

    // Data lifecycle
    eventType({ eventTypeId: 'record.archived', name: 'Record Archived', verb: 'archived', domain: 'system', description: 'Entity soft-archived.', payloadSchema: '{ entityType, entityId }', subscribers: ['search', 'legacy-vault'] }),
    eventType({ eventTypeId: 'record.deleted', name: 'Record Deleted', verb: 'deleted', domain: 'system', description: 'Entity permanently deleted — audit trail retained.', payloadSchema: '{ entityType, entityId, deletedBy }', subscribers: ['event-bus', 'legacy-vault'] }),
    eventType({ eventTypeId: 'data.imported', name: 'Data Imported', verb: 'imported', domain: 'system', description: 'Bulk import completed.', payloadSchema: '{ source, rowCount }', subscribers: ['system-registry', 'analytics'] }),
    eventType({ eventTypeId: 'data.exported', name: 'Data Exported', verb: 'exported', domain: 'system', description: 'Export bundle generated.', payloadSchema: '{ format, sizeBytes }', subscribers: ['analytics'] }),
    eventType({ eventTypeId: 'integration.connected', name: 'Integration Connected', verb: 'connected', domain: 'system', description: 'External integration linked.', payloadSchema: '{ provider, scope }', subscribers: ['system-registry', 'notifications'] }),
    eventType({ eventTypeId: 'integration.disconnected', name: 'Integration Disconnected', verb: 'disconnected', domain: 'system', description: 'External integration unlinked.', payloadSchema: '{ provider }', subscribers: ['system-registry'] }),

    // Commerce & scheduling
    eventType({ eventTypeId: 'payment.paid', name: 'Payment Paid', verb: 'paid', domain: 'customer', description: 'Payment succeeded.', payloadSchema: '{ orderId, amount, currency }', subscribers: ['memory-engine', 'analytics', 'organization-pulse'] }),
    eventType({ eventTypeId: 'payment.failed', name: 'Payment Failed', verb: 'failed', domain: 'customer', description: 'Payment attempt failed.', payloadSchema: '{ orderId, error }', subscribers: ['notifications', 'command-dock'] }),
    eventType({ eventTypeId: 'task.scheduled', name: 'Task Scheduled', verb: 'scheduled', domain: 'automation', description: 'Future task scheduled.', payloadSchema: '{ taskId, runAt }', subscribers: ['automation-registry', 'anticipation-engine'] }),
    eventType({ eventTypeId: 'task.cancelled', name: 'Task Cancelled', verb: 'cancelled', domain: 'automation', description: 'Scheduled task cancelled.', payloadSchema: '{ taskId, reason }', subscribers: ['automation-registry'] }),
    eventType({ eventTypeId: 'assignment.transferred', name: 'Assignment Transferred', verb: 'transferred', domain: 'organization', description: 'Work item reassigned.', payloadSchema: '{ itemId, from, to }', subscribers: ['notifications', 'memory-engine'] }),

    // Search & analytics
    eventType({
      eventTypeId: 'search.indexed',
      name: 'Search Indexed',
      verb: 'succeeded',
      domain: 'search',
      description: 'Search index updated after entity change.',
      payloadSchema: '{ entityType, entityId }',
      publishers: ['documentation-sync', 'system-registry'],
      subscribers: ['analytics'],
    }),
    eventType({
      eventTypeId: 'analytics.recorded',
      name: 'Analytics Recorded',
      verb: 'created',
      domain: 'analytics',
      description: 'Analytics event captured from bus reaction.',
      payloadSchema: '{ metric, value, dimensions }',
      publishers: ['analytics'],
      subscribers: ['organization-pulse', 'predictive-organization'],
    }),

    // Event bus meta
    eventType({
      eventTypeId: 'event-bus.replayed',
      name: 'Event Replayed',
      verb: 'started',
      domain: 'system',
      description: 'Historical event replayed via Event Inspector.',
      payloadSchema: '{ originalEventId, replayedAt }',
      publishers: ['event-bus'],
      subscribers: ['event-bus'],
    }),
  ];

  types.push(
    eventType({
      eventTypeId: 'bus.self',
      name: 'Event Bus™',
      verb: 'created',
      domain: 'system',
      description: 'Event Bus nervous system — publish/subscribe backbone.',
      payloadSchema: '{ busScore, eventCount }',
      publishers: ['event-bus'],
      subscribers: ['event-bus'],
      platformStandard: true,
    })
  );

  void EVENT_BUS_ACCENT;
  return types;
}

export function getEventTypeDefinition(eventTypeId: string): EventTypeDefinition | undefined {
  return buildEventTypeCatalog().find((e) => e.eventTypeId === eventTypeId);
}

export function listEventTypesByDomain(domain: EventDomain): EventTypeDefinition[] {
  return buildEventTypeCatalog().filter((e) => e.domain === domain);
}

export function listEventTypesByVerb(verb: StandardEventVerb): EventTypeDefinition[] {
  return buildEventTypeCatalog().filter((e) => e.verb === verb);
}

export function getStandardVerbsInCatalog(): StandardEventVerb[] {
  const verbs = new Set(buildEventTypeCatalog().map((e) => e.verb));
  return [...verbs];
}
