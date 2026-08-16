/**
 * Sprint 24 — service activation with explicit GO / PILOT / HOLD / BLOCKED states.
 * Software ready ≠ business ready ≠ publicly enabled.
 */

import type { ServiceLaunchEntry, ServiceLaunchState } from './types';

export const SERVICE_LAUNCH_MATRIX: ServiceLaunchEntry[] = [
  {
    id: 'permitting',
    label: 'Permitting',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'LIMITED_PILOT',
    publicCta: 'Start service request (pilot)',
    notes: 'Strongest pilot candidate; manual external filing',
  },
  {
    id: 'tags',
    label: 'Tag Services',
    softwareStatus: 'READY',
    workflowStatus: 'PARTIAL',
    pricingStatus: 'NOT_SET',
    staffProcessStatus: 'DRAFT',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'PARTIAL',
    customerDisclosureStatus: 'PENDING',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'HOLD',
    publicCta: 'Request Information',
    notes: 'State-specific rules — do not hard-code globally',
  },
  {
    id: 'fuel-tax',
    label: 'Fuel Tax',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'NOT_APPLICABLE',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'INTERNAL_ONLY',
    publicCta: 'Staff-coordinated filing',
    notes: 'No direct government API — staff manual process',
  },
  {
    id: 'road-tax',
    label: 'Road/Use Tax',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'NOT_APPLICABLE',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'INTERNAL_ONLY',
    publicCta: 'Staff-coordinated filing',
  },
  {
    id: 'authorities',
    label: 'Authority Services',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'LIMITED_PILOT',
    publicCta: 'Road Ready / service request',
    notes: 'Not FMCSA — government affiliation disclaimer required',
  },
  {
    id: 'boc3',
    label: 'BOC-3',
    softwareStatus: 'READY',
    workflowStatus: 'PARTIAL',
    pricingStatus: 'NOT_SET',
    staffProcessStatus: 'DRAFT',
    providerStatus: 'BLOCKED',
    businessAuthorizationStatus: 'BLOCKED',
    documentsStatus: 'PARTIAL',
    customerDisclosureStatus: 'PENDING',
    paymentStatus: 'DISABLED',
    supportStatus: 'NOT_READY',
    activationState: 'BLOCKED',
    publicCta: 'Request Information',
    notes: 'PARTNER/MANUAL — process agent requirements not verified',
  },
  {
    id: 'formation',
    label: 'Business Formation',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'LIMITED_PILOT',
    publicCta: 'Start intake',
    notes: 'Administrative assistance — not legal advice',
  },
  {
    id: 'dispatch',
    label: 'Dispatching',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'NOT_REQUIRED',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'SANDBOX',
    supportStatus: 'PARTIAL',
    activationState: 'GO',
    publicCta: 'Dispatch enrollment — manual loads supported',
    notes: 'Dispatch agreement gate before live ops',
  },
  {
    id: 'brokerage',
    label: 'Brokerage',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'NOT_SET',
    staffProcessStatus: 'DRAFT',
    providerStatus: 'BLOCKED',
    businessAuthorizationStatus: 'BLOCKED',
    documentsStatus: 'PARTIAL',
    customerDisclosureStatus: 'PENDING',
    paymentStatus: 'DISABLED',
    supportStatus: 'NOT_READY',
    activationState: 'BLOCKED',
    publicCta: 'BUSINESS ACTIVATION REQUIRED',
    notes: 'Authority/licensing separate from software',
  },
  {
    id: 'factoring',
    label: 'Factoring (partner)',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'DRAFT',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'PENDING',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'DISABLED',
    supportStatus: 'PARTIAL',
    activationState: 'HOLD',
    publicCta: 'Partner referral — All In One does not fund receivables',
    notes: 'PARTNER_REFERRAL model — not direct factor',
  },
  {
    id: 'insurance',
    label: 'Insurance (referral)',
    softwareStatus: 'READY',
    workflowStatus: 'READY',
    pricingStatus: 'NOT_SET',
    staffProcessStatus: 'DEFINED',
    providerStatus: 'PENDING',
    businessAuthorizationStatus: 'PENDING',
    documentsStatus: 'READY',
    customerDisclosureStatus: 'DRAFT',
    paymentStatus: 'DISABLED',
    supportStatus: 'PARTIAL',
    activationState: 'HOLD',
    publicCta: 'Assistance/referral — no bind without licensing',
    notes: 'REFERRAL/assistance — no coverage promise',
  },
];

const SLUG_MAP: Record<string, string> = {
  permitting: 'permitting',
  tags: 'tags',
  'tag-services': 'tags',
  'fuel-tax': 'fuel-tax',
  'fuel-taxes': 'fuel-tax',
  'road-tax': 'road-tax',
  'road-use-tax': 'road-tax',
  authorities: 'authorities',
  'operating-authority': 'authorities',
  boc3: 'boc3',
  'boc-3': 'boc3',
  'business-formation': 'formation',
  formation: 'formation',
  dispatching: 'dispatch',
  dispatch: 'dispatch',
  brokerage: 'brokerage',
  factoring: 'factoring',
  insurance: 'insurance',
};

export function getServiceLaunchEntry(serviceSlug: string): ServiceLaunchEntry | undefined {
  const id = SLUG_MAP[serviceSlug.toLowerCase()] ?? serviceSlug;
  return SERVICE_LAUNCH_MATRIX.find((s) => s.id === id);
}

export function canCustomerStartService(serviceSlug: string): boolean {
  const entry = getServiceLaunchEntry(serviceSlug);
  if (!entry) return true;
  return entry.activationState === 'GO' || entry.activationState === 'LIMITED_PILOT';
}

export function getPublicServiceCta(serviceSlug: string): { label: string; allowed: boolean; state: ServiceLaunchState } {
  const entry = getServiceLaunchEntry(serviceSlug);
  if (!entry) return { label: 'Get Started', allowed: true, state: 'GO' };
  const allowed = canCustomerStartService(serviceSlug);
  return { label: entry.publicCta, allowed, state: entry.activationState };
}

export function getPilotServices(): ServiceLaunchEntry[] {
  return SERVICE_LAUNCH_MATRIX.filter((s) => s.activationState === 'LIMITED_PILOT' || s.activationState === 'GO');
}

export function getBlockedServices(): ServiceLaunchEntry[] {
  return SERVICE_LAUNCH_MATRIX.filter((s) => s.activationState === 'BLOCKED' || s.activationState === 'HOLD');
}
