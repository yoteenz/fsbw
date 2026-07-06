/**
 * Milestone 90 — Business Discovery Blueprint™ V1.0
 * Permanent onboarding architecture — organizational archaeology, not setup wizard.
 */

export type DiscoveryChapterId =
  | 'organization-identity'
  | 'founder-brain'
  | 'services'
  | 'decision-intelligence'
  | 'knowledge-wisdom'
  | 'resources'
  | 'people'
  | 'customers'
  | 'growth';

export type DiscoveryPromptKind = 'narrative' | 'list' | 'service-dive' | 'upload';

export type DiscoveryPrompt = {
  id: string;
  chapterId: DiscoveryChapterId;
  question: string;
  placeholder?: string;
  kind: DiscoveryPromptKind;
  /** Skip for industries that do not need this prompt. */
  skipForIndustries?: string[];
  /** Only show for these industries (exclusive). */
  onlyForIndustries?: string[];
  followUpWhenShort?: string;
};

export type DiscoveryResponse = {
  promptId: string;
  chapterId: DiscoveryChapterId;
  answer: string;
  updatedAt: string;
  /** For services chapter — one service name per session. */
  serviceName?: string;
};

export type ServiceDiscoverySession = {
  id: string;
  serviceName: string;
  status: 'in-progress' | 'complete';
  responses: DiscoveryResponse[];
  startedAt: string;
  completedAt?: string;
};

export type ResourceUpload = {
  id: string;
  fileName: string;
  category: string;
  note?: string;
  uploadedAt: string;
};

export type ChapterProgress = {
  chapterId: DiscoveryChapterId;
  answeredCount: number;
  totalCount: number;
  percentComplete: number;
  status: 'not-started' | 'in-progress' | 'complete';
  lastActivityAt?: string;
};

export type BlueprintGeneratedOutput = {
  id: string;
  category: string;
  title: string;
  summary: string;
  generatedAt: string;
  sourceChapterIds: DiscoveryChapterId[];
};

export type LivingDiscoverySignal = {
  id: string;
  phrase: string;
  detectedAt: string;
  resolved: boolean;
};

export type OrganizationDiscoveryBlueprint = {
  organizationId: string;
  companyName: string;
  industryId: string;
  startedAt: string;
  updatedAt: string;
  lastSessionAt: string;
  /** Overall completion 0–100 */
  overallProgressPct: number;
  currentChapterId: DiscoveryChapterId;
  recommendedNextChapterId: DiscoveryChapterId;
  responses: DiscoveryResponse[];
  serviceSessions: ServiceDiscoverySession[];
  resourceUploads: ResourceUpload[];
  generatedOutputs: BlueprintGeneratedOutput[];
  livingSignals: LivingDiscoverySignal[];
  milestonesCelebrated: string[];
  /** Blueprint never finishes — always living. */
  status: 'discovering' | 'foundational' | 'living';
  /** Set when all chapters complete — triggers inauguration eligibility. */
  blueprintFullyComplete?: boolean;
  /** When inauguration ceremony was first generated. */
  inaugurationEligibleAt?: string;
};

export type BusinessDiscoveryBlueprintStore = {
  version: string;
  blueprints: OrganizationDiscoveryBlueprint[];
};

export type ConversationalFollowUp = {
  promptId: string;
  question: string;
  reason: string;
};

export type LivingDiscoveryAdvice = {
  response: string;
  concierge: string;
  suggestedCommand?: string;
  recommendedChapterId?: DiscoveryChapterId;
};

export type DiscoverySessionSummary = {
  blueprint: OrganizationDiscoveryBlueprint;
  chapterProgress: ChapterProgress[];
  nextBestChapter: DiscoveryChapterId;
  pendingFollowUps: ConversationalFollowUp[];
  activeServiceSession: ServiceDiscoverySession | null;
};
