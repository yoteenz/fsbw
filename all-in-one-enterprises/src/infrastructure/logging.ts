/**
 * Sprint 23 — structured logging with PII redaction boundaries.
 */

import { resolveDeploymentEnvironment } from './environmentModel';
import { getRequestCorrelationId } from './correlationId';
import { redactPii } from '../security/securityRedaction';

export type LogSeverity = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogEntry {
  timestamp: string;
  environment: string;
  correlationId: string;
  event: string;
  severity: LogSeverity;
  result?: 'OK' | 'FAIL' | 'DENIED';
  actorId?: string;
  organizationId?: string;
  metadata?: Record<string, unknown>;
}

const REDACT_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'serviceRoleKey',
  'service_role_key',
  'ssn',
  'ein',
  'cardNumber',
  'cvv',
]);

function sanitizeMetadata(meta: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
    } else if (typeof v === 'string') {
      out[k] = redactPii(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function logStructured(
  event: string,
  severity: LogSeverity,
  options?: {
    result?: StructuredLogEntry['result'];
    actorId?: string;
    organizationId?: string;
    metadata?: Record<string, unknown>;
  },
): StructuredLogEntry {
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    environment: resolveDeploymentEnvironment(),
    correlationId: getRequestCorrelationId(),
    event,
    severity,
    result: options?.result,
    actorId: options?.actorId,
    organizationId: options?.organizationId,
    metadata: sanitizeMetadata(options?.metadata),
  };

  const line = JSON.stringify(entry);
  if (severity === 'error') console.error(line);
  else if (severity === 'warn') console.warn(line);
  else if (import.meta.env.DEV) console.info(line);

  return entry;
}
