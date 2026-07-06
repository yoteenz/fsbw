import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import type { CategoryHealthScore, HealthCategoryId, HealthStatusLevel } from './types';
import { CRITICAL_AREA_THRESHOLD, WEAK_AREA_THRESHOLD } from './constants';

const CATEGORY_LABELS: Record<HealthCategoryId, string> = {
  leadership: 'Leadership',
  operations: 'Operations',
  marketing: 'Marketing',
  'customer-experience': 'Customer Experience',
  'knowledge-preservation': 'Knowledge Preservation',
  documentation: 'Documentation',
  automation: 'Automation',
  'employee-readiness': 'Employee Readiness',
  'financial-health': 'Financial Health',
  growth: 'Growth',
  innovation: 'Innovation',
  'succession-readiness': 'Succession Readiness',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function statusFromScore(score: number): HealthStatusLevel {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'healthy';
  if (score >= WEAK_AREA_THRESHOLD) return 'watch';
  if (score >= CRITICAL_AREA_THRESHOLD) return 'at-risk';
  return 'critical';
}

function category(
  id: HealthCategoryId,
  scorePct: number,
  signal: string,
  recommendation: string,
  sourceModules: string[],
  trend: CategoryHealthScore['trend'] = 'stable'
): CategoryHealthScore {
  const score = clamp(scorePct);
  return {
    id,
    label: CATEGORY_LABELS[id],
    scorePct: score,
    status: statusFromScore(score),
    signal,
    recommendation,
    sourceModules,
    trend,
  };
}

export function computeCategoryHealthScores(organizationId: string): CategoryHealthScore[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);

  const blueprintPct = blueprint?.overallProgressPct ?? 0;
  const brainMaturity = brain?.overallMaturityPct ?? 0;
  const genomePct = genome?.genomeCompletenessPct ?? 0;
  const memoryDepth = memory?.memoryDepthScore ?? 0;
  const trustScore = trust?.overallTrustScore ?? 0;
  const brainCount = brain?.brains.length ?? 0;

  const founderComplete = blueprint?.responses.some((r) => r.promptId === 'founder-only-you') ? 15 : 0;
  const decisionComplete = blueprint?.responses.some((r) => r.chapterId === 'decision-intelligence') ? 10 : 0;

  return [
    category(
      'leadership',
      40 + genomePct * 0.35 + founderComplete + decisionComplete,
      genome ? 'Leadership philosophy and decision DNA captured in Organization Genome.' : 'Founder and decision chapters incomplete.',
      genomePct < 60 ? 'Complete Blueprint founder and decision intelligence chapters.' : 'Maintain leadership alignment reviews quarterly.',
      ['organization-genome', 'business-discovery-blueprint'],
      genomePct >= 60 ? 'rising' : 'stable'
    ),
    category(
      'operations',
      35 + brainMaturity * 0.45 + (brainCount > 2 ? 10 : 0),
      brain ? `${brainCount} Profession Brains · ${brainMaturity}% maturity.` : 'Profession Brain not initialized.',
      brainMaturity < 50 ? 'Seed Profession Brains from Blueprint services.' : 'Document operational exceptions in living knowledge.',
      ['profession-brain', 'industry-architecture']
    ),
    category(
      'marketing',
      45 + blueprintPct * 0.25 + (memory?.records.filter((r) => r.type === 'campaign').length ?? 0) * 5,
      'Campaign memory and growth discovery inform marketing health.',
      'Archive campaign outcomes in Memory Engine before launching similar initiatives.',
      ['memory-engine', 'business-discovery-blueprint']
    ),
    category(
      'customer-experience',
      40 + (genome?.customerStandards.experienceStandards.length ?? 0) * 8 + trustScore * 0.2,
      genome ? genome.customerStandards.servicePromise.slice(0, 80) : 'Customer standards not yet defined.',
      'Align Concierge responses to Genome customer experience standards.',
      ['organization-genome', 'professional-trust-framework']
    ),
    category(
      'knowledge-preservation',
      30 + brainMaturity * 0.5 + memoryDepth * 0.2,
      `Brain maturity ${brainMaturity}% · Memory depth ${memoryDepth}%.`,
      'Profession Brain preserves expertise — sync living updates regularly.',
      ['profession-brain', 'memory-engine'],
      brainMaturity >= 50 ? 'rising' : 'stable'
    ),
    category(
      'documentation',
      25 + blueprintPct * 0.4 + (brain?.humanKnowledge.length ?? 0) * 3,
      `Blueprint ${blueprintPct}% · ${brain?.humanKnowledge.length ?? 0} human knowledge artifacts.`,
      blueprintPct < 50 ? 'Advance Business Discovery Blueprint documentation outputs.' : 'Publish SOPs from Profession Brain to Studio Institute.',
      ['business-discovery-blueprint', 'profession-brain', 'studio-institute']
    ),
    category(
      'automation',
      40 + (memory?.records.filter((r) => r.type === 'workflow-improvement').length ?? 0) * 8 + brainCount * 5,
      'Workflow improvements and Digital Staff coverage drive automation health.',
      'Document automation outcomes — Memory proves whether workflows actually worked.',
      ['memory-engine', 'profession-brain']
    ),
    category(
      'employee-readiness',
      35 + (brain?.academyModules.length ?? 0) * 6 + brainMaturity * 0.25,
      `${brain?.academyModules.length ?? 0} academy modules · Institute sync from Profession Brain.`,
      'Expand Studio Institute role paths from Profession Brain knowledge.',
      ['studio-institute', 'profession-brain']
    ),
    category(
      'financial-health',
      50 + blueprintPct * 0.15 + (trust ? 8 : 0),
      'Financial health includes sustainable operations — not revenue alone.',
      'Review monetization architecture alongside operational readiness.',
      ['monetization-architecture', 'business-discovery-blueprint']
    ),
    category(
      'growth',
      35 + blueprintPct * 0.3 + (genome?.identityCore.longTermObjectives.length ?? 0) * 5,
      genome ? `${genome.identityCore.longTermObjectives.length} long-term objectives captured.` : 'Growth vision pending in Blueprint.',
      'Align Expansion Center decisions with documented growth objectives.',
      ['business-discovery-blueprint', 'organization-genome', 'expansion-center']
    ),
    category(
      'innovation',
      40 + (memory?.records.filter((r) => r.type === 'experiment').length ?? 0) * 10 + brainMaturity * 0.15,
      `${memory?.records.filter((r) => r.type === 'experiment').length ?? 0} experiments in Memory Engine.`,
      'Record experiment outcomes — innovation health requires proof, not assumptions.',
      ['memory-engine', 'simulation-engine']
    ),
    category(
      'succession-readiness',
      35 + trustScore * 0.35 + memoryDepth * 0.2 + (brain?.legacyNote ? 10 : 0),
      trust ? `Trust score ${trustScore}% · legacy preservation active.` : 'Trust framework and legacy mode not fully established.',
      'Enable Profession Brain Legacy Mode and Trust Framework scope declarations.',
      ['professional-trust-framework', 'profession-brain', 'memory-engine'],
      trustScore >= 60 ? 'rising' : 'stable'
    ),
  ];
}

export function computeExecutiveHealthScore(categories: CategoryHealthScore[]): number {
  if (categories.length === 0) return 0;
  const sum = categories.reduce((s, c) => s + c.scorePct, 0);
  return clamp(sum / categories.length);
}

export { statusFromScore };
