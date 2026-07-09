import { ensureInteractionModelStore, readInteractionModelStore } from './persistence';
import {
  listInteractionRegistry,
  getInteractionRegistryStats,
  searchInteractionRegistry,
  listInteractionsByType,
  listInteractionsByStatus,
  listInteractionsForObject,
  getInteractionTypeCoverage,
  listInteractionsByWorkflow,
  listInteractionsByCorrelation,
} from './interactions/registry';
import {
  submitStudioInteraction,
  getStudioInteraction,
  advanceStudioInteraction,
  completeStudioInteraction,
  failStudioInteraction,
  validateInteractionEnvelope,
  validateInteractionModelStore,
  createInteractionId,
} from './interactions/engine';
import {
  listCanonicalInteractionTypes,
  getCanonicalInteractionTypeMeta,
  isCanonicalInteractionType,
} from './interaction-types/registry';
import {
  listEventRegistry,
  getStudioEvent,
  listEventsByCategory,
  listEventsForObject,
  listEventsByInteraction,
  listEventsByCorrelation,
  getEventCategoryCoverage,
  searchEventRegistry,
} from './events/registry';
import {
  emitStudioEvent,
  listRecentStudioEvents,
  getStudioEventBusStats,
} from './events/bus';
import {
  listWorkflowRegistry,
  getStudioWorkflow,
  registerStudioWorkflow,
  updateWorkflowStepStatus,
  activateStudioWorkflow,
  listActiveWorkflows,
} from './workflows/registry';
import {
  composeStudioWorkflow,
  runStudioWorkflowStep,
  completeStudioWorkflowStep,
  failStudioWorkflowStep,
  startComposedWorkflow,
} from './workflows/composer';
import {
  listCommandRegistry,
  getStudioCommand,
  issueStudioCommand,
  updateCommandStatus,
  listCommandsForObject,
} from './commands/registry';
import { sendStudioMessage, listStudioMessages, listMessagesForObject } from './messages/messages';
import {
  createStudioNotification,
  listStudioNotifications,
  markNotificationDelivered,
  markNotificationRead,
  listPendingNotifications,
} from './notifications/notifications';
import {
  recordAuditEntry,
  listAuditLog,
  getAuditTrailForInteraction,
  getAuditTrailForCorrelation,
  getAuditEngineStats,
} from './audit/engine';
import {
  registerStudioAutomation,
  listStudioAutomations,
  setAutomationEnabled,
  findAutomationsForEvent,
  findAutomationsForInteractionType,
} from './automation/automation';
import {
  beginStudioSynchronization,
  completeStudioSynchronization,
  failStudioSynchronization,
  listStudioSynchronizations,
  listPendingSynchronizations,
} from './synchronization/sync';
import {
  ingestInteractionPayload,
  ingestEventPayload,
  ingestWorkflowPayload,
  ingestInteractionBatch,
} from './content/loader';
import {
  INTERACTION_MODEL_SUBSYSTEM_NAME,
  INTERACTION_MODEL_SUBSYSTEM_VERSION,
  CANONICAL_INTERACTION_TYPES,
  EVENT_CATEGORIES,
  INTERACTION_STATUSES,
  INTERACTION_PRIORITIES,
  INTERACTION_VISIBILITY_LEVELS,
  RETRY_STRATEGIES,
  AUDIT_LEVELS,
} from './constants';
import type { InteractionModelRegistryStats } from './types';

export function ensureInteractionModelSubsystem() {
  return ensureInteractionModelStore();
}

export function getInteractionModelPlatformStats(): InteractionModelRegistryStats {
  const store = readInteractionModelStore();
  const interactionStats = getInteractionRegistryStats();

  return {
    interactionCount: interactionStats.interactionCount,
    pendingInteractionCount: interactionStats.pendingInteractionCount,
    eventCount: store.events.length,
    workflowCount: store.workflows.length,
    commandCount: store.commands.length,
    messageCount: store.messages.length,
    notificationCount: store.notifications.length,
    auditEntryCount: store.auditLog.length,
    automationCount: store.automations.length,
    syncCount: store.synchronizations.length,
    activeWorkflowCount: store.workflows.filter((w) => w.status === 'active').length,
  };
}

export {
  INTERACTION_MODEL_SUBSYSTEM_NAME,
  INTERACTION_MODEL_SUBSYSTEM_VERSION,
  CANONICAL_INTERACTION_TYPES,
  EVENT_CATEGORIES,
  INTERACTION_STATUSES,
  INTERACTION_PRIORITIES,
  INTERACTION_VISIBILITY_LEVELS,
  RETRY_STRATEGIES,
  AUDIT_LEVELS,
  readInteractionModelStore,
  ensureInteractionModelStore,
  listInteractionRegistry,
  getInteractionRegistryStats,
  searchInteractionRegistry,
  listInteractionsByType,
  listInteractionsByStatus,
  listInteractionsForObject,
  getInteractionTypeCoverage,
  listInteractionsByWorkflow,
  listInteractionsByCorrelation,
  submitStudioInteraction,
  getStudioInteraction,
  advanceStudioInteraction,
  completeStudioInteraction,
  failStudioInteraction,
  validateInteractionEnvelope,
  validateInteractionModelStore,
  createInteractionId,
  listCanonicalInteractionTypes,
  getCanonicalInteractionTypeMeta,
  isCanonicalInteractionType,
  listEventRegistry,
  getStudioEvent,
  listEventsByCategory,
  listEventsForObject,
  listEventsByInteraction,
  listEventsByCorrelation,
  getEventCategoryCoverage,
  searchEventRegistry,
  emitStudioEvent,
  listRecentStudioEvents,
  getStudioEventBusStats,
  listWorkflowRegistry,
  getStudioWorkflow,
  registerStudioWorkflow,
  updateWorkflowStepStatus,
  activateStudioWorkflow,
  listActiveWorkflows,
  composeStudioWorkflow,
  runStudioWorkflowStep,
  completeStudioWorkflowStep,
  failStudioWorkflowStep,
  startComposedWorkflow,
  listCommandRegistry,
  getStudioCommand,
  issueStudioCommand,
  updateCommandStatus,
  listCommandsForObject,
  sendStudioMessage,
  listStudioMessages,
  listMessagesForObject,
  createStudioNotification,
  listStudioNotifications,
  markNotificationDelivered,
  markNotificationRead,
  listPendingNotifications,
  recordAuditEntry,
  listAuditLog,
  getAuditTrailForInteraction,
  getAuditTrailForCorrelation,
  getAuditEngineStats,
  registerStudioAutomation,
  listStudioAutomations,
  setAutomationEnabled,
  findAutomationsForEvent,
  findAutomationsForInteractionType,
  beginStudioSynchronization,
  completeStudioSynchronization,
  failStudioSynchronization,
  listStudioSynchronizations,
  listPendingSynchronizations,
  ingestInteractionPayload,
  ingestEventPayload,
  ingestWorkflowPayload,
  ingestInteractionBatch,
};

export type {
  InteractionModelRegistryStats,
  StudioInteraction,
  StudioEvent,
  StudioWorkflow,
  StudioCommand,
  StudioMessage,
  StudioNotification,
  StudioAuditEntry,
  StudioAutomation,
  StudioSynchronization,
  InteractionValidationReport,
} from './types';

export type { SubmitInteractionInput } from './interactions/engine';
export type { EmitStudioEventInput } from './events/bus';
export type { WorkflowCompositionStep } from './workflows/composer';
export type {
  InteractionPayload,
  EventPayload,
  WorkflowPayload,
  CommandPayload,
  AutomationPayload,
} from './content/loader';
