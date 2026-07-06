import { getOrganizationWorkspaceRuntimeProfile } from '../workspace-runtime/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildPluginTypeCatalog } from './plugin-type-catalog';
import { countRegisteredCapabilities, buildSdkCapabilities } from './sdk-capabilities-engine';
import { runPluginGovernanceAudit, computeExtensibilityScorePct } from './governance-engine';
import {
  buildInstalledPlugins,
  buildMarketplaceTiers,
  countPluginsRequiringUpdate,
} from './marketplace-engine';
import { computeSandboxScorePct, runPluginSandboxAudit } from './sandbox-engine';
import type { OrganizationPluginSdkProfile, PluginImprovementRecommendation } from './types';

export function buildDockPlatformLine(profile: OrganizationPluginSdkProfile): string {
  return `Plugin SDK™ ${profile.platformScore}% — ${profile.activePluginCount} active plugins · ${profile.extensibilityScorePct}% extensible · sandbox ${profile.sandboxScorePct}%.`;
}

function buildRecommendations(updates: number): PluginImprovementRecommendation[] {
  const recs: PluginImprovementRecommendation[] = [];
  if (updates > 0) {
    recs.push({
      id: 'plugin-updates',
      title: `${updates} plugins have updates available`,
      detail: 'Review compatibility and changelog before updating in production runtime.',
      priority: 'high',
    });
  }
  recs.push(
    {
      id: 'sandbox-test',
      title: 'Test new plugins in Workspace Runtime testing sandbox',
      detail: 'Validate policy and permission compliance before marketplace publish.',
      priority: 'medium',
    },
    {
      id: 'manifest-audit',
      title: 'Audit plugin manifests for SDK capability declarations',
      detail: 'Every registration capability must be declared — undeclared access is blocked.',
      priority: 'medium',
    },
    {
      id: 'ecosystem',
      title: 'Explore community and official marketplace tiers',
      detail: 'Organizations choose which plugins to install — nothing auto-installs.',
      priority: 'low',
    }
  );
  return recs;
}

export function buildOrganizationPluginSdkProfile(organizationId: string): OrganizationPluginSdkProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const runtime = getOrganizationWorkspaceRuntimeProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const pluginTypes = buildPluginTypeCatalog();
  const sdkCapabilities = buildSdkCapabilities();
  const installedPlugins = buildInstalledPlugins(organizationId);
  const marketplaceTiers = buildMarketplaceTiers();
  const sandboxFindings = runPluginSandboxAudit(organizationId);
  const governanceFindings = runPluginGovernanceAudit();
  const sandboxScorePct = computeSandboxScorePct();
  const extensibilityScorePct = computeExtensibilityScorePct(pluginTypes.length, countRegisteredCapabilities());
  const pluginsRequiringUpdate = countPluginsRequiringUpdate(installedPlugins);
  const activePluginCount = installedPlugins.filter((p) => p.status === 'active').length;

  const runtimeBoost = runtime ? Math.round(runtime.runtimeScore / 10) : 0;
  const platformScore = Math.min(
    99,
    Math.round((extensibilityScorePct + sandboxScorePct + runtimeBoost) / 3 - pluginsRequiringUpdate * 2)
  );

  const profile: OrganizationPluginSdkProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    platformScore,
    extensibilityScorePct,
    sandboxScorePct,
    pluginTypes,
    sdkCapabilities,
    installedPlugins,
    marketplaceTiers,
    sandboxFindings,
    governanceFindings,
    recommendations: buildRecommendations(pluginsRequiringUpdate),
    pluginsRequiringUpdate,
    activePluginCount,
    dockPlatformLine: '',
    ecosystemReady: true,
    lastSyncedAt: now,
  };

  profile.dockPlatformLine = buildDockPlatformLine(profile);
  return profile;
}

export function summarizePluginSdk(profile: OrganizationPluginSdkProfile): string {
  return `${profile.dockPlatformLine} ${profile.pluginTypes.length} plugin types supported.`;
}
