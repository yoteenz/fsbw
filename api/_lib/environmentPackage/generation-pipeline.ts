/**
 * Environment Package production generation pipeline — parent + child scheduler jobs.
 */

import { randomUUID } from 'crypto';
import {
  appendAuditEvent,
  getPackageById,
  insertGenerationJob,
  listGenerationJobs,
  listOutputs,
  updateGenerationJob,
  upsertOutput,
  upsertPackage,
} from './persistence.js';
import {
  buildEnvironmentPackageStoragePath,
  resolveEnvironmentPackageServerFlags,
} from './config.js';
import { validatePackageOutputConsistency } from './consistency-validator.js';

export const PARENT_JOB_TYPE = 'ENVIRONMENT_PACKAGE_PRODUCTION';

export const CHILD_JOB_SPECS: Array<{
  jobType: string;
  outputType: string;
  aspectRatio: string;
  dependsOn: string[];
  isRender: boolean;
}> = [
  { jobType: 'ENVIRONMENT_DESKTOP_RENDER', outputType: 'desktop', aspectRatio: '21:9', dependsOn: [], isRender: true },
  { jobType: 'ENVIRONMENT_MOBILE_RENDER', outputType: 'mobile', aspectRatio: '9:16', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
  { jobType: 'ENVIRONMENT_TABLET_RENDER', outputType: 'tablet', aspectRatio: '4:3', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
  { jobType: 'ENVIRONMENT_HERO_LANDSCAPE', outputType: 'hero_landscape', aspectRatio: '16:9', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
  { jobType: 'ENVIRONMENT_HERO_PORTRAIT', outputType: 'hero_portrait', aspectRatio: '3:4', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
  { jobType: 'ENVIRONMENT_SQUARE_THUMBNAIL', outputType: 'square_thumbnail', aspectRatio: '1:1', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: false },
  { jobType: 'ENVIRONMENT_WIDE_THUMBNAIL', outputType: 'wide_thumbnail', aspectRatio: '21:9', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: false },
  { jobType: 'ENVIRONMENT_BLUEPRINT', outputType: 'blueprint', aspectRatio: '4:3', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: false },
  { jobType: 'ENVIRONMENT_CONSTRUCTION_PLAN', outputType: 'construction_plan', aspectRatio: '4:3', dependsOn: ['ENVIRONMENT_BLUEPRINT'], isRender: false },
  { jobType: 'ENVIRONMENT_LIGHTING_PROFILE', outputType: 'lighting_profile', aspectRatio: '1:1', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: false },
  { jobType: 'ENVIRONMENT_MATERIALS_PROFILE', outputType: 'materials_profile', aspectRatio: '1:1', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: false },
  { jobType: 'ENVIRONMENT_ASSET_MANIFEST', outputType: 'asset_manifest', aspectRatio: '1:1', dependsOn: ['ENVIRONMENT_BLUEPRINT', 'ENVIRONMENT_CONSTRUCTION_PLAN'], isRender: false },
  { jobType: 'ENVIRONMENT_PACKAGE_VALIDATION', outputType: 'validation', aspectRatio: '1:1', dependsOn: ['ENVIRONMENT_MOBILE_RENDER', 'ENVIRONMENT_TABLET_RENDER'], isRender: false },
];

const REQUIRED_OUTPUT_TYPES = [
  'desktop', 'mobile', 'tablet', 'blueprint', 'construction_plan',
  'lighting_profile', 'materials_profile', 'asset_manifest',
];

export type CreateJobsResult =
  | { ok: true; parentJobId: string; childJobIds: string[] }
  | { ok: false; code: string; message: string };

export async function createEnvironmentPackageProductionJobs(packageId: string): Promise<CreateJobsResult> {
  const pkg = await getPackageById(packageId);
  if (!pkg) return { ok: false, code: 'PACKAGE_NOT_PERSISTED', message: 'Package not persisted.' };

  const existing = await listGenerationJobs(packageId);
  const activeParent = existing.find((j) => j.job_type === PARENT_JOB_TYPE && j.status !== 'failed' && j.status !== 'cancelled');
  if (activeParent) {
    const children = existing.filter((j) => j.parent_job_id === activeParent.job_id);
    return {
      ok: true,
      parentJobId: activeParent.job_id as string,
      childJobIds: children.map((c) => c.job_id as string),
    };
  }

  const parentJobId = `envpkg-parent-${randomUUID()}`;
  const parentInsert = await insertGenerationJob({
    job_id: parentJobId,
    package_id: packageId,
    variant_id: pkg.variant_id,
    job_type: PARENT_JOB_TYPE,
    status: 'pending',
    priority: 1,
    provider: 'fal',
    depends_on: [],
  });
  if (!parentInsert.ok) {
    return { ok: false, code: 'SCHEDULER_JOB_LOST', message: parentInsert.error };
  }

  const childJobIds: string[] = [];
  for (const spec of CHILD_JOB_SPECS) {
    const jobId = `envpkg-child-${randomUUID()}`;
    const inserted = await insertGenerationJob({
      job_id: jobId,
      parent_job_id: parentJobId,
      package_id: packageId,
      variant_id: pkg.variant_id,
      job_type: spec.jobType,
      output_type: spec.outputType,
      status: 'pending',
      priority: 2,
      provider: 'fal',
      provider_model: spec.isRender ? 'fal-ai/nano-banana-pro/edit' : 'derived',
      depends_on: spec.dependsOn,
    });
    if (inserted.ok) childJobIds.push(inserted.jobId);
  }

  await upsertPackage({
    package_id: packageId,
    status: 'generating',
    lifecycle_state: 'generating',
    updated_at: new Date().toISOString(),
  });

  await appendAuditEvent({
    packageId,
    eventType: 'generation-queued',
    actor: null,
    detail: `Parent job ${parentJobId} with ${childJobIds.length} child jobs`,
    revision: pkg.revision as number,
  });

  return { ok: true, parentJobId, childJobIds };
}

function jobDependenciesMet(job: Record<string, unknown>, jobsByType: Map<string, Record<string, unknown>>): boolean {
  const deps = (job.depends_on as string[]) ?? [];
  return deps.every((dep) => {
    const depJob = jobsByType.get(dep);
    return depJob && (depJob.status === 'completed' || depJob.status === 'cached');
  });
}

async function persistOutputFromSource(input: {
  packageId: string;
  outputType: string;
  aspectRatio: string;
  sourceUrl: string;
  departmentId: string;
  environmentId: string;
  variantId: string;
  revision: number;
  jobId: string;
  cached?: boolean;
  consistencyScore?: number;
}): Promise<{ ok: true; artifactUrl: string; storagePath: string } | { ok: false; code: string; message: string }> {
  const flags = resolveEnvironmentPackageServerFlags();
  const filename = `${input.outputType}.webp`;
  const storagePath = buildEnvironmentPackageStoragePath({
    departmentId: input.departmentId,
    environmentId: input.environmentId,
    variantId: input.variantId,
    revision: input.revision,
    outputType: input.outputType,
    filename,
  });

  let artifactUrl = input.sourceUrl;
  let finalStoragePath: string | null = null;

  if (flags.enablePackagePersistence) {
    try {
      const { uploadStudioBuilderAssetBytes } = await import('../studioBuilderGeneration.js');
      const res = await fetch(input.sourceUrl);
      if (!res.ok) {
        return { ok: false, code: 'PACKAGE_OUTPUT_STORAGE_FAILED', message: `Failed to download source: ${res.status}` };
      }
      const bytes = Buffer.from(await res.arrayBuffer());
      const upload = await uploadStudioBuilderAssetBytes(bytes, storagePath, 'image/webp');
      if (!upload.ok) {
        return { ok: false, code: 'PACKAGE_OUTPUT_STORAGE_FAILED', message: upload.error ?? 'Upload failed' };
      }
      artifactUrl = upload.publicUrl ?? artifactUrl;
      finalStoragePath = upload.storagePath ?? storagePath;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, code: 'PACKAGE_OUTPUT_STORAGE_FAILED', message: msg };
    }
  }

  await upsertOutput({
    package_id: input.packageId,
    output_type: input.outputType,
    aspect_ratio: input.aspectRatio,
    status: input.cached ? 'cached' : 'generated',
    artifact_url: artifactUrl,
    storage_path: finalStoragePath,
    generation_job_id: input.jobId,
    consistency_score: input.consistencyScore ?? null,
    cached: input.cached ?? false,
    generated_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
  });

  return { ok: true, artifactUrl, storagePath: finalStoragePath ?? storagePath };
}

function deriveManifestUrl(pkg: Record<string, unknown>): string {
  const snapshot = (pkg.outputs_snapshot as Record<string, unknown>) ?? {};
  const mobile = snapshot.mobile as string | undefined;
  return mobile ?? 'manifest://environment-package';
}

export async function processEnvironmentPackageJobs(packageId: string): Promise<{
  processed: number;
  packageStatus: string;
  lifecycleState: string;
}> {
  const pkg = await getPackageById(packageId);
  if (!pkg) return { processed: 0, packageStatus: 'unknown', lifecycleState: 'unknown' };

  const jobs = await listGenerationJobs(packageId);
  const jobsByType = new Map(jobs.map((j) => [j.job_type as string, j]));
  const outputs = await listOutputs(packageId);
  const outputsByType = Object.fromEntries(outputs.map((o) => [o.output_type as string, o]));

  const snapshot = (pkg.outputs_snapshot as Record<string, unknown>) ?? {};
  const previewMobile = (snapshot.mobile as string) ?? (outputsByType.mobile?.artifact_url as string) ?? null;
  const previewDesktop = (snapshot.desktop as string) ?? (outputsByType.desktop?.artifact_url as string) ?? previewMobile;

  const flags = resolveEnvironmentPackageServerFlags();
  let processed = 0;

  for (const spec of CHILD_JOB_SPECS) {
    const job = jobsByType.get(spec.jobType);
    if (!job || job.status === 'completed' || job.status === 'cached' || job.status === 'failed') continue;
    if (!jobDependenciesMet(job, jobsByType)) continue;

    const existingOutput = outputsByType[spec.outputType];
    if (existingOutput && (existingOutput.status === 'generated' || existingOutput.status === 'cached')) {
      await updateGenerationJob(job.job_id as string, { status: 'cached', completed_at: new Date().toISOString() });
      processed += 1;
      continue;
    }

    await updateGenerationJob(job.job_id as string, { status: 'running', started_at: new Date().toISOString() });

    let sourceUrl: string | null = null;
    let cached = false;

    if (spec.outputType === 'desktop') {
      sourceUrl = previewDesktop;
      cached = !flags.enablePackageProductionGeneration;
    } else if (spec.isRender) {
      const master = outputsByType.desktop?.artifact_url as string | undefined;
      sourceUrl = master ?? previewDesktop ?? previewMobile;
      cached = !flags.enablePackageProductionGeneration;

      if (master && spec.outputType !== 'desktop') {
        const consistency = validatePackageOutputConsistency({
          canonicalMasterUrl: master,
          companionUrl: sourceUrl,
          outputType: spec.outputType,
          promptHash: pkg.prompt_hash as string,
          seed: pkg.seed as string,
          theme: pkg.theme as string,
        });
        if (consistency.verdict === 'FAIL') {
          await updateGenerationJob(job.job_id as string, {
            status: 'failed',
            failed_at: new Date().toISOString(),
            failure_code: consistency.failureCode,
            failure_message: consistency.failureMessage,
          });
          await upsertOutput({
            package_id: packageId,
            output_type: spec.outputType,
            aspect_ratio: spec.aspectRatio,
            status: 'failed',
            failure_code: consistency.failureCode,
            failure_message: consistency.failureMessage,
          });
          processed += 1;
          continue;
        }
      }
    } else if (spec.outputType === 'asset_manifest') {
      sourceUrl = deriveManifestUrl(pkg);
      cached = true;
    } else {
      const master = (outputsByType.desktop?.artifact_url as string) ?? previewDesktop;
      sourceUrl = master;
      cached = true;
    }

    if (!sourceUrl) {
      await updateGenerationJob(job.job_id as string, {
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_code: 'PACKAGE_OUTPUT_GENERATION_FAILED',
        failure_message: `No source for ${spec.outputType}`,
      });
      processed += 1;
      continue;
    }

    const persisted = await persistOutputFromSource({
      packageId,
      outputType: spec.outputType,
      aspectRatio: spec.aspectRatio,
      sourceUrl,
      departmentId: pkg.department_id as string,
      environmentId: pkg.environment_id as string,
      variantId: pkg.variant_id as string,
      revision: pkg.revision as number,
      jobId: job.job_id as string,
      cached,
    });

    if (!persisted.ok) {
      await updateGenerationJob(job.job_id as string, {
        status: 'failed',
        failed_at: new Date().toISOString(),
        failure_code: persisted.code,
        failure_message: persisted.message,
      });
      processed += 1;
      continue;
    }

    await updateGenerationJob(job.job_id as string, {
      status: cached ? 'cached' : 'completed',
      completed_at: new Date().toISOString(),
      artifact_url: persisted.artifactUrl,
      storage_path: persisted.storagePath,
    });
    processed += 1;
  }

  const refreshedOutputs = await listOutputs(packageId);
  const completedRequired = REQUIRED_OUTPUT_TYPES.filter((t) => {
    const o = refreshedOutputs.find((r) => r.output_type === t);
    return o && (o.status === 'generated' || o.status === 'cached');
  });
  const failedOutputs = refreshedOutputs.filter((o) => o.status === 'failed');
  const pendingOutputs = REQUIRED_OUTPUT_TYPES.length - completedRequired.length - failedOutputs.length;

  let lifecycleState = 'generating';
  let status = 'generating';

  if (completedRequired.length === REQUIRED_OUTPUT_TYPES.length) {
    lifecycleState = 'awaiting-founder-approval';
    status = 'awaiting-founder-approval';
  } else if (failedOutputs.length > 0 && completedRequired.length > 0) {
    lifecycleState = 'partially-complete';
    status = 'partially-complete';
  } else if (failedOutputs.length > 0) {
    lifecycleState = 'failed';
    status = 'failed';
  }

  const parent = jobs.find((j) => j.job_type === PARENT_JOB_TYPE);
  if (parent && (status === 'awaiting-founder-approval' || status === 'failed' || status === 'partially-complete')) {
    await updateGenerationJob(parent.job_id as string, {
      status: status === 'failed' ? 'failed' : 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  await upsertPackage({
    package_id: packageId,
    status,
    lifecycle_state: lifecycleState,
    package_health: {
      outputsCompleted: completedRequired.length,
      outputsRequired: REQUIRED_OUTPUT_TYPES.length,
      outputsFailed: failedOutputs.length,
      outputsPending: Math.max(0, pendingOutputs),
      generationProgress: Math.round((completedRequired.length / REQUIRED_OUTPUT_TYPES.length) * 100),
    },
    updated_at: new Date().toISOString(),
  });

  if (lifecycleState === 'awaiting-founder-approval') {
    await appendAuditEvent({
      packageId,
      eventType: 'production-complete',
      actor: null,
      detail: 'All required outputs generated — awaiting founder review',
      revision: pkg.revision as number,
    });
  }

  return { processed, packageStatus: status, lifecycleState };
}
