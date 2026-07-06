import { getOrganizationConsciousnessProfile } from '../organizational-consciousness/store';
import { getOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import { getOrganizationLegacyVaultProfile } from '../legacy-vault/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationOperatingManualProfile } from '../organization-operating-manual/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { getOrganizationWorldKnowledgeProfile } from '../world-knowledge-engine/store';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import {
  assembleTrustedContext,
  countReadyContextSources,
  summarizeContextEngine,
} from './context-engine';
import { INTELLIGENCE_STACK_LABELS } from './constants';
import {
  buildIntelligencePipeline,
  computePipelineHealth,
  summarizeIntelligenceLayer,
} from './intelligence-layer';
import {
  buildKnowledgeFabricEdges,
  buildKnowledgeFabricNodes,
  summarizeKnowledgeFabric,
} from './knowledge-fabric';
import {
  buildModelGatewayRoutes,
  processStudioIntelligenceRequest,
  selectModelGatewayProvider,
  summarizeModelGateway,
} from './model-gateway';
import type {
  IntelligenceStackSnapshot,
  IntelligenceStackSystem,
  OrganizationStudioIntelligenceArchitectureProfile,
} from './types';

function buildIntelligenceStack(organizationId: string): IntelligenceStackSnapshot[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const manual = getOrganizationOperatingManualProfile(organizationId);
  const council = getOrganizationExecutiveCouncilProfile(organizationId);
  const relationships = getOrganizationRelationshipMemoryProfile(organizationId);
  const vault = getOrganizationLegacyVaultProfile(organizationId);
  const world = getOrganizationWorldKnowledgeProfile(organizationId);
  const consciousness = getOrganizationConsciousnessProfile(organizationId);

  const probes: Record<IntelligenceStackSystem, { connected: boolean; vitalityPct: number; insight: string }> = {
    'profession-brain': {
      connected: Boolean(brain?.brains.length),
      vitalityPct: brain?.overallMaturityPct ?? 0,
      insight: `${brain?.brains.length ?? 0} brains · expertise preserved`,
    },
    'organization-genome': {
      connected: Boolean(genome),
      vitalityPct: genome?.genomeCompletenessPct ?? 0,
      insight: genome?.identityCore.mission.slice(0, 60) ?? 'Identity layer active',
    },
    'memory-engine': {
      connected: Boolean(memory),
      vitalityPct: memory?.memoryDepthScore ?? 0,
      insight: `${memory?.records.length ?? 0} records · what worked · what failed`,
    },
    'knowledge-fabric': {
      connected: true,
      vitalityPct: 88,
      insight: 'Interconnected intelligence graph · nodes linked across modules',
    },
    'executive-council': {
      connected: Boolean(council),
      vitalityPct: council ? Math.min(99, council.decisionHistory.length * 8 + 40) : 0,
      insight: `${council?.decisionHistory.length ?? 0} collaborative decisions`,
    },
    'relationship-memory': {
      connected: Boolean(relationships),
      vitalityPct: relationships ? 82 : 0,
      insight: 'Founder · customer · partner familiarity patterns',
    },
    'legacy-vault': {
      connected: Boolean(vault),
      vitalityPct: vault?.legacyDepthScore ?? 0,
      insight: `${vault?.archiveEntries.length ?? 0} preserved moments`,
    },
    'operating-manual': {
      connected: Boolean(manual),
      vitalityPct: manual?.manualCompletenessScore ?? 0,
      insight: `${manual?.documentsGenerated ?? 0} auto-generated documents`,
    },
    'world-knowledge-engine': {
      connected: Boolean(world),
      vitalityPct: world?.worldKnowledgeScore ?? 0,
      insight: `${world?.filteredSignals.length ?? 0} filtered external signals`,
    },
    'organizational-consciousness': {
      connected: Boolean(consciousness),
      vitalityPct: consciousness?.consciousnessScore ?? 0,
      insight: `${consciousness?.systemsConnected ?? 0}/${consciousness?.systemsTotal ?? 15} systems unified`,
    },
  };

  return (Object.keys(probes) as IntelligenceStackSystem[]).map((systemId) => ({
    systemId,
    label: INTELLIGENCE_STACK_LABELS[systemId],
    connected: probes[systemId].connected,
    vitalityPct: probes[systemId].vitalityPct,
    insight: probes[systemId].insight,
  }));
}

export function computeArchitectureScore(
  stack: IntelligenceStackSnapshot[],
  contextReady: number,
  pipelineHealth: number,
  fabricNodes: number
): number {
  const connectedPct =
    (stack.filter((s) => s.connected).length / Math.max(1, stack.length)) * 100;
  const avgVitality =
    stack.reduce((s, item) => s + item.vitalityPct, 0) / Math.max(1, stack.length);
  return Math.min(
    99,
    Math.round(connectedPct * 0.3 + avgVitality * 0.25 + contextReady * 2.5 + pipelineHealth * 0.2 + fabricNodes * 0.5)
  );
}

export function buildDockArchitectureLine(profile: OrganizationStudioIntelligenceArchitectureProfile): string {
  const disconnected = profile.intelligenceStack.filter((s) => !s.connected);
  if (disconnected.length >= 3) {
    return `${disconnected.length} intelligence systems still connecting — architecture remains model-agnostic; org knowledge is the moat.`;
  }
  const activeStep = profile.pipelineSteps.find((s) => s.status === 'active');
  if (activeStep) {
    return `Studio Intelligence™ ${profile.architectureScore}% — ${activeStep.label}: ${activeStep.detail.slice(0, 80)}…`;
  }
  return `Studio Intelligence™ ${profile.architectureScore}% — ${profile.contextSourcesReady} context sources ready · model-agnostic · org owns knowledge.`;
}

export function buildKnowledgeVsReasoningLine(companyName: string): string {
  return `What does ${companyName} know? — assembled from Studio OS before any model reasons. Knowledge lives inside Studio OS; reasoning may change providers.`;
}

export function buildOrganizationStudioIntelligenceArchitectureProfile(
  organizationId: string
): OrganizationStudioIntelligenceArchitectureProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const industryId = brain?.industryId ?? organizationId;

  const knowledgeFabricNodesList = buildKnowledgeFabricNodes(organizationId, companyName);
  const knowledgeFabricEdges = buildKnowledgeFabricEdges(knowledgeFabricNodesList);
  const contextBundle = assembleTrustedContext(organizationId, companyName);
  const intelligenceStack = buildIntelligenceStack(organizationId);
  const contextSourcesReady = countReadyContextSources(contextBundle);

  const profileDraft: OrganizationStudioIntelligenceArchitectureProfile = {
    organizationId,
    companyName,
    industryId,
    updatedAt: new Date().toISOString(),
    architectureScore: 0,
    knowledgeFabricNodes: knowledgeFabricNodesList.length,
    contextSourcesReady,
    pipelineHealthPct: 0,
    modelAgnostic: true,
    directVendorCallsBlocked: true,
    knowledgeFabricNodesList,
    knowledgeFabricEdges,
    contextBundle,
    pipelineSteps: [],
    modelGatewayRoutes: buildModelGatewayRoutes(selectModelGatewayProvider(organizationId)),
    intelligenceStack,
    recentRequests: [],
    dockArchitectureLine: '',
    knowledgeVsReasoningLine: buildKnowledgeVsReasoningLine(companyName),
    syncedSources: [
      'profession-brain',
      'organization-genome',
      'memory-engine',
      'executive-council',
      'relationship-memory',
      'legacy-vault',
      'organization-operating-manual',
      'world-knowledge-engine',
      'organizational-consciousness',
      'legacy-network',
      'knowledge-confidence',
      'professional-trust-framework',
      'executive-timeline',
    ],
  };

  profileDraft.architectureScore = computeArchitectureScore(
    intelligenceStack,
    contextSourcesReady,
    0,
    knowledgeFabricNodesList.length
  );
  profileDraft.pipelineSteps = buildIntelligencePipeline(contextBundle, profileDraft.architectureScore);
  profileDraft.pipelineHealthPct = computePipelineHealth(profileDraft.pipelineSteps);
  profileDraft.architectureScore = computeArchitectureScore(
    intelligenceStack,
    contextSourcesReady,
    profileDraft.pipelineHealthPct,
    knowledgeFabricNodesList.length
  );

  const demoRequest = processStudioIntelligenceRequest(
    organizationId,
    'How should we respond to this customer request?',
    summarizeContextEngine(contextBundle),
    contextSourcesReady,
    profileDraft.pipelineSteps.filter((s) => s.status === 'complete').length
  );
  profileDraft.recentRequests = [demoRequest];
  profileDraft.dockArchitectureLine = buildDockArchitectureLine(profileDraft);

  void inauguration;
  return profileDraft;
}

export function summarizeStudioIntelligenceArchitectureProfile(
  profile: OrganizationStudioIntelligenceArchitectureProfile
): string {
  return [
    profile.dockArchitectureLine,
    profile.knowledgeVsReasoningLine,
    summarizeKnowledgeFabric(profile.knowledgeFabricNodesList, profile.knowledgeFabricEdges),
    summarizeContextEngine(profile.contextBundle),
    summarizeIntelligenceLayer(profile.pipelineSteps),
    summarizeModelGateway(profile.modelGatewayRoutes),
    'The moat is not the model — preserved expertise, identity, memory, decisions, relationships, and history.',
  ].join(' ');
}
