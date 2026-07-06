import fs from 'fs';
import path from 'path';

const HOOKS_DIR = 'src/hooks';

/** syncFn -> [getFn, modulePath, typeName, eventConst] */
const SYNC_MAP = {
  syncComponentRegistryFromSources: [
    'getOrganizationComponentRegistryProfile',
    'component-registry',
    'OrganizationComponentRegistryProfile',
    'STUDIO_OS_COMPONENT_REGISTRY_UPDATED',
  ],
  syncAutomationRegistryFromSources: [
    'getOrganizationAutomationRegistryProfile',
    'automation-registry',
    'OrganizationAutomationRegistryProfile',
    'STUDIO_OS_AUTOMATION_REGISTRY_UPDATED',
  ],
  syncAssetRegistryFromSources: [
    'getOrganizationAssetRegistryProfile',
    'asset-registry',
    'OrganizationAssetRegistryProfile',
    'STUDIO_OS_ASSET_REGISTRY_UPDATED',
  ],
  syncSimulationLabFromSources: [
    'getOrganizationSimulationLabProfile',
    'business-simulation-lab',
    'OrganizationSimulationLabProfile',
    'STUDIO_OS_SIMULATION_LAB_UPDATED',
  ],
  syncAutonomousPreparationFromSources: [
    'getOrganizationAutonomousPreparationProfile',
    'autonomous-preparation',
    'OrganizationAutonomousPreparationProfile',
    'STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED',
  ],
  syncAnticipationEngineFromSources: [
    'getOrganizationAnticipationProfile',
    'anticipation-engine',
    'OrganizationAnticipationProfile',
    'STUDIO_OS_ANTICIPATION_ENGINE_UPDATED',
  ],
  syncAmbientAwarenessFromSources: [
    'getOrganizationAmbientAwarenessProfile',
    'ambient-awareness',
    'OrganizationAmbientAwarenessProfile',
    'STUDIO_OS_AMBIENT_AWARENESS_UPDATED',
  ],
  syncStateEngineFromSources: [
    'getOrganizationStateEngineProfile',
    'state-engine',
    'OrganizationStateEngineProfile',
    'STUDIO_OS_STATE_ENGINE_UPDATED',
  ],
  syncStudioFoundationModelsFromSources: [
    'getOrganizationStudioFoundationModelsProfile',
    'studio-foundation-models',
    'OrganizationStudioFoundationModelsProfile',
    'STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED',
  ],
  syncSystemRegistryFromSources: [
    'getOrganizationSystemRegistryProfile',
    'system-registry',
    'OrganizationSystemRegistryProfile',
    'STUDIO_OS_SYSTEM_REGISTRY_UPDATED',
  ],
  syncPromptRegistryFromSources: [
    'getOrganizationPromptRegistryProfile',
    'prompt-registry',
    'OrganizationPromptRegistryProfile',
    'STUDIO_OS_PROMPT_REGISTRY_UPDATED',
  ],
  syncWorkspaceRuntimeFromSources: [
    'getOrganizationWorkspaceRuntimeProfile',
    'workspace-runtime',
    'OrganizationWorkspaceRuntimeProfile',
    'STUDIO_OS_WORKSPACE_RUNTIME_UPDATED',
  ],
  syncWorkflowEngineFromSources: [
    'getOrganizationWorkflowEngineProfile',
    'workflow-engine',
    'OrganizationWorkflowEngineProfile',
    'STUDIO_OS_WORKFLOW_ENGINE_UPDATED',
  ],
  syncStudioIntelligenceArchitectureFromSources: [
    'getOrganizationStudioIntelligenceArchitectureProfile',
    'studio-intelligence-architecture',
    'OrganizationStudioIntelligenceArchitectureProfile',
    'STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED',
  ],
  syncWorldKnowledgeEngineFromSources: [
    'getOrganizationWorldKnowledgeProfile',
    'world-knowledge-engine',
    'OrganizationWorldKnowledgeProfile',
    'STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED',
  ],
  syncWisdomCaptureFromSources: [
    'getOrganizationWisdomProfile',
    'wisdom-capture',
    'OrganizationWisdomProfile',
    'STUDIO_OS_WISDOM_CAPTURE_UPDATED',
  ],
  syncSuccessionModeFromSources: [
    'getOrganizationSuccessionProfile',
    'succession-mode',
    'OrganizationSuccessionProfile',
    'STUDIO_OS_SUCCESSION_MODE_UPDATED',
  ],
  syncShadowModeFromSources: [
    'getOrganizationShadowModeProfile',
    'shadow-mode',
    'OrganizationShadowModeProfile',
    'STUDIO_OS_SHADOW_MODE_UPDATED',
  ],
  syncRelationshipMemoryFromSources: [
    'getOrganizationRelationshipMemoryProfile',
    'relationship-memory',
    'OrganizationRelationshipMemoryProfile',
    'STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED',
  ],
  syncPresenceEngineFromSources: [
    'getOrganizationPresenceProfile',
    'presence-engine',
    'OrganizationPresenceProfile',
    'STUDIO_OS_PRESENCE_ENGINE_UPDATED',
  ],
  syncInteractionEngineFromSources: [
    'getOrganizationInteractionEngineProfile',
    'interaction-engine',
    'OrganizationInteractionEngineProfile',
    'STUDIO_OS_INTERACTION_ENGINE_UPDATED',
  ],
  syncEventBusFromSources: [
    'getOrganizationEventBusProfile',
    'event-bus',
    'OrganizationEventBusProfile',
    'STUDIO_OS_EVENT_BUS_UPDATED',
  ],
  syncDesignTokenEngineFromSources: [
    'getOrganizationDesignTokenEngineProfile',
    'design-token-engine',
    'OrganizationDesignTokenEngineProfile',
    'STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED',
  ],
  syncDocumentationRegistryFromSources: [
    'getOrganizationDocumentationRegistryProfile',
    'documentation-registry',
    'OrganizationDocumentationRegistryProfile',
    'STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED',
  ],
  syncLegacyNetworkFromSources: [
    'getOrganizationLegacyNetworkProfile',
    'legacy-network',
    'OrganizationLegacyNetworkProfile',
    'STUDIO_OS_LEGACY_NETWORK_UPDATED',
  ],
  syncModelOrchestratorFromSources: [
    'getOrganizationModelOrchestratorProfile',
    'model-orchestrator',
    'OrganizationModelOrchestratorProfile',
    'STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED',
  ],
  syncOrganizationOperatingManualFromSources: [
    'getOrganizationOperatingManualProfile',
    'organization-operating-manual',
    'OrganizationOperatingManualProfile',
    'STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED',
  ],
  syncPluginSdkFromSources: [
    'getOrganizationPluginSdkProfile',
    'plugin-sdk',
    'OrganizationPluginSdkProfile',
    'STUDIO_OS_PLUGIN_SDK_UPDATED',
  ],
  syncPermissionEngineFromSources: [
    'getOrganizationPermissionEngineProfile',
    'permission-engine',
    'OrganizationPermissionEngineProfile',
    'STUDIO_OS_PERMISSION_ENGINE_UPDATED',
  ],
  syncPolicyEngineFromSources: [
    'getOrganizationPolicyEngineProfile',
    'policy-engine',
    'OrganizationPolicyEngineProfile',
    'STUDIO_OS_POLICY_ENGINE_UPDATED',
  ],
  syncExperienceEngineFromSources: [
    'getOrganizationExperienceEngineProfile',
    'experience-engine',
    'OrganizationExperienceEngineProfile',
    'STUDIO_OS_EXPERIENCE_ENGINE_UPDATED',
  ],
  syncDocumentationGovernanceFromSources: [
    'getOrganizationDocumentationGovernanceProfile',
    'documentation-governance',
    'OrganizationDocumentationGovernanceProfile',
    'STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED',
  ],
  syncPredictiveOrganizationFromSources: [
    'getOrganizationPredictiveProfile',
    'predictive-organization',
    'OrganizationPredictiveProfile',
    'STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED',
  ],
  syncOrganizationalConsciousnessFromSources: [
    'getOrganizationConsciousnessProfile',
    'organizational-consciousness',
    'OrganizationConsciousnessProfile',
    'STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED',
  ],
  syncOrganizationPulseFromSources: [
    'getOrganizationPulseProfile',
    'organization-pulse',
    'OrganizationPulseProfile',
    'STUDIO_OS_ORGANIZATION_PULSE_UPDATED',
  ],
  syncOrganizationGenomeFromSources: [
    'getOrganizationGenomeProfile',
    'organization-genome',
    'OrganizationGenomeProfile',
    'STUDIO_OS_ORGANIZATION_GENOME_UPDATED',
  ],
  syncDigitalTwinFromSources: [
    'getOrganizationDigitalTwinProfile',
    'organization-digital-twin',
    'OrganizationDigitalTwinProfile',
    'STUDIO_OS_DIGITAL_TWIN_UPDATED',
  ],
  syncMemoryEngineFromSources: [
    'getOrganizationMemoryProfile',
    'memory-engine',
    'OrganizationMemoryProfile',
    'STUDIO_OS_MEMORY_ENGINE_UPDATED',
  ],
  syncLegacyVaultFromSources: [
    'getOrganizationLegacyVaultProfile',
    'legacy-vault',
    'OrganizationLegacyVaultProfile',
    'STUDIO_OS_LEGACY_VAULT_UPDATED',
  ],
  syncInnovationLabFromSources: [
    'getOrganizationInnovationLabProfile',
    'innovation-lab',
    'OrganizationInnovationLabProfile',
    'STUDIO_OS_INNOVATION_LAB_UPDATED',
  ],
  syncFounderOperatingSystemFromSources: [
    'getOrganizationFounderOperatingSystemProfile',
    'founder-operating-system',
    'OrganizationFounderOperatingSystemProfile',
    'STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED',
  ],
  syncFounderCognitiveLoadFromSources: [
    'getOrganizationFounderCognitiveLoadProfile',
    'founder-cognitive-load',
    'OrganizationFounderCognitiveLoadProfile',
    'STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED',
  ],
  syncCrossOrgIntelligenceFromSources: [
    'getOrganizationCrossOrgIntelligenceProfile',
    'cross-organization-intelligence',
    'OrganizationCrossOrgIntelligenceProfile',
    'STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED',
  ],
};

const SKIP_FILES = new Set([
  'useStudioProfileState.ts',
  'useExecutiveTimelineHistoryState.ts',
  'useExecutiveCouncilState.ts',
  'useBusinessSimulationLabState.ts',
  'useWisdomCaptureState.ts',
  'useLegacyVaultState.ts',
  'useOrganizationDigitalTwinState.ts',
]);

function patchSimpleHook(filePath, fnName, syncFn, getFn, mod, type, event) {
  const content = `import { useStudioProfileState } from './useStudioProfileState';
import {
  ${event},
  ${getFn},
  ${syncFn},
  type ${type},
} from '../studio-os-core/${mod}';

export function ${fnName}() {
  return useStudioProfileState<${type}>({
    getProfile: ${getFn},
    syncProfile: ${syncFn},
    updatedEvent: ${event},
  });
}
`;
  fs.writeFileSync(filePath, content);
}

function patchComplexHookRefresh(filePath, getFn, syncFn) {
  let content = fs.readFileSync(filePath, 'utf8');
  const patterns = [
    `const next = ${syncFn}(workspaceId);`,
    `const next = ${syncFn}(workspaceId) ?? ensureOrganizationSuccessionProfile(workspaceId);`,
    `const next = ${syncFn}(workspaceId) ?? ensureOrganizationGenomeProfile(workspaceId);`,
    `const next = ${syncFn}(workspaceId) ?? ensureOrganizationMemoryProfile(workspaceId);`,
  ];
  const replacement = `const next = ${getFn}(workspaceId) ?? ${syncFn}(workspaceId);`;
  let patched = false;
  for (const pattern of patterns) {
    if (content.includes(pattern)) {
      content = content.replace(pattern, replacement);
      patched = true;
      break;
    }
  }
  if (!patched) return false;

  if (!content.includes(getFn)) {
    content = content.replace(
      new RegExp(`(\\{[^}]*?)${syncFn},`),
      `$1${getFn},\n  ${syncFn},`
    );
  }
  fs.writeFileSync(filePath, content);
  return true;
}

for (const file of fs.readdirSync(HOOKS_DIR)) {
  if (!file.endsWith('.ts') || SKIP_FILES.has(file)) continue;
  const filePath = path.join(HOOKS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('useStudioProfileState')) continue;

  const syncMatch = content.match(/const next = (sync\w+FromSources)\(workspaceId\)/);
  if (!syncMatch) continue;

  const syncFn = syncMatch[1];
  const mapping = SYNC_MAP[syncFn];
  if (!mapping) {
    console.log('no mapping for', file, syncFn);
    continue;
  }

  const [getFn, mod, type, event] = mapping;
  const fnName = file.replace('.ts', '');

  if (
    content.includes('runSimulation') ||
    content.includes('resolveDecision') ||
    content.includes('updateFilter') ||
    content.includes('startReplay')
  ) {
    if (patchComplexHookRefresh(filePath, getFn, syncFn)) {
      console.log('patched complex', file);
    }
    continue;
  }

  patchSimpleHook(filePath, fnName, syncFn, getFn, mod, type, event);
  console.log('migrated', file);
}

// Executive timeline history
const historyPath = path.join(HOOKS_DIR, 'useExecutiveTimelineHistoryState.ts');
if (fs.existsSync(historyPath)) {
  let h = fs.readFileSync(historyPath, 'utf8');
  if (!h.includes('getOrganizationExecutiveHistoryProfile')) {
    h = h.replace(
      'syncExecutiveTimelineHistoryFromSources,',
      'getOrganizationExecutiveHistoryProfile,\n  syncExecutiveTimelineHistoryFromSources,'
    );
    h = h.replace(
      'const next = syncExecutiveTimelineHistoryFromSources(workspaceId);',
      'const next = getOrganizationExecutiveHistoryProfile(workspaceId) ?? syncExecutiveTimelineHistoryFromSources(workspaceId);'
    );
    fs.writeFileSync(historyPath, h);
    console.log('patched', 'useExecutiveTimelineHistoryState.ts');
  }
}

// Executive council
const councilPath = path.join(HOOKS_DIR, 'useExecutiveCouncilState.ts');
if (fs.existsSync(councilPath)) {
  let c = fs.readFileSync(councilPath, 'utf8');
  if (!c.includes('getOrganizationExecutiveCouncilProfile')) {
    c = c.replace(
      'syncExecutiveCouncilFromSources,',
      'getOrganizationExecutiveCouncilProfile,\n  syncExecutiveCouncilFromSources,'
    );
    c = c.replace(
      'const next = syncExecutiveCouncilFromSources(workspaceId);',
      'const next = getOrganizationExecutiveCouncilProfile(workspaceId) ?? syncExecutiveCouncilFromSources(workspaceId);'
    );
    fs.writeFileSync(councilPath, c);
    console.log('patched', 'useExecutiveCouncilState.ts');
  }
}

// Business simulation lab
const labPath = path.join(HOOKS_DIR, 'useBusinessSimulationLabState.ts');
if (fs.existsSync(labPath)) {
  let l = fs.readFileSync(labPath, 'utf8');
  if (!l.includes('getOrganizationSimulationLabProfile')) {
    l = l.replace(
      'syncSimulationLabFromSources,',
      'getOrganizationSimulationLabProfile,\n  syncSimulationLabFromSources,'
    );
    l = l.replace(
      'const next = syncSimulationLabFromSources(workspaceId);',
      'const next = getOrganizationSimulationLabProfile(workspaceId) ?? syncSimulationLabFromSources(workspaceId);'
    );
    fs.writeFileSync(labPath, l);
    console.log('patched', 'useBusinessSimulationLabState.ts');
  }
}
