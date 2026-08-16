import { aioEnv, aioServerEnvKeys } from '../config/env';
import { AIO_MIGRATION_FILES } from '../data/dataHealth';
import { AIO_STORAGE_BUCKETS } from '../data/constants';
import { getRouteManifestSummary } from './routeManifest';
import { EXTRACTION_BLOCKERS_STATIC } from './dependencyGraph';

export const AIO_ENV_INVENTORY = [
  { key: 'VITE_AIO_DATA_MODE', scope: 'PUBLIC', purpose: 'demo | local | supabase' },
  { key: 'VITE_AIO_SUPABASE_URL', scope: 'PUBLIC', purpose: 'Dedicated AIO Supabase URL' },
  { key: 'VITE_AIO_SUPABASE_ANON_KEY', scope: 'PUBLIC', purpose: 'Dedicated AIO anon key' },
  { key: 'VITE_AIO_STORAGE_MODE', scope: 'PUBLIC', purpose: 'demo | supabase' },
  { key: 'VITE_AIO_AUTH_MODE', scope: 'PUBLIC', purpose: 'demo | supabase' },
  { key: 'VITE_AIO_ENVIRONMENT', scope: 'PUBLIC', purpose: 'debug | staging | production' },
  ...aioServerEnvKeys.filter((k) => !k.startsWith('VITE_')).map((key) => ({
    key,
    scope: (key.includes('SERVICE_ROLE') ? 'SECRET' : 'SERVER') as 'SECRET' | 'SERVER',
    purpose: 'Server-only AIO configuration',
  })),
];

export const AIO_DATABASE_INVENTORY = {
  migrations: AIO_MIGRATION_FILES,
  migrationCount: AIO_MIGRATION_FILES.length,
  storageBuckets: Object.values(AIO_STORAGE_BUCKETS),
  tablesDocumented: 'See DATABASE_SCHEMA_MAP.md',
};

export const AIO_ASSET_INVENTORY = [
  { path: 'src/all-in-one/styles/', type: 'CSS', extract: true },
  { path: 'public/ (AIO-specific if any)', type: 'static', extract: 'review' as const },
  { path: 'aioAppConfig.assets', type: 'config', extract: true },
];

export function getPackageInventoryNote(): string {
  return 'Standalone package.json — independent of Frontal Slayer host';
}

export function getServerInventoryNote(): string {
  return 'AIO demo mode is client-side; server routes minimal in shared host — inventory for extraction in Sprint 22';
}

export function getExtractionInventorySummary() {
  return {
    routes: getRouteManifestSummary(),
    envVars: AIO_ENV_INVENTORY.length,
    migrations: AIO_DATABASE_INVENTORY.migrationCount,
    staticBlockers: [...EXTRACTION_BLOCKERS_STATIC],
    packageNote: getPackageInventoryNote(),
    serverNote: getServerInventoryNote(),
    currentDataMode: aioEnv.dataMode,
  };
}
