import type { LoadDeclineReason, LoadIssueType, LoadOperationalStatus, TruckAvailabilityStatus } from './dispatchTypes';

export const DEMO_DISPATCH_LABEL = 'DEMO · Fictional loads, rates, and brokers for review only';

export const LOAD_DECLINE_REASON_LABELS: Record<LoadDeclineReason, string> = {
  rate_too_low: 'Rate Too Low',
  too_much_deadhead: 'Too Much Deadhead',
  destination: 'Destination',
  schedule: 'Schedule',
  home_time: 'Home Time',
  equipment_issue: 'Equipment Issue',
  other: 'Other',
};

export const LOAD_ISSUE_TYPE_LABELS: Record<LoadIssueType, string> = {
  pickup_delay: 'Pickup Delay',
  delivery_delay: 'Delivery Delay',
  detention: 'Detention',
  breakdown: 'Breakdown',
  broker_issue: 'Broker Issue',
  rate_dispute: 'Rate Dispute',
  document_issue: 'Document Issue',
  cargo_issue: 'Cargo Issue',
  other: 'Other',
};

export const TRUCK_AVAILABILITY_LABELS: Record<TruckAvailabilityStatus, string> = {
  available: 'Available',
  available_soon: 'Available Soon',
  booked: 'Booked',
  in_transit: 'In Transit',
  unavailable: 'Unavailable',
  maintenance: 'Maintenance',
  home_time: 'Home Time',
  paused: 'Paused',
};

export const LOAD_STATUS_LABELS: Record<LoadOperationalStatus, string> = {
  opportunity: 'Opportunity',
  booking_in_progress: 'Booking In Progress',
  booked: 'Booked',
  dispatched: 'Dispatched',
  en_route_pickup: 'En Route to Pickup',
  at_pickup: 'At Pickup',
  loaded: 'Loaded',
  in_transit: 'In Transit',
  at_delivery: 'At Delivery',
  delivered: 'Delivered',
  pod_needed: 'POD Needed',
  complete: 'Complete',
  cancelled: 'Cancelled',
  issue: 'Issue',
};

export const DISPATCH_AGREEMENT_PLACEHOLDER =
  'Dispatch service agreement placeholder — attorney-approved terms required before production. No income or load guarantees implied.';

export const ACTIVE_LOAD_STATUSES: LoadOperationalStatus[] = [
  'booked',
  'dispatched',
  'en_route_pickup',
  'at_pickup',
  'loaded',
  'in_transit',
  'at_delivery',
  'delivered',
  'pod_needed',
  'issue',
];

export const BOARD_COLUMN_STATUSES: Record<string, LoadOperationalStatus[]> = {
  offered: ['opportunity'],
  booking: ['booking_in_progress'],
  pickup: ['booked', 'dispatched', 'en_route_pickup', 'at_pickup', 'loaded'],
  in_transit: ['in_transit'],
  delivery: ['at_delivery', 'delivered'],
  pod_needed: ['pod_needed'],
  complete: ['complete'],
};
