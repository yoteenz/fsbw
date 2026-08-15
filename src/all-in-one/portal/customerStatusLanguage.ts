/** Customer-facing status language — raw enums should not reach the UI. */

const STATUS_MAP: Record<string, string> = {
  documents_needed: 'DOCUMENT NEEDED',
  information_needed: 'INFORMATION NEEDED',
  under_review: 'UNDER REVIEW',
  provider_review: 'WITH FACTORING PROVIDER',
  awaiting_external_action: 'WAITING ON EXTERNAL PROCESSING',
  waiting_on_customer: 'WAITING ON YOU',
  waiting_on_you: 'WAITING ON YOU',
  waiting_on_all_in_one: 'WAITING ON ALL IN ONE',
  in_progress: 'IN PROGRESS',
  submitted: 'SUBMITTED',
  partner_review: 'PARTNER REVIEW',
  quote_options_reported: 'OPTIONS RECEIVED',
  customer_review: 'REVIEW OPTIONS',
  policy_selected_external: 'POLICY SELECTED',
  expiring_soon: 'EXPIRING SOON',
  pod_needed: 'POD NEEDED',
  in_transit: 'IN TRANSIT',
  booked: 'BOOKED',
  complete: 'COMPLETED',
  active: 'ACTIVE',
  enrolled: 'ACTIVE',
  interested: 'REQUEST IN PROGRESS',
  not_enrolled: 'AVAILABLE',
};

export function formatCustomerStatus(raw?: string): string {
  if (!raw) return 'STATUS UNKNOWN';
  const key = raw.toLowerCase().replace(/\s+/g, '_');
  if (STATUS_MAP[key]) return STATUS_MAP[key];
  return raw.replace(/_/g, ' ').toUpperCase();
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function clientTypeLabel(clientType: string): string {
  switch (clientType) {
    case 'owner_operator':
      return 'Owner-Operator';
    case 'fleet':
      return 'Fleet';
    case 'carrier':
      return 'Motor Carrier';
    case 'shipper':
      return 'Shipper';
    default:
      return 'Business';
  }
}

export const PLAIN_LANGUAGE: Record<string, string> = {
  IRP: 'Apportioned Registration (IRP)',
  IFTA: 'Fuel Tax Account (IFTA)',
  'BOC-3': 'Process Agent Filing (BOC-3)',
  COI: 'Certificate of Insurance',
  POD: 'Proof of Delivery',
  BOL: 'Bill of Lading',
};

export function explainTerm(term: string): string | undefined {
  return PLAIN_LANGUAGE[term.toUpperCase()] ?? PLAIN_LANGUAGE[term];
}
