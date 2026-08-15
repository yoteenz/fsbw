export type NotificationEventType =
  | 'ROAD_READY_ATTENTION_REQUIRED'
  | 'DOCUMENT_REQUESTED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VERIFIED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_EXPIRING'
  | 'DOCUMENT_EXPIRED'
  | 'DEADLINE_CREATED'
  | 'DEADLINE_DUE_SOON'
  | 'DEADLINE_OVERDUE'
  | 'RENEWAL_AVAILABLE'
  | 'RENEWAL_STARTED'
  | 'RENEWAL_DOCUMENTS_NEEDED'
  | 'RENEWAL_STATUS_CHANGED'
  | 'RENEWAL_COMPLETED'
  | 'SERVICE_REQUEST_STATUS_CHANGED'
  | 'MESSAGE_RECEIVED'
  | 'QUOTE_AVAILABLE'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'QUOTE_REVISED'
  | 'QUOTE_EXPIRING'
  | 'INVOICE_ISSUED'
  | 'INVOICE_DUE_SOON'
  | 'INVOICE_PAST_DUE'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'RECEIPT_AVAILABLE'
  | 'REFUND_PROCESSED'
  | 'CREDIT_APPLIED'
  | 'DISPATCH_ENROLLMENT_ACTIVE'
  | 'TRUCK_AVAILABLE'
  | 'LOAD_OFFERED'
  | 'LOAD_OFFER_ACCEPTED'
  | 'LOAD_OFFER_DECLINED'
  | 'LOAD_BOOKED'
  | 'PICKUP_APPROACHING'
  | 'DELIVERY_APPROACHING'
  | 'LOAD_STATUS_CHANGED'
  | 'LOAD_ISSUE_CREATED'
  | 'RATE_CONFIRMATION_NEEDED'
  | 'BOL_NEEDED'
  | 'POD_NEEDED'
  | 'POD_RECEIVED'
  | 'LOAD_COMPLETED'
  | 'FACTORING_HANDOFF_READY';

export type NotificationCategory =
  | 'road_ready'
  | 'documents'
  | 'renewals'
  | 'messages'
  | 'operations'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'billing';

export type NotificationRecipientType = 'customer' | 'staff';

export interface AioNotification {
  id: string;
  organizationId?: string;
  recipientType: NotificationRecipientType;
  recipientId?: string;
  staffId?: string;
  eventType: NotificationEventType;
  category: NotificationCategory;
  title: string;
  body: string;
  read: boolean;
  archived?: boolean;
  dedupeKey?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  createdAt: string;
}

export interface NotificationPreference {
  category: NotificationCategory;
  inApp: boolean;
  emailFuture: boolean;
  smsFuture: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  { category: 'road_ready', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'documents', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'renewals', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'messages', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'operations', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'dispatch', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'factoring', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'brokerage', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'billing', inApp: true, emailFuture: false, smsFuture: false },
];
