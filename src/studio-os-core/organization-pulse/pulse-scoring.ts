import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationArchitectureProfile } from '../industry-architecture/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationSuccessionProfile } from '../succession-mode/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import { CRITICAL_PULSE_THRESHOLD, STRAINED_THRESHOLD } from './constants';
import type { PulseIndicatorId, PulseIndicatorScore, PulseState } from './types';

const INDICATOR_LABELS: Record<PulseIndicatorId, string> = {
  'customer-satisfaction': 'Customer Satisfaction',
  'employee-activity': 'Employee Activity',
  'founder-workload': 'Founder Workload',
  'department-activity': 'Department Activity',
  'project-velocity': 'Project Velocity',
  'revenue-momentum': 'Revenue Momentum',
  'marketing-performance': 'Marketing Performance',
  'operational-efficiency': 'Operational Efficiency',
  'knowledge-growth': 'Knowledge Growth',
  'learning-activity': 'Learning Activity',
  'automation-adoption': 'Automation Adoption',
  innovation: 'Innovation',
  'team-collaboration': 'Team Collaboration',
  'client-retention': 'Client Retention',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function pulseStateFromScore(score: number): PulseState {
  if (score >= 90) return 'thriving';
  if (score >= 80) return 'healthy';
  if (score >= 70) return 'growing';
  if (score >= 60) return 'stable';
  if (score >= STRAINED_THRESHOLD) return 'needs-attention';
  if (score >= CRITICAL_PULSE_THRESHOLD) return 'strained';
  return 'critical';
}

/** Founder workload is inverted — lower dependency = healthier pulse reading. */
function founderWorkloadScore(founderDependencyPct: number): number {
  return clamp(100 - founderDependencyPct);
}

function indicator(
  id: PulseIndicatorId,
  scorePct: number,
  signal: string,
  sourceModules: string[],
  trend: PulseIndicatorScore['trend'] = 'stable'
): PulseIndicatorScore {
  const score = clamp(scorePct);
  return {
    id,
    label: INDICATOR_LABELS[id],
    scorePct: score,
    state: pulseStateFromScore(score),
    signal,
    trend,
    sourceModules,
  };
}

export function computePulseIndicatorScores(organizationId: string): PulseIndicatorScore[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);
  const succession = getOrganizationSuccessionProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const arch = getOrganizationArchitectureProfile(organizationId);

  const blueprintPct = blueprint?.overallProgressPct ?? 0;
  const brainMaturity = brain?.overallMaturityPct ?? 0;
  const memoryDepth = memory?.memoryDepthScore ?? 0;
  const trustScore = trust?.overallTrustScore ?? 0;
  const founderDep = succession?.founderDependencyPct ?? 55;
  const packCount = arch?.installedPacks.length ?? 0;
  const deptCount = arch?.headquartersDepartments.length ?? 0;
  const campaignCount = memory?.records.filter((r) => r.type === 'campaign').length ?? 0;
  const experimentCount = memory?.records.filter((r) => r.type === 'experiment').length ?? 0;
  const workflowCount = memory?.records.filter((r) => r.type === 'workflow-improvement').length ?? 0;
  const cxHealth = health?.categoryScores.find((c) => c.id === 'customer-experience')?.scorePct ?? 50;
  const marketingHealth = health?.categoryScores.find((c) => c.id === 'marketing')?.scorePct ?? 50;
  const opsHealth = health?.categoryScores.find((c) => c.id === 'operations')?.scorePct ?? 50;

  return [
    indicator(
      'customer-satisfaction',
      35 + cxHealth * 0.45 + trustScore * 0.2,
      genome ? genome.customerStandards.servicePromise.slice(0, 80) : 'Customer experience standards pending in Genome.',
      ['organization-genome', 'company-health-index', 'professional-trust-framework'],
      cxHealth >= 70 ? 'accelerating' : cxHealth < 55 ? 'declining' : 'stable'
    ),
    indicator(
      'employee-activity',
      30 + (brain?.academyModules.length ?? 0) * 8 + brainMaturity * 0.35,
      `${brain?.academyModules.length ?? 0} academy modules · ${brainMaturity}% brain maturity.`,
      ['profession-brain', 'studio-institute'],
      brainMaturity >= 50 ? 'accelerating' : 'stable'
    ),
    indicator(
      'founder-workload',
      founderWorkloadScore(founderDep),
      succession
        ? `Founder dependency ${founderDep}% — ${succession.overallStatus} succession readiness.`
        : 'Succession Mode not synced — founder workload unknown.',
      ['succession-mode', 'profession-brain'],
      founderDep > 65 ? 'declining' : founderDep < 45 ? 'accelerating' : 'stable'
    ),
    indicator(
      'department-activity',
      25 + deptCount * 6 + packCount * 8,
      `${deptCount} departments · ${packCount} installed packs.`,
      ['industry-architecture', 'expansion-center'],
      packCount > 0 ? 'accelerating' : 'stable'
    ),
    indicator(
      'project-velocity',
      30 + blueprintPct * 0.35 + (memory?.records.filter((r) => r.type === 'project').length ?? 0) * 6,
      `Blueprint ${blueprintPct}% · project artifacts in Memory Engine.`,
      ['business-discovery-blueprint', 'memory-engine'],
      blueprintPct >= 50 ? 'accelerating' : blueprintPct < 30 ? 'slowing' : 'stable'
    ),
    indicator(
      'revenue-momentum',
      45 + blueprintPct * 0.2 + (health?.categoryScores.find((c) => c.id === 'financial-health')?.scorePct ?? 50) * 0.35,
      'Revenue momentum includes sustainable growth signals — not vanity metrics.',
      ['monetization-architecture', 'company-health-index', 'business-discovery-blueprint'],
      'stable'
    ),
    indicator(
      'marketing-performance',
      35 + marketingHealth * 0.5 + campaignCount * 5,
      `${campaignCount} campaigns archived · marketing health ${marketingHealth}%.`,
      ['memory-engine', 'company-health-index'],
      campaignCount >= 2 ? 'accelerating' : marketingHealth < 55 ? 'slowing' : 'stable'
    ),
    indicator(
      'operational-efficiency',
      30 + opsHealth * 0.55 + workflowCount * 4,
      `Operations health ${opsHealth}% · ${workflowCount} workflow improvements documented.`,
      ['company-health-index', 'memory-engine', 'profession-brain'],
      workflowCount >= 2 ? 'accelerating' : opsHealth < 55 ? 'declining' : 'stable'
    ),
    indicator(
      'knowledge-growth',
      25 + brainMaturity * 0.55 + memoryDepth * 0.25,
      `Brain maturity ${brainMaturity}% · memory depth ${memoryDepth}%.`,
      ['profession-brain', 'memory-engine'],
      brainMaturity >= 55 ? 'accelerating' : memoryDepth < 40 ? 'slowing' : 'stable'
    ),
    indicator(
      'learning-activity',
      30 + (brain?.academyModules.length ?? 0) * 7 + (brain?.humanKnowledge.length ?? 0) * 2,
      `${brain?.humanKnowledge.length ?? 0} human knowledge artifacts · Institute sync active.`,
      ['studio-institute', 'profession-brain'],
      (brain?.academyModules.length ?? 0) >= 2 ? 'accelerating' : 'stable'
    ),
    indicator(
      'automation-adoption',
      35 + workflowCount * 8 + (brain?.brains.length ?? 0) * 5,
      `${workflowCount} workflow improvements · ${brain?.brains.length ?? 0} Profession Brains.`,
      ['memory-engine', 'profession-brain'],
      workflowCount >= 1 ? 'accelerating' : 'slowing'
    ),
    indicator(
      'innovation',
      40 + experimentCount * 12 + brainMaturity * 0.15,
      `${experimentCount} experiments captured in organizational memory.`,
      ['memory-engine', 'simulation-engine'],
      experimentCount >= 1 ? 'accelerating' : 'stable'
    ),
    indicator(
      'team-collaboration',
      40 + (council?.meetingsHeld ?? 0) * 8 + (council?.councilHealthPct ?? 70) * 0.4,
      council
        ? `${council.meetingsHeld} council meetings · ${council.activeExecutives} digital executives.`
        : 'Executive Council collaborative leadership ready.',
      ['executive-council', 'concierge-layer'],
      (council?.meetingsHeld ?? 0) >= 1 ? 'accelerating' : 'stable'
    ),
    indicator(
      'client-retention',
      35 + trustScore * 0.4 + cxHealth * 0.35,
      trust ? `Trust ${trustScore}% · customer experience ${cxHealth}%.` : 'Trust framework establishing retention signals.',
      ['professional-trust-framework', 'relationship-engine', 'company-health-index'],
      trustScore >= 65 ? 'accelerating' : trustScore < 50 ? 'declining' : 'stable'
    ),
  ];
}

export function computeOverallPulseScore(indicators: PulseIndicatorScore[]): number {
  if (indicators.length === 0) return 0;
  return clamp(indicators.reduce((s, i) => s + i.scorePct, 0) / indicators.length);
}

export function describePulseFeeling(state: PulseState, score: number): string {
  const feelings: Record<PulseState, string> = {
    thriving: 'The organization is thriving — energy, alignment, and momentum are strong across departments.',
    healthy: 'The organization feels healthy — steady progress with room to accelerate intentionally.',
    growing: 'The organization is growing — positive signals outweigh friction, with clear expansion paths.',
    stable: 'The organization feels stable — fundamentals hold, but watch areas need proactive attention.',
    'needs-attention': 'The organization needs attention — early signals suggest intervention before strain.',
    strained: 'The organization feels strained — multiple indicators declining; prioritize founder workload and weak areas.',
    critical: 'The organization pulse is critical — immediate cross-functional review recommended.',
  };
  return `${feelings[state]} Overall pulse: ${score}%.`;
}
