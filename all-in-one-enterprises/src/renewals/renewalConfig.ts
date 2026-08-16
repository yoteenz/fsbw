import type { RenewalDefinition } from './renewalTypes';

export const RENEWAL_DEFINITIONS: RenewalDefinition[] = [
  { renewalType: 'registration', title: 'Vehicle Registration Renewal', category: 'registration', deadlineType: 'registration_renewal', windowDays: 90, serviceSlug: 'tag-services' },
  { renewalType: 'irp', title: 'IRP Renewal', category: 'registration', deadlineType: 'registration_renewal', windowDays: 90, serviceSlug: 'irp-apportioned-registration' },
  { renewalType: 'insurance', title: 'Insurance Renewal', category: 'insurance', deadlineType: 'insurance_renewal', windowDays: 60, serviceSlug: 'general-transportation-insurance-review' },
  { renewalType: 'permit', title: 'Permit Renewal', category: 'permits', deadlineType: 'permit_expiration', windowDays: 30, serviceSlug: 'trip-permits' },
  { renewalType: 'ifta', title: 'IFTA Renewal', category: 'tax_fuel', deadlineType: 'ifta_filing', windowDays: 60, serviceSlug: 'ifta-fuel-tax-assistance' },
  { renewalType: 'ucr', title: 'UCR Renewal', category: 'registration', deadlineType: 'ucr_renewal', windowDays: 90, serviceSlug: 'ucr-renewal' },
  { renewalType: 'mcs150', title: 'MCS-150 Biennial Update', category: 'authority', deadlineType: 'biennial_update', windowDays: 90, serviceSlug: 'mcs-150-biennial-update' },
  { renewalType: 'hvut', title: 'HVUT / Form 2290', category: 'tax_fuel', deadlineType: 'tax_filing', windowDays: 60, serviceSlug: 'hvut-form-2290' },
  { renewalType: 'consortium', title: 'Consortium Renewal', category: 'fleet', deadlineType: 'consortium_renewal', windowDays: 60, serviceSlug: 'drug-alcohol-consortium' },
  { renewalType: 'eld', title: 'ELD Subscription Renewal', category: 'fleet', deadlineType: 'subscription_renewal', windowDays: 30, serviceSlug: 'eld-services' },
  { renewalType: 'authority', title: 'Authority Maintenance', category: 'authority', deadlineType: 'authority_maintenance', windowDays: 90, serviceSlug: 'authority-maintenance' },
];

export function findRenewalDefinition(type: string): RenewalDefinition | undefined {
  return RENEWAL_DEFINITIONS.find((d) => d.renewalType === type);
}
