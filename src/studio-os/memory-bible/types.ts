/** Memory Bible — curated institutional knowledge for studio os (Milestone 25). */

export type MemoryBibleSectionId =
  | 'founder-profile'
  | 'communication-style'
  | 'writing-rules'
  | 'cursor-prompt-standards'
  | 'design-philosophy'
  | 'engineering-philosophy'
  | 'brand-philosophy'
  | 'naming-bible'
  | 'decision-log'
  | 'ai-preferences'
  | 'workspace-memory';

export type MemoryBibleVersionStatus = 'active' | 'archived';

export type MemoryBibleVersionRecord = {
  version: string;
  label: string;
  status: MemoryBibleVersionStatus;
  effectiveDate: string;
  updatedBy: string;
  notes: string;
  changeSummary: string[];
};

export type FounderProfile = {
  preferredName: string;
  activeCompanies: string[];
  activeWorkspaces: string[];
  currentPriorityProjects: string[];
  longTermGoals: string[];
  preferredTools: string[];
  workingStyle: string[];
  decisionMakingStyle: string[];
  founderNotes: string;
};

export type MemoryRuleBlock = {
  id: string;
  title: string;
  rules: string[];
  notes?: string;
};

export type NamingRegistryEntry = {
  id: string;
  officialName: string;
  deprecatedNames: string[];
  usageNotes: string;
  relatedModules: string[];
  relatedGraphNodeIds?: string[];
};

export type MemoryDecisionStatus = 'active' | 'superseded' | 'draft';

export type MemoryDecisionRecord = {
  id: string;
  title: string;
  date: string;
  workspace: 'global' | 'frontal-slayer' | string;
  relatedModule: string;
  decision: string;
  reason: string;
  alternativesConsidered: string[];
  outcome: string;
  status: MemoryDecisionStatus;
  relatedGraphNodeIds: string[];
  relatedManualChapter?: string;
};

export type WorkspaceMemoryBlock = {
  workspaceId: string;
  workspaceLabel: string;
  summary: string;
  pillars: string[];
  relatedModules: string[];
};

export type AiPreferences = {
  defaultTone: string;
  contextPackageDefaults: string[];
  agentOnboardingChecklist: string[];
  doNotRules: string[];
};

export type MemoryBibleSnapshot = {
  version: string;
  founderProfile: FounderProfile;
  communicationStyle: MemoryRuleBlock;
  writingRules: MemoryRuleBlock;
  cursorPromptStandards: MemoryRuleBlock;
  designPhilosophy: MemoryRuleBlock;
  engineeringPhilosophy: MemoryRuleBlock;
  brandPhilosophy: MemoryRuleBlock;
  namingBible: NamingRegistryEntry[];
  decisionLog: MemoryDecisionRecord[];
  aiPreferences: AiPreferences;
  workspaceMemory: WorkspaceMemoryBlock[];
  versionHistory: MemoryBibleVersionRecord[];
};

export type ContextBuilderTarget =
  | 'cursor'
  | 'chatgpt'
  | 'openart'
  | 'fal'
  | 'future-ai-agent'
  | 'contractor'
  | 'designer'
  | 'developer'
  | 'internal-team';

export type ContextBuilderTaskType =
  | 'development-milestone'
  | 'design-milestone'
  | 'copywriting'
  | 'photography-generation'
  | 'architecture-review'
  | 'onboarding-handoff';

export type ContextBuilderScopeId =
  | 'asset-factory'
  | 'photography-bible'
  | 'creative-dna'
  | 'tutorial-os'
  | 'knowledge-graph'
  | 'memory-bible'
  | 'mission-control'
  | 'production-builder'
  | 'campaign-orchestrator'
  | 'build-a-wig'
  | 'email-design';

export type ContextBuilderInput = {
  workspaceId: string;
  target: ContextBuilderTarget;
  taskType: ContextBuilderTaskType;
  scopes: ContextBuilderScopeId[];
  includeMemoryBible: boolean;
  includeWritingRules: boolean;
  includeKnowledgeGraph: boolean;
  includeDecisions: boolean;
  includeArchitecture: boolean;
  includeWorkspaceStandards: boolean;
  includePromptStandards: boolean;
  includeBrandRules: boolean;
  includeFeatureSummary: boolean;
  includeConstraints: boolean;
};

export type ContextPackageSource = {
  id: string;
  label: string;
  kind:
    | 'memory-bible'
    | 'writing-bible'
    | 'photography-bible'
    | 'knowledge-graph'
    | 'interactive-manual'
    | 'decision-log'
    | 'workspace-config'
    | 'brand-rules'
    | 'docs';
  detail?: string;
};

export type ContextPackage = {
  id: string;
  createdAt: string;
  input: ContextBuilderInput;
  shortSummary: string;
  fullStructuredContext: string;
  copyPastePrompt: string;
  relevantFilesDocs: string[];
  relatedDecisions: string[];
  relatedWorkflows: string[];
  doNotBreakRules: string[];
  expectedOutput: string;
  compressedVersion?: string;
  sources: ContextPackageSource[];
};

export type MemoryBibleExportRecord = {
  id: string;
  exportedAt: string;
  target: ContextBuilderTarget;
  taskType: ContextBuilderTaskType;
  workspaceId: string;
  packageId: string;
  label: string;
};

export type MemoryBibleStore = {
  snapshot: MemoryBibleSnapshot;
  savedPackages: ContextPackage[];
  exportHistory: MemoryBibleExportRecord[];
  lastUpdated: string;
};
