import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildAutomationDashboard, buildImprovementRecommendations } from './dashboard-engine';
import { buildSeedExecutionHistory } from './execution-history';
import { computeRegistrationCoveragePct, runAutomationGovernanceAudit } from './governance-engine';
import { getAllAutomations } from './registration';
import type { AutomationHealthMetric, OrganizationAutomationRegistryProfile } from './types';

export function buildDockRegistryLine(profile: OrganizationAutomationRegistryProfile): string {
  return `Automation Registry™ ${profile.registryScore}% — ${profile.totalAutomations} registered · ${profile.activeCount} active · ${profile.avgSuccessRatePct}% avg success · transparent automation.`;
}

function computeHealthMetrics(
  automations: ReturnType<typeof getAllAutomations>,
  coverage: number,
  avgSuccess: number,
  findings: ReturnType<typeof runAutomationGovernanceAudit>
): AutomationHealthMetric[] {
  const categories = new Set(automations.map((a) => a.category)).size;
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const critical = findings.filter((f) => f.severity === 'critical').length;

  return [
    {
      id: 'catalog',
      label: 'Automation Catalog',
      scorePct: Math.min(99, Math.round((automations.length / 20) * 100)),
      detail: `${automations.length} registered automations`,
      status: automations.length >= 18 ? 'healthy' : 'warning',
    },
    {
      id: 'registration',
      label: 'Registration Gate',
      scorePct: coverage,
      detail: `${coverage}% automations registered before execution`,
      status: coverage >= 95 ? 'healthy' : 'warning',
    },
    {
      id: 'categories',
      label: 'Category Coverage',
      scorePct: Math.min(99, Math.round((categories / 16) * 100)),
      detail: `${categories}/16 automation categories`,
      status: categories >= 12 ? 'healthy' : 'warning',
    },
    {
      id: 'success',
      label: 'Success Rate',
      scorePct: avgSuccess,
      detail: `${avgSuccess}% average success across automations`,
      status: avgSuccess >= 90 ? 'healthy' : avgSuccess >= 80 ? 'warning' : 'critical',
    },
    {
      id: 'active',
      label: 'Active Fleet',
      scorePct: Math.min(99, Math.round((automations.filter((a) => a.status === 'active').length / automations.length) * 100)),
      detail: `${automations.filter((a) => a.status === 'active').length} active automations`,
      status: 'healthy',
    },
    {
      id: 'execution-history',
      label: 'Execution History',
      scorePct: 94,
      detail: 'Permanent audit trail — who approved, how it performed',
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
      id: 'transparency',
      label: 'Transparency',
      scorePct: 96,
      detail: 'Visible · searchable · auditable · manageable',
      status: 'healthy',
    },
  ];
}

export function buildOrganizationAutomationRegistryProfile(
  organizationId: string
): OrganizationAutomationRegistryProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const automations = getAllAutomations();
  const categoryCounts: Record<string, number> = {};
  const governanceFindings = runAutomationGovernanceAudit();
  const coveragePct = computeRegistrationCoveragePct();
  const executionHistory = buildSeedExecutionHistory();

  for (const a of automations) {
    categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }

  const avgSuccessRatePct =
    automations.length === 0
      ? 0
      : Math.round(automations.reduce((s, a) => s + a.successRatePct, 0) / automations.length);

  const healthMetrics = computeHealthMetrics(automations, coveragePct, avgSuccessRatePct, governanceFindings);
  const registryScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationAutomationRegistryProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    registryScore,
    totalAutomations: automations.length,
    activeCount: automations.filter((a) => a.status === 'active').length,
    pausedCount: automations.filter((a) => a.status === 'paused').length,
    failedCount: automations.filter((a) => a.status === 'failed').length,
    pendingApprovalCount: automations.filter((a) => a.status === 'pending-approval').length,
    categoryCounts,
    automations,
    executionHistory,
    dashboardSections: buildAutomationDashboard(automations),
    recommendations: buildImprovementRecommendations(automations),
    governanceFindings,
    healthMetrics,
    avgSuccessRatePct,
    dockRegistryLine: '',
    transparentAutomation: true,
    lastSyncedAt: now,
  };

  profile.dockRegistryLine = buildDockRegistryLine(profile);
  return profile;
}

export function summarizeAutomationRegistry(profile: OrganizationAutomationRegistryProfile): string {
  const top = Object.entries(profile.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockRegistryLine} Categories: ${top}.`;
}
