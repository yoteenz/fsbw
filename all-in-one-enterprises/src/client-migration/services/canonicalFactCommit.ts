import type { DemoStore } from '../../demo/demoTypes';
import type { ExtractedFactRecord } from '../types';
import { createEmptyProfile } from '../../road-ready/roadReadyRules';

function approvedFactsForBatch(store: DemoStore, batchId: string): ExtractedFactRecord[] {
  return (store.clientExtractedFacts ?? []).filter((f) => {
    if (f.batchId !== batchId) return false;
    if (f.reviewAction === 'REJECT') return false;
    if (f.confidence === 'CONFLICT' && !f.reviewAction) return false;
    if (!f.proposedValue?.trim()) return false;
    return true;
  });
}

/** Write approved migration facts into Road Ready + client records (demo canonical store). */
export function applyCanonicalFactsFromMigration(store: DemoStore, batchId: string, organizationId: string): DemoStore {
  const facts = approvedFactsForBatch(store, batchId);
  const client = store.clients.find((c) => c.id === organizationId);
  let profile = (store.roadReadyProfiles ?? []).find((p) => p.organizationId === organizationId);
  if (!profile) {
    profile = createEmptyProfile(organizationId, client?.companyName ?? '');
    store.roadReadyProfiles = [...(store.roadReadyProfiles ?? []), profile];
  }

  for (const fact of facts) {
    if (fact.entityType === 'company') {
      switch (fact.fieldKey) {
        case 'legal_name':
          if (client) client.companyName = fact.proposedValue;
          profile.business = { ...profile.business, legalName: fact.proposedValue };
          break;
        case 'usdot':
          profile.authority = { ...profile.authority, usdot: 'yes', usdotNumber: fact.proposedValue };
          break;
        case 'mc_number':
          profile.authority = { ...profile.authority, mc: 'yes', mcNumber: fact.proposedValue };
          break;
        case 'ein':
          profile.business = { ...profile.business, ein: fact.proposedValue, einStatus: 'yes' };
          break;
        case 'company_phone':
          profile.business = { ...profile.business, phone: fact.proposedValue };
          break;
        case 'company_email':
          profile.business = { ...profile.business, email: fact.proposedValue };
          if (client && client.contactEmail.includes('pending@')) client.contactEmail = fact.proposedValue;
          break;
        case 'business_address':
          profile.business = { ...profile.business, address: fact.proposedValue };
          break;
        default:
          break;
      }
    }
    if (fact.entityType === 'vehicle' && fact.fieldKey === 'vin') {
      const existing = (store.powerUnits ?? []).find(
        (u) => u.organizationId === organizationId && u.vin === fact.proposedValue,
      );
      if (!existing) {
        store.powerUnits = [
          ...(store.powerUnits ?? []),
          {
            id: `pu-mig-${fact.id.slice(0, 8)}`,
            organizationId,
            nickname: `Unit ${fact.proposedValue.slice(-6)}`,
            vin: fact.proposedValue,
            status: 'active',
          },
        ];
      }
    }
  }

  profile.updatedAt = new Date().toISOString();
  if (client) {
    client.activationConditions = {
      ...(client.activationConditions ?? {}),
      canonicalIdentityExists: Boolean(profile.business.legalName?.trim()),
    };
  }
  return store;
}
