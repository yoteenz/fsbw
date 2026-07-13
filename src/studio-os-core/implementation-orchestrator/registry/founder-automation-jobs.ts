import type { StudioOsJob } from '../schemas/os-job';
import { OS_SCHEDULER_VERSION } from '../schemas/os-job';
import { priorityToScore } from '../scheduler/priority-engine';

function automationJob(
  partial: Pick<StudioOsJob, 'jobId' | 'title' | 'description' | 'priority' | 'originDepartment'> & {
    jobType: string;
    schedule?: string;
    resourceUsd?: number;
    status?: StudioOsJob['status'];
  }
): StudioOsJob {
  const now = new Date().toISOString();
  const budget = partial.resourceUsd ?? 3;
  return {
    jobVersion: OS_SCHEDULER_VERSION,
    jobId: partial.jobId,
    jobType: partial.jobType,
    jobClass: 'automation',
    title: partial.title,
    description: `${partial.description}${partial.schedule ? ` · Schedule: ${partial.schedule}` : ''}`,
    priority: partial.priority,
    priorityScore: priorityToScore(partial.priority),
    owner: 'founder-automation',
    originDepartment: partial.originDepartment,
    status: partial.status ?? 'READY',
    dependencies: [],
    blockedBy: [],
    resourceEstimate: {
      gpuUnits: 0,
      cpuUnits: 1,
      apiCostUsd: budget * 0.3,
      storageMb: 64,
      expectedTokens: 1500,
      expectedRenders: 0,
      expectedRetries: 0,
      queueDepthImpact: 0.5,
      budgetImpactUsd: budget,
    },
    estimatedCost: `$${budget}`,
    estimatedDuration: '30-60m',
    assignedWorkers: [],
    approvalRequirements: [
      { type: 'founder', required: false, satisfied: true, label: 'Founder approval' },
      { type: 'budget', required: false, satisfied: true, label: 'Budget approval' },
    ],
    retryPolicy: { maxRetries: 2, backoffMs: 30000, escalationAfterRetries: 1, currentRetry: 0 },
    auditHistory: [{ event: 'created', at: now, reason: 'founder-automation-seed' }],
    createdDate: now,
    updatedDate: now,
  };
}

/** Founder-facing automations as scheduler jobs — backups, optimization, royalties, analytics. */
export const FOUNDER_AUTOMATION_JOBS: StudioOsJob[] = [
  automationJob({
    jobId: 'auto-nightly-backup',
    title: 'Nightly Studio World Backup',
    description: 'Automated backup of Studio World state, registries, and queue snapshots.',
    priority: 'BACKGROUND',
    originDepartment: 'command-center',
    jobType: 'nightly-backup',
    schedule: '0 2 * * *',
    resourceUsd: 2,
  }),
  automationJob({
    jobId: 'auto-asset-optimization',
    title: 'Asset Optimization Sweep',
    description: 'Compress and optimize hero object assets across departments.',
    priority: 'LOW',
    originDepartment: 'creative-director-studio',
    jobType: 'asset-optimization',
    schedule: '0 4 * * 0',
    resourceUsd: 8,
  }),
  automationJob({
    jobId: 'auto-royalty-summary',
    title: 'Royalty Distribution Summary',
    description: 'Compile weekly royalty distribution report for marketplace creators.',
    priority: 'NORMAL',
    originDepartment: 'marketplace',
    jobType: 'royalty-distribution',
    schedule: '0 9 * * 1',
    resourceUsd: 5,
    status: 'BACKLOG',
  }),
  automationJob({
    jobId: 'auto-marketplace-analytics',
    title: 'Marketplace Analytics Report',
    description: 'Scheduled marketplace performance and conversion analytics.',
    priority: 'LOW',
    originDepartment: 'marketplace',
    jobType: 'marketplace-analytics',
    schedule: '0 8 * * *',
    resourceUsd: 4,
  }),
  automationJob({
    jobId: 'auto-scheduled-diagnostics',
    title: 'Studio World Diagnostics Sweep',
    description: 'Automated diagnostics across implementation queue, renders, and immune system.',
    priority: 'NORMAL',
    originDepartment: 'immune-system',
    jobType: 'diagnostics',
    schedule: '0 */6 * * *',
    resourceUsd: 6,
  }),
  automationJob({
    jobId: 'auto-lighting-bake',
    title: 'Lighting Bake Pipeline',
    description: 'Background lighting bake for approved department scenes.',
    priority: 'LOW',
    originDepartment: 'experience-lab',
    jobType: 'lighting-bake',
    schedule: '0 3 * * *',
    resourceUsd: 18,
    status: 'BACKLOG',
  }),
  automationJob({
    jobId: 'auto-animation-render',
    title: 'Animation Render Queue',
    description: 'Batch animation renders for Creative Director Studio outputs.',
    priority: 'LOW',
    originDepartment: 'creative-director-studio',
    jobType: 'animation-render',
    schedule: '0 1 * * *',
    resourceUsd: 22,
    status: 'BACKLOG',
  }),
  automationJob({
    jobId: 'auto-notification-digest',
    title: 'Founder Notification Digest',
    description: 'Daily digest of scheduler alerts, blocked jobs, and budget consumption.',
    priority: 'BACKGROUND',
    originDepartment: 'command-center',
    jobType: 'notification',
    schedule: '0 7 * * *',
    resourceUsd: 1,
  }),
];

export const FOUNDER_AUTOMATION_JOB_IDS = FOUNDER_AUTOMATION_JOBS.map((j) => j.jobId);
