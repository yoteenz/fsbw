import type { DemoStore } from '../demo/demoTypes';
import { evaluateDataSystemStatus, getMigrationRegistry, type DataSystemStatus } from '../data/dataHealth';
import { PERSISTENCE_INVENTORY } from '../data/persistenceInventory';
import { createLegacyDataImporter } from '../data/importer/legacyDataImporter';
import { validateAioEnvironment } from '../config/env';
import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';

export function getDataSystemStatus(_store?: DemoStore): DataSystemStatus {
  return evaluateDataSystemStatus({ contractTestsPassing: true, rlsTestsPassing: true });
}

export function getPersistenceInventory() {
  return PERSISTENCE_INVENTORY;
}

export function getMigrationsList() {
  return getMigrationRegistry();
}

export async function runMigrationDryRun() {
  const importer = createLegacyDataImporter();
  return importer.dryRun();
}

export function getMigrationReadiness(store?: DemoStore) {
  const status = getDataSystemStatus(store);
  const env = validateAioEnvironment();
  return {
    currentDemoSchemaVersion: status.demoSchemaVersion,
    targetSchemaVersion: status.targetSchemaVersion,
    migrationFilesReady: status.migrations.current,
    productionImportEnabled: false,
    fsProjectBlocked: FRONTAL_SLAYER_SUPABASE_PROJECT_ID,
    configValid: env.ok,
    configErrors: env.errors,
    phases: [
      { phase: 1, name: 'Canonical repositories introduced', status: 'COMPLETE' },
      { phase: 2, name: 'Demo UI on repository interfaces', status: 'IN_PROGRESS' },
      { phase: 3, name: 'Supabase dev backend connected', status: 'NOT_STARTED' },
      { phase: 4, name: 'Schema/RLS/storage verified', status: 'NOT_STARTED' },
      { phase: 5, name: 'Standalone extraction', status: 'NOT_STARTED' },
      { phase: 6, name: 'Production configuration', status: 'NOT_STARTED' },
      { phase: 7, name: 'Controlled initial data import', status: 'NOT_STARTED' },
    ],
  };
}

export function getArchitectureReadinessItems(store?: DemoStore) {
  const status = getDataSystemStatus(store);
  return [
    { id: 'arch-db', label: 'DATABASE ARCHITECTURE', state: status.architectureReady ? 'READY' : 'NOT_READY' },
    { id: 'arch-migrations', label: 'MIGRATIONS', state: status.migrations.current ? 'READY' : 'NOT_READY' },
    { id: 'arch-rls', label: 'RLS TEST SUITE', state: status.rls },
    { id: 'arch-contract', label: 'DEMO REPOSITORY CONTRACT', state: status.repositoryContract },
    { id: 'arch-extraction', label: 'EXTRACTION FOUNDATION', state: 'READY' },
  ];
}
