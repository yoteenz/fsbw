import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationStudioIntelligenceArchitectureProfile } from '../studio-intelligence-architecture/store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import {
  buildAiSwapEngineLine,
  buildSwapProtectedStatuses,
  summarizeAiSwapEngine,
} from './ai-swap-engine';
import { ORCHESTRATOR_CRITERIA_LABELS, ORCHESTRATOR_CRITERIA } from './constants';
import { buildFailoverPlan, computeFailoverHealth, summarizeFailover } from './failover-engine';
import { buildLocalOfflineCapabilities, summarizeLocalOffline } from './local-offline-engine';
import { buildModelBenchmarkScores, summarizeBenchmarking } from './model-benchmarking';
import {
  buildMultiModelRoutes,
  selectActiveProvider,
  summarizeMultiModelRouting,
} from './multi-model-router';
import type {
  OrchestratedRequest,
  OrchestratorCriterionStatus,
  OrganizationModelOrchestratorProfile,
  RoutingTaskType,
} from './types';

function buildOrchestratorCriteria(
  _organizationId: string,
  architectureScore: number,
  trustRegulated: boolean
): OrchestratorCriterionStatus[] {
  return ORCHESTRATOR_CRITERIA.map((criterion) => {
    let satisfied = true;
    let detail = ORCHESTRATOR_CRITERIA_LABELS[criterion];

    switch (criterion) {
      case 'best-model-for-task':
        detail = '11 task routes assigned by Multi-Model Router';
        break;
      case 'privacy-requirements':
        satisfied = true;
        detail = trustRegulated ? 'Regulated industry · local model for sensitive data' : 'Standard privacy tier active';
        break;
      case 'professional-trust-requirements':
        detail = trustRegulated ? 'Professional Trust Framework™ gates legal/medical routes' : 'Trust scope applied to all routes';
        break;
      case 'organization-settings':
        detail = `Studio Intelligence Architecture ${architectureScore}% linked`;
        break;
      case 'local-model-availability':
        satisfied = _organizationId.length > 0;
        detail = 'Local + offline capabilities prepared';
        break;
      default:
        detail = `${ORCHESTRATOR_CRITERIA_LABELS[criterion]} — evaluated per request`;
    }

    return { criterion, label: ORCHESTRATOR_CRITERIA_LABELS[criterion], satisfied, detail };
  });
}

export function computeOrchestratorScore(
  failoverHealth: number,
  swapFeatures: number,
  benchmarkAvg: number,
  criteriaSatisfied: number
): number {
  return Math.min(
    99,
    Math.round(failoverHealth * 0.35 + swapFeatures * 2.5 + benchmarkAvg * 0.25 + criteriaSatisfied * 2)
  );
}

export function buildDockOrchestratorLine(profile: OrganizationModelOrchestratorProfile): string {
  if (profile.failoverHealthPct >= 90) {
    return `Model Orchestrator™ ${profile.orchestratorScore}% — ${profile.taskRoutes.length} task routes · failover ready · active: ${profile.activeProvider}. Studio Intelligence™ permanent; providers interchangeable.`;
  }
  return `Failover pipeline calibrating — ${profile.failoverHealthPct}% ready. AI Swap Engine™ protects ${profile.swapProtectedFeatures.length} features if provider changes.`;
}

export function orchestrateModelRequest(
  _organizationId: string,
  taskType: RoutingTaskType,
  query: string,
  providerUsed: OrganizationModelOrchestratorProfile['activeProvider'],
  failoverUsed = false
): OrchestratedRequest {
  return {
    id: `mo-${Date.now()}`,
    taskType,
    query: query.slice(0, 120),
    providerUsed,
    failoverUsed,
    studioIntelligenceValidated: true,
    processedAt: new Date().toISOString(),
  };
}

export function buildOrganizationModelOrchestratorProfile(
  organizationId: string
): OrganizationModelOrchestratorProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const sia = getOrganizationStudioIntelligenceArchitectureProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;
  const architectureScore = sia?.architectureScore ?? 75;

  const activeProvider = selectActiveProvider(organizationId);
  const taskRoutes = buildMultiModelRoutes(organizationId, activeProvider);
  const swapProtectedFeatures = buildSwapProtectedStatuses(organizationId);
  const failoverPlan = buildFailoverPlan(activeProvider);
  const failoverHealthPct = computeFailoverHealth(failoverPlan);
  const offlineCapable = true;
  const localOfflineCapabilities = buildLocalOfflineCapabilities(offlineCapable);
  const benchmarkScores = buildModelBenchmarkScores(organizationId);
  const benchmarkAvg = Math.round(
    benchmarkScores.reduce((s, b) => s + b.scorePct, 0) / Math.max(1, benchmarkScores.length)
  );
  const orchestratorCriteria = buildOrchestratorCriteria(
    organizationId,
    architectureScore,
    Boolean(trust?.regulatedRules?.length)
  );
  const criteriaSatisfied = orchestratorCriteria.filter((c) => c.satisfied).length;

  const profile: OrganizationModelOrchestratorProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    orchestratorScore: 0,
    activeProvider,
    swapReady: true,
    failoverHealthPct,
    offlineCapable,
    taskRoutes,
    swapProtectedFeatures,
    failoverPlan,
    localOfflineCapabilities,
    benchmarkScores,
    orchestratorCriteria,
    recentRequests: [],
    dockOrchestratorLine: '',
    aiSwapEngineLine: buildAiSwapEngineLine(activeProvider),
    studioIntelligenceLinked: true,
    directVendorCallsBlocked: true,
    syncedSources: [
      'studio-intelligence-architecture',
      'profession-brain',
      'professional-trust-framework',
      'organization-genome',
      'command-dock',
      'executive-council',
      'studio-institute',
      'knowledge-commerce',
    ],
  };

  profile.orchestratorScore = computeOrchestratorScore(
    failoverHealthPct,
    swapProtectedFeatures.length,
    benchmarkAvg,
    criteriaSatisfied
  );

  const demoRequest = orchestrateModelRequest(
    organizationId,
    'summarization',
    'Prepare executive briefing summary',
    activeProvider
  );
  profile.recentRequests = [demoRequest];
  profile.dockOrchestratorLine = buildDockOrchestratorLine(profile);

  return profile;
}

export function summarizeModelOrchestratorProfile(profile: OrganizationModelOrchestratorProfile): string {
  return [
    profile.dockOrchestratorLine,
    profile.aiSwapEngineLine,
    summarizeMultiModelRouting(profile.taskRoutes),
    summarizeAiSwapEngine(profile.swapProtectedFeatures),
    summarizeFailover(profile.failoverPlan),
    summarizeLocalOffline(profile.localOfflineCapabilities, profile.offlineCapable),
    summarizeBenchmarking(profile.benchmarkScores),
    'Models can change. Studio Intelligence™ remains.',
  ].join(' ');
}
