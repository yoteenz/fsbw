/**
 * Sprint 23 — truthful infrastructure component status for Production Config Center.
 */

import { aioEnv, effectiveDataMode, isSupabaseConfigured, validateAioEnvironment } from '../config/env';
import { AIO_MIGRATIONS_DIR, FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';
import { isStandaloneExtractionComplete } from '../qa/extractionGate';
import type { InfrastructureComponentStatus, InfraConfigStatus } from './types';
import {
  isProductionDeployment,
  isStagingDeployment,
  resolveDeploymentEnvironment,
} from './environmentModel';
import { evaluateRlsReadiness } from './rlsGate';
import { getProviderReadinessSummary } from './providerRegistry';

function readRef(): string | undefined {
  const url = aioEnv.supabaseUrl;
  if (!url) return undefined;
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1];
}

function migrationFileCount(): number {
  return 8;
}

function databaseStatus(): InfraConfigStatus {
  const mode = effectiveDataMode();
  if (mode === 'demo') return isProductionDeployment() ? 'BLOCKED' : 'NOT_CONFIGURED';
  if (!isSupabaseConfigured()) return 'NOT_CONFIGURED';
  if (validateAioEnvironment().ok) return 'PARTIAL';
  return 'ERROR';
}

export function getInfrastructureMatrix(): InfrastructureComponentStatus[] {
  const env = resolveDeploymentEnvironment();
  const extraction = isStandaloneExtractionComplete();
  const rls = evaluateRlsReadiness();
  const projectRef = readRef();
  const fsBlocked = projectRef === FRONTAL_SLAYER_SUPABASE_PROJECT_ID;

  const items: InfrastructureComponentStatus[] = [
    {
      id: 'environment',
      label: 'Environment identity',
      category: 'CORE',
      status: env === 'production' || env === 'staging' ? 'READY' : env === 'demo' ? 'SANDBOX' : 'PARTIAL',
      blocking: false,
      notes: `AIO_ENVIRONMENT=${env}`,
    },
    {
      id: 'standalone-extraction',
      label: 'Standalone extraction',
      category: 'CORE',
      status: extraction.complete ? 'READY' : 'BLOCKED',
      blocking: true,
    },
    {
      id: 'fs-isolation',
      label: 'Frontal Slayer isolation',
      category: 'SECURITY',
      status: fsBlocked ? 'BLOCKED' : 'READY',
      blocking: true,
      notes: fsBlocked ? 'Supabase URL targets forbidden FS project' : 'No FS runtime/database dependency',
    },
    {
      id: 'deployment-production',
      label: 'Production deployment project',
      category: 'DEPLOYMENT',
      status: 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Owner must create dedicated Vercel/host project — see DEPLOYMENT_RUNBOOK.md',
      ownerCategory: 'TECHNICAL',
    },
    {
      id: 'deployment-staging',
      label: 'Staging deployment',
      category: 'DEPLOYMENT',
      status: 'PARTIAL',
      blocking: false,
      notes: 'Local/preview via vite; dedicated staging host pending',
    },
    {
      id: 'database',
      label: 'Database',
      category: 'DATA',
      status: databaseStatus(),
      blocking: true,
      notes: projectRef ? `Project ref: ${projectRef}` : `${migrationFileCount()} migrations in ${AIO_MIGRATIONS_DIR}`,
    },
    {
      id: 'migrations',
      label: 'Migration history',
      category: 'DATA',
      status: isSupabaseConfigured() ? 'PARTIAL' : 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Apply via guarded scripts after dedicated project provisioned',
    },
    {
      id: 'rls',
      label: 'Row Level Security',
      category: 'SECURITY',
      status: rls.status === 'RLS_READY' ? 'READY' : rls.status === 'RLS_BLOCKED' ? 'BLOCKED' : 'NOT_CONFIGURED',
      blocking: true,
      notes: rls.notes,
    },
    {
      id: 'auth',
      label: 'Authentication',
      category: 'IDENTITY',
      status: aioEnv.authMode === 'supabase' && isSupabaseConfigured() ? 'PARTIAL' : isProductionDeployment() ? 'BLOCKED' : 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Staff invitation-only; no public staff registration',
    },
    {
      id: 'storage',
      label: 'Private storage',
      category: 'STORAGE',
      status: aioEnv.storageMode === 'supabase' && isSupabaseConfigured() ? 'PARTIAL' : 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Buckets defined in STORAGE_ARCHITECTURE — provision after project created',
    },
    {
      id: 'domain',
      label: 'Domain & TLS',
      category: 'DOMAIN',
      status: 'NOT_CONFIGURED',
      blocking: true,
      notes: 'NOT_SELECTED — owner must confirm domain',
      ownerCategory: 'BUSINESS',
    },
    {
      id: 'email',
      label: 'Email',
      category: 'COMMUNICATION',
      status: 'NOT_CONFIGURED',
      blocking: false,
      ownerCategory: 'PROVIDER',
    },
    {
      id: 'sms',
      label: 'SMS',
      category: 'COMMUNICATION',
      status: 'DISABLED',
      blocking: false,
      notes: 'Registration pending',
    },
    {
      id: 'payments',
      label: 'Payments',
      category: 'FINANCE',
      status: 'SANDBOX',
      blocking: false,
      notes: 'Demo/sandbox only until merchant approved',
    },
    {
      id: 'monitoring',
      label: 'Error monitoring',
      category: 'OBSERVABILITY',
      status: 'NOT_CONFIGURED',
      blocking: false,
    },
    {
      id: 'backup',
      label: 'Backups',
      category: 'RESILIENCE',
      status: isSupabaseConfigured() ? 'PARTIAL' : 'NOT_CONFIGURED',
      blocking: true,
      notes: 'Supabase plan-dependent — verify after project provisioned',
    },
    {
      id: 'launch-gate',
      label: 'Public launch',
      category: 'LAUNCH',
      status: 'BLOCKED',
      blocking: true,
      notes: 'Sprint 24 — operational readiness required',
      ownerCategory: 'BUSINESS',
    },
  ];

  const providers = getProviderReadinessSummary();
  for (const p of providers) {
    items.push({
      id: `provider-${p.id}`,
      label: p.label,
      category: 'INTEGRATION',
      status: mapProviderState(p.state),
      blocking: false,
      notes: p.notes,
      ownerCategory: p.ownerCategory,
    });
  }

  if (isStagingDeployment()) {
    items.push({
      id: 'staging-badge',
      label: 'Staging identification',
      category: 'CORE',
      status: 'READY',
      blocking: false,
      notes: 'STAGING badge shown to staff',
    });
  }

  return items;
}

function mapProviderState(state: string): InfraConfigStatus {
  switch (state) {
    case 'PRODUCTION_CONNECTED':
      return 'PRODUCTION_CONNECTED';
    case 'SANDBOX_READY':
      return 'SANDBOX';
    case 'PRODUCTION_CREDENTIALS_PENDING':
      return 'PRODUCTION_PENDING';
    case 'DISABLED':
      return 'DISABLED';
    case 'PRODUCTION_BLOCKED':
      return 'BLOCKED';
    default:
      return 'NOT_CONFIGURED';
  }
}

export function getReleaseIdentifier(): { releaseId: string; commitSha: string | null; builtAt: string } {
  const commitSha = typeof import.meta !== 'undefined' ? (import.meta.env.VITE_AIO_COMMIT_SHA as string | undefined) ?? null : null;
  const releaseId = typeof import.meta !== 'undefined' ? (import.meta.env.VITE_AIO_RELEASE_ID as string | undefined) ?? 'dev-local' : 'dev-local';
  return { releaseId, commitSha, builtAt: new Date().toISOString() };
}
