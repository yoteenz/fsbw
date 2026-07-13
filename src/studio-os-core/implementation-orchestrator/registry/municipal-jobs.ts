import type { StudioOsJob } from '../schemas/os-job';
import { OS_SCHEDULER_VERSION } from '../schemas/os-job';
import { priorityToScore } from '../scheduler/priority-engine';

function municipalJob(
  partial: Pick<StudioOsJob, 'jobId' | 'title' | 'description' | 'priority' | 'originDepartment' | 'blockedBy' | 'dependencies'> & {
    jobClass?: StudioOsJob['jobClass'];
    jobType?: string;
    status?: StudioOsJob['status'];
    resourceUsd?: number;
    gpu?: number;
    permitRequired?: boolean;
  }
): StudioOsJob {
  const now = new Date().toISOString();
  const budget = partial.resourceUsd ?? 8;
  return {
    jobVersion: OS_SCHEDULER_VERSION,
    jobId: partial.jobId,
    jobType: partial.jobType ?? 'municipal-review',
    jobClass: partial.jobClass ?? 'governance',
    title: partial.title,
    description: partial.description,
    priority: partial.priority,
    priorityScore: priorityToScore(partial.priority),
    owner: 'city-council',
    originDepartment: partial.originDepartment,
    status: partial.status ?? 'BLOCKED',
    dependencies: partial.dependencies,
    blockedBy: partial.blockedBy,
    resourceEstimate: {
      gpuUnits: partial.gpu ?? 0.5,
      cpuUnits: 1,
      apiCostUsd: budget * 0.4,
      storageMb: 16,
      expectedTokens: 3000,
      expectedRenders: 0,
      expectedRetries: 0,
      queueDepthImpact: 1,
      budgetImpactUsd: budget,
    },
    estimatedCost: `$${budget}`,
    estimatedDuration: '2-4h',
    assignedWorkers: [],
    approvalRequirements: [
      { type: 'permit', required: !!partial.permitRequired, satisfied: false, label: 'Municipal permit' },
      { type: 'founder', required: false, satisfied: true, label: 'Founder approval' },
      { type: 'budget', required: budget >= 15, satisfied: false, label: 'Budget approval' },
    ],
    retryPolicy: { maxRetries: 2, backoffMs: 10000, escalationAfterRetries: 1, currentRetry: 0 },
    auditHistory: [{ event: 'created', at: now, reason: 'municipal-seed' }],
    createdDate: now,
    updatedDate: now,
  };
}

/** Municipal civic processes as scheduled workloads — City Council, permits, certification, inspection. */
export const MUNICIPAL_JOBS: StudioOsJob[] = [
  municipalJob({
    jobId: 'muni-city-council-session',
    title: 'City Council Governance Session',
    description: 'Scheduled civic review of Studio World policy changes and department charters.',
    priority: 'HIGH',
    originDepartment: 'city-council',
    dependencies: ['impl-studio-world-constitution'],
    blockedBy: ['impl-studio-world-constitution'],
    jobClass: 'governance',
    jobType: 'city-council',
  }),
  municipalJob({
    jobId: 'muni-permit-review',
    title: 'Construction Permit Review',
    description: 'Municipal permit review for Construction Mode pipeline activation.',
    priority: 'HIGH',
    originDepartment: 'city-council',
    dependencies: ['impl-cds-manufacturing'],
    blockedBy: ['impl-cds-manufacturing'],
    jobClass: 'certification',
    jobType: 'permit-review',
    permitRequired: true,
  }),
  municipalJob({
    jobId: 'muni-marketplace-certification',
    title: 'Marketplace Mod Certification',
    description: 'Quality Guard and Immune System certification for marketplace mods.',
    priority: 'NORMAL',
    originDepartment: 'marketplace',
    dependencies: ['impl-mod-marketplace-runtime'],
    blockedBy: ['impl-mod-marketplace-runtime'],
    jobClass: 'marketplace',
    jobType: 'marketplace-certification',
    resourceUsd: 12,
  }),
  municipalJob({
    jobId: 'muni-construction-inspection',
    title: 'Construction Inspection',
    description: 'Occupancy and safety inspection for Construction Mode assemblies.',
    priority: 'NORMAL',
    originDepartment: 'construction-mode',
    dependencies: ['impl-construction-mode-pipeline'],
    blockedBy: ['impl-construction-mode-pipeline'],
    jobClass: 'construction',
    jobType: 'construction-inspection',
    permitRequired: true,
  }),
  municipalJob({
    jobId: 'muni-occupancy-approval',
    title: 'Occupancy Approval',
    description: 'Final occupancy approval before Studio World publishing.',
    priority: 'HIGH',
    originDepartment: 'city-council',
    dependencies: ['muni-construction-inspection', 'impl-studio-world-publishing'],
    blockedBy: ['muni-construction-inspection'],
    jobClass: 'governance',
    jobType: 'occupancy-approval',
    permitRequired: true,
  }),
  municipalJob({
    jobId: 'muni-quality-guard-audit',
    title: 'Quality Guard Parity Audit',
    description: 'Scheduled Quality Guard inspection across department outputs.',
    priority: 'NORMAL',
    originDepartment: 'quality-guard',
    dependencies: [],
    blockedBy: [],
    jobClass: 'certification',
    jobType: 'quality-guard',
    status: 'READY',
    resourceUsd: 6,
  }),
  municipalJob({
    jobId: 'muni-immune-system-scan',
    title: 'Immune System Boundary Scan',
    description: 'Immune System drift detection and boundary enforcement sweep.',
    priority: 'NORMAL',
    originDepartment: 'immune-system',
    dependencies: [],
    blockedBy: [],
    jobClass: 'maintenance',
    jobType: 'immune-system',
    status: 'READY',
    resourceUsd: 4,
  }),
];

export const MUNICIPAL_JOB_IDS = MUNICIPAL_JOBS.map((j) => j.jobId);
