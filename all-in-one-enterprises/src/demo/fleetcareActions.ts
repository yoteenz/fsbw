/**
 * FleetCare demo actions — ticket lifecycle, matching, estimates, completion.
 */

import type { DemoStore } from './demoTypes';
import { loadDemoStore, saveDemoStore } from './demoStore';
import { matchTicketToProviders } from '../fleetcare/matchingService';
import { calculateReferralFee, clientContactMayBeReleased } from '../fleetcare/referralService';
import type {
  FleetCareDrivableStatus,
  FleetCareTicketStatus,
  FleetCareUrgency,
  MaintenanceTicket,
  RepairEstimate,
  RepairEstimateLineItem,
  TicketEvent,
} from '../fleetcare/fleetcareTypes';

function nowIso() {
  return new Date().toISOString();
}

function nextTicketNumber(store: DemoStore): string {
  const seq = (store.fleetcareCounters?.ticketSeq ?? 100) + 1;
  return `FC-${String(seq).padStart(6, '0')}`;
}

function appendEvent(
  store: DemoStore,
  ticketId: string,
  eventType: string,
  fromStatus?: FleetCareTicketStatus,
  toStatus?: FleetCareTicketStatus,
  actorType: TicketEvent['actorType'] = 'system',
): DemoStore {
  const event: TicketEvent = {
    id: `fc-ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ticketId,
    eventType,
    fromStatus,
    toStatus,
    actorType,
    createdAt: nowIso(),
  };
  return {
    ...store,
    fleetcareTicketEvents: [...(store.fleetcareTicketEvents ?? []), event],
  };
}

export function getOrganizationId(store: DemoStore): string {
  return store.portalClientId ?? 'client-a';
}

export function getTicketsForOrg(orgId: string, store: DemoStore): MaintenanceTicket[] {
  return (store.fleetcareTickets ?? []).filter((t) => t.clientOrganizationId === orgId);
}

export function getTicketById(id: string, store: DemoStore): MaintenanceTicket | undefined {
  return store.fleetcareTickets?.find((t) => t.id === id);
}

export function getProviderById(id: string, store: DemoStore) {
  return store.fleetcareProviders?.find((p) => p.id === id);
}

export function getEstimatesForTicket(ticketId: string, store: DemoStore): RepairEstimate[] {
  return (store.fleetcareEstimates ?? []).filter((e) => e.ticketId === ticketId);
}

export function getRepairRecordsForVehicle(vehicleId: string, store: DemoStore) {
  return (store.fleetcareRepairRecords ?? []).filter((r) => r.vehicleId === vehicleId);
}

export function getAvailableLeadsForProvider(providerId: string, store: DemoStore): MaintenanceTicket[] {
  return (store.fleetcareTickets ?? []).filter(
    (t) =>
      ['matched', 'provider_reviewing'].includes(t.status)
      && (store.fleetcareTicketMatches ?? []).some((m) => m.ticketId === t.id && m.providerId === providerId)
      || (t.status === 'searching' && matchTicketToProviders(t, store).some((m) => m.providerId === providerId)),
  );
}

export function getActiveJobsForProvider(providerId: string, store: DemoStore): MaintenanceTicket[] {
  return (store.fleetcareTickets ?? []).filter(
    (t) =>
      t.providerId === providerId
      && !['completed', 'customer_confirmed', 'closed', 'cancelled', 'draft'].includes(t.status),
  );
}

export interface CreateTicketInput {
  organizationId: string;
  vehicleId: string;
  serviceCategoryCode: string;
  issueDescription: string;
  drivableStatus: FleetCareDrivableStatus;
  urgency: FleetCareUrgency;
  location: MaintenanceTicket['location'];
}

export function submitMaintenanceTicket(input: CreateTicketInput): MaintenanceTicket {
  let store = loadDemoStore();
  const id = `fc-ticket-${Date.now()}`;
  const ticket: MaintenanceTicket = {
    id,
    ticketNumber: nextTicketNumber(store),
    clientOrganizationId: input.organizationId,
    vehicleId: input.vehicleId,
    serviceCategoryCode: input.serviceCategoryCode,
    issueDescription: input.issueDescription,
    drivableStatus: input.drivableStatus,
    location: input.location,
    urgency: input.urgency,
    status: 'submitted',
    leadSource: 'aio_marketplace',
    aioOriginated: true,
    customerContactReleased: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  store = {
    ...store,
    fleetcareCounters: { ticketSeq: (store.fleetcareCounters?.ticketSeq ?? 100) + 1 },
    fleetcareTickets: [...(store.fleetcareTickets ?? []), ticket],
  };
  store = appendEvent(store, id, 'ticket_created', undefined, 'submitted', 'client');
  store = runMatching(store, id);
  saveDemoStore(store);
  return getTicketById(id, store)!;
}

function runMatching(store: DemoStore, ticketId: string): DemoStore {
  const ticket = store.fleetcareTickets?.find((t) => t.id === ticketId);
  if (!ticket) return store;

  const matches = matchTicketToProviders(ticket, store);
  let next: DemoStore = {
    ...store,
    fleetcareTicketMatches: [...(store.fleetcareTicketMatches ?? []), ...matches],
  };

  if (!matches.length) {
    return appendEvent(next, ticketId, 'no_providers_matched', ticket.status, ticket.status);
  }

  const updatedTicket: MaintenanceTicket = {
    ...ticket,
    status: matches.length ? 'searching' : 'submitted',
    updatedAt: nowIso(),
  };
  next = {
    ...next,
    fleetcareTickets: next.fleetcareTickets!.map((t) => (t.id === ticketId ? updatedTicket : t)),
  };
  return appendEvent(next, ticketId, 'providers_matched', ticket.status, updatedTicket.status);
}

export function providerAcceptLead(ticketId: string, providerId: string): void {
  let store = loadDemoStore();
  const ticket = getTicketById(ticketId, store);
  if (!ticket) return;

  const updated: MaintenanceTicket = {
    ...ticket,
    providerId,
    status: 'provider_accepted',
    assignedAt: nowIso(),
    customerContactReleased: clientContactMayBeReleased({ ...ticket, status: 'provider_accepted' }),
    updatedAt: nowIso(),
  };
  store = {
    ...store,
    fleetcareTickets: store.fleetcareTickets!.map((t) => (t.id === ticketId ? updated : t)),
    fleetcareTicketEvents: [
      ...(store.fleetcareTicketEvents ?? []),
      {
        id: `fc-ev-accept-${ticketId}`,
        ticketId,
        eventType: 'provider_accepted',
        fromStatus: ticket.status,
        toStatus: 'provider_accepted',
        actorType: 'provider',
        createdAt: nowIso(),
      },
    ],
  };
  saveDemoStore(store);
}

export function providerDeclineLead(ticketId: string, providerId: string): void {
  let store = loadDemoStore();
  const ticket = getTicketById(ticketId, store);
  if (!ticket) return;

  store = {
    ...store,
    fleetcareTicketMatches: (store.fleetcareTicketMatches ?? []).map((m) =>
      m.ticketId === ticketId && m.providerId === providerId ? { ...m, eligible: false } : m,
    ),
  };
  const remaining = matchTicketToProviders(ticket, store).filter((m) => m.eligible && m.providerId !== providerId);
  const nextStatus: FleetCareTicketStatus = remaining.length ? 'searching' : 'provider_declined';
  store = {
    ...store,
    fleetcareTickets: store.fleetcareTickets!.map((t) =>
      t.id === ticketId ? { ...t, status: nextStatus, providerId: undefined, updatedAt: nowIso() } : t,
    ),
  };
  saveDemoStore(store);
}

export function submitEstimate(
  ticketId: string,
  providerId: string,
  lineItems: Omit<RepairEstimateLineItem, 'id'>[],
  notes?: string,
): void {
  let store = loadDemoStore();
  const subtotalMinor = lineItems.reduce((s, li) => s + li.totalMinor, 0);
  const taxMinor = Math.round(subtotalMinor * 0.08);
  const estimate: RepairEstimate = {
    id: `fc-est-${Date.now()}`,
    ticketId,
    providerId,
    version: (getEstimatesForTicket(ticketId, store).length ?? 0) + 1,
    status: 'sent',
    lineItems: lineItems.map((li, i) => ({ ...li, id: `li-${i}` })),
    subtotalMinor,
    taxMinor,
    totalMinor: subtotalMinor + taxMinor,
    notes,
    isChangeOrder: false,
    createdAt: nowIso(),
  };

  store = {
    ...store,
    fleetcareEstimates: [...(store.fleetcareEstimates ?? []), estimate],
    fleetcareTickets: store.fleetcareTickets!.map((t) =>
      t.id === ticketId ? { ...t, status: 'estimate_sent', updatedAt: nowIso() } : t,
    ),
  };
  saveDemoStore(store);
}

export function authorizeEstimate(ticketId: string, estimateId: string, decision: 'approve' | 'decline'): void {
  let store = loadDemoStore();
  const estimate = store.fleetcareEstimates?.find((e) => e.id === estimateId);
  if (!estimate) return;

  store = {
    ...store,
    fleetcareAuthorizations: [
      ...(store.fleetcareAuthorizations ?? []),
      {
        id: `fc-auth-${Date.now()}`,
        ticketId,
        estimateId,
        decision,
        authorizedAmountMinor: decision === 'approve' ? estimate.totalMinor : undefined,
        createdAt: nowIso(),
      },
    ],
    fleetcareEstimates: store.fleetcareEstimates!.map((e) =>
      e.id === estimateId ? { ...e, status: decision === 'approve' ? 'approved' : 'declined' } : e,
    ),
    fleetcareTickets: store.fleetcareTickets!.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: decision === 'approve' ? 'authorized' : 'awaiting_estimate',
            updatedAt: nowIso(),
          }
        : t,
    ),
  };
  saveDemoStore(store);
}

export function completeJob(ticketId: string, finalAmountMinor: number, workSummary: string, mileage?: number): void {
  let store = loadDemoStore();
  const ticket = getTicketById(ticketId, store);
  if (!ticket?.providerId) return;

  const job = {
    id: `fc-job-${Date.now()}`,
    ticketId,
    providerId: ticket.providerId,
    status: 'completed',
    completedAt: nowIso(),
    finalAmountMinor,
    mileageAtService: mileage,
    workSummary,
  };

  const record = {
    id: `fc-rec-${Date.now()}`,
    jobId: job.id,
    vehicleId: ticket.vehicleId,
    organizationId: ticket.clientOrganizationId,
    providerId: ticket.providerId,
    serviceCategoryCode: ticket.serviceCategoryCode,
    summary: workSummary,
    mileageAtService: mileage,
    completedAt: nowIso(),
    documentIds: [] as string[],
  };

  const referral = calculateReferralFee(
    { ...ticket, status: 'completed' },
    job,
    store,
  );

  store = {
    ...store,
    fleetcareJobs: [...(store.fleetcareJobs ?? []), job],
    fleetcareRepairRecords: [...(store.fleetcareRepairRecords ?? []), record],
    fleetcareReferrals: referral ? [...(store.fleetcareReferrals ?? []), referral] : (store.fleetcareReferrals ?? []),
    fleetcareTickets: store.fleetcareTickets!.map((t) =>
      t.id === ticketId ? { ...t, status: 'completed', updatedAt: nowIso() } : t,
    ),
  };
  saveDemoStore(store);
}

export function getLeadPreview(ticket: MaintenanceTicket): Partial<MaintenanceTicket> {
  if (ticket.customerContactReleased) return ticket;
  return {
    ...ticket,
    issueDescription: ticket.issueDescription,
    location: { city: ticket.location.city, stateCode: ticket.location.stateCode },
  };
}
