import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationPulseProfile } from '../organization-pulse/store';
import { LAB_SIMULATION_LABELS } from './constants';
import { buildCouncilReviewForSimulation } from './council-review';
import type {
  BusinessSimulationReport,
  LabSimulationType,
  OrganizationSimulationLabProfile,
  ScenarioLibraryEntry,
} from './types';

type ParsedLabScenario = {
  simulationType: LabSimulationType;
  title: string;
  magnitude: number;
  magnitudeLabel: string;
};

function extractNumber(text: string, fallback = 1): number {
  const pct = text.match(/(\d+)\s*%/);
  if (pct) return Number(pct[1]);
  const count = text.match(/(\d+)\s+(employees|staff|people|hires|months|products)/i);
  if (count) return Number(count[1]);
  if (/double|twice|2x/i.test(text)) return 2;
  return fallback;
}

export function parseLabSimulationQuery(query: string): ParsedLabScenario {
  const lower = query.toLowerCase();
  const magnitude = extractNumber(lower);

  if (/marketing|campaign|ad spend|advertising/i.test(lower)) {
    return { simulationType: 'marketing-campaign', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude}% budget` };
  }
  if (/pricing|price increase|price decrease|raise price|lower price/i.test(lower)) {
    return { simulationType: 'pricing-change', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude}% change` };
  }
  if (/hire|hiring|headcount|staffing plan/i.test(lower)) {
    return { simulationType: 'hiring-plan', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude} role(s)` };
  }
  if (/department|expand team|new team/i.test(lower)) {
    return { simulationType: 'department-expansion', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude} unit(s)` };
  }
  if (/product launch|new product|launch/i.test(lower)) {
    return { simulationType: 'product-launch', title: query.slice(0, 80), magnitude, magnitudeLabel: 'launch scenario' };
  }
  if (/geographic|new market|expand into|international|texas|state/i.test(lower)) {
    return { simulationType: 'geographic-expansion', title: query.slice(0, 80), magnitude, magnitudeLabel: 'market entry' };
  }
  if (/inventory|stock|supply/i.test(lower)) {
    return { simulationType: 'inventory-change', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude}% adjustment` };
  }
  if (/membership|member tier|loyalty program/i.test(lower)) {
    return { simulationType: 'membership-model', title: query.slice(0, 80), magnitude, magnitudeLabel: 'membership redesign' };
  }
  if (/automation|automate/i.test(lower)) {
    return { simulationType: 'automation-rollout', title: query.slice(0, 80), magnitude, magnitudeLabel: 'automation scope' };
  }
  if (/subscription|recurring|saas/i.test(lower)) {
    return { simulationType: 'subscription-model', title: query.slice(0, 80), magnitude, magnitudeLabel: 'subscription change' };
  }
  if (/revenue forecast|revenue projection|forecast/i.test(lower)) {
    return { simulationType: 'revenue-forecast', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude}-year horizon` };
  }
  if (/digital staff|digital workforce|concierge|ai staff/i.test(lower)) {
    return { simulationType: 'digital-workforce-growth', title: query.slice(0, 80), magnitude, magnitudeLabel: `${magnitude} digital role(s)` };
  }
  if (/knowledge product|course|playbook|expertise product/i.test(lower)) {
    return { simulationType: 'knowledge-product-launch', title: query.slice(0, 80), magnitude, magnitudeLabel: 'knowledge launch' };
  }
  return { simulationType: 'operational-change', title: query.slice(0, 80), magnitude, magnitudeLabel: 'operational scenario' };
}

function computeConfidence(profile: OrganizationSimulationLabProfile, type: LabSimulationType): number {
  let base = profile.labReadinessScore - 5;
  const health = getOrganizationHealthIndexProfile(profile.organizationId);
  if (health && health.executiveHealthScore > 75) base += 4;
  if (['geographic-expansion', 'product-launch', 'revenue-forecast'].includes(type)) base -= 6;
  if (['operational-change', 'hiring-plan', 'marketing-campaign'].includes(type)) base += 3;
  return Math.max(55, Math.min(92, Math.round(base)));
}

function buildDepartments(type: LabSimulationType): string[] {
  const map: Record<LabSimulationType, string[]> = {
    'marketing-campaign': ['Marketing', 'Customer Experience', 'Finance'],
    'pricing-change': ['Finance', 'Customer Experience', 'Marketing'],
    'hiring-plan': ['Operations', 'Finance', 'Leadership'],
    'department-expansion': ['Leadership', 'Operations', 'Finance'],
    'product-launch': ['Production', 'Marketing', 'Customer Experience'],
    'geographic-expansion': ['Operations', 'Marketing', 'Legal'],
    'inventory-change': ['Operations', 'Finance', 'Production'],
    'membership-model': ['Customer Experience', 'Marketing', 'Finance'],
    'automation-rollout': ['Operations', 'Finance', 'Leadership'],
    'subscription-model': ['Finance', 'Marketing', 'Customer Experience'],
    'revenue-forecast': ['Finance', 'Leadership', 'Marketing'],
    'digital-workforce-growth': ['Operations', 'Leadership', 'Finance'],
    'knowledge-product-launch': ['Marketing', 'Production', 'Customer Experience'],
    'operational-change': ['Operations', 'Leadership', 'Finance'],
  };
  return map[type];
}

function buildPredictedOutcomes(parsed: ParsedLabScenario, confidence: number): string[] {
  const { simulationType, magnitude, magnitudeLabel } = parsed;
  const outcomes: string[] = [
    `${LAB_SIMULATION_LABELS[simulationType]} modeled at ${magnitudeLabel} — confidence ${confidence}%`,
  ];

  if (simulationType === 'marketing-campaign') {
    outcomes.push(`Reach expansion +${magnitude * 2}% · lead flow +${Math.round(magnitude * 1.4)}% over 90 days`);
    outcomes.push('Brand awareness lift with measurable conversion funnel impact');
  } else if (simulationType === 'hiring-plan') {
    outcomes.push(`Capacity increase ~${magnitude * 10}% · payroll +${magnitude * 7}% monthly`);
    outcomes.push('Onboarding load on leadership during first 60 days');
  } else if (simulationType === 'product-launch') {
    outcomes.push(`Revenue ramp +${magnitude * 6}%–${magnitude * 14}% within first two quarters`);
    outcomes.push('Cross-functional coordination across production and CX');
  } else if (simulationType === 'geographic-expansion') {
    outcomes.push('Compliance and localization overhead in first 120 days');
    outcomes.push(`Addressable market expansion with phased rollout recommended`);
  } else if (simulationType === 'revenue-forecast') {
    outcomes.push(`Projected growth trajectory over ${magnitude}-period horizon`);
    outcomes.push('Sensitivity to retention and acquisition assumptions');
  } else {
    outcomes.push('Operational efficiency shift within 30–90 day transition window');
    outcomes.push('Executive alignment required before real-world implementation');
  }

  return outcomes.slice(0, 4);
}

function buildResources(type: LabSimulationType, magnitude: number): string[] {
  const base = ['Founder decision authority', 'Executive Council review completed', 'Sandbox — no real resources committed'];
  if (type === 'hiring-plan') base.unshift(`Budget for ${magnitude} role(s) · recruiting timeline 45–90 days`);
  if (type === 'marketing-campaign') base.unshift(`Campaign budget allocation · creative production · analytics tracking`);
  if (type === 'product-launch') base.unshift(`Product development · GTM assets · support readiness`);
  if (type === 'automation-rollout') base.unshift(`Shadow Mode observation period · workflow documentation · change management`);
  return base.slice(0, 5);
}

function buildAlternatives(type: LabSimulationType): string[] {
  if (type === 'pricing-change') return ['Phased price test on subset of customers', 'Value-add bundle instead of price increase', 'Grandfather existing customers for 12 months'];
  if (type === 'hiring-plan') return ['Contractors for 90-day pilot before FTE', 'Digital staff augmentation via Concierge Layer', 'Cross-train existing team before hiring'];
  if (type === 'geographic-expansion') return ['Partnership-first market entry', 'Digital-only presence before physical expansion', 'License model instead of direct operations'];
  return ['Pilot program with 30-day review checkpoint', 'Defer until Company Health Index weak areas improve', 'Run deeper model in Simulation Engine before committing'];
}

function buildImprovements(profile: OrganizationSimulationLabProfile, confidence: number): string[] {
  const improvements = ['Compare simulation with Organization Digital Twin what-if for consistency'];
  if (confidence < 75) improvements.unshift('Gather more organizational memory before implementing');
  const pulse = getOrganizationPulseProfile(profile.organizationId);
  if (pulse && pulse.overallPulseScore < 72) improvements.push('Address Organization Pulse alerts before major initiative');
  improvements.push('Document decision outcome in Scenario Library when implemented');
  return improvements.slice(0, 4);
}

export function runBusinessSimulation(
  profile: OrganizationSimulationLabProfile,
  query: string
): { report: BusinessSimulationReport; libraryEntry: ScenarioLibraryEntry } {
  const parsed = parseLabSimulationQuery(query);
  const confidenceScore = computeConfidence(profile, parsed.simulationType);
  const departments = buildDepartments(parsed.simulationType);
  const councilReview = buildCouncilReviewForSimulation(profile.organizationId, query, confidenceScore);

  const reportId = `lab-sim-${profile.organizationId}-${Date.now()}`;

  const report: BusinessSimulationReport = {
    id: reportId,
    organizationId: profile.organizationId,
    query: query.trim(),
    scenarioTitle: parsed.title,
    simulationType: parsed.simulationType,
    runAt: new Date().toISOString(),
    sandbox: true,
    executiveSummary: `Business Simulation Lab modeled ${LAB_SIMULATION_LABELS[parsed.simulationType]} for ${profile.companyName}. ${councilReview.summary.slice(0, 160)} Sandbox only — founder retains final authority.`,
    predictedOutcomes: buildPredictedOutcomes(parsed, confidenceScore),
    revenueImpact: `Estimated revenue ${parsed.simulationType === 'pricing-change' ? 'margin' : 'opportunity'} ±${parsed.magnitude * 5}%–${parsed.magnitude * 12}% — derived from organizational intelligence, not guaranteed.`,
    customerImpact: `Customer experience ${parsed.simulationType === 'pricing-change' ? 'sensitivity to value perception' : 'engagement shift'} — monitor CX indicators during any real rollout.`,
    operationalImpact: `${departments.join(', ')} carry primary load · 30–90 day transition · no real workflows execute in lab sandbox.`,
    departmentImpact: departments,
    riskAssessment: [
      'Simulation estimates only — not guaranteed outcomes',
      ...councilReview.risks.slice(0, 3),
    ],
    confidenceScore,
    requiredResources: buildResources(parsed.simulationType, parsed.magnitude),
    suggestedImprovements: buildImprovements(profile, confidenceScore),
    alternativeStrategies: buildAlternatives(parsed.simulationType),
    councilReview,
    intelligenceSourcesUsed: profile.syncedSources.slice(0, 7),
  };

  const libraryEntry: ScenarioLibraryEntry = {
    id: `scenario-${reportId}`,
    scenario: parsed.title,
    simulationType: parsed.simulationType,
    date: report.runAt,
    decision: 'pending',
    outcome: report.executiveSummary.slice(0, 200),
    lessonsLearned: [],
    reportId,
    confidenceScore,
  };

  return { report, libraryEntry };
}

export function listSuggestedLabSimulations(_profile: OrganizationSimulationLabProfile): string[] {
  return [
    'Simulate a 20% marketing campaign increase over next quarter',
    'Model hiring three operations staff next year',
    'Test launching a new knowledge product to existing customers',
    'Forecast revenue if we expand subscription tiers',
    'Simulate geographic expansion into a new state',
  ];
}

export function updateScenarioLibraryDecision(
  entry: ScenarioLibraryEntry,
  decision: ScenarioLibraryEntry['decision'],
  actualResults?: string,
  lessonsLearned?: string[]
): ScenarioLibraryEntry {
  return {
    ...entry,
    decision,
    actualResults: actualResults ?? entry.actualResults,
    lessonsLearned: lessonsLearned ?? entry.lessonsLearned,
  };
}
