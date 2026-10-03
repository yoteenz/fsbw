import type { ResidentId } from '../types';
import type { SEASON1_ENSEMBLE_CANON_VERSION } from '../season1-ensemble/types';

export type VisualAuthorityType =
  | 'SIGNED_WALL_PORTRAIT'
  | 'NATURAL_HABITAT_FULL_BODY'
  | 'ROLE_COMPETENCY_FULL_BODY'
  | 'IDENTITY_ANGLE_PACK'
  | 'IDENTITY_CLOSEUP'
  | 'IDENTITY_ANGLE_REFERENCE'
  | 'WORK_UNIFORM_REFERENCE'
  | 'ALTERNATE_MODE'
  | 'GLAMOUR_OR_ALTERNATE_MODE'
  | 'SUPERSEDED_REFERENCE';

export type VisualAuthorityStatus =
  | 'FOUNDER_APPROVED'
  | 'PROVISIONAL'
  | 'CONCEPT_LOCKED_VISUAL_PENDING'
  | 'SUPERSEDED'
  | 'REFERENCE_ONLY';

/** Continuity locks for fabrication / generation — not a claim that UE work is complete. */
export type VisualFabricationReadiness = {
  portraitLocked: boolean;
  bodyLocked: boolean;
  anglesPartial: boolean;
  anglesComplete: boolean;
  uePending: boolean;
  metahumanPending: boolean;
  ueReconstructed: boolean;
};

export type ResidentVisualAuthorityRecord = {
  id: string;
  residentId: ResidentId;
  authorityType: VisualAuthorityType;
  status: VisualAuthorityStatus;
  /** Optional repo-verified asset id — never invent paths. */
  assetId?: string;
  assetPath?: string;
  assetUrl?: string;
  canonVersion: typeof SEASON1_ENSEMBLE_CANON_VERSION;
  /** When true, this record is the default answer to “what does this resident look like?” */
  isPrimaryIdentityAuthority: boolean;
  identityLocked: boolean;
  faceAuthority?: string;
  bodyAuthority?: string;
  hairAuthority?: string;
  wardrobeAuthority?: string;
  allowedVariation?: string[];
  prohibitedDrift: string[];
  notes?: string;
  source: string;
  sourcePackage?: string;
  sourceFilename?: string;
  founderApproved: boolean;
  supersedes?: string[];
  supersededBy?: string;
  importedAt?: string;
};

export type ResidentVisualAuthorityBundle = {
  residentId: ResidentId;
  visualAuthorityRefs: string[];
  primaryNaturalHabitatAuthorityId: string;
  fabricationReadiness: VisualFabricationReadiness;
};
