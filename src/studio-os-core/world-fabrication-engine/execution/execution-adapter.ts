import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { FabricationJobBudget } from '../cost-control';
import { ingestFabricationAssetPackage } from '../package-ingestion/ingest-workflow';
import { inspectGlbFile } from '../package-ingestion/glb-inspector';
import { resolveBlenderExecutable } from './blender-path';
import { discoverCodexInterface } from './codex-discovery';
import { buildSite00BuildObjectV2Assignment } from './fabrication-assignment';
import type {
  ExecutionJobRecord,
  ExecutionLoopEvidence,
  ExecutionPhase,
  FabricationAssignmentManifest,
} from './types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNNER_SCRIPT = join(__dirname, 'blender', 'wfe_blender_benchmark_runner.py');

export function validateExecutionInputs(assignment: FabricationAssignmentManifest): string[] {
  const errors: string[] = [];
  if (!existsSync(assignment.packageRoot)) errors.push('packageRoot missing');
  if (!existsSync(join(assignment.packageRoot, '01_SOURCE/SITE00_Build_Object_V2.blend'))) {
    errors.push('V2 blend master missing');
  }
  if (!existsSync(join(assignment.packageRoot, '05_DOCUMENTATION/module-manifest.json'))) {
    errors.push('module-manifest.json missing');
  }
  return errors;
}

export function authorizeExecution(budget: FabricationJobBudget, assignment: FabricationAssignmentManifest): {
  allowed: boolean;
  reason?: string;
} {
  if (budget.allowPaidGeneration) {
    return { allowed: false, reason: 'Paid generation not authorized for benchmark execution' };
  }
  if (assignment.projectId !== 'site00') return { allowed: false, reason: 'Cross-project execution denied' };
  if (assignment.executionBudget.allowPaidGeneration) {
    return { allowed: false, reason: 'Paid generation not authorized' };
  }
  return { allowed: true };
}

export function dispatchBlenderBenchmarkJob(
  assignment: FabricationAssignmentManifest,
  options?: { blenderBin?: string; timeoutMs?: number }
): ExecutionJobRecord {
  const phases: ExecutionPhase[] = ['PREPARE_ASSIGNMENT', 'VALIDATE_INPUTS', 'AUTHORIZE_EXECUTION'];
  const inputErrors = validateExecutionInputs(assignment);
  if (inputErrors.length) {
    return {
      jobId: `job-${assignment.assignmentId}`,
      assignmentId: assignment.assignmentId,
      backend: 'BLENDER_LOCAL',
      status: 'FAILED',
      phasesCompleted: phases,
      codexDispatch: 'NOT_APPLICABLE',
      errors: inputErrors,
    };
  }

  const blender = options?.blenderBin
    ? { path: options.blenderBin, versionHint: 'custom' }
    : resolveBlenderExecutable();
  if (!blender) {
    return {
      jobId: `job-${assignment.assignmentId}`,
      assignmentId: assignment.assignmentId,
      backend: 'BLENDER_LOCAL',
      status: 'BLOCKED',
      phasesCompleted: [...phases, 'DISPATCH_JOB'],
      codexDispatch: 'NOT_APPLICABLE',
      errors: ['Blender executable not found — set WFE_BLENDER_BIN or install Blender 5.2.2+'],
    };
  }

  mkdirSync(assignment.returnRoot, { recursive: true });
  const logDir = join(assignment.returnRoot, 'logs');
  mkdirSync(logDir, { recursive: true });
  const stdoutLogPath = join(logDir, 'blender-stdout.log');
  const stderrLogPath = join(logDir, 'blender-stderr.log');

  phases.push('DISPATCH_JOB', 'TRACK_STATUS');
  const startedAt = new Date().toISOString();
  const result = spawnSync(
    blender.path,
    ['--background', '--python', RUNNER_SCRIPT],
    {
      env: {
        ...process.env,
        WFE_PACKAGE_ROOT: assignment.packageRoot,
        WFE_RETURN_ROOT: assignment.returnRoot,
      },
      encoding: 'utf8',
      timeout: options?.timeoutMs ?? 120_000,
    }
  );

  writeFileSync(stdoutLogPath, result.stdout ?? '');
  writeFileSync(stderrLogPath, result.stderr ?? '');

  const reportPath = join(assignment.returnRoot, '05_DOCUMENTATION/wfe-blender-execution-report.json');
  const succeeded = result.status === 0 && existsSync(reportPath);

  return {
    jobId: `job-${assignment.assignmentId}`,
    assignmentId: assignment.assignmentId,
    backend: 'BLENDER_LOCAL',
    status: succeeded ? 'SUCCEEDED' : result.error?.message?.includes('ETIMEDOUT') ? 'TIMEOUT' : 'FAILED',
    phasesCompleted: succeeded
      ? ([...phases, 'COLLECT_OUTPUTS', 'VERIFY_OUTPUTS'] as ExecutionPhase[])
      : phases,
    blenderBin: blender.path,
    blenderVersion: blender.versionHint,
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status ?? -1,
    stdoutLogPath,
    stderrLogPath,
    returnPackageRoot: assignment.returnRoot,
    codexDispatch: 'BLOCKED',
    errors: succeeded ? [] : [result.stderr?.slice(-500) || 'Blender runner failed'],
  };
}

export function verifyExecutionOutputs(returnRoot: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const report = join(returnRoot, '05_DOCUMENTATION/wfe-blender-execution-report.json');
  const testGlb = join(returnRoot, '02_EXPORTS/SITE00_Build_Object_V2_ExecutionTest_Web.glb');
  if (!existsSync(report)) errors.push('Missing wfe-blender-execution-report.json');
  if (!existsSync(testGlb)) errors.push('Missing execution test GLB export');
  if (existsSync(testGlb)) {
    const inspection = inspectGlbFile(testGlb);
    if (!inspection.parseOk) errors.push(`Execution test GLB parse failed: ${inspection.parseErrors.join('; ')}`);
  }
  return { ok: errors.length === 0, errors };
}

export function runSite00BuildObjectExecutionLoop(params: {
  packageRoot: string;
  runRoot: string;
  reportsIngestDir?: string;
  existingIngestRecords?: Parameters<typeof ingestFabricationAssetPackage>[0]['existingRecords'];
}): {
  assignment: FabricationAssignmentManifest;
  job: ExecutionJobRecord;
  evidence: ExecutionLoopEvidence;
  ingestion?: ReturnType<typeof ingestFabricationAssetPackage>;
} {
  mkdirSync(params.runRoot, { recursive: true });
  const assignment = buildSite00BuildObjectV2Assignment({
    assignmentId: `site00-v2-loop-${Date.now()}`,
    packageRoot: params.packageRoot,
    returnRoot: join(params.runRoot, 'return-package'),
  });

  writeFileSync(join(params.runRoot, 'fabrication-assignment.json'), JSON.stringify(assignment, null, 2));

  const budget: FabricationJobBudget = {
    budgetId: 'bench-zero',
    manifestId: assignment.handoff.manifestId,
    organizationId: 'studio-os-internal',
    spentCredits: 0,
    allowPaidGeneration: false,
    autoRetryPaid: false,
    requiresFounderApprovalAboveCap: true,
    perStageCaps: {},
  };

  const auth = authorizeExecution(budget, assignment);
  if (!auth.allowed) {
    return {
      assignment,
      job: {
        jobId: 'blocked',
        assignmentId: assignment.assignmentId,
        backend: 'BLENDER_LOCAL',
        status: 'BLOCKED',
        phasesCompleted: ['PREPARE_ASSIGNMENT', 'VALIDATE_INPUTS', 'AUTHORIZE_EXECUTION'],
        codexDispatch: 'BLOCKED',
        errors: [auth.reason ?? 'Not authorized'],
      },
      evidence: {
        handoffPrepared: true,
        jobDispatched: false,
        blenderExecuted: false,
        outputsVerified: false,
        returnIngested: false,
        founderReviewReady: false,
        classification: 'BLOCKED',
      },
    };
  }

  const job = dispatchBlenderBenchmarkJob(assignment);
  const verify = job.returnPackageRoot ? verifyExecutionOutputs(job.returnPackageRoot) : { ok: false, errors: ['no return root'] };

  let ingestion: ReturnType<typeof ingestFabricationAssetPackage> | undefined;
  if (verify.ok && job.returnPackageRoot) {
    ingestion = ingestFabricationAssetPackage({
      projectId: 'site00',
      assetId: 'site00_bld_object_v2_execution_return',
      productionProfileId: 'SITE00_BUILD_OBJECT_WEB_3D',
      packageRoot: job.returnPackageRoot,
      existingRecords: params.existingIngestRecords,
      outputReportsDir: params.reportsIngestDir ?? join(params.runRoot, 'ingestion-reports'),
    });
    job.phasesCompleted.push('REGISTER_LINEAGE', 'PREPARE_REVIEW');
  }

  const blenderExecuted = job.status === 'SUCCEEDED';
  const returnIngested = ingestion?.outcome === 'INGESTED' || ingestion?.outcome === 'INGESTED_WITH_WARNINGS';

  let classification: ExecutionLoopEvidence['classification'] = 'BLOCKED';
  if (blenderExecuted && verify.ok && returnIngested) {
    classification = 'PARTIAL_BLENDER_VERIFIED';
  } else if (blenderExecuted && verify.ok) {
    classification = 'PARTIAL_BLENDER_VERIFIED';
  }

  const evidence: ExecutionLoopEvidence = {
    handoffPrepared: true,
    jobDispatched: job.status !== 'BLOCKED',
    blenderExecuted,
    outputsVerified: verify.ok,
    returnIngested,
    founderReviewReady: returnIngested,
    classification,
  };

  writeFileSync(join(params.runRoot, 'execution-evidence.json'), JSON.stringify({ job, evidence, verify }, null, 2));

  return { assignment, job, evidence, ingestion };
}

/** Codex status from CLI discovery (not Blender local runner). */
export function getCodexIntegrationStatus(): {
  status: 'HANDOFF_PREPARED_ONLY' | 'DISPATCH_AVAILABLE';
  dispatch: 'VERIFIED' | 'BLOCKED';
  reason: string;
  interfaceReport: ReturnType<typeof discoverCodexInterface>;
} {
  const report = discoverCodexInterface({ runAuthProbe: false });
  const blocked = report.authStatus !== 'VERIFIED';
  return {
    status: blocked ? 'HANDOFF_PREPARED_ONLY' : 'DISPATCH_AVAILABLE',
    dispatch: blocked ? 'BLOCKED' : 'VERIFIED',
    reason: blocked
      ? report.authBlocker ?? 'Codex CLI present but authentication not verified in this environment'
      : 'Codex CLI and authentication probe succeeded',
    interfaceReport: report,
  };
}

export function readBlenderReport(returnRoot: string): Record<string, unknown> | null {
  const p = join(returnRoot, '05_DOCUMENTATION/wfe-blender-execution-report.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as Record<string, unknown>;
}
