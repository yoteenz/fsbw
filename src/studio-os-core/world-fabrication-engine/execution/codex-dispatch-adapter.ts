import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { discoverCodexInterface } from './codex-discovery';
import type { FabricationAssignmentManifest } from './types';

export type CodexDispatchState =
  | 'DISPATCH_UNAVAILABLE'
  | 'HANDOFF_PREPARED'
  | 'AWAITING_EXTERNAL_EXECUTION'
  | 'DISPATCHED'
  | 'RUNNING'
  | 'OUTPUT_PENDING'
  | 'OUTPUT_RECEIVED'
  | 'VALIDATING'
  | 'READY_FOR_REVIEW'
  | 'FAILED'
  | 'CANCELLED';

export type CodexDispatchRecord = {
  dispatchId: string;
  assignmentId: string;
  projectId: string;
  state: CodexDispatchState;
  codexJobId?: string;
  dispatchTimestamp?: string;
  authorizationRef: string;
  expectedOutputs: string[];
  executionReceiptPath?: string;
  errors: string[];
  attemptNumber: number;
};

const dispatchedKeys = new Set<string>();

function stableDispatchKey(assignment: FabricationAssignmentManifest): string {
  const payload = JSON.stringify({
    assignmentId: assignment.assignmentId,
    packageRoot: assignment.packageRoot,
    assetId: assignment.assetId,
  });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

/** Stable argv for `codex exec` — regression-tested (no unsupported approval flags). */
export function buildCodexExecInvocation(_prompt: string): { argv: string[]; useStdin: true } {
  return {
    argv: [
      '--yes',
      '@openai/codex',
      'exec',
      '-s',
      'workspace-write',
      '-C',
      process.cwd(),
      '-',
    ],
    useStdin: true,
  };
}

export function prepareCodexHandoff(assignment: FabricationAssignmentManifest): CodexDispatchRecord {
  return {
    dispatchId: `dispatch-${assignment.assignmentId}`,
    assignmentId: assignment.assignmentId,
    projectId: assignment.projectId,
    state: 'HANDOFF_PREPARED',
    authorizationRef: `wfe-budget-zero-${assignment.assignmentId}`,
    expectedOutputs: assignment.expectedDeliverables,
    errors: [],
    attemptNumber: 0,
  };
}

export function authorizeCodexDispatch(
  assignment: FabricationAssignmentManifest,
  _record: CodexDispatchRecord
): { allowed: boolean; reason?: string } {
  if (assignment.projectId !== 'site00') return { allowed: false, reason: 'Cross-project dispatch denied' };
  if (assignment.executionBudget.allowPaidGeneration) {
    return { allowed: false, reason: 'Paid generation not authorized' };
  }
  const discovery = discoverCodexInterface({ runAuthProbe: true });
  if (discovery.interfaceName === 'UNAVAILABLE') {
    return { allowed: false, reason: 'Codex CLI not available' };
  }
  if (discovery.authStatus !== 'VERIFIED') {
    return { allowed: false, reason: discovery.authBlocker ?? 'Codex authentication blocked' };
  }
  return { allowed: true };
}

/**
 * Attempt real Codex dispatch via `codex exec`. Returns BLOCKED when auth missing.
 * Does NOT treat local Blender as Codex execution.
 */
export function attemptCodexDispatch(
  assignment: FabricationAssignmentManifest,
  workDir: string,
  options?: { forceAuthProbe?: boolean }
): CodexDispatchRecord {
  const record = prepareCodexHandoff(assignment);
  const key = stableDispatchKey(assignment);
  if (dispatchedKeys.has(key)) {
    record.state = 'FAILED';
    record.errors.push('Duplicate dispatch prevented for stable assignment fingerprint');
    return record;
  }

  const discovery = discoverCodexInterface({ runAuthProbe: options?.forceAuthProbe ?? true });
  if (discovery.interfaceName === 'UNAVAILABLE') {
    record.state = 'DISPATCH_UNAVAILABLE';
    record.errors.push('Codex CLI unavailable');
    return record;
  }

  const auth = authorizeCodexDispatch(assignment, record);
  if (!auth.allowed) {
    record.state = 'AWAITING_EXTERNAL_EXECUTION';
    record.errors.push(auth.reason ?? 'Dispatch not authorized');
    return record;
  }

  if (discovery.authStatus !== 'VERIFIED') {
    record.state = 'AWAITING_EXTERNAL_EXECUTION';
    record.errors.push(discovery.authBlocker ?? 'Codex authentication not verified');
    return record;
  }

  mkdirSync(workDir, { recursive: true });
  const promptPath = join(workDir, 'codex-assignment-prompt.txt');
  const prompt = [
    'WFE bounded fabrication benchmark — technical only.',
    `Project: ${assignment.projectId}`,
    `Asset: ${assignment.assetId}`,
    `Package root: ${assignment.packageRoot}`,
    `Return root: ${assignment.returnRoot}`,
    'Tasks: run existing validate_v2.py via Blender 5.2 if present; produce execution report; do not alter creative geometry.',
    `Expected: ${assignment.expectedDeliverables.join(', ')}`,
  ].join('\n');
  writeFileSync(promptPath, prompt);

  record.attemptNumber = 1;
  record.dispatchTimestamp = new Date().toISOString();
  record.state = 'DISPATCHED';

  const receiptPath = join(workDir, 'codex-execution-receipt.json');
  const timeoutMs = Number(process.env.WFE_CODEX_EXEC_TIMEOUT_MS ?? 480_000);
  const maxBufferBytes = Number(process.env.WFE_CODEX_EXEC_MAX_BUFFER_BYTES ?? 64 * 1024 * 1024);
  const invocation = buildCodexExecInvocation(prompt);
  const result = spawnSync('npx', invocation.argv, {
      input: prompt,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: maxBufferBytes,
      cwd: workDir,
      env: process.env,
    }
  );

  const timedOut = result.error?.message?.includes('ETIMEDOUT') ?? false;
  const maxBufferExceeded = result.error?.message?.includes('maxBuffer') ?? false;

  const receipt = {
    dispatchId: record.dispatchId,
    exitCode: result.status,
    signal: result.signal,
    spawnError: result.error?.message,
    timedOut,
    maxBufferExceeded,
    timeoutMs,
    maxBufferBytes,
    stdoutTail: (result.stdout ?? '').slice(-4000),
    stderrTail: (result.stderr ?? '').slice(-4000),
    dispatchedAt: record.dispatchTimestamp,
  };
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  record.executionReceiptPath = receiptPath;

  if (timedOut) {
    record.state = 'FAILED';
    record.errors.push(`Codex exec timed out after ${timeoutMs}ms`);
    return record;
  }
  if (maxBufferExceeded) {
    record.state = 'FAILED';
    record.errors.push(`Codex exec output exceeded maxBuffer (${maxBufferBytes} bytes)`);
    return record;
  }
  if (result.status !== 0 || (result.stderr ?? '').includes('401 Unauthorized')) {
    record.state = 'FAILED';
    record.errors.push('Codex exec did not complete successfully');
    if (result.signal) record.errors.push(`Codex exec terminated by signal ${result.signal}`);
    if (result.error?.message) record.errors.push(result.error.message);
    return record;
  }

  dispatchedKeys.add(key);
  record.codexJobId = `codex-exec-${record.dispatchId}`;
  record.state = 'OUTPUT_PENDING';
  return record;
}

export function resetCodexDispatchRegistryForTests(): void {
  dispatchedKeys.clear();
}

export function markExternalReturnReceived(
  record: CodexDispatchRecord,
  returnPackageRoot: string
): CodexDispatchRecord {
  if (!existsSync(returnPackageRoot)) {
    return { ...record, state: 'FAILED', errors: [...record.errors, 'Return package path missing'] };
  }
  return { ...record, state: 'OUTPUT_RECEIVED' };
}
