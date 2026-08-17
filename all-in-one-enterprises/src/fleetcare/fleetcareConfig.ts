/**
 * FleetCare pricing & policy configuration — single source (not hardcoded in UI).
 */

import { dollarsToMinor } from '../billing/money';

export const FLEETCARE_PRICING_CONFIG = {
  marketplaceFeeRate: 0.1,
  leadAttributionWindowDays: null as number | null,
  feeEarnedPolicy: 'completed_confirmed_service' as const,
  foundingProvider: {
    planCode: 'founding_fleetcare_provider',
    monthlyMinor: 0,
    feeRate: 0.1,
  },
  clientPlans: {
    free: {
      code: 'fleetcare_free',
      name: 'FleetCare Free',
      monthlyMinor: 0,
      features: [
        'Request maintenance/repair service',
        'Provider matching',
        'Basic repair history',
        'Completed-job records',
      ],
    },
    plus: {
      code: 'fleetcare_plus',
      name: 'FleetCare+',
      monthlyMinor: dollarsToMinor(19),
      features: [
        'Maintenance schedules',
        'Preventive-maintenance reminders',
        'Enhanced vehicle history',
        'Digital Records Vault integration',
      ],
    },
    pro: {
      code: 'fleetcare_pro',
      name: 'FleetCare Pro',
      monthlyMinor: dollarsToMinor(39),
      perVehicleMinor: dollarsToMinor(5),
      features: [
        'Multi-vehicle fleet maintenance',
        'Preventive-maintenance analytics',
        'Priority coordination features',
        'Fleet-level maintenance views',
      ],
    },
  },
  providerPlans: {
    founding: {
      code: 'founding_fleetcare_provider',
      name: 'Founding FleetCare Provider',
      monthlyMinor: 0,
      feeRate: 0.1,
    },
    standard: {
      code: 'fleetcare_provider',
      name: 'FleetCare Provider',
      monthlyMinor: dollarsToMinor(49),
      feeRate: 0.1,
      perLocation: true,
    },
    pro: {
      code: 'fleetcare_provider_pro',
      name: 'FleetCare Provider Pro',
      monthlyMinor: dollarsToMinor(99),
      feeRate: 0.1,
      perLocation: true,
    },
  },
} as const;

export const FLEETCARE_LEGAL_DISCLOSURES = {
  independentProvider:
    'Repair services are performed by independent FleetCare network providers. AIO coordinates matching, records, and platform services — AIO is not the repair provider.',
  referralEconomic:
    'AIO may receive platform or referral fees from independent providers for work originated through the FleetCare Network.',
  verifiedBadge:
    'AIO Verified indicates completion of AIO provider eligibility review — not a guarantee of workmanship or an AIO warranty.',
} as const;

export const FLEETCARE_SERVICE_CATEGORIES = [
  { code: 'preventive_maintenance', label: 'Preventive Maintenance', enabled: true },
  { code: 'diagnostics', label: 'Diagnostics', enabled: true },
  { code: 'engine_repair', label: 'Engine Repair', enabled: true },
  { code: 'brakes', label: 'Brakes', enabled: true },
  { code: 'electrical', label: 'Electrical', enabled: true },
  { code: 'tires', label: 'Tires', enabled: true },
  { code: 'truck_repair', label: 'Truck Repair', enabled: true },
  { code: 'trailer_repair', label: 'Trailer Repair', enabled: true },
  { code: 'mobile_diesel_repair', label: 'Mobile Diesel Repair', enabled: true },
  { code: 'roadside_assistance', label: 'Roadside Assistance', enabled: false },
  { code: 'towing', label: 'Towing', enabled: false },
  { code: 'reefer_repair', label: 'Reefer Repair', enabled: false },
  { code: 'welding', label: 'Welding', enabled: false },
  { code: 'dot_inspection_support', label: 'DOT Inspection Support', enabled: false },
  { code: 'truck_wash', label: 'Truck Wash / Detailing', enabled: false },
] as const;

export const FLEETCARE_TICKET_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  searching: 'Searching for Available FleetCare Providers',
  matched: 'Provider Matched',
  provider_reviewing: 'Provider Reviewing',
  provider_accepted: 'Provider Confirmed',
  provider_declined: 'Provider Declined',
  awaiting_estimate: 'Awaiting Estimate',
  estimate_sent: 'Estimate Ready',
  awaiting_customer_authorization: 'Awaiting Your Authorization',
  authorized: 'Authorized',
  scheduled: 'Scheduled',
  in_service: 'In Service',
  awaiting_parts: 'Awaiting Parts',
  on_hold: 'On Hold',
  completed: 'Completed',
  customer_confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  closed: 'Closed',
};

export function getClientStatusMessage(status: string, urgency: string): string {
  if (status === 'searching') {
    return urgency === 'roadside_urgent'
      ? 'Searching for available FleetCare providers…'
      : 'Searching for available FleetCare providers…';
  }
  if (status === 'provider_accepted') return 'Provider confirmed';
  return FLEETCARE_TICKET_STATUS_LABELS[status] ?? status;
}
