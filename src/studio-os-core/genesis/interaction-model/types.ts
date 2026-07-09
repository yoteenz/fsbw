import type {
  AuditLevel,
  CanonicalInteractionTypeId,
  EventCategoryId,
  InteractionPriority,
  InteractionStatus,
  InteractionVisibility,
  RetryStrategy,
  WorkflowStepStatus,
} from './constants';
import type { GenesisVersion } from '../types';

export type InteractionParticipant = {
  objectId: string;
  role:
    | 'initiator'
    | 'recipient'
    | 'observer'
    | 'approver'
    | 'validator'
    | 'publisher'
    | 'executor'
    | 'subject';
};

export type InteractionInput = {
  name: string;
  sourceObjectId?: string;
  value?: unknown;
  required?: boolean;
};

export type InteractionOutput = {
  name: string;
  targetObjectId?: string;
  persistence?: 'transient' | 'event' | 'memory' | 'knowledge' | 'canon' | 'archive';
  value?: unknown;
};

export type InteractionAuditRecord = {
  auditId: string;
  level: AuditLevel;
  action: string;
  actorObjectId?: string;
  notes?: string;
  createdAt: string;
};

/** Universal Interaction envelope */
export type StudioInteraction = {
  interactionId: string;
  interactionType: CanonicalInteractionTypeId | string;
  version: GenesisVersion;
  officialName: string;
  purpose?: string;
  participants: InteractionParticipant[];
  initiatorObjectId: string;
  recipientObjectId: string;
  inputs: InteractionInput[];
  outputs: InteractionOutput[];
  status: InteractionStatus;
  priority: InteractionPriority;
  relationshipRefs: string[];
  visibility: InteractionVisibility;
  auditHistory: InteractionAuditRecord[];
  retryStrategy: RetryStrategy;
  metadata: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
};

export type StudioEvent = {
  eventId: string;
  officialName: string;
  eventType: string;
  category: EventCategoryId;
  occurredAt: string;
  sourceObjectId: string;
  actorObjectId: string;
  affectedObjectIds: string[];
  interactionId?: string;
  payload: Record<string, unknown>;
  visibility: InteractionVisibility;
  auditLevel: AuditLevel;
  correlationId?: string;
  causationId?: string;
};

export type WorkflowStep = {
  stepId: string;
  order: number;
  interactionType: CanonicalInteractionTypeId | string;
  label: string;
  status: WorkflowStepStatus;
  interactionId?: string;
  optional?: boolean;
};

export type StudioWorkflow = {
  workflowId: string;
  officialName: string;
  description: string;
  version: GenesisVersion;
  triggerInteractionType?: CanonicalInteractionTypeId | string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  ownerObjectId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StudioCommand = {
  commandId: string;
  officialName: string;
  commandType: string;
  issuerObjectId: string;
  targetObjectId: string;
  parameters: Record<string, unknown>;
  interactionId?: string;
  status: InteractionStatus;
  createdAt: string;
  updatedAt: string;
};

export type StudioMessage = {
  messageId: string;
  conversationId?: string;
  interactionId?: string;
  senderObjectId: string;
  recipientObjectId: string;
  body: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type StudioNotification = {
  notificationId: string;
  interactionId?: string;
  eventId?: string;
  sourceObjectId: string;
  recipientObjectId: string;
  title: string;
  body: string;
  priority: InteractionPriority;
  actionLabel?: string;
  status: 'created' | 'delivered' | 'read' | 'acted' | 'expired' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type StudioAuditEntry = {
  auditId: string;
  interactionId?: string;
  eventId?: string;
  level: AuditLevel;
  action: string;
  actorObjectId?: string;
  subjectObjectIds: string[];
  visibility: InteractionVisibility;
  details: Record<string, unknown>;
  createdAt: string;
};

export type StudioAutomation = {
  automationId: string;
  officialName: string;
  triggerEventType?: string;
  triggerInteractionType?: CanonicalInteractionTypeId | string;
  workflowId?: string;
  ownerObjectId: string;
  enabled: boolean;
  conditions: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type StudioSynchronization = {
  syncId: string;
  sourceObjectId: string;
  targetObjectId: string;
  interactionId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'conflict' | 'failed';
  conflictReport?: string[];
  createdAt: string;
  updatedAt: string;
};

export type InteractionModelStore = {
  version: string;
  interactions: StudioInteraction[];
  events: StudioEvent[];
  workflows: StudioWorkflow[];
  commands: StudioCommand[];
  messages: StudioMessage[];
  notifications: StudioNotification[];
  auditLog: StudioAuditEntry[];
  automations: StudioAutomation[];
  synchronizations: StudioSynchronization[];
  bootstrappedAt?: string;
};

export type InteractionModelRegistryStats = {
  interactionCount: number;
  eventCount: number;
  workflowCount: number;
  commandCount: number;
  messageCount: number;
  notificationCount: number;
  auditEntryCount: number;
  automationCount: number;
  syncCount: number;
  activeWorkflowCount: number;
  pendingInteractionCount: number;
};

export type InteractionValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; interactionId?: string }[];
};
