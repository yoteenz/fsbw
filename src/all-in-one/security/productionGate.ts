import type { DemoStore } from '../demo/demoTypes';
import type { ProductionGateResult, ProductionReadinessItem, SecuritySettings } from './securityTypes';
import { isDebugEnvironment } from './environmentConfig';

export function evaluateProductionReadiness(store: DemoStore): ProductionReadinessItem[] {
  const settings = store.securitySettings;
  const items: ProductionReadinessItem[] = [
    {
      id: 'prod-auth',
      category: 'IDENTITY',
      title: 'Production authentication configured',
      description: 'Dedicated All In One Supabase auth project with isolated storage key',
      state: 'BLOCKED',
      blocking: true,
      notes: 'Sprint 20 — pending standalone AIO Supabase deployment',
    },
    {
      id: 'customer-isolation',
      category: 'AUTHORIZATION',
      title: 'Customer isolation enforced server-side',
      description: 'RLS + object-level authorization for all customer resources',
      state: store.securitySettings ? 'IN_PROGRESS' : 'NOT_STARTED',
      blocking: true,
      notes: 'Debug: authorizationGuard + UI checks; production RLS in Sprint 20',
    },
    {
      id: 'private-storage',
      category: 'STORAGE',
      title: 'Private document storage configured',
      description: 'Dedicated AIO storage buckets with signed download access',
      state: 'BLOCKED',
      blocking: true,
      notes: 'Not configured in debug host',
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
      title: 'Frontal Slayer isolation verified',
      description: 'No cross-product auth, database, storage, or payment dependencies',
      state: 'IN_PROGRESS',
      blocking: true,
      notes: 'Regression tests in security.test.ts',
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

export function defaultSecuritySettings(): SecuritySettings {
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
