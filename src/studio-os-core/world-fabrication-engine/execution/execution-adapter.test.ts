import { describe, expect, it } from 'vitest';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import {
  authorizeExecution,
  dispatchBlenderBenchmarkJob,
  getCodexIntegrationStatus,
  runSite00BuildObjectExecutionLoop,
  validateExecutionInputs,
  verifyExecutionOutputs,
} from './execution-adapter';
import { buildSite00BuildObjectV2Assignment } from './fabrication-assignment';
import { resolveBlenderExecutable } from './blender-path';
import type { FabricationJobBudget } from '../cost-control';

const FIXTURE = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/fixture');
const RUN_ROOT = join(import.meta.dirname, '../benchmarks/site00-build-object-v2/execution-runs/vitest-loop');
const blenderAvailable = Boolean(resolveBlenderExecutable());
const fixturePresent = existsSync(join(FIXTURE, '01_SOURCE/SITE00_Build_Object_V2.blend'));

const zeroBudget: FabricationJobBudget = {
  budgetId: 'test',
  manifestId: 'm',
  organizationId: 'studio-os-internal',
  spentCredits: 0,
  allowPaidGeneration: false,
  autoRetryPaid: false,
  requiresFounderApprovalAboveCap: true,
  perStageCaps: {},
};

describe('execution adapter — contracts', () => {
  it('reports Codex dispatch blocked (handoff only)', () => {
    const codex = getCodexIntegrationStatus();
    expect(codex.dispatch).toBe('BLOCKED');
  });

  it('rejects cross-project authorization', () => {
    const assignment = buildSite00BuildObjectV2Assignment({
      assignmentId: 'a1',
      packageRoot: FIXTURE,
      returnRoot: join(RUN_ROOT, 'return'),
    });
    const bad = { ...assignment, projectId: 'other' };
    const auth = authorizeExecution(zeroBudget, bad);
    expect(auth.allowed).toBe(false);
  });

  it('blocks paid generation budget', () => {
    const assignment = buildSite00BuildObjectV2Assignment({
      assignmentId: 'a2',
      packageRoot: FIXTURE,
      returnRoot: join(RUN_ROOT, 'return2'),
    });
    const auth = authorizeExecution({ ...zeroBudget, allowPaidGeneration: true } as FabricationJobBudget, assignment);
    expect(auth.allowed).toBe(false);
  });

  it.skipIf(!fixturePresent)('validates fixture inputs', () => {
    const assignment = buildSite00BuildObjectV2Assignment({
      assignmentId: 'a3',
      packageRoot: FIXTURE,
      returnRoot: join(RUN_ROOT, 'return3'),
    });
    expect(validateExecutionInputs(assignment)).toEqual([]);
  });
});

describe('execution adapter — real Blender integration', () => {
  it.skipIf(!blenderAvailable || !fixturePresent)(
    'dispatches Blender job and verifies execution test GLB',
    () => {
      const returnRoot = join(RUN_ROOT, 'dispatch-return');
      const assignment = buildSite00BuildObjectV2Assignment({
        assignmentId: `vitest-${Date.now()}`,
        packageRoot: FIXTURE,
        returnRoot,
      });
      const job = dispatchBlenderBenchmarkJob(assignment);
      expect(job.status).toBe('SUCCEEDED');
      expect(job.codexDispatch).toBe('BLOCKED');
      const verify = verifyExecutionOutputs(returnRoot);
      expect(verify.ok).toBe(true);
    },
    180_000
  );

  it.skipIf(!blenderAvailable || !fixturePresent)(
    'runs end-to-end loop through return ingestion',
    () => {
      const loop = runSite00BuildObjectExecutionLoop({
        packageRoot: FIXTURE,
        runRoot: join(RUN_ROOT, `loop-${Date.now()}`),
      });
      expect(loop.evidence.handoffPrepared).toBe(true);
      expect(loop.evidence.blenderExecuted).toBe(true);
      expect(loop.evidence.outputsVerified).toBe(true);
      expect(loop.evidence.returnIngested).toBe(true);
      expect(loop.evidence.classification).toBe('PARTIAL_BLENDER_VERIFIED');
      expect(loop.job.codexDispatch).toBe('BLOCKED');
    },
    180_000
  );
});
