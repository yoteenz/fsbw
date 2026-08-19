import {
  computeDispatchFeeMinor,
  computeGrossMinor,
  sumApprovedAccessorials,
} from '../dispatch/dispatchCalculations';
import {
  canBookLoad,
  canCarrierAcceptLoad,
  canCarrierDeclineLoad,
  canTransitionToComplete,
  isFactoringHandoffReady,
  updateFactoringHandoffStatus,
} from '../dispatch/dispatchRules';
import type {
  DispatchOperatingPreferences,
  Load,
  LoadDeclineReason,
  LoadOperationalStatus,
  LoadTimelineActor,
} from '../dispatch/dispatchTypes';
import { buildNotification } from '../notifications/notificationEngine';
import {
  AIO_BROKERAGE_ORG_DEMO,
  handoffBrokerageLoadToBookkeeping,
} from '../brokerage/brokerageBookkeepingHandoff';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getEnrollment(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.dispatchEnrollments.find((e) => e.organizationId === orgId);
}

export function getLoads(orgId?: string, store: DemoStore = loadDemoStore()): Load[] {
  return store.loads.filter((l) => !orgId || l.organizationId === orgId);
}

export function getLoad(id: string, store: DemoStore = loadDemoStore()): Load | undefined {
  return store.loads.find((l) => l.id === id);
}

export function getTruckProfiles(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.truckProfiles.filter((t) => t.organizationId === orgId);
}

export function getBrokerContacts(store: DemoStore = loadDemoStore()) {
  return store.brokerContacts;
}

function nextLoadNumber(store: DemoStore): string {
  store.dispatchCounters.load += 1;
  const year = new Date().getFullYear();
  return `AIO-LD-${year}-${String(store.dispatchCounters.load).padStart(6, '0')}`;
}

function appendTimeline(load: Load, entry: Omit<Load['timeline'][0], 'id' | 'loadId'>): void {
  load.timeline.unshift({ id: uid(), loadId: load.id, ...entry });
}

function syncTruckForLoad(s: DemoStore, load: Load): void {
  const truck = s.truckProfiles.find(
    (t) => t.powerUnitId === load.powerUnitId && t.organizationId === load.organizationId,
  );
  if (!truck) return;
  if (['complete', 'cancelled'].includes(load.operationalStatus)) {
    truck.availability = 'available_soon';
    truck.currentLoadId = undefined;
  } else if (['in_transit', 'loaded'].includes(load.operationalStatus)) {
    truck.availability = 'in_transit';
    truck.currentLoadId = load.id;
  } else if (['booked', 'dispatched', 'en_route_pickup', 'at_pickup'].includes(load.operationalStatus)) {
    truck.availability = 'booked';
    truck.currentLoadId = load.id;
  }
  truck.updatedAt = new Date().toISOString();
}

export function requestDispatchService(orgId: string): void {
  updateDemoStore((s) => {
    let enrollment = s.dispatchEnrollments.find((e) => e.organizationId === orgId);
    if (!enrollment) {
      enrollment = {
        id: uid(),
        organizationId: orgId,
        status: 'interested',
        agreementStatus: 'pending',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      s.dispatchEnrollments.push(enrollment);
    }
    s.requests.unshift({
      id: uid(),
      requestNumber: `AIO-DEMO-${String(++s.requestCounter).padStart(4, '0')}`,
      clientId: orgId,
      services: [{ slug: 'dispatching', title: 'Dispatch Services', division: 'dispatching' }],
      division: 'dispatching',
      status: 'new_request',
      statusLabel: 'New Request',
      workflowStep: 'new_request',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      nextStep: 'All In One will review your dispatch service request',
      timeline: [{ id: '1', label: 'Submitted', status: 'completed' }],
      documentIds: [],
      taskIds: [],
    });
    s.activity.unshift({
      id: uid(),
      kind: 'DISPATCH_ENROLLMENT_CREATED',
      title: 'Dispatch service requested',
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function saveDispatchOnboarding(orgId: string, preferences: DispatchOperatingPreferences): void {
  updateDemoStore((s) => {
    const enrollment = s.dispatchEnrollments.find((e) => e.organizationId === orgId);
    if (!enrollment) return s;
    enrollment.preferences = { ...enrollment.preferences, ...preferences };
    enrollment.status = 'onboarding';
    enrollment.onboardingComplete = true;
    enrollment.updatedAt = new Date().toISOString();
    return s;
  });
}

export function activateDispatchEnrollment(orgId: string, staffId: string): void {
  updateDemoStore((s) => {
    const enrollment = s.dispatchEnrollments.find((e) => e.organizationId === orgId);
    if (!enrollment) return s;
    enrollment.status = 'active';
    enrollment.agreementStatus = enrollment.agreementStatus === 'pending' ? 'accepted' : enrollment.agreementStatus;
    enrollment.primaryDispatcherStaffId = enrollment.primaryDispatcherStaffId ?? staffId;
    enrollment.activatedAt = new Date().toISOString();
    enrollment.updatedAt = new Date().toISOString();
    s.notifications.unshift(
      buildNotification({
        organizationId: orgId,
        recipientType: 'customer',
        eventType: 'DISPATCH_ENROLLMENT_ACTIVE',
        category: 'dispatch',
        title: 'Dispatch service is active',
        body: 'Your dispatch dashboard is now available.',
        link: aioPaths.portalDispatch,
      }),
    );
    return s;
  });
}

export interface CreateLoadInput {
  organizationId: string;
  powerUnitId?: string;
  brokerName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  pickupDate: string;
  deliveryDate: string;
  loadedMiles: number;
  deadheadMiles: number;
  linehaulMinor: number;
  fuelSurchargeMinor?: number;
  equipmentType: string;
  commodity?: string;
  weight?: string;
  customerNotes?: string;
  internalNotes?: string;
}

export function createLoadOpportunity(input: CreateLoadInput, staffId: string): Load {
  let created!: Load;
  updateDemoStore((s) => {
    const id = uid();
    const gross = computeGrossMinor(input.linehaulMinor, input.fuelSurchargeMinor ?? 0, 0);
    const load: Load = {
      id,
      loadNumber: nextLoadNumber(s),
      organizationId: input.organizationId,
      dispatchEnrollmentId: s.dispatchEnrollments.find((e) => e.organizationId === input.organizationId)?.id,
      powerUnitId: input.powerUnitId,
      assignedDispatcherStaffId: staffId,
      sourceType: 'manual',
      brokerName: input.brokerName,
      commodity: input.commodity,
      weight: input.weight,
      equipmentType: input.equipmentType,
      originCity: input.originCity,
      originState: input.originState,
      destinationCity: input.destinationCity,
      destinationState: input.destinationState,
      pickupDate: input.pickupDate,
      deliveryDate: input.deliveryDate,
      loadedMiles: input.loadedMiles,
      deadheadMiles: input.deadheadMiles,
      linehaulMinor: input.linehaulMinor,
      fuelSurchargeMinor: input.fuelSurchargeMinor ?? 0,
      accessorialMinor: 0,
      grossMinor: gross,
      confirmedGrossMinor: gross,
      currency: 'USD',
      offerStatus: 'draft',
      operationalStatus: 'opportunity',
      rateConfirmationStatus: 'missing',
      rateDetailsReviewed: false,
      factoringHandoffStatus: 'not_ready',
      customerNotes: input.customerNotes,
      internalNotes: input.internalNotes,
      accessorials: [],
      rateRevisions: [],
      timeline: [],
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    appendTimeline(load, {
      label: 'Load opportunity created',
      operationalStatus: 'opportunity',
      actor: 'dispatcher',
      visibility: 'internal',
      createdAt: load.createdAt,
    });
    s.loads.unshift(load);
    created = load;
    return s;
  });
  return created;
}

export function sendLoadOffer(loadId: string, _staffId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load || load.offerStatus !== 'draft') return s;
    load.offerStatus = 'awaiting_carrier';
    load.updatedAt = new Date().toISOString();
    load.version += 1;
    appendTimeline(load, { label: 'Load offer sent', actor: 'dispatcher', visibility: 'customer', createdAt: load.updatedAt });
    s.notifications.unshift(
      buildNotification({
        organizationId: load.organizationId,
        recipientType: 'customer',
        eventType: 'LOAD_OFFERED',
        category: 'dispatch',
        title: 'New load offer',
        body: `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`,
        entityType: 'load',
        entityId: load.id,
        link: aioPaths.portalDispatchLoad(load.id),
        dedupeKey: `load-offer:${load.id}`,
      }),
    );
    return s;
  });
}

export function acceptLoadOffer(loadId: string, orgId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId && l.organizationId === orgId);
    if (!load || !canCarrierAcceptLoad(load)) return s;
    load.offerStatus = 'accepted';
    load.operationalStatus = 'booking_in_progress';
    load.updatedAt = new Date().toISOString();
    load.version += 1;
    appendTimeline(load, { label: 'Carrier accepted', operationalStatus: 'booking_in_progress', actor: 'carrier_admin', visibility: 'customer', createdAt: load.updatedAt });
    s.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        staffId: load.assignedDispatcherStaffId ?? 'staff-4',
        eventType: 'LOAD_OFFER_ACCEPTED',
        category: 'dispatch',
        title: `Load accepted — ${load.loadNumber}`,
        body: 'Carrier accepted the load offer.',
        link: aioPaths.officeDispatchLoad(load.id),
      }),
    );
    return s;
  });
}

export function declineLoadOffer(loadId: string, orgId: string, reason?: LoadDeclineReason, notes?: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId && l.organizationId === orgId);
    if (!load || !canCarrierDeclineLoad(load)) return s;
    load.offerStatus = 'declined';
    load.declineReason = reason;
    load.declineNotes = notes;
    load.updatedAt = new Date().toISOString();
    load.version += 1;
    appendTimeline(load, { label: 'Carrier declined', actor: 'carrier_admin', visibility: 'customer', createdAt: load.updatedAt });
    return s;
  });
}

export function bookLoad(loadId: string, _staffId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load || !canBookLoad(load)) return s;
    load.operationalStatus = 'booked';
    load.updatedAt = new Date().toISOString();
    load.version += 1;
    appendTimeline(load, { label: 'Load booked', operationalStatus: 'booked', actor: 'dispatcher', visibility: 'customer', createdAt: load.updatedAt });
    syncTruckForLoad(s, load);
    s.notifications.unshift(
      buildNotification({
        organizationId: load.organizationId,
        recipientType: 'customer',
        eventType: 'LOAD_BOOKED',
        category: 'dispatch',
        title: `Load booked — ${load.loadNumber}`,
        body: `${load.originCity}, ${load.originState} → ${load.destinationCity}, ${load.destinationState}`,
        link: aioPaths.portalDispatchLoad(load.id),
      }),
    );
    return s;
  });
}

export function updateLoadOperationalStatus(
  loadId: string,
  status: LoadOperationalStatus,
  actor: LoadTimelineActor = 'dispatcher',
  actorLabel?: string,
  orgId?: string,
): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId && (!orgId || l.organizationId === orgId));
    if (!load) return s;
    load.operationalStatus = status === 'delivered' ? 'pod_needed' : status;
    load.updatedAt = new Date().toISOString();
    load.version += 1;
    appendTimeline(load, { label: status.replace(/_/g, ' '), operationalStatus: load.operationalStatus, actor, actorLabel, visibility: 'customer', createdAt: load.updatedAt });
    syncTruckForLoad(s, load);
    if (load.operationalStatus === 'pod_needed') {
      s.notifications.unshift(
        buildNotification({
          organizationId: load.organizationId,
          recipientType: 'customer',
          eventType: 'POD_NEEDED',
          category: 'dispatch',
          title: 'Delivery complete — POD needed',
          body: `Upload proof of delivery for ${load.loadNumber}.`,
          link: aioPaths.portalDispatchLoad(load.id),
        }),
      );
    }
    return s;
  });
}

export function uploadLoadDocument(loadId: string, orgId: string, kind: 'rate_confirmation' | 'bol' | 'pod', fileName: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId && l.organizationId === orgId);
    if (!load) return s;
    const docId = uid();
    const labels = { rate_confirmation: 'Rate Confirmation', bol: 'BOL', pod: 'POD' };
    const now = new Date().toISOString();
    s.documents.unshift({
      id: docId,
      organizationId: orgId,
      category: 'dispatch',
      documentType: labels[kind],
      title: `${labels[kind]} — ${load.loadNumber}`,
      relatedEntityType: 'load',
      relatedEntityId: loadId,
      status: 'uploaded',
      verificationStatus: 'pending_review',
      fileName,
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
      isCurrent: true,
      visibility: 'customer',
    });
    if (kind === 'rate_confirmation') {
      load.rateConfirmationDocumentId = docId;
      load.rateConfirmationStatus = 'uploaded';
    } else if (kind === 'bol') load.bolDocumentId = docId;
    else load.podDocumentId = docId;
    load.updatedAt = new Date().toISOString();
    load.factoringHandoffStatus = updateFactoringHandoffStatus(load);
    appendTimeline(load, { label: `${labels[kind]} uploaded`, actor: 'driver', visibility: 'customer', createdAt: load.updatedAt });
    return s;
  });
}

export function completeLoad(loadId: string, _staffId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load || !canTransitionToComplete(load)) return s;
    load.operationalStatus = 'complete';
    load.factoringHandoffStatus = isFactoringHandoffReady(load) ? 'ready' : 'not_ready';
    load.updatedAt = new Date().toISOString();
    appendTimeline(load, { label: 'Load complete', operationalStatus: 'complete', actor: 'dispatcher', visibility: 'customer', createdAt: load.updatedAt });
    syncTruckForLoad(s, load);
    createDispatchBillingEventForLoad(s, load);
    return s;
  });

  const store = loadDemoStore();
  const load = store.loads.find((l) => l.id === loadId);
  if (load?.sourceType === 'brokerage') {
    void handoffBrokerageLoadToBookkeeping({
      load,
      aioBrokerageOrgId: AIO_BROKERAGE_ORG_DEMO,
      staffId: _staffId,
    });
  }
}

function createDispatchBillingEventForLoad(s: DemoStore, load: Load): void {
  const config = s.dispatchBillingConfigs.find((c) => c.organizationId === load.organizationId && c.active);
  if (!config || s.dispatchBillingEvents.some((e) => e.loadId === load.id)) return;
  const fee = computeDispatchFeeMinor(
    load.linehaulMinor + load.fuelSurchargeMinor + sumApprovedAccessorials(load.accessorials),
    config.billingMode,
    config.billingRateBasisPoints,
    config.flatPerLoadMinor,
  );
  s.dispatchBillingEvents.push({
    id: uid(),
    organizationId: load.organizationId,
    loadId: load.id,
    loadGrossMinor: load.confirmedGrossMinor,
    dispatchFeeMinor: fee,
    currency: 'USD',
    billingMode: config.billingMode,
    invoiced: false,
    createdAt: new Date().toISOString(),
  });
}

export function getDispatchMetrics(orgId: string, store: DemoStore = loadDemoStore()) {
  const loads = getLoads(orgId, store);
  const completed = loads.filter((l) => l.operationalStatus === 'complete');
  return {
    activeLoads: loads.filter((l) => !['complete', 'cancelled'].includes(l.operationalStatus)).length,
    completedLoads: completed.length,
    loadedMiles: completed.reduce((s, l) => s + l.loadedMiles, 0),
    deadheadMiles: completed.reduce((s, l) => s + l.deadheadMiles, 0),
    grossMinor: completed.reduce((s, l) => s + l.confirmedGrossMinor, 0),
    pendingOffers: loads.filter((l) => l.offerStatus === 'awaiting_carrier').length,
  };
}

export function getOfficeDispatchMetrics(store: DemoStore = loadDemoStore()) {
  const today = new Date().toISOString().slice(0, 10);
  const loads = store.loads;
  return {
    activeLoads: loads.filter((l) => !['complete', 'cancelled'].includes(l.operationalStatus)).length,
    availableTrucks: store.truckProfiles.filter((t) => t.availability === 'available').length,
    pickupsToday: loads.filter((l) => l.pickupDate === today && l.operationalStatus !== 'complete').length,
    deliveriesToday: loads.filter((l) => l.deliveryDate === today && l.operationalStatus !== 'complete').length,
    missingPods: loads.filter((l) => l.operationalStatus === 'pod_needed' && !l.podDocumentId).length,
    factoringReady: loads.filter((l) => l.factoringHandoffStatus === 'ready').length,
  };
}

export function markRateDetailsReviewed(loadId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load) return s;
    load.rateDetailsReviewed = true;
    load.rateConfirmationStatus = 'details_reviewed';
    load.factoringHandoffStatus = updateFactoringHandoffStatus(load);
    return s;
  });
}
