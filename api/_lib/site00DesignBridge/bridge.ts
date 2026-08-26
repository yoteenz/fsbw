/** Site00DesignBridge — FSBW consumer for approved SITE 00 design contracts */

import { execSync } from 'node:child_process';
import { getSupabaseAdmin } from '../supabase.js';
import {
  ELIGIBLE_CHANGE_STATUS,
  FSBW_REPO_BINDING,
  SITE00_PROJECT_KEYS,
} from './types.js';
import type {
  BridgeValidationResult,
  MaterializationApplyResult,
  Site00BridgeOptions,
  Site00BridgeSupabase,
  Site00DesignChangeRequest,
  Site00ProjectKey,
  Site00ReceiptEvent,
  Site00SourceMaterializationPlan,
} from './types.js';
import { validateOperations } from './operations.js';
import { PROJECT_BUILD_COMMANDS, PROJECT_SOURCE_ROOTS, PROJECT_TEST_COMMANDS } from './constants.js';
import {
  applyPlanToSource,
  compileMaterializationPlan,
  getMaterializerForProject,
} from './materializers.js';
import { resolveRuntimeBindings, validateRuntimeBindingRow } from './runtimeBindings.js';
import type { Site00RuntimeBindingRow } from './types.js';

function defaultGetCurrentCommit(repoRoot: string, scopePath: string): string | null {
  try {
    const out = execSync(`git rev-parse HEAD`, { cwd: repoRoot, encoding: 'utf8' }).trim();
    void scopePath;
    return out || null;
  } catch {
    return null;
  }
}

async function defaultExec(cmd: string, cwd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const stdout = execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? String(err) };
  }
}

export class Site00DesignBridge {
  private repoRoot: string;
  private isDryRunMode: boolean;
  private supabase: Site00BridgeSupabase;
  private execCommand: Site00BridgeOptions['execCommand'];
  private getCurrentCommit: NonNullable<Site00BridgeOptions['getCurrentCommit']>;
  private skipTests: boolean;
  private skipBuild: boolean;

  constructor(opts: Site00BridgeOptions) {
    this.repoRoot = opts.repoRoot;
    this.isDryRunMode = opts.dryRun ?? false;
    this.supabase = opts.supabase ?? (getSupabaseAdmin() as unknown as Site00BridgeSupabase);
    this.execCommand = opts.execCommand ?? defaultExec;
    this.getCurrentCommit = opts.getCurrentCommit ?? defaultGetCurrentCommit;
    this.skipTests = opts.skipTests ?? false;
    this.skipBuild = opts.skipBuild ?? false;
  }

  async getApprovedChanges(projectFilter?: Site00ProjectKey): Promise<Site00DesignChangeRequest[]> {
    let q = this.supabase
      .from('site00_design_change_requests')
      .select('*')
      .eq('status', ELIGIBLE_CHANGE_STATUS)
      .eq('repo_binding', FSBW_REPO_BINDING);

    if (projectFilter) q = q.eq('project_id', projectFilter);

    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw new Error(error.message);

    return ((data as Site00DesignChangeRequest[]) ?? []).filter((row) =>
      this.validateChangeAuthority(row).ok,
    );
  }

  async getChangeById(changeId: string): Promise<Site00DesignChangeRequest | null> {
    const { data, error } = await this.supabase
      .from('site00_design_change_requests')
      .select('*')
      .eq('change_request_id', changeId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Site00DesignChangeRequest | null) ?? null;
  }

  validateChangeAuthority(change: Site00DesignChangeRequest): BridgeValidationResult {
    if (change.repo_binding !== FSBW_REPO_BINDING) {
      return { ok: false, status: 'BLOCKED', reason: `Wrong repo binding: ${change.repo_binding}` };
    }
    if (change.status !== ELIGIBLE_CHANGE_STATUS) {
      return { ok: false, status: 'BLOCKED', reason: `Ineligible status: ${change.status}` };
    }
    if (!(SITE00_PROJECT_KEYS as readonly string[]).includes(change.project_id)) {
      return { ok: false, status: 'BLOCKED', reason: `Invalid project: ${change.project_id}` };
    }
    return { ok: true, status: 'VALID' };
  }

  validateBaseCommit(change: Site00DesignChangeRequest): BridgeValidationResult {
    if (!change.base_source_commit) return { ok: true, status: 'VALID' };
    const scope = PROJECT_SOURCE_ROOTS[change.project_id];
    const current = this.getCurrentCommit(this.repoRoot, scope);
    if (!current) return { ok: true, status: 'VALID' };
    if (current.startsWith(change.base_source_commit) || change.base_source_commit.startsWith(current)) {
      return { ok: true, status: 'VALID', currentCommit: current, expectedCommit: change.base_source_commit };
    }
    return {
      ok: false,
      status: 'BLOCKED_SOURCE_DIVERGENCE',
      reason: 'Source diverged from base_source_commit',
      expectedCommit: change.base_source_commit,
      currentCommit: current,
      affectedTargets: [scope],
    };
  }

  validateOperations(change: Site00DesignChangeRequest): BridgeValidationResult {
    return validateOperations(change.project_id, change.operations ?? []);
  }

  validateRuntimeBinding(row: Site00RuntimeBindingRow): BridgeValidationResult {
    const v = validateRuntimeBindingRow(row);
    return v.ok ? { ok: true, status: 'VALID' } : { ok: false, status: 'BLOCKED', reason: v.reason };
  }

  async checkIdempotency(changeRequestId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('site00_design_change_applications')
      .select('change_request_id')
      .eq('change_request_id', changeRequestId)
      .maybeSingle();
    return !!data;
  }

  compileMaterializationPlan(change: Site00DesignChangeRequest): Site00SourceMaterializationPlan {
    const authority = this.validateChangeAuthority(change);
    if (!authority.ok) return compileMaterializationPlan(change, 'BLOCKED', authority.reason);

    const base = this.validateBaseCommit(change);
    if (!base.ok) return compileMaterializationPlan(change, 'BLOCKED_SOURCE_DIVERGENCE', base.reason);

    const ops = this.validateOperations(change);
    if (!ops.ok) return compileMaterializationPlan(change, ops.status, ops.reason);

    if (change.shell_propagation) {
      const materializer = getMaterializerForProject(change.project_id);
      const current = materializer.getCurrentShellVersion(change.shell_propagation.shellId);
      if (current && current !== change.shell_propagation.expectedVersion) {
        return compileMaterializationPlan(change, 'CONFLICT', `Shell version mismatch: ${current} != ${change.shell_propagation.expectedVersion}`);
      }
    }

    return compileMaterializationPlan(change, 'VALID');
  }

  async runDryRun(change: Site00DesignChangeRequest): Promise<Site00SourceMaterializationPlan> {
    await this.writeReceipt(change.change_request_id, 'FETCHED', change.project_id, { dryRun: true });
    const plan = this.compileMaterializationPlan(change);
    await this.writeReceipt(change.change_request_id, plan.status === 'VALID' ? 'VALIDATED' : 'BLOCKED', change.project_id, {
      plan,
      dryRun: true,
    });
    return plan;
  }

  async applyMaterializationPlan(change: Site00DesignChangeRequest): Promise<MaterializationApplyResult> {
    const already = await this.checkIdempotency(change.change_request_id);
    if (already) {
      return {
        ok: false,
        dryRun: this.isDryRunMode,
        plan: this.compileMaterializationPlan(change),
        filesChanged: [],
        componentsChanged: [],
        routesChanged: [],
        error: 'Change already applied (idempotency)',
      };
    }

    const plan = this.compileMaterializationPlan(change);
    if (plan.status !== 'VALID') {
      await this.writeReceipt(change.change_request_id, 'BLOCKED', change.project_id, { plan });
      if (plan.status === 'BLOCKED_SOURCE_DIVERGENCE') {
        await this.markChangeStatus(change.change_request_id, 'BLOCKED_SOURCE_DIVERGENCE');
      }
      return {
        ok: false,
        dryRun: this.isDryRunMode,
        plan,
        filesChanged: [],
        componentsChanged: [],
        routesChanged: [],
        error: plan.blockReason,
      };
    }

    const commitBefore = this.getCurrentCommit(this.repoRoot, PROJECT_SOURCE_ROOTS[change.project_id]) ?? undefined;
    await this.writeReceipt(change.change_request_id, 'APPLYING', change.project_id, { plan });

    const applyResult = applyPlanToSource(plan, { repoRoot: this.repoRoot, dryRun: this.isDryRunMode });
    if (!applyResult.ok) {
      await this.writeReceipt(change.change_request_id, 'FAILED', change.project_id, { error: applyResult.error, plan });
      await this.markChangeStatus(change.change_request_id, 'FAILED');
      return applyResult;
    }

    if (this.isDryRunMode) {
      await this.writeReceipt(change.change_request_id, 'VALIDATED', change.project_id, { plan, dryRun: true });
      return applyResult;
    }

    const validation = await this.runValidation(change.project_id);
    applyResult.testsPassed = validation.testsPassed;
    applyResult.buildPassed = validation.buildPassed;

    if (!validation.ok) {
      await this.writeReceipt(change.change_request_id, 'FAILED', change.project_id, validation);
      await this.markChangeStatus(change.change_request_id, 'FAILED');
      return { ...applyResult, ok: false, error: validation.error };
    }

    const commitAfter = this.getCurrentCommit(this.repoRoot, PROJECT_SOURCE_ROOTS[change.project_id]) ?? undefined;
    applyResult.commitBefore = commitBefore;
    applyResult.commitAfter = commitAfter;

    await this.writeReceipt(change.change_request_id, 'APPLIED', change.project_id, applyResult, commitBefore, commitAfter);
    if (validation.testsPassed) await this.writeReceipt(change.change_request_id, 'TESTS_PASSED', change.project_id, {});
    if (validation.buildPassed) await this.writeReceipt(change.change_request_id, 'BUILD_PASSED', change.project_id, {});

    await this.supabase.from('site00_design_change_applications').insert({
      change_request_id: change.change_request_id,
      project_id: change.project_id,
      applied_commit: commitAfter,
    });

    await this.markChangeStatus(change.change_request_id, 'APPLIED', commitAfter);
    return applyResult;
  }

  async runValidation(projectId: Site00ProjectKey): Promise<{
    ok: boolean;
    testsPassed: boolean;
    buildPassed: boolean;
    error?: string;
  }> {
    if (this.skipTests && this.skipBuild) return { ok: true, testsPassed: true, buildPassed: true };

    let testsPassed = this.skipTests;
    let buildPassed = this.skipBuild;

    if (!this.skipTests) {
      for (const cmd of PROJECT_TEST_COMMANDS[projectId]) {
        const r = await this.execCommand!(cmd, this.repoRoot);
        if (r.code !== 0) {
          return { ok: false, testsPassed: false, buildPassed: false, error: `Tests failed: ${cmd}` };
        }
      }
      testsPassed = true;
    }

    if (!this.skipBuild) {
      for (const cmd of PROJECT_BUILD_COMMANDS[projectId]) {
        const r = await this.execCommand!(cmd, this.repoRoot);
        if (r.code !== 0) {
          return { ok: false, testsPassed, buildPassed: false, error: `Build failed: ${cmd}` };
        }
      }
      buildPassed = true;
    }

    return { ok: true, testsPassed, buildPassed };
  }

  async writeReceipt(
    changeRequestId: string,
    event: Site00ReceiptEvent,
    projectId?: Site00ProjectKey | string,
    payload: Record<string, unknown> = {},
    sourceCommitBefore?: string,
    sourceCommitAfter?: string,
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('site00_change_receipts')
      .insert({
        change_request_id: changeRequestId,
        event,
        status: event,
        project_id: projectId ?? null,
        payload,
        source_commit_before: sourceCommitBefore ?? null,
        source_commit_after: sourceCommitAfter ?? null,
      })
      .select('id')
      .single();
    if (error) return null;
    return (data as { id: string }).id;
  }

  async markChangeStatus(changeRequestId: string, status: string, appliedCommit?: string): Promise<void> {
    const row: Record<string, unknown> = {
      fsbw_status: status,
      updated_at: new Date().toISOString(),
    };
    if (status === 'APPLIED' || status === 'MERGED') {
      row.status = status;
      if (appliedCommit) {
        row.fsbw_applied_commit = appliedCommit;
        row.fsbw_applied_at = new Date().toISOString();
      }
    } else if (status.startsWith('BLOCKED') || status === 'FAILED') {
      row.fsbw_status = status;
    }

    await this.supabase.from('site00_design_change_requests').update(row).eq('change_request_id', changeRequestId);
  }

  async getSite00RuntimeBindings(
    projectId: Site00ProjectKey,
    route?: string,
    pageKey?: string,
  ) {
    return resolveRuntimeBindings(
      projectId,
      async () => {
        let q = this.supabase
          .from('site00_runtime_bindings')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true);
        if (route) q = q.eq('route', route);
        if (pageKey) q = q.eq('page_key', pageKey);
        const { data, error } = await q;
        if (error) throw new Error(error.message);
        return (data as Site00RuntimeBindingRow[]) ?? [];
      },
      { route, pageKey, allowStaleCache: true },
    );
  }

  async processChange(changeId: string, dryRun = false): Promise<MaterializationApplyResult | Site00SourceMaterializationPlan> {
    const change = await this.getChangeById(changeId);
    if (!change) throw new Error(`Change not found: ${changeId}`);
    if (dryRun || this.isDryRunMode) return this.runDryRun(change);
    return this.applyMaterializationPlan(change);
  }

  previewChange(change: Site00DesignChangeRequest): Site00SourceMaterializationPlan {
    return this.compileMaterializationPlan(change);
  }
}

export async function getSite00RuntimeBindings(
  projectId: Site00ProjectKey,
  route?: string,
  pageKey?: string,
  supabase?: Site00BridgeSupabase,
) {
  const bridge = new Site00DesignBridge({
    repoRoot: process.cwd(),
    supabase: supabase ?? (getSupabaseAdmin() as unknown as Site00BridgeSupabase),
  });
  return bridge.getSite00RuntimeBindings(projectId, route, pageKey);
}
