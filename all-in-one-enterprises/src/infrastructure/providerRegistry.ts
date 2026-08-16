/**
 * Sprint 23 — provider credential registry (no secret values).
 */

import type { ProviderProductionState } from './types';

export interface ProviderReadinessEntry {
  id: string;
  label: string;
  state: ProviderProductionState;
  credentialConfigured: boolean;
  webhookConfigured: boolean;
  sandboxTested: boolean;
  productionApproved: boolean;
  lastVerified: string | null;
  ownerCategory: 'TECHNICAL' | 'BUSINESS' | 'PROVIDER' | 'LEGAL';
  notes?: string;
}

export const PROVIDER_REGISTRY: ProviderReadinessEntry[] = [
  { id: 'payment', label: 'Payments', state: 'ARCHITECTURE_ONLY', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'BUSINESS', notes: 'Demo mode; dedicated merchant pending' },
  { id: 'email', label: 'Email', state: 'NOT_CONFIGURED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'PROVIDER' },
  { id: 'sms', label: 'SMS', state: 'DISABLED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'BUSINESS', notes: 'Registration pending' },
  { id: 'maps', label: 'Maps', state: 'ARCHITECTURE_ONLY', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'TECHNICAL' },
  { id: 'calendar', label: 'Calendar', state: 'ARCHITECTURE_ONLY', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'TECHNICAL' },
  { id: 'load-board', label: 'Load board', state: 'NOT_CONFIGURED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'PROVIDER' },
  { id: 'factoring', label: 'Factoring partner', state: 'PRODUCTION_BLOCKED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'BUSINESS', notes: 'Partner agreement required — referral/facilitation mode' },
  { id: 'insurance', label: 'Insurance partner', state: 'PRODUCTION_BLOCKED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'LEGAL', notes: 'Referral/assistance — no bind/sell without licensing' },
  { id: 'regulatory-fmcsa', label: 'FMCSA / government', state: 'ARCHITECTURE_ONLY', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'LEGAL', notes: 'MANUAL EXTERNAL PROCESS — no fabricated API' },
  { id: 'accounting', label: 'Accounting', state: 'NOT_CONFIGURED', credentialConfigured: false, webhookConfigured: false, sandboxTested: false, productionApproved: false, lastVerified: null, ownerCategory: 'BUSINESS' },
];

export function getProviderReadinessSummary(): ProviderReadinessEntry[] {
  return PROVIDER_REGISTRY;
}
