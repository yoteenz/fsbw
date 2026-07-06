import { getOrganizationPluginSdkProfile } from '../plugin-sdk/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildWorkflowAnalyticsMetrics,
  buildOptimizationSuggestions,
  computeAnalyticsScorePct,
} from './analytics-engine';
import { buildWorkflowNodeCatalog } from './node-catalog';
import { buildWorkflowProcessTemplates, buildOrganizationWorkflows } from './process-catalog';
import { computeBuilderReadyPct, runWorkflowGovernanceAudit } from './governance-engine';
import { buildTestingCapabilities, computeTestingScorePct } from './testing-engine';
import type { OrganizationWorkflowEngineProfile } from './types';

export function buildDockChoreographyLine(profile: OrganizationWorkflowEngineProfile): string {
  return `Workflow Engine™ ${profile.choreographyScore}% — ${profile.publishedWorkflowCount} published · ${profile.nodeCatalog.length} node types · ${profile.analyticsScorePct}% analytics.`;
}

export function buildOrganizationWorkflowEngineProfile(organizationId: string): OrganizationWorkflowEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const pluginSdk = getOrganizationPluginSdkProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const nodeCatalog = buildWorkflowNodeCatalog();
  const processTemplates = buildWorkflowProcessTemplates();
  const workflows = buildOrganizationWorkflows(organizationId);
  const testingCapabilities = buildTestingCapabilities();
  const analyticsMetrics = buildWorkflowAnalyticsMetrics();
  const analyticsScorePct = computeAnalyticsScorePct(analyticsMetrics);
  const testingScorePct = computeTestingScorePct();
  const builderReadyPct = computeBuilderReadyPct(nodeCatalog.length);
  const governanceFindings = runWorkflowGovernanceAudit();
  const optimizationSuggestions = buildOptimizationSuggestions();
  const activeWorkflowCount = workflows.length;
  const publishedWorkflowCount = workflows.filter((w) => w.status === 'published').length;

  const pluginBoost = pluginSdk ? Math.round(pluginSdk.platformScore / 15) : 0;
  const choreographyScore = Math.min(
    99,
    Math.round((builderReadyPct + testingScorePct + analyticsScorePct + pluginBoost) / 3)
  );

  const profile: OrganizationWorkflowEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    choreographyScore,
    builderReadyPct,
    testingScorePct,
    analyticsScorePct,
    nodeCatalog,
    processTemplates,
    workflows,
    testingCapabilities,
    analyticsMetrics,
    optimizationSuggestions,
    governanceFindings,
    activeWorkflowCount,
    publishedWorkflowCount,
    dockChoreographyLine: '',
    livingSystems: true,
    lastSyncedAt: now,
  };

  profile.dockChoreographyLine = buildDockChoreographyLine(profile);
  return profile;
}

export function summarizeWorkflowEngine(profile: OrganizationWorkflowEngineProfile): string {
  return `${profile.dockChoreographyLine} Living systems — visualize, improve, automate, evolve.`;
}
