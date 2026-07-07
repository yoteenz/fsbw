import type { CONVERSATION_SURFACES } from './constants';

export type ConversationSurface = (typeof CONVERSATION_SURFACES)[number];

export type ConversationTurnRole = 'user' | 'assistant' | 'system';

export type ConversationTurn = {
  id: string;
  role: ConversationTurnRole;
  text: string;
  surface: ConversationSurface;
  createdAt: string;
  routedIntent?: string;
};

export type ConversationSession = {
  id: string;
  organizationId: string;
  surface: ConversationSurface;
  startedAt: string;
  updatedAt: string;
  turns: ConversationTurn[];
  active: boolean;
};

export type ConversationEngineStore = {
  version: string;
  sessions: ConversationSession[];
};
