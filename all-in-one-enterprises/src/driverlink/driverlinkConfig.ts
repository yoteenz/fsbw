/**
 * DriverLink pricing, disclosures, credential taxonomy — centralized config.
 */

export const DRIVERLINK_PRICING_CONFIG = {
  driverPlans: {
    free: {
      code: 'driverlink_driver_free',
      name: 'DriverLink Free',
      monthlyMinor: 0,
      active: true,
    },
    pro: {
      code: 'driverlink_driver_pro',
      name: 'DriverLink Pro',
      monthlyMinor: 999,
      active: false,
    },
  },
  companyPlans: {
    access: {
      code: 'driverlink_company_access',
      name: 'DriverLink Access',
      monthlyMinor: 4900,
      active: false,
    },
    pro: {
      code: 'driverlink_company_pro',
      name: 'DriverLink Pro',
      monthlyMinor: 9900,
      active: false,
    },
    fleet: {
      code: 'driverlink_fleet_hiring',
      name: 'Fleet Hiring',
      monthlyMinor: 19900,
      active: false,
    },
  },
  placementFeeRate: null as number | null,
  leadAttributionWindowDays: null as number | null,
} as const;

export const DRIVERLINK_LEGAL_DISCLOSURES = {
  marketplace:
    'AIO DriverLink is a technology marketplace and recruiting platform. Hiring companies remain responsible for employer and carrier obligations.',
  notEmployer:
    'AIO does not employ drivers, make final hiring decisions, or certify legal qualification solely from uploaded documents.',
  clearinghouse:
    'Clearinghouse pre-employment queries require employer action and lawful process — uploaded documents alone do not complete a Clearinghouse query.',
  dataRelease:
    'Employers receive only the information you authorize for each application. AIO does not grant permanent access to your full credential vault.',
} as const;

export const DRIVERLINK_CREDENTIAL_TYPES = [
  { code: 'cdl', requiresReview: true },
  { code: 'medical_certificate', requiresReview: true },
  { code: 'endorsements', requiresReview: true },
  { code: 'training', requiresReview: false },
  { code: 'mvr', requiresReview: true },
  { code: 'dq_documents', requiresReview: true },
  { code: 'clearinghouse', requiresReview: true },
  { code: 'employment_application', requiresReview: false },
] as const;

export const DRIVERLINK_ENDORSEMENTS = [
  'Hazmat',
  'Tanker',
  'Doubles/Triples',
  'Passenger',
] as const;

export const DRIVERLINK_EQUIPMENT_TYPES = [
  'Dry Van',
  'Reefer',
  'Flatbed',
  'Tanker',
  'Intermodal',
  'Step Deck',
] as const;

export function getDriverLinkStatusKey(status: string): string {
  return `driverLink:status.${status}`;
}

export function getCredentialStatusKey(status: string): string {
  return `driverLink:credentialStatus.${status}`;
}

export function getCredentialTypeKey(type: string): string {
  return `driverLink:credentialTypes.${type}`;
}
