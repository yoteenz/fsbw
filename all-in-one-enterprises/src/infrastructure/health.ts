/**
 * Sprint 23 — health and readiness endpoints (client-side snapshot; server routes deploy with host).
 */

import { effectiveDataMode, isSupabaseConfigured, validateAioEnvironment } from '../config/env';
import type { HealthSnapshot, InfraConfigStatus } from './types';
import { resolveDeploymentEnvironment } from './environmentModel';
import { getReleaseIdentifier } from './infrastructureStatus';
import { evaluateRlsReadiness } from './rlsGate';

function checkStatus(ok: boolean, configured: boolean): InfraConfigStatus {
  if (!configured) return 'NOT_CONFIGURED';
  return ok ? 'READY' : 'ERROR';
}

export function buildHealthSnapshot(): HealthSnapshot {
  const env = resolveDeploymentEnvironment();
  const release = getReleaseIdentifier();
  const envValidation = validateAioEnvironment();
  const dataMode = effectiveDataMode();
  const rls = evaluateRlsReadiness();

  const checks: HealthSnapshot['checks'] = [
    {
      id: 'application',
      status: 'READY',
      message: 'Application shell responsive',
    },
    {
      id: 'data-mode',
      status: dataMode === 'demo' && env === 'production' ? 'BLOCKED' : dataMode === 'supabase' ? 'READY' : 'SANDBOX',
      message: `Data mode: ${dataMode}`,
    },
    {
      id: 'database',
      status: checkStatus(envValidation.ok, isSupabaseConfigured()),
      message: isSupabaseConfigured() ? 'Supabase URL configured' : 'Database not connected',
    },
    {
      id: 'rls',
      status: rls.status === 'RLS_READY' ? 'READY' : rls.status === 'RLS_BLOCKED' ? 'BLOCKED' : 'NOT_CONFIGURED',
      message: rls.notes ?? rls.status,
    },
    {
      id: 'auth',
      status: isSupabaseConfigured() ? 'PARTIAL' : 'NOT_CONFIGURED',
      message: 'Auth follows Supabase project when configured',
    },
    {
      id: 'storage',
      status: isSupabaseConfigured() ? 'PARTIAL' : 'NOT_CONFIGURED',
      message: 'Storage buckets provisioned after project setup',
    },
  ];

  const hasError = checks.some((c) => c.status === 'ERROR' || c.status === 'BLOCKED');
  const notReady = checks.some((c) => c.status === 'NOT_CONFIGURED' && env !== 'local' && env !== 'demo');

  return {
    environment: env,
    releaseId: release.releaseId,
    liveness: hasError ? 'ERROR' : 'OK',
    readiness: hasError || (env === 'production' && notReady) ? 'NOT_READY' : 'READY',
    checks,
  };
}

/** Path convention for serverless host: GET /api/health */
export const HEALTH_ENDPOINT_PATH = '/api/health';
export const READINESS_ENDPOINT_PATH = '/api/ready';
