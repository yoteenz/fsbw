import { describe, expect, it, beforeEach } from 'vitest';
import { discoverCodexInterface } from './codex-discovery';
import {
  attemptCodexDispatch,
  prepareCodexHandoff,
  resetCodexDispatchRegistryForTests,
} from './codex-dispatch-adapter';
import { buildSite00BuildObjectV2Assignment } from './fabrication-assignment';
import { join } from 'node:path';

const FIXTURE = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/fixture');

describe('Codex discovery', () => {
  it('finds @openai/codex CLI via npx', () => {
    const report = discoverCodexInterface({ runAuthProbe: false });
    expect(report.interfaceName).toBe('@openai/codex');
    expect(report.cliVersion).toBeTruthy();
  });

  it('reports auth blocked without API key in cloud agent', () => {
    const report = discoverCodexInterface({ runAuthProbe: true });
    expect(['BLOCKED', 'UNTESTED']).toContain(report.authStatus);
  });
});

describe('Codex dispatch adapter', () => {
  beforeEach(() => resetCodexDispatchRegistryForTests());

  it('prepares handoff without claiming dispatch', () => {
    const assignment = buildSite00BuildObjectV2Assignment({
      assignmentId: 'test-handoff',
      packageRoot: FIXTURE,
      returnRoot: join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/codex-test-return'),
    });
    const record = prepareCodexHandoff(assignment);
    expect(record.state).toBe('HANDOFF_PREPARED');
  });

  it('does not verify dispatch when auth blocked', () => {
    const assignment = buildSite00BuildObjectV2Assignment({
      assignmentId: 'test-dispatch-blocked',
      packageRoot: FIXTURE,
      returnRoot: join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/codex-test-return2'),
    });
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.CODEX_API_KEY;
    const record = attemptCodexDispatch(assignment, join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/codex-dispatch-work'), {
      forceAuthProbe: true,
    });
    if (prev) process.env.OPENAI_API_KEY = prev;
    expect(record.state).toBe('AWAITING_EXTERNAL_EXECUTION');
    expect(record.codexJobId).toBeUndefined();
  });
});
