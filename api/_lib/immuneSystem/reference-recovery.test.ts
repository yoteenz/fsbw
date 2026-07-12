import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resetIncidentStoreForTests } from '../../../src/studio-os-core/immune-system/incident-recorder.js';
import { computeMigrationChecksum } from '../../../src/studio-os-core/immune-system/migration-safety.js';

vi.mock('../supabase.js', () => ({
  getSupabaseAdminServiceRole: vi.fn(),
}));

vi.mock('./repair-executor.js', () => ({
  executeApprovedMigrationSql: vi.fn(async () => ({ ok: true, channel: 'postgres' as const, output: 'ok' })),
}));

vi.mock('./schema-probe.js', () => ({
  probeGovernedGenerationJobsTable: vi.fn(),
  verifyGovernedGenerationJobsContract: vi.fn(),
}));

vi.mock('./production-target.js', () => ({
  resolveSupabaseProjectRef: () => 'hyycomvcaqxxvyrfupes',
  getAllowedSupabaseProjectRefs: () => ['hyycomvcaqxxvyrfupes'],
  resolveImmuneEnvironment: () => 'production',
  isImmuneAutoRepairEnabled: () => true,
  isImmuneProductionTargetVerified: () => true,
}));

import { attemptSchemaDriftRecoveryForMissingTable } from './schema-drift-orchestrator.js';
import { probeGovernedGenerationJobsTable, verifyGovernedGenerationJobsContract } from './schema-probe.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_SQL = fs.readFileSync(
  path.join(__dirname, '../../../supabase/migrations/20260712180000_studio_governed_generation_jobs.sql'),
  'utf8'
);

describe('reference recovery — missing generation jobs table', () => {
  beforeEach(() => {
    resetIncidentStoreForTests();
    vi.mocked(probeGovernedGenerationJobsTable)
      .mockResolvedValueOnce({ tableExists: false, rlsEnabled: null, columns: [], indexes: [] })
      .mockResolvedValueOnce({
        tableExists: true,
        rlsEnabled: true,
        columns: [],
        indexes: [
          'studio_governed_generation_jobs_org_status_idx',
          'studio_governed_generation_jobs_idempotency_idx',
          'studio_governed_generation_jobs_compile_run_idx',
          'studio_governed_generation_jobs_idempotency_active_uidx',
        ],
      });
    vi.mocked(verifyGovernedGenerationJobsContract).mockReturnValue({ ok: true, failures: [] });
  });

  it('recovers via Class A repair and allows single retry', async () => {
    const supabase = { from: vi.fn() } as unknown as import('@supabase/supabase-js').SupabaseClient;
    const result = await attemptSchemaDriftRecoveryForMissingTable(supabase, {
      organizationId: 'frontal-slayer',
      affectedSubsystem: 'Governed Generation Dispatch',
      affectedOperation: 'submitGovernedGenerationJobAsync.insert',
      errorCode: 'job-submit-failed',
      errorMessage:
        "Could not find the table 'public.studio_governed_generation_jobs' in the schema cache",
      correlationIds: ['trace-ref-1'],
      hintedTable: 'studio_governed_generation_jobs',
    });

    expect(result.recovered).toBe(true);
    expect(result.shouldRetryOriginalOperation).toBe(true);
    expect(result.response.status).toBe('recovered-automatically');
    expect(result.response.founderAction).toBe('None');
    expect(computeMigrationChecksum(MIGRATION_SQL).length).toBe(64);
  });
});
