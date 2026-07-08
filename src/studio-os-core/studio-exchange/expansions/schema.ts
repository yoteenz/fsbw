import type { CareerWorldId } from '../../career-worlds/types';

export type ExpansionUnlockKind =
  | 'district'
  | 'npc'
  | 'simulation'
  | 'certification'
  | 'business'
  | 'hero-object'
  | 'ai-mentor'
  | 'competition';

export type CareerExpansionUnlock = {
  kind: ExpansionUnlockKind;
  targetId: string;
  label: string;
};

export type CareerExpansionDefinition = {
  id: string;
  careerWorldId: CareerWorldId;
  slug: string;
  displayName: string;
  specializationLabel: string;
  summary: string;
  unlocks: CareerExpansionUnlock[];
  optional: boolean;
  version: string;
};
