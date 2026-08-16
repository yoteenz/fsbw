import type { IntegrationWebhookEvent, IntegrationWebhookStatus } from './integrationTypes';
import { sanitizeProviderError } from './integrationRedaction';

export interface WebhookVerificationInput {
  payload: string;
  signature?: string;
  timestamp?: string;
  maxAgeSeconds?: number;
  maxPayloadBytes?: number;
}

export interface WebhookProcessResult {
  accepted: boolean;
  status: IntegrationWebhookStatus;
  duplicate: boolean;
  safeError?: string;
}

export function verifyWebhookSignature(
  _payload: string,
  signature: string | undefined,
  expectedSignature: string,
): boolean {
  if (!signature) return false;
  return signature === expectedSignature;
}

export function validateWebhookTimestamp(timestamp: string | undefined, maxAgeSeconds = 300): boolean {
  if (!timestamp) return false;
  const ts = Number(timestamp);
  if (Number.isNaN(ts)) {
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return false;
    return Date.now() - d.getTime() <= maxAgeSeconds * 1000;
  }
  return Date.now() - ts * 1000 <= maxAgeSeconds * 1000;
}

export function validateWebhookPayloadSize(payload: string, maxBytes = 256_000): boolean {
  return new TextEncoder().encode(payload).length <= maxBytes;
}

export function isDuplicateWebhook(
  events: IntegrationWebhookEvent[],
  connectionId: string,
  externalEventId: string,
): boolean {
  return events.some(
    (e) => e.connectionId === connectionId && e.externalEventId === externalEventId && e.status !== 'REJECTED',
  );
}

export function processWebhookSafely(
  input: WebhookVerificationInput,
  existingEvents: IntegrationWebhookEvent[],
  connectionId: string,
  externalEventId: string,
  verifyFn: () => boolean,
): WebhookProcessResult {
  if (!validateWebhookPayloadSize(input.payload, input.maxPayloadBytes)) {
    return { accepted: false, status: 'REJECTED', duplicate: false, safeError: 'Payload too large' };
  }
  if (input.timestamp && !validateWebhookTimestamp(input.timestamp)) {
    return { accepted: false, status: 'REJECTED', duplicate: false, safeError: 'Timestamp invalid or expired' };
  }
  if (isDuplicateWebhook(existingEvents, connectionId, externalEventId)) {
    return { accepted: true, status: 'DUPLICATE', duplicate: true };
  }
  try {
    if (!verifyFn()) {
      return { accepted: false, status: 'REJECTED', duplicate: false, safeError: 'Invalid signature' };
    }
    return { accepted: true, status: 'VERIFIED', duplicate: false };
  } catch (err) {
    return {
      accepted: false,
      status: 'REJECTED',
      duplicate: false,
      safeError: sanitizeProviderError(err),
    };
  }
}
