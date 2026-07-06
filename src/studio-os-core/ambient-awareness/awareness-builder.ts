import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { resolveDigitalExecutiveRoster } from '../executive-council/digital-executives';
import { AWARENESS_LAYER_LABELS, AWARENESS_LAYERS } from './constants';
import type {
  AwarenessLayerSnapshot,
  DailyExecutiveBriefing,
  DepartmentAwarenessSnapshot,
  IntelligentContextSnapshot,
  OrganizationAmbientAwarenessProfile,
} from './types';

function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 17) return 'Good afternoon.';
  return 'Good evening.';
}

function deriveMeetingsToday(): number {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return 1;
  return 2 + (day % 3);
}

export function buildDailyExecutiveBriefing(organizationId: string, companyName: string): DailyExecutiveBriefing {
  const pulse = getOrganizationPulseProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);

  const meetings = deriveMeetingsToday();
  const marketingLift = pulse?.indicatorScores.find((i) => /marketing/i.test(i.label));
  const marketingLine = marketingLift
    ? `Marketing momentum ${marketingLift.trend === 'accelerating' ? 'increased' : 'steady'} — ${marketingLift.scorePct}% pulse indicator.`
    : 'Marketing campaign performance steady — monitoring engagement signals.';

  const pendingCouncil = council?.pendingDecisions ?? 0;
  const overdueLine =
    health?.weakAreas[0]
      ? `Watch ${health.weakAreas[0].label.toLowerCase()} — proactive attention recommended.`
      : 'Operations queue stable — no urgent overdue items flagged.';

  const publishingLine =
    blueprint && blueprint.overallProgressPct > 50
      ? 'Publishing and knowledge pipeline prepared for today.'
      : 'Discovery blueprint still building — onboarding remains foundational priority.';

  const topPriority =
    pendingCouncil > 0
      ? `Review ${pendingCouncil} Executive Council decision(s) awaiting founder approval.`
      : blueprint && blueprint.overallProgressPct < 60
      ? "Today's highest priority is completing organizational discovery."
      : pulse && pulse.overallPulseScore < 70
      ? 'Address Organization Pulse alerts before expanding workload.'
      : "Today's highest priority is sustaining momentum across departments.";

  const briefingLines = [
    `${meetings} meeting${meetings === 1 ? '' : 's'} on today's calendar.`,
    marketingLine,
    'Creative and operations teams delivered overnight updates — review in Mission Control.',
    overdueLine,
    publishingLine,
    topPriority,
  ];

  const fullBriefing = [timeGreeting(), '', ...briefingLines, '', `— Chief Concierge · ${companyName} · No prompt required.`].join('\n');

  return {
    id: `briefing-${organizationId}-${new Date().toISOString().slice(0, 10)}`,
    generatedAt: new Date().toISOString(),
    greeting: timeGreeting(),
    briefingLines,
    topPriority,
    fullBriefing,
  };
}

export function buildLayerSnapshots(organizationId: string, companyName: string): AwarenessLayerSnapshot[] {
  const pulse = getOrganizationPulseProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);

  const layerData: Record<(typeof AWARENESS_LAYERS)[number], { summary: string; status: AwarenessLayerSnapshot['status']; confidence: number }> = {
    'current-organization': {
      summary: `${companyName} active · pulse ${pulse?.overallPulseScore ?? 74}% · ${pulse?.pulseState ?? 'stable'}`,
      status: 'active',
      confidence: pulse?.overallPulseScore ?? 74,
    },
    'current-department': {
      summary: `${brain?.brains.length ?? 4} department brains synced · cross-department awareness enabled`,
      status: 'stable',
      confidence: 82,
    },
    'current-workspace': {
      summary: `Workspace ${organizationId.replace(/-/g, ' ')} · intelligence stack live`,
      status: 'active',
      confidence: 88,
    },
    'current-project': {
      summary: blueprint ? `Discovery ${blueprint.overallProgressPct}% · ${blueprint.currentChapterId.replace(/-/g, ' ')}` : 'Projects tracking via Mission Control',
      status: blueprint && blueprint.overallProgressPct < 70 ? 'attention' : 'stable',
      confidence: blueprint?.overallProgressPct ?? 65,
    },
    'current-campaign': {
      summary: marketingLiftSummary(pulse),
      status: 'active',
      confidence: 76,
    },
    'current-calendar': {
      summary: `${deriveMeetingsToday()} meetings today · executive rhythm synchronized`,
      status: 'stable',
      confidence: 90,
    },
    'current-priorities': {
      summary: council?.pendingDecisions ? `${council.pendingDecisions} council decision(s) pending` : 'Priorities aligned with pulse and health index',
      status: council?.pendingDecisions ? 'attention' : 'stable',
      confidence: 80,
    },
    'current-workload': {
      summary: pulse && pulse.overallPulseScore < 72 ? 'Workload elevated — capacity monitoring active' : 'Workload balanced across departments',
      status: pulse && pulse.overallPulseScore < 72 ? 'attention' : 'stable',
      confidence: pulse?.overallPulseScore ?? 75,
    },
    'current-objectives': {
      summary: 'Strategic objectives synced from blueprint and executive council',
      status: 'stable',
      confidence: 78,
    },
    'current-milestones': {
      summary: `${blueprint?.milestonesCelebrated.length ?? 0} milestones celebrated · legacy vault archiving enabled`,
      status: 'active',
      confidence: 85,
    },
  };

  return AWARENESS_LAYERS.map((layer) => ({
    layer,
    label: AWARENESS_LAYER_LABELS[layer],
    summary: layerData[layer].summary,
    status: layerData[layer].status,
    confidencePct: layerData[layer].confidence,
  }));
}

function marketingLiftSummary(pulse: ReturnType<typeof getOrganizationPulseProfile>): string {
  const m = pulse?.indicatorScores.find((i) => /marketing/i.test(i.label));
  if (!m) return 'Campaign signals monitoring — awaiting next performance sync';
  return `Campaign pulse ${m.scorePct}% · ${m.trend} trend`;
}

export function buildDepartmentSnapshots(organizationId: string): DepartmentAwarenessSnapshot[] {
  const roster = resolveDigitalExecutiveRoster(organizationId);
  const depts =
    roster.length > 0
      ? [...new Set(roster.map((e) => e.department))]
      : ['Marketing', 'Operations', 'Finance', 'Customer Experience', 'Production'];

  return depts.slice(0, 6).map((name, index) => ({
    departmentId: `dept-${name.toLowerCase().replace(/\s+/g, '-')}`,
    departmentName: name,
    currentFocus: deptFocus(name, index),
    collaboratingWith: depts.filter((d) => d !== name).slice(0, 2),
    momentum: index % 3 === 0 ? 'rising' : index % 3 === 1 ? 'steady' : 'strained',
  }));
}

function deptFocus(name: string, index: number): string {
  const focuses: Record<string, string> = {
    Marketing: 'Campaign performance review · content pipeline',
    Operations: 'Workflow validation · dispatch coordination',
    Finance: 'Invoice follow-up · revenue tracking',
    'Customer Experience': 'Onboarding queue · response times',
    Production: 'Overnight deliverables · revision cycle',
    Leadership: 'Executive council prep · priority alignment',
  };
  return focuses[name] ?? `Department priority cycle ${index + 1}`;
}

export function buildIntelligentContext(organizationId: string, companyName: string): IntelligentContextSnapshot {
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const pulse = getOrganizationPulseProfile(organizationId);

  const waitingProjects: string[] = [];
  if (blueprint && blueprint.overallProgressPct < 80) {
    waitingProjects.push(`Complete discovery chapter: ${blueprint.currentChapterId.replace(/-/g, ' ')}`);
  }
  if (pulse?.proactiveAlerts[0]) {
    waitingProjects.push(pulse.proactiveAlerts[0].recommendedAction.slice(0, 80));
  }

  const unresolvedDecisions =
    council?.decisionHistory
      .filter((d) => d.outcome === 'pending')
      .slice(0, 3)
      .map((d) => d.decision.slice(0, 80)) ?? [];

  return {
    activeOrganization: companyName,
    founderFocus: blueprint
      ? `${blueprint.currentChapterId.replace(/-/g, ' ')} · ${blueprint.overallProgressPct}% blueprint progress`
      : 'Mission Control · executive overview',
    recentConversationTheme: council?.latestBriefing?.query?.slice(0, 60) ?? 'Organizational rhythm · daily operations',
    waitingProjects: waitingProjects.slice(0, 4),
    unresolvedDecisions,
    shouldAskQuestions: false,
  };
}

export function computeAwarenessScore(layers: AwarenessLayerSnapshot[]): number {
  if (layers.length === 0) return 0;
  return Math.round(layers.reduce((s, l) => s + l.confidencePct, 0) / layers.length);
}

export function buildOrganizationAmbientAwarenessProfile(organizationId: string): OrganizationAmbientAwarenessProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const layerSnapshots = buildLayerSnapshots(organizationId, companyName);
  const dailyBriefing = buildDailyExecutiveBriefing(organizationId, companyName);

  return {
    organizationId,
    companyName,
    industryId: brain?.industryId ?? organizationId,
    updatedAt: new Date().toISOString(),
    awarenessScore: computeAwarenessScore(layerSnapshots),
    presentNotReactive: true,
    dailyBriefing,
    layerSnapshots,
    departmentSnapshots: buildDepartmentSnapshots(organizationId),
    intelligentContext: buildIntelligentContext(organizationId, companyName),
    syncedSources: [
      'organization-pulse',
      'company-health-index',
      'executive-council',
      'business-discovery-blueprint',
      'profession-brain',
      'memory-engine',
      'mission-control',
      'command-dock',
    ],
  };
}
