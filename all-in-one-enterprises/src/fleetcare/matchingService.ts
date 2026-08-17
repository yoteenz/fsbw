/**
 * FleetCare matching — eligibility pool (supports one or many providers).
 */

import type { DemoStore } from '../demo/demoTypes';
import type { MaintenanceTicket, ServiceProvider, TicketMatch } from './fleetcareTypes';
import { FLEETCARE_SERVICE_CATEGORIES } from './fleetcareConfig';

export interface MatchCriteria {
  serviceCategoryCode: string;
  urgency: string;
  location?: { stateCode?: string; city?: string; latitude?: number; longitude?: number };
  mobileRequired?: boolean;
}

function providerOffersService(provider: ServiceProvider, code: string): boolean {
  return provider.active && provider.serviceCategoryCodes.includes(code);
}

function providerVerifiedEnough(provider: ServiceProvider): boolean {
  return ['aio_verified', 'pending_review'].includes(provider.verificationStatus);
}

function insuranceActive(providerId: string, store: DemoStore): boolean {
  const policies = store.fleetcareProviderInsurance?.filter((p) => p.providerId === providerId) ?? [];
  if (!policies.length) return true;
  const now = new Date();
  return policies.some((p) => {
    if (p.verificationStatus === 'expired') return false;
    if (!p.expirationDate) return true;
    return new Date(p.expirationDate) > now;
  });
}

function inServiceArea(provider: ServiceProvider, location?: MatchCriteria['location']): boolean {
  if (!location?.stateCode) return true;
  const areas = provider.serviceAreas;
  if (!areas.length) return true;
  return areas.some(
    (a) =>
      a.areaType === 'state' && a.stateCode === location.stateCode
      || a.areaType === 'city' && a.city?.toLowerCase() === location.city?.toLowerCase()
      || a.areaType === 'radius',
  );
}

export function getEligibleProviders(criteria: MatchCriteria, store: DemoStore): ServiceProvider[] {
  const providers = store.fleetcareProviders ?? [];
  return providers.filter((p) => {
    if (!providerOffersService(p, criteria.serviceCategoryCode)) return false;
    if (!providerVerifiedEnough(p)) return false;
    if (!insuranceActive(p.id, store)) return false;
    if (criteria.mobileRequired && !p.mobileServiceAvailable) return false;
    if (!inServiceArea(p, criteria.location)) return false;
    return true;
  });
}

export function scoreProvider(provider: ServiceProvider, criteria: MatchCriteria): number {
  let score = 50;
  if (provider.verificationStatus === 'aio_verified') score += 20;
  if (criteria.urgency === 'roadside_urgent' && provider.emergencyAvailable) score += 15;
  if (criteria.mobileRequired && provider.mobileServiceAvailable) score += 10;
  if (provider.providerTier === 'founding') score += 5;
  return score;
}

export function matchTicketToProviders(ticket: MaintenanceTicket, store: DemoStore): TicketMatch[] {
  const category = FLEETCARE_SERVICE_CATEGORIES.find((c) => c.code === ticket.serviceCategoryCode);
  if (category && !category.enabled) return [];

  const criteria: MatchCriteria = {
    serviceCategoryCode: ticket.serviceCategoryCode,
    urgency: ticket.urgency,
    location: ticket.location,
    mobileRequired: ticket.urgency === 'roadside_urgent' || !ticket.location?.city,
  };

  const eligible = getEligibleProviders(criteria, store);
  return eligible
    .map((provider) => ({
      id: `match-${ticket.id}-${provider.id}`,
      ticketId: ticket.id,
      providerId: provider.id,
      matchScore: scoreProvider(provider, criteria),
      eligible: true,
      matchReason: {
        service: criteria.serviceCategoryCode,
        verified: provider.verificationStatus,
        tier: provider.providerTier,
      },
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function pickPrimaryMatch(matches: TicketMatch[]): TicketMatch | undefined {
  return matches.find((m) => m.eligible);
}
