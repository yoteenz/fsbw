import type { RenewalDefinition } from './renewalTypes';

export const RENEWAL_DEFINITIONS: RenewalDefinition[] = [
  { renewalType: 'registration', title: 'Vehicle Registration Renewal', category: 'registration', deadlineType: 'registration_renewal', windowDays: 90, serviceSlug: 'vehicle-registration' },
  { renewalType: 'irp', title: 'IRP Renewal', category: 'registration', deadlineType: 'registration_renewal', windowDays: 90, serviceSlug: 'irp-registration' },
  { renewalType: 'insurance', title: 'Insurance Renewal', category: 'insurance', deadlineType: 'insurance_renewal', windowDays: 60, serviceSlug: 'insurance-review' },
  { renewalType: 'permit', title: 'Permit Renewal', category: 'permits', deadlineType: 'permit_expiration', windowDays: 30, serviceSlug: 'permitting' },
  { renewalType: 'ifta', title: 'IFTA Renewal', category: 'tax_fuel', deadlineType: 'ifta_filing', windowDays: 60, serviceSlug: 'ifta-setup' },
];

export function findRenewalDefinition(type: string): RenewalDefinition | undefined {
  return RENEWAL_DEFINITIONS.find((d) => d.renewalType === type);
}
