import type { AICharacterDefinition } from '../types';
import { createInitialNPCState, npcFromDefinition, type PersistentNPCState } from './schema';

const npcStore = new Map<string, PersistentNPCState>();

function storeKey(professionId: string, learnerId: string, characterId: string): string {
  return `${professionId}:${learnerId}:${characterId}`;
}

export function getNPCState(
  professionId: string,
  learnerId: string,
  characterId: string
): PersistentNPCState | undefined {
  return npcStore.get(storeKey(professionId, learnerId, characterId));
}

export function ensureNPCStates(
  professionId: string,
  learnerId: string,
  characters: AICharacterDefinition[]
): PersistentNPCState[] {
  return characters.map((character) => {
    const key = storeKey(professionId, learnerId, character.id);
    const existing = npcStore.get(key);
    if (existing) return existing;

    const definition = npcFromDefinition(character, professionId);
    const initial = createInitialNPCState(definition, professionId);
    npcStore.set(key, initial);
    return initial;
  });
}

export function recordNPCInteraction(input: {
  professionId: string;
  learnerId: string;
  characterId: string;
  learnerText: string;
  characterText: string;
  relationshipDelta?: number;
  memorySummary?: string;
}): PersistentNPCState {
  const key = storeKey(input.professionId, input.learnerId, input.characterId);
  const state = npcStore.get(key);
  if (!state) {
    throw new Error(`NPC state not initialized: ${input.characterId}`);
  }

  const now = new Date().toISOString();
  state.conversationHistory.push(
    { id: `${now}-learner`, speaker: 'learner', text: input.learnerText, recordedAt: now },
    { id: `${now}-character`, speaker: 'character', text: input.characterText, recordedAt: now }
  );
  state.lastInteractionAt = now;

  if (input.relationshipDelta) {
    state.relationshipScore = Math.min(100, Math.max(0, state.relationshipScore + input.relationshipDelta));
  }

  if (input.memorySummary) {
    state.memory.push({
      id: `${now}-memory`,
      layer: 'session',
      summary: input.memorySummary,
      recordedAt: now,
      relatedLearnerAction: input.learnerText,
    });
  }

  npcStore.set(key, state);
  return state;
}

export function resetNPCStore(): void {
  npcStore.clear();
}
