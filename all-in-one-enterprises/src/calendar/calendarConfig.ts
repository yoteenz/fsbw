/** Central expiration thresholds — single source of truth */
export const EXPIRATION_THRESHOLDS_DAYS = [90, 60, 30, 14, 7, 1] as const;

export const PRIORITY_BY_DAYS: { maxDays: number; priority: import('./calendarTypes').CalendarPriority; label: string }[] = [
  { maxDays: -1, priority: 'critical', label: 'Expired' },
  { maxDays: 0, priority: 'critical', label: 'Due Today' },
  { maxDays: 7, priority: 'urgent', label: 'Urgent' },
  { maxDays: 14, priority: 'high', label: 'High Priority' },
  { maxDays: 30, priority: 'attention', label: 'Needs Attention' },
  { maxDays: 60, priority: 'upcoming', label: 'Upcoming' },
  { maxDays: 90, priority: 'informational', label: 'Informational' },
  { maxDays: Infinity, priority: 'informational', label: 'Scheduled' },
];

export const DEADLINE_TYPE_LABELS: Record<string, string> = {
  document_expiration: 'Document Expiration',
  registration_renewal: 'Registration Renewal',
  insurance_renewal: 'Insurance Renewal',
  permit_expiration: 'Permit Expiration',
  tax_filing: 'Tax Filing',
  ifta_filing: 'IFTA Filing',
  road_tax: 'Road Tax',
  authority_review: 'Authority Review',
  service_deadline: 'Service Deadline',
  document_due: 'Document Due',
  customer_action: 'Customer Action',
  renewal_window: 'Renewal Window',
  other: 'Other',
};
