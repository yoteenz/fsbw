import type { DemoStore } from '../demo/demoTypes';
import type { ProductionReadinessItem } from './securityTypes';
import { isDebugEnvironment } from './environmentConfig';
import { effectiveDataMode, validateAioEnvironment } from '../config/env';
import type { ProductionGateResult } from './securityTypes';

export function evaluateProductionReadiness(store: DemoStore): ProductionReadinessItem[] {
  const settings = store.securitySettings;
  const dataMode = effectiveDataMode();
  const envValidation = validateAioEnvironment();

  const items: ProductionReadinessItem[] = [
    {
      id: 'aio-database',
      category: 'DATA',
      title: 'Dedicated AIO Database Configured',
      description: 'Dedicated All In One Supabase Postgres — not Frontal Slayer',
      state: dataMode === 'supabase' && envValidation.ok ? 'IN_PROGRESS' : 'NOT_CONFIGURED',
      blocking: true,
      notes: dataMode === 'demo' ? 'Demo mode — architecture ready, infrastructure not provisioned' : undefined,
    },
    {
      id: 'aio-auth',
      category: 'IDENTITY',
      title: 'Dedicated AIO Auth Configured',
      description: 'Dedicated All In One Supabase auth project with isolated storage key',
      state: dataMode === 'supabase' && envValidation.ok ? 'IN_PROGRESS' : 'NOT_CONFIGURED',
      blocking: true,
    },
    {
      id: 'aio-storage',
      category: 'STORAGE',
      title: 'Dedicated AIO Storage Configured',
      description: 'Private AIO storage buckets with signed download access',
      state: 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Sprint 20 foundation — buckets defined; not provisioned',
    },
    {
      id: 'migrations-current',
      category: 'DATA',
      title: 'Migrations Current',
      description: 'All AIO SQL migrations applied to dedicated project',
      state: dataMode === 'supabase' ? 'NOT_TESTED' : 'READY',
      blocking: true,
      notes: dataMode === 'demo' ? '8 migration files in all-in-one/supabase/migrations/' : undefined,
    },
    {
      id: 'rls-passing',
      category: 'AUTHORIZATION',
      title: 'RLS Passing',
      description: 'Automated RLS policy tests pass against dedicated database',
      state: dataMode === 'demo' ? 'READY' : 'NOT_TESTED',
      blocking: true,
      notes: 'Demo: authorizationGuard + contract tests; Supabase: run RLS matrix when connected',
    },
    {
      id: 'storage-auth-passing',
      category: 'STORAGE',
      title: 'Storage Authorization Passing',
      description: 'Storage policy tests for cross-org document isolation',
      state: 'NOT_TESTED',
      blocking: true,
    },
    {
      id: 'auth-tests',
      category: 'IDENTITY',
      title: 'Auth Tests Passing',
      description: 'Signup boundary, session, role assignment tests',
      state: dataMode === 'demo' ? 'READY' : 'NOT_TESTED',
      blocking: true,
    },
    {
      id: 'db-security-tests',
      category: 'DATA',
      title: 'Database Security Tests Passing',
      description: 'RLS bypass, org substitution, mass assignment tests',
      state: dataMode === 'demo' ? 'READY' : 'NOT_TESTED',
      blocking: true,
    },
    {
      id: 'prod-auth',
      category: 'IDENTITY',
      title: 'Production authentication configured',
      description: 'Production auth with MFA policy for admin roles',
      state: 'BLOCKED',
      blocking: true,
      notes: 'Requires dedicated AIO production project',
    },
    {
      id: 'customer-isolation',
      category: 'AUTHORIZATION',
      title: 'Customer isolation enforced server-side',
      description: 'RLS + object-level authorization for all customer resources',
      state: 'IN_PROGRESS',
      blocking: true,
      notes: 'Debug: authorizationGuard; SQL RLS in AIO migrations',
    },
    {
      id: 'private-storage',
      category: 'STORAGE',
      title: 'Private document storage configured',
      description: 'Dedicated AIO storage buckets with signed download access',
      state: 'NOT_CONFIGURED',
      blocking: true,
    },
    {
      id: 'backup',
      category: 'BACKUP',
      title: 'Production backup provider configured',
      description: 'Automated database and object storage backups with encryption',
      state: store.backupStatus?.database === 'NOT_CONFIGURED' ? 'BLOCKED' : 'IN_PROGRESS',
      blocking: true,
    },
    {
      id: 'restore-test',
      category: 'BACKUP',
      title: 'Restore Test Complete',
      description: 'Documented restore drill with evidence',
      state: 'NOT_CONFIGURED',
      blocking: true,
    },
    {
      id: 'domain-tls',
      category: 'INFRASTRUCTURE',
      title: 'Production domain and TLS',
      description: 'Standalone All In One domain with HTTPS',
      state: 'BLOCKED',
      blocking: true,
    },
    {
      id: 'demo-mode',
      category: 'OPERATIONS',
      title: 'Demo mode disabled',
      description: 'Production environment must not run demo providers or debug reset',
      state: settings?.demoModeActive ? 'BLOCKED' : 'READY',
      blocking: true,
    },
    {
      id: 'fs-isolation',
      category: 'INFRASTRUCTURE',
      title: 'Frontal Slayer data dependency removed',
      description: 'No cross-product auth, database, storage, or payment dependencies',
      state: 'READY',
      blocking: true,
      notes: 'Migration guard + fsIsolation tests + project ref blocklist',
    },
    {
      id: 'standalone-extraction',
      category: 'INFRASTRUCTURE',
      title: 'Standalone extraction complete',
      description: 'All In One extracted from Frontal Slayer repository',
      state: 'READY',
      blocking: false,
      notes: 'Sprint 22 complete — all-in-one-enterprises standalone app',
    },
    {
      id: 'webhook-signatures',
      category: 'INTEGRATIONS',
      title: 'Payment webhook signature verification',
      description: 'Verified webhook signatures in production payment integration',
      state: 'IN_PROGRESS',
      blocking: false,
    },
    {
      id: 'dependency-audit',
      category: 'DEPENDENCIES',
      title: 'Critical dependency review',
      description: 'No unmitigated critical vulnerabilities in production dependencies',
      state: 'IN_PROGRESS',
      blocking: false,
    },
    {
      id: 'legal-policy',
      category: 'LEGAL / POLICY',
      title: 'Legal and privacy policy review',
      description: 'Privacy policy, retention, and breach procedures reviewed by counsel',
      state: 'NOT_STARTED',
      blocking: false,
      notes: 'LEGAL REVIEW REQUIRED',
    },
  ];
  return items;
}

export function canLaunchProduction(store: DemoStore): ProductionGateResult {
  const items = evaluateProductionReadiness(store);
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const item of items) {
    if (item.blocking && item.state !== 'READY' && item.state !== 'NOT_APPLICABLE') {
      blockers.push(`${item.title}: ${item.state.replace(/_/g, ' ')}`);
    } else if (!item.blocking && item.state !== 'READY' && item.state !== 'NOT_APPLICABLE') {
      warnings.push(`${item.title}: ${item.state.replace(/_/g, ' ')}`);
    }
  }

  if (isDebugEnvironment(store.securitySettings)) {
    blockers.push('Debug/demo environment active — production launch blocked');
  }

  if (store.securityFindings?.some((f) => f.status === 'OPEN' && f.severity === 'CRITICAL')) {
    blockers.push('Critical security finding open');
  }

  const uniqueBlockers = [...new Set(blockers)];
  return {
    status: uniqueBlockers.length === 0 ? 'READY' : 'BLOCKED',
    blockers: uniqueBlockers,
    warnings,
  };
}

export function defaultSecuritySettings(): import('./securityTypes').SecuritySettings {
  return {
    sessionIdleMinutes: 60,
    sessionAbsoluteHours: 12,
    mfaPolicy: 'REQUIRED_FOR_ADMIN',
    loginRateLimitPerHour: 20,
    maxUploadBytes: 10 * 1024 * 1024,
    auditRetentionDays: 365,
    exportRequiresStepUp: true,
    demoModeActive: true,
    environmentLabel: 'DEBUG',
  };
}
