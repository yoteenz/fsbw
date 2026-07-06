export {
  PROFESSION_BRAIN_STORAGE_KEY,
  PROFESSION_BRAIN_VERSION,
  PROFESSION_BRAIN_PHILOSOPHY,
  PROFESSION_BRAIN_TAGLINE,
  LIVING_BRAIN_PROMPT,
  KNOWLEDGE_DOMAINS,
  STUDIO_OS_PROFESSION_BRAIN_UPDATED,
} from './constants';

export type {
  BrainKnowledgeKind,
  ProfessionBrainDefinition,
  BrainKnowledgeEntry,
  DecisionJudgmentPattern,
  MemoryGraphNodeType,
  MemoryGraphNode,
  MemoryGraphEdge,
  HumanKnowledgeArtifact,
  AcademyFoundationModule,
  PublicKnowledgeSurface,
  KnowledgeOwnershipRecord,
  LivingBrainSignal,
  OrganizationProfessionBrain,
  OrganizationProfessionBrainProfile,
  ProfessionBrainStore,
  ProfessionBrainDockAdvice,
  ConciergeBrainBinding,
} from './types';

export {
  PROFESSION_BRAIN_CATALOG,
  getBrainDefinition,
  listBrainCatalog,
  resolveBrainsForIndustry,
  resolveBrainForServiceName,
  resolveBrainForKeyword,
} from './brain-catalog';

export {
  detectLivingBrainPhrase,
  buildLivingBrainResponse,
  LIVING_BRAIN_PHRASES,
} from './living-knowledge';

export {
  buildJudgmentPatternsFromBrain,
  formatJudgmentForConcierge,
} from './decision-intelligence';

export {
  buildMemoryGraph,
  countGraphConnections,
  listBrainsInGraph,
} from './memory-graph';

export { seedBrainFromBlueprint, buildInitialProfile } from './knowledge-seeds';

export {
  generateHumanKnowledgeArtifacts,
  generateAllHumanKnowledge,
} from './human-knowledge';

export {
  generateAcademyModules,
  generateAllAcademyModules,
} from './academy-bridge';

export {
  buildDefaultPublicSurfaces,
  generateAllPublicSurfaces,
} from './customer-experience';

export {
  exportProfessionBrainSnapshot,
  recordBrainBackup,
  recordBrainExport,
  OWNERSHIP_CAPABILITIES,
} from './knowledge-ownership';

export {
  LEGACY_MODE_PHILOSOPHY,
  buildLegacySummary,
  listEvolutionSignals,
} from './legacy-mode';

export {
  listConciergeBrainBindings,
  resolveConciergeForBrain,
  resolveBrainForConcierge,
} from './concierge-bridge';

export {
  resolveProfessionBrainAdvice,
  buildProactiveBrainSuggestion,
  listProfessionBrainDockSuggestions,
} from './dock-advisor';

export {
  readProfessionBrainStore,
  writeProfessionBrainStore,
  getOrganizationProfessionBrainProfile,
  ensureOrganizationProfessionBrainProfile,
  upsertOrganizationProfessionBrainProfile,
  syncProfessionBrainFromSources,
  addBrainKnowledgeEntry,
  recordLivingBrainSignal,
  resolveLivingBrainSignal,
  recordBrainExportAction,
  refreshProfessionBrainProfile,
} from './store';

export {
  bootstrapProfessionBrainPlatform,
  bootstrapOrganizationProfessionBrain,
} from './bootstrap';
