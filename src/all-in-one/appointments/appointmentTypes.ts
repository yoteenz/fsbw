/** Canonical appointments domain — Sprint 16 */

export type AppointmentTypeSlug =
  | 'general_consultation'
  | 'permitting_consultation'
  | 'new_business_consultation'
  | 'insurance_consultation'
  | 'dispatch_consultation'
  | 'factoring_consultation'
  | 'brokerage_consultation'
  | 'customer_support_call';

export type AppointmentStatus =
  | 'requested'
  | 'pending_confirmation'
  | 'confirmed'
  | 'reschedule_requested'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface AppointmentType {
  id: string;
  slug: AppointmentTypeSlug;
  name: string;
  durationMinutes: number;
  teamId?: string;
  active: boolean;
}

export interface AppointmentAvailabilityRule {
  id: string;
  appointmentTypeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  staffId?: string;
  timezone: string;
}

export interface AppointmentSlotHold {
  id: string;
  appointmentTypeId: string;
  slotStart: string;
  slotEnd: string;
  expiresAt: string;
  sessionKey: string;
}

export interface Appointment {
  id: string;
  appointmentTypeId: string;
  status: AppointmentStatus;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  organizationId?: string;
  contactId?: string;
  leadId?: string;
  conversationId?: string;
  assignedUserId?: string;
  assignedTeamId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerReason?: string;
  staffSummary?: string;
  internalNotes?: string;
  customerVisibleSummary?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  isDemo?: boolean;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  fromStatus?: AppointmentStatus;
  toStatus: AppointmentStatus;
  actorStaffId?: string;
  note?: string;
  createdAt: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  remindAt: string;
  channel: 'portal' | 'email' | 'sms';
  status: 'scheduled' | 'sent' | 'cancelled';
}

export interface AppointmentSettings {
  minimumNoticeHours: number;
  maximumAdvanceDays: number;
  bufferMinutes: number;
  defaultTimezone: string;
  reminderHoursBefore: number[];
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  requested: 'Requested',
  pending_confirmation: 'Pending Confirmation',
  confirmed: 'Confirmed',
  reschedule_requested: 'Reschedule Requested',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};
