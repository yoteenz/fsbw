import { daysUntil } from '../calendar/calendarService';
import { RENEWAL_DEFINITIONS } from './renewalConfig';
import type { RenewalRecord, RenewalStatus } from './renewalTypes';
import type { VaultDocument } from '../vault/vaultTypes';

export function isRenewalEligible(doc: VaultDocument, now = new Date()): boolean {
  if (!doc.expiresAt || !doc.isCurrent) return false;
  if (doc.verificationStatus !== 'verified' && doc.status !== 'uploaded' && doc.status !== 'under_review') return false;
  const days = daysUntil(doc.expiresAt.slice(0, 10), now);
  const def = RENEWAL_DEFINITIONS.find((d) => d.category === doc.category);
  if (!def) return days <= 90;
  return days <= def.windowDays && days >= -30;
}

export function buildRenewalFromDocument(doc: VaultDocument): RenewalRecord | null {
  if (!doc.expiresAt || !isRenewalEligible(doc)) return null;
  const def = RENEWAL_DEFINITIONS.find((d) => d.category === doc.category) ?? RENEWAL_DEFINITIONS[0];
  const days = daysUntil(doc.expiresAt.slice(0, 10));
  let status: RenewalStatus = 'upcoming';
  if (days <= 30) status = 'available';
  if (days < 0) status = 'customer_action_needed';

  return {
    id: `ren-${doc.id}`,
    organizationId: doc.organizationId,
    renewalType: def.renewalType,
    title: def.title,
    category: doc.category,
    deadlineType: def.deadlineType,
    expirationDate: doc.expiresAt.slice(0, 10),
    status,
    vehicleId: doc.relatedEntityType === 'vehicle' ? doc.relatedEntityId : doc.relatedVehicle,
    vehicleLabel: doc.relatedEntityId,
    currentDocumentId: doc.id,
    roadReadyItemId: doc.roadReadyItemId,
    requiredDocumentTypes: [doc.documentType],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function renewalDedupeKey(renewal: RenewalRecord): string {
  return `renewal:${renewal.organizationId}:${renewal.renewalType}:${renewal.vehicleId ?? 'org'}:${renewal.expirationDate}`;
}
