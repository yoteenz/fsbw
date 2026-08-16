import { EXPIRATION_THRESHOLDS_DAYS } from '../calendar/calendarConfig';
import { daysUntil } from '../calendar/calendarService';
import { buildNotification, shouldCreateNotification } from './notificationEngine';
import type { CreateNotificationInput } from './notificationEngine';
import type { AioNotification } from './notificationTypes';
import type { VaultDocument } from '../vault/vaultTypes';
import type { RenewalRecord } from '../renewals/renewalTypes';
import { aioPaths } from '../utils/paths';

export interface ExpirationEvaluationResult {
  notifications: CreateNotificationInput[];
  deadlineUpdates: { documentId: string; thresholdDays: number }[];
}

/** Idempotent expiration evaluation — safe to rerun */
export function evaluateDocumentExpirations(
  docs: VaultDocument[],
  existingNotifications: AioNotification[],
  now = new Date(),
): ExpirationEvaluationResult {
  const notifications: CreateNotificationInput[] = [];
  const deadlineUpdates: { documentId: string; thresholdDays: number }[] = [];

  for (const doc of docs) {
    if (!doc.expiresAt || !doc.isCurrent || doc.status === 'archived') continue;
    const days = daysUntil(doc.expiresAt.slice(0, 10), now);
    if (Number.isNaN(days)) continue;

    for (const threshold of EXPIRATION_THRESHOLDS_DAYS) {
      if (days === threshold || (days < 0 && threshold === 1)) {
        const key =
          days < 0
            ? `doc-expired:${doc.id}`
            : `doc-expiring-${threshold}d:${doc.id}`;
        const input: CreateNotificationInput = {
          organizationId: doc.organizationId,
          recipientType: 'customer',
          eventType: days < 0 ? 'DOCUMENT_EXPIRED' : 'DOCUMENT_EXPIRING',
          category: 'documents',
          title: days < 0 ? `${doc.title} has expired` : `${doc.title} expires in ${days} days`,
          body:
            days < 0
              ? 'Review your renewal options and upload an updated document if needed.'
              : 'Review your upcoming expiration and decide how you would like to handle the renewal.',
          dedupeKey: key,
          entityType: 'document',
          entityId: doc.id,
          link: aioPaths.portalVaultDocument(doc.id),
        };
        if (shouldCreateNotification(existingNotifications, key)) {
          notifications.push(input);
        }
        deadlineUpdates.push({ documentId: doc.id, thresholdDays: threshold });
      }
    }

    if (days <= 30 && days >= 0) {
      const renKey = `renewal-available:${doc.id}`;
      if (shouldCreateNotification(existingNotifications, renKey)) {
        notifications.push({
          organizationId: doc.organizationId,
          recipientType: 'customer',
          eventType: 'RENEWAL_AVAILABLE',
          category: 'renewals',
          title: `Renewal available — ${doc.title}`,
          body: 'Your renewal window is approaching. Start renewal or mark self-managed.',
          dedupeKey: renKey,
          entityType: 'document',
          entityId: doc.id,
          link: aioPaths.portalRenewals,
        });
      }
    }
  }

  return { notifications, deadlineUpdates };
}

export function evaluateRenewalNotifications(
  renewals: RenewalRecord[],
  existingNotifications: AioNotification[],
): CreateNotificationInput[] {
  const out: CreateNotificationInput[] = [];
  for (const r of renewals) {
    if (r.status === 'completed' || r.status === 'self_managed') continue;
    const days = daysUntil(r.expirationDate);
    if (days <= 30 && days >= 0) {
      const key = `renewal-window:${r.id}`;
      if (shouldCreateNotification(existingNotifications, key)) {
        out.push({
          organizationId: r.organizationId,
          recipientType: 'customer',
          eventType: 'RENEWAL_AVAILABLE',
          category: 'renewals',
          title: `${r.title} — renewal window open`,
          body: `${days} days until expiration. Review renewal options.`,
          dedupeKey: key,
          entityType: 'renewal',
          entityId: r.id,
          link: aioPaths.portalRenewals,
        });
      }
    }
  }
  return out;
}

export function runExpirationEvaluator(
  docs: VaultDocument[],
  renewals: RenewalRecord[],
  existingNotifications: AioNotification[],
): AioNotification[] {
  const docEval = evaluateDocumentExpirations(docs, existingNotifications);
  const renEval = evaluateRenewalNotifications(renewals, existingNotifications);
  return [...docEval.notifications, ...renEval].map(buildNotification);
}
