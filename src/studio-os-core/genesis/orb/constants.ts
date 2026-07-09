/** Orb™ — Studio OS Launch Stack Stack 2 Executive Intelligence Layer */

export const ORB_SUBSYSTEM_NAME = 'Orb™';
export const ORB_SUBSYSTEM_VERSION = '1.0.0';

export const ORB_PRESENCE_STATES = [
  'idle',
  'listening',
  'thinking',
  'recommending',
  'briefing',
  'focus-guard',
  'celebration',
] as const;

export type OrbPresenceState = (typeof ORB_PRESENCE_STATES)[number];

export const ORB_ROLES = [
  'executive-advisor',
  'chief-strategist',
  'creative-director',
  'operations-advisor',
  'research-partner',
  'knowledge-guide',
  'project-manager',
  'mission-coordinator',
  'learning-mentor',
  'business-architect',
  'systems-thinker',
  'memory-keeper',
] as const;

export type OrbRole = (typeof ORB_ROLES)[number];

export const ORB_MEMORY_TIERS = [
  'short-term',
  'working',
  'long-term',
  'canonical',
  'company',
  'founder',
  'creative',
  'learning',
  'archived',
] as const;

export type OrbMemoryTier = (typeof ORB_MEMORY_TIERS)[number];

export const ORB_CONVERSATION_KINDS = [
  'greeting',
  'briefing',
  'recommendation',
  'mission',
  'knowledge',
  'creative',
  'decision',
  'coaching',
  'memory',
  'system',
] as const;

export type OrbConversationKind = (typeof ORB_CONVERSATION_KINDS)[number];

export const ORB_ATTENTION_MODES = [
  'observe',
  'recommend',
  'interrupt',
  'silent',
  'summarize',
  'celebrate',
  'teach',
] as const;

export type OrbAttentionMode = (typeof ORB_ATTENTION_MODES)[number];

export const ORB_QUICK_ACTION_IDS = [
  'open-briefing',
  'review-missions',
  'founder-office',
  'command-path',
  'knowledge-wing',
  'creative-studio',
  'department-map',
] as const;

export type OrbQuickActionId = (typeof ORB_QUICK_ACTION_IDS)[number];
