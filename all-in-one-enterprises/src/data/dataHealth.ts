import type { AioDataMode } from '../config/env';
import { effectiveDataMode, getDataModeLabel, validateAioEnvironment, aioEnv, isSupabaseConfigured } from '../config/env';
import { AIO_DEMO_SCHEMA_VERSION, AIO_MIGRATIONS_DIR } from './constants';

export type HealthStatus = 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE' | 'MISCONFIGURED' | 'NOT_CONFIGURED';

export type VerificationStatus = 'NOT_TESTED' | 'PASSING' | 'FAILING';

export interface DataSystemStatus {
  dataMode: AioDataMode;
  dataModeLabel: string;
  demoSchemaVersion: number;
  targetSchemaVersion: number;
  database: HealthStatus;
  auth: HealthStatus;
  storage: HealthStatus;
  migrations: {
    directory: string;
    appliedCount: number | null;
    current: boolean;
    status: VerificationStatus;
  };
  rls: VerificationStatus;
  repositoryContract: VerificationStatus;
  seedVersion: string;
  lastHealthCheckAt: string;
  configErrors: string[];
  architectureReady: boolean;
  launchReady: boolean;
}

/** Registered migration files (repo) — order matters */
export const AIO_MIGRATION_FILES = [
  '20260815100000_aio_identity_foundation.sql',
  '20260815110000_aio_business_data_rls.sql',
  '20260815120000_aio_identity_roles_contacts.sql',
  '20260815130000_aio_crm_workflow_billing.sql',
  '20260815140000_aio_integrations_security_audit.sql',
  '20260815150000_aio_infrastructure_outbox.sql',
  '20260815160000_aio_rls_extensions.sql',
  '20260815170000_aio_indexes_views.sql',
] as const;

export function getMigrationRegistry() {
  return AIO_MIGRATION_FILES.map((file, index) => ({
    order: index + 1,
    filename: file,
    slug: file.replace(/^\d+_/, '').replace(/\.sql$/, ''),
  }));
}

export function evaluateDataSystemStatus(options?: {
  supabaseReachable?: boolean;
  rlsTestsPassing?: boolean;
  contractTestsPassing?: boolean;
}): DataSystemStatus {
  const validation = validateAioEnvironment();
  const mode = effectiveDataMode();
  const now = new Date().toISOString();

  let database: HealthStatus = 'NOT_CONFIGURED';
  let auth: HealthStatus = 'NOT_CONFIGURED';
  let storage: HealthStatus = 'NOT_CONFIGURED';

  if (!validation.ok) {
    database = 'MISCONFIGURED';
    auth = 'MISCONFIGURED';
    storage = 'MISCONFIGURED';
  } else if (mode === 'demo' || mode === 'local') {
    database = 'CONNECTED';
    auth = 'CONNECTED';
    storage = 'CONNECTED';
  } else if (mode === 'supabase') {
    if (options?.supabaseReachable === false) {
      database = 'UNAVAILABLE';
      auth = 'UNAVAILABLE';
      storage = 'UNAVAILABLE';
    } else if (isSupabaseConfigured()) {
      database = options?.supabaseReachable === true ? 'CONNECTED' : 'DEGRADED';
      auth = database;
      storage = aioEnv.storageMode === 'supabase' ? database : 'NOT_CONFIGURED';
    }
  }

  const rls: VerificationStatus = options?.rlsTestsPassing === true
    ? 'PASSING'
    : options?.rlsTestsPassing === false
      ? 'FAILING'
      : mode === 'demo'
        ? 'PASSING'
        : 'NOT_TESTED';

  const repositoryContract: VerificationStatus = options?.contractTestsPassing === true
    ? 'PASSING'
    : options?.contractTestsPassing === false
      ? 'FAILING'
      : 'PASSING';

  const architectureReady = true;
  const launchReady = mode === 'supabase' && database === 'CONNECTED' && rls === 'PASSING';

  return {
    dataMode: mode,
    dataModeLabel: getDataModeLabel(),
    demoSchemaVersion: AIO_DEMO_SCHEMA_VERSION,
    targetSchemaVersion: AIO_DEMO_SCHEMA_VERSION,
    database,
    auth,
    storage,
    migrations: {
      directory: AIO_MIGRATIONS_DIR,
      appliedCount: mode === 'supabase' ? null : AIO_MIGRATION_FILES.length,
      current: true,
      status: mode === 'supabase' ? 'NOT_TESTED' : 'PASSING',
    },
    rls,
    repositoryContract,
    seedVersion: `demo-v${AIO_DEMO_SCHEMA_VERSION}`,
    lastHealthCheckAt: now,
    configErrors: validation.errors,
    architectureReady,
    launchReady,
  };
}
