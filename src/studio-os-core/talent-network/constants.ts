/** Talent Network v1.0 — constants. */

import type { CastingRole, TalentType, WardrobeCategory } from './types';

export const TALENT_NETWORK_STORAGE_KEY = 'studioOsTalentNetwork_v1';
export const TALENT_NETWORK_VERSION = '1.0.0';

export const TALENT_TYPES: TalentType[] = [
  'ai-presenter',
  'human-creator',
  'actor',
  'voice-actor',
  'model',
  'photographer',
  'videographer',
  'editor',
  'designer',
  'developer',
  'writer',
  'producer',
  'creative-director',
  'executive',
  'contractor',
  'assistant',
  'custom',
];

export const TALENT_TYPE_LABELS: Record<TalentType, string> = {
  'ai-presenter': 'AI PRESENTER',
  'human-creator': 'HUMAN CREATOR',
  actor: 'ACTOR',
  'voice-actor': 'VOICE ACTOR',
  model: 'MODEL',
  photographer: 'PHOTOGRAPHER',
  videographer: 'VIDEOGRAPHER',
  editor: 'EDITOR',
  designer: 'DESIGNER',
  developer: 'DEVELOPER',
  writer: 'WRITER',
  producer: 'PRODUCER',
  'creative-director': 'CREATIVE DIRECTOR',
  executive: 'EXECUTIVE',
  contractor: 'CONTRACTOR',
  assistant: 'ASSISTANT',
  custom: 'CUSTOM',
};

export const CASTING_ROLES: CastingRole[] = [
  'host',
  'co-host',
  'expert',
  'narrator',
  'guest',
  'background',
  'voiceover',
  'interviewer',
  'moderator',
];

export const CASTING_ROLE_LABELS: Record<CastingRole, string> = {
  host: 'HOST',
  'co-host': 'CO-HOST',
  expert: 'EXPERT',
  narrator: 'NARRATOR',
  guest: 'GUEST',
  background: 'BACKGROUND',
  voiceover: 'VOICEOVER',
  interviewer: 'INTERVIEWER',
  moderator: 'MODERATOR',
};

export const WARDROBE_CATEGORIES: WardrobeCategory[] = [
  'business',
  'casual',
  'luxury',
  'medical',
  'fitness',
  'technology',
  'formal',
  'streetwear',
  'seasonal',
  'holiday',
  'custom',
];

export const WARDROBE_CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  business: 'BUSINESS',
  casual: 'CASUAL',
  luxury: 'LUXURY',
  medical: 'MEDICAL',
  fitness: 'FITNESS',
  technology: 'TECHNOLOGY',
  formal: 'FORMAL',
  streetwear: 'STREETWEAR',
  seasonal: 'SEASONAL',
  holiday: 'HOLIDAY',
  custom: 'CUSTOM',
};
