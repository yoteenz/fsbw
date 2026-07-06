import { TWIN_SCENARIO_LABELS } from './constants';
import type {
  OrganizationDigitalTwinProfile,
  TwinScenarioType,
  WhatIfSimulationResult,
} from './types';

type ParsedScenario = {
  scenarioType: TwinScenarioType;
  subject: string;
  magnitude: number;
  magnitudeLabel: string;
};

function extractNumber(text: string, fallback = 1): number {
  const match = text.match(/(\d+)\s*%/);
  if (match) return Math.max(1, Math.round(Number(match[1]) / 10));
  const count = text.match(/(\d+)\s+(dispatchers|employees|staff|people|hires|concierges|executives)/i);
  if (count) return Math.max(1, Number(count[1]));
  if (/double|twice|2x/i.test(text)) return 2;
  if (/triple|3x/i.test(text)) return 3;
  return fallback;
}

function extractSubject(text: string): string {
  const market = text.match(/(?:into|in|expand to|enter)\s+([A-Za-z\s]+?)(?:\?|$|\.)/i);
  if (market) return market[1].trim();
  const pack = text.match(/(?:add|install)\s+([A-Za-z\s]+?)(?:\?|$|\.|pack)/i);
  if (pack) return pack[1].trim();
  const role = text.match(/(?:hire|adding)\s+(?:two\s+)?([a-z\s]+?)(?:\?|$|\.)/i);
  if (role) return role[1].trim();
  return 'organization';
}

export function parseWhatIfQuery(query: string): ParsedScenario {
  const lower = query.toLowerCase();
  const magnitude = extractNumber(lower);
  const subject = extractSubject(query);

  if (/hire|hiring|dispatcher|employee|headcount|double.*hiring/i.test(lower)) {
    return { scenarioType: 'hire-employees', subject, magnitude, magnitudeLabel: `${magnitude} hire(s)` };
  }
  if (/department pack|creator studio|install.*pack|add.*pack/i.test(lower)) {
    return { scenarioType: 'install-department-pack', subject, magnitude, magnitudeLabel: subject };
  }
  if (/expand.*department|new department|department expansion/i.test(lower)) {
    return { scenarioType: 'expand-departments', subject, magnitude, magnitudeLabel: `${magnitude} department(s)` };
  }
  if (/launch|new product|product launch/i.test(lower)) {
    return { scenarioType: 'launch-product', subject, magnitude, magnitudeLabel: subject };
  }
  if (/expand into|enter.*market|new market|texas|international/i.test(lower)) {
    return { scenarioType: 'enter-market', subject, magnitude, magnitudeLabel: subject };
  }
  if (/increase.*price|raise.*price|price increase/i.test(lower)) {
    return { scenarioType: 'increase-prices', subject, magnitude: extractNumber(lower, 10), magnitudeLabel: `${extractNumber(lower, 10)}% increase` };
  }
  if (/reduce.*price|lower.*price|discount|price cut/i.test(lower)) {
    return { scenarioType: 'reduce-prices', subject, magnitude: extractNumber(lower, 10), magnitudeLabel: `${extractNumber(lower, 10)}% reduction` };
  }
  if (/add.*digital|digital staff|new concierge|digital concierge/i.test(lower)) {
    return { scenarioType: 'add-digital-staff', subject, magnitude, magnitudeLabel: `${magnitude} digital staff` };
  }
  if (/remove.*digital|reduce.*staff|lay off.*concierge/i.test(lower)) {
    return { scenarioType: 'remove-digital-staff', subject, magnitude, magnitudeLabel: `${magnitude} removed` };
  }
  if (/marketing|campaign|ad spend|advertising|spend by/i.test(lower)) {
    const pct = lower.match(/(\d+)\s*%/)?.[1];
    return {
      scenarioType: 'marketing-campaign',
      subject,
      magnitude: pct ? Number(pct) : 20,
      magnitudeLabel: `${pct ?? 20}% spend change`,
    };
  }
  if (/automate|bookkeeping|operational|process change|workflow/i.test(lower)) {
    return { scenarioType: 'operational-change', subject, magnitude, magnitudeLabel: subject };
  }

  return { scenarioType: 'operational-change', subject: 'general change', magnitude: 1, magnitudeLabel: 'exploratory' };
}

function pickAffectedDepartments(
  profile: OrganizationDigitalTwinProfile,
  scenarioType: TwinScenarioType
): string[] {
  const depts = profile.snapshot.departments.map((d) => d.name);
  if (scenarioType === 'hire-employees') return depts.filter((d) => /operations|production|customer/i.test(d)).slice(0, 3) || depts.slice(0, 2);
  if (scenarioType === 'marketing-campaign') return depts.filter((d) => /marketing|customer/i.test(d)).slice(0, 2) || ['Marketing'];
  if (scenarioType === 'enter-market') return ['Operations', 'Marketing', 'Customer Experience'].filter((d) => depts.includes(d) || true).slice(0, 3);
  if (scenarioType === 'install-department-pack') return [extractSubjectFromType(scenarioType), ...depts.slice(0, 1)];
  if (scenarioType === 'add-digital-staff' || scenarioType === 'remove-digital-staff') return depts.slice(0, 3);
  if (scenarioType === 'increase-prices' || scenarioType === 'reduce-prices') return ['Finance', 'Customer Experience', 'Marketing'].filter((d) => depts.includes(d) || true);
  return depts.slice(0, 3);
}

function extractSubjectFromType(_type: TwinScenarioType): string {
  return 'New Department Pack';
}

function computeConfidence(profile: OrganizationDigitalTwinProfile, scenarioType: TwinScenarioType): number {
  let base = profile.twinFidelityScore - 8;
  if (profile.snapshot.memoryEntries > 10) base += 5;
  if (profile.snapshot.wisdomEntries > 5) base += 4;
  if (['enter-market', 'launch-product', 'install-department-pack'].includes(scenarioType)) base -= 8;
  if (['operational-change', 'hire-employees', 'marketing-campaign'].includes(scenarioType)) base += 3;
  return Math.max(52, Math.min(94, Math.round(base)));
}

function buildPredictedImpact(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile): string {
  const { scenarioType, magnitude, magnitudeLabel, subject } = parsed;
  const health = profile.snapshot.executiveHealthScore;
  const pulse = profile.snapshot.pulseScore;

  switch (scenarioType) {
    case 'hire-employees':
      return `Adding ${magnitudeLabel} increases operational capacity ~${magnitude * 12}% but raises monthly payroll ~${magnitude * 8}%. Current health ${health}% supports ${health > 70 ? 'moderate' : 'careful'} expansion.`;
    case 'expand-departments':
      return `Expanding by ${magnitudeLabel} adds coordination overhead ~${magnitude * 6}% while improving specialization. Pulse ${pulse}% suggests ${pulse > 75 ? 'capacity for growth' : 'staged expansion'}.`;
    case 'install-department-pack':
      return `Installing ${magnitudeLabel || subject} adds digital workforce capabilities. Estimated setup complexity moderate · operational lift +${magnitude * 15}% within 90 days in sandbox model.`;
    case 'launch-product':
      return `Product launch simulation projects initial revenue lift +${magnitude * 5}%–${magnitude * 12}% with ramp period 60–120 days. Marketing and CX departments carry primary load.`;
    case 'enter-market':
      return `Market entry into ${subject} projects revenue opportunity +${magnitude * 8}%–${magnitude * 18}% over 12 months with compliance and localization overhead.`;
    case 'increase-prices':
      return `${magnitudeLabel} may improve margin +${magnitude * 0.8}% but risks conversion drop ~${Math.round(magnitude * 0.4)}%. Historical intelligence suggests testing in sandbox before rollout.`;
    case 'reduce-prices':
      return `${magnitudeLabel} may boost volume +${magnitude * 1.2}% but compress margin ~${Math.round(magnitude * 0.9)}%. Monitor customer experience indicators closely.`;
    case 'add-digital-staff':
      return `Adding ${magnitudeLabel} increases automation potential +${magnitude * 10}% with Shadow Mode observation period before independent execution.`;
    case 'remove-digital-staff':
      return `Removing ${magnitudeLabel} reduces digital capacity ~${magnitude * 12}% · manual workload may increase on remaining teams.`;
    case 'marketing-campaign':
      return `${magnitudeLabel} projects reach +${magnitude * 2}% · lead flow +${Math.round(magnitude * 1.5)}% · ROI depends on conversion baseline from organizational memory.`;
    case 'operational-change':
      return `Operational change (${magnitudeLabel}) projects efficiency gain +${magnitude * 7}%–${magnitude * 14}% after transition period · temporary disruption possible in first 30 days.`;
    default:
      return `Exploratory simulation based on ${profile.snapshot.departmentCount} departments and ${profile.twinFidelityScore}% twin fidelity.`;
  }
}

function buildRevenueImplications(parsed: ParsedScenario, confidence: number): string {
  const { scenarioType, magnitude } = parsed;
  const sign = ['reduce-prices', 'remove-digital-staff'].includes(scenarioType) ? 'pressure' : 'opportunity';
  const range =
    scenarioType === 'enter-market'
      ? `+$${magnitude * 40}K–$${magnitude * 120}K annualized (sandbox estimate)`
      : scenarioType === 'marketing-campaign'
      ? `+$${magnitude * 8}K–$${magnitude * 25}K over 90 days`
      : scenarioType === 'increase-prices'
      ? `margin +${magnitude * 0.7}% · revenue ${sign} ±${magnitude}%`
      : `revenue ${sign} ±${magnitude * 5}%–${magnitude * 12}% (confidence ${confidence}%)`;
  return `${range} — not guaranteed; derived from organizational intelligence.`;
}

function buildOperationalImpact(_parsed: ParsedScenario, affected: string[]): string {
  return `${affected.join(', ')} absorb primary operational load. Transition period 30–90 days · no real workflows execute in sandbox.`;
}

function buildRisks(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile): string[] {
  const risks: string[] = ['Sandbox only — outcomes are estimates, not guarantees'];
  if (profile.snapshot.pulseScore < 70) risks.push('Organization pulse below optimal — consider timing');
  if (parsed.scenarioType === 'enter-market') risks.push('Market compliance · localization · competitive response unknown');
  if (parsed.scenarioType === 'hire-employees') risks.push('Onboarding capacity · payroll runway · training timeline');
  if (parsed.scenarioType === 'remove-digital-staff') risks.push('Knowledge loss · manual workload redistribution');
  if (parsed.scenarioType === 'operational-change') risks.push('Change management · temporary productivity dip');
  if (parsed.scenarioType === 'install-department-pack') risks.push('Integration complexity · founder approval for new digital staff');
  return risks.slice(0, 5);
}

function buildNextSteps(parsed: ParsedScenario, confidence: number): string[] {
  const steps = [
    'Review full simulation in Digital Twin workspace — no real changes made',
    `Confidence ${confidence}% — ${confidence >= 80 ? 'strong historical basis' : 'gather more organizational memory before acting'}`,
  ];
  if (parsed.scenarioType === 'hire-employees') steps.push('Model payroll impact in Simulation Engine before posting roles');
  if (parsed.scenarioType === 'enter-market') steps.push('Run Executive Council briefing on market entry risks');
  if (parsed.scenarioType === 'add-digital-staff') steps.push('Confirm Shadow Mode observation phases for new concierges');
  if (parsed.scenarioType === 'marketing-campaign') steps.push('Compare with past campaign memory before committing budget');
  steps.push('Founder retains final authority — twin explores, founder decides');
  return steps.slice(0, 5);
}

function buildExecutiveBriefing(
  query: string,
  parsed: ParsedScenario,
  result: Omit<WhatIfSimulationResult, 'executiveBriefing'>
): string {
  return [
    `DIGITAL TWIN™ EXECUTIVE BRIEFING (SANDBOX)`,
    `Query: "${query.slice(0, 120)}"`,
    `Scenario: ${TWIN_SCENARIO_LABELS[parsed.scenarioType]} · ${parsed.magnitudeLabel}`,
    ``,
    `Predicted Impact: ${result.predictedImpact.slice(0, 200)}`,
    `Departments Affected: ${result.departmentsAffected.join(', ')}`,
    `Revenue: ${result.revenueImplications.slice(0, 120)}`,
    `Operational: ${result.operationalImpact.slice(0, 120)}`,
    `Confidence: ${result.confidenceLevel}%`,
    `Top Risk: ${result.risks[1] ?? result.risks[0]}`,
    `Next Step: ${result.recommendedNextSteps[0]}`,
    ``,
    `⚠ SANDBOX — No real data changed. No workflows executed. No customers affected.`,
  ].join('\n');
}

export function runWhatIfSimulation(
  profile: OrganizationDigitalTwinProfile,
  query: string
): WhatIfSimulationResult {
  const parsed = parseWhatIfQuery(query);
  const departmentsAffected = pickAffectedDepartments(profile, parsed.scenarioType);
  const confidenceLevel = computeConfidence(profile, parsed.scenarioType);

  const partial: Omit<WhatIfSimulationResult, 'executiveBriefing'> = {
    id: `sim-${profile.organizationId}-${Date.now()}`,
    organizationId: profile.organizationId,
    query: query.trim(),
    scenarioType: parsed.scenarioType,
    scenarioLabel: TWIN_SCENARIO_LABELS[parsed.scenarioType],
    runAt: new Date().toISOString(),
    sandbox: true,
    predictedImpact: buildPredictedImpact(parsed, profile),
    departmentsAffected,
    revenueImplications: buildRevenueImplications(parsed, confidenceLevel),
    operationalImpact: buildOperationalImpact(parsed, departmentsAffected),
    risks: buildRisks(parsed, profile),
    confidenceLevel,
    recommendedNextSteps: buildNextSteps(parsed, confidenceLevel),
    intelligenceSourcesUsed: profile.syncedSources.slice(0, 6),
  };

  return {
    ...partial,
    executiveBriefing: buildExecutiveBriefing(query, parsed, partial),
  };
}

export function listSuggestedWhatIfScenarios(profile: OrganizationDigitalTwinProfile): string[] {
  const dept = profile.snapshot.departments[0]?.name ?? 'Operations';
  return [
    `What happens if we hire two ${dept.toLowerCase()} staff?`,
    'What happens if we automate bookkeeping?',
    'What happens if we expand into a new market?',
    'What happens if we increase marketing spend by 20%?',
    'What happens if we add a new Department Pack?',
  ];
}
