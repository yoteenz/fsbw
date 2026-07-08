/**
 * Persistent AI character (NPC) schema.
 */

import type { AICharacterDefinition, AICharacterMemoryLayer, AICharacterRole } from '../types';

export type TeachingStyle = 'directive' | 'coaching' | 'socratic' | 'observational' | 'collaborative';

export type AuthorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type CharacterMemoryEntry = {
  id: string;
  layer: AICharacterMemoryLayer;
  summary: string;
  recordedAt: string;
  relatedLearnerAction?: string;
};

export type CharacterKnowledgeSlice = {
  topicId: string;
  label: string;
  confidence: number;
};

export type ConversationTurn = {
  id: string;
  speaker: 'learner' | 'character';
  text: string;
  recordedAt: string;
};

export type PersistentNPCState = {
  characterId: string;
  professionId: string;
  role: AICharacterRole;
  displayName: string;
  personality: string;
  teachingStyle: TeachingStyle;
  authorityLevel: AuthorityLevel;
  relationshipScore: number;
  memory: CharacterMemoryEntry[];
  knowledge: CharacterKnowledgeSlice[];
  conversationHistory: ConversationTurn[];
  lastInteractionAt?: string;
};

export type NPCDefinition = AICharacterDefinition & {
  teachingStyle: TeachingStyle;
  authorityLevel: AuthorityLevel;
};

export function npcFromDefinition(
  definition: AICharacterDefinition,
  _professionId: string,
  overrides?: Partial<Pick<NPCDefinition, 'teachingStyle' | 'authorityLevel'>>
): NPCDefinition {
  const authorityByRole: Record<AICharacterRole, AuthorityLevel> = {
    mentor: 4,
    manager: 5,
    coworker: 2,
    client: 1,
    inspector: 5,
    supplier: 2,
    student: 0,
    competitor: 2,
  };

  const teachingByRole: Record<AICharacterRole, TeachingStyle> = {
    mentor: 'coaching',
    manager: 'directive',
    coworker: 'collaborative',
    client: 'observational',
    inspector: 'directive',
    supplier: 'collaborative',
    student: 'socratic',
    competitor: 'observational',
  };

  return {
    ...definition,
    teachingStyle: overrides?.teachingStyle ?? teachingByRole[definition.role],
    authorityLevel: overrides?.authorityLevel ?? authorityByRole[definition.role],
  };
}

export function createInitialNPCState(
  definition: NPCDefinition,
  professionId: string
): PersistentNPCState {
  return {
    characterId: definition.id,
    professionId,
    role: definition.role,
    displayName: definition.displayName,
    personality: definition.personality,
    teachingStyle: definition.teachingStyle,
    authorityLevel: definition.authorityLevel,
    relationshipScore: definition.role === 'mentor' ? 55 : 50,
    memory: [],
    knowledge: definition.adaptsBy.map((topic, index) => ({
      topicId: `${definition.id}-topic-${index}`,
      label: topic,
      confidence: 0.6,
    })),
    conversationHistory: [],
  };
}
