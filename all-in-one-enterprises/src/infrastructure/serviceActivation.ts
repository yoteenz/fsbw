/**
 * Sprint 23 — service activation states (software ≠ business ready).
 */

import type { ServiceActivationState } from './types';

export interface ServiceActivationEntry {
  id: string;
  label: string;
  softwareReady: boolean;
  backendReady: boolean;
  providerReady: boolean;
  businessReady: boolean;
  publiclyEnabled: boolean;
  activationState: ServiceActivationState;
  customerCta: string;
  notes?: string;
}

export const SERVICE_ACTIVATION_MATRIX: ServiceActivationEntry[] = [
  { id: 'permitting', label: 'Permitting', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'ACTIVE', customerCta: 'Start service request (demo persistence)' },
  { id: 'tags', label: 'Tag Services', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'ACTIVE', customerCta: 'Request Information' },
  { id: 'fuel-tax', label: 'Fuel Tax', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'INTERNAL_ONLY', customerCta: 'Staff workflow — manual filing', notes: 'No direct government API' },
  { id: 'road-tax', label: 'Road/Use Tax', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'INTERNAL_ONLY', customerCta: 'Staff workflow' },
  { id: 'authorities', label: 'Authority Services', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'ACTIVE', customerCta: 'Start Road Ready / service request' },
  { id: 'boc3', label: 'BOC-3', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'PARTNER_PENDING', customerCta: 'Request Information', notes: 'PARTNER/MANUAL WORKFLOW until provider ready' },
  { id: 'formation', label: 'Business Formation', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'ACTIVE', customerCta: 'Start intake' },
  { id: 'dispatch', label: 'Dispatching', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'ACTIVE', customerCta: 'Manual load entry supported without load board' },
  { id: 'brokerage', label: 'Brokerage', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: false, activationState: 'PAUSED', customerCta: 'BUSINESS ACTIVATION REQUIRED', notes: 'Software ready; authority/licensing separate' },
  { id: 'factoring', label: 'Factoring (partner)', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'PARTNER_PENDING', customerCta: 'Partner referral — not direct funding' },
  { id: 'insurance', label: 'Insurance (referral)', softwareReady: true, backendReady: false, providerReady: false, businessReady: false, publiclyEnabled: true, activationState: 'PARTNER_PENDING', customerCta: 'Assistance/referral — no bind without licensing' },
];
