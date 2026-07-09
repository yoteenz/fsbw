import type {
  OrbAttentionMode,
  OrbConversationKind,
  OrbMemoryTier,
  OrbPresenceState,
  OrbQuickActionId,
  OrbRole,
} from './constants';

export type OrbContextLayer = {
  layerId: string;
  label: string;
  value: string;
  sourceSystem: string;
  priority: number;
};

export type OrbContextBundle = {
  bundleId: string;
  founderDisplayName: string;
  companyDisplayName: string;
  companyIdentityId: string;
  actorIdentityId: string;
  pathname: string;
  roomLabel: string;
  departmentLabel: string | null;
  missionLabel: string | null;
  projectLabel: string | null;
  creativeLabel: string | null;
  atmosphereLabel: string;
  layers: OrbContextLayer[];
  resolvedAt: string;
};

export type OrbMemoryEntry = {
  memoryId: string;
  tier: OrbMemoryTier;
  title: string;
  detail: string;
  sourceSystems: string[];
  companyIdentityId: string;
  canonical: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type OrbRecommendationCard = {
  recommendationId: string;
  title: string;
  reason: string;
  evidence: string[];
  confidence: number;
  alternatives: string[];
  tradeoffs: string[];
  risks: string[];
  sourceSystems: string[];
  requiresApproval: boolean;
  targetPath: string;
  targetRoomId?: string;
  posture: OrbRole;
  createdAt: string;
};

export type OrbExecutiveBriefing = {
  briefingId: string;
  greeting: string;
  paragraph: string;
  whatChanged: string;
  requiresAttention: string;
  canWait: string;
  recommendedAction: string;
  sourceSystems: string[];
  generatedAt: string;
};

export type OrbMissionAdvice = {
  adviceId: string;
  missionTitle: string;
  status: 'active' | 'blocked' | 'awaiting-approval' | 'recently-completed';
  departmentLabel: string;
  advisorNote: string;
  blockerNote?: string;
  targetPath: string;
  posture: OrbRole;
};

export type OrbKnowledgeResult = {
  resultId: string;
  query: string;
  answer: string;
  sources: { label: string; system: string; confidence: number }[];
  stale: boolean;
  generatedAt: string;
};

export type OrbCreativeInsight = {
  insightId: string;
  title: string;
  detail: string;
  alignment: 'aligned' | 'needs-review' | 'off-direction';
  downstreamImpact?: string;
  sourceSystems: string[];
};

export type OrbDecisionDraft = {
  decisionId: string;
  frame: string;
  options: { label: string; tradeoff: string; reversibility: string }[];
  evidence: string[];
  confidence: number;
  recommendedOption: string;
  stakeholders: string[];
  sourceSystems: string[];
};

export type OrbConversationEntry = {
  entryId: string;
  kind: OrbConversationKind;
  role: OrbRole;
  speaker: 'orb' | 'founder';
  content: string;
  sourceSystems?: string[];
  timestamp: string;
};

export type OrbQuickAction = {
  actionId: OrbQuickActionId;
  label: string;
  detail: string;
  targetPath: string;
};

export type OrbAttentionState = {
  mode: OrbAttentionMode;
  reason: string;
  shouldInterrupt: boolean;
  shouldRemainSilent: boolean;
  presenceState: OrbPresenceState;
};

export type OrbSessionState = {
  sessionId: string;
  actorIdentityId: string;
  companyIdentityId: string;
  presenceState: OrbPresenceState;
  activeRole: OrbRole;
  pathname: string;
  startedAt: string;
  lastInteractionAt: string;
};

export type OrbStore = {
  version: string;
  session: OrbSessionState | null;
  memoryEntries: OrbMemoryEntry[];
  conversationTimeline: OrbConversationEntry[];
  recommendationOverrides: string[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type OrbReadyView = {
  context: OrbContextBundle;
  attention: OrbAttentionState;
  briefing: OrbExecutiveBriefing;
  recommendations: OrbRecommendationCard[];
  missionAdvice: OrbMissionAdvice[];
  knowledgeResults: OrbKnowledgeResult[];
  creativeInsights: OrbCreativeInsight[];
  decisionDrafts: OrbDecisionDraft[];
  memoryTimeline: OrbMemoryEntry[];
  conversationTimeline: OrbConversationEntry[];
  quickActions: OrbQuickAction[];
  session: OrbSessionState;
};

export type OrbPlatformStats = {
  memoryCount: number;
  conversationCount: number;
  recommendationCount: number;
  missionAdviceCount: number;
  presenceState: OrbPresenceState;
  activeRole: OrbRole;
};

export type OrbRuntimeInput = {
  pathname: string;
  companyDisplayName?: string;
  founderDisplayName?: string;
  companyIdentityId?: string;
  actorIdentityId?: string;
  departmentLabel?: string | null;
  roomLabel?: string;
};
