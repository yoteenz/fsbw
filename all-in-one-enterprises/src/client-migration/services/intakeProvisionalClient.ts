import type { Client, DemoStore } from '../../demo/demoTypes';
import { createEmptyProfile } from '../../road-ready/roadReadyRules';
import { transitionClientLifecycle } from './lifecycleEvents';

/** Provisional intake record — no business identity required before document upload. */
export function createProvisionalIntakeClient(store: DemoStore, staffId: string): { store: DemoStore; clientId: string } {
  const id = `mig-${crypto.randomUUID()}`;
  const record: Client = {
    id,
    companyName: 'Intake pending (from documents)',
    contactName: 'Primary contact',
    contactEmail: 'pending@example.com',
    clientType: 'carrier',
    primaryState: '',
    accountStatus: 'pending',
    clientLifecycle: 'INTAKE_IN_PROGRESS',
    clientReviewState: 'NOT_STARTED',
    roadmapProgress: 0,
    customerSince: new Date().toISOString().slice(0, 10),
    services: [],
    activeRequestCount: 0,
    documentsNeededCount: 0,
    lastActivityAt: new Date().toISOString(),
    activationConditions: { canonicalIdentityExists: false },
  };
  store.clients.unshift(record);
  store.roadReadyProfiles = [...(store.roadReadyProfiles ?? []), createEmptyProfile(id, '')];
  const next = transitionClientLifecycle(store, id, 'INTAKE_IN_PROGRESS', 'NEW_CLIENT_INTAKE', 'STAFF', staffId);
  return { store: next, clientId: id };
}

export function applyExtractedIdentityHints(store: DemoStore, organizationId: string, batchId: string): DemoStore {
  const facts = (store.clientExtractedFacts ?? []).filter((f) => f.batchId === batchId && f.organizationId === organizationId);
  const client = store.clients.find((c) => c.id === organizationId);
  const profile = (store.roadReadyProfiles ?? []).find((p) => p.organizationId === organizationId);
  if (!client || !profile) return store;

  const legal = facts.find((f) => f.entityType === 'company' && f.fieldKey === 'legal_name' && f.proposedValue);
  if (legal) {
    client.companyName = legal.proposedValue;
    profile.business = { ...profile.business, legalName: legal.proposedValue };
    client.activationConditions = { ...(client.activationConditions ?? {}), canonicalIdentityExists: true };
  }
  const usdot = facts.find((f) => f.fieldKey === 'usdot')?.proposedValue;
  if (usdot) profile.authority = { ...profile.authority, usdot: 'yes', usdotNumber: usdot };
  const mc = facts.find((f) => f.fieldKey === 'mc_number')?.proposedValue;
  if (mc) profile.authority = { ...profile.authority, mc: 'yes', mcNumber: mc };
  const ein = facts.find((f) => f.fieldKey === 'ein')?.proposedValue;
  if (ein) profile.business = { ...profile.business, ein, einStatus: 'yes' };
  profile.updatedAt = new Date().toISOString();
  return store;
}
