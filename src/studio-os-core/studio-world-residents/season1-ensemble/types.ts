import type { ResidentId } from '../types';

export type CanonAuthorityLevel =
  | 'FOUNDER_APPROVED'
  | 'PROVISIONAL_CANON'
  | 'OPEN'
  | 'CONCEPT_LOCKED_VISUAL_PENDING'
  | 'SUPERSEDED';

export type BirthRecord = {
  date: string;
  timeLocal: string;
  place: string;
  authority: CanonAuthorityLevel;
};

export type AstrologyRecord = {
  sun: string;
  moon: string;
  rising: string;
  authority: CanonAuthorityLevel;
};

export type PhysicalCanon = {
  height: string;
  weightApprox: string;
  build: string;
  ethnicityPresentation: string;
  signatures?: string[];
  authority: CanonAuthorityLevel;
};

export type SexualityCanon = {
  label: string;
  authority: CanonAuthorityLevel;
  notes?: string;
};

export type RelationshipStatusCanon = {
  summary: string;
  authority: CanonAuthorityLevel;
};

export type GlamourArcCanon = {
  principle: string;
  notMakeoverEndpoint: true;
  contexts: string[];
  authority: CanonAuthorityLevel;
};

export type Season1ResidentCanonRecord = {
  id: ResidentId;
  canonicalName: string;
  aliases: string[];
  preferredShortForm?: string;
  role: string;
  age: number;
  birthRecord: BirthRecord;
  astrology: AstrologyRecord;
  physicalCanon: PhysicalCanon;
  heritage?: string;
  culturalCanon?: string[];
  sexuality: SexualityCanon;
  relationshipStatus: RelationshipStatusCanon;
  naturalWardrobeAuthority: string;
  naturalWardrobeNotes: string[];
  visualEssence: string[];
  personality: string[];
  humor: string;
  icks: string[];
  contrasts: string[];
  quirks?: string[];
  cameraBehavior: string;
  signedPortraitBehavior: string;
  clientValue: string;
  coreSentence: string;
  socialLanguage?: string;
  protectedOpenFields: string[];
  antiFlattening: string[];
  glamourArc?: GlamourArcCanon;
  canonVersion: 'season1-v1';
  status: 'FOUNDER_APPROVED';
};

export type WorkUniformSystemCanon = {
  status: 'CONCEPT_LOCKED_VISUAL_PENDING';
  authority: CanonAuthorityLevel;
  summary: string;
  sharedDna: string[];
  placeholderInsignia: string;
  customizationExamples: Record<ResidentId, string>;
  nonNegotiable: string;
};

export const SEASON1_ENSEMBLE_CANON_VERSION = 'season1-v1' as const;
