import { createHash, randomUUID } from 'crypto';
import { getSupabaseAdminServiceRole } from '../supabase.js';
import { isMissingTableError } from '../../../src/studio-os-core/immune-system/drift-detector.js';

export const PACKAGE_TABLE = 'studio_environment_asset_packages';
export const OUTPUT_TABLE = 'studio_environment_package_outputs';
export const READINESS_TABLE = 'studio_environment_package_readiness';
export const JOB_TABLE = 'studio_environment_package_generation_jobs';
export const APPROVAL_TABLE = 'studio_environment_package_approvals';
export const AUDIT_TABLE = 'studio_environment_package_audit_events';
export const HANDOFF_TABLE = 'studio_environment_package_cds_handoffs';
export const CACHE_TABLE = 'studio_environment_package_cache_entries';

export type DurablePackageRow = Record<string, unknown>;

export async function probeEnvironmentPackageTables(): Promise<boolean> {
  const admin = getSupabaseAdminServiceRole();
  const { error } = await admin.from(PACKAGE_TABLE).select('package_id').limit(1);
  if (error && isMissingTableError(error)) return false;
  return !error;
}

export async function getPackageById(packageId: string): Promise<DurablePackageRow | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from(PACKAGE_TABLE).select('*').eq('package_id', packageId).maybeSingle();
  if (error || !data) return null;
  return data as DurablePackageRow;
}

export async function getPackageForVariant(
  departmentId: string,
  environmentId: string,
  variantId: string,
  revision = 1
): Promise<DurablePackageRow | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin
    .from(PACKAGE_TABLE)
    .select('*')
    .eq('department_id', departmentId)
    .eq('environment_id', environmentId)
    .eq('variant_id', variantId)
    .eq('revision', revision)
    .maybeSingle();
  if (error || !data) return null;
  return data as DurablePackageRow;
}

export async function upsertPackage(row: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const { error } = await admin.from(PACKAGE_TABLE).upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'package_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertOutput(row: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const { error } = await admin.from(OUTPUT_TABLE).upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'package_id,output_type' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listOutputs(packageId: string): Promise<DurablePackageRow[]> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from(OUTPUT_TABLE).select('*').eq('package_id', packageId);
  if (error || !data) return [];
  return data as DurablePackageRow[];
}

export async function upsertReadiness(row: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const { error } = await admin.from(READINESS_TABLE).upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'package_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getReadiness(packageId: string): Promise<DurablePackageRow | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from(READINESS_TABLE).select('*').eq('package_id', packageId).maybeSingle();
  if (error || !data) return null;
  return data as DurablePackageRow;
}

export async function insertApproval(row: Record<string, unknown>): Promise<{ ok: true; approvalId: string } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const approvalId = `appr-${randomUUID()}`;
  const { error } = await admin.from(APPROVAL_TABLE).insert({ ...row, approval_id: approvalId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, approvalId };
}

export async function appendAuditEvent(input: {
  packageId: string;
  eventType: string;
  actor: string | null;
  detail: string;
  revision: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  await admin.from(AUDIT_TABLE).insert({
    event_id: `audit-${randomUUID()}`,
    package_id: input.packageId,
    event_type: input.eventType,
    actor: input.actor,
    detail: input.detail,
    revision: input.revision,
    payload: input.payload ?? {},
    occurred_at: new Date().toISOString(),
  });
}

export async function insertGenerationJob(row: Record<string, unknown>): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const jobId = (row.job_id as string) ?? `envpkg-job-${randomUUID()}`;
  const { error } = await admin.from(JOB_TABLE).insert({ ...row, job_id: jobId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, jobId };
}

export async function updateGenerationJob(
  jobId: string,
  patch: Record<string, unknown>
): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  await admin.from(JOB_TABLE).update({ ...patch, updated_at: new Date().toISOString() }).eq('job_id', jobId);
}

export async function listGenerationJobs(packageId: string): Promise<DurablePackageRow[]> {
  const admin = getSupabaseAdminServiceRole();
  const { data } = await admin.from(JOB_TABLE).select('*').eq('package_id', packageId).order('created_at', { ascending: true });
  return (data ?? []) as DurablePackageRow[];
}

export async function upsertCdsHandoff(row: Record<string, unknown>): Promise<{ ok: true; handoffId: string } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const handoffId = (row.handoff_id as string) ?? `cds-handoff-${randomUUID()}`;
  const { error } = await admin.from(HANDOFF_TABLE).upsert({ ...row, handoff_id: handoffId, updated_at: new Date().toISOString() }, { onConflict: 'handoff_id' });
  if (error) return { ok: false, error: error.message };
  return { ok: true, handoffId };
}

export async function getCdsHandoff(packageId: string): Promise<DurablePackageRow | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data } = await admin.from(HANDOFF_TABLE).select('*').eq('package_id', packageId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return (data as DurablePackageRow) ?? null;
}

export function immutableApprovalHash(payload: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function setCanonicalPackage(
  packageId: string,
  promotedBy: string,
  departmentId: string,
  environmentId: string,
  theme: string
): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  const now = new Date().toISOString();
  const { data: prior } = await admin
    .from(PACKAGE_TABLE)
    .select('package_id')
    .eq('department_id', departmentId)
    .eq('environment_id', environmentId)
    .eq('theme', theme)
    .eq('canonical', true)
    .neq('package_id', packageId);

  for (const row of prior ?? []) {
    await admin
      .from(PACKAGE_TABLE)
      .update({ canonical: false, status: 'superseded', lifecycle_state: 'superseded', superseded_by: packageId, updated_at: now })
      .eq('package_id', row.package_id as string);
  }

  await admin
    .from(PACKAGE_TABLE)
    .update({
      canonical: true,
      status: 'canonical',
      lifecycle_state: 'canonical',
      promoted_by: promotedBy,
      promoted_at: now,
      updated_at: now,
    })
    .eq('package_id', packageId);
}
