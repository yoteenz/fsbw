import { describe, expect, it, vi } from 'vitest';
import {
  validateProductionBuildConfig,
  resolveDeploymentEnvironment,
  isProductionDeployment,
} from './environmentModel';
import { canPrepareProduction, canLaunchPublicly } from './productionGates';
import { buildHealthSnapshot } from './health';
import { evaluateRlsReadiness, RLS_STAGING_TEST_MATRIX } from './rlsGate';
import { INFRASTRUCTURE_INVENTORY, PROVIDER_DECISIONS } from './infrastructureInventory';
import { getInfrastructureMatrix } from './infrastructureStatus';
import { SERVICE_ACTIVATION_MATRIX } from './serviceActivation';
import { generateCorrelationId } from './correlationId';
import { logStructured } from './logging';
import { CANONICAL_MIGRATIONS } from './migrationState';
import { runFsIsolationSelfCheck } from '../security/fsIsolation';
import { isStandaloneExtractionComplete } from '../qa/extractionGate';

describe('environment model', () => {
  it('defaults to local deployment environment', () => {
    expect(resolveDeploymentEnvironment()).toBe('local');
  });

  it('rejects production + demo data mode in build validation', () => {
    vi.stubEnv('VITE_AIO_ENVIRONMENT', 'production');
    vi.stubEnv('VITE_AIO_DATA_MODE', 'demo');
    const result = validateProductionBuildConfig();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('DATA_MODE=demo'))).toBe(true);
    vi.unstubAllEnvs();
  });

  it('blocks Frontal Slayer supabase URL', () => {
    const fsRef = 'hyycomvcaqxxvyrfupes';
    vi.stubEnv('VITE_AIO_SUPABASE_URL', `https://${fsRef}.supabase.co`); // pragma: allowlist secret
    const result = validateProductionBuildConfig();
    expect(result.ok).toBe(false);
    vi.unstubAllEnvs();
  });

  it('blocks equal staging and production project refs', () => {
    vi.stubEnv('VITE_AIO_STAGING_PROJECT_REF', 'abc123');
    vi.stubEnv('VITE_AIO_PRODUCTION_PROJECT_REF', 'abc123');
    const result = validateProductionBuildConfig();
    expect(result.ok).toBe(false);
    vi.unstubAllEnvs();
  });
});

describe('production gates', () => {
  it('standalone extraction is complete', () => {
    const extraction = isStandaloneExtractionComplete();
    expect(extraction.complete).toBe(true);
  });

  it('canPrepareProduction is blocked without Supabase in default demo', () => {
    const gate = canPrepareProduction();
    expect(gate.status).toBe('BLOCKED');
    expect(gate.blockers.length).toBeGreaterThan(0);
  });

  it('canLaunchPublicly is always blocked in Sprint 23', () => {
    const gate = canLaunchPublicly();
    expect(gate.status).toBe('BLOCKED');
    expect(gate.blockers.some((b) => b.includes('Sprint 24'))).toBe(true);
  });

  it('FS isolation self-check passes', () => {
    const check = runFsIsolationSelfCheck();
    expect(check.ok).toBe(true);
  });
});

describe('health snapshot', () => {
  it('returns application liveness OK in local demo', () => {
    const health = buildHealthSnapshot();
    expect(health.liveness).toBe('OK');
    expect(health.checks.length).toBeGreaterThan(0);
  });
});

describe('RLS gate', () => {
  it('marks demo mode as not tested against live DB', () => {
    const rls = evaluateRlsReadiness();
    expect(rls.status).toBe('RLS_NOT_TESTED');
  });

  it('defines staging test matrix', () => {
    expect(RLS_STAGING_TEST_MATRIX.length).toBeGreaterThanOrEqual(5);
  });
});

describe('inventory', () => {
  it('has infrastructure inventory entries', () => {
    expect(INFRASTRUCTURE_INVENTORY.length).toBeGreaterThan(10);
    expect(PROVIDER_DECISIONS.databaseAuthStorage).toContain('Supabase');
  });

  it('infrastructure matrix includes launch gate blocked', () => {
    const matrix = getInfrastructureMatrix();
    const launch = matrix.find((m) => m.id === 'launch-gate');
    expect(launch?.status).toBe('BLOCKED');
  });

  it('service activation separates software from business ready', () => {
    const brokerage = SERVICE_ACTIVATION_MATRIX.find((s) => s.id === 'brokerage');
    expect(brokerage?.softwareReady).toBe(true);
    expect(brokerage?.businessReady).toBe(false);
  });
});

describe('observability', () => {
  it('generates unique correlation IDs', () => {
    const a = generateCorrelationId();
    const b = generateCorrelationId();
    expect(a).not.toBe(b);
    expect(a.startsWith('aio-')).toBe(true);
  });

  it('structured log redacts sensitive metadata keys', () => {
    const entry = logStructured('test.event', 'info', {
      metadata: { password: 'secret123', event: 'ok' },
    });
    expect(entry.metadata?.password).toBe('[REDACTED]');
  });
});

describe('migrations', () => {
  it('lists 8 canonical migration files', () => {
    expect(CANONICAL_MIGRATIONS).toHaveLength(8);
  });
});

describe('production deployment guard', () => {
  it('isProductionDeployment false in test env', () => {
    expect(isProductionDeployment()).toBe(false);
  });
});
