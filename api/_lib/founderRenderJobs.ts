import { randomUUID } from 'crypto';
import type { ConstructionPlan } from '../../src/studio-os-core/blueprint-author/construction-plan-schema.js';
import {
  FOUNDER_RENDER_ARTIFACT_INTENT,
  FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
} from './creativeProduction/studio-os-server.bundle.js';
import { getSupabaseAdminServiceRole } from './supabase.js';

const TABLE = 'studio_founder_render_jobs';

export type FounderRenderJobRow = {
  job_id: string;
  organization_id: string;
  project_id: string;
  room_id: string;
  blueprint_id: string;
  blueprint_revision: number;
  construction_plan_id: string;
  room_purpose: string | null;
  artifact_intent: string;
  status: string;
  model_route: string | null;
  provider_model: string | null;
  provider_request_id: string | null;
  prompt_version: string;
  prompt_hash: string | null;
  effective_prompt: string | null;
  preview_artifact_url: string | null;
  storage_path: string | null;
  failure_reason: string | null;
  approval_status: string;
  reference_count: number;
  brand_material_refs: unknown;
  diagnostics: Record<string, unknown>;
  revision_note: string | null;
  governance_context?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  started_at?: string | null;
};

export async function insertFounderRenderJob(input: {
  plan: ConstructionPlan;
  modelRoute: string;
  providerModel: string;
  promptHash: string;
  effectivePrompt: string;
  referenceCount: number;
  brandMaterialRefs: string[];
  providerRequestId: string;
  revisionNote?: string | null;
  promptVersion?: string;
  departmentId?: string;
  departmentClass?: string;
  cacheKey?: string;
  architecturalFingerprint?: string[];
  referencePackageVersion?: string;
}): Promise<{ ok: true; jobId: string } | { ok: false; error: string }> {
  const admin = getSupabaseAdminServiceRole();
  const jobId = `frj-${randomUUID()}`;
  const promptVersion = input.promptVersion ?? FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION;
  const { error } = await admin.from(TABLE).insert({
    job_id: jobId,
    organization_id: input.plan.metadata.organizationId,
    project_id: input.plan.planId,
    room_id: input.plan.room.roomId,
    blueprint_id: input.plan.planId,
    blueprint_revision: input.plan.metadata.revision,
    construction_plan_id: input.plan.planId,
    room_purpose: input.plan.room.purpose,
    artifact_intent: FOUNDER_RENDER_ARTIFACT_INTENT,
    status: 'generating',
    model_route: input.modelRoute,
    provider_model: input.providerModel,
    provider_request_id: input.providerRequestId,
    prompt_version: promptVersion,
    prompt_hash: input.promptHash,
    effective_prompt: input.effectivePrompt,
    reference_count: input.referenceCount,
    brand_material_refs: input.brandMaterialRefs,
    revision_note: input.revisionNote ?? null,
    started_at: new Date().toISOString(),
    diagnostics: {
      dispatchTimestamp: new Date().toISOString(),
      providerJobId: input.providerRequestId,
      departmentId: input.departmentId ?? input.plan.room.roomId,
      departmentClass: input.departmentClass ?? null,
      blueprintId: input.plan.architecture.architectureId,
      shellSpecId: input.plan.architecture.shellSpecId,
      promptVersion,
      cacheKey: input.cacheKey ?? null,
      architecturalFingerprint: input.architecturalFingerprint ?? [],
      referencePackageVersion: input.referencePackageVersion ?? null,
      artifactIntent: FOUNDER_RENDER_ARTIFACT_INTENT,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, jobId };
}

export async function getFounderRenderJob(jobId: string): Promise<FounderRenderJobRow | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from(TABLE).select('*').eq('job_id', jobId).maybeSingle();
  if (error || !data) return null;
  return data as FounderRenderJobRow;
}

export async function updateFounderRenderJobReady(
  jobId: string,
  input: { previewArtifactUrl: string; storagePath: string; generationDurationMs: number }
): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  const existing = await getFounderRenderJob(jobId);
  const diagnostics = { ...(existing?.diagnostics ?? {}), generationDurationMs: input.generationDurationMs, outputUrl: input.previewArtifactUrl };
  await admin
    .from(TABLE)
    .update({
      status: 'ready',
      preview_artifact_url: input.previewArtifactUrl,
      storage_path: input.storagePath,
      completed_at: new Date().toISOString(),
      diagnostics,
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', jobId);
}

export async function updateFounderRenderJobFailed(jobId: string, failureReason: string): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  await admin
    .from(TABLE)
    .update({
      status: 'failed',
      failure_reason: failureReason,
      failed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', jobId);
}

export async function approveFounderRenderJob(input: {
  jobId: string;
  approvedBy: string;
  approvalRecord: Record<string, unknown>;
}): Promise<void> {
  const admin = getSupabaseAdminServiceRole();
  await admin
    .from(TABLE)
    .update({
      status: 'approved',
      approval_status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: input.approvedBy,
      approval_record: input.approvalRecord,
      updated_at: new Date().toISOString(),
    })
    .eq('job_id', input.jobId);
}
