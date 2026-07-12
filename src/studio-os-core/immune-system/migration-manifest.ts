import type { ImmuneRepairRiskClass } from './types.js';

export type ApprovedMigrationManifestEntry = {
  migrationId: string;
  filename: string;
  snakeName: string;
  order: number;
  riskClass: ImmuneRepairRiskClass;
  createsTables: string[];
  dependencies: string[];
  rollbackStrategy: string;
  productionApproved: boolean;
  featureIds: string[];
};

/** Authoritative migration manifest — maps resources to repository SQL files. */
export const IMMUNE_APPROVED_MIGRATION_MANIFEST: ApprovedMigrationManifestEntry[] = [
  {
    migrationId: '20260712180000_studio_governed_generation_jobs',
    filename: '20260712180000_studio_governed_generation_jobs.sql',
    snakeName: 'studio_governed_generation_jobs',
    order: 20260712180000,
    riskClass: 'A',
    createsTables: ['public.studio_governed_generation_jobs'],
    dependencies: [],
    rollbackStrategy:
      'DROP TABLE public.studio_governed_generation_jobs — founder approval only after zero production rows',
    productionApproved: true,
    featureIds: ['async-governed-generation-v1'],
  },
];

export function findMigrationForTable(qualifiedTableName: string): ApprovedMigrationManifestEntry | null {
  return (
    IMMUNE_APPROVED_MIGRATION_MANIFEST.find((m) => m.createsTables.includes(qualifiedTableName)) ?? null
  );
}

export function findMigrationById(migrationId: string): ApprovedMigrationManifestEntry | null {
  return IMMUNE_APPROVED_MIGRATION_MANIFEST.find((m) => m.migrationId === migrationId) ?? null;
}

export function isMigrationAllowlisted(migrationId: string): boolean {
  return IMMUNE_APPROVED_MIGRATION_MANIFEST.some((m) => m.migrationId === migrationId && m.productionApproved);
}
