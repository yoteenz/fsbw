import type { DemoStore } from '../../demo/demoTypes';
import type { ReviewSectionCode, ReviewSectionResponse, WhatChangedShortcut } from '../types';
import { activationConditionsMet } from '../lifecycle';
import { transitionClientLifecycle } from './lifecycleEvents';
import { activateWorkspaceEntitlements } from './officeProvisioningService';

function uid(): string {
  return crypto.randomUUID();
}

const REQUIRED_SECTIONS: ReviewSectionCode[] = ['COMPANY', 'PEOPLE', 'VEHICLES', 'ACTIVE_SERVICES'];

export function recordReviewSectionResponse(
  store: DemoStore,
  organizationId: string,
  section: ReviewSectionCode,
  response: ReviewSectionResponse,
): DemoStore {
  if (!store.clientReviewSections) store.clientReviewSections = [];
  const existing = store.clientReviewSections.find(
    (s) => s.organizationId === organizationId && s.sectionCode === section,
  );
  if (existing) {
    existing.response = response;
    existing.updatedAt = new Date().toISOString();
  } else {
    store.clientReviewSections.push({
      organizationId,
      sectionCode: section,
      response,
      updatedAt: new Date().toISOString(),
    });
  }

  const client = store.clients.find((c) => c.id === organizationId);
  if (client) {
    client.clientReviewState = 'IN_PROGRESS';
    const done = REQUIRED_SECTIONS.every((code) =>
      store.clientReviewSections?.some(
        (s) => s.organizationId === organizationId && s.sectionCode === code && s.response,
      ),
    );
    if (done) client.clientReviewState = 'COMPLETE';
    client.activationConditions = {
      ...(client.activationConditions ?? {}),
      clientReviewedRequiredSections: done,
    };
  }
  return store;
}

export function recordWhatChanged(
  store: DemoStore,
  organizationId: string,
  shortcut: WhatChangedShortcut,
  note?: string,
): DemoStore {
  if (!store.clientReportedChanges) store.clientReportedChanges = [];
  const reconciliation =
    shortcut === 'CONTACT_INFO_CHANGED'
      ? 'APPLY_WITH_HISTORY'
      : shortcut === 'NOTHING_CHANGED'
        ? 'NONE'
        : 'STAFF_RECONCILE';
  store.clientReportedChanges.push({
    id: uid(),
    organizationId,
    shortcut,
    note,
    createdAt: new Date().toISOString(),
    reconciliation,
  });
  return store;
}

/** CONFIRM & ENTER MY OFFICE — idempotent activation gate. */
export function confirmAndActivateClient(
  store: DemoStore,
  organizationId: string,
  idempotencyKey?: string,
): { store: DemoStore; error?: string } {
  const key = idempotencyKey ?? `activate:${organizationId}`;
  if (!store.clientActivationCommitKeys) store.clientActivationCommitKeys = [];
  if (store.clientActivationCommitKeys.includes(key)) return { store };

  const client = store.clients.find((c) => c.id === organizationId);
  if (!client) return { store, error: 'Client not found' };
  if (client.clientLifecycle === 'ACTIVE') return { store };

  client.activationConditions = {
    ...(client.activationConditions ?? {}),
    clientConfirmedCurrentTruth: true,
    requiredConsentsAccepted: true,
  };

  if (!activationConditionsMet(client.activationConditions)) {
    return { store, error: 'Activation conditions not met' };
  }

  store.clientActivationCommitKeys.push(key);
  store = activateWorkspaceEntitlements(store, organizationId);
  store = transitionClientLifecycle(store, organizationId, 'ACTIVE', 'CLIENT_CONFIRMED', 'EXISTING_CLIENT');
  store = transitionClientLifecycle(store, organizationId, 'ACTIVE', 'CLIENT_ACTIVATED', 'EXISTING_CLIENT');

  client.activatedAt = new Date().toISOString();
  client.accountStatus = 'active';

  return { store };
}
