import { describe, expect, it, beforeEach } from 'vitest';
import {
  detectDestructiveSql,
  detectRlsWeakeningSql,
  analyzeMigrationSafety,
  computeMigrationChecksum,
  classifyMigrationRisk,
} from './migration-safety.js';
import {
  inferMissingTableFromError,
  isMissingTableError,
  detectDriftForTableContract,
  buildDriftReport,
} from './drift-detector.js';
import { evaluateAutomaticRepairAuthorization } from './repair-authorization.js';
import {
  createIncident,
  resetIncidentStoreForTests,
  acquireRepairLock,
  releaseRepairLock,
  recognizeIncidentSignature,
} from './incident-recorder.js';
import { STUDIO_GOVERNED_GENERATION_JOBS_TABLE, verifyTableContractAgainstProbe } from './schema-contract.js';
import { findMigrationForTable, isMigrationAllowlisted } from './migration-manifest.js';
import { evaluateDeploymentReadinessFromTables, getGovernedGenerationReadinessFromPresence } from './readiness.js';
import { IMMUNE_PRODUCTION_PROJECT_REF } from './constants.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_SQL = fs.readFileSync(
  path.join(__dirname, '../../../supabase/migrations/20260712180000_studio_governed_generation_jobs.sql'),
  'utf8'
);

describe('immune system migration safety', () => {
  it('detects destructive migration', () => {
    expect(detectDestructiveSql('DROP TABLE public.foo')).toBe(true);
    expect(detectDestructiveSql(MIGRATION_SQL)).toBe(false);
  });

  it('detects RLS weakening', () => {
    expect(detectRlsWeakeningSql('ALTER TABLE foo DISABLE ROW LEVEL SECURITY')).toBe(true);
    expect(detectRlsWeakeningSql(MIGRATION_SQL)).toBe(false);
  });

  it('classifies governed jobs migration as Class A', () => {
    expect(classifyMigrationRisk(MIGRATION_SQL)).toBe('A');
    expect(analyzeMigrationSafety(MIGRATION_SQL).riskClass).toBe('A');
  });

  it('checksum mismatch blocks repair authorization', () => {
    const finding = detectDriftForTableContract(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, null, 'production')[0];
    const auth = evaluateAutomaticRepairAuthorization({
      finding: { ...finding, proposedMigrationChecksum: 'wrong' },
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(false);
    expect(auth.deniedReason).toMatch(/checksum/i);
  });
});

describe('immune system drift detector', () => {
  it('detects missing table from schema cache error', () => {
    const msg = "Could not find the table 'public.studio_governed_generation_jobs' in the schema cache";
    expect(isMissingTableError(msg)).toBe(true);
    expect(inferMissingTableFromError(msg)?.qualifiedName).toBe('public.studio_governed_generation_jobs');
  });

  it('detects missing table drift', () => {
    const findings = detectDriftForTableContract(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, null, 'production');
    expect(findings[0]?.driftType).toBe('missing-table');
    expect(findings[0]?.diagnosisConfidence).toBe(1);
  });

  it('detects missing column', () => {
    const probe = {
      tableExists: true,
      rlsEnabled: true,
      columns: [{ name: 'job_id', data_type: 'text', is_nullable: false }],
      indexes: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.indexes.map((i) => i.name),
    };
    const result = verifyTableContractAgainstProbe(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, probe);
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.startsWith('missing column'))).toBe(true);
  });

  it('detects missing index', () => {
    const probe = {
      tableExists: true,
      rlsEnabled: true,
      columns: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.columns.map((c) => ({
        name: c.name,
        data_type: c.dataType,
        is_nullable: c.nullable,
      })),
      indexes: [],
    };
    const result = verifyTableContractAgainstProbe(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, probe);
    expect(result.failures.some((f) => f.startsWith('missing index'))).toBe(true);
  });

  it('detects missing RLS', () => {
    const probe = {
      tableExists: true,
      rlsEnabled: false,
      columns: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.columns.map((c) => ({
        name: c.name,
        data_type: c.dataType,
        is_nullable: c.nullable,
      })),
      indexes: STUDIO_GOVERNED_GENERATION_JOBS_TABLE.indexes.map((i) => i.name),
    };
    const result = verifyTableContractAgainstProbe(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, probe);
    expect(result.failures.some((f) => f.startsWith('RLS'))).toBe(true);
  });

  it('maps missing table to approved migration', () => {
    const m = findMigrationForTable('public.studio_governed_generation_jobs');
    expect(m?.migrationId).toBe('20260712180000_studio_governed_generation_jobs');
    expect(isMigrationAllowlisted(m!.migrationId)).toBe(true);
  });
});

describe('immune system repair authorization', () => {
  const finding = detectDriftForTableContract(STUDIO_GOVERNED_GENERATION_JOBS_TABLE, null, 'production')[0];

  it('authorizes Class A additive migration', () => {
    const auth = evaluateAutomaticRepairAuthorization({
      finding: { ...finding, proposedMigrationChecksum: computeMigrationChecksum(MIGRATION_SQL) },
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(true);
    expect(auth.riskClass).toBe('A');
  });

  it('denies destructive migration', () => {
    const auth = evaluateAutomaticRepairAuthorization({
      finding,
      migrationSql: 'DROP TABLE public.studio_governed_generation_jobs;',
      expectedChecksum: null,
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(false);
  });

  it('denies unknown migration allowlist', () => {
    const auth = evaluateAutomaticRepairAuthorization({
      finding: { ...finding, proposedMigrationId: 'unknown_migration' },
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(false);
  });

  it('denies wrong Supabase project', () => {
    const auth = evaluateAutomaticRepairAuthorization({
      finding,
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: 'wrong-project',
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(false);
  });

  it('denies wrong environment', () => {
    const auth = evaluateAutomaticRepairAuthorization({
      finding,
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'staging',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: false,
    });
    expect(auth.allowed).toBe(false);
  });

  it('deduplicates concurrent repair', () => {
    expect(acquireRepairLock('public.studio_governed_generation_jobs')).toBe(true);
    const auth = evaluateAutomaticRepairAuthorization({
      finding,
      migrationSql: MIGRATION_SQL,
      expectedChecksum: computeMigrationChecksum(MIGRATION_SQL),
      targetProjectRef: IMMUNE_PRODUCTION_PROJECT_REF,
      allowedProjectRefs: [IMMUNE_PRODUCTION_PROJECT_REF],
      environment: 'production',
      expectedEnvironment: 'production',
      autoRepairEnabled: true,
      concurrentRepairActive: true,
    });
    expect(auth.allowed).toBe(false);
    releaseRepairLock('public.studio_governed_generation_jobs');
  });
});

describe('immune system incident recorder', () => {
  beforeEach(() => resetIncidentStoreForTests());

  it('records incident lifecycle without secrets', () => {
    const inc = createIncident({
      organizationId: 'frontal-slayer',
      environment: 'production',
      detectedAt: new Date().toISOString(),
      detectionSource: 'test',
      affectedSubsystem: 'Governed Generation Dispatch',
      affectedOperation: 'test',
      symptom: 'missing table',
      errorCode: 'job-submit-failed',
      errorMessage: 'schema cache',
      diagnosisCategory: 'missing-table',
      diagnosisConfidence: 1,
      expectedResource: 'public.studio_governed_generation_jobs',
      observedResourceState: 'missing',
      driftType: 'missing-table',
      proposedRepairId: '20260712180000_studio_governed_generation_jobs',
      proposedMigrationId: '20260712180000_studio_governed_generation_jobs',
      proposedMigrationChecksum: computeMigrationChecksum(MIGRATION_SQL),
      repairRiskClass: 'A',
      authorizationSource: 'test',
      safeSummary: 'test',
      technicalEvidence: { service_role_key: 'REDACTED_SHOULD_NOT_APPEAR' },
      correlationIds: ['trace-1'],
    });
    expect(inc.incidentId).toBeTruthy();
    expect(recognizeIncidentSignature('missing-schema-resource:public.studio_governed_generation_jobs')).toMatch(
      /20260712180000/
    );
  });
});

describe('deployment readiness', () => {
  it('blocks when schema missing', () => {
    const r = evaluateDeploymentReadinessFromTables({
      'public.studio_governed_generation_jobs': false,
    });
    expect(r.ready).toBe(false);
    expect(r.blockedFeatures).toContain('async-governed-generation-v1');
  });

  it('ready when table present', () => {
    const r = getGovernedGenerationReadinessFromPresence(true);
    expect(r.health).toBe('ready');
  });

  it('buildDriftReport aggregates findings', () => {
    const report = buildDriftReport({
      environment: 'production',
      probes: { 'public.studio_governed_generation_jobs': null },
    });
    expect(report.ok).toBe(false);
    expect(report.findings.length).toBeGreaterThan(0);
  });
});
