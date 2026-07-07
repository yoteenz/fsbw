import {
  approvePendingRoute,
  cancelPendingRoute,
  explainPendingRoute,
  readConciergeRoutingStore,
  recordRoutingCorrection,
  submitUniversalCommand,
} from '../concierge-routing/store';
import { buildAskWhyExplanation } from '../concierge-routing/router';
import type { FounderCommandRoute } from '../concierge-routing/types';
import { readExecutiveTimelineStore } from '../executive-timeline/store';
import { getRuntimeActiveWorkspaceId } from '../workspace/storage';
import {
  COMMAND_DOCK_STORAGE_KEY,
  COMMAND_DOCK_VERSION,
  COMMAND_DOCK_PHILOSOPHY,
} from './constants';
import { MICRO_MOMENT_LABELS } from '../living-headquarters-presence/constants';
import { resolveDockContext } from './context';
import { resolveExecutiveGrowthAdvice, buildProactiveGrowthSuggestion } from '../monetization-architecture/dock-advisor';
import { resolveLivingDiscoveryAdvice, buildProactiveDiscoverySuggestion } from '../business-discovery-blueprint/dock-advisor';
import { ensureOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { resolveProfessionBrainAdvice, buildProactiveBrainSuggestion } from '../profession-brain/dock-advisor';
import { resolveExpertMarketplaceAdvice } from '../expert-marketplace/dock-advisor';
import {
  resolveStudioInstituteAdvice,
  buildProactiveInstituteSuggestion,
} from '../studio-institute/dock-advisor';
import {
  resolveKnowledgeCommerceAdvice,
  buildProactiveCommerceSuggestion,
} from '../knowledge-commerce/dock-advisor';
import {
  resolveProfessionalTrustAdvice,
  buildProactiveTrustSuggestion,
} from '../professional-trust-framework/dock-advisor';
import {
  resolveOrganizationGenomeAdvice,
  buildProactiveGenomeSuggestion,
} from '../organization-genome/dock-advisor';
import {
  resolveMemoryEngineAdvice,
  buildProactiveMemorySuggestion,
} from '../memory-engine/dock-advisor';
import {
  resolveCompanyHealthIndexAdvice,
  buildProactiveHealthSuggestion,
} from '../company-health-index/dock-advisor';
import {
  resolveSuccessionModeAdvice,
  buildProactiveSuccessionSuggestion,
} from '../succession-mode/dock-advisor';
import {
  resolveExecutiveCouncilAdvice,
  buildProactiveCouncilSuggestion,
} from '../executive-council/dock-advisor';
import {
  resolveOrganizationPulseAdvice,
  buildProactivePulseSuggestion,
} from '../organization-pulse/dock-advisor';
import {
  resolveWisdomCaptureAdvice,
  buildProactiveWisdomSuggestion,
} from '../wisdom-capture/dock-advisor';
import {
  resolveShadowModeAdvice,
  buildProactiveShadowSuggestion,
} from '../shadow-mode/dock-advisor';
import {
  resolveDigitalTwinAdvice,
  buildProactiveDigitalTwinSuggestion,
} from '../organization-digital-twin/dock-advisor';
import {
  resolveSimulationLabAdvice,
  buildProactiveSimulationLabSuggestion,
} from '../business-simulation-lab/dock-advisor';
import {
  resolveKnowledgeConfidenceAdvice,
  buildProactiveKnowledgeConfidenceSuggestion,
} from '../knowledge-confidence/dock-advisor';
import {
  resolveLegacyVaultAdvice,
  buildProactiveLegacyVaultSuggestion,
} from '../legacy-vault/dock-advisor';
import {
  resolveAmbientAwarenessAdvice,
  buildProactiveAmbientAwarenessSuggestion,
  buildHeadquartersOpeningBriefing,
} from '../ambient-awareness/dock-advisor';
import {
  resolveAnticipationEngineAdvice,
  buildProactiveAnticipationSuggestion,
} from '../anticipation-engine/dock-advisor';
import {
  resolveFounderCognitiveLoadAdvice,
  buildProactiveFounderCognitiveLoadSuggestion,
} from '../founder-cognitive-load/dock-advisor';
import {
  resolvePresenceEngineAdvice,
  buildProactivePresenceSuggestion,
} from '../presence-engine/dock-advisor';
import {
  resolveCrossOrgIntelligenceAdvice,
  buildProactiveCrossOrgSuggestion,
} from '../cross-organization-intelligence/dock-advisor';
import {
  resolveRelationshipMemoryAdvice,
  buildProactiveRelationshipMemorySuggestion,
} from '../relationship-memory/dock-advisor';
import {
  resolvePredictiveOrganizationAdvice,
  buildProactivePredictiveOrganizationSuggestion,
} from '../predictive-organization/dock-advisor';
import {
  resolveAutonomousPreparationAdvice,
  buildProactiveAutonomousPreparationSuggestion,
} from '../autonomous-preparation/dock-advisor';
import {
  resolveOrganizationalConsciousnessAdvice,
  buildProactiveOrganizationalConsciousnessSuggestion,
} from '../organizational-consciousness/dock-advisor';
import {
  resolveExecutiveTimelineHistoryAdvice,
  buildProactiveExecutiveTimelineHistorySuggestion,
  buildAnniversaryDockContext,
} from '../executive-timeline/dock-advisor';
import {
  resolveWorldKnowledgeEngineAdvice,
  buildProactiveWorldKnowledgeSuggestion,
  buildMorningWorldAlert,
} from '../world-knowledge-engine/dock-advisor';
import {
  resolveFounderOperatingSystemAdvice,
  buildProactiveFounderOperatingSystemSuggestion,
  buildFounderOperatingOpeningLine,
} from '../founder-operating-system/dock-advisor';
import {
  resolveInnovationLabAdvice,
  buildProactiveInnovationLabSuggestion,
  buildInnovationLabOpeningLine,
} from '../innovation-lab/dock-advisor';
import {
  resolveOrganizationOperatingManualAdvice,
  buildProactiveOrganizationOperatingManualSuggestion,
  buildOperatingManualOpeningLine,
} from '../organization-operating-manual/dock-advisor';
import {
  resolveLegacyNetworkAdvice,
  buildProactiveLegacyNetworkSuggestion,
  buildLegacyNetworkOpeningLine,
} from '../legacy-network/dock-advisor';
import {
  resolveStudioIntelligenceArchitectureAdvice,
  buildProactiveStudioIntelligenceArchitectureSuggestion,
  buildStudioIntelligenceArchitectureOpeningLine,
} from '../studio-intelligence-architecture/dock-advisor';
import {
  resolveModelOrchestratorAdvice,
  buildProactiveModelOrchestratorSuggestion,
  buildModelOrchestratorOpeningLine,
} from '../model-orchestrator/dock-advisor';
import {
  resolveStudioFoundationModelsAdvice,
  buildProactiveStudioFoundationModelsSuggestion,
  buildStudioFoundationModelsOpeningLine,
} from '../studio-foundation-models/dock-advisor';
import {
  resolveDocumentationSyncAdvice,
  buildProactiveDocumentationSyncSuggestion,
  buildDocumentationSyncOpeningLine,
} from '../documentation-sync/dock-advisor';
import {
  resolveDocumentationRegistryAdvice,
  buildProactiveDocumentationRegistrySuggestion,
  buildDocumentationRegistryOpeningLine,
} from '../documentation-registry/dock-advisor';
import {
  resolveDocumentationGovernanceAdvice,
  buildProactiveDocumentationGovernanceSuggestion,
  buildDocumentationGovernanceOpeningLine,
} from '../documentation-governance/dock-advisor';
import {
  resolveSystemRegistryAdvice,
  buildProactiveSystemRegistrySuggestion,
  buildSystemRegistryOpeningLine,
} from '../system-registry/dock-advisor';
import {
  resolveComponentRegistryAdvice,
  buildProactiveComponentRegistrySuggestion,
  buildComponentRegistryOpeningLine,
} from '../component-registry/dock-advisor';
import {
  resolveDesignTokenEngineAdvice,
  buildProactiveDesignTokenEngineSuggestion,
  buildDesignTokenEngineOpeningLine,
} from '../design-token-engine/dock-advisor';
import {
  resolveInteractionEngineAdvice,
  buildProactiveInteractionEngineSuggestion,
  buildInteractionEngineOpeningLine,
} from '../interaction-engine/dock-advisor';
import {
  resolveEventBusAdvice,
  buildProactiveEventBusSuggestion,
  buildEventBusOpeningLine,
} from '../event-bus/dock-advisor';
import {
  resolveAutomationRegistryAdvice,
  buildProactiveAutomationRegistrySuggestion,
  buildAutomationRegistryOpeningLine,
} from '../automation-registry/dock-advisor';
import {
  resolvePromptRegistryAdvice,
  buildProactivePromptRegistrySuggestion,
  buildPromptRegistryOpeningLine,
} from '../prompt-registry/dock-advisor';
import {
  resolvePolicyEngineAdvice,
  buildProactivePolicyEngineSuggestion,
  buildPolicyEngineOpeningLine,
} from '../policy-engine/dock-advisor';
import {
  resolvePermissionEngineAdvice,
  buildProactivePermissionEngineSuggestion,
  buildPermissionEngineOpeningLine,
} from '../permission-engine/dock-advisor';
import {
  resolveWorkspaceRuntimeAdvice,
  buildProactiveWorkspaceRuntimeSuggestion,
  buildWorkspaceRuntimeOpeningLine,
} from '../workspace-runtime/dock-advisor';
import {
  resolvePluginSdkAdvice,
  buildProactivePluginSdkSuggestion,
  buildPluginSdkOpeningLine,
} from '../plugin-sdk/dock-advisor';
import {
  resolveWorkflowEngineAdvice,
  buildProactiveWorkflowEngineSuggestion,
  buildWorkflowEngineOpeningLine,
} from '../workflow-engine/dock-advisor';
import {
  resolveStateEngineAdvice,
  buildProactiveStateEngineSuggestion,
  buildStateEngineOpeningLine,
} from '../state-engine/dock-advisor';
import {
  resolveAssetRegistryAdvice,
  buildProactiveAssetRegistrySuggestion,
  buildAssetRegistryOpeningLine,
} from '../asset-registry/dock-advisor';
import {
  resolveExperienceEngineAdvice,
  buildProactiveExperienceEngineSuggestion,
  buildExperienceEngineOpeningLine,
} from '../experience-engine/dock-advisor';
import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import type {
  CommandDockStore,
  CommandHistoryEntry,
  DockContextProfile,
  DockExpansionSize,
} from './types';

function emptyStore(): CommandDockStore {
  return {
    version: COMMAND_DOCK_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    philosophy: [...COMMAND_DOCK_PHILOSOPHY],
    expansionSize: 'compact',
    dockInput: '',
    isFocused: false,
    processingActive: false,
    activeMicrointeraction: null,
    microinteractionQueue: [],
    pendingRoute: null,
    askWhyAnswer: null,
    lastRoutingSummary: null,
    proactiveSuggestion: null,
    recentCommands: [],
    favoriteCommands: [],
    recurringCommands: [],
    recommendedAutomations: [],
    showHistoryPanel: false,
    contextProfile: null,
  };
}

export function readCommandDockStore(): CommandDockStore {
  return readScopedStore(COMMAND_DOCK_STORAGE_KEY, emptyStore);
}

export function writeCommandDockStore(store: CommandDockStore): void {
  writeScopedStore(COMMAND_DOCK_STORAGE_KEY, {
    ...store,
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function bootstrapCommandDockStore(seed: Partial<CommandDockStore>): void {
  const current = readCommandDockStore();
  if (current.recentCommands.length > 0) return;
  writeCommandDockStore({ ...emptyStore(), ...seed });
}

export function syncDockContext(pathname: string): DockContextProfile {
  const profile = resolveDockContext(pathname);
  const store = readCommandDockStore();
  const workspaceId = getRuntimeActiveWorkspaceId();
  const growth = buildProactiveGrowthSuggestion(workspaceId);
  const discovery = buildProactiveDiscoverySuggestion(workspaceId);
  const brain = buildProactiveBrainSuggestion(workspaceId);
  const institute = buildProactiveInstituteSuggestion(workspaceId);
  const commerce = buildProactiveCommerceSuggestion(workspaceId);
  const trust = buildProactiveTrustSuggestion(workspaceId);
  const genome = buildProactiveGenomeSuggestion(workspaceId);
  const memory = buildProactiveMemorySuggestion(workspaceId);
  const health = buildProactiveHealthSuggestion(workspaceId);
  const succession = buildProactiveSuccessionSuggestion(workspaceId);
  const council = buildProactiveCouncilSuggestion(workspaceId);
  const pulse = buildProactivePulseSuggestion(workspaceId);
  const wisdom = buildProactiveWisdomSuggestion(workspaceId);
  const shadow = buildProactiveShadowSuggestion(workspaceId);
  const digitalTwin = buildProactiveDigitalTwinSuggestion(workspaceId);
  const simulationLab = buildProactiveSimulationLabSuggestion(workspaceId);
  const knowledgeConfidence = buildProactiveKnowledgeConfidenceSuggestion(workspaceId);
  const legacyVault = buildProactiveLegacyVaultSuggestion(workspaceId);
  const ambientModule = buildProactiveAmbientAwarenessSuggestion(workspaceId);
  const anticipation = buildProactiveAnticipationSuggestion(workspaceId);
  const cognitiveLoad = buildProactiveFounderCognitiveLoadSuggestion(workspaceId);
  const presence = buildProactivePresenceSuggestion(workspaceId);
  const crossOrg = buildProactiveCrossOrgSuggestion(workspaceId);
  const relationshipMemory = buildProactiveRelationshipMemorySuggestion(workspaceId);
  const predictiveOrganization = buildProactivePredictiveOrganizationSuggestion(workspaceId);
  const autonomousPreparation = buildProactiveAutonomousPreparationSuggestion(workspaceId);
  const organizationalConsciousness = buildProactiveOrganizationalConsciousnessSuggestion(workspaceId);
  const executiveTimelineHistory = buildProactiveExecutiveTimelineHistorySuggestion(workspaceId);
  const anniversaryContext = buildAnniversaryDockContext(workspaceId);
  const worldKnowledgeEngine = buildProactiveWorldKnowledgeSuggestion(workspaceId);
  const morningWorldAlert = buildMorningWorldAlert(workspaceId);
  const founderOperatingSystem = buildProactiveFounderOperatingSystemSuggestion(workspaceId);
  const founderOpeningLine = buildFounderOperatingOpeningLine(workspaceId);
  const innovationLab = buildProactiveInnovationLabSuggestion(workspaceId);
  const innovationOpeningLine = buildInnovationLabOpeningLine(workspaceId);
  const operatingManual = buildProactiveOrganizationOperatingManualSuggestion(workspaceId);
  const operatingManualOpeningLine = buildOperatingManualOpeningLine(workspaceId);
  const legacyNetwork = buildProactiveLegacyNetworkSuggestion(workspaceId);
  const legacyNetworkOpeningLine = buildLegacyNetworkOpeningLine(workspaceId);
  const studioIntelligenceArchitecture = buildProactiveStudioIntelligenceArchitectureSuggestion(workspaceId);
  const studioIntelligenceArchitectureOpeningLine = buildStudioIntelligenceArchitectureOpeningLine(workspaceId);
  const modelOrchestrator = buildProactiveModelOrchestratorSuggestion(workspaceId);
  const modelOrchestratorOpeningLine = buildModelOrchestratorOpeningLine(workspaceId);
  const studioFoundationModels = buildProactiveStudioFoundationModelsSuggestion(workspaceId);
  const studioFoundationModelsOpeningLine = buildStudioFoundationModelsOpeningLine(workspaceId);
  const documentationSync = buildProactiveDocumentationSyncSuggestion(workspaceId);
  const documentationSyncOpeningLine = buildDocumentationSyncOpeningLine(workspaceId);
  const documentationRegistry = buildProactiveDocumentationRegistrySuggestion(workspaceId);
  const documentationRegistryOpeningLine = buildDocumentationRegistryOpeningLine(workspaceId);
  const documentationGovernance = buildProactiveDocumentationGovernanceSuggestion(workspaceId);
  const documentationGovernanceOpeningLine = buildDocumentationGovernanceOpeningLine(workspaceId);
  const systemRegistry = buildProactiveSystemRegistrySuggestion(workspaceId);
  const systemRegistryOpeningLine = buildSystemRegistryOpeningLine(workspaceId);
  const componentRegistry = buildProactiveComponentRegistrySuggestion(workspaceId);
  const componentRegistryOpeningLine = buildComponentRegistryOpeningLine(workspaceId);
  const designTokenEngine = buildProactiveDesignTokenEngineSuggestion(workspaceId);
  const designTokenEngineOpeningLine = buildDesignTokenEngineOpeningLine(workspaceId);
  const interactionEngine = buildProactiveInteractionEngineSuggestion(workspaceId);
  const interactionEngineOpeningLine = buildInteractionEngineOpeningLine(workspaceId);
  const eventBus = buildProactiveEventBusSuggestion(workspaceId);
  const eventBusOpeningLine = buildEventBusOpeningLine(workspaceId);
  const automationRegistry = buildProactiveAutomationRegistrySuggestion(workspaceId);
  const automationRegistryOpeningLine = buildAutomationRegistryOpeningLine(workspaceId);
  const promptRegistry = buildProactivePromptRegistrySuggestion(workspaceId);
  const promptRegistryOpeningLine = buildPromptRegistryOpeningLine(workspaceId);
  const policyEngine = buildProactivePolicyEngineSuggestion(workspaceId);
  const policyEngineOpeningLine = buildPolicyEngineOpeningLine(workspaceId);
  const permissionEngine = buildProactivePermissionEngineSuggestion(workspaceId);
  const permissionEngineOpeningLine = buildPermissionEngineOpeningLine(workspaceId);
  const workspaceRuntime = buildProactiveWorkspaceRuntimeSuggestion(workspaceId);
  const workspaceRuntimeOpeningLine = buildWorkspaceRuntimeOpeningLine(workspaceId);
  const pluginSdk = buildProactivePluginSdkSuggestion(workspaceId);
  const pluginSdkOpeningLine = buildPluginSdkOpeningLine(workspaceId);
  const workflowEngine = buildProactiveWorkflowEngineSuggestion(workspaceId);
  const workflowEngineOpeningLine = buildWorkflowEngineOpeningLine(workspaceId);
  const stateEngine = buildProactiveStateEngineSuggestion(workspaceId);
  const stateEngineOpeningLine = buildStateEngineOpeningLine(workspaceId);
  const assetRegistry = buildProactiveAssetRegistrySuggestion(workspaceId);
  const assetRegistryOpeningLine = buildAssetRegistryOpeningLine(workspaceId);
  const experienceEngine = buildProactiveExperienceEngineSuggestion(workspaceId);
  const experienceEngineOpeningLine = buildExperienceEngineOpeningLine(workspaceId);
  const isHeadquartersOpening =
    pathname.includes('/mission-control') ||
    pathname.includes('/headquarters') ||
    /\/studio\/?$/.test(pathname);
  const ambientOpening = isHeadquartersOpening
    ? {
        response: buildHeadquartersOpeningBriefing(workspaceId),
        concierge: 'Chief Concierge',
        suggestedCommand: "Review today's executive briefing.",
      }
    : null;
  const ambientModuleProactive = ambientModule
    ? {
        response: ambientModule,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Ambient Awareness — continuous organizational context.',
      }
    : null;
  const anticipationProactive = anticipation
    ? {
        response: anticipation,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Anticipation Engine — review prepared work awaiting approval.',
      }
    : null;
  const cognitiveLoadProactive = cognitiveLoad
    ? {
        response: cognitiveLoad,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Founder Cognitive Load — review attention protection status.',
      }
    : null;
  const presenceProactive = presence
    ? {
        response: presence,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Presence Engine — living executive presence status.',
      }
    : null;
  const crossOrgProactive = crossOrg
    ? {
        response: crossOrg,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Cross-Organization Intelligence — review trusted collaboration opportunities.',
      }
    : null;
  const relationshipMemoryProactive = relationshipMemory
    ? {
        response: relationshipMemory,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Relationship Memory — review how Studio OS has learned your working preferences.',
      }
    : null;
  const predictiveOrganizationProactive = predictiveOrganization
    ? {
        response: predictiveOrganization,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Predictive Organization — review forecasts and recommended actions.',
      }
    : null;
  const autonomousPreparationProactive = autonomousPreparation
    ? {
        response: autonomousPreparation,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Autonomous Preparation — review work prepared awaiting approval.',
      }
    : null;
  const organizationalConsciousnessProactive = organizationalConsciousness
    ? {
        response: organizationalConsciousness,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Organizational Consciousness — unified intelligence across all systems.',
      }
    : null;
  const executiveTimelineHistoryProactive = executiveTimelineHistory
    ? {
        response: executiveTimelineHistory,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Executive Timeline — explore how your organization arrived here.',
      }
    : null;
  const worldKnowledgeProactive = worldKnowledgeEngine
    ? {
        response: worldKnowledgeEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open World Knowledge Engine — review filtered external intelligence.',
      }
    : null;
  const morningWorldProactive = morningWorldAlert
    ? {
        response: morningWorldAlert,
        concierge: 'Chief Concierge',
        suggestedCommand: "Summarize today's external developments for our organization.",
      }
    : null;
  const founderOperatingProactive = founderOperatingSystem
    ? {
        response: founderOperatingSystem,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Founder Operating System — review leadership and focus coaching.',
      }
    : null;
  const founderOpeningProactive = founderOpeningLine
    ? {
        response: founderOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'How is my Founder Operating System supporting my leadership?',
      }
    : null;
  const innovationLabProactive = innovationLab
    ? {
        response: innovationLab,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Innovation Lab — review discovered revenue opportunities.',
      }
    : null;
  const innovationOpeningProactive = innovationOpeningLine
    ? {
        response: innovationOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What new ideas has Innovation Lab generated?',
      }
    : null;
  const operatingManualProactive = operatingManual
    ? {
        response: operatingManual,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Organization Operating Manual — review synchronized documentation.',
      }
    : null;
  const operatingManualOpeningProactive = operatingManualOpeningLine
    ? {
        response: operatingManualOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'How do we onboard clients?',
      }
    : null;
  const legacyNetworkProactive = legacyNetwork
    ? {
        response: legacyNetwork,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Legacy Network — explore shared organizational expertise.',
      }
    : null;
  const legacyNetworkOpeningProactive = legacyNetworkOpeningLine
    ? {
        response: legacyNetworkOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What can our organization publish to Legacy Network?',
      }
    : null;
  const studioIntelligenceArchitectureProactive = studioIntelligenceArchitecture
    ? {
        response: studioIntelligenceArchitecture,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Studio Intelligence Architecture — model-agnostic layer.',
      }
    : null;
  const studioIntelligenceArchitectureOpeningProactive = studioIntelligenceArchitectureOpeningLine
    ? {
        response: studioIntelligenceArchitectureOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Explain Knowledge Fabric and Context Engine.',
      }
    : null;
  const modelOrchestratorProactive = modelOrchestrator
    ? {
        response: modelOrchestrator,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Model Orchestrator — swap AI provider safely.',
      }
    : null;
  const modelOrchestratorOpeningProactive = modelOrchestratorOpeningLine
    ? {
        response: modelOrchestratorOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What happens if our AI provider fails?',
      }
    : null;
  const studioFoundationModelsProactive = studioFoundationModels
    ? {
        response: studioFoundationModels,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Explain Studio Foundation Models and the long-term roadmap.',
      }
    : null;
  const studioFoundationModelsOpeningProactive = studioFoundationModelsOpeningLine
    ? {
        response: studioFoundationModelsOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Which Profession Models are available for our organization?',
      }
    : null;
  const documentationSyncProactive = documentationSync
    ? {
        response: documentationSync,
        concierge: 'Chief Concierge',
        suggestedCommand: 'How do I get started with Studio OS?',
      }
    : null;
  const documentationSyncOpeningProactive = documentationSyncOpeningLine
    ? {
        response: documentationSyncOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Explain Documentation Synchronization and the help system.',
      }
    : null;
  const documentationRegistryProactive = documentationRegistry
    ? {
        response: documentationRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Explain Profession Brain™.',
      }
    : null;
  const documentationRegistryOpeningProactive = documentationRegistryOpeningLine
    ? {
        response: documentationRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Documentation Registry health.',
      }
    : null;
  const documentationGovernanceProactive = documentationGovernance
    ? {
        response: documentationGovernance,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Documentation Governance health.',
      }
    : null;
  const documentationGovernanceOpeningProactive = documentationGovernanceOpeningLine
    ? {
        response: documentationGovernanceOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Is documentation ready for deployment?',
      }
    : null;
  const systemRegistryProactive = systemRegistry
    ? {
        response: systemRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What exists in Studio OS?',
      }
    : null;
  const systemRegistryOpeningProactive = systemRegistryOpeningLine
    ? {
        response: systemRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'List all modules in the System Registry.',
      }
    : null;
  const componentRegistryProactive = componentRegistry
    ? {
        response: componentRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Which reusable cards should I use?',
      }
    : null;
  const componentRegistryOpeningProactive = componentRegistryOpeningLine
    ? {
        response: componentRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Component Registry status.',
      }
    : null;
  const designTokenEngineProactive = designTokenEngine
    ? {
        response: designTokenEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Design Token Engine status.',
      }
    : null;
  const designTokenEngineOpeningProactive = designTokenEngineOpeningLine
    ? {
        response: designTokenEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What is the Studio accent color?',
      }
    : null;
  const interactionEngineProactive = interactionEngine
    ? {
        response: interactionEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Interaction Engine status.',
      }
    : null;
  const interactionEngineOpeningProactive = interactionEngineOpeningLine
    ? {
        response: interactionEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'How does modal opening behave?',
      }
    : null;
  const eventBusProactive = eventBus
    ? {
        response: eventBus,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show Event Bus status.',
      }
    : null;
  const eventBusOpeningProactive = eventBusOpeningLine
    ? {
        response: eventBusOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What happens when a customer is created?',
      }
    : null;
  const automationRegistryProactive = automationRegistry
    ? {
        response: automationRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show my automations.',
      }
    : null;
  const automationRegistryOpeningProactive = automationRegistryOpeningLine
    ? {
        response: automationRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'What executed this morning?',
      }
    : null;
  const promptRegistryProactive = promptRegistry
    ? {
        response: promptRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show prompts used by Executive Council.',
      }
    : null;
  const promptRegistryOpeningProactive = promptRegistryOpeningLine
    ? {
        response: promptRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Which prompts changed this month?',
      }
    : null;
  const policyEngineProactive = policyEngine
    ? {
        response: policyEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Why was this automation blocked?',
      }
    : null;
  const policyEngineOpeningProactive = policyEngineOpeningLine
    ? {
        response: policyEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show all publishing policies.',
      }
    : null;
  const permissionEngineProactive = permissionEngine
    ? {
        response: permissionEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Who can publish marketing campaigns?',
      }
    : null;
  const permissionEngineOpeningProactive = permissionEngineOpeningLine
    ? {
        response: permissionEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show permission changes from this week.',
      }
    : null;
  const workspaceRuntimeProactive = workspaceRuntime
    ? {
        response: workspaceRuntime,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Your development workspace is ready.',
      }
    : null;
  const workspaceRuntimeOpeningProactive = workspaceRuntimeOpeningLine
    ? {
        response: workspaceRuntimeOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Testing environment is healthy.',
      }
    : null;
  const pluginSdkProactive = pluginSdk
    ? {
        response: pluginSdk,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Install the Contractor Pack.',
      }
    : null;
  const pluginSdkOpeningProactive = pluginSdkOpeningLine
    ? {
        response: pluginSdkOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show plugin compatibility.',
      }
    : null;
  const workflowEngineProactive = workflowEngine
    ? {
        response: workflowEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Build a workflow for new client onboarding.',
      }
    : null;
  const workflowEngineOpeningProactive = workflowEngineOpeningLine
    ? {
        response: workflowEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Recommend workflow improvements.',
      }
    : null;
  const stateEngineProactive = stateEngine
    ? {
        response: stateEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show everything waiting for approval.',
      }
    : null;
  const stateEngineOpeningProactive = stateEngineOpeningLine
    ? {
        response: stateEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Which workflows failed today?',
      }
    : null;
  const assetRegistryProactive = assetRegistry
    ? {
        response: assetRegistry,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Show unused assets.',
      }
    : null;
  const assetRegistryOpeningProactive = assetRegistryOpeningLine
    ? {
        response: assetRegistryOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Find our latest logo.',
      }
    : null;
  const experienceEngineProactive = experienceEngine
    ? {
        response: experienceEngine,
        concierge: 'Chief Concierge',
        suggestedCommand: "I've entered Focus Mode.",
      }
    : null;
  const experienceEngineOpeningProactive = experienceEngineOpeningLine
    ? {
        response: experienceEngineOpeningLine,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Presentation Mode is ready.',
      }
    : null;
  const anniversaryProactive = anniversaryContext
    ? {
        response: anniversaryContext,
        concierge: 'Chief Concierge',
        suggestedCommand: 'Open Executive Timeline — replay organizational history.',
      }
    : null;
  const blueprintPct = ensureOrganizationDiscoveryBlueprint(workspaceId).overallProgressPct;
  const instituteProactive = institute
    ? { response: institute, concierge: 'Chief Concierge', suggestedCommand: 'Open Studio Institute dashboard.' }
    : null;
  const commerceProactive = commerce
    ? { response: commerce, concierge: 'Chief Concierge', suggestedCommand: 'Open Knowledge Commerce product builder.' }
    : null;
  const trustProactive = trust
    ? { response: trust, concierge: 'Chief Concierge', suggestedCommand: 'Review professional scope before proceeding.' }
    : null;
  const genomeProactive = genome
    ? { response: genome, concierge: 'Chief Concierge', suggestedCommand: 'Open Organization Genome — consult identity before generating.' }
    : null;
  const memoryProactive = memory
    ? { response: memory, concierge: 'Chief Concierge', suggestedCommand: 'Recall organizational memory before repeating initiatives.' }
    : null;
  const healthProactive = health
    ? { response: health, concierge: 'Chief Concierge', suggestedCommand: 'Review Company Health Index weak areas.' }
    : null;
  const successionProactive = succession
    ? { response: succession, concierge: 'Chief Concierge', suggestedCommand: 'Open Succession Mode — preserve irreplaceable knowledge.' }
    : null;
  const councilProactive = council
    ? { response: council, concierge: 'Chief Concierge', suggestedCommand: 'Convene Executive Council for collaborative strategic guidance.' }
    : null;
  const pulseProactive = pulse
    ? { response: pulse, concierge: 'Chief Concierge', suggestedCommand: 'Open Organization Pulse — how is our organization really doing?' }
    : null;
  const wisdomProactive = wisdom
    ? { response: wisdom, concierge: 'Chief Concierge', suggestedCommand: 'Open Wisdom Capture — preserve this lesson forever.' }
    : null;
  const shadowProactive = shadow
    ? { response: shadow, concierge: 'Chief Concierge', suggestedCommand: 'Open Shadow Mode — review concierge learning phases.' }
    : null;
  const digitalTwinProactive = digitalTwin
    ? { response: digitalTwin, concierge: 'Chief Concierge', suggestedCommand: 'Open Digital Twin — explore what-if scenarios in sandbox.' }
    : null;
  const simulationLabProactive = simulationLab
    ? { response: simulationLab, concierge: 'Chief Concierge', suggestedCommand: 'Open Business Simulation Lab — test strategies before implementing.' }
    : null;
  const knowledgeConfidenceProactive = knowledgeConfidence
    ? { response: knowledgeConfidence, concierge: 'Chief Concierge', suggestedCommand: 'Open Knowledge Confidence — review Profession Brain quality.' }
    : null;
  const legacyVaultProactive = legacyVault
    ? { response: legacyVault, concierge: 'Chief Concierge', suggestedCommand: 'Open Legacy Vault — preserve this moment in organizational history.' }
    : null;
  const proactiveSource =
    ambientOpening
      ? ambientOpening
      : pathname.includes('/executive-timeline') && executiveTimelineHistoryProactive
      ? executiveTimelineHistoryProactive
      : pathname.includes('/world-knowledge-engine') && worldKnowledgeProactive
      ? worldKnowledgeProactive
      : pathname.includes('/founder-operating-system') && founderOperatingProactive
      ? founderOperatingProactive
      : pathname.includes('/innovation-lab') && innovationLabProactive
      ? innovationLabProactive
      : pathname.includes('/organization-operating-manual') && operatingManualProactive
      ? operatingManualProactive
      : pathname.includes('/legacy-network') && legacyNetworkProactive
      ? legacyNetworkProactive
      : pathname.includes('/studio-intelligence-architecture') && studioIntelligenceArchitectureProactive
      ? studioIntelligenceArchitectureProactive
      : pathname.includes('/model-orchestrator') && modelOrchestratorProactive
      ? modelOrchestratorProactive
      : pathname.includes('/studio-foundation-models') && studioFoundationModelsProactive
      ? studioFoundationModelsProactive
      : pathname.includes('/experience-engine') && experienceEngineProactive
      ? experienceEngineProactive
      : pathname.includes('/asset-registry') && assetRegistryProactive
      ? assetRegistryProactive
      : pathname.includes('/state-engine') && stateEngineProactive
      ? stateEngineProactive
      : pathname.includes('/workflow-engine') && workflowEngineProactive
      ? workflowEngineProactive
      : pathname.includes('/plugin-sdk') && pluginSdkProactive
      ? pluginSdkProactive
      : pathname.includes('/workspace-runtime') && workspaceRuntimeProactive
      ? workspaceRuntimeProactive
      : pathname.includes('/permission-engine') && permissionEngineProactive
      ? permissionEngineProactive
      : pathname.includes('/policy-engine') && policyEngineProactive
      ? policyEngineProactive
      : pathname.includes('/prompt-registry') && promptRegistryProactive
      ? promptRegistryProactive
      : pathname.includes('/automation-registry') && automationRegistryProactive
      ? automationRegistryProactive
      : pathname.includes('/event-bus') && eventBusProactive
      ? eventBusProactive
      : pathname.includes('/interaction-engine') && interactionEngineProactive
      ? interactionEngineProactive
      : pathname.includes('/design-token-engine') && designTokenEngineProactive
      ? designTokenEngineProactive
      : pathname.includes('/component-registry') && componentRegistryProactive
      ? componentRegistryProactive
      : pathname.includes('/system-registry') && systemRegistryProactive
      ? systemRegistryProactive
      : pathname.includes('/documentation-governance') && documentationGovernanceProactive
      ? documentationGovernanceProactive
      : pathname.includes('/knowledge-registry') || (pathname.includes('/documentation-registry') && documentationRegistryProactive)
      ? documentationRegistryProactive
      : pathname.includes('/knowledge-hub') && documentationGovernanceProactive
      ? documentationGovernanceProactive
      : pathname.includes('/organizational-consciousness') && organizationalConsciousnessProactive
      ? organizationalConsciousnessProactive
      : pathname.includes('/mission-control') || /\/studio\/?$/.test(pathname)
      ? founderOpeningProactive ?? experienceEngineOpeningProactive ?? assetRegistryOpeningProactive ?? stateEngineOpeningProactive ?? workflowEngineOpeningProactive ?? pluginSdkOpeningProactive ?? workspaceRuntimeOpeningProactive ?? permissionEngineOpeningProactive ?? policyEngineOpeningProactive ?? promptRegistryOpeningProactive ?? automationRegistryOpeningProactive ?? eventBusOpeningProactive ?? interactionEngineOpeningProactive ?? designTokenEngineOpeningProactive ?? componentRegistryOpeningProactive ?? systemRegistryOpeningProactive ?? documentationGovernanceOpeningProactive ?? documentationRegistryOpeningProactive ?? documentationSyncOpeningProactive ?? modelOrchestratorOpeningProactive ?? studioFoundationModelsOpeningProactive ?? studioIntelligenceArchitectureOpeningProactive ?? legacyNetworkOpeningProactive ?? operatingManualOpeningProactive ?? innovationOpeningProactive ?? morningWorldProactive ?? anniversaryProactive ?? documentationRegistryProactive ?? documentationSyncProactive ?? modelOrchestratorProactive ?? studioFoundationModelsProactive ?? studioIntelligenceArchitectureProactive ?? legacyNetworkProactive ?? operatingManualProactive ?? innovationLabProactive ?? founderOperatingProactive ?? worldKnowledgeProactive ?? organizationalConsciousnessProactive ?? executiveTimelineHistoryProactive
      : pathname.includes('/autonomous-preparation') && autonomousPreparationProactive
      ? autonomousPreparationProactive
      : pathname.includes('/predictive-organization') && predictiveOrganizationProactive
      ? predictiveOrganizationProactive
      : pathname.includes('/relationship-memory') && relationshipMemoryProactive
      ? relationshipMemoryProactive
      : pathname.includes('/cross-organization-intelligence') && crossOrgProactive
      ? crossOrgProactive
      : pathname.includes('/presence-engine') && presenceProactive
      ? presenceProactive
      : pathname.includes('/founder-cognitive-load') && cognitiveLoadProactive
      ? cognitiveLoadProactive
      : pathname.includes('/anticipation-engine') && anticipationProactive
      ? anticipationProactive
      : pathname.includes('/ambient-awareness') && ambientModuleProactive
      ? ambientModuleProactive
      : pathname.includes('/legacy-vault') && legacyVaultProactive
      ? legacyVaultProactive
      : pathname.includes('/knowledge-confidence') && knowledgeConfidenceProactive
      ? knowledgeConfidenceProactive
      : pathname.includes('/business-simulation-lab') && simulationLabProactive
      ? simulationLabProactive
      : pathname.includes('/organization-digital-twin') && digitalTwinProactive
      ? digitalTwinProactive
      : pathname.includes('/shadow-mode') && shadowProactive
      ? shadowProactive
      : pathname.includes('/wisdom-capture') && wisdomProactive
      ? wisdomProactive
      : pathname.includes('/organization-pulse') && pulseProactive
      ? pulseProactive
      : pathname.includes('/executive-council') && councilProactive
      ? councilProactive
      : pathname.includes('/succession-mode') && successionProactive
      ? successionProactive
      : pathname.includes('/company-health-index') && healthProactive
      ? healthProactive
      : pathname.includes('/memory-engine') && memoryProactive
      ? memoryProactive
      : pathname.includes('/organization-genome') && genomeProactive
      ? genomeProactive
      : pathname.includes('/professional-trust-framework') && trustProactive
      ? trustProactive
      : pathname.includes('/knowledge-commerce') && commerceProactive
        ? commerceProactive
        : pathname.includes('/studio-institute') && instituteProactive
          ? instituteProactive
          : brain && blueprintPct >= 40
            ? brain
            : discovery && blueprintPct < 50
              ? discovery
              : growth;
  const proactiveSuggestion = proactiveSource
    ? {
        id: `proactive-${Date.now()}`,
        insight: proactiveSource.response,
        concierge: proactiveSource.concierge,
        suggestedCommand: proactiveSource.suggestedCommand,
      }
    : store.proactiveSuggestion;
  writeCommandDockStore({ ...store, contextProfile: profile, proactiveSuggestion });
  return profile;
}

export function setDockInput(text: string): void {
  const store = readCommandDockStore();
  writeCommandDockStore({ ...store, dockInput: text });
}

export function setDockFocused(focused: boolean): void {
  const store = readCommandDockStore();
  const expansionSize: DockExpansionSize = focused && store.expansionSize === 'compact' ? 'medium' : store.expansionSize;
  writeCommandDockStore({ ...store, isFocused: focused, expansionSize });
}

export function setDockExpansion(size: DockExpansionSize): void {
  const store = readCommandDockStore();
  writeCommandDockStore({ ...store, expansionSize: size });
}

export function toggleDockHistory(): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    showHistoryPanel: !store.showHistoryPanel,
    expansionSize: !store.showHistoryPanel ? 'large' : 'compact',
  });
}

function buildRoutingSummary(route: FounderCommandRoute): string {
  const concierges = [route.primaryConcierge, ...route.supportingConcierges];
  const depCount = route.impactPreview?.affectedDependencies.length ?? 0;
  const lines = concierges.map((c) => `${c}\nRouting request…`);
  if (depCount > 0) {
    lines.push(`${depCount} organizational dependenc${depCount === 1 ? 'y' : 'ies'} identified.`);
  }
  return lines.join('\n');
}

function expansionForRoute(route: FounderCommandRoute): DockExpansionSize {
  if (route.impactPreview && (route.impactPreview.affectedEventTitles.length > 0 || route.requiresFounderApproval)) {
    return 'large';
  }
  if (route.clarificationQuestion) return 'medium';
  return 'medium';
}

export function submitDockCommand(rawText: string, pathname: string): FounderCommandRoute | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const ambientAwarenessAdvice = resolveAmbientAwarenessAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (ambientAwarenessAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: ambientAwarenessAdvice.briefing ? 'large' : 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${ambientAwarenessAdvice.concierge}\n${ambientAwarenessAdvice.response}`,
    });
    return null;
  }

  const anticipationAdvice = resolveAnticipationEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (anticipationAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${anticipationAdvice.concierge}\n${anticipationAdvice.response}`,
    });
    return null;
  }

  const cognitiveLoadAdvice = resolveFounderCognitiveLoadAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (cognitiveLoadAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${cognitiveLoadAdvice.concierge}\n${cognitiveLoadAdvice.response}`,
    });
    return null;
  }

  const presenceAdvice = resolvePresenceEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (presenceAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${presenceAdvice.concierge}\n${presenceAdvice.response}`,
    });
    return null;
  }

  const crossOrgAdvice = resolveCrossOrgIntelligenceAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (crossOrgAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${crossOrgAdvice.concierge}\n${crossOrgAdvice.response}`,
    });
    return null;
  }

  const relationshipMemoryAdvice = resolveRelationshipMemoryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (relationshipMemoryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${relationshipMemoryAdvice.concierge}\n${relationshipMemoryAdvice.response}`,
    });
    return null;
  }

  const predictiveOrganizationAdvice = resolvePredictiveOrganizationAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (predictiveOrganizationAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${predictiveOrganizationAdvice.concierge}\n${predictiveOrganizationAdvice.response}`,
    });
    return null;
  }

  const autonomousPreparationAdvice = resolveAutonomousPreparationAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (autonomousPreparationAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${autonomousPreparationAdvice.concierge}\n${autonomousPreparationAdvice.response}`,
    });
    return null;
  }

  const executiveTimelineHistoryAdvice = resolveExecutiveTimelineHistoryAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (executiveTimelineHistoryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${executiveTimelineHistoryAdvice.concierge}\n${executiveTimelineHistoryAdvice.response}`,
    });
    return null;
  }

  const worldKnowledgeEngineAdvice = resolveWorldKnowledgeEngineAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (worldKnowledgeEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${worldKnowledgeEngineAdvice.concierge}\n${worldKnowledgeEngineAdvice.response}`,
    });
    return null;
  }

  const founderOperatingSystemAdvice = resolveFounderOperatingSystemAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (founderOperatingSystemAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${founderOperatingSystemAdvice.concierge}\n${founderOperatingSystemAdvice.response}`,
    });
    return null;
  }

  const innovationLabAdvice = resolveInnovationLabAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (innovationLabAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${innovationLabAdvice.concierge}\n${innovationLabAdvice.response}`,
    });
    return null;
  }

  const operatingManualAdvice = resolveOrganizationOperatingManualAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (operatingManualAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${operatingManualAdvice.concierge}\n${operatingManualAdvice.response}`,
    });
    return null;
  }

  const legacyNetworkAdvice = resolveLegacyNetworkAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (legacyNetworkAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${legacyNetworkAdvice.concierge}\n${legacyNetworkAdvice.response}`,
    });
    return null;
  }

  const studioIntelligenceArchitectureAdvice = resolveStudioIntelligenceArchitectureAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (studioIntelligenceArchitectureAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${studioIntelligenceArchitectureAdvice.concierge}\n${studioIntelligenceArchitectureAdvice.response}`,
    });
    return null;
  }

  const modelOrchestratorAdvice = resolveModelOrchestratorAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (modelOrchestratorAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${modelOrchestratorAdvice.concierge}\n${modelOrchestratorAdvice.response}`,
    });
    return null;
  }

  const studioFoundationModelsAdvice = resolveStudioFoundationModelsAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (studioFoundationModelsAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${studioFoundationModelsAdvice.concierge}\n${studioFoundationModelsAdvice.response}`,
    });
    return null;
  }

  const experienceEngineAdvice = resolveExperienceEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (experienceEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${experienceEngineAdvice.concierge}\n${experienceEngineAdvice.response}`,
    });
    return null;
  }

  const assetRegistryAdvice = resolveAssetRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (assetRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${assetRegistryAdvice.concierge}\n${assetRegistryAdvice.response}`,
    });
    return null;
  }

  const stateEngineAdvice = resolveStateEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (stateEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${stateEngineAdvice.concierge}\n${stateEngineAdvice.response}`,
    });
    return null;
  }

  const workflowEngineAdvice = resolveWorkflowEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (workflowEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${workflowEngineAdvice.concierge}\n${workflowEngineAdvice.response}`,
    });
    return null;
  }

  const pluginSdkAdvice = resolvePluginSdkAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (pluginSdkAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${pluginSdkAdvice.concierge}\n${pluginSdkAdvice.response}`,
    });
    return null;
  }

  const workspaceRuntimeAdvice = resolveWorkspaceRuntimeAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (workspaceRuntimeAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${workspaceRuntimeAdvice.concierge}\n${workspaceRuntimeAdvice.response}`,
    });
    return null;
  }

  const permissionEngineAdvice = resolvePermissionEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (permissionEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${permissionEngineAdvice.concierge}\n${permissionEngineAdvice.response}`,
    });
    return null;
  }

  const policyEngineAdvice = resolvePolicyEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (policyEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${policyEngineAdvice.concierge}\n${policyEngineAdvice.response}`,
    });
    return null;
  }

  const promptRegistryAdvice = resolvePromptRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (promptRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${promptRegistryAdvice.concierge}\n${promptRegistryAdvice.response}`,
    });
    return null;
  }

  const automationRegistryAdvice = resolveAutomationRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (automationRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${automationRegistryAdvice.concierge}\n${automationRegistryAdvice.response}`,
    });
    return null;
  }

  const eventBusAdvice = resolveEventBusAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (eventBusAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${eventBusAdvice.concierge}\n${eventBusAdvice.response}`,
    });
    return null;
  }

  const interactionEngineAdvice = resolveInteractionEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (interactionEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${interactionEngineAdvice.concierge}\n${interactionEngineAdvice.response}`,
    });
    return null;
  }

  const designTokenEngineAdvice = resolveDesignTokenEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (designTokenEngineAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${designTokenEngineAdvice.concierge}\n${designTokenEngineAdvice.response}`,
    });
    return null;
  }

  const componentRegistryAdvice = resolveComponentRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (componentRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${componentRegistryAdvice.concierge}\n${componentRegistryAdvice.response}`,
    });
    return null;
  }

  const systemRegistryAdvice = resolveSystemRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (systemRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${systemRegistryAdvice.concierge}\n${systemRegistryAdvice.response}`,
    });
    return null;
  }

  const documentationGovernanceAdvice = resolveDocumentationGovernanceAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (documentationGovernanceAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${documentationGovernanceAdvice.concierge}\n${documentationGovernanceAdvice.response}`,
    });
    return null;
  }

  const documentationRegistryAdvice = resolveDocumentationRegistryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (documentationRegistryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${documentationRegistryAdvice.concierge}\n${documentationRegistryAdvice.response}`,
    });
    return null;
  }

  const documentationSyncAdvice = resolveDocumentationSyncAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (documentationSyncAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${documentationSyncAdvice.concierge}\n${documentationSyncAdvice.response}`,
    });
    return null;
  }

  const organizationalConsciousnessAdvice = resolveOrganizationalConsciousnessAdvice(
    trimmed,
    getRuntimeActiveWorkspaceId()
  );
  if (organizationalConsciousnessAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${organizationalConsciousnessAdvice.concierge}\n${organizationalConsciousnessAdvice.response}`,
    });
    return null;
  }

  const legacyVaultAdvice = resolveLegacyVaultAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (legacyVaultAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: legacyVaultAdvice.preserveSuggestion ? 'medium' : 'compact',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${legacyVaultAdvice.concierge}\n${legacyVaultAdvice.response}`,
    });
    return null;
  }

  const knowledgeConfidenceAdvice = resolveKnowledgeConfidenceAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (knowledgeConfidenceAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${knowledgeConfidenceAdvice.concierge}\n${knowledgeConfidenceAdvice.response}`,
    });
    return null;
  }

  const simulationLabAdvice = resolveSimulationLabAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (simulationLabAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: simulationLabAdvice.report ? 'large' : 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${simulationLabAdvice.concierge}\n${simulationLabAdvice.response}`,
    });
    return null;
  }

  const digitalTwinAdvice = resolveDigitalTwinAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (digitalTwinAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: digitalTwinAdvice.briefing ? 'large' : 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${digitalTwinAdvice.concierge}\n${digitalTwinAdvice.response}`,
    });
    return null;
  }

  const shadowAdvice = resolveShadowModeAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (shadowAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${shadowAdvice.concierge}\n${shadowAdvice.response}`,
    });
    return null;
  }

  const wisdomAdvice = resolveWisdomCaptureAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (wisdomAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: wisdomAdvice.detection ? 'medium' : 'compact',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${wisdomAdvice.concierge}\n${wisdomAdvice.response}`,
    });
    return null;
  }

  const councilAdvice = resolveExecutiveCouncilAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (councilAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: councilAdvice.briefing ? 'large' : 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${councilAdvice.concierge}\n${councilAdvice.response}`,
    });
    return null;
  }

  const pulseAdvice = resolveOrganizationPulseAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (pulseAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${pulseAdvice.concierge}\n${pulseAdvice.response}`,
    });
    return null;
  }

  const successionAdvice = resolveSuccessionModeAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (successionAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${successionAdvice.concierge}\n${successionAdvice.response}`,
    });
    return null;
  }

  const healthAdvice = resolveCompanyHealthIndexAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (healthAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${healthAdvice.concierge}\n${healthAdvice.response}`,
    });
    return null;
  }

  const memoryAdvice = resolveMemoryEngineAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (memoryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${memoryAdvice.concierge}\n${memoryAdvice.response}`,
    });
    return null;
  }

  const genomeAdvice = resolveOrganizationGenomeAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (genomeAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${genomeAdvice.concierge}\n${genomeAdvice.response}`,
    });
    return null;
  }

  const professionAdvice = resolveProfessionBrainAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (professionAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${professionAdvice.concierge}\n${professionAdvice.response}`,
    });
    return null;
  }

  const marketplaceAdvice = resolveExpertMarketplaceAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (marketplaceAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${marketplaceAdvice.concierge}\n${marketplaceAdvice.response}`,
    });
    return null;
  }

  const instituteAdvice = resolveStudioInstituteAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (instituteAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${instituteAdvice.concierge}\n${instituteAdvice.response}`,
    });
    return null;
  }

  const commerceAdvice = resolveKnowledgeCommerceAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (commerceAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${commerceAdvice.concierge}\n${commerceAdvice.response}`,
    });
    return null;
  }

  const trustAdvice = resolveProfessionalTrustAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (trustAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${trustAdvice.concierge}\n${trustAdvice.response}`,
    });
    return null;
  }

  const discoveryAdvice = resolveLivingDiscoveryAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (discoveryAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${discoveryAdvice.concierge}\n${discoveryAdvice.response}`,
    });
    return null;
  }

  const growthAdvice = resolveExecutiveGrowthAdvice(trimmed, getRuntimeActiveWorkspaceId());
  if (growthAdvice) {
    writeCommandDockStore({
      ...readCommandDockStore(),
      processingActive: false,
      activeMicrointeraction: null,
      microinteractionQueue: [],
      dockInput: '',
      expansionSize: 'medium',
      pendingRoute: null,
      askWhyAnswer: null,
      lastRoutingSummary: `${growthAdvice.concierge}\n${growthAdvice.response}`,
    });
    return null;
  }

  const correction = recordRoutingCorrection(trimmed);
  if (correction) {
    const routingStore = readConciergeRoutingStore();
    const route = routingStore.pendingRoute;
    if (route) {
      const store = readCommandDockStore();
      writeCommandDockStore({
        ...store,
        pendingRoute: route,
        lastRoutingSummary: route.routingNote,
        dockInput: '',
        expansionSize: 'medium',
      });
      return route;
    }
  }

  const store = readCommandDockStore();
  const timeline = readExecutiveTimelineStore();
  const contextProfile = store.contextProfile ?? resolveDockContext(pathname);

  writeCommandDockStore({
    ...store,
    processingActive: true,
    activeMicrointeraction: MICRO_MOMENT_LABELS[0],
    microinteractionQueue: [...MICRO_MOMENT_LABELS],
    expansionSize: 'medium',
    askWhyAnswer: null,
    dockInput: trimmed,
  });

  const route = submitUniversalCommand(trimmed, {
    workspaceId: getRuntimeActiveWorkspaceId(),
    activeOrganizationId: contextProfile.portfolioMode ? 'portfolio' : timeline.activeOrganizationId,
    events: timeline.events,
    selectedEventId: timeline.selectedEventId,
  });

  const historyEntry: CommandHistoryEntry = {
    id: route.id,
    rawText: trimmed,
    routedAt: route.createdAt,
    primaryConcierge: route.primaryConcierge,
    intent: route.intent,
    status: 'pending',
  };

  writeCommandDockStore({
    ...readCommandDockStore(),
    processingActive: false,
    activeMicrointeraction: null,
    microinteractionQueue: [],
    pendingRoute: route,
    lastRoutingSummary: buildRoutingSummary(route),
    dockInput: '',
    expansionSize: expansionForRoute(route),
    recentCommands: [historyEntry, ...store.recentCommands].slice(0, 12),
  });

  return route;
}

export function advanceMicrointeraction(): void {
  const store = readCommandDockStore();
  if (!store.processingActive || store.microinteractionQueue.length === 0) return;
  const [, ...rest] = store.microinteractionQueue;
  writeCommandDockStore({
    ...store,
    activeMicrointeraction: rest[0] ?? null,
    microinteractionQueue: rest,
  });
}

export function approveDockCommand(): void {
  const store = readCommandDockStore();
  approvePendingRoute();
  writeCommandDockStore({
    ...store,
    pendingRoute: null,
    expansionSize: 'compact',
    isFocused: false,
    lastRoutingSummary: 'Change applied with founder approval.',
    recentCommands: store.recentCommands.map((c) =>
      c.id === store.pendingRoute?.id ? { ...c, status: 'applied' as const } : c
    ),
  });
}

export function cancelDockCommand(): void {
  const store = readCommandDockStore();
  cancelPendingRoute();
  writeCommandDockStore({
    ...store,
    pendingRoute: null,
    expansionSize: 'compact',
    isFocused: false,
    askWhyAnswer: null,
    lastRoutingSummary: 'Request cancelled.',
    recentCommands: store.recentCommands.map((c) =>
      c.id === store.pendingRoute?.id ? { ...c, status: 'cancelled' as const } : c
    ),
  });
}

export function modifyDockCommand(note: string): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    dockInput: note || store.dockInput,
    isFocused: true,
    expansionSize: 'medium',
    lastRoutingSummary: 'Adjust your command and send again.',
  });
}

export function askWhyDockCommand(): void {
  const store = readCommandDockStore();
  const answer = store.pendingRoute
    ? buildAskWhyExplanation(store.pendingRoute)
    : explainPendingRoute();
  writeCommandDockStore({ ...store, askWhyAnswer: answer, expansionSize: 'large' });
}

export function dismissDockToCompact(): void {
  const store = readCommandDockStore();
  writeCommandDockStore({
    ...store,
    expansionSize: 'compact',
    isFocused: false,
    showHistoryPanel: false,
    pendingRoute: null,
    askWhyAnswer: null,
  });
}

export function runFavoriteCommand(rawText: string, pathname: string): FounderCommandRoute | null {
  return submitDockCommand(rawText, pathname);
}
