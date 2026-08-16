/**
 * Sprint 23 — migration state tracking model.
 */

import { AIO_MIGRATION_FILES } from '../data/dataHealth';
import type { MigrationState } from './types';

export interface MigrationRecord {
  filename: string;
  state: MigrationState;
  appliedAt?: string;
  error?: string;
}

export const CANONICAL_MIGRATIONS = AIO_MIGRATION_FILES;

export function initialMigrationRecords(): MigrationRecord[] {
  return CANONICAL_MIGRATIONS.map((filename) => ({
    filename,
    state: 'NOT_APPLIED' as MigrationState,
  }));
}

/** Forward-only migration strategy — no automatic down migrations in production */
export const MIGRATION_STRATEGY = {
  direction: 'forward-only',
  productionDownMigration: 'forbidden-without-explicit-approval',
  dryRunRequired: ['clean-staging', 'current-staging'],
} as const;
