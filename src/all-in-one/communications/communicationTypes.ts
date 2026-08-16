/** Canonical communications domain — Sprint 16 */

export type CommChannel =
  | 'portal'
  | 'email'
  | 'sms'
  | 'phone_log'
  | 'manual_external'
  | 'system';

export type CommConversationType =
  | 'general'
  | 'sales'
  | 'permitting'
  | 'road_ready'
  | 'documents'
  | 'billing'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'insurance'
  | 'renewal'
  | 'support'
  | 'appointment';

export type CommConversationStatus =
  | 'open'
  | 'waiting_on_staff'
  | 'waiting_on_customer'
  | 'waiting_external'
  | 'resolved'
  | 'closed'
  | 'archived';

export type CommPriority = 'normal' | 'high' | 'urgent';

export type CommMessageDirection = 'inbound' | 'outbound' | 'internal' | 'system';

export type CommMessageVisibility = 'customer_visible' | 'internal_only' | 'restricted_internal';

export type CommMessageStatus =
  | 'draft'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'read'
  | 'recorded_externally'
  | 'demo';

export type CommResponseResponsibility = 'staff' | 'customer' | 'external' | 'none';

export type CommParticipantKind = 'contact' | 'prospect' | 'staff' | 'team' | 'system';

export type CommContextEntityType =
  | 'service_request'
  | 'workflow_instance'
  | 'quote'
  | 'invoice'
  | 'document'
  | 'load'
  | 'factoring_submission'
  | 'shipment'
  | 'insurance_request'
  | 'lead'
  | 'opportunity'
  | 'appointment';

export type CommCategory = 'transactional' | 'service' | 'sales' | 'marketing' | 'emergency_operational';

export type CommConsentState = 'unknown' | 'granted' | 'declined' | 'revoked' | 'not_required_by_policy';

export type CommSuppressionReason =
  | 'do_not_contact'
  | 'email_bounced'
  | 'sms_opt_out'
  | 'invalid_number'
  | 'invalid_email'
  | 'legal_suppression'
  | 'customer_request';

export type CommTemplateStatus = 'draft' | 'published' | 'retired';

export interface CommConversation {
  id: string;
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
  subject: string;
  conversationType: CommConversationType;
  status: CommConversationStatus;
  priority: CommPriority;
  customerMarkedImportant?: boolean;
  assignedUserId?: string;
  assignedTeamId?: string;
  responseResponsibility: CommResponseResponsibility;
  lastMessageAt?: string;
  lastCustomerMessageAt?: string;
  lastStaffMessageAt?: string;
  nextResponseDueAt?: string;
  primaryContextType?: CommContextEntityType;
  primaryContextId?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  isDemo?: boolean;
}

export interface CommParticipant {
  id: string;
  conversationId: string;
  kind: CommParticipantKind;
  participantId: string;
  displayName: string;
  unreadCount?: number;
  lastReadAt?: string;
}

export interface CommContextLink {
  id: string;
  conversationId: string;
  entityType: CommContextEntityType;
  entityId: string;
  relationshipType: 'primary' | 'related';
  label?: string;
}

export interface CommMessage {
  id: string;
  conversationId: string;
  senderType: 'customer' | 'staff' | 'system';
  senderId?: string;
  senderName: string;
  channel: CommChannel;
  direction: CommMessageDirection;
  visibility: CommMessageVisibility;
  body: string;
  status: CommMessageStatus;
  category?: CommCategory;
  replyToMessageId?: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  isDemo?: boolean;
}

export interface CommDelivery {
  id: string;
  messageId: string;
  channel: CommChannel;
  provider?: string;
  providerMessageId?: string;
  status: CommMessageStatus;
  attemptedAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface CommAttachment {
  id: string;
  messageId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  vaultDocumentId?: string;
  createdAt: string;
}

export interface CommPreference {
  id: string;
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  preferredChannel: CommChannel;
  emailAllowed: boolean;
  smsAllowed: boolean;
  portalAllowed: boolean;
  phoneAllowed: boolean;
  marketingEmailAllowed: boolean;
  marketingSmsAllowed: boolean;
  timezone?: string;
  updatedAt: string;
}

export interface CommConsentRecord {
  id: string;
  contactId?: string;
  leadId?: string;
  channel: CommChannel;
  purpose: CommCategory;
  state: CommConsentState;
  source: string;
  recordedAt: string;
  recordedBy?: string;
}

export interface CommSuppression {
  id: string;
  contactId?: string;
  leadId?: string;
  channel: CommChannel | 'all';
  reason: CommSuppressionReason;
  createdAt: string;
  createdBy?: string;
  active: boolean;
}

export interface CommTemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  status: CommTemplateStatus;
  portalBody: string;
  emailBody?: string;
  smsBody?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface CommTemplate {
  id: string;
  slug: string;
  name: string;
  category: CommCategory;
  currentVersionId?: string;
  versions: CommTemplateVersion[];
}

export interface CommRoutingRule {
  id: string;
  conversationType: CommConversationType;
  teamId: string;
  priority: number;
  active: boolean;
}

export interface CommReadState {
  id: string;
  conversationId: string;
  participantKind: CommParticipantKind;
  participantId: string;
  lastReadAt: string;
}

export interface CommPhoneLog {
  id: string;
  conversationId?: string;
  organizationId?: string;
  leadId?: string;
  staffId: string;
  direction: 'inbound' | 'outbound';
  contactLabel: string;
  startedAt: string;
  durationMinutes?: number;
  outcome: string;
  summary?: string;
  followUpRequired: boolean;
  createdAt: string;
}

export interface CommSettings {
  staleConversationDays: number;
  defaultResponseDueBusinessDays: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  businessTimezone: string;
  providerMode: 'demo' | 'disabled' | 'provider';
}

export const COMM_CONVERSATION_STATUS_LABELS: Record<CommConversationStatus, string> = {
  open: 'Open',
  waiting_on_staff: 'Waiting on Staff',
  waiting_on_customer: 'Waiting on Customer',
  waiting_external: 'Waiting External',
  resolved: 'Resolved',
  closed: 'Closed',
  archived: 'Archived',
};

export const COMM_MESSAGE_STATUS_LABELS: Record<CommMessageStatus, string> = {
  draft: 'Draft',
  queued: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  failed: 'Failed',
  read: 'Read',
  recorded_externally: 'Recorded Externally',
  demo: 'Demo Delivery',
};
