/**
 * Campaign Orchestrator — automatic plan generation from wizard input.
 */

import type {
  CampaignAutomationRule,
  CampaignApprovalGate,
  CampaignDeliverable,
  CampaignExecutiveReview,
  CampaignPlan,
  CampaignRecommendation,
  CampaignTask,
  CampaignTimelinePhase,
  CampaignWhatIfScenario,
  CampaignWizardDraft,
} from './adminStudioCampaignOrchestratorDemo';
import { getCampaignType } from './adminStudioCampaignOrchestratorDemo';

const PHASE_TEMPLATES: Array<{ label: string; focus: string }> = [
  { label: 'TEASERS', focus: 'SOCIAL · STORIES · PUSH TEASE' },
  { label: 'EDUCATION', focus: 'JOURNAL · FAQ · LOUNGE LEARN' },
  { label: 'REVEAL', focus: 'HERO · EMAIL · INSTAGRAM REEL' },
  { label: 'LAUNCH', focus: 'LOUNGE TV · LANDING · FULL FUNNEL' },
  { label: 'TESTIMONIALS', focus: 'UGC STYLE · SOCIAL PROOF' },
  { label: 'RETENTION', focus: 'EMAIL · MEMBERSHIP · FOLLOW-UP' },
];

function buildTimeline(weeks: number): CampaignTimelinePhase[] {
  const phases = PHASE_TEMPLATES.slice(0, Math.min(weeks, PHASE_TEMPLATES.length));
  return phases.map((p, i) => ({
    id: `phase-${i}`,
    week: i + 1,
    label: `WEEK ${i + 1}`,
    focus: `${p.label} — ${p.focus}`,
  }));
}

function taskId(prefix: string, i: number): string {
  return `${prefix}-${i}`;
}

function buildTasks(wizard: CampaignWizardDraft, timeline: CampaignTimelinePhase[]): CampaignTask[] {
  const tasks: CampaignTask[] = [];
  const heroId = taskId('hero', 0);
  const thumbId = taskId('thumb', 1);
  const episodeId = taskId('ep', 2);

  tasks.push({
    id: heroId,
    title: 'GENERATE HERO IMAGES',
    department: 'visual',
    status: 'waiting',
    deliverableType: 'HERO BANNER',
    week: 1,
  });
  tasks.push({
    id: thumbId,
    title: 'APPROVE THUMBNAIL',
    department: 'creative',
    status: 'waiting',
    dependsOn: [heroId],
    deliverableType: 'THUMBNAIL',
    week: 2,
  });
  tasks.push({
    id: episodeId,
    title: 'FILM PSA / EPISODE',
    department: 'production',
    status: 'waiting',
    dependsOn: [thumbId],
    deliverableType: 'EPISODE',
    week: wizard.studios.length ? 3 : 2,
  });
  tasks.push({
    id: taskId('script', 3),
    title: 'WRITE EPISODE SCRIPT',
    department: 'editorial',
    status: 'waiting',
    week: 2,
  });
  tasks.push({
    id: taskId('email', 4),
    title: 'GENERATE LAUNCH EMAIL',
    department: 'editorial',
    status: 'waiting',
    dependsOn: [heroId],
    deliverableType: 'EMAIL',
    week: Math.max(1, timeline.length - 1),
  });
  tasks.push({
    id: taskId('blog', 5),
    title: 'GENERATE BLOG / JOURNAL',
    department: 'editorial',
    status: 'waiting',
    week: 3,
  });
  tasks.push({
    id: taskId('review', 6),
    title: 'REVIEW ASSETS IN ASSET DIRECTOR',
    department: 'visual',
    status: 'waiting',
    dependsOn: [heroId, thumbId],
    week: 2,
  });
  tasks.push({
    id: taskId('pub', 7),
    title: 'PUBLISH CAMPAIGN',
    department: 'publishing',
    status: 'waiting',
    dependsOn: [episodeId, taskId('email', 4)],
    week: timeline.length,
  });
  tasks.push({
    id: taskId('archive', 8),
    title: 'ARCHIVE TO LEGACY SYSTEM',
    department: 'legacy',
    status: 'waiting',
    dependsOn: [taskId('pub', 7)],
    week: timeline.length,
  });

  if (wizard.products.includes('NOIR')) {
    tasks.push({
      id: taskId('noir', 9),
      title: 'NOIR PRODUCT GRAPHICS',
      department: 'visual',
      status: 'waiting',
      dependsOn: [heroId],
      week: 3,
    });
  }

  return tasks;
}

function buildDeliverables(wizard: CampaignWizardDraft): CampaignDeliverable[] {
  const type = getCampaignType(wizard.typeId);
  const types = type?.deliverables ?? ['CONTENT PACK', 'EMAIL', 'SOCIAL'];
  const channels = ['LOUNGE TV', 'EMAIL', 'INSTAGRAM', 'JOURNAL', 'PUSH', 'WEBSITE', 'PINTEREST', 'TIKTOK'];

  return types.flatMap((t, i) => [
    {
      id: `del-${i}`,
      type: t,
      channel: channels[i % channels.length] ?? 'MULTI',
      status: 'planned' as const,
    },
  ]);
}

function buildApprovals(): CampaignApprovalGate[] {
  return [
    { id: 'production', label: 'PRODUCTION', approved: false, required: true },
    { id: 'generation', label: 'GENERATION', approved: false, required: true },
    { id: 'publishing', label: 'PUBLISHING', approved: false, required: true },
    { id: 'scheduling', label: 'SCHEDULING', approved: false, required: true },
    { id: 'distribution', label: 'DISTRIBUTION', approved: false, required: true },
  ];
}

function buildAutomation(): CampaignAutomationRule[] {
  return [
    { id: 'a1', trigger: 'AFTER SCRIPT APPROVAL', action: 'GENERATE THUMBNAILS', enabled: true, stopsAtApproval: true },
    { id: 'a2', trigger: 'AFTER THUMBNAILS APPROVED', action: 'GENERATE VIDEOS', enabled: true, stopsAtApproval: true },
    { id: 'a3', trigger: 'AFTER VIDEOS APPROVED', action: 'PREPARE EMAILS', enabled: false, stopsAtApproval: true },
    { id: 'a4', trigger: 'AFTER CAMPAIGN APPROVED', action: 'SCHEDULE PUBLISHING', enabled: false, stopsAtApproval: true },
  ];
}

function buildRecommendations(wizard: CampaignWizardDraft): CampaignRecommendation[] {
  const recs: CampaignRecommendation[] = [
    {
      id: 'rec1',
      title: 'LAUNCH EMAIL 24H BEFORE LAUNCH',
      reasoning: 'WORKSPACE HISTORY: EMAILS SENT 24H BEFORE PREMIERE SEE +18% OPEN RATE.',
      source: 'history',
    },
    {
      id: 'rec2',
      title: 'PUBLISH LOUNGE TV BEFORE REVEAL',
      reasoning: 'COMPLETION RATES HIGHEST WHEN LOUNGE EPISODE PRECEDES SOCIAL REVEAL.',
      source: 'history',
    },
    {
      id: 'rec3',
      title: 'INSTAGRAM AT 6 PM',
      reasoning: 'INTERNAL BENCHMARK: 6 PM POSTS OUTPERFORM MORNING BY 12% (ESTIMATE).',
      source: 'estimate',
    },
  ];

  if (!wizard.studios.length) {
    recs.push({
      id: 'rec4',
      title: 'DELAY UNTIL HERO ASSETS COMPLETE',
      reasoning: 'NO STUDIO SELECTED — HERO ASSETS INCOMPLETE IN CURRENT CONFIG.',
      source: 'config',
    });
  }

  return recs;
}

function buildExecutiveReview(wizard: CampaignWizardDraft): CampaignExecutiveReview {
  const hasCreative = wizard.shows.length > 0 && wizard.studios.length > 0;
  const risk = wizard.products.length === 0 ? 'high' : wizard.studios.length === 0 ? 'medium' : 'low';

  return {
    timelineScore: wizard.lengthWeeks >= 4 ? 92 : 78,
    resourcesScore: hasCreative ? 88 : 65,
    contentMixScore: wizard.typeId === 'product-launch' ? 90 : 85,
    brandAlignment: 96,
    audienceAlignment: wizard.audience ? 91 : 70,
    riskLevel: risk,
    suggestions: [
      'EXECUTIVE AI DIRECTOR: BALANCE EDUCATION + LAUNCH IN WEEKS 2–3.',
      wizard.products.length ? `FOCUS PRODUCT STORY: ${wizard.products.join(', ')}.` : 'SELECT PRODUCTS FOR CLEAR POSITIONING.',
      'REQUIRE EXPLICIT APPROVAL AT EACH GATE — NO AUTO-EXECUTE.',
    ],
  };
}

function buildWhatIf(wizard: CampaignWizardDraft): CampaignWhatIfScenario[] {
  const launch = new Date(wizard.launchDate);
  const alt = new Date(launch);
  alt.setMonth(alt.getMonth() + 1);

  return [
    {
      id: 'wif-a',
      label: `LAUNCH ${launch.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}`,
      launchDate: wizard.launchDate,
      estimatedReach: '42K – 58K',
      estimatedRevenue: '$12K – $18K',
      confidence: 'MEDIUM · WORKSPACE ESTIMATE',
    },
    {
      id: 'wif-b',
      label: `LAUNCH ${alt.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()}`,
      launchDate: alt.toISOString().slice(0, 10),
      estimatedReach: '48K – 65K',
      estimatedRevenue: '$14K – $22K',
      confidence: 'LOW · SEASONAL ESTIMATE',
    },
  ];
}

export function generateCampaignPlan(wizard: CampaignWizardDraft): CampaignPlan {
  const timeline = buildTimeline(wizard.lengthWeeks);
  const tasks = buildTasks(wizard, timeline);
  const deliverables = buildDeliverables(wizard);
  const executiveReview = buildExecutiveReview(wizard);
  const readiness = Math.round(
    (executiveReview.timelineScore +
      executiveReview.resourcesScore +
      executiveReview.brandAlignment +
      executiveReview.audienceAlignment) /
      4
  );
  const riskScore = executiveReview.riskLevel === 'high' ? 72 : executiveReview.riskLevel === 'medium' ? 45 : 22;

  return {
    id: `camp-${Date.now()}`,
    wizard: { ...wizard, step: 5 },
    timeline,
    tasks,
    deliverables,
    approvals: buildApprovals(),
    automation: buildAutomation(),
    recommendations: buildRecommendations(wizard),
    executiveReview,
    whatIfScenarios: buildWhatIf(wizard),
    readinessScore: readiness,
    riskScore,
    progressPct: 0,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'planned',
  };
}

export function computeCampaignProgress(plan: CampaignPlan): number {
  const done = plan.tasks.filter((t) => t.status === 'complete').length;
  return plan.tasks.length ? Math.round((done / plan.tasks.length) * 100) : 0;
}

export function getTaskDependencyChain(tasks: CampaignTask[], taskId: string): string[] {
  const chain: string[] = [];
  const task = tasks.find((t) => t.id === taskId);
  if (!task?.dependsOn?.length) return chain;
  task.dependsOn.forEach((dep) => {
    chain.push(dep);
    chain.push(...getTaskDependencyChain(tasks, dep));
  });
  return chain;
}
