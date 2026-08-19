import type {
  BrokerageCapability,
  BrokerageQuoteStatus,
  CarrierOfferStatus,
  CarrierPayableStatus,
  ShipmentRequestStatus,
} from './brokerageTypes';

export const DEMO_BROKERAGE_LABEL =
  'AIO Brokerage (demo) — All In One is the broker. Carriers receive AIO-distributed freight; this is not a third-party broker marketplace.';

export const DEFAULT_BROKERAGE_CAPABILITY: BrokerageCapability = 'demo';

export const BROKERAGE_READINESS_CHECKLIST: { key: string; label: string }[] = [
  { key: 'broker_authority', label: 'Broker Authority' },
  { key: 'boc3', label: 'BOC-3' },
  { key: 'bond_trust', label: 'Surety Bond / Trust' },
  { key: 'business_entity', label: 'Business Entity' },
  { key: 'insurance', label: 'Required Insurance (if applicable)' },
  { key: 'shipper_agreement', label: 'Shipper Agreement Template' },
  { key: 'carrier_agreement', label: 'Carrier Agreement Template' },
  { key: 'rate_confirmation_template', label: 'Rate Confirmation Template' },
  { key: 'payment_accounting', label: 'Payment / Accounting Setup' },
  { key: 'claims_procedures', label: 'Claims Procedures' },
  { key: 'fraud_procedures', label: 'Fraud Procedures' },
  { key: 'privacy_security', label: 'Privacy / Security Review' },
  { key: 'legal_review', label: 'Legal Review' },
];

export const SHIPMENT_REQUEST_STATUS_LABELS: Record<ShipmentRequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  info_required: 'Action Required',
  under_review: 'Under AIO Review',
  quote_pending: 'Quote in Preparation',
  quote_preparation: 'Quote in Preparation',
  quoted: 'Quote Sent',
  quote_sent: 'Quote Sent',
  awaiting_shipper_approval: 'Awaiting Your Approval',
  accepted: 'Accepted',
  approved: 'Approved',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  converted_to_load: 'Brokerage Load Created',
};

export const BROKERAGE_QUOTE_STATUS_LABELS: Record<BrokerageQuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  revised: 'Revised',
  converted: 'Converted',
};

export const CARRIER_OFFER_STATUS_LABELS: Record<CarrierOfferStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
  revised: 'Revised',
};

export const CARRIER_PAYABLE_STATUS_LABELS: Record<CarrierPayableStatus, string> = {
  pending_documents: 'Pending Documents',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  scheduled_future: 'Scheduled',
  paid_future: 'Paid (Reported)',
  disputed: 'Disputed',
  hold: 'Hold',
  cancelled: 'Cancelled',
};

export const RATE_CONFIRMATION_DEV_TEMPLATE =
  'DEVELOPMENT TEMPLATE — NOT FOR PRODUCTION USE';
