/**
 * Studio World Constitution™ — foundational governance types.
 */

import type { StudioWorldFlagshipId } from '../studio-world/types';

export type ConstitutionLawId =
  | 'everything-belongs-somewhere'
  | 'one-mission-per-destination'
  | 'everything-is-architecture'
  | 'everything-is-connected'
  | 'reuse-before-generation'
  | 'plan-before-build'
  | 'founder-creative-director'
  | 'studio-world-learns';

export type ConstitutionLaw = {
  id: ConstitutionLawId;
  number: number;
  title: string;
  summary: string;
  enforcement: string;
  examples: string[];
};

export type ConstitutionPhysicalType =
  | 'building'
  | 'wing'
  | 'district'
  | 'floor'
  | 'room'
  | 'laboratory'
  | 'gallery'
  | 'vault'
  | 'theater'
  | 'observatory'
  | 'pavilion'
  | 'atrium'
  | 'workshop'
  | 'studio'
  | 'museum'
  | 'command-center'
  | 'headquarters';

export type ConstitutionFeatureProposal = {
  name: string;
  description: string;
  proposedFlagshipId?: StudioWorldFlagshipId;
  proposedPhysicalType?: ConstitutionPhysicalType;
  /** When true, reviewer assumes page-first intent */
  pageFirstHint?: boolean;
};

export type ConstitutionReviewQuestionId =
  | 'building-owner'
  | 'duplicate-system'
  | 'destination-responsibility'
  | 'architectural-fit'
  | 'scene-stack-required'
  | 'philosophy-strength'
  | 'room-instead'
  | 'expedition-instead'
  | 'blueprint-instead';

export type ConstitutionReviewQuestion = {
  id: ConstitutionReviewQuestionId;
  question: string;
  answer: string;
  passed: boolean;
};

export type ConstitutionScores = {
  architecture: number;
  missionAlignment: number;
  worldContinuity: number;
  reuse: number;
  creativeAlignment: number;
  scalability: number;
  maintainability: number;
  immersion: number;
  experience: number;
  overallCompliance: number;
};

export type ConstitutionAlternativeForm = 'room' | 'expedition' | 'blueprint' | 'reject';

export type ConstitutionReviewResult = {
  id: string;
  reviewedAt: string;
  proposalName: string;
  proposalDescription: string;
  owningFlagship: StudioWorldFlagshipId | null;
  suggestedPhysicalType: ConstitutionPhysicalType;
  scores: ConstitutionScores;
  questions: ConstitutionReviewQuestion[];
  violatedLaws: ConstitutionLawId[];
  recommendations: string[];
  approved: boolean;
  alternativeForms: ConstitutionAlternativeForm[];
};

export type ConstitutionReviewRecord = ConstitutionReviewResult & {
  storedAt: string;
};

export type ConstitutionMemoryStore = {
  version: 1;
  reviews: ConstitutionReviewRecord[];
  learningEvents: number;
};

export const CONSTITUTION_COMPLIANCE_THRESHOLD = 70;

export const STUDIO_WORLD_CONSTITUTION_EVENT = 'studio-world-constitution-reviewed';
