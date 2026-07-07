import { readScopedStore, writeScopedStore } from '../workspace/scoped-store';
import { CONVERSATION_ENGINE_STORAGE_KEY, CONVERSATION_ENGINE_VERSION } from './constants';
import type {
  ConversationEngineStore,
  ConversationSession,
  ConversationSurface,
  ConversationTurn,
} from './types';

function emptyStore(): ConversationEngineStore {
  return { version: CONVERSATION_ENGINE_VERSION, sessions: [] };
}

export function readConversationEngineStore(organizationId: string): ConversationEngineStore {
  return readScopedStore(CONVERSATION_ENGINE_STORAGE_KEY, emptyStore, organizationId);
}

function writeStore(organizationId: string, store: ConversationEngineStore): void {
  writeScopedStore(
    CONVERSATION_ENGINE_STORAGE_KEY,
    { ...store, version: CONVERSATION_ENGINE_VERSION },
    organizationId
  );
}

export function startConversationSession(
  organizationId: string,
  surface: ConversationSurface
): ConversationSession {
  const store = readConversationEngineStore(organizationId);
  const now = new Date().toISOString();
  const session: ConversationSession = {
    id: `ces-${Date.now()}`,
    organizationId,
    surface,
    startedAt: now,
    updatedAt: now,
    turns: [],
    active: true,
  };
  const sessions = store.sessions.map((s) => ({ ...s, active: false }));
  writeStore(organizationId, { ...store, sessions: [session, ...sessions].slice(0, 24) });
  return session;
}

export function getActiveConversationSession(organizationId: string): ConversationSession | null {
  return readConversationEngineStore(organizationId).sessions.find((s) => s.active) ?? null;
}

export function appendConversationTurn(
  organizationId: string,
  turn: Omit<ConversationTurn, 'id' | 'createdAt'>
): ConversationSession | null {
  const store = readConversationEngineStore(organizationId);
  const active = store.sessions.find((s) => s.active);
  if (!active) return null;
  const entry: ConversationTurn = {
    ...turn,
    id: `cet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const updated: ConversationSession = {
    ...active,
    updatedAt: entry.createdAt,
    turns: [...active.turns, entry].slice(-40),
  };
  const sessions = store.sessions.map((s) => (s.id === active.id ? updated : s));
  writeStore(organizationId, { ...store, sessions });
  return updated;
}

export function endConversationSession(organizationId: string): void {
  const store = readConversationEngineStore(organizationId);
  writeStore(organizationId, {
    ...store,
    sessions: store.sessions.map((s) => ({ ...s, active: false })),
  });
}
