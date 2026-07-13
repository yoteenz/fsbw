import type { ConstructionPlan } from './construction-plan-schema';
import type { StudioWorldMaterialId } from '../studio-world-architecture-v2/material-library';

export const JOB_QUEUE_VERSION = 'job-queue.v1';

export type ConstructionJobType =
  | 'architecture'
  | 'hero-asset'
  | 'furniture'
  | 'decor'
  | 'lighting'
  | 'particles'
  | 'interaction'
  | 'material-application';

export type ConstructionJob = {
  jobId: string;
  jobType: ConstructionJobType;
  planId: string;
  assetId: string | null;
  socketId: string | null;
  materialSetId: string | null;
  materialIds: StudioWorldMaterialId[];
  cameraAnchorId: string | null;
  validationProfileId: string;
  styleId: string;
  lightingProfileId: string | null;
  negativeRules: string[];
  organizationRules: string[];
  outputRequirements: string[];
  /** Workers receive only their task — no whole-room context */
  boundedScope: true;
  dependencies: string[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'requeued';
};

export type JobQueue = {
  queueId: string;
  planId: string;
  version: typeof JOB_QUEUE_VERSION;
  jobs: ConstructionJob[];
  createdAt: string;
};

const JOB_TYPE_ORDER: ConstructionJobType[] = [
  'architecture',
  'hero-asset',
  'furniture',
  'decor',
  'lighting',
  'particles',
  'interaction',
  'material-application',
];

export function decomposePlanToJobQueue(plan: ConstructionPlan): JobQueue {
  const jobs: ConstructionJob[] = [];
  const now = new Date().toISOString();
  let jobIndex = 1;

  jobs.push({
    jobId: `job-${jobIndex++}`,
    jobType: 'architecture',
    planId: plan.planId,
    assetId: plan.architecture.architectureId,
    socketId: null,
    materialSetId: plan.materialSet.materialSetId,
    materialIds: plan.materialSet.materialIds,
    cameraAnchorId: plan.cameraAnchors.find((a) => a.purpose === 'overview')?.anchorId ?? null,
    validationProfileId: plan.validationProfile.profileId,
    styleId: plan.styleProfile.styleId,
    lightingProfileId: plan.lightingProfile.profileId,
    negativeRules: plan.negativeRules,
    organizationRules: plan.organizationRules,
    outputRequirements: ['immutable-shell', 'no-furniture-embedded'],
    boundedScope: true,
    dependencies: [],
    status: 'queued',
  });

  for (const asset of plan.heroAssets) {
    jobs.push({
      jobId: `job-${jobIndex++}`,
      jobType: 'hero-asset',
      planId: plan.planId,
      assetId: asset.assetId,
      socketId: asset.socketId,
      materialSetId: plan.materialSet.materialSetId,
      materialIds: plan.materialSet.materialIds,
      cameraAnchorId: plan.cameraAnchors.find((a) => a.purpose === 'hero' || a.purpose === 'inspection')?.anchorId ?? null,
      validationProfileId: plan.validationProfile.profileId,
      styleId: plan.styleProfile.styleId,
      lightingProfileId: plan.lightingProfile.profileId,
      negativeRules: plan.negativeRules,
      organizationRules: plan.organizationRules,
      outputRequirements: ['isolated-asset', 'alpha-transparency', 'socket-bound'],
      boundedScope: true,
      dependencies: [`job-1`],
      status: 'queued',
    });
  }

  for (const asset of plan.furnitureSet.assets) {
    jobs.push({
      jobId: `job-${jobIndex++}`,
      jobType: 'furniture',
      planId: plan.planId,
      assetId: asset.assetId,
      socketId: asset.socketId,
      materialSetId: plan.materialSet.materialSetId,
      materialIds: plan.materialSet.materialIds,
      cameraAnchorId: null,
      validationProfileId: plan.validationProfile.profileId,
      styleId: plan.styleProfile.styleId,
      lightingProfileId: null,
      negativeRules: plan.negativeRules,
      organizationRules: plan.organizationRules,
      outputRequirements: ['isolated-asset', 'furniture-tier'],
      boundedScope: true,
      dependencies: [`job-1`],
      status: 'queued',
    });
  }

  for (const asset of plan.decorSet.assets) {
    jobs.push({
      jobId: `job-${jobIndex++}`,
      jobType: 'decor',
      planId: plan.planId,
      assetId: asset.assetId,
      socketId: asset.socketId,
      materialSetId: plan.materialSet.materialSetId,
      materialIds: plan.materialSet.materialIds,
      cameraAnchorId: null,
      validationProfileId: plan.validationProfile.profileId,
      styleId: plan.styleProfile.styleId,
      lightingProfileId: null,
      negativeRules: plan.negativeRules,
      organizationRules: plan.organizationRules,
      outputRequirements: ['disposable-decor', 'isolated-asset'],
      boundedScope: true,
      dependencies: [`job-1`],
      status: 'queued',
    });
  }

  jobs.push({
    jobId: `job-${jobIndex++}`,
    jobType: 'lighting',
    planId: plan.planId,
    assetId: null,
    socketId: null,
    materialSetId: null,
    materialIds: [],
    cameraAnchorId: plan.cameraAnchors.find((a) => a.purpose === 'overview')?.anchorId ?? null,
    validationProfileId: plan.validationProfile.profileId,
    styleId: plan.styleProfile.styleId,
    lightingProfileId: plan.lightingProfile.profileId,
    negativeRules: plan.negativeRules,
    organizationRules: plan.organizationRules,
    outputRequirements: ['lighting-pass-only', 'no-asset-regeneration'],
    boundedScope: true,
    dependencies: jobs.filter((j) => j.jobType === 'hero-asset').map((j) => j.jobId),
    status: 'queued',
  });

  jobs.push({
    jobId: `job-${jobIndex++}`,
    jobType: 'particles',
    planId: plan.planId,
    assetId: null,
    socketId: null,
    materialSetId: null,
    materialIds: [],
    cameraAnchorId: null,
    validationProfileId: plan.validationProfile.profileId,
    styleId: plan.styleProfile.styleId,
    lightingProfileId: plan.lightingProfile.profileId,
    negativeRules: plan.negativeRules,
    organizationRules: plan.organizationRules,
    outputRequirements: ['atmosphere-only'],
    boundedScope: true,
    dependencies: [jobs.find((j) => j.jobType === 'lighting')?.jobId ?? 'job-1'],
    status: 'queued',
  });

  jobs.push({
    jobId: `job-${jobIndex++}`,
    jobType: 'interaction',
    planId: plan.planId,
    assetId: null,
    socketId: null,
    materialSetId: null,
    materialIds: [],
    cameraAnchorId: null,
    validationProfileId: plan.validationProfile.profileId,
    styleId: plan.styleProfile.styleId,
    lightingProfileId: null,
    negativeRules: plan.negativeRules,
    organizationRules: plan.organizationRules,
    outputRequirements: plan.interactionProfile.zones.map((z) => `zone:${z}`),
    boundedScope: true,
    dependencies: [jobs.find((j) => j.jobType === 'lighting')?.jobId ?? 'job-1'],
    status: 'queued',
  });

  return {
    queueId: `queue-${plan.planId}`,
    planId: plan.planId,
    version: JOB_QUEUE_VERSION,
    jobs: jobs.sort((a, b) => JOB_TYPE_ORDER.indexOf(a.jobType) - JOB_TYPE_ORDER.indexOf(b.jobType)),
    createdAt: now,
  };
}

export function assertJobsIndependent(jobs: ConstructionJob[]): { ok: true } | { ok: false; violations: string[] } {
  const violations: string[] = [];
  for (const job of jobs) {
    if (!job.boundedScope) violations.push(`${job.jobId}:missing-bounded-scope`);
    if (job.jobType !== 'architecture' && job.dependencies.length === 0) {
      violations.push(`${job.jobId}:missing-architecture-dependency`);
    }
  }
  if (violations.length > 0) return { ok: false, violations };
  return { ok: true };
}

export function getJobById(queue: JobQueue, jobId: string): ConstructionJob | null {
  return queue.jobs.find((j) => j.jobId === jobId) ?? null;
}
