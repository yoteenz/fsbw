import type { DemoStore } from '../demo/demoTypes';
import type {
  AutomationActionDef,
  AutomationExecution,
  AutomationRule,
  WorkflowEventRecord,
  WorkflowEventType,
} from './workflowTypes';

export interface DomainEvent {
  id: string;
  type: WorkflowEventType | string;
  organizationId?: string;
  workflowInstanceId?: string;
  stepInstanceId?: string;
  serviceRequestId?: string;
  documentId?: string;
  actorType: 'customer' | 'staff' | 'system';
  actorId?: string;
  payload?: Record<string, unknown>;
  dedupeKey: string;
  createdAt: string;
}

type EventHandler = (event: DomainEvent, store: DemoStore) => DemoStore;

const handlers: EventHandler[] = [];

export function registerDomainEventHandler(handler: EventHandler): void {
  handlers.push(handler);
}

export function createDomainEvent(
  partial: Omit<DomainEvent, 'id' | 'createdAt'> & { id?: string },
): DomainEvent {
  return {
    id: partial.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function emitDomainEvent(store: DemoStore, event: DomainEvent, dryRun = false): DemoStore {
  if (store.workflowKillSwitch?.allNonEssentialDisabled && event.actorType === 'system') {
    return store;
  }

  const existing = store.workflowEvents?.find((e) => e.dedupeKey === event.dedupeKey);
  if (existing) return store;

  const record: WorkflowEventRecord = {
    id: event.id,
    workflowInstanceId: event.workflowInstanceId ?? '',
    stepInstanceId: event.stepInstanceId,
    eventType: event.type,
    actorType: event.actorType,
    actorId: event.actorId,
    trigger: event.type,
    dedupeKey: event.dedupeKey,
    createdAt: event.createdAt,
  };

  if (dryRun) {
    store.workflowEvents = [...(store.workflowEvents ?? []), { ...record, reason: 'DRY_RUN' }];
    return store;
  }

  store.workflowEvents = [...(store.workflowEvents ?? []), record];

  let next = store;
  for (const handler of handlers) {
    next = handler(event, next);
  }
  return next;
}

export function matchAutomationRules(
  rules: AutomationRule[],
  event: DomainEvent,
  killSwitch?: DemoStore['workflowKillSwitch'],
): AutomationRule[] {
  return rules.filter((r) => {
    if (!r.enabled) return false;
    if (killSwitch?.disabledRuleIds.includes(r.id)) return false;
    if (r.whenEvent !== event.type) return false;
    return true;
  });
}

export function buildExecutionDedupeKey(rule: AutomationRule, event: DomainEvent): string {
  if (rule.dedupeKeyTemplate) {
    return rule.dedupeKeyTemplate
      .replace('{eventId}', event.id)
      .replace('{ruleId}', rule.id)
      .replace('{dedupeKey}', event.dedupeKey);
  }
  return `exec:${rule.id}:${event.dedupeKey}`;
}

export function executeAutomationActions(
  store: DemoStore,
  rule: AutomationRule,
  event: DomainEvent,
  dryRun: boolean,
): { store: DemoStore; execution: AutomationExecution; error?: string } {
  const dedupeKey = buildExecutionDedupeKey(rule, event);
  const existing = store.automationExecutions?.find((e) => e.dedupeKey === dedupeKey);
  if (existing) {
    return {
      store,
      execution: existing,
    };
  }

  const execution: AutomationExecution = {
    id: crypto.randomUUID(),
    ruleId: rule.id,
    eventId: event.id,
    dedupeKey,
    status: dryRun ? 'skipped_dry_run' : 'pending',
    startedAt: new Date().toISOString(),
    actionsExecuted: [],
    retryCount: 0,
  };

  if (dryRun) {
    execution.status = 'skipped_dry_run';
    execution.completedAt = new Date().toISOString();
    execution.actionsExecuted = rule.actions.map((a) => `DRY_RUN:${a.type}`);
    store.automationExecutions = [...(store.automationExecutions ?? []), execution];
    return { store, execution };
  }

  try {
    store = applyActions(store, rule.actions, event, execution);
    execution.status = 'completed';
    execution.completedAt = new Date().toISOString();
  } catch (err) {
    execution.status = 'failed';
    execution.error = err instanceof Error ? err.message : String(err);
    store.automationExceptions = [
      ...(store.automationExceptions ?? []),
      {
        id: crypto.randomUUID(),
        executionId: execution.id,
        workflowInstanceId: event.workflowInstanceId,
        message: execution.error,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  store.automationExecutions = [...(store.automationExecutions ?? []), execution];
  return { store, execution, error: execution.error };
}

function applyActions(
  store: DemoStore,
  actions: AutomationActionDef[],
  event: DomainEvent,
  execution: AutomationExecution,
): DemoStore {
  let next = store;
  for (const action of actions) {
    next = applySingleAction(next, action, event);
    execution.actionsExecuted.push(action.type);
  }
  return next;
}

function applySingleAction(
  store: DemoStore,
  action: AutomationActionDef,
  _event: DomainEvent,
): DemoStore {
  switch (action.type) {
    case 'SURFACE_CUSTOMER_ACTION':
    case 'CREATE_WORK_ITEM':
      // Handled by workflowOrchestrator on step activation — idempotent via officeWorkItemId link
      return store;
    case 'SEND_NOTIFICATION':
      return store;
    default:
      return store;
  }
}

export function processEventThroughAutomation(
  store: DemoStore,
  event: DomainEvent,
  dryRun = false,
): DemoStore {
  store = emitDomainEvent(store, event, dryRun);
  const rules = matchAutomationRules(store.automationRules ?? [], event, store.workflowKillSwitch);
  for (const rule of rules) {
    const result = executeAutomationActions(store, rule, event, dryRun);
    store = result.store;
  }
  return store;
}
