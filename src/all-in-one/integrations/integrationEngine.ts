import type {
  IntegrationConnection,
  IntegrationOperation,
  IntegrationOperationAttempt,
} from './integrationTypes';
import type { AdapterExecuteContext, AdapterExecuteResult, IntegrationAdapter } from './integrationAdapter';
import { resolveAdapterForProvider } from './integrationAdapterRegistry';
import { shouldRetry, DEFAULT_REQUEST_TIMEOUT_MS } from './integrationRetry';
import {
  recordCircuitFailure,
  recordCircuitSuccess,
  shouldAllowRequest,
  transitionToHalfOpen,
  type CircuitBreakerSnapshot,
} from './integrationCircuitBreaker';
import { sanitizeProviderError } from './integrationRedaction';
import { evaluateConnectionHealth } from './integrationHealth';

function uid(): string {
  return crypto.randomUUID();
}

export function generateIdempotencyKey(parts: string[]): string {
  return parts.filter(Boolean).join(':');
}

export function findExistingOperationByIdempotency(
  operations: IntegrationOperation[],
  idempotencyKey: string,
): IntegrationOperation | undefined {
  return operations.find((o) => o.idempotencyKey === idempotencyKey && o.status === 'SUCCEEDED');
}

export async function verifyConnectionWithAdapter(
  connection: IntegrationConnection,
): Promise<{ ok: boolean; testResult: string; capabilities: string[]; safeMessage?: string }> {
  const adapter = resolveAdapterForProvider(connection.providerId);
  if (!adapter) {
    return { ok: false, testResult: 'CONFIGURATION_INVALID', capabilities: [], safeMessage: 'No adapter registered' };
  }
  const result = await adapter.verifyConnection(connection);
  return {
    ok: result.ok,
    testResult: result.testResult,
    capabilities: result.capabilities,
    safeMessage: result.safeMessage,
  };
}

export async function executeIntegrationOperation(
  connection: IntegrationConnection,
  ctx: Omit<AdapterExecuteContext, 'connection'>,
  circuit: CircuitBreakerSnapshot,
): Promise<{ result: AdapterExecuteResult; circuit: CircuitBreakerSnapshot; attempt: IntegrationOperationAttempt }> {
  let snap = circuit;
  if (!shouldAllowRequest(snap)) {
    snap = transitionToHalfOpen(snap);
  }
  if (!shouldAllowRequest(snap) && snap.state === 'OPEN') {
    return {
      result: { status: 'FAILED', safeError: 'Circuit breaker open', errorCode: 'PROVIDER_UNAVAILABLE', retryEligible: true },
      circuit: snap,
      attempt: {
        id: uid(),
        operationId: ctx.idempotencyKey,
        attemptNumber: 1,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        retryEligible: true,
        safeError: 'Circuit breaker open',
      },
    };
  }

  const adapter = resolveAdapterForProvider(connection.providerId);
  if (!adapter) {
    return {
      result: { status: 'FAILED', safeError: 'Adapter not found', errorCode: 'CONFIGURATION_INVALID' },
      circuit: snap,
      attempt: {
        id: uid(),
        operationId: ctx.idempotencyKey,
        attemptNumber: 1,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        retryEligible: false,
        safeError: 'Adapter not found',
      },
    };
  }

  const startedAt = new Date().toISOString();
  const timeoutMs = ctx.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

  try {
    const result = await Promise.race([
      adapter.execute({ ...ctx, connection }),
      new Promise<AdapterExecuteResult>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
      }),
    ]);

    const completedAt = new Date().toISOString();
    snap = result.status === 'SUCCEEDED' ? recordCircuitSuccess(snap) : recordCircuitFailure(snap);

    return {
      result,
      circuit: snap,
      attempt: {
        id: uid(),
        operationId: ctx.idempotencyKey,
        attemptNumber: 1,
        startedAt,
        completedAt,
        retryEligible: Boolean(result.retryEligible),
        safeError: result.safeError,
      },
    };
  } catch (err) {
    const message = sanitizeProviderError(err);
    const errorCode = message.includes('TIMEOUT') ? 'TIMEOUT' : 'PROVIDER_UNAVAILABLE';
    snap = recordCircuitFailure(snap);
    return {
      result: {
        status: 'FAILED',
        safeError: message,
        errorCode,
        retryEligible: shouldRetry(1, errorCode),
      },
      circuit: snap,
      attempt: {
        id: uid(),
        operationId: ctx.idempotencyKey,
        attemptNumber: 1,
        startedAt,
        completedAt: new Date().toISOString(),
        retryEligible: shouldRetry(1, errorCode),
        safeError: message,
      },
    };
  }
}

export function refreshConnectionHealth(
  connection: IntegrationConnection,
  operations: IntegrationOperation[],
  webhooks: { connectionId: string; receivedAt: string; status: string }[],
): IntegrationConnection {
  const health = evaluateConnectionHealth(
    connection,
    operations,
    webhooks as Parameters<typeof evaluateConnectionHealth>[2],
  );
  return { ...connection, health, updatedAt: new Date().toISOString() };
}

export function getAdapterForConnection(connection: IntegrationConnection): IntegrationAdapter | undefined {
  return resolveAdapterForProvider(connection.providerId);
}
