import { TWIN_SCENARIO_LABELS, TWIN_TEST_CATEGORY_LABELS } from './constants';
import type {
  OrganizationDigitalTwinProfile,
  TwinRiskLevel,
  TwinScenarioType,
  TwinTestCategory,
  WhatIfSimulationResult,
} from './types';

type ParsedScenario = {
  scenarioType: TwinScenarioType;
  testCategory?: TwinTestCategory;
  subject: string;
  magnitude: number;
  magnitudeLabel: string;
};

function extractNumber(text: string, fallback = 1): number {
  const match = text.match(/(\d+)\s*%/);
  if (match) return Math.max(1, Math.round(Number(match[1]) / 10));
  const count = text.match(/(\d+)\s+(dispatchers|employees|staff|people|hires|concierges|executives|customers|users)/i);
  if (count) return Math.max(1, Number(count[1]));
  if (/double|twice|2x/i.test(text)) return 2;
  if (/triple|3x/i.test(text)) return 3;
  if (/500|five hundred/i.test(text)) return 500;
  return fallback;
}

function extractSubject(text: string): string {
  const market = text.match(/(?:into|in|expand to|enter)\s+([A-Za-z\s]+?)(?:\?|$|\.)/i);
  if (market) return market[1].trim();
  const pack = text.match(/(?:add|install)\s+([A-Za-z\s]+?)(?:\?|$|\.|pack)/i);
  if (pack) return pack[1].trim();
  const role = text.match(/(?:hire|adding)\s+(?:two\s+)?([a-z\s]+?)(?:\?|$|\.)/i);
  if (role) return role[1].trim();
  const integration = text.match(/(?:if|when)\s+([A-Za-z]+)\s+disconnect/i);
  if (integration) return integration[1].trim();
  const model = text.match(/(?:model|ai)\s+([A-Za-z0-9\s]+?)(?:\s+is|\s+replaced|\?|$)/i);
  if (model) return model[1].trim();
  return 'organization';
}

export function parseWhatIfQuery(query: string): ParsedScenario {
  const lower = query.toLowerCase();
  const magnitude = extractNumber(lower);
  const subject = extractSubject(query);

  if (/remove.*approval|skip.*approval|without approval/i.test(lower)) {
    return { scenarioType: 'remove-approval-step', testCategory: 'workflow-improvements', subject, magnitude, magnitudeLabel: 'approval step removed' };
  }
  if (/disconnect|instagram|integration.*fail|oauth.*expir|webhook.*404/i.test(lower)) {
    return { scenarioType: 'integration-disconnect', testCategory: 'new-automations', subject: subject || 'Instagram', magnitude, magnitudeLabel: `${subject || 'integration'} disconnect` };
  }
  if (/replace.*model|ai model|model a|switch.*llm|gpt|claude/i.test(lower)) {
    return { scenarioType: 'ai-model-replacement', testCategory: 'ai-models', subject, magnitude, magnitudeLabel: `AI model → ${subject}` };
  }
  if (/payroll.*double|double.*payroll|payroll.*increase|2x.*payroll/i.test(lower)) {
    return { scenarioType: 'payroll-change', testCategory: 'business-rules', subject: 'payroll', magnitude: 2, magnitudeLabel: 'payroll doubles' };
  }
  if (/500 customers|traffic surge|customers arrive|load test|spike/i.test(lower)) {
    return { scenarioType: 'traffic-surge', testCategory: 'scheduling-logic', subject: 'customer traffic', magnitude: extractNumber(lower, 500), magnitudeLabel: `${extractNumber(lower, 500)} customers` };
  }
  if (/permission|role.*change|access.*update/i.test(lower)) {
    return { scenarioType: 'permission-change', testCategory: 'permission-updates', subject, magnitude, magnitudeLabel: 'permission update' };
  }
  if (/prompt.*revision|update.*prompt|prompt.*change/i.test(lower)) {
    return { scenarioType: 'prompt-revision', testCategory: 'prompt-revisions', subject, magnitude, magnitudeLabel: 'prompt revision' };
  }
  if (/ui.*redesign|redesign.*screen|interface.*change/i.test(lower)) {
    return { scenarioType: 'ui-redesign', testCategory: 'ui-redesigns', subject, magnitude, magnitudeLabel: 'UI redesign' };
  }
  if (/scheduling|appointment.*logic|booking.*rule/i.test(lower)) {
    return { scenarioType: 'scheduling-change', testCategory: 'scheduling-logic', subject, magnitude, magnitudeLabel: 'scheduling change' };
  }
  if (/brain.*update|profession brain|instruction.*change/i.test(lower)) {
    return { scenarioType: 'brain-update', testCategory: 'profession-brain-updates', subject, magnitude, magnitudeLabel: 'brain update' };
  }
  if (/workflow.*improve|optimize.*workflow|remove.*step/i.test(lower)) {
    return { scenarioType: 'workflow-improvement', testCategory: 'workflow-improvements', subject, magnitude, magnitudeLabel: 'workflow improvement' };
  }
  if (/marketplace.*change|listing.*update|marketplace.*submission/i.test(lower)) {
    return { scenarioType: 'operational-change', testCategory: 'marketplace-changes', subject, magnitude, magnitudeLabel: 'marketplace change' };
  }
  if (/new automation|automation.*change/i.test(lower)) {
    return { scenarioType: 'operational-change', testCategory: 'new-automations', subject, magnitude, magnitudeLabel: 'automation change' };
  }
  if (/price|pricing/i.test(lower) && /increase|raise/i.test(lower)) {
    return { scenarioType: 'increase-prices', testCategory: 'pricing-strategies', subject, magnitude: extractNumber(lower, 10), magnitudeLabel: `${extractNumber(lower, 10)}% increase` };
  }
  if (/price|pricing/i.test(lower) && /reduce|lower|discount/i.test(lower)) {
    return { scenarioType: 'reduce-prices', testCategory: 'pricing-strategies', subject, magnitude: extractNumber(lower, 10), magnitudeLabel: `${extractNumber(lower, 10)}% reduction` };
  }
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
    return { scenarioType: 'operational-change', testCategory: 'workflow-improvements', subject, magnitude, magnitudeLabel: subject };
  }

  return { scenarioType: 'operational-change', subject: 'general change', magnitude: 1, magnitudeLabel: 'exploratory' };
}

function pickAffectedDepartments(
  profile: OrganizationDigitalTwinProfile,
  scenarioType: TwinScenarioType
): string[] {
  const depts = profile.snapshot.departments.map((d) => d.name);
  if (scenarioType === 'traffic-surge') return ['Customer Experience', 'Operations', 'Production'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'integration-disconnect') return ['Operations', 'Marketing', 'Finance'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'ai-model-replacement') return ['Leadership', 'Operations', 'Customer Experience'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'remove-approval-step') return ['Operations', 'Finance', 'Leadership'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'permission-change') return ['Leadership', 'Operations'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'payroll-change') return ['Finance', 'Operations', 'Leadership'].filter((d) => depts.includes(d) || true);
  if (scenarioType === 'hire-employees') return depts.filter((d) => /operations|production|customer/i.test(d)).slice(0, 3) || depts.slice(0, 2);
  if (scenarioType === 'marketing-campaign') return depts.filter((d) => /marketing|customer/i.test(d)).slice(0, 2) || ['Marketing'];
  if (scenarioType === 'enter-market') return ['Operations', 'Marketing', 'Customer Experience'].filter((d) => depts.includes(d) || true).slice(0, 3);
  if (scenarioType === 'add-digital-staff' || scenarioType === 'remove-digital-staff') return depts.slice(0, 3);
  if (scenarioType === 'increase-prices' || scenarioType === 'reduce-prices') return ['Finance', 'Customer Experience', 'Marketing'].filter((d) => depts.includes(d) || true);
  return depts.slice(0, 3);
}

function computeConfidence(profile: OrganizationDigitalTwinProfile, scenarioType: TwinScenarioType): number {
  let base = profile.twinFidelityScore - 8;
  if (profile.snapshot.memoryEntries > 10) base += 5;
  if (profile.snapshot.wisdomEntries > 5) base += 4;
  if (profile.sandboxReplicas.length >= 10) base += 3;
  if (['enter-market', 'launch-product', 'install-department-pack', 'traffic-surge'].includes(scenarioType)) base -= 8;
  if (['operational-change', 'hire-employees', 'workflow-improvement', 'remove-approval-step'].includes(scenarioType)) base += 3;
  return Math.max(52, Math.min(94, Math.round(base)));
}

function computeRiskLevel(scenarioType: TwinScenarioType, confidence: number): TwinRiskLevel {
  if (['remove-approval-step', 'permission-change', 'integration-disconnect', 'payroll-change'].includes(scenarioType)) {
    return confidence >= 80 ? 'high' : 'critical';
  }
  if (['traffic-surge', 'ai-model-replacement', 'brain-update'].includes(scenarioType)) return 'high';
  if (['enter-market', 'launch-product', 'install-department-pack'].includes(scenarioType)) return 'medium';
  return confidence >= 85 ? 'low' : 'medium';
}

function buildExpectedOutcome(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile): string {
  const { scenarioType, magnitude, magnitudeLabel, subject } = parsed;
  const health = profile.snapshot.executiveHealthScore;

  switch (scenarioType) {
    case 'remove-approval-step':
      return `Removing approval step reduces cycle time ~${magnitude * 18}% but increases unauthorized action risk. Sandbox shows ${health > 75 ? 'manageable' : 'elevated'} governance gap.`;
    case 'integration-disconnect':
      return `${subject} disconnect stops event sync within minutes · revenue reporting stale · customer notifications may fail in production without this test.`;
    case 'ai-model-replacement':
      return `Replacing with ${subject} changes response tone · latency · and compliance boundaries. Sandbox Profession Brains™ show ${magnitude * 5}% output variance.`;
    case 'payroll-change':
      return `Payroll doubling increases monthly burn ~${magnitude * 45}% · runway compression unless revenue follows within 2 quarters.`;
    case 'traffic-surge':
      return `${magnitudeLabel} arriving simultaneously stress booking · support · and automations. Sandbox predicts ${Math.min(99, magnitude / 5)}% queue saturation without scaling.`;
    case 'workflow-improvement':
      return `Workflow improvement (${magnitudeLabel}) projects efficiency +${magnitude * 9}% after 30-day adoption in sandbox.`;
    case 'brain-update':
      return `Profession Brain update (${magnitudeLabel}) may shift AI advice boundaries · test in sandbox before Studio Intelligence recommends to production.`;
    case 'permission-change':
      return `Permission update affects ${magnitude} role(s) · sandbox detects Policy Engine alignment before production rollout.`;
    case 'prompt-revision':
      return `Prompt revision changes AI behavior in ${magnitude} registered prompts · hallucination risk monitored in sandbox.`;
    case 'ui-redesign':
      return `UI redesign (${magnitudeLabel}) projects completion time change ±${magnitude * 8}% · accessibility checked in sandbox customers journey.`;
    case 'scheduling-change':
      return `Scheduling logic change affects booking density +${magnitude * 6}% · double-booking risk tested with sandbox employees.`;
    case 'hire-employees':
      return `Adding ${magnitudeLabel} increases capacity ~${magnitude * 12}% · payroll +${magnitude * 8}%. Health ${health}% supports ${health > 70 ? 'moderate' : 'careful'} expansion.`;
    case 'increase-prices':
      return `${magnitudeLabel} improves margin +${magnitude * 0.8}% · conversion may drop ~${Math.round(magnitude * 0.4)}%.`;
    case 'marketing-campaign':
      return `${magnitudeLabel} projects reach +${magnitude * 2}% · lead flow +${Math.round(magnitude * 1.5)}%.`;
    default:
      return `Exploratory simulation across ${profile.sandboxReplicas.length} sandbox replicas · ${profile.twinFidelityScore}% twin fidelity.`;
  }
}

function buildUnexpectedSideEffects(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile): string[] {
  const effects: string[] = [];
  if (parsed.scenarioType === 'remove-approval-step') {
    effects.push('Finance team loses audit checkpoint visibility');
    effects.push('Downstream automations may fire without human review');
  }
  if (parsed.scenarioType === 'integration-disconnect') {
    effects.push('Marketing attribution gaps in sandbox analytics');
    effects.push('Customer onboarding emails queue indefinitely');
  }
  if (parsed.scenarioType === 'ai-model-replacement') {
    effects.push('Expert Marketplace responses may diverge from Professional Trust Framework');
    effects.push('Knowledge Confidence scores drop until re-calibration');
  }
  if (parsed.scenarioType === 'traffic-surge') {
    effects.push('Support concierge queue exceeds SLA in sandbox');
    effects.push('Payment gateway rate limits triggered under load');
  }
  if (parsed.scenarioType === 'payroll-change') {
    effects.push('Founder cognitive load increases from hiring coordination');
  }
  if (profile.snapshot.pulseScore < 70) {
    effects.push('Organization pulse below optimal amplifies transition friction');
  }
  if (effects.length === 0) {
    effects.push('No major unexpected side effects detected in sandbox — monitor post-deployment');
  }
  return effects.slice(0, 4);
}

function buildRollbackPlan(parsed: ParsedScenario): string {
  switch (parsed.scenarioType) {
    case 'remove-approval-step':
      return 'Re-enable approval node in Workflow Engine · restore Policy Engine gate · notify affected departments within 1 hour.';
    case 'integration-disconnect':
      return 'Re-register OAuth token · replay missed webhook events from sandbox log · verify customer notification queue.';
    case 'ai-model-replacement':
      return 'Revert Prompt Registry to previous model binding · re-run Knowledge Confidence assessment · audit last 50 AI responses.';
    case 'permission-change':
      return 'Restore Permission Engine snapshot from pre-change backup · run QA Inspector permission conflict scan.';
    case 'traffic-surge':
      return 'Enable queue throttling · scale sandbox-automations capacity · revert scheduling logic if saturation persists.';
    default:
      return 'Restore previous configuration from Digital Twin pre-simulation snapshot · run QA Simulation Engine verification · founder approval before retry.';
  }
}

function buildPredictedImpact(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile): string {
  return buildExpectedOutcome(parsed, profile);
}

function buildRevenueImplications(parsed: ParsedScenario, confidence: number): string {
  const { scenarioType, magnitude } = parsed;
  const sign = ['reduce-prices', 'remove-digital-staff', 'integration-disconnect'].includes(scenarioType) ? 'pressure' : 'opportunity';
  if (scenarioType === 'traffic-surge') return `Revenue opportunity +$${Math.round(magnitude * 0.8)}K–$${Math.round(magnitude * 2.4)}K if capacity holds (confidence ${confidence}%)`;
  if (scenarioType === 'integration-disconnect') return `Revenue reporting gap ~${magnitude * 3} days · billing sync ${sign} until restored`;
  return `Revenue ${sign} ±${magnitude * 5}%–${magnitude * 12}% (confidence ${confidence}%) — sandbox estimate only.`;
}

function buildOperationalImpact(_parsed: ParsedScenario, affected: string[]): string {
  return `${affected.join(', ')} absorb primary load. Sandbox only — no production workflows execute.`;
}

function buildRisks(parsed: ParsedScenario, profile: OrganizationDigitalTwinProfile, riskLevel: TwinRiskLevel): string[] {
  const risks: string[] = [`Risk level: ${riskLevel.toUpperCase()}`, 'Sandbox only — outcomes are estimates, not guarantees'];
  if (profile.snapshot.pulseScore < 70) risks.push('Organization pulse below optimal — consider timing');
  if (parsed.scenarioType === 'remove-approval-step') risks.push('Compliance and audit trail gaps without approval checkpoint');
  if (parsed.scenarioType === 'integration-disconnect') risks.push('Silent data drift · customer experience degradation');
  if (parsed.scenarioType === 'traffic-surge') risks.push('Infrastructure saturation · SLA breach · drop-off spike');
  return risks.slice(0, 5);
}

function buildNextSteps(parsed: ParsedScenario, confidence: number): string[] {
  const steps = [
    'Review full simulation in Digital Twin workspace — no real changes made',
    `Confidence ${confidence}% — ${confidence >= 80 ? 'strong sandbox basis' : 'run additional twin tests before recommending'}`,
  ];
  if (parsed.testCategory) {
    steps.push(`Test category: ${TWIN_TEST_CATEGORY_LABELS[parsed.testCategory]} — verify in QA Simulation Engine before production`);
  }
  if (confidence >= 75) steps.push('Studio Intelligence may recommend after twin validation — founder retains final authority');
  steps.push('Practice before perform — no major change without Digital Twin test');
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
    `Risk Level: ${result.riskLevel.toUpperCase()} · Confidence: ${result.confidenceLevel}%`,
    `Expected Outcome: ${result.expectedOutcome.slice(0, 200)}`,
    `Departments: ${result.affectedDepartments.join(', ')}`,
    `Unexpected: ${result.unexpectedSideEffects[0] ?? 'None detected'}`,
    `Rollback: ${result.rollbackPlan.slice(0, 120)}`,
    `Next Step: ${result.recommendedNextSteps[0]}`,
    ``,
    `⚠ SANDBOX — Studio OS practices before it performs. No production impact.`,
  ].join('\n');
}

export function runWhatIfSimulation(
  profile: OrganizationDigitalTwinProfile,
  query: string
): WhatIfSimulationResult {
  const parsed = parseWhatIfQuery(query);
  const affectedDepartments = pickAffectedDepartments(profile, parsed.scenarioType);
  const confidenceLevel = computeConfidence(profile, parsed.scenarioType);
  const riskLevel = computeRiskLevel(parsed.scenarioType, confidenceLevel);
  const expectedOutcome = buildExpectedOutcome(parsed, profile);
  const unexpectedSideEffects = buildUnexpectedSideEffects(parsed, profile);
  const rollbackPlan = buildRollbackPlan(parsed);
  const productionGateRequired = ['high', 'critical'].includes(riskLevel) || confidenceLevel < 75;

  const partial: Omit<WhatIfSimulationResult, 'executiveBriefing'> = {
    id: `sim-${profile.organizationId}-${Date.now()}`,
    organizationId: profile.organizationId,
    query: query.trim(),
    scenarioType: parsed.scenarioType,
    scenarioLabel: TWIN_SCENARIO_LABELS[parsed.scenarioType],
    testCategory: parsed.testCategory,
    runAt: new Date().toISOString(),
    sandbox: true,
    riskLevel,
    confidenceLevel,
    affectedDepartments,
    expectedOutcome,
    unexpectedSideEffects,
    rollbackPlan,
    predictedImpact: buildPredictedImpact(parsed, profile),
    departmentsAffected: affectedDepartments,
    revenueImplications: buildRevenueImplications(parsed, confidenceLevel),
    operationalImpact: buildOperationalImpact(parsed, affectedDepartments),
    risks: buildRisks(parsed, profile, riskLevel),
    recommendedNextSteps: buildNextSteps(parsed, confidenceLevel),
    intelligenceSourcesUsed: profile.syncedSources.slice(0, 8),
    productionGateRequired,
  };

  return {
    ...partial,
    executiveBriefing: buildExecutiveBriefing(query, parsed, partial),
  };
}

export function listSuggestedWhatIfScenarios(profile: OrganizationDigitalTwinProfile): string[] {
  const dept = profile.snapshot.departments[0]?.name ?? 'Operations';
  return [
    'What happens if we remove this approval step?',
    'What happens if Instagram disconnects?',
    'What happens if AI Model A is replaced?',
    'What happens if payroll doubles?',
    'What happens if 500 customers arrive at once?',
    `What happens if we hire two ${dept.toLowerCase()} staff?`,
    'What happens if we automate bookkeeping?',
  ];
}

export function requiresTwinTestBeforeProduction(riskLevel: TwinRiskLevel): boolean {
  return riskLevel !== 'low';
}
