/**
 * FleetCare referral / marketplace fee calculation — configurable, attribution-aware.
 */

import { FLEETCARE_PRICING_CONFIG } from './fleetcareConfig';
import type { DemoStore } from '../demo/demoTypes';
import type { MaintenanceTicket, ReferralTransaction, ServiceJob } from './fleetcareTypes';

export function isPreexistingRelationship(
  providerId: string,
  clientOrganizationId: string,
  store: DemoStore,
): boolean {
  const rel = store.fleetcarePreexistingRelationships?.find(
    (r) =>
      r.providerId === providerId
      && r.clientOrganizationId === clientOrganizationId
      && r.reviewStatus === 'approved',
  );
  return Boolean(rel);
}

export function shouldAssessReferralFee(ticket: MaintenanceTicket, store: DemoStore): boolean {
  if (!ticket.aioOriginated) return false;
  if (!ticket.providerId) return false;
  if (
    ticket.preexistingRelationshipId
    || isPreexistingRelationship(ticket.providerId, ticket.clientOrganizationId, store)
  ) {
    return false;
  }
  return ticket.leadSource === 'aio_marketplace' || ticket.leadSource === 'manual_assignment';
}

export function resolveFeeRate(providerId: string, store: DemoStore): number {
  const provider = store.fleetcareProviders?.find((p) => p.id === providerId);
  if (provider?.providerTier === 'founding') {
    return FLEETCARE_PRICING_CONFIG.foundingProvider.feeRate;
  }
  return FLEETCARE_PRICING_CONFIG.marketplaceFeeRate;
}

export function calculateReferralFee(
  ticket: MaintenanceTicket,
  job: ServiceJob,
  store: DemoStore,
): ReferralTransaction | null {
  if (FLEETCARE_PRICING_CONFIG.feeEarnedPolicy !== 'completed_confirmed_service') return null;
  if (!shouldAssessReferralFee(ticket, store)) return null;
  if (!job.finalAmountMinor || job.finalAmountMinor <= 0) return null;

  const feeRate = resolveFeeRate(job.providerId, store);
  const feeAmountMinor = Math.round(job.finalAmountMinor * feeRate);
  const preexisting = isPreexistingRelationship(job.providerId, ticket.clientOrganizationId, store);

  return {
    id: `ref-${job.id}`,
    ticketId: ticket.id,
    jobId: job.id,
    providerId: job.providerId,
    clientOrganizationId: ticket.clientOrganizationId,
    leadSource: ticket.leadSource,
    aioOriginated: ticket.aioOriginated,
    preexistingRelationship: preexisting,
    grossServiceValueMinor: job.finalAmountMinor,
    feeRate,
    feeAmountMinor,
    feeStatus: preexisting ? 'waived' : 'calculated',
    earnedAt: new Date().toISOString(),
  };
}

export function clientContactMayBeReleased(ticket: MaintenanceTicket): boolean {
  return [
    'provider_accepted',
    'awaiting_estimate',
    'estimate_sent',
    'awaiting_customer_authorization',
    'authorized',
    'scheduled',
    'in_service',
    'awaiting_parts',
    'on_hold',
    'completed',
    'customer_confirmed',
    'closed',
  ].includes(ticket.status);
}
