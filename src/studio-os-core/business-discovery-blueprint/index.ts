export {
  BUSINESS_DISCOVERY_BLUEPRINT_STORAGE_KEY,
  BUSINESS_DISCOVERY_BLUEPRINT_VERSION,
  DISCOVERY_BLUEPRINT_PHILOSOPHY,
  DISCOVERY_BLUEPRINT_TAGLINE,
  LIVING_DISCOVERY_PROMPT,
  BLUEPRINT_OUTPUT_CATEGORIES,
} from './constants';

export type {
  DiscoveryChapterId,
  DiscoveryPromptKind,
  DiscoveryPrompt,
  DiscoveryResponse,
  ServiceDiscoverySession,
  ResourceUpload,
  ChapterProgress,
  BlueprintGeneratedOutput,
  LivingDiscoverySignal,
  OrganizationDiscoveryBlueprint,
  BusinessDiscoveryBlueprintStore,
  ConversationalFollowUp,
  LivingDiscoveryAdvice,
  DiscoverySessionSummary,
} from './types';

export {
  DISCOVERY_CHAPTERS,
  DISCOVERY_PROMPTS,
  getChapterDefinition,
  getPromptsForChapter,
  type DiscoveryChapterDefinition,
} from './chapters';

export {
  computeChapterProgress,
  computeAllChapterProgress,
  computeOverallProgress,
  recommendNextChapter,
  getActiveServiceSession,
  listPendingServiceNames,
  detectMilestoneToCelebrate,
  resolveBlueprintStatus,
  parseServiceList,
} from './progress';

export {
  listApplicablePrompts,
  getNextUnansweredPrompt,
  listPendingFollowUps,
  buildConversationalIntro,
  adaptQuestionForIndustry,
  detectLivingDiscoveryPhrase,
  LIVING_DISCOVERY_PHRASES,
} from './conversational-engine';

export { regenerateBlueprintOutputs } from './outputs-generator';

export {
  readBusinessDiscoveryBlueprintStore,
  writeBusinessDiscoveryBlueprintStore,
  getOrganizationDiscoveryBlueprint,
  buildInitialBlueprint,
  ensureOrganizationDiscoveryBlueprint,
  upsertOrganizationDiscoveryBlueprint,
  saveDiscoveryResponse,
  setCurrentChapter,
  startServiceDiscoverySession,
  saveServiceDiscoveryResponse,
  completeServiceDiscoverySession,
  addResourceUpload,
  recordLivingDiscoverySignal,
  resolveLivingDiscoverySignal,
  syncBlueprintFromArchitecture,
  processLivingDiscoveryInput,
} from './store';

export {
  bootstrapBusinessDiscoveryBlueprintPlatform,
  bootstrapOrganizationDiscoveryBlueprint,
} from './bootstrap';

export {
  resolveLivingDiscoveryAdvice,
  buildProactiveDiscoverySuggestion,
  listDiscoveryDockSuggestions,
} from './dock-advisor';
