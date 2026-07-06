import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { computeRegistrationCoveragePct, runPolicyGovernanceAudit } from './governance-engine';
import { buildPolicyHierarchy } from './hierarchy-engine';
import { buildSeedEnforcementHistory, computeComplianceRate } from './enforcement-engine';
import { buildSeedSimulationResults } from './simulation-engine';
import { getAllPolicies } from './registration';
import type { OrganizationPolicyEngineProfile, PolicyHealthMetric, PolicyImprovementRecommendation } from './types';

export function buildDockPolicyLine(profile: OrganizationPolicyEngineProfile): string {
  return `Policy Engine™ ${profile.engineScore}% — ${profile.totalPolicies} policies · ${profile.complianceRatePct}% compliance · organizational law enforced.`;
}

function buildImprovementRecommendations(
  policies: ReturnType<typeof getAllPolicies>
): PolicyImprovementRecommendation[] {
  const recs: PolicyImprovementRecommendation[] = [];

  const drafts = policies.filter((p) => p.status === 'draft');
  if (drafts.length > 0) {
    recs.push({
      id: 'simulate-drafts',
      title: `${drafts.length} draft policy(ies) — simulate before publishing`,
      detail: 'Run Policy Simulation to preview department and automation impact.',
      priority: 'high',
    });
  }

  recs.push({
    id: 'approval-review',
    title: 'Review approval workflow simulation — high impact on 28 employees',
    detail: 'Founder approval threshold change affects Operations, Finance, Marketing.',
    priority: 'medium',
  });

  recs.push({
    id: 'marketplace-verify',
    title: 'Enforce marketplace verification on blocked listing automation',
    detail: 'Recent enforcement pause — complete expertise verification.',
    priority: 'high',
  });

  recs.push({
    id: 'hierarchy-audit',
    title: 'Audit department policy extensions against organization rules',
    detail: 'Lower levels extend but never violate higher-level policies.',
    priority: 'low',
  });

  return recs;
}

function computeHealthMetrics(
  policies: ReturnType<typeof getAllPolicies>,
  coverage: number,
  compliance: number,
  findings: ReturnType<typeof runPolicyGovernanceAudit>
): PolicyHealthMetric[] {
  const categories = new Set(policies.map((p) => p.category)).size;
  const levels = new Set(policies.map((p) => p.level)).size;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const critical = findings.filter((f) => f.severity === 'critical').length;

  return [
    {
      id: 'catalog',
      label: 'Policy Catalog',
      scorePct: Math.min(99, Math.round((policies.length / 18) * 100)),
      detail: `${policies.length} centralized policies`,
      status: policies.length >= 16 ? 'healthy' : 'warning',
    },
    {
      id: 'registration',
      label: 'Registration Gate',
      scorePct: coverage,
      detail: `${coverage}% policies registered for enforcement`,
      status: coverage >= 95 ? 'healthy' : 'warning',
    },
    {
      id: 'hierarchy',
      label: 'Policy Hierarchy',
      scorePct: Math.min(99, Math.round((levels / 5) * 100)),
      detail: `${levels}/5 hierarchy layers active`,
      status: levels >= 4 ? 'healthy' : 'warning',
    },
    {
      id: 'categories',
      label: 'Category Coverage',
      scorePct: Math.min(99, Math.round((categories / 16) * 100)),
      detail: `${categories}/16 policy categories`,
      status: categories >= 12 ? 'healthy' : 'warning',
    },
    {
      id: 'compliance',
      label: 'Enforcement Compliance',
      scorePct: compliance,
      detail: `${compliance}% workflow compliance rate`,
      status: compliance >= 85 ? 'healthy' : compliance >= 70 ? 'warning' : 'critical',
    },
    {
      id: 'simulation',
      label: 'Policy Simulation',
      scorePct: 94,
      detail: 'Impact preview before publishing changes',
      status: 'healthy',
    },
    {
      id: 'governance',
      label: 'Registry Governance',
      scorePct: Math.max(0, 100 - warnings * 8 - critical * 15),
      detail: critical === 0 && warnings === 0 ? 'No governance violations' : `${critical} critical · ${warnings} warnings`,
      status: critical === 0 && warnings === 0 ? 'healthy' : warnings > 0 ? 'warning' : 'critical',
    },
    {
      id: 'centralization',
      label: 'Rule Centralization',
      scorePct: 97,
      detail: 'Define once — Concierge, automation, workflow, department follow automatically',
      status: 'healthy',
    },
  ];
}

export function buildOrganizationPolicyEngineProfile(organizationId: string): OrganizationPolicyEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const policies = getAllPolicies();
  const categoryCounts: Record<string, number> = {};
  const levelCounts: Record<string, number> = {};
  const governanceFindings = runPolicyGovernanceAudit();
  const coveragePct = computeRegistrationCoveragePct();
  const enforcementHistory = buildSeedEnforcementHistory();
  const simulationResults = buildSeedSimulationResults();
  const hierarchyLayers = buildPolicyHierarchy();

  for (const p of policies) {
    categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
    levelCounts[p.level] = (levelCounts[p.level] ?? 0) + 1;
  }

  const complianceRatePct = computeComplianceRate(enforcementHistory);
  const healthMetrics = computeHealthMetrics(policies, coveragePct, complianceRatePct, governanceFindings);
  const engineScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationPolicyEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    engineScore,
    totalPolicies: policies.length,
    activeCount: policies.filter((p) => p.status === 'active').length,
    draftCount: policies.filter((p) => p.status === 'draft').length,
    categoryCounts,
    levelCounts,
    policies,
    hierarchyLayers,
    enforcementHistory,
    simulationResults,
    recommendations: buildImprovementRecommendations(policies),
    governanceFindings,
    healthMetrics,
    complianceRatePct,
    dockPolicyLine: '',
    organizationalLaw: true,
    lastSyncedAt: now,
  };

  profile.dockPolicyLine = buildDockPolicyLine(profile);
  return profile;
}

export function summarizePolicyEngine(profile: OrganizationPolicyEngineProfile): string {
  const top = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockPolicyLine} Categories: ${top}.`;
}
