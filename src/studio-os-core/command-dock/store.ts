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
      : pathname.includes('/organizational-consciousness') && organizationalConsciousnessProactive
      ? organizationalConsciousnessProactive
      : pathname.includes('/mission-control') || /\/studio\/?$/.test(pathname)
      ? founderOpeningProactive ?? innovationOpeningProactive ?? morningWorldProactive ?? anniversaryProactive ?? innovationLabProactive ?? founderOperatingProactive ?? worldKnowledgeProactive ?? organizationalConsciousnessProactive ?? executiveTimelineHistoryProactive
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
