import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationQaHeadquartersProfile } from '../qa-headquarters/store';
import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import { getOrganizationQaSimulationEngineProfile } from '../qa-simulation-engine/store';
import { getOrganizationTimeMachineProfile } from '../time-machine/store';
import {
  ANALYSIS_SOURCE_LABELS,
  PREDICTION_PATTERN_LABELS,
  PREDICTION_TIMELINE_LABELS,
} from './constants';
import type {
  PredictiveQaAnalysisSource,
  PredictiveQaPrediction,
  PredictiveQaPatternType,
  PredictiveQaTimeline,
} from './types';

type UpstreamContext = {
  trustScore: number;
  trustTrend: string;
  systemsAtRisk: number;
  inspectorOpen: number;
  inspectorCritical: number;
  simulationBlocked: boolean;
  dropOffRisk: number;
  knowledgeConfidence: number;
  replayFailures: number;
  decliningSystems: string[];
};

function buildContext(organizationId: string): UpstreamContext {
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const simulation = getOrganizationQaSimulationEngineProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const timeMachine = getOrganizationTimeMachineProfile(organizationId);

  const decliningSystems =
    trust?.systemIndicators.filter((i) => i.trend === 'declining').map((i) => i.label) ?? [];

  const replayFailures =
    timeMachine?.replayEvents.filter((e) => e.eventType === 'automation-failure').length ?? 0;

  const dropOffRisk =
    simulation && simulation.recentSimulations.length > 0
      ? Math.round(
          simulation.recentSimulations.reduce((sum, s) => sum + s.dropOffRiskPct, 0) /
            simulation.recentSimulations.length
        )
      : 18;

  return {
    trustScore: trust?.overallTrustScore ?? 72,
    trustTrend: trust?.trustTrend ?? 'stable',
    systemsAtRisk: trust?.systemsAtRisk ?? 0,
    inspectorOpen: inspector?.openFindings ?? 0,
    inspectorCritical: inspector?.criticalFindings ?? 0,
    simulationBlocked: simulation?.productionGateStatus === 'blocked',
    dropOffRisk,
    knowledgeConfidence: confidence?.overallConfidenceScore ?? 74,
    replayFailures,
    decliningSystems,
  };
}

function seed(
  id: string,
  patternType: PredictiveQaPatternType,
  title: string,
  statement: string,
  confidencePct: number,
  evidence: string[],
  timeline: PredictiveQaTimeline,
  impact: string,
  departments: string[],
  action: string,
  sources: PredictiveQaAnalysisSource[],
  severity: PredictiveQaPrediction['severity'],
  now: string
): PredictiveQaPrediction {
  return {
    id,
    patternType,
    patternLabel: PREDICTION_PATTERN_LABELS[patternType],
    title,
    statement,
    confidencePct,
    supportingEvidence: evidence,
    estimatedTimeline: timeline,
    timelineLabel: PREDICTION_TIMELINE_LABELS[timeline],
    businessImpact: impact,
    departmentsAffected: departments,
    recommendedPreventativeAction: action,
    analysisSources: sources,
    severity,
    preventableNow: severity !== 'critical' || confidencePct >= 80,
    status: 'active',
    predictedAt: now,
  };
}

export function buildPredictiveQaPredictions(organizationId: string, now: string): PredictiveQaPrediction[] {
  const ctx = buildContext(organizationId);
  const qaHq = getOrganizationQaHeadquartersProfile(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const predictions: PredictiveQaPrediction[] = [];

  predictions.push(
    seed(
      'pred-onboarding-bottleneck',
      'scaling-bottleneck',
      'Onboarding Workflow Bottleneck',
      'This onboarding workflow will likely become a bottleneck as customer volume increases.',
      ctx.dropOffRisk >= 25 ? 91 : 84,
      [
        `Customer simulation drop-off risk at ${ctx.dropOffRisk}% — above safe threshold`,
        'Workflow history shows 23% longer completion time over last 30 days',
        `${ANALYSIS_SOURCE_LABELS['organization-growth']}: projected 40% volume increase next month`,
        ctx.simulationBlocked ? 'Production gate currently blocked on onboarding path' : 'Automation triggers fire sequentially without parallelization',
      ],
      'within-30-days',
      'New customers experience delays · support tickets increase · conversion drops 8–15%',
      ['Operations', 'Customer Success', 'Engineering'],
      'Parallelize onboarding steps · add capacity alerts · run Customer Simulation before next volume spike',
      ['workflow-history', 'customer-activity', 'organization-growth', 'automation-behavior'],
      ctx.dropOffRisk >= 25 ? 'high' : 'medium',
      now
    )
  );

  predictions.push(
    seed(
      'pred-staffing-demand',
      'expert-shortage',
      'Staffing vs Projected Demand',
      'Current staffing will not support projected demand next month.',
      87,
      [
        `${ANALYSIS_SOURCE_LABELS['marketplace-trends']}: expert consultation requests up 34%`,
        `${ANALYSIS_SOURCE_LABELS['customer-activity']}: appointment booking velocity exceeds expert availability`,
        'Workflow history: 12% of bookings routed to waitlist last week',
        `${ANALYSIS_SOURCE_LABELS['organization-growth']}: headcount flat while revenue pipeline grows`,
      ],
      'within-30-days',
      'Expert marketplace SLA breaches · customer frustration · revenue leakage from unfilled consultations',
      ['Marketplace', 'Operations', 'Executive'],
      'Recruit 2 additional experts · enable overflow routing · adjust booking caps with demand forecast',
      ['marketplace-trends', 'customer-activity', 'organization-growth', 'workflow-history'],
      'high',
      now
    )
  );

  predictions.push(
    seed(
      'pred-brain-inconsistency',
      'declining-trust-score',
      'Profession Brain™ Inconsistency',
      'This Profession Brain™ is becoming inconsistent after recent edits.',
      brain ? 89 : 82,
      [
        `${ANALYSIS_SOURCE_LABELS['profession-brains']}: 3 boundary edits in last 14 days without harmonization review`,
        qaHq ? `QA Headquarters trust score for Profession Brain at ${qaHq.trustScores.find((t) => t.systemId === 'profession-brain')?.scorePct ?? 78}%` : 'Trust metrics unavailable — assume drift risk',
        `${ANALYSIS_SOURCE_LABELS['knowledge-graph']}: conflicting nodes detected between Legal and Tax domains`,
        ctx.decliningSystems.some((s) => s.toLowerCase().includes('brain')) ? 'Executive Trust Dashboard shows declining brain confidence' : 'Simulation personas report inconsistent AI guidance',
      ],
      'within-7-days',
      'AI recommendations contradict · Professional Trust Framework violation risk · customer confusion',
      ['Knowledge', 'QA', 'Executive'],
      'Run Brain harmonization review · sync Knowledge Graph boundaries · re-validate with QA Simulation personas',
      ['profession-brains', 'knowledge-graph', 'system-changes', 'performance-history'],
      'high',
      now
    )
  );

  predictions.push(
    seed(
      'pred-automation-overload',
      'automation-overload',
      'Automation Trigger Overload',
      'Automation volume will exceed safe concurrency limits during peak hours.',
      86,
      [
        `${ANALYSIS_SOURCE_LABELS['automation-behavior']}: 47 active automations · 8 share identical trigger events`,
        ctx.replayFailures > 0 ? `${ctx.replayFailures} automation failure replays in Time Machine` : 'Inspector flagged conflicting automation pair',
        `${ANALYSIS_SOURCE_LABELS['performance-history']}: automation queue latency up 31% at 2pm daily`,
        `${ANALYSIS_SOURCE_LABELS['user-behavior']}: peak activity window overlaps with batch jobs`,
      ],
      'within-7-days',
      'Duplicate notifications · race conditions · workflow state corruption · customer-facing delays',
      ['Engineering', 'Operations', 'QA'],
      'Consolidate duplicate triggers · add concurrency caps · schedule batch jobs outside peak window',
      ['automation-behavior', 'performance-history', 'user-behavior', 'workflow-history'],
      'high',
      now
    )
  );

  if (ctx.trustTrend === 'declining' || ctx.systemsAtRisk >= 2) {
    predictions.push(
      seed(
        'pred-trust-decline',
        'declining-trust-score',
        'Organizational Trust Decline',
        'Trust scores are trending downward across multiple systems — intervention window closing.',
        ctx.trustScore < 75 ? 93 : 85,
        [
          `Executive Trust Dashboard overall trust at ${ctx.trustScore}% · trend ${ctx.trustTrend}`,
          `${ctx.systemsAtRisk} systems currently at-risk`,
          ctx.decliningSystems.length > 0 ? `Declining: ${ctx.decliningSystems.slice(0, 3).join(', ')}` : 'QA Inspector open findings correlate with trust dips',
          `${ctx.inspectorOpen} open inspector findings · ${ctx.inspectorCritical} critical`,
        ],
        'next-quarter',
        'Executive confidence erodes · slower decision-making · increased manual verification overhead',
        ['Executive', 'QA', 'Operations'],
        'Prioritize top 3 at-risk systems · weekly trust review · address critical inspector findings first',
        ['performance-history', 'system-changes', 'organization-growth'],
        ctx.trustScore < 75 ? 'critical' : 'high',
        now
      )
    );
  }

  if (ctx.knowledgeConfidence < 80) {
    predictions.push(
      seed(
        'pred-knowledge-gap',
        'knowledge-gap',
        'Knowledge Graph Coverage Gap',
        'Critical workflow steps lack verified Knowledge Graph coverage — AI will guess under pressure.',
        88,
        [
          `${ANALYSIS_SOURCE_LABELS['knowledge-graph']}: confidence at ${ctx.knowledgeConfidence}% · below 80% threshold`,
          '3 high-traffic workflows reference undocumented decision points',
          `${ANALYSIS_SOURCE_LABELS['profession-brains']}: brain instructions cite metrics not in graph`,
          'QA Inspector: missing documentation on permit approval path',
        ],
        'within-30-days',
        'Hallucination risk increases · incorrect customer guidance · compliance exposure',
        ['Knowledge', 'QA', 'Customer Success'],
        'Audit top 5 workflows for graph coverage · publish missing nodes · link brains to verified sources',
        ['knowledge-graph', 'profession-brains', 'workflow-history'],
        'medium',
        now
      )
    );
  }

  if (ctx.inspectorCritical > 0) {
    predictions.push(
      seed(
        'pred-permission-risk',
        'permission-risk',
        'Permission Escalation Risk',
        'Current permission conflicts will likely cause unauthorized access incidents.',
        90,
        [
          `${ctx.inspectorCritical} critical permission findings from QA Inspector`,
          `${ANALYSIS_SOURCE_LABELS['system-changes']}: 2 role template edits without Policy Engine review`,
          `${ANALYSIS_SOURCE_LABELS['user-behavior']}: elevated delete actions from Editor role`,
          'Time Machine replay shows permission check bypass on integration webhook',
        ],
        'within-7-days',
        'Data loss · compliance violation · audit failure · customer trust breach',
        ['Security', 'Engineering', 'Executive'],
        'Resolve permission conflicts immediately · align roles with Policy Engine · enable deletion audit trail',
        ['system-changes', 'user-behavior', 'workflow-history'],
        'critical',
        now
      )
    );
  }

  predictions.push(
    seed(
      'pred-tech-debt',
      'technical-debt',
      'Accumulating Workflow Technical Debt',
      'Legacy workflow templates are accumulating silent failures that will surface under scale.',
      83,
      [
        `${ANALYSIS_SOURCE_LABELS['workflow-history']}: 6 workflows on deprecated template v2`,
        `${ANALYSIS_SOURCE_LABELS['performance-history']}: error rate 2.1% on legacy paths vs 0.4% on current`,
        `${ctx.inspectorOpen} open inspector findings include dead integrations`,
        `${ANALYSIS_SOURCE_LABELS['system-changes']}: 4 migrations deferred past SLA`,
      ],
      'next-quarter',
      'Cascading failures during peak · engineering firefighting · delayed feature delivery',
      ['Engineering', 'Operations', 'QA'],
      'Schedule workflow migration sprint · retire v2 templates · automate integration health checks',
      ['workflow-history', 'performance-history', 'system-changes'],
      'medium',
      now
    )
  );

  predictions.push(
    seed(
      'pred-customer-frustration',
      'customer-frustration',
      'Customer Frustration Spike',
      'Customer frustration signals predict a support ticket surge within weeks.',
      ctx.dropOffRisk >= 20 ? 87 : 79,
      [
        `${ANALYSIS_SOURCE_LABELS['customer-activity']}: booking abandonment up 19% week-over-week`,
        'QA Simulation: accessibility failures on mobile checkout path',
        `${ANALYSIS_SOURCE_LABELS['user-behavior']}: repeat page reloads on confirmation screen`,
        ctx.simulationBlocked ? 'Production gate blocked — UX issues unresolved' : 'NPS proxy metrics declining',
      ],
      'within-30-days',
      'Support volume +25–40% · negative reviews · churn in first 30 days',
      ['Customer Success', 'Engineering', 'Operations'],
      'Fix mobile checkout accessibility · add confirmation feedback · deploy Customer Simulation gate',
      ['customer-activity', 'user-behavior', 'performance-history'],
      ctx.dropOffRisk >= 20 ? 'high' : 'medium',
      now
    )
  );

  predictions.push(
    seed(
      'pred-doc-outdated',
      'outdated-documentation',
      'Documentation Drift',
      'Documentation is becoming outdated faster than update cycles — teams will follow wrong processes.',
      85,
      [
        `${ANALYSIS_SOURCE_LABELS['knowledge-graph']}: 14 doc pages reference deprecated workflows`,
        'QA Inspector: outdated onboarding guide flagged open',
        `${ANALYSIS_SOURCE_LABELS['system-changes']}: 9 releases since last doc sync`,
        `${ANALYSIS_SOURCE_LABELS['organization-growth']}: 3 new hires onboarded with stale guides`,
      ],
      'within-30-days',
      'Extended onboarding · inconsistent operations · audit findings on process compliance',
      ['Knowledge', 'Operations', 'QA'],
      'Enable documentation sync alerts · assign doc owners per workflow · run link validation weekly',
      ['knowledge-graph', 'system-changes', 'organization-growth'],
      'medium',
      now
    )
  );

  predictions.push(
    seed(
      'pred-workflow-failure',
      'workflow-failure',
      'Permit Approval Workflow Failure',
      'Permit approval workflow likely to fail when concurrent submissions exceed current capacity.',
      82,
      [
        `${ANALYSIS_SOURCE_LABELS['workflow-history']}: approval queue timeout on 3 occasions last month`,
        `${ANALYSIS_SOURCE_LABELS['customer-activity']}: permit submissions trending +28%`,
        'Time Machine replay: single-threaded approval node caused 47-minute delay',
        `${ANALYSIS_SOURCE_LABELS['automation-behavior']}: escalation automation disabled in test mode`,
      ],
      'within-30-days',
      'Permit SLA breaches · regulatory complaints · revenue hold on pending approvals',
      ['Operations', 'Engineering', 'Customer Success'],
      'Enable parallel approval paths · activate escalation automation · load-test at 2× current volume',
      ['workflow-history', 'customer-activity', 'automation-behavior'],
      'high',
      now
    )
  );

  return predictions.sort((a, b) => b.confidencePct - a.confidencePct);
}

export function computePredictiveQaScore(predictions: PredictiveQaPrediction[]): number {
  if (predictions.length === 0) return 100;
  const active = predictions.filter((p) => p.status === 'active');
  const riskWeight = active.reduce((sum, p) => {
    const sev = p.severity === 'critical' ? 4 : p.severity === 'high' ? 3 : p.severity === 'medium' ? 2 : 1;
    return sum + sev * (p.confidencePct / 100);
  }, 0);
  return Math.max(0, Math.min(99, Math.round(100 - riskWeight * 2.5)));
}

export function countHighRiskPredictions(predictions: PredictiveQaPrediction[]): number {
  return predictions.filter((p) => p.status === 'active' && (p.severity === 'high' || p.severity === 'critical')).length;
}

export function countPreventableRisks(predictions: PredictiveQaPrediction[]): number {
  return predictions.filter((p) => p.status === 'active' && p.preventableNow).length;
}
