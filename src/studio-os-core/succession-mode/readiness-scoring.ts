import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { ReadinessStatusLevel, SuccessionDimensionScore, SuccessionReadinessDimension } from './types';

const LABELS: Record<SuccessionReadinessDimension, string> = {
  'knowledge-preservation': 'Knowledge Preservation',
  'employee-readiness': 'Employee Readiness',
  documentation: 'Documentation',
  'profession-brain-coverage': 'Profession Brain Coverage',
  automation: 'Automation',
  'department-independence': 'Department Independence',
  'leadership-delegation': 'Leadership Delegation',
  'customer-continuity': 'Customer Continuity',
  'critical-process-coverage': 'Critical Process Coverage',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function statusFromScore(score: number): ReadinessStatusLevel {
  if (score >= 80) return 'strong';
  if (score >= 65) return 'developing';
  if (score >= 45) return 'vulnerable';
  return 'critical';
}

function dim(
  id: SuccessionReadinessDimension,
  scorePct: number,
  signal: string,
  improvesWhen: string
): SuccessionDimensionScore {
  const score = clamp(scorePct);
  return { id, label: LABELS[id], scorePct: score, status: statusFromScore(score), signal, improvesWhen };
}

export function computeSuccessionDimensionScores(organizationId: string): SuccessionDimensionScore[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const health = getOrganizationHealthIndexProfile(organizationId);

  const blueprintPct = blueprint?.overallProgressPct ?? 0;
  const brainMaturity = brain?.overallMaturityPct ?? 0;
  const memoryDepth = memory?.memoryDepthScore ?? 0;
  const brainCount = brain?.brains.length ?? 0;
  const hkCount = brain?.humanKnowledge.length ?? 0;
  const academyCount = brain?.academyModules.length ?? 0;
  const founderOnly = blueprint?.responses.find((r) => r.promptId === 'founder-only-you')?.answer ?? '';
  const delegation = genome?.decisionDna.approvalPreferences ?? 'founder-final';
  const successionHealth = health?.categoryScores.find((c) => c.id === 'succession-readiness')?.scorePct ?? 40;

  return [
    dim(
      'knowledge-preservation',
      30 + brainMaturity * 0.4 + memoryDepth * 0.25,
      `${brainCount} Profession Brains · ${memoryDepth}% memory depth.`,
      'Capture living knowledge in Profession Brain — not founder notebooks.'
    ),
    dim(
      'employee-readiness',
      35 + academyCount * 8 + hkCount * 4,
      `${academyCount} academy modules · ${hkCount} training artifacts.`,
      'Expand Studio Institute role paths from Profession Brain.'
    ),
    dim(
      'documentation',
      25 + blueprintPct * 0.45 + hkCount * 3,
      `Blueprint ${blueprintPct}% · ${hkCount} documented artifacts.`,
      'Complete Blueprint wisdom and decision chapters.'
    ),
    dim(
      'profession-brain-coverage',
      30 + brainCount * 10 + brainMaturity * 0.35,
      `${brainCount} brains at ${brainMaturity}% maturity.`,
      'Seed brains for every critical service area.'
    ),
    dim(
      'automation',
      40 + (memory?.records.filter((r) => r.type === 'workflow-improvement').length ?? 0) * 10,
      'Workflow improvements documented in Memory Engine.',
      'Automate repeatable processes — preserve judgment in Brain.'
    ),
    dim(
      'department-independence',
      45 + brainCount * 6 + (delegation !== 'founder-final' ? 15 : 0),
      delegation === 'founder-final' ? 'Departments still founder-dependent for approvals.' : `Approval style: ${delegation}.`,
      'Delegate department decisions with Trust Framework scope.'
    ),
    dim(
      'leadership-delegation',
      founderOnly.length > 30 ? 35 + (delegation !== 'founder-final' ? 25 : 5) : 50,
      founderOnly ? 'Founder-only tasks documented in Blueprint.' : 'Founder brain chapter incomplete.',
      'Document what only the founder does — then cross-train or automate.'
    ),
    dim(
      'customer-continuity',
      40 + (genome ? 20 : 0) + (brain?.publicSurfaces.length ?? 0) * 5,
      genome ? 'Customer standards in Organization Genome.' : 'Customer continuity standards pending.',
      'Ensure Concierge + Brain cover customer-facing decisions.'
    ),
    dim(
      'critical-process-coverage',
      35 + brainMaturity * 0.3 + successionHealth * 0.25,
      `Succession health index ${successionHealth}%.`,
      'Map critical processes to Profession Brain judgment patterns.'
    ),
  ];
}

export function computeOverallSuccessionReadiness(dimensions: SuccessionDimensionScore[]): number {
  if (dimensions.length === 0) return 0;
  return clamp(dimensions.reduce((s, d) => s + d.scorePct, 0) / dimensions.length);
}

export function estimateFounderDependencyPct(dimensions: SuccessionDimensionScore[], dependencyCount: number): number {
  const delegation = dimensions.find((d) => d.id === 'leadership-delegation')?.scorePct ?? 50;
  const dept = dimensions.find((d) => d.id === 'department-independence')?.scorePct ?? 50;
  const founderRisk = 100 - (delegation + dept) / 2;
  const uncapturedBoost = Math.min(30, dependencyCount * 5);
  return clamp(founderRisk + uncapturedBoost);
}

export { statusFromScore };
