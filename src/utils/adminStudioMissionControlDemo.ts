/**
 * Mission Control — executive operating room for studio os (Milestone 18).
 * Demo/placeholder; workspace HQ after selection.
 */

export const MISSION_CONTROL_SUBTITLE = 'THE EXECUTIVE OPERATING ROOM OF YOUR WORKSPACE.';

export const MISSION_CONTROL_INHERITANCE_CHAIN = [
  'MISSION CONTROL',
  'EXECUTIVE AI DIRECTOR',
  'CAMPAIGN ORCHESTRATOR',
  'PRODUCTION BUILDER',
  'DISTRIBUTION',
  'LEGACY',
] as const;

export type MissionStatus = 'on-track' | 'attention' | 'critical' | 'complete';

export type MissionPhaseId =
  | 'research'
  | 'creative'
  | 'production'
  | 'review'
  | 'publishing'
  | 'distribution'
  | 'analytics'
  | 'legacy';

export const MISSION_PHASES: Array<{ id: MissionPhaseId; label: string }> = [
  { id: 'research', label: 'RESEARCH' },
  { id: 'creative', label: 'CREATIVE' },
  { id: 'production', label: 'PRODUCTION' },
  { id: 'review', label: 'REVIEW' },
  { id: 'publishing', label: 'PUBLISHING' },
  { id: 'distribution', label: 'DISTRIBUTION' },
  { id: 'analytics', label: 'ANALYTICS' },
  { id: 'legacy', label: 'LEGACY' },
];

export type MissionControlHeaderState = {
  missionStatus: MissionStatus;
  quarter: string;
  currentCampaign: string;
  season: string;
  workspaceHealth: number;
};

export const MISSION_CONTROL_HEADER: MissionControlHeaderState = {
  missionStatus: 'on-track',
  quarter: 'Q3 2026',
  currentCampaign: 'LAUNCH WEEK',
  season: 'SUMMER LUXURY',
  workspaceHealth: 94,
};

export type ExecutiveBriefData = {
  greeting: string;
  welcome: string;
  currentMission: string;
  todayPriorities: string[];
  yesterday: string[];
  todayFocus: string;
};

export const MISSION_EXECUTIVE_BRIEF: ExecutiveBriefData = {
  greeting: 'GOOD MORNING.',
  welcome: 'WELCOME BACK TO FRONTAL SLAYER.',
  currentMission: 'LAUNCH WEEK',
  todayPriorities: [
    'APPROVE PRODUCT VIDEO',
    'REVIEW EMAIL SEQUENCE',
    'PUBLISH LOUNGE TV EPISODE',
    'FINALIZE REWARDS CAMPAIGN',
  ],
  yesterday: ['14 NEW MEMBERS', '4 ORDERS', '1 CAMPAIGN COMPLETED'],
  todayFocus: 'LUXURY LAUNCH ASSETS',
};

export type MissionOverviewData = {
  title: string;
  progressPct: number;
  daysRemaining: number;
  phase: string;
  readinessScore: number;
  upcomingMilestone: string;
};

export const MISSION_OVERVIEW: MissionOverviewData = {
  title: 'LAUNCH WEEK',
  progressPct: 68,
  daysRemaining: 12,
  phase: 'PRODUCTION',
  readinessScore: 82,
  upcomingMilestone: 'SLAY REPORT EP 13 · FRI 7PM',
};

export type ActiveMissionCard = {
  id: string;
  title: string;
  status: MissionStatus;
  progressPct: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  teamHealth: number;
  risk: string;
  nextAction: string;
  route: string;
};

export const ACTIVE_MISSIONS: ActiveMissionCard[] = [
  {
    id: 'm-noir',
    title: 'NOIR LAUNCH',
    status: 'attention',
    progressPct: 72,
    priority: 'critical',
    deadline: 'AUG 8',
    teamHealth: 88,
    risk: 'HERO ASSETS INCOMPLETE',
    nextAction: 'APPROVE THUMBNAIL',
    route: '/admin/studio/campaign-orchestrator',
  },
  {
    id: 'm-summer',
    title: 'SUMMER COLLECTION',
    status: 'on-track',
    progressPct: 54,
    priority: 'high',
    deadline: 'AUG 15',
    teamHealth: 91,
    risk: 'LOW',
    nextAction: 'REVIEW LOOKBOOK',
    route: '/admin/studio/campaign-orchestrator',
  },
  {
    id: 'm-member',
    title: 'MEMBERSHIP GROWTH',
    status: 'on-track',
    progressPct: 61,
    priority: 'medium',
    deadline: 'ONGOING',
    teamHealth: 94,
    risk: 'LOW',
    nextAction: 'SEND WELCOME SEQUENCE',
    route: '/admin/studio/distribution-network',
  },
  {
    id: 'm-rewards',
    title: 'REWARDS REFRESH',
    status: 'attention',
    progressPct: 38,
    priority: 'high',
    deadline: 'MON',
    teamHealth: 79,
    risk: 'APPROVAL PENDING',
    nextAction: 'REVIEW CAMPAIGN',
    route: '/admin/studio/campaign-orchestrator',
  },
  {
    id: 'm-holiday',
    title: 'HOLIDAY CAMPAIGN',
    status: 'on-track',
    progressPct: 22,
    priority: 'medium',
    deadline: 'NOV',
    teamHealth: 96,
    risk: 'LOW',
    nextAction: 'SELECT BLUEPRINT',
    route: '/admin/studio/campaign-orchestrator',
  },
  {
    id: 'm-referral',
    title: 'REFERRAL PUSH',
    status: 'on-track',
    progressPct: 45,
    priority: 'low',
    deadline: 'SEP 1',
    teamHealth: 90,
    risk: 'LOW',
    nextAction: 'DRAFT EMAIL',
    route: '/admin/studio/distribution-network',
  },
];

export type AiDirectorDockInsight = {
  id: string;
  label: string;
  text: string;
  source: 'history' | 'config' | 'estimate';
  accentHex: string;
};

export const AI_DIRECTOR_DOCK: {
  recommendation: string;
  insights: AiDirectorDockInsight[];
} = {
  recommendation: 'PUBLISH LOUNGE TV EPISODE BEFORE FRIDAY REVEAL — ESTIMATED +18% COMPLETION (FORECAST).',
  insights: [
    { id: 'ai-creative', label: 'CREATIVE INSIGHT', text: 'CHERRY RED FORECAST OUTPERFORMED LAST 3 PACKS (WORKSPACE HISTORY).', source: 'history', accentHex: '#EB1C24' },
    { id: 'ai-audience', label: 'AUDIENCE INSIGHT', text: 'PREMIUM MEMBERS ENGAGE 2.4× ON LOUNGE TV LEARN (HISTORY).', source: 'history', accentHex: '#2563EB' },
    { id: 'ai-risk', label: 'RISK ALERT', text: 'EP 13 THUMBNAIL UNAPPROVED — LAUNCH WINDOW AT RISK (CONFIG).', source: 'config', accentHex: '#CA8A04' },
    { id: 'ai-opp', label: 'OPPORTUNITY', text: 'BEACH WAVE TUTORIAL SERIES — HIGH CONFIDENCE GAP (ESTIMATE).', source: 'estimate', accentHex: '#16A34A' },
    { id: 'ai-forecast', label: 'PERFORMANCE FORECAST', text: 'FRIDAY PREMIERE: 78–86% COMPLETION RANGE (PREDICTIVE ESTIMATE).', source: 'estimate', accentHex: '#9333EA' },
  ],
};

export type DepartmentCard = {
  id: string;
  title: string;
  health: number;
  currentTask: string;
  blocked: number;
  ready: number;
  pendingApprovals: number;
  recentActivity: string;
  route: string;
};

export const DEPARTMENT_GRID: DepartmentCard[] = [
  { id: 'creative', title: 'CREATIVE', health: 92, currentTask: 'SLAY REPORT EP 13 SCRIPT', blocked: 0, ready: 3, pendingApprovals: 1, recentActivity: 'CD BRIEF UPDATED 2H AGO', route: '/admin/studio/creative-director' },
  { id: 'production', title: 'PRODUCTION', health: 87, currentTask: 'HERO IMAGE GENERATION', blocked: 2, ready: 4, pendingApprovals: 2, recentActivity: '3 THUMBNAILS GENERATED', route: '/admin/studio/production-builder' },
  { id: 'asset-director', title: 'ASSET DIRECTOR', health: 95, currentTask: 'WEATHER STUDIO REFRESH', blocked: 1, ready: 6, pendingApprovals: 2, recentActivity: 'MOODBOARD APPROVED', route: '/admin/studio/asset-director' },
  { id: 'distribution', title: 'DISTRIBUTION', health: 89, currentTask: 'FRIDAY EMAIL SEQUENCE', blocked: 0, ready: 2, pendingApprovals: 1, recentActivity: 'PUSH SCHEDULED', route: '/admin/studio/distribution-network' },
  { id: 'audience', title: 'AUDIENCE', health: 91, currentTask: 'SEGMENT REFRESH', blocked: 0, ready: 5, pendingApprovals: 0, recentActivity: 'ENGAGEMENT +18% 30D', route: '/admin/studio/audience-brain' },
  { id: 'legacy', title: 'LEGACY', health: 98, currentTask: 'HALL OF FAME ENTRY', blocked: 0, ready: 1, pendingApprovals: 0, recentActivity: 'VAULT UPDATED', route: '/admin/studio/legacy-system' },
  { id: 'analytics', title: 'ANALYTICS', health: 88, currentTask: 'WEEKLY PERFORMANCE', blocked: 0, ready: 2, pendingApprovals: 0, recentActivity: 'COMPLETION REPORT READY', route: '/admin/studio/analytics' },
  { id: 'automation', title: 'AUTOMATION', health: 84, currentTask: 'CAMPAIGN RULES', blocked: 1, ready: 3, pendingApprovals: 1, recentActivity: 'ORCHESTRATOR PLAN GENERATED', route: '/admin/studio/campaign-orchestrator' },
];

export const MISSION_CURRENT_PHASE: MissionPhaseId = 'production';

export type CalendarEntry = {
  id: string;
  label: string;
  date: string;
  category: 'campaign' | 'launch' | 'email' | 'social' | 'lounge' | 'review' | 'approval' | 'deadline';
};

export const EXECUTIVE_CALENDAR: CalendarEntry[] = [
  { id: 'cal-1', label: 'NOIR LAUNCH TEASER', date: 'TODAY', category: 'campaign' },
  { id: 'cal-2', label: 'FRIDAY SLAY EMAIL', date: 'THU', category: 'email' },
  { id: 'cal-3', label: 'INSTAGRAM REEL · 6PM', date: 'THU', category: 'social' },
  { id: 'cal-4', label: 'LOUNGE TV EP 13', date: 'FRI 7PM', category: 'lounge' },
  { id: 'cal-5', label: 'EP 13 THUMBNAIL REVIEW', date: 'TODAY', category: 'review' },
  { id: 'cal-6', label: 'SUMMER CAMPAIGN APPROVAL', date: 'MON', category: 'approval' },
  { id: 'cal-7', label: 'REWARDS REFRESH DEADLINE', date: 'MON', category: 'deadline' },
  { id: 'cal-8', label: 'SUMMER COLLECTION LAUNCH', date: 'AUG 15', category: 'launch' },
];

export type ActivityFeedItem = {
  id: string;
  text: string;
  time: string;
  category: string;
};

export const LIVE_ACTIVITY_SEED: ActivityFeedItem[] = [
  { id: 'act-1', text: 'EXECUTIVE AI DIRECTOR COMPLETED CAMPAIGN REVIEW', time: 'JUST NOW', category: 'INTELLIGENCE' },
  { id: 'act-2', text: 'THREE THUMBNAILS GENERATED', time: '4M AGO', category: 'PRODUCTION' },
  { id: 'act-3', text: 'PSA SCRIPT APPROVED', time: '12M AGO', category: 'CREATIVE' },
  { id: 'act-4', text: 'WEATHER STUDIO UPDATED', time: '28M AGO', category: 'ASSETS' },
  { id: 'act-5', text: 'EMAIL SCHEDULED · FRIDAY 10AM', time: '1H AGO', category: 'DISTRIBUTION' },
  { id: 'act-6', text: 'MEMBER JOINED · PREMIUM TIER', time: '1H AGO', category: 'AUDIENCE' },
  { id: 'act-7', text: 'CONTENT PACK DRAFT SAVED', time: '2H AGO', category: 'PRODUCTION' },
  { id: 'act-8', text: 'LOUNGE TV PLACEMENT CONFIRMED', time: '3H AGO', category: 'PUBLISHING' },
];

export type PendingApproval = {
  id: string;
  title: string;
  type: 'asset' | 'video' | 'email' | 'campaign' | 'pack' | 'publishing';
  department: string;
  due: string;
};

export const PENDING_APPROVALS: PendingApproval[] = [
  { id: 'ap-hero', title: 'NOIR HERO IMAGE', type: 'asset', department: 'ASSET DIRECTOR', due: 'TODAY' },
  { id: 'ap-video', title: 'PRODUCT VIDEO CUT', type: 'video', department: 'PRODUCTION', due: 'TODAY' },
  { id: 'ap-email', title: 'FRIDAY LAUNCH EMAIL', type: 'email', department: 'DISTRIBUTION', due: 'THU' },
  { id: 'ap-campaign', title: 'REWARDS REFRESH CAMPAIGN', type: 'campaign', department: 'ORCHESTRATOR', due: 'MON' },
  { id: 'ap-pack', title: 'SLAY REPORT EP 13 PACK', type: 'pack', department: 'PRODUCTION', due: 'FRI' },
  { id: 'ap-pub', title: 'LOUNGE TV EP 13 PUBLISH', type: 'publishing', department: 'DISTRIBUTION', due: 'FRI' },
];

export type HealthScorecard = {
  id: string;
  label: string;
  score: number;
  trend: 'up' | 'down' | 'flat';
};

export const BUSINESS_HEALTH_SCORECARDS: HealthScorecard[] = [
  { id: 'workspace', label: 'WORKSPACE', score: 94, trend: 'up' },
  { id: 'brand', label: 'BRAND', score: 98, trend: 'flat' },
  { id: 'audience', label: 'AUDIENCE', score: 92, trend: 'up' },
  { id: 'creative', label: 'CREATIVE', score: 91, trend: 'up' },
  { id: 'production', label: 'PRODUCTION', score: 87, trend: 'flat' },
  { id: 'publishing', label: 'PUBLISHING', score: 85, trend: 'down' },
  { id: 'growth', label: 'GROWTH', score: 89, trend: 'up' },
  { id: 'studio', label: 'OVERALL STUDIO', score: 90, trend: 'up' },
];

export type QuickAction = {
  id: string;
  label: string;
  route: string;
};

export const MISSION_QUICK_ACTIONS: QuickAction[] = [
  { id: 'campaign', label: 'CREATE CAMPAIGN', route: '/admin/studio/campaign-orchestrator' },
  { id: 'pack', label: 'CREATE CONTENT PACK', route: '/admin/studio/content-packs' },
  { id: 'director', label: 'ENTER DIRECTOR MODE', route: '/admin/studio/director-mode' },
  { id: 'assets', label: 'GENERATE ASSETS', route: '/admin/studio/ai-studio' },
  { id: 'builder', label: 'PRODUCTION BUILDER', route: '/admin/studio/production-builder' },
  { id: 'asset-dir', label: 'ASSET DIRECTOR', route: '/admin/studio/asset-director' },
  { id: 'blueprints', label: 'BLUEPRINT MANAGER', route: '/admin/studio/blueprint-manager' },
  { id: 'factory', label: 'ASSET FACTORY', route: '/admin/studio/asset-factory' },
  { id: 'publish', label: 'PUBLISH CONTENT', route: '/admin/studio/publishing-queue' },
  { id: 'approvals', label: 'REVIEW APPROVALS', route: '/admin/studio/mission-control#approvals' },
];

export type SmartNotification = {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium';
  text: string;
};

export const SMART_NOTIFICATIONS: SmartNotification[] = [
  { id: 'n-1', title: 'MISSION BEHIND SCHEDULE', priority: 'high', text: 'REWARDS REFRESH · 38% COMPLETE · DEADLINE MON' },
  { id: 'n-2', title: 'CAMPAIGN READY FOR REVIEW', priority: 'medium', text: 'SUMMER COLLECTION · ORCHESTRATOR PLAN COMPLETE' },
  { id: 'n-3', title: 'PROMPT QUALITY IMPROVED', priority: 'medium', text: 'ASSET DIRECTOR · +6 PTS AVG SCORE 7D' },
  { id: 'n-4', title: 'AUDIENCE ENGAGEMENT RISING', priority: 'medium', text: 'LOUNGE TV COMPLETION +18% · 30D' },
  { id: 'n-5', title: 'WEATHER STUDIO ASSETS STALE', priority: 'high', text: '2 MOODBOARDS NEED REFRESH · ASSET DIRECTOR' },
];

export type WorkspaceMemoryItem = {
  id: string;
  label: string;
  text: string;
};

export const WORKSPACE_MEMORY: {
  thisDayInHistory: string;
  oneYearAgo: string;
  biggestWins: string[];
  hallOfFame: string;
  recentMilestones: string[];
  founderNotes: string;
} = {
  thisDayInHistory: 'SLAY REPORT EP 8 PREMIERED · RECORD COMPLETION',
  oneYearAgo: 'FIRST LOUNGE TV LEARN SERIES LAUNCHED',
  biggestWins: ['HAIR ANALYSIS 3.2× CONVERSION', 'MEMBERSHIP +14% NET NEW', 'SLAY CAM 340 SUBMISSIONS'],
  hallOfFame: 'EP 11 — HIGHEST COMPLETION THIS QUARTER',
  recentMilestones: ['CAMPAIGN ORCHESTRATOR LIVE', 'DIRECTOR MODE REHEARSAL', 'BLUEPRINT MANAGER LIVE'],
  founderNotes: 'TRUST OVER SALES · EVERY LAUNCH EARNS THE RED CARPET',
};

export type MissionSearchEntry = {
  id: string;
  label: string;
  category: string;
  route: string;
  keywords: string[];
};

export const MISSION_SEARCH_INDEX: MissionSearchEntry[] = [
  { id: 'ms-pack', label: 'SLAY REPORT EP 13', category: 'CONTENT PACK', route: '/admin/studio/content-packs', keywords: ['pack', 'slay', 'ep', '13'] },
  { id: 'ms-campaign', label: 'NOIR LAUNCH', category: 'CAMPAIGN', route: '/admin/studio/campaign-orchestrator', keywords: ['noir', 'launch', 'campaign'] },
  { id: 'ms-asset', label: 'WEATHER STUDIO', category: 'STUDIO', route: '/admin/studio/asset-director', keywords: ['weather', 'studio', 'asset'] },
  { id: 'ms-talent', label: 'BEAUTY REPORTER', category: 'TALENT', route: '/admin/studio/talent-agency', keywords: ['talent', 'reporter'] },
  { id: 'ms-email', label: 'FRIDAY LAUNCH EMAIL', category: 'EMAIL', route: '/admin/studio/distribution-network', keywords: ['email', 'friday'] },
  { id: 'ms-prompt', label: 'PROMPT LIBRARY', category: 'PROMPTS', route: '/admin/studio/prompt-library', keywords: ['prompt'] },
  { id: 'ms-customer', label: 'CLIENT INSIGHTS', category: 'CUSTOMERS', route: '/admin/clients', keywords: ['customer', 'client', 'member'] },
  { id: 'ms-analytics', label: 'PERFORMANCE ANALYTICS', category: 'ANALYTICS', route: '/admin/studio/analytics', keywords: ['analytics', 'views', 'completion'] },
  { id: 'ms-builder', label: 'PRODUCTION BUILDER', category: 'PRODUCTION', route: '/admin/studio/production-builder', keywords: ['production', 'builder', 'scene'] },
  { id: 'ms-orchestrator', label: 'CAMPAIGN ORCHESTRATOR', category: 'CAMPAIGNS', route: '/admin/studio/campaign-orchestrator', keywords: ['orchestrator', 'campaign', 'plan'] },
  { id: 'ms-blueprint', label: 'WEATHER STUDIO BLUEPRINT', category: 'BLUEPRINT', route: '/admin/studio/blueprint-manager/bp-weather-studio', keywords: ['blueprint', 'weather', 'studio', 'factory'] },
];

export const MISSION_CONTROL_BLUEPRINT_STATS = {
  ready: 4,
  missingAssets: 11,
  awaitingApproval: 6,
  health: 62,
  factoryReadiness: 28,
} as const;

export const MISSION_CONTROL_FACTORY_STATS = {
  factoryHealth: 94,
  jobsRunning: 1,
  jobsWaiting: 2,
  jobsFailed: 0,
  creditsRemaining: 7160,
  factoryEfficiency: 88,
} as const;

export function searchMissionIndex(query: string): MissionSearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MISSION_SEARCH_INDEX.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.includes(q) || q.includes(k))
  );
}

export function missionStatusColor(status: MissionStatus): string {
  if (status === 'on-track') return '#16A34A';
  if (status === 'attention') return '#CA8A04';
  if (status === 'critical') return '#EB1C24';
  return '#6B7280';
}

export function priorityColor(priority: ActiveMissionCard['priority']): string {
  if (priority === 'critical') return '#EB1C24';
  if (priority === 'high') return '#CA8A04';
  if (priority === 'medium') return '#2563EB';
  return '#9CA3AF';
}
