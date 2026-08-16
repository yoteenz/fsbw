export type DeadlineType =
  | 'document_expiration'
  | 'registration_renewal'
  | 'insurance_renewal'
  | 'permit_expiration'
  | 'tax_filing'
  | 'ifta_filing'
  | 'road_tax'
  | 'authority_review'
  | 'service_deadline'
  | 'document_due'
  | 'customer_action'
  | 'internal_action'
  | 'renewal_window'
  | 'ucr_renewal'
  | 'biennial_update'
  | 'consortium_renewal'
  | 'subscription_renewal'
  | 'authority_maintenance'
  | 'other';

export type DeadlineState = 'upcoming' | 'due_soon' | 'due_today' | 'overdue' | 'completed' | 'cancelled' | 'unknown';

export type DeadlineSource =
  | 'customer_entered'
  | 'verified_document'
  | 'service_request'
  | 'road_ready'
  | 'renewal'
  | 'staff_entered'
  | 'external_future';

export type DeadlineVerification = 'unverified' | 'derived' | 'staff_verified' | 'external_verified_future';

export type CalendarPriority = 'informational' | 'upcoming' | 'attention' | 'high' | 'urgent' | 'critical';

export interface CalendarEvent {
  id: string;
  organizationId: string;
  title: string;
  dueDate: string;
  deadlineType: DeadlineType;
  category: string;
  state: DeadlineState;
  priority: CalendarPriority;
  source: DeadlineSource;
  deadlineVerification: DeadlineVerification;
  relatedEntityType?: string;
  relatedEntityId?: string;
  documentId?: string;
  roadReadyItemId?: string;
  renewalId?: string;
  serviceRequestId?: string;
  vehicleId?: string;
  complete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilter {
  category?: string;
  state?: DeadlineState;
  organizationId?: string;
}
