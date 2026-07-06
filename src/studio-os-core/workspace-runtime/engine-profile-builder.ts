import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildRuntimeConfiguration, countModulesRequiringUpdate } from './configuration-engine';
import { runRuntimeGovernanceAudit } from './governance-engine';
import { buildRuntimeHealthMetrics, computeHealthDashboardScore } from './health-engine';
import { computeIsolationScorePct, runRuntimeIsolationAudit } from './isolation-engine';
import { buildRuntimeComponents } from './runtime-catalog';
import { buildSandboxStatuses } from './sandbox-engine';
import type { OrganizationWorkspaceRuntimeProfile, RuntimeImprovementRecommendation } from './types';

export function buildDockRuntimeLine(profile: OrganizationWorkspaceRuntimeProfile): string {
  return `Workspace Runtime™ ${profile.runtimeScore}% — ${profile.components.length} isolated components · ${profile.healthDashboardScore}% health · ${profile.isolationScorePct}% isolation.`;
}

function buildRecommendations(modulesUpdate: number): RuntimeImprovementRecommendation[] {
  const recs: RuntimeImprovementRecommendation[] = [];
  if (modulesUpdate > 0) {
    recs.push({
      id: 'module-updates',
      title: `${modulesUpdate} modules require sync updates`,
      detail: 'Complete sync chain through Workspace Runtime before production publish.',
      priority: 'high',
    });
  }
  recs.push(
    {
      id: 'sandbox-test',
      title: 'Run policy and automation tests in Testing sandbox',
      detail: 'Validate changes before preview and production deploy.',
      priority: 'medium',
    },
    {
      id: 'health-automation',
      title: 'Automation load elevated — review Automation Registry dashboard',
      detail: 'Consider pausing non-critical automations during peak hours.',
      priority: 'medium',
    },
    {
      id: 'isolation-audit',
      title: 'Quarterly runtime isolation audit scheduled',
      detail: 'Verify no cross-org data paths without Cross-Organization Intelligence authorization.',
      priority: 'low',
    }
  );
  return recs;
}

export function buildOrganizationWorkspaceRuntimeProfile(organizationId: string): OrganizationWorkspaceRuntimeProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const components = buildRuntimeComponents();
  const configuration = buildRuntimeConfiguration();
  const sandboxes = buildSandboxStatuses();
  const healthMetrics = buildRuntimeHealthMetrics();
  const healthDashboardScore = computeHealthDashboardScore(healthMetrics);
  const isolationFindings = [...runRuntimeIsolationAudit(organizationId), ...runRuntimeGovernanceAudit()];
  const isolationScorePct = computeIsolationScorePct();
  const modulesRequiringUpdate = countModulesRequiringUpdate();

  const runtimeScore = Math.min(
    99,
    Math.round((healthDashboardScore + isolationScorePct + (100 - modulesRequiringUpdate * 3)) / 3)
  );

  const profile: OrganizationWorkspaceRuntimeProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    runtimeScore,
    isolationScorePct,
    components,
    configuration,
    sandboxes,
    healthMetrics,
    healthDashboardScore,
    isolationFindings,
    recommendations: buildRecommendations(modulesRequiringUpdate),
    activeSandbox: 'production',
    modulesRequiringUpdate,
    dockRuntimeLine: '',
    independentHeadquarters: true,
    lastSyncedAt: now,
  };

  profile.dockRuntimeLine = buildDockRuntimeLine(profile);
  return profile;
}

export function summarizeWorkspaceRuntime(profile: OrganizationWorkspaceRuntimeProfile): string {
  return `${profile.dockRuntimeLine} Active: ${profile.activeSandbox}.`;
}
