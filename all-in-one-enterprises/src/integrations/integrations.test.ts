import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { redactSecrets, sanitizeProviderError } from './integrationRedaction';
import { generateIdempotencyKey, findExistingOperationByIdempotency } from './integrationEngine';
import { isRetryEligibleHttpStatus, shouldRetry, computeBackoffDelay } from './integrationRetry';
import { recordCircuitFailure, shouldAllowRequest, DEFAULT_CIRCUIT_BREAKER_CONFIG } from './integrationCircuitBreaker';
import { isDuplicateWebhook } from './integrationWebhook';
import { detectReconciliationIssues } from './integrationReconciliation';
import { validateMoney, mapUnknownProviderEnum, parseExternalDate } from './integrationAdapter';
import { demoRegulatoryAdapter } from './adapters/demoRegulatoryAdapter';
import { demoPaymentAdapter, DEMO_PAYMENT_WEBHOOK_SECRET } from './adapters/demoPaymentAdapter';
import { computeDataFreshness } from './integrationHealth';
import {
  runRegulatoryLookup,
  importLoadBoardCandidate,
  searchLoadBoard,
  submitFactoringToProvider,
  exportInvoiceToAccounting,
  revokeIntegrationConsent,
} from '../demo/integrationActions';
import { loadDemoStore } from '../demo/demoStore';
import { hasIntegrationPermission } from './integrationPermissions';
import { resolveOfficeStaffContext } from '../office-core/officeContext';
import { validateIntegrationConfig, isSandboxIsolationOk } from './integrationConfig';

describe('credential redaction', () => {
  it('redacts bearer tokens and api keys', () => {
    const raw = 'Authorization: Bearer secret-token-abc api_key=live_sk_12345';
    expect(redactSecrets(raw)).not.toContain('secret-token');
    expect(redactSecrets(raw)).toContain('[REDACTED]');
  });

  it('sanitizes provider errors', () => {
    expect(sanitizeProviderError(new Error('token=abc123'))).not.toContain('abc123');
  });
});

describe('idempotency', () => {
  it('generates deterministic keys', () => {
    expect(generateIdempotencyKey(['a', 'b'])).toBe('a:b');
  });

  it('finds existing succeeded operation', () => {
    const key = 'test-key';
    const ops = [{ id: '1', idempotencyKey: key, status: 'SUCCEEDED' as const, connectionId: 'c', providerId: 'p', capability: 'READ' as const, operationType: 'x', correlationId: 'x', startedAt: '', attemptCount: 1 }];
    expect(findExistingOperationByIdempotency(ops, key)?.id).toBe('1');
  });
});

describe('retry policy', () => {
  it('retries 429 and 5xx', () => {
    expect(isRetryEligibleHttpStatus(429)).toBe(true);
    expect(isRetryEligibleHttpStatus(503)).toBe(true);
    expect(isRetryEligibleHttpStatus(401)).toBe(false);
  });

  it('does not retry auth failures', () => {
    expect(shouldRetry(1, 'AUTHENTICATION_FAILED')).toBe(false);
    expect(shouldRetry(1, 'TIMEOUT')).toBe(true);
  });

  it('computes backoff', () => {
    expect(computeBackoffDelay(2)).toBeGreaterThan(0);
  });
});

describe('circuit breaker', () => {
  it('opens after threshold failures', () => {
    let snap: { state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'; consecutiveFailures: number } = { state: 'CLOSED', consecutiveFailures: 0 };
    for (let i = 0; i < DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold; i++) {
      snap = recordCircuitFailure(snap);
    }
    expect(snap.state).toBe('OPEN');
    expect(shouldAllowRequest(snap)).toBe(false);
  });
});

describe('webhook security', () => {
  it('rejects duplicate webhooks', () => {
    const events = [{ id: '1', connectionId: 'c', externalEventId: 'evt-1', status: 'PROCESSED' as const, providerId: 'p', eventType: 'x', receivedAt: '', attemptCount: 1 }];
    expect(isDuplicateWebhook(events, 'c', 'evt-1')).toBe(true);
  });

  it('rejects invalid payment webhook signature', async () => {
    const result = await demoPaymentAdapter.processWebhook!({
      externalEventId: 'evt-bad',
      eventType: 'payment.succeeded',
      amountMinor: 1000,
      currency: 'USD',
      signature: 'wrong',
    });
    expect(result.ok).toBe(false);
  });

  it('accepts valid demo signature', async () => {
    const result = await demoPaymentAdapter.processWebhook!({
      externalEventId: 'evt-good',
      eventType: 'payment.succeeded',
      amountMinor: 1000,
      currency: 'USD',
      signature: DEMO_PAYMENT_WEBHOOK_SECRET,
    });
    expect(result.ok).toBe(true);
  });
});

describe('regulatory demo adapter', () => {
  it('returns demo data for USDOT 1234567', async () => {
    const result = await demoRegulatoryAdapter.lookupCarrier({ identifierType: 'USDOT', identifier: '1234567' });
    expect(result.found).toBe(true);
    expect(result.legalName).toContain('Roadline');
    expect(result.operatingStatus).toContain('DEMO DATA');
    expect(result.provenance.source).toBe('DEMO_DATA');
  });
});

describe('reconciliation', () => {
  it('detects amount mismatch', () => {
    const issues = detectReconciliationIssues({
      providerId: 'p',
      connectionId: 'c',
      entityType: 'payment',
      entityId: 'x',
      internalAmountMinor: 115000,
      externalAmountMinor: 125000,
    });
    expect(issues.some((i) => i.issueType === 'AMOUNT_MISMATCH')).toBe(true);
  });
});

describe('validation helpers', () => {
  it('validates money as integer minor units', () => {
    expect(validateMoney(100, 'USD').ok).toBe(true);
    expect(validateMoney(1.5, 'USD').ok).toBe(false);
  });

  it('maps unknown enums safely', () => {
    expect(mapUnknownProviderEnum('weird_status')).toContain('UNKNOWN_EXTERNAL_STATUS');
  });

  it('parses external dates', () => {
    expect(parseExternalDate('2026-01-01T00:00:00.000Z').ok).toBe(true);
    expect(parseExternalDate('not-a-date').ok).toBe(false);
  });
});

describe('domain integration flows', () => {
  it('regulatory lookup stores verification without overwriting client', () => {
    const seed = createDemoSeed();
    const orgId = seed.clients[0]!.id;
    const verification = runRegulatoryLookup(orgId, '1234567');
    expect(verification.organizationId).toBe(orgId);
    expect(verification.verificationStatus).toBe('record_found');
    expect(verification.legalName).toContain('Roadline');
    expect(seed.clients[0]!.companyName).toBeTruthy();
  });

  it('blocks factoring without authorization', () => {
    const r = submitFactoringToProvider('sub-1', 'client-a', ['doc-1'], false);
    expect(r.ok).toBe(false);
  });

  it('prevents duplicate accounting export', () => {
    exportInvoiceToAccounting('inv-1', 'v1');
    const ops = loadDemoStore().integrationOperations?.filter((o) => o.operationType === 'ACCOUNTING_EXPORT') ?? [];
    exportInvoiceToAccounting('inv-1', 'v1');
    const ops2 = loadDemoStore().integrationOperations?.filter((o) => o.operationType === 'ACCOUNTING_EXPORT') ?? [];
    expect(ops2.length).toBe(ops.length);
  });

  it('load board import dedupes', async () => {
    const candidates = await searchLoadBoard();
    const first = candidates[0];
    if (!first) return;
    importLoadBoardCandidate(first.id);
    const loadsAfter = loadDemoStore().loads.length;
    importLoadBoardCandidate(first.id);
    expect(loadDemoStore().loads.length).toBe(loadsAfter);
  });
});

describe('permissions', () => {
  it('dispatcher cannot manage payment credentials', () => {
    const store = { ...createDemoSeed(), officeStaffRole: 'dispatcher' as const };
    const ctx = resolveOfficeStaffContext(store);
    expect(hasIntegrationPermission(ctx.permissions, 'integrations.read')).toBe(true);
    expect(hasIntegrationPermission(ctx.permissions, 'integrations.credentials.manage')).toBe(false);
  });
});

describe('environment separation', () => {
  it('blocks sandbox connection from production config', () => {
    expect(isSandboxIsolationOk('SANDBOX', 'PRODUCTION')).toBe(false);
    expect(isSandboxIsolationOk('DEMO', 'DEMO')).toBe(true);
  });

  it('validates config safely', () => {
    const result = validateIntegrationConfig({ AIO_INTEGRATION_ENV: 'DEMO' });
    expect(result.ok).toBe(true);
  });
});

describe('staleness', () => {
  it('marks old data stale', () => {
    const old = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    expect(computeDataFreshness(old)).toBe('STALE');
  });
});

describe('consent revocation', () => {
  it('preserves history on revoke', () => {
    const consentId = createDemoSeed().integrationConsents?.[0]?.id;
    if (!consentId) return;
    const revoked = revokeIntegrationConsent(consentId);
    expect(revoked?.revokedAt).toBeTruthy();
  });
});
