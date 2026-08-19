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
  | 'FACTORING_HANDOFF_READY'
  | 'FACTORING_ENROLLMENT_UPDATED'
  | 'FACTORING_DOCUMENT_NEEDED'
  | 'FACTORING_READY'
  | 'FACTORING_SUBMITTED'
  | 'FACTORING_ADDITIONAL_INFO_NEEDED'
  | 'FACTORING_APPROVED'
  | 'FACTORING_DECLINED'
  | 'FACTORING_FUNDING_PENDING'
  | 'FACTORING_FUNDED'
  | 'FACTORING_ISSUE_CREATED'
  | 'FACTORING_ISSUE_RESOLVED'
  | 'SHIPMENT_REQUEST_SUBMITTED'
  | 'BROKERAGE_QUOTE_AVAILABLE'
  | 'BROKERAGE_QUOTE_ACCEPTED'
  | 'BROKERAGE_LOAD_NEEDS_COVERAGE'
  | 'CARRIER_OFFER_SENT'
  | 'CARRIER_OFFER_ACCEPTED'
  | 'CARRIER_OFFER_DECLINED'
  | 'BROKERAGE_LOAD_BOOKED'
  | 'BROKERAGE_POD_NEEDED'
  | 'BROKERAGE_POD_RECEIVED'
  | 'BROKERAGE_READY_TO_BILL'
  | 'SHIPPER_INVOICE_ISSUED'
  | 'CARRIER_PAYABLE_READY'
  | 'INSURANCE_REQUEST_SUBMITTED'
  | 'INSURANCE_INFORMATION_NEEDED'
  | 'INSURANCE_REQUEST_READY_FOR_REFERRAL'
  | 'INSURANCE_REFERRED'
  | 'INSURANCE_PARTNER_UPDATE'
  | 'INSURANCE_QUOTE_REPORTED'
  | 'INSURANCE_POLICY_RECORDED'
  | 'INSURANCE_POLICY_EXPIRING'
  | 'INSURANCE_POLICY_EXPIRED'
  | 'INSURANCE_POLICY_REPLACED'
  | 'INSURANCE_COI_REQUESTED'
  | 'INSURANCE_COI_ISSUED'
  | 'INSURANCE_COI_ACTION_NEEDED'
  | 'INSURANCE_RENEWAL_STARTED'
  | 'INSURANCE_RENEWAL_COMPLETED'
  | 'INSURANCE_ROAD_READY_IMPACT'
  | 'OFFICE_WORK_ASSIGNED'
  | 'OFFICE_APPROVAL_DECISION'
  | 'OFFICE_ESCALATION'
  | 'NEW_MATCHING_LOAD'
  | 'PRIVATE_LOAD_INVITE'
  | 'CARRIER_OFFER_SUBMITTED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_COUNTERED'
  | 'OFFER_DECLINED'
  | 'LOAD_UPDATED'
  | 'LOAD_CANCELLED'
  | 'PICKUP_REMINDER'
  | 'DELIVERY_REMINDER'
  | 'DOCUMENT_REQUIRED'
  | 'POD_REQUIRED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'FLEETCARE_LOAD_WARNING';

export type NotificationCategory =
  | 'road_ready'
  | 'documents'
  | 'renewals'
  | 'messages'
  | 'operations'
  | 'dispatch'
  | 'factoring'
  | 'brokerage'
  | 'insurance'
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
  { category: 'insurance', inApp: true, emailFuture: false, smsFuture: false },
  { category: 'billing', inApp: true, emailFuture: false, smsFuture: false },
];
