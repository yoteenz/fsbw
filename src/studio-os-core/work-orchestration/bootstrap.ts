import { bootstrapWorkOrchestrationStore } from './store';
import type { WorkActivity, WorkOrchestrationStore } from './types';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function act(partial: WorkActivity): WorkActivity {
  return partial;
}

export function buildWorkOrchestrationSeed(): Partial<WorkOrchestrationStore> {
  const workPackages = [
    {
      id: 'wp-money-monday-mar',
      workspaceId: 'ndxbook' as const,
      name: 'MONEY MONDAY · MARCH CYCLE',
      campaignId: 'camp-money-monday-mar',
      campaignLabel: 'MONEY MONDAY · MARCH CYCLE',
      initiativeLabel: 'MONEY MONDAY',
      objectiveLabel: 'Reach 100,000 readers',
      status: 'active' as const,
      healthPct: 84,
      activityCount: 12,
      deliverableCount: 4,
      departmentCount: 5,
      departments: ['Content', 'Creative', 'Marketing', 'Operations', 'Legal'],
      estimatedCompletion: 'Mar 31',
      ownerExecutive: 'Chief of Staff',
    },
    {
      id: 'wp-page-028',
      workspaceId: 'ndxbook' as const,
      name: 'PAGE 028 · CROSS-PLATFORM PUSH',
      campaignId: 'camp-page-028',
      campaignLabel: 'PAGE 028 · CROSS-PLATFORM PUSH',
      initiativeLabel: 'CROSS-PLATFORM DISTRIBUTION',
      objectiveLabel: 'Reach 100,000 readers',
      status: 'planning' as const,
      healthPct: 72,
      activityCount: 8,
      deliverableCount: 3,
      departmentCount: 4,
      departments: ['Content', 'Creative', 'Marketing', 'Operations'],
      estimatedCompletion: 'Mar 22',
      ownerExecutive: 'Chief of Staff',
    },
  ];

  const activities: WorkActivity[] = [
    act({ id: 'act-mm-1', workPackageId: 'wp-money-monday-mar', title: 'Research · compound interest sources', department: 'Content', assignedTo: 'Research AI', executor: 'ai-worker', status: 'complete', priority: 1, estimatedMins: 120, dependsOn: [], dnaLayers: ['Writing DNA', 'Operational DNA'], automated: false }),
    act({ id: 'act-mm-2', workPackageId: 'wp-money-monday-mar', title: 'Script draft · page 042', department: 'Content', assignedTo: 'Script Writer AI', executor: 'ai-worker', status: 'in-progress', priority: 2, estimatedMins: 180, dependsOn: ['act-mm-1'], dnaLayers: ['Writing DNA', 'Company DNA'], automated: false }),
    act({ id: 'act-mm-3', workPackageId: 'wp-money-monday-mar', title: 'Script approval · CoS soft review', department: 'Executive Office', assignedTo: 'Chief of Staff', executor: 'executive', status: 'ready', priority: 3, estimatedMins: 15, dependsOn: ['act-mm-2'], dnaLayers: ['Leadership DNA'], automated: false }),
    act({ id: 'act-mm-4', workPackageId: 'wp-money-monday-mar', title: 'Thumbnail production · Labs #38', department: 'Creative', assignedTo: 'Thumbnail Generator', executor: 'automation', status: 'in-progress', priority: 4, estimatedMins: 45, dependsOn: ['act-mm-3'], dnaLayers: ['Creative DNA'], automated: true }),
    act({ id: 'act-mm-5', workPackageId: 'wp-money-monday-mar', title: 'Creative review · stat overlay', department: 'Creative', assignedTo: 'Chief Creative Officer', executor: 'executive', status: 'pending', priority: 5, estimatedMins: 30, dependsOn: ['act-mm-4'], dnaLayers: ['Creative DNA', 'Leadership DNA'], automated: false }),
    act({ id: 'act-mm-6', workPackageId: 'wp-money-monday-mar', title: 'Voice generation · money tone', department: 'Operations', assignedTo: 'Voice AI', executor: 'automation', status: 'blocked', priority: 6, estimatedMins: 60, dependsOn: ['act-mm-3'], dnaLayers: ['Writing DNA', 'Operational DNA'], automated: true, blockerReason: 'Waiting on script approval' }),
    act({ id: 'act-mm-7', workPackageId: 'wp-money-monday-mar', title: 'Animation · page 042', department: 'Creative', assignedTo: 'Animation AI', executor: 'automation', status: 'pending', priority: 7, estimatedMins: 90, dependsOn: ['act-mm-6'], dnaLayers: ['Creative DNA'], automated: true }),
    act({ id: 'act-mm-8', workPackageId: 'wp-money-monday-mar', title: 'Legal · FTC disclosure check', department: 'Legal', assignedTo: 'Compliance AI', executor: 'ai-worker', status: 'ready', priority: 8, estimatedMins: 20, dependsOn: ['act-mm-2'], dnaLayers: ['Company DNA'], automated: false }),
    act({ id: 'act-mm-9', workPackageId: 'wp-money-monday-mar', title: 'Social rollout · 3 platforms', department: 'Marketing', assignedTo: 'Social Packaging', executor: 'automation', status: 'pending', priority: 9, estimatedMins: 45, dependsOn: ['act-mm-5', 'act-mm-7'], dnaLayers: ['Operational DNA'], automated: true }),
    act({ id: 'act-mm-10', workPackageId: 'wp-money-monday-mar', title: 'Publish · optimized window', department: 'Operations', assignedTo: 'Scheduling AI', executor: 'automation', status: 'pending', priority: 10, estimatedMins: 15, dependsOn: ['act-mm-9', 'act-mm-8'], dnaLayers: ['Operational DNA'], automated: true }),
    act({ id: 'act-mm-11', workPackageId: 'wp-money-monday-mar', title: 'Analytics capture · campaign metrics', department: 'Analytics', assignedTo: 'Studio Intelligence', executor: 'automation', status: 'pending', priority: 11, estimatedMins: 10, dependsOn: ['act-mm-10'], dnaLayers: ['Company DNA'], automated: true }),
    act({ id: 'act-mm-12', workPackageId: 'wp-money-monday-mar', title: 'Campaign retrospective · playbook update', department: 'Executive Office', assignedTo: 'Chief of Staff', executor: 'executive', status: 'pending', priority: 12, estimatedMins: 30, dependsOn: ['act-mm-11'], dnaLayers: ['Leadership DNA', 'Operational DNA'], automated: false }),
  ];

  return {
    dashboard: {
      summary:
        'WORK ORCHESTRATION V1.0 — founders lead outcomes · the organization orchestrates work. Tasks are implementation details. Work generated intelligently from strategies, campaigns, newsroom, and executive decisions.',
      activeWorkPackages: 0,
      totalActivities: 0,
      blockedActivities: 0,
      automatedActivities: 0,
      founderWorkloadMins: 25,
      operationalHealthPct: 81,
    },
    activeWorkspaceId: 'ndxbook',
    workPackages,
    activities,
    dependencies: [
      { id: 'dep-1', fromActivityId: 'act-mm-3', fromLabel: 'Script approval', toActivityId: 'act-mm-6', toLabel: 'Voice generation', status: 'blocked', blocker: true },
      { id: 'dep-2', fromActivityId: 'act-mm-6', fromLabel: 'Voice generation', toActivityId: 'act-mm-7', toLabel: 'Animation', status: 'waiting', blocker: false },
      { id: 'dep-3', fromActivityId: 'act-mm-7', fromLabel: 'Animation', toActivityId: 'act-mm-10', toLabel: 'Publishing', status: 'waiting', blocker: false },
      { id: 'dep-4', fromActivityId: 'act-mm-2', fromLabel: 'Script draft', toActivityId: 'act-mm-3', toLabel: 'Script approval', status: 'ready', blocker: false },
    ],
    generationTemplates: [
      {
        id: 'gen-campaign-launch',
        trigger: 'Launch campaign',
        source: 'campaign',
        generatedActivities: ['Creative review', 'Copywriting', 'Thumbnail production', 'Landing page', 'Email sequence', 'Social rollout', 'Analytics', 'Retrospective'],
      },
      {
        id: 'gen-product-launch',
        trigger: 'Product launch',
        source: 'campaign',
        generatedActivities: ['Pricing review', 'Inventory', 'Legal review', 'Marketing assets', 'Creator outreach', 'Affiliate launch', 'Customer support preparation'],
      },
      {
        id: 'gen-newsroom-page',
        trigger: 'Newsroom page enters production',
        source: 'newsroom',
        generatedActivities: ['Research', 'Script', 'Creative review', 'Voice', 'Animation', 'Thumbnail', 'QA', 'Publish'],
      },
    ],
    departmentCapacity: [
      { department: 'Content', capacityPct: 78, workloadPct: 82, availablePct: 18, status: 'loaded', estimatedCompletion: 'Mar 18', conflict: '14 pages/week target' },
      { department: 'Creative', capacityPct: 68, workloadPct: 91, availablePct: 9, status: 'overloaded', estimatedCompletion: 'Mar 20', conflict: 'Thumbnail queue bottleneck' },
      { department: 'Marketing', capacityPct: 72, workloadPct: 65, availablePct: 35, status: 'healthy', estimatedCompletion: 'Mar 15' },
      { department: 'Operations', capacityPct: 55, workloadPct: 48, availablePct: 52, status: 'healthy', estimatedCompletion: 'Mar 14' },
      { department: 'Legal', capacityPct: 35, workloadPct: 28, availablePct: 72, status: 'idle', estimatedCompletion: 'On demand' },
      { department: 'Analytics', capacityPct: 40, workloadPct: 35, availablePct: 65, status: 'healthy', estimatedCompletion: 'Post-publish' },
    ],
    executiveQueues: [
      { executiveId: 'chief-of-staff', executiveTitle: 'Chief of Staff', todayPriorities: ['Script approval · page 042', 'Resequence voice gen after approval', 'Thumbnail queue bottleneck resolution'], recommendedSequence: ['Approve script → unblock voice → creative review'], estimatedCompletion: '2h', dependencies: ['act-mm-3 blocks act-mm-6'], confidencePct: 91 },
      { executiveId: 'chief-creative-officer', executiveTitle: 'Chief Creative Officer', todayPriorities: ['Stat overlay review · Labs #38', 'Route default template for queue'], recommendedSequence: ['Review thumbnail → approve default routing'], estimatedCompletion: '45m', dependencies: ['act-mm-4 in progress'], confidencePct: 88 },
      { executiveId: 'chief-content-officer', executiveTitle: 'Chief Content Officer', todayPriorities: ['Page 042 script finalization', 'Truth Tuesday research gate'], recommendedSequence: ['Script draft → CoS handoff'], estimatedCompletion: '3h', dependencies: [], confidencePct: 85 },
      { executiveId: 'chief-marketing-officer', executiveTitle: 'Chief Marketing Officer', todayPriorities: ['Money Monday social packaging prep', 'Page 028 launch brief'], recommendedSequence: ['Wait for creative assets → package'], estimatedCompletion: '4h', dependencies: ['act-mm-5', 'act-mm-7'], confidencePct: 79 },
    ],
    founderWorkspace: {
      organizationalPriorities: ['Money Monday March cycle on track', 'Unblock OAuth for Page 028 campaign', 'Newsletter Q3 simulation review'],
      leadershipRequired: ['None today — CoS handling script approval band'],
      strategicApprovals: ['Newsletter Q3 budget · $2.4K · pending simulation review'],
      majorRisks: ['Creative department overloaded · thumbnail queue', 'Social OAuth blocking Page 028'],
      majorOpportunities: ['Labs #38 stat overlay scaling to all money volume', 'Operations capacity available for automation expansion'],
      estimatedFounderWorkloadMins: 25,
      briefingSummary: 'ORGANIZATION EXECUTING AUTONOMOUSLY · 1 STRATEGIC APPROVAL QUEUED · 0 ESCALATIONS · FOUNDER ATTENTION PROTECTED',
    },
    priorityAdjustments: [
      { id: 'pa-1', workPackageId: 'wp-money-monday-mar', reason: 'Labs #38 winner validated', source: 'studio-intelligence', adjustment: 'Elevated thumbnail production priority · default stat overlay routing', at: daysFromNow(-1) },
      { id: 'pa-2', workPackageId: 'wp-money-monday-mar', reason: 'Creative capacity at 91%', source: 'capacity', adjustment: 'CoS routing default template to reduce queue · defer non-volume experiments', at: daysFromNow(0) },
      { id: 'pa-3', workPackageId: 'wp-page-028', reason: 'OAuth not configured', source: 'risk', adjustment: 'Paused social rollout activities · shifted timeline +7 days', at: daysFromNow(0) },
    ],
    timeline: [
      { id: 'tl-1', label: 'Money Monday March', type: 'campaign', startAt: daysFromNow(-7), endAt: daysFromNow(21), workPackageId: 'wp-money-monday-mar' },
      { id: 'tl-2', label: 'Page 042 production', type: 'deliverable', startAt: daysFromNow(-2), endAt: daysFromNow(5), workPackageId: 'wp-money-monday-mar', department: 'Content' },
      { id: 'tl-3', label: 'Script approval milestone', type: 'milestone', startAt: daysFromNow(0), endAt: daysFromNow(0), workPackageId: 'wp-money-monday-mar' },
      { id: 'tl-4', label: 'Page 028 push', type: 'campaign', startAt: daysFromNow(10), endAt: daysFromNow(17), workPackageId: 'wp-page-028' },
    ],
    operationalHealth: {
      executionVelocity: 82,
      organizationalEfficiency: 79,
      departmentHealth: 74,
      resourceUtilization: 68,
      bottleneckScore: 62,
      executionConfidence: 85,
      deliveryRisk: 28,
      overallPct: 81,
      recommendations: ['Route thumbnails through Labs #38 default automation', 'Shift 2 creative activities to next week to balance load', 'Unblock OAuth before Page 028 work package activates'],
    },
    knowledgeContributions: [
      { id: 'kc-1', activityId: 'act-mm-4', type: 'playbook-update', title: 'Stat overlay default for money volume', detail: 'Labs #38 routing pattern added to Money Monday playbook' },
      { id: 'kc-2', activityId: 'act-mm-1', type: 'institutional-knowledge', title: 'Research gate pattern · money content', detail: 'Federal Reserve + CFPB sources validated for investing pages' },
      { id: 'kc-3', activityId: 'act-mm-10', type: 'automation-candidate', title: 'Publish window optimization', detail: 'Scheduling AI achieved 94% on-time · eligible for full autonomy' },
    ],
    cosActions: [
      { id: 'cos-a-1', action: 'Resequence voice generation after script approval', target: 'wp-money-monday-mar', reason: 'Dependency blocker · act-mm-6 waiting on act-mm-3', status: 'pending' },
      { id: 'cos-a-2', action: 'Route thumbnail queue through default template', target: 'Creative department', reason: '91% workload · bottleneck resolution', status: 'complete' },
      { id: 'cos-a-3', action: 'Defer Page 028 social activities', target: 'wp-page-028', reason: 'OAuth blocker · risk mitigation', status: 'complete' },
    ],
    timelineZoom: 'week',
    selectedWorkPackageId: 'wp-money-monday-mar',
  };
}

export function bootstrapWorkOrchestrationPlatform(): void {
  bootstrapWorkOrchestrationStore(buildWorkOrchestrationSeed());
}
