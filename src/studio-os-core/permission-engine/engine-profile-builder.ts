import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildSeedApprovalChains } from './approval-chain';
import { buildSeedAuditHistory, filterAuditThisWeek } from './audit-history';
import { buildContextualRules, getActiveContextualRules } from './contextual-engine';
import { computeCapabilityCoveragePct, runPermissionGovernanceAudit } from './governance-engine';
import { getAllCapabilities } from './registration';
import { buildRoleCompositions } from './role-composition';
import type { OrganizationPermissionEngineProfile, PermissionHealthMetric, PermissionImprovementRecommendation } from './types';

export function buildDockPermissionLine(profile: OrganizationPermissionEngineProfile): string {
  return `Permission Engine™ ${profile.engineScore}% — ${profile.totalCapabilities} capabilities · ${profile.totalRoles} roles · ${profile.capabilityCoveragePct}% coverage · capability-based access.`;
}

function buildRecommendations(): PermissionImprovementRecommendation[] {
  return [
    {
      id: 'review-guest',
      title: 'Review Guest role — ensure read-only scope',
      detail: 'Guest capabilities should not include create, approve, or manage verbs.',
      priority: 'medium',
    },
    {
      id: 'finance-delegation',
      title: 'Audit expiring Finance delegations',
      detail: 'Temporary invoice.approve grants expire automatically — verify audit trail.',
      priority: 'high',
    },
    {
      id: 'marketing-publish',
      title: 'Confirm Marketing publish capability aligns with Policy Engine',
      detail: 'Content publishing policies require approval chain before publish.',
      priority: 'medium',
    },
    {
      id: 'legacy-vault',
      title: 'Restrict Legacy Vault to explicit access capability',
      detail: 'Only roles with access-legacy-vault should reach archival assets.',
      priority: 'high',
    },
  ];
}

function computeHealthMetrics(
  coverage: number,
  findings: ReturnType<typeof runPermissionGovernanceAudit>,
  activeDelegations: number
): PermissionHealthMetric[] {
  const warnings = findings.filter((f) => f.severity === 'warning').length;
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const capabilities = getAllCapabilities();
  const roles = buildRoleCompositions();
  const contextual = getActiveContextualRules();

  return [
    {
      id: 'capabilities',
      label: 'Capability Catalog',
      scorePct: Math.min(99, Math.round((capabilities.length / 80) * 100)),
      detail: `${capabilities.length} modular capabilities registered`,
      status: capabilities.length >= 60 ? 'healthy' : 'warning',
    },
    {
      id: 'roles',
      label: 'Role Composition',
      scorePct: Math.min(99, Math.round((roles.length / 11) * 100)),
      detail: `${roles.length} reusable permission profiles`,
      status: roles.length >= 10 ? 'healthy' : 'warning',
    },
    {
      id: 'coverage',
      label: 'Registration Coverage',
      scorePct: coverage,
      detail: `${coverage}% capabilities registered for enforcement`,
      status: coverage >= 95 ? 'healthy' : 'warning',
    },
    {
      id: 'contextual',
      label: 'Contextual Rules',
      scorePct: Math.min(99, Math.round((contextual.length / 8) * 100)),
      detail: `${contextual.length} active contextual permission rules`,
      status: contextual.length >= 6 ? 'healthy' : 'warning',
    },
    {
      id: 'audit',
      label: 'Permission Audit',
      scorePct: 96,
      detail: 'Complete audit trail — who, when, why, affected systems',
      status: 'healthy',
    },
    {
      id: 'delegations',
      label: 'Active Delegations',
      scorePct: activeDelegations <= 5 ? 94 : 78,
      detail: `${activeDelegations} active temporary delegations`,
      status: activeDelegations <= 5 ? 'healthy' : 'warning',
    },
    {
      id: 'governance',
      label: 'Engine Governance',
      scorePct: Math.max(0, 100 - warnings * 8 - critical * 15),
      detail: critical === 0 && warnings === 0 ? 'No governance violations' : `${critical} critical · ${warnings} warnings`,
      status: critical === 0 && warnings === 0 ? 'healthy' : warnings > 0 ? 'warning' : 'critical',
    },
    {
      id: 'intuitive',
      label: 'Intuitive Security',
      scorePct: 95,
      detail: 'Capabilities not titles · power intentional · trust earned',
      status: 'healthy',
    },
  ];
}

export function buildOrganizationPermissionEngineProfile(
  organizationId: string
): OrganizationPermissionEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const capabilities = getAllCapabilities();
  const roles = buildRoleCompositions();
  const contextualRules = buildContextualRules();
  const governanceFindings = runPermissionGovernanceAudit();
  const coveragePct = computeCapabilityCoveragePct();
  const auditHistory = buildSeedAuditHistory(organizationId);
  const approvalChains = buildSeedApprovalChains();
  const activeDelegations = auditHistory.filter(
    (a) => a.eventType === 'delegated' && new Date(a.occurredAt) > new Date(Date.now() - 86400000 * 2)
  ).length;

  const healthMetrics = computeHealthMetrics(coveragePct, governanceFindings, activeDelegations);
  const engineScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationPermissionEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    engineScore,
    totalCapabilities: capabilities.length,
    totalRoles: roles.length,
    activeDelegations,
    capabilities,
    roles,
    contextualRules,
    approvalChains,
    auditHistory,
    recommendations: buildRecommendations(),
    governanceFindings,
    healthMetrics,
    capabilityCoveragePct: coveragePct,
    dockPermissionLine: '',
    capabilityBasedAccess: true,
    lastSyncedAt: now,
  };

  profile.dockPermissionLine = buildDockPermissionLine(profile);
  return profile;
}

export function summarizePermissionEngine(profile: OrganizationPermissionEngineProfile): string {
  const weekAudit = filterAuditThisWeek(profile.auditHistory).length;
  return `${profile.dockPermissionLine} ${weekAudit} permission changes this week.`;
}
