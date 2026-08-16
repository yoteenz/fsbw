import type { DeadlineType } from '../calendar/calendarTypes';

export type RenewalType =
  | 'registration'
  | 'irp'
  | 'insurance'
  | 'permit'
  | 'ifta'
  | 'authority'
  | 'tax'
  | 'other';

export type RenewalStatus =
  | 'upcoming'
  | 'available'
  | 'customer_action_needed'
  | 'requested'
  | 'documents_needed'
  | 'under_review'
  | 'in_progress'
  | 'submitted'
  | 'awaiting_external_action'
  | 'completed'
  | 'declined'
  | 'self_managed'
  | 'not_applicable';

export interface RenewalRecord {
  id: string;
  organizationId: string;
  renewalType: RenewalType;
  title: string;
  category: string;
  deadlineType: DeadlineType;
  expirationDate: string;
  status: RenewalStatus;
  vehicleId?: string;
  vehicleLabel?: string;
  currentDocumentId?: string;
  serviceRequestId?: string;
  roadReadyItemId?: string;
  requiredDocumentTypes?: string[];
  selfManaged?: boolean;
  completedAt?: string;
  supersededRenewalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalDefinition {
  renewalType: RenewalType;
  title: string;
  category: string;
  deadlineType: DeadlineType;
  windowDays: number;
  serviceSlug?: string;
}
